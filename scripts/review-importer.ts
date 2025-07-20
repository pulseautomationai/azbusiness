#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { api } from '../convex/_generated/api';
import CSVProcessor from '../app/utils/csv-processor';
import type { CSVRow } from '../app/utils/csv-processor';
import { 
  FieldMappingDetector, 
  type ReviewFieldMapping,
  REVIEW_FIELD_VARIATIONS 
} from '../config/field-mappings';
import ImportConfigManager from '../config/import-config';

interface ReviewImportStats {
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  errorRows: number;
  duplicateRows: number;
  successRate: number;
  businessMatchStats: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  errorDetails: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
}

class ReviewImporter {
  private convex: ConvexHttpClient;
  private csvProcessor: CSVProcessor;
  private configManager: ImportConfigManager;
  private stats: ReviewImportStats;
  private currentBatchId?: string;

  constructor() {
    // Initialize Convex client
    const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required');
    }

    this.convex = new ConvexHttpClient(convexUrl);
    this.csvProcessor = new CSVProcessor();
    this.configManager = new ImportConfigManager();
    
    this.stats = {
      totalRows: 0,
      processedRows: 0,
      skippedRows: 0,
      errorRows: 0,
      duplicateRows: 0,
      successRate: 0,
      businessMatchStats: {},
      sourceBreakdown: {},
      errorDetails: []
    };
  }

  /**
   * Main review import function
   */
  async import(csvFilePath: string): Promise<ReviewImportStats> {
    try {
      console.log(`🚀 Starting review import from: ${csvFilePath}`);
      
      // Step 1: Read and parse CSV
      const rows = await this.csvProcessor.readCSV(csvFilePath);
      this.stats.totalRows = rows.length;
      
      if (rows.length === 0) {
        throw new Error('No data found in CSV file');
      }

      // Step 2: Auto-detect CSV type and field mapping
      const headers = Object.keys(rows[0]);
      const csvType = FieldMappingDetector.detectCSVType(headers);
      
      console.log(`📊 Detected CSV type: ${csvType}`);
      console.log(`📋 Processing ${rows.length} review rows with ${headers.length} columns`);

      // Verify this is a review CSV
      if (!FieldMappingDetector.isReviewCSV(headers)) {
        throw new Error('This appears to be a business CSV, not a review CSV. Use the business importer instead.');
      }

      // Get field mapping for reviews
      const fieldMapping = csvType.includes('_reviews') 
        ? FieldMappingDetector.getReviewMappingByType(csvType as any)
        : FieldMappingDetector.detectReviewMapping(headers);
      
      // Validate mapping
      const validation = FieldMappingDetector.validateReviewMapping(fieldMapping);
      if (!validation.valid) {
        throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
      }

      // Step 3: Create import batch record
      const fileName = csvFilePath.split('/').pop() || 'unknown.csv';
      this.currentBatchId = await this.convex.mutation(api.batchImport.createImportBatch, {
        importType: "csv_import",
        importedBy: "system" as any, // In a real scenario, this would be the authenticated user ID
        source: this.mapCsvTypeToSource(csvType),
        sourceMetadata: {
          fileName,
          csvType,
          filePath: csvFilePath,
          totalRows: rows.length,
          headers: headers
        },
        businessCount: 0, // Will be determined by unique business matches
        reviewCount: rows.length,
      });

      console.log(`📦 Created import batch: ${this.currentBatchId}`);

      // Step 4: Process rows in batches
      const batchSize = this.configManager.getBatchSize();
      const processedReviews: any[] = [];

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}`);
        
        const batchResults = await this.processBatch(batch, fieldMapping, csvType);
        processedReviews.push(...batchResults);
        
        // Update progress
        this.updateProgress(i + batch.length);
      }

      // Step 5: Import to database
      if (processedReviews.length > 0) {
        console.log(`💾 Importing ${processedReviews.length} reviews to database...`);
        await this.importToDatabase(processedReviews, csvType, fileName);
      }

      // Step 6: Generate final stats
      this.stats.successRate = (this.stats.processedRows / this.stats.totalRows) * 100;
      
      // Update batch with final results
      if (this.currentBatchId) {
        const uniqueBusinesses = new Set(processedReviews.map(r => r.businessName)).size;
        
        await this.convex.mutation(api.batchImport.updateImportBatch, {
          batchId: this.currentBatchId,
          status: "completed",
          results: {
            created: this.stats.processedRows,
            updated: 0,
            failed: this.stats.errorRows,
            duplicates: this.stats.duplicateRows,
          },
          errors: this.stats.errorDetails.slice(0, 10).map(e => e.errors.join(', ')),
        });
        
        // Update business count
        await this.convex.mutation(api.batchImport.updateImportBatch, {
          batchId: this.currentBatchId,
          businessCount: uniqueBusinesses,
        });
      }
      
      console.log(`✅ Review import completed successfully!`);
      this.printStats();
      
      return this.stats;
    } catch (error) {
      console.error('❌ Review import failed:', error);
      
      // Update batch status to failed
      if (this.currentBatchId) {
        try {
          await this.convex.mutation(api.batchImport.updateImportBatch, {
            batchId: this.currentBatchId,
            status: "failed",
            errors: [String(error)],
          });
        } catch (updateError) {
          console.error('Failed to update batch status:', updateError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Process a batch of review rows
   */
  private async processBatch(
    rows: CSVRow[],
    fieldMapping: ReviewFieldMapping,
    csvType: string
  ): Promise<any[]> {
    const processedReviews: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Step 1: Clean and validate row data
        const cleanedRow = this.csvProcessor.cleanRow(row);
        
        // Step 2: Process review data using field mapping
        const reviewData = this.processReviewRow(cleanedRow, fieldMapping);
        
        if (!reviewData) {
          this.stats.skippedRows++;
          continue;
        }

        // Step 3: Validate required fields
        if (!this.validateReviewData(reviewData)) {
          this.stats.errorRows++;
          this.stats.errorDetails.push({
            row: i + 1,
            errors: ['Missing required review fields'],
            data: cleanedRow
          });
          continue;
        }

        processedReviews.push(reviewData);
        this.stats.processedRows++;

        // Update source breakdown
        const source = this.mapCsvTypeToSource(csvType);
        this.stats.sourceBreakdown[source] = (this.stats.sourceBreakdown[source] || 0) + 1;

      } catch (error) {
        this.stats.errorRows++;
        this.stats.errorDetails.push({
          row: i + 1,
          errors: [`Processing error: ${error}`],
          data: row
        });
      }
    }

    return processedReviews;
  }

  /**
   * Process a single review row using field mapping
   */
  private processReviewRow(row: CSVRow, fieldMapping: ReviewFieldMapping): any | null {
    try {
      // Extract required fields
      const businessName = this.getFieldValue(row, fieldMapping.businessName);
      const reviewId = this.getFieldValue(row, fieldMapping.reviewId);
      const rating = this.getFieldValue(row, fieldMapping.rating);
      const comment = this.getFieldValue(row, fieldMapping.comment);
      const userName = this.getFieldValue(row, fieldMapping.userName);

      if (!businessName || !reviewId || !rating || !comment || !userName) {
        return null;
      }

      // Parse rating to number (handle different scales)
      let parsedRating = parseFloat(rating);
      if (parsedRating > 5) {
        // Convert from 10-point scale to 5-point scale
        parsedRating = parsedRating / 2;
      }
      parsedRating = Math.max(1, Math.min(5, Math.round(parsedRating)));

      // Build review object
      const reviewData = {
        businessName: businessName.trim(),
        reviewId: reviewId.toString(),
        rating: parsedRating,
        comment: comment.trim(),
        userName: userName.trim(),
        // Optional fields
        businessPhone: this.getFieldValue(row, fieldMapping.businessPhone),
        businessAddress: this.getFieldValue(row, fieldMapping.businessAddress),
        businessId: this.getFieldValue(row, fieldMapping.businessId),
        userId: this.getFieldValue(row, fieldMapping.userId),
        authorPhotoUrl: this.getFieldValue(row, fieldMapping.authorPhotoUrl),
        verified: this.parseBooleanField(this.getFieldValue(row, fieldMapping.verified)),
        helpful: this.parseNumericField(this.getFieldValue(row, fieldMapping.helpful)),
        sourceUrl: this.getFieldValue(row, fieldMapping.sourceUrl),
        originalCreateTime: this.getFieldValue(row, fieldMapping.originalCreateTime),
        originalUpdateTime: this.getFieldValue(row, fieldMapping.originalUpdateTime),
        replyText: this.getFieldValue(row, fieldMapping.replyText),
        replyAuthorName: this.getFieldValue(row, fieldMapping.replyAuthorName),
        replyCreatedAt: this.getFieldValue(row, fieldMapping.replyCreatedAt),
      };

      return reviewData;
    } catch (error) {
      console.error('Error processing review row:', error);
      return null;
    }
  }

  /**
   * Import reviews to database
   */
  private async importToDatabase(reviews: any[], csvType: string, fileName: string): Promise<void> {
    try {
      const batchSize = 50;
      let totalSuccessful = 0;
      let totalFailed = 0;
      let totalSkipped = 0;
      let totalDuplicates = 0;

      const source = this.mapCsvTypeToSource(csvType);

      for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        
        const result = await this.convex.mutation(api.reviewImport.batchImportReviews, {
          reviews: batch,
          source: source,
          importBatchId: this.currentBatchId,
          skipDuplicates: this.configManager.shouldSkipDuplicates(),
          sourceMetadata: {
            fileName,
            csvType,
            batchNumber: Math.floor(i / batchSize) + 1,
          },
        });

        totalSuccessful += result.successful;
        totalFailed += result.failed;
        totalSkipped += result.skipped;
        totalDuplicates += result.duplicates;

        // Update business match stats
        result.businessMatches.forEach(match => {
          this.stats.businessMatchStats[match.matchType] = 
            (this.stats.businessMatchStats[match.matchType] || 0) + 1;
        });

        if (result.errors.length > 0) {
          console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1} errors:`);
          result.errors.slice(0, 3).forEach(error => console.error(`  ❌ ${error}`));
          if (result.errors.length > 3) {
            console.log(`  ... and ${result.errors.length - 3} more errors`);
          }
        }

        console.log(`📊 Batch ${Math.floor(i / batchSize) + 1}: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped, ${result.duplicates} duplicates`);
      }

      // Update final stats
      this.stats.duplicateRows = totalDuplicates;

      console.log(`\n✅ Review Import Summary:`);
      console.log(`  Successfully imported: ${totalSuccessful}`);
      console.log(`  Failed: ${totalFailed}`);
      console.log(`  Skipped: ${totalSkipped}`);
      console.log(`  Duplicates: ${totalDuplicates}`);
    } catch (error) {
      console.error('❌ Database import failed:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private getFieldValue(row: CSVRow, fieldName?: string): string | undefined {
    if (!fieldName || !row[fieldName]) return undefined;
    return String(row[fieldName]).trim();
  }

  private parseBooleanField(value?: string): boolean | undefined {
    if (!value) return undefined;
    const lowercaseValue = value.toLowerCase();
    return lowercaseValue === 'true' || lowercaseValue === '1' || lowercaseValue === 'yes';
  }

  private parseNumericField(value?: string): number | undefined {
    if (!value) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private validateReviewData(reviewData: any): boolean {
    return !!(
      reviewData.businessName &&
      reviewData.reviewId &&
      reviewData.rating &&
      reviewData.comment &&
      reviewData.userName
    );
  }

  private mapCsvTypeToSource(csvType: string): "gmb_import" | "yelp_import" | "facebook_import" | "manual" {
    if (csvType.includes('google')) return 'gmb_import';
    if (csvType.includes('yelp')) return 'yelp_import';
    if (csvType.includes('facebook')) return 'facebook_import';
    return 'manual';
  }

  private updateProgress(processed: number): void {
    const percentage = Math.round((processed / this.stats.totalRows) * 100);
    console.log(`📈 Progress: ${processed}/${this.stats.totalRows} (${percentage}%)`);
  }

  private printStats(): void {
    console.log('\n📊 Review Import Statistics:');
    console.log('============================');
    console.log(`Total rows: ${this.stats.totalRows}`);
    console.log(`Processed: ${this.stats.processedRows}`);
    console.log(`Skipped: ${this.stats.skippedRows}`);
    console.log(`Errors: ${this.stats.errorRows}`);
    console.log(`Duplicates: ${this.stats.duplicateRows}`);
    console.log(`Success rate: ${this.stats.successRate.toFixed(1)}%`);
    
    if (Object.keys(this.stats.businessMatchStats).length > 0) {
      console.log('\n🎯 Business Matching:');
      Object.entries(this.stats.businessMatchStats).forEach(([matchType, count]) => {
        console.log(`  ${matchType}: ${count} matches`);
      });
    }
    
    if (Object.keys(this.stats.sourceBreakdown).length > 0) {
      console.log('\n📋 Source Breakdown:');
      Object.entries(this.stats.sourceBreakdown).forEach(([source, count]) => {
        console.log(`  ${source}: ${count} reviews`);
      });
    }

    if (this.stats.errorDetails.length > 0) {
      console.log('\n❌ Error Details:');
      this.stats.errorDetails.slice(0, 5).forEach(error => {
        console.log(`  Row ${error.row}: ${error.errors.join(', ')}`);
      });
      
      if (this.stats.errorDetails.length > 5) {
        console.log(`  ... and ${this.stats.errorDetails.length - 5} more errors`);
      }
    }
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run import-reviews <csv-file>');
    console.log('       npm run import-reviews --all');
    console.log('');
    console.log('Examples:');
    console.log('  npm run import-reviews google-reviews.csv');
    console.log('  npm run import-reviews data/imports/yelp-reviews.csv');
    console.log('  npm run import-reviews --all  # Import all *reviews*.csv files');
    process.exit(1);
  }

  const importer = new ReviewImporter();
  const dataDir = path.join(process.cwd(), 'data', 'imports');

  try {
    if (args[0] === '--all') {
      // Import all review CSV files in data/imports directory
      const allFiles = importer.csvProcessor.getCSVFiles(dataDir);
      const reviewFiles = allFiles.filter(file => 
        path.basename(file).toLowerCase().includes('review')
      );
      
      if (reviewFiles.length === 0) {
        console.log('No review CSV files found in data/imports directory');
        console.log('Looking for files with "review" in the filename...');
        process.exit(1);
      }

      console.log(`Found ${reviewFiles.length} review CSV files to import`);
      
      for (const csvFile of reviewFiles) {
        console.log(`\n🔄 Processing ${path.basename(csvFile)}...`);
        await importer.import(csvFile);
      }
    } else {
      // Import specific file
      const csvFile = args[0];
      const fullPath = path.isAbsolute(csvFile) ? csvFile : path.join(dataDir, csvFile);
      
      if (!fs.existsSync(fullPath)) {
        console.error(`CSV file not found: ${fullPath}`);
        process.exit(1);
      }

      await importer.import(fullPath);
    }

    console.log('\n🎉 All review imports completed successfully!');
    
    // Show summary of what's available
    console.log('\n📈 Quick Stats:');
    console.log('Run "npm run validate-import" to see full import validation');
    
  } catch (error) {
    console.error('❌ Review import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main();
}

export default ReviewImporter;