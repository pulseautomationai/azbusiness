#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { api } from '../convex/_generated/api';

interface ReviewData {
  businessName: string;
  reviewId: string;
  rating: number;
  comment: string;
  userName: string;
  reviewDate?: string;
  source?: string;
  verified?: boolean;
}

class SimpleReviewImporter {
  private convex: ConvexHttpClient;

  constructor() {
    const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required');
    }
    this.convex = new ConvexHttpClient(convexUrl);
  }

  async importCSV(csvFilePath: string): Promise<void> {
    try {
      console.log(`🚀 Starting simple review import from: ${csvFilePath}`);
      
      // Read CSV file
      const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      console.log('Headers:', headers);

      // Parse rows
      const reviews: ReviewData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        if (values.length >= headers.length) {
          const review: ReviewData = {
            businessName: values[headers.indexOf('businessName')] || '',
            reviewId: values[headers.indexOf('reviewId')] || '',
            rating: parseInt(values[headers.indexOf('rating')] || '5'),
            comment: values[headers.indexOf('comment')] || '',
            userName: values[headers.indexOf('userName')] || '',
            reviewDate: values[headers.indexOf('reviewDate')] || '',
            source: values[headers.indexOf('source')] || 'manual',
            verified: values[headers.indexOf('verified')] === 'true',
          };
          
          if (review.businessName && review.reviewId && review.comment && review.userName) {
            reviews.push(review);
          }
        }
      }

      console.log(`📊 Parsed ${reviews.length} reviews`);

      // Get all businesses for matching
      const businesses = await this.convex.query(api.businesses.getBusinesses, { limit: 1000 });
      console.log(`📋 Found ${businesses.length} businesses in database`);

      // Import reviews one by one
      let successful = 0;
      let failed = 0;

      for (const review of reviews) {
        try {
          // Find matching business
          const matchingBusiness = businesses.find(b => 
            b.name.toLowerCase().includes(review.businessName.toLowerCase()) ||
            review.businessName.toLowerCase().includes(b.name.toLowerCase())
          );

          if (!matchingBusiness) {
            console.log(`❌ No matching business found for: ${review.businessName}`);
            failed++;
            continue;
          }

          // Check for duplicate review
          const existingReviews = await this.convex.query(api.gmbReviews.getBusinessReviews, {
            businessId: matchingBusiness._id,
            limit: 1000
          });

          const isDuplicate = existingReviews.some(r => r.reviewId === review.reviewId);
          if (isDuplicate) {
            console.log(`⚠️  Duplicate review skipped: ${review.reviewId}`);
            continue;
          }

          // Create review record directly
          await this.convex.mutation(api.gmbReviews.createDirectReview, {
            businessId: matchingBusiness._id,
            reviewId: review.reviewId,
            rating: review.rating,
            comment: review.comment,
            userName: review.userName,
            source: review.source as any || 'manual',
            verified: review.verified || false,
            originalCreateTime: review.reviewDate || new Date().toISOString(),
          });

          console.log(`✅ Created review: ${review.userName} for ${matchingBusiness.name}`);
          successful++;

        } catch (error) {
          console.error(`❌ Failed to import review ${review.reviewId}:`, error);
          failed++;
        }
      }

      console.log(`\n🎉 Import complete! ${successful} successful, ${failed} failed`);

    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: tsx scripts/simple-review-import.ts <csv-file>');
    process.exit(1);
  }

  const csvFile = args[0];
  const dataDir = path.join(process.cwd(), 'data', 'imports');
  const fullPath = path.isAbsolute(csvFile) ? csvFile : path.join(dataDir, csvFile);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`CSV file not found: ${fullPath}`);
    process.exit(1);
  }

  const importer = new SimpleReviewImporter();
  await importer.importCSV(fullPath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}