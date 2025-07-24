#!/usr/bin/env node

/**
 * Mass Review Import Scheduler
 * 
 * Intelligently schedules large numbers of businesses for overnight review import.
 * Uses smart filtering to prioritize businesses that need reviews most.
 * 
 * Usage:
 *   npm run mass-schedule                    # Schedule all businesses needing reviews
 *   npm run mass-schedule -- --target 2000  # Target 2000 businesses
 *   npm run mass-schedule -- --min-reviews 0 --max-reviews 50  # Only businesses with 0-50 reviews
 *   npm run mass-schedule -- --verified-only  # Only verified businesses
 *   npm run mass-schedule -- --dry-run      # Show what would be scheduled
 */

import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load environment variables
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

interface MassScheduleOptions {
  target?: number;
  minReviews?: number;
  maxReviews?: number;
  verifiedOnly?: boolean;
  activeOnly?: boolean;
  priority?: number;
  dryRun?: boolean;
  batchSize?: number;
}

interface BusinessCandidate {
  _id: string;
  name: string;
  placeId: string;
  reviewCount: number;
  verified?: boolean;
  city?: string;
  category?: string;
  priority: number;
  reason: string;
}

class MassReviewScheduler {
  private options: MassScheduleOptions;

  constructor(options: MassScheduleOptions = {}) {
    this.options = {
      target: 2000,
      minReviews: 0,
      maxReviews: 100,
      verifiedOnly: false,
      activeOnly: true,
      priority: 5,
      dryRun: false,
      batchSize: 100,
      ...options
    };
  }

  /**
   * Get businesses in batches to avoid memory issues
   */
  private async getAllBusinessesPaginated(): Promise<any[]> {
    const allBusinesses: any[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 100;

    console.log(`📊 Scanning all businesses for review import candidates...`);

    while (hasMore) {
      try {
        // Note: This is a simplified approach. You might need to adjust based on your actual query structure
        const businesses = await client.query(api.businesses.getBusinesses, {
          limit,
          // If your API supports offset, add it here
        });

        if (businesses.length === 0) {
          hasMore = false;
        } else {
          allBusinesses.push(...businesses);
          offset += limit;
          
          // Progress indicator
          if (offset % 500 === 0) {
            console.log(`   Scanned ${offset} businesses...`);
          }
          
          // Safety limit to prevent infinite loops
          if (allBusinesses.length >= 20000) {
            console.log(`⚠️ Reached safety limit of 20,000 businesses`);
            hasMore = false;
          }
        }
      } catch (error) {
        console.error(`Error fetching businesses at offset ${offset}:`, error);
        hasMore = false;
      }
    }

    console.log(`✅ Found ${allBusinesses.length} total businesses`);
    return allBusinesses;
  }

  /**
   * Filter and prioritize businesses for review import
   */
  private filterAndPrioritizeBusinesses(businesses: any[]): BusinessCandidate[] {
    const candidates: BusinessCandidate[] = [];

    for (const business of businesses) {
      // Must have Place ID
      if (!business.placeId) continue;

      // Apply filters
      if (this.options.activeOnly && !business.active) continue;
      if (this.options.verifiedOnly && !business.verified) continue;

      const reviewCount = business.reviewCount || 0;
      
      // Review count filters
      if (reviewCount < this.options.minReviews!) continue;
      if (reviewCount > this.options.maxReviews!) continue;

      // Calculate priority and reason
      let priority = this.options.priority!;
      let reason = "Standard import";

      // High priority: No reviews at all
      if (reviewCount === 0) {
        priority = 8;
        reason = "No reviews - high priority";
      }
      // Medium-high priority: Very few reviews
      else if (reviewCount < 10) {
        priority = 7;
        reason = "Few reviews - medium priority";
      }
      // Medium priority: Some reviews but could use more
      else if (reviewCount < 50) {
        priority = 6;
        reason = "Could use more reviews";
      }
      // Lower priority: Has decent number of reviews
      else {
        priority = 4;
        reason = "Update existing reviews";
      }

      // Boost priority for verified businesses
      if (business.verified) {
        priority = Math.min(priority + 1, 10);
        reason += " (verified)";
      }

      candidates.push({
        _id: business._id,
        name: business.name,
        placeId: business.placeId,
        reviewCount: reviewCount,
        verified: business.verified,
        city: business.city,
        category: business.category?.name || 'Unknown',
        priority,
        reason
      });
    }

    // Sort by priority (high to low) then by review count (low to high)
    candidates.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.reviewCount - b.reviewCount; // Fewer reviews first
    });

