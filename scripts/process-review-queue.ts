#!/usr/bin/env node

/**
 * Review Queue Processor for Overnight Operations
 * 
 * This script continuously processes the review sync queue with exactly 3 concurrent
 * connections to respect GEOscraper API limits. It's designed to run overnight
 * and handle large-scale review imports systematically.
 * 
 * Features:
 * - Maintains exactly 3 concurrent connections
 * - Automatic retry logic with exponential backoff
 * - Progress monitoring and reporting
 * - Graceful shutdown handling
 * - Error recovery and queue management
 * 
 * Usage:
 *   npm run process-queue                    # Start processing
 *   npm run process-queue -- --max-cycles 100  # Limit processing cycles
 *   npm run process-queue -- --verbose      # Detailed logging
 */

import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

interface ProcessorOptions {
  maxCycles?: number;
  verbose?: boolean;
  checkInterval?: number;
  maxConcurrent?: number;
}

interface QueueItem {
  _id: string;
  businessId: string;
  placeId: string;
  priority: number;
  retryCount: number;
  requestedAt: number;
}

interface ProcessingStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  totalReviewsImported: number;
  totalReviewsFetched: number;
  startTime: number;
  currentCycle: number;
}

class ReviewQueueProcessor {
  private options: ProcessorOptions;
  private stats: ProcessingStats;
  private activeProcessing: Set<string> = new Set();
  private processingStartTimes: Map<string, number> = new Map();
  private shouldStop: boolean = false;
  private stuckCheckCounter: number = 0;

