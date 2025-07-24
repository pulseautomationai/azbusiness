#!/usr/bin/env node

/**
 * Systematic Review Import Scheduler for GEOscraper Integration
 * 
 * This script manages the overnight import of Google Reviews using the GEOscraper API
 * with a strict 3-connection concurrency limit. It processes businesses systematically
 * and provides comprehensive monitoring and error recovery.
 * 
 * Usage:
 *   npm run schedule-reviews           # Schedule all businesses
 *   npm run schedule-reviews -- --limit 100  # Limit to 100 businesses
 *   npm run schedule-reviews -- --priority high  # Set high priority
 *   npm run schedule-reviews -- --dry-run  # Show what would be scheduled
 */

import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

interface ScheduleOptions {
  limit?: number;
  priority?: number;
  dryRun?: boolean;
  onlyMissing?: boolean;
  batchSize?: number;
}

interface BusinessForSync {
  _id: string;
  name: string;
  placeId: string;
  reviewCount?: number;
  lastSyncedAt?: number;
  city?: string;
  category?: string;
}

class ReviewImportScheduler {
  private options: ScheduleOptions;

  constructor(options: ScheduleOptions = {}) {
    this.options = {
      limit: 1000,
      priority: 5,
      dryRun: false,
      onlyMissing: true,
      batchSize: 50,
      ...options
    };
  }

  /**
   * Get businesses that need review imports
   */
  private async getBusinessesNeedingReviews(limit: number = 100): Promise<BusinessForSync[]> {
    try {
      // Use the new query that specifically looks for businesses needing reviews
      const businesses = await client.query(api.businesses.getBusinessesForReviewImport, {
        limit,
        onlyMissing: this.options.onlyMissing
      });

      // Map to our expected format
      const businessesNeedingReviews = businesses.map((business: any) => ({
        _id: business._id,
        name: business.name,
        placeId: business.placeId,
        reviewCount: business.reviewCount || 0,
        lastSyncedAt: business.lastReviewSync,
        city: business.city,
        category: business.category?.name
      }));

      return businessesNeedingReviews;
    } catch (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }
  }

  /**
   * Get current queue status
   */
  private async getQueueStatus() {
    try {
      const status = await client.query(api.geoScraperQueue.getQueueStatus);
      return status;
    } catch (error) {
      console.error('Error getting queue status:', error);
      return null;
    }
  }