    return candidates.slice(0, this.options.target);
  }

  /**
   * Display analysis of candidates
   */
  private analyzeCandiates(candidates: BusinessCandidate[]) {
    console.log(`\n📈 CANDIDATE ANALYSIS:`);
    console.log(`   Total candidates: ${candidates.length}`);

    // By review count
    const noReviews = candidates.filter(c => c.reviewCount === 0).length;
    const fewReviews = candidates.filter(c => c.reviewCount > 0 && c.reviewCount < 10).length;
    const someReviews = candidates.filter(c => c.reviewCount >= 10 && c.reviewCount < 50).length;
    const manyReviews = candidates.filter(c => c.reviewCount >= 50).length;

    console.log(`\n📊 BY REVIEW COUNT:`);
    console.log(`   No reviews (0): ${noReviews}`);
    console.log(`   Few reviews (1-9): ${fewReviews}`);
    console.log(`   Some reviews (10-49): ${someReviews}`);
    console.log(`   Many reviews (50+): ${manyReviews}`);

    // By priority
    const priorityMap = new Map<number, number>();
    candidates.forEach(c => {
      priorityMap.set(c.priority, (priorityMap.get(c.priority) || 0) + 1);
    });

    console.log(`\n🎯 BY PRIORITY:`);
    Array.from(priorityMap.entries())
      .sort(([a], [b]) => b - a)
      .forEach(([priority, count]) => {
        const label = priority >= 8 ? 'High' : priority >= 6 ? 'Medium' : 'Low';
        console.log(`   Priority ${priority} (${label}): ${count}`);
      });

    // By city (top 10)
    const cityMap = new Map<string, number>();
    candidates.forEach(c => {
      const city = c.city || 'Unknown';
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });

    console.log(`\n🏙️  TOP CITIES:`);
    Array.from(cityMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count}`);
      });

    // Estimated processing time
    const avgReviewsPerBusiness = candidates.reduce((sum, c) => sum + c.reviewCount, 0) / candidates.length;
    const avgTimePerBusiness = Math.max(30, Math.min(120, avgReviewsPerBusiness * 2)); // 30-120 seconds
    const totalTimeSeconds = (candidates.length * avgTimePerBusiness) / 3; // 3 concurrent
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);

    console.log(`\n⏱️  PROCESSING ESTIMATES:`);
    console.log(`   Average reviews per business: ${avgReviewsPerBusiness.toFixed(1)}`);
    console.log(`   Estimated processing time: ${hours}h ${minutes}m`);
    console.log(`   Expected new reviews: ${(candidates.length * avgReviewsPerBusiness * 1.5).toLocaleString()}`);
  }

  /**
   * Schedule candidates to the queue
   */
  private async scheduleCandidates(candidates: BusinessCandidate[]) {
    if (this.options.dryRun) {
      console.log(`\n🧪 DRY RUN - Would schedule ${candidates.length} businesses:`);
      candidates.slice(0, 10).forEach((candidate, index) => {
        console.log(`  ${index + 1}. ${candidate.name} (${candidate.city}) - ${candidate.reviewCount} reviews - ${candidate.reason}`);
      });
      if (candidates.length > 10) {
        console.log(`  ... and ${candidates.length - 10} more`);
      }
      return;
    }

    console.log(`\n📅 Scheduling ${candidates.length} businesses to queue...`);

    const batchSize = this.options.batchSize!;
    let totalScheduled = 0;
    let totalExisting = 0;

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(candidates.length / batchSize);

      console.log(`\n📦 Batch ${batchNumber}/${totalBatches} (${batch.length} businesses)`);

      try {
        const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
          businesses: batch.map(c => ({ 
            businessId: c._id, 
            placeId: c.placeId 
          })),
          priority: this.options.priority
        });

        totalScheduled += result.added;
        totalExisting += result.existing;

        console.log(`  ✅ Added: ${result.added}, Already queued: ${result.existing}`);

        // Small delay between batches
        if (i + batchSize < candidates.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`  ❌ Error processing batch ${batchNumber}:`, error);
      }
    }

    console.log(`\n🎉 MASS SCHEDULING COMPLETE:`);
    console.log(`✅ Newly scheduled: ${totalScheduled}`);
    console.log(`📋 Already queued: ${totalExisting}`);
    console.log(`📈 Total candidates: ${candidates.length}`);
    console.log(`🎯 Queue ready for overnight processing!`);
  }

  /**
   * Main scheduling routine
   */
  async schedule() {
    console.log('🚀 Mass Review Import Scheduler');
    console.log('═══════════════════════════════════════');
    
    console.log(`\n⚙️  CONFIGURATION:`);
    console.log(`   Target businesses: ${this.options.target}`);
    console.log(`   Review range: ${this.options.minReviews}-${this.options.maxReviews}`);
    console.log(`   Verified only: ${this.options.verifiedOnly ? 'Yes' : 'No'}`);
    console.log(`   Active only: ${this.options.activeOnly ? 'Yes' : 'No'}`);
    console.log(`   Priority: ${this.options.priority}`);
    console.log(`   Batch size: ${this.options.batchSize}`);
    console.log(`   Dry run: ${this.options.dryRun ? 'Yes' : 'No'}`);

    // Get all businesses
    const allBusinesses = await this.getAllBusinessesPaginated();
    
    if (allBusinesses.length === 0) {
      console.log('❌ No businesses found in database');
      return;
    }

    // Filter and prioritize
    const candidates = this.filterAndPrioritizeBusinesses(allBusinesses);
    
    if (candidates.length === 0) {
      console.log('❌ No businesses match the specified criteria');
      return;
    }

    // Analyze the candidates
    this.analyzeCandiates(candidates);

    // Schedule them
    await this.scheduleCandidates(candidates);
  }
}

// Parse command line arguments
function parseArgs(): MassScheduleOptions {
  const args = process.argv.slice(2);
  const options: MassScheduleOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--target':
        options.target = parseInt(args[++i]) || 2000;
        break;
      case '--min-reviews':
        options.minReviews = parseInt(args[++i]) || 0;
        break;
      case '--max-reviews':
        options.maxReviews = parseInt(args[++i]) || 100;
        break;
      case '--priority':
        const priority = args[++i];
        options.priority = priority === 'high' ? 8 : priority === 'low' ? 3 : parseInt(priority) || 5;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 100;
        break;
      case '--verified-only':
        options.verifiedOnly = true;
        break;
      case '--active-only':
        options.activeOnly = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        console.log(`
Mass Review Import Scheduler - Usage:

Options:
  --target <number>        Target number of businesses to schedule (default: 2000)
  --min-reviews <number>   Minimum reviews a business must have (default: 0)
  --max-reviews <number>   Maximum reviews a business can have (default: 100)
  --priority <level>       Set priority: high(8), medium(5), low(3) (default: 5)  
  --batch-size <number>    Batch size for processing (default: 100)
  --verified-only          Only include verified businesses
  --active-only            Only include active businesses (default: true)
  --dry-run               Show what would be scheduled without doing it
  --help                  Show this help message

Examples:
  npm run mass-schedule                              # Schedule 2000 businesses
  npm run mass-schedule -- --target 5000            # Schedule 5000 businesses
  npm run mass-schedule -- --min-reviews 0 --max-reviews 10  # Only businesses with 0-10 reviews
  npm run mass-schedule -- --verified-only --priority high   # High priority verified businesses
  npm run mass-schedule -- --dry-run                # See what would be scheduled
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
    const scheduler = new MassReviewScheduler(options);
    await scheduler.schedule();
  } catch (error) {
    console.error('❌ Mass scheduler error:', error);
    process.exit(1);
  }
}

// ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}