  constructor(options: ProcessorOptions = {}) {
    this.options = {
      maxCycles: Infinity,
      verbose: false,
      checkInterval: 5000, // 5 seconds
      maxConcurrent: 3,
      ...options
    };

    this.stats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      totalReviewsImported: 0,
      totalReviewsFetched: 0,
      startTime: Date.now(),
      currentCycle: 0
    };
  }

  /**
   * Get the current queue status
   */
  private async getQueueStatus() {
    try {
      return await client.query(api.geoScraperQueue.getQueueStatus);
    } catch (error) {
      this.log('Error getting queue status:', error);
      return null;
    }
  }

  /**
   * Get next items to process from the queue
   */
  private async getNextQueueItems(): Promise<QueueItem[]> {
    try {
      const availableSlots = this.options.maxConcurrent! - this.activeProcessing.size;
      if (availableSlots <= 0) return [];

      return await client.query(api.geoScraperQueue.getNextQueueItems, {
        limit: availableSlots
      });
    } catch (error) {
      this.log('Error getting next queue items:', error);
      return [];
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: QueueItem): Promise<boolean> {
    this.activeProcessing.add(item._id);
    this.processingStartTimes.set(item._id, Date.now());
    
    try {
      // Mark as processing
      await client.mutation(api.geoScraperQueue.markAsProcessing, {
        queueId: item._id
      });

      this.log(`🔄 Processing: ${item.businessId} (PlaceID: ${item.placeId})`);

      // Fetch and import reviews with timeout (5 minutes)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Processing timeout after 5 minutes')), 5 * 60 * 1000)
      );
      
      const result = await Promise.race([
        client.action(api.geoScraperAPI.fetchAndImportReviews, {
          businessId: item.businessId,
          placeId: item.placeId
        }),
        timeoutPromise
      ]) as any;

      if (result.success) {
        // Mark as completed
        await client.mutation(api.geoScraperQueue.markAsCompleted, {
          queueId: item._id,
          results: {
            fetched: result.fetched || 0,
            filtered: result.filtered || 0,
            imported: result.imported || 0,
            skipped: result.skipped || 0
          }
        });

        this.stats.successful++;
        this.stats.totalReviewsFetched += result.fetched || 0;
        this.stats.totalReviewsImported += result.imported || 0;

        this.log(`✅ Success: ${result.imported} reviews imported (${result.fetched} fetched)`);
        return true;
      } else {
        // Mark as failed
        await client.mutation(api.geoScraperQueue.markAsFailed, {
          queueId: item._id,
          error: result.error || 'Unknown error'
        });

        this.stats.failed++;
        this.log(`❌ Failed: ${result.error}`);
        return false;
      }
    } catch (error: any) {
      try {
        // Mark as failed
        await client.mutation(api.geoScraperQueue.markAsFailed, {
          queueId: item._id,
          error: error.message || 'Processing error'
        });
      } catch (markError) {
        this.log('Error marking item as failed:', markError);
      }

      this.stats.failed++;
      this.log(`❌ Processing error: ${error.message}`);
      return false;
    } finally {
      this.activeProcessing.delete(item._id);
      this.processingStartTimes.delete(item._id);
      this.stats.totalProcessed++;
    }
  }

  /**
   * Clear any stuck items in the queue
   */
  private async clearStuckItems() {
    try {
      const result = await client.mutation(api.geoScraperQueue.clearStuckItems);
      if (result.cleared > 0) {
        this.log(`🧹 Cleared ${result.cleared} stuck items`);
      }
    } catch (error) {
      this.log('Error clearing stuck items:', error);
    }
  }

  /**
   * Check for and handle stuck processing items
   */
  private async checkAndHandleStuckProcessing(): Promise<boolean> {
    const now = Date.now();
    const stuckThreshold = 3 * 60 * 1000; // 3 minutes
    let hasStuckItems = false;

    for (const [itemId, startTime] of this.processingStartTimes) {
      const processingTime = now - startTime;
      if (processingTime > stuckThreshold) {
        console.log(`⚠️ Detected stuck item ${itemId} (processing for ${Math.floor(processingTime / 1000)}s)`);
        
        // Remove from active processing
        this.activeProcessing.delete(itemId);
        this.processingStartTimes.delete(itemId);
        
        // Mark as failed in the database
        try {
          await client.mutation(api.geoScraperQueue.markAsFailed, {
            queueId: itemId,
            error: 'Processing timeout - marked as stuck'
          });
          this.stats.failed++;
          hasStuckItems = true;
        } catch (error) {
          this.log('Error marking stuck item as failed:', error);
        }
      }
    }

    return hasStuckItems;
  }

  /**
   * Display current progress
   */
  private displayProgress() {
    const runtime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const hours = Math.floor(runtime / 3600);
    const minutes = Math.floor((runtime % 3600) / 60);
    const seconds = runtime % 60;

    const successRate = this.stats.totalProcessed > 0 
      ? ((this.stats.successful / this.stats.totalProcessed) * 100).toFixed(1)
      : '0.0';

    console.log(`\n📊 PROCESSING STATS (Cycle ${this.stats.currentCycle})`);
    console.log(`────────────────────────────────────────`);
    console.log(`⏱️  Runtime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`📈 Processed: ${this.stats.totalProcessed} (${this.stats.successful} success, ${this.stats.failed} failed)`);
    console.log(`📝 Reviews: ${this.stats.totalReviewsImported} imported (${this.stats.totalReviewsFetched} fetched)`);
    console.log(`⚡ Success Rate: ${successRate}%`);
    console.log(`🔄 Active: ${this.activeProcessing.size}/${this.options.maxConcurrent}`);
  }

  /**
   * Main processing loop
   */
  async process() {
    console.log('🚀 Review Queue Processor Started');
    console.log('═══════════════════════════════════');
    console.log(`⚙️  Max Concurrent: ${this.options.maxConcurrent}`);
    console.log(`⏱️  Check Interval: ${this.options.checkInterval}ms`);
    console.log(`📊 Verbose Logging: ${this.options.verbose ? 'On' : 'Off'}`);
    console.log(`🔄 Max Cycles: ${this.options.maxCycles === Infinity ? 'Unlimited' : this.options.maxCycles}`);

    // Clear any stuck items at startup
    await this.clearStuckItems();

    // Setup graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Graceful shutdown requested...');
      this.shouldStop = true;
    });

    // Main processing loop
    while (!this.shouldStop && this.stats.currentCycle < this.options.maxCycles!) {
      this.stats.currentCycle++;

      try {
        // Get queue status
        const queueStatus = await this.getQueueStatus();
        
        if (!queueStatus) {
          this.log('⚠️ Could not get queue status, waiting...');
          await this.sleep(this.options.checkInterval!);
          continue;
        }

        // Check if there's work to do
        if (queueStatus.pendingCount === 0 && this.activeProcessing.size === 0) {
          this.log('✅ Queue is empty and no active processing');
          if (this.stats.currentCycle % 10 === 0) {
            console.log(`[${new Date().toLocaleTimeString()}] Queue empty, waiting for new items...`);
          }
          await this.sleep(this.options.checkInterval!);
          continue;
        }

        // Get next items to process
        const nextItems = await this.getNextQueueItems();
        
        if (nextItems.length > 0) {
          this.log(`📦 Starting ${nextItems.length} new processes (${queueStatus.pendingCount} pending)`);
          
          // Start processing items concurrently
          const processingPromises = nextItems.map(item => this.processQueueItem(item));
          
          // Don't wait for completion - let them run in background
          Promise.allSettled(processingPromises).then(results => {
            const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
            const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length;
            this.log(`📊 Batch complete: ${successful} successful, ${failed} failed`);
          });
        }

        // Check for stuck processing items every 5 cycles
        if (this.stats.currentCycle % 5 === 0) {
          const hadStuckItems = await this.checkAndHandleStuckProcessing();
          if (hadStuckItems) {
            console.log(`🔄 Restarting processing after clearing stuck items...`);
          }
        }

        // Display progress every 10 cycles or when requested
        if (this.options.verbose || this.stats.currentCycle % 10 === 0) {
          this.displayProgress();
        }

        // Clear stuck items periodically (less frequent now since we check processing items)
        if (this.stats.currentCycle % 30 === 0) {
          await this.clearStuckItems();
        }

        // If all connections appear stuck (no progress in last 10 cycles), force clear
        if (this.activeProcessing.size === this.options.maxConcurrent && 
            this.stats.currentCycle > 10 &&
            this.stats.totalProcessed === 0) {
          console.log('⚠️ All connections appear stuck, forcing clear...');
          await this.clearStuckItems();
          await this.checkAndHandleStuckProcessing();
          // Reset the processing tracking
          this.activeProcessing.clear();
          this.processingStartTimes.clear();
        }

        // Wait before next cycle
        await this.sleep(this.options.checkInterval!);

      } catch (error) {
        this.log('Error in processing loop:', error);
        await this.sleep(this.options.checkInterval! * 2); // Wait longer on error
      }
    }

    // Wait for all active processing to complete
    console.log('\n🔄 Waiting for active processes to complete...');
    while (this.activeProcessing.size > 0) {
      console.log(`   ${this.activeProcessing.size} processes still running...`);
      await this.sleep(2000);
    }

    // Final stats
    console.log('\n🏁 PROCESSING COMPLETE');
    console.log('═════════════════════');
    this.displayProgress();
    
    const avgReviewsPerBusiness = this.stats.successful > 0 
      ? (this.stats.totalReviewsImported / this.stats.successful).toFixed(1)
      : '0';
    
    console.log(`📈 Average Reviews/Business: ${avgReviewsPerBusiness}`);
    console.log(`⏱️  Processing Rate: ${(this.stats.totalProcessed / ((Date.now() - this.stats.startTime) / 60000)).toFixed(1)} businesses/minute`);
  }

  private log(...args: any[]) {
    if (this.options.verbose) {
      console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Parse command line arguments
function parseArgs(): ProcessorOptions {
  const args = process.argv.slice(2);
  const options: ProcessorOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--max-cycles':
        options.maxCycles = parseInt(args[++i]) || Infinity;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--check-interval':
        options.checkInterval = parseInt(args[++i]) || 5000;
        break;
      case '--help':
        console.log(`
Review Queue Processor - Usage:

Options:
  --max-cycles <number>    Maximum processing cycles before stopping
  --verbose               Enable detailed logging
  --check-interval <ms>   Interval between queue checks (default: 5000ms)
  --help                  Show this help message

Examples:
  npm run process-queue                     # Run continuously
  npm run process-queue -- --verbose       # With detailed logging
  npm run process-queue -- --max-cycles 100 --verbose  # Limited run with logging
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
    const processor = new ReviewQueueProcessor(options);
    await processor.process();
  } catch (error) {
    console.error('❌ Processor error:', error);
    process.exit(1);
  }
}

// ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}