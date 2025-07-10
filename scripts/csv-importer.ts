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
import DataValidator from '../app/utils/data-validator';
import type { BusinessData } from '../app/utils/data-validator';
import { SlugGenerator } from '../app/utils/slug-generator';
import CategoryDetector from '../config/category-detector';
import FieldMappingDetector from '../config/field-mappings';
import type { FieldMapping } from '../config/field-mappings';
import ImportConfigManager from '../config/import-config';

interface ImportStats {
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  errorRows: number;
  successRate: number;
  categoryCounts: Record<string, number>;
  errorDetails: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
}

class CSVImporter {
  private convex: ConvexHttpClient;
  private csvProcessor: CSVProcessor;
  private categoryDetector: CategoryDetector;
  private configManager: ImportConfigManager;
  private stats: ImportStats;

  constructor() {
    // Initialize Convex client
    const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required');
    }

    this.convex = new ConvexHttpClient(convexUrl);
    this.csvProcessor = new CSVProcessor();
    this.categoryDetector = new CategoryDetector();
    this.configManager = new ImportConfigManager();
    
    this.stats = {
      totalRows: 0,
      processedRows: 0,
      skippedRows: 0,
      errorRows: 0,
      successRate: 0,
      categoryCounts: {},
      errorDetails: []
    };
  }

  /**
   * Main import function
   */
  async import(csvFilePath: string): Promise<ImportStats> {
    try {
      console.log(`🚀 Starting CSV import from: ${csvFilePath}`);
      
      // Step 1: Read and parse CSV
      const rows = await this.csvProcessor.readCSV(csvFilePath);
      this.stats.totalRows = rows.length;
      
      if (rows.length === 0) {
        throw new Error('No data found in CSV file');
      }

      // Step 2: Auto-detect field mapping
      const headers = Object.keys(rows[0]);
      const csvType = FieldMappingDetector.detectCSVType(headers);
      const fieldMapping = FieldMappingDetector.getMappingByType(csvType);
      
      console.log(`📊 Detected CSV type: ${csvType}`);
      console.log(`📋 Processing ${rows.length} rows with ${headers.length} columns`);

      // Step 3: Get category mappings from database
      const categories = await this.convex.query(api.categories.getCategories);
      const categoryMap = new Map(categories.map(cat => [cat.slug, cat._id]));

      // Step 4: Process rows in batches
      const batchSize = this.configManager.getBatchSize();
      const processedBusinesses: any[] = [];

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}`);
        
        const batchResults = await this.processBatch(batch, fieldMapping, categoryMap);
        processedBusinesses.push(...batchResults);
        
        // Update progress
        this.updateProgress(i + batch.length);
      }

      // Step 5: Import to database
      if (processedBusinesses.length > 0) {
        console.log(`💾 Importing ${processedBusinesses.length} businesses to database...`);
        await this.importToDatabase(processedBusinesses);
      }

      // Step 6: Generate final stats
      this.stats.successRate = (this.stats.processedRows / this.stats.totalRows) * 100;
      
      console.log(`✅ Import completed successfully!`);
      this.printStats();
      
      return this.stats;
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  /**
   * Process a batch of CSV rows
   */
  private async processBatch(
    rows: CSVRow[],
    fieldMapping: FieldMapping,
    categoryMap: Map<string, string>
  ): Promise<any[]> {
    const processedBusinesses: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Step 1: Clean and validate row data
        const cleanedRow = this.csvProcessor.cleanRow(row);
        
        // Step 2: Process business data
        const { data, validation } = DataValidator.processCSVRow(cleanedRow, fieldMapping);
        
        if (!validation.valid) {
          this.stats.errorRows++;
          this.stats.errorDetails.push({
            row: i + 1,
            errors: validation.errors,
            data: cleanedRow
          });
          continue;
        }

        if (!data) {
          this.stats.skippedRows++;
          continue;
        }

        // Step 3: Auto-detect category
        const detectedCategory = this.categoryDetector.detectCategory(
          data.name,
          data.description,
          data.category
        );

        if (!detectedCategory) {
          this.stats.skippedRows++;
          console.log(`⚠️  Skipping ${data.name} - could not detect category`);
          continue;
        }

        const categoryId = categoryMap.get(detectedCategory);
        if (!categoryId) {
          this.stats.skippedRows++;
          console.log(`⚠️  Skipping ${data.name} - category not found in database`);
          continue;
        }

        // Step 4: Generate slug and URL path
        const categoryName = this.categoryDetector.getCategoryName(detectedCategory) || detectedCategory;
        const businessSlug = SlugGenerator.generateFullBusinessSlug(data.name, data.city, categoryName);
        const urlPath = SlugGenerator.generateURLPath(data.name, data.city, categoryName);

        // Step 5: Generate services and hours
        const services = this.configManager.getDefaultServices(detectedCategory);
        const hours = data.hours || this.configManager.getDefaultHours(detectedCategory);

        // Step 6: Create business object
        const business = {
          name: data.name,
          slug: businessSlug,
          urlPath: urlPath,
          shortDescription: data.shortDescription || SlugGenerator.generateShortDescription(data.name, categoryName, data.city),
          description: data.description || `Professional ${categoryName.toLowerCase()} services in ${data.city}, Arizona.`,
          phone: data.phone,
          email: data.email || undefined,
          website: data.website,
          address: data.address,
          city: this.normalizeCityName(data.city),
          state: data.state,
          zip: data.zip,
          categoryId: categoryId,
          services: services,
          coordinates: data.latitude && data.longitude ? {
            lat: data.latitude,
            lng: data.longitude
          } : undefined,
          hours: hours,
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          socialLinks: data.socialLinks,
          // Additional GMB fields
          imageUrl: data.imageUrl,
          favicon: data.favicon,
          reviewUrl: data.reviewUrl,
          serviceOptions: data.serviceOptions,
          fromTheBusiness: data.fromTheBusiness,
          offerings: data.offerings,
          planning: data.planning
        };

        processedBusinesses.push(business);
        this.stats.processedRows++;

        // Update category counts
        this.stats.categoryCounts[detectedCategory] = (this.stats.categoryCounts[detectedCategory] || 0) + 1;

      } catch (error) {
        this.stats.errorRows++;
        this.stats.errorDetails.push({
          row: i + 1,
          errors: [`Processing error: ${error}`],
          data: row
        });
      }
    }

    return processedBusinesses;
  }

  /**
   * Import businesses to database
   */
  private async importToDatabase(businesses: any[]): Promise<void> {
    try {
      // Use batch import function for better performance
      const batchSize = 50;
      let totalSuccessful = 0;
      let totalFailed = 0;
      let totalSkipped = 0;

      for (let i = 0; i < businesses.length; i += batchSize) {
        const batch = businesses.slice(i, i + batchSize);
        
        const result = await this.convex.mutation(api.batchImport.batchImportBusinesses, {
          businesses: batch,
          skipDuplicates: this.configManager.shouldSkipDuplicates()
        });

        totalSuccessful += result.successful;
        totalFailed += result.failed;
        totalSkipped += result.skipped;

        if (result.errors.length > 0) {
          console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1} errors:`);
          result.errors.forEach(error => console.error(`  ❌ ${error}`));
        }

        console.log(`📊 Batch ${Math.floor(i / batchSize) + 1}: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`);
      }

      console.log(`\n✅ Import Summary:`);
      console.log(`  Successfully imported: ${totalSuccessful}`);
      console.log(`  Failed: ${totalFailed}`);
      console.log(`  Skipped (duplicates): ${totalSkipped}`);
    } catch (error) {
      console.error('❌ Database import failed:', error);
      throw error;
    }
  }

  /**
   * Update progress display
   */
  private updateProgress(processed: number): void {
    const percentage = Math.round((processed / this.stats.totalRows) * 100);
    console.log(`📈 Progress: ${processed}/${this.stats.totalRows} (${percentage}%)`);
  }

  /**
   * Print final statistics
   */
  private printStats(): void {
    console.log('\n📊 Import Statistics:');
    console.log('===================');
    console.log(`Total rows: ${this.stats.totalRows}`);
    console.log(`Processed: ${this.stats.processedRows}`);
    console.log(`Skipped: ${this.stats.skippedRows}`);
    console.log(`Errors: ${this.stats.errorRows}`);
    console.log(`Success rate: ${this.stats.successRate.toFixed(1)}%`);
    
    console.log('\n📋 Categories:');
    Object.entries(this.stats.categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} businesses`);
    });

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

  /**
   * Normalize city names to match the cities table format
   * Example: "phoenix" -> "Phoenix", "scottsdale" -> "Scottsdale"
   */
  private normalizeCityName(city: string): string {
    if (!city) return '';
    
    // Trim whitespace and capitalize first letter of each word
    return city.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run import-csv <csv-file>');
    console.log('       npm run import-csv --all');
    process.exit(1);
  }

  const importer = new CSVImporter();
  const dataDir = path.join(process.cwd(), 'data', 'imports');

  try {
    if (args[0] === '--all') {
      // Import all CSV files in data/imports directory
      const csvFiles = importer.csvProcessor.getCSVFiles(dataDir);
      
      if (csvFiles.length === 0) {
        console.log('No CSV files found in data/imports directory');
        process.exit(1);
      }

      console.log(`Found ${csvFiles.length} CSV files to import`);
      
      for (const csvFile of csvFiles) {
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

    console.log('\n🎉 All imports completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main();
}

export default CSVImporter;