  /**
   * Add businesses to the review sync queue
   */
  private async scheduleBusinesses(businesses: BusinessForSync[]) {
    if (this.options.dryRun) {
      console.log(`\n🧪 DRY RUN - Would schedule ${businesses.length} businesses`);
      businesses.slice(0, 5).forEach((business, index) => {
        console.log(`  ${index + 1}. ${business.name} (${business.city}) - Reviews: ${business.reviewCount}`);
      });
      if (businesses.length > 5) {
        console.log(`  ... and ${businesses.length - 5} more`);
      }
      return;
    }

    // Process in batches to avoid overwhelming the system
    const batchSize = this.options.batchSize || 50;
    let totalScheduled = 0;
    let totalExisting = 0;

    console.log(`\n📅 Scheduling ${businesses.length} businesses in batches of ${batchSize}`);

    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(businesses.length / batchSize);

      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} businesses)`);

      try {
        const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
          businesses: batch.map(b => ({ businessId: b._id, placeId: b.placeId })),
          priority: this.options.priority
        });

        totalScheduled += result.added;
        totalExisting += result.existing;

        console.log(`  ✅ Added: ${result.added}, Already queued: ${result.existing}`);

        // Small delay between batches
        if (i + batchSize < businesses.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`  ❌ Error processing batch ${batchNumber}:`, error);
      }
    }

    console.log(`\n📊 SCHEDULING SUMMARY:`);
    console.log(`✅ Newly scheduled: ${totalScheduled}`);
    console.log(`📋 Already queued: ${totalExisting}`);
    console.log(`📈 Total in scope: ${businesses.length}`);
  }

  /**
   * Monitor queue progress
   */
  private async monitorProgress() {
    console.log(`\n👀 Queue Monitoring (press Ctrl+C to stop)`);
    console.log(`────────────────────────────────────────`);

    const monitor = setInterval(async () => {
      try {
        const status = await this.getQueueStatus();
        if (status) {
          const now = new Date().toLocaleTimeString();
          console.log(`[${now}] Pending: ${status.pendingCount} | Processing: ${status.processingCount}/3 | Queue Depth: ${status.queueDepth}`);
        }
      } catch (error) {
        console.error('Monitor error:', error);
      }
    }, 30000); // Update every 30 seconds

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Stopping monitor...');
      clearInterval(monitor);
      process.exit(0);
    });
  }

  /**
   * Main scheduling routine
   */
  async schedule() {
    console.log('🚀 Arizona Business Review Import Scheduler');
    console.log('═══════════════════════════════════════════');
    
    // Display current settings
    console.log(`\n⚙️  CONFIGURATION:`);
    console.log(`   Limit: ${this.options.limit || 'unlimited'}`);
    console.log(`   Priority: ${this.options.priority}`);
    console.log(`   Only Missing: ${this.options.onlyMissing ? 'Yes' : 'No'}`);
    console.log(`   Batch Size: ${this.options.batchSize}`);
    console.log(`   Dry Run: ${this.options.dryRun ? 'Yes' : 'No'}`);

    // Check current queue status
    console.log(`\n📊 CURRENT QUEUE STATUS:`);
    const queueStatus = await this.getQueueStatus();
    if (queueStatus) {
      console.log(`   Pending: ${queueStatus.pendingCount}`);
      console.log(`   Processing: ${queueStatus.processingCount}/3`);
      console.log(`   Recent Completed: ${queueStatus.recentCompleted}`);
      console.log(`   Recent Failed: ${queueStatus.recentFailed}`);
    } else {
      console.log(`   ❌ Could not fetch queue status`);
    }

    // Get businesses that need reviews
    console.log(`\n🔍 FINDING BUSINESSES FOR REVIEW IMPORT:`);
    console.log(`   Fetching businesses 1-${this.options.limit}...`);
    
    const allBusinesses = await this.getBusinessesNeedingReviews(this.options.limit || 1000);

    console.log(`\n📈 FOUND ${allBusinesses.length} BUSINESSES FOR IMPORT:`);
    
    // Show some stats
    const withoutReviews = allBusinesses.filter(b => b.reviewCount === 0).length;
    const withReviews = allBusinesses.length - withoutReviews;
    
    console.log(`   Without reviews: ${withoutReviews}`);
    console.log(`   With reviews: ${withReviews}`);

    if (allBusinesses.length === 0) {
      console.log(`\n✅ No businesses need review imports at this time.`);
      return;
    }

    // Group by city for better insights
    const byCityMap = new Map<string, number>();
    allBusinesses.forEach(b => {
      const city = b.city || 'Unknown';
      byCityMap.set(city, (byCityMap.get(city) || 0) + 1);
    });
    
    const topCities = Array.from(byCityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    console.log(`\n🏙️  TOP CITIES:`);
    topCities.forEach(([city, count]) => {
      console.log(`   ${city}: ${count} businesses`);
    });

    // Schedule the businesses
    await this.scheduleBusinesses(allBusinesses);

    // Start monitoring if not a dry run
    if (!this.options.dryRun) {
      console.log(`\n🎯 OVERNIGHT PROCESSING ESTIMATE:`);
      const estimatedTime = Math.ceil(allBusinesses.length / 3) * 30; // ~30 seconds per business with 3 concurrent
      const hours = Math.floor(estimatedTime / 3600);
      const minutes = Math.floor((estimatedTime % 3600) / 60);
      console.log(`   Processing time: ~${hours}h ${minutes}m`);
      console.log(`   Concurrent connections: 3`);
      console.log(`   Rate: ~6 businesses/minute`);

      console.log(`\n✨ Schedule complete! The queue processor will handle the rest.`);
      console.log(`   Queue will process automatically with 3 concurrent connections.`);
      console.log(`   Check queue status anytime with: npx convex run geoScraperQueue:getQueueStatus`);

      // Offer to monitor
      const shouldMonitor = process.argv.includes('--monitor');
      if (shouldMonitor) {
        await this.monitorProgress();
      } else {
        console.log(`\n💡 To monitor progress, run: npm run schedule-reviews -- --monitor`);
      }
    }
  }
}

// Parse command line arguments
function parseArgs(): ScheduleOptions {
  const args = process.argv.slice(2);
  const options: ScheduleOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        options.limit = parseInt(args[++i]) || 1000;
        break;
      case '--priority':
        const priority = args[++i];
        options.priority = priority === 'high' ? 8 : priority === 'low' ? 3 : parseInt(priority) || 5;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 50;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--all':
        options.onlyMissing = false;
        break;
      case '--help':
        console.log(`
Review Import Scheduler - Usage:

Options:
  --limit <number>     Limit number of businesses to schedule (default: 1000)
  --priority <level>   Set priority: high(8), medium(5), low(3) (default: 5)
  --batch-size <num>   Batch size for processing (default: 50)
  --dry-run           Show what would be scheduled without doing it
  --all               Include businesses that already have reviews
  --monitor           Monitor queue progress after scheduling
  --help              Show this help message

Examples:
  npm run schedule-reviews                    # Schedule up to 1000 businesses
  npm run schedule-reviews -- --limit 100    # Schedule only 100 businesses
  npm run schedule-reviews -- --priority high --dry-run  # High priority dry run
  npm run schedule-reviews -- --all --monitor  # Schedule all and monitor
`);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const scheduler = new ReviewImportScheduler(options);
    await scheduler.schedule();
  } catch (error) {
    console.error('❌ Scheduler error:', error);
    process.exit(1);
  }
}

// ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}