/**
 * Priority Business Processor for AI Ranking System
 * Processes businesses in smart batches for efficient AI analysis
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

// Priority configuration from MVP plan
const PRIORITY_CATEGORIES = [
  'hvac',           // Year-round demand, high ticket
  'plumbing',       // Emergency services, frequent need  
  'electrical',     // Safety critical, high value
  'landscaping',    // Arizona-specific, recurring
  'roofing'         // Seasonal urgency, large projects
];

const PRIORITY_CITIES = [
  'phoenix',        // 1.6M population
  'scottsdale',     // High income demographics
  'mesa',           // 500K+ population
  'tucson',         // Second largest city
  'chandler'        // Growing tech hub
];

interface ProcessingConfig {
  batchSize: number;
  reviewsPerBusiness: number;
  delayBetweenBatches: number;
  maxConcurrent: number;
  retryAttempts: number;
  adaptiveDelay: boolean;
  minDelay: number;
  maxDelay: number;
  minConfidenceScore: number;
  requireRecentReview: boolean;
  maxProcessingTime: number;
}

const DEFAULT_CONFIG: ProcessingConfig = {
  batchSize: 50,
  reviewsPerBusiness: 100,
  delayBetweenBatches: 2000,
  maxConcurrent: 3,
  retryAttempts: 3,
  adaptiveDelay: true,
  minDelay: 1000,
  maxDelay: 5000,
  minConfidenceScore: 60,
  requireRecentReview: true,
  maxProcessingTime: 300000, // 5 minutes per batch
};

interface ProcessingResult {
  businessId: Id<"businesses">;
  businessName: string;
  status: 'success' | 'failed' | 'skipped';
  reviewsProcessed?: number;
  error?: string;
  processingTime?: number;
}

class PriorityBusinessProcessor {
  private client: ConvexHttpClient;
  private config: ProcessingConfig;
  private results: ProcessingResult[] = [];
  private startTime: number = Date.now();

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.client = new ConvexHttpClient(CONVEX_URL);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async getPriorityBusinesses(params: {
    categories: string[];
    cities: string[];
    tierOrder: string[];
    minReviews: number;
    limit: number;
  }) {
    console.log("🔍 Fetching priority businesses...");
    
    // Get all businesses
    const allBusinesses = await this.client.query(api.businesses.getBusinesses, {
      limit: 10000, // Get all businesses
    });

    // Get categories to map slugs to IDs
    const categories = await this.client.query(api.categories.getCategories);
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat._id]));

    // Filter priority businesses
    const priorityBusinesses = allBusinesses
      .filter(business => {
        // Check category
        const categoryId = business.categoryId;
        const category = categories.find(cat => cat._id === categoryId);
        if (!category || !params.categories.includes(category.slug)) {
          return false;
        }

        // Check city
        const businessCity = business.city.toLowerCase().trim();
        if (!params.cities.includes(businessCity)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by tier priority
        const tierA = a.planTier || 'free';
        const tierB = b.planTier || 'free';
        const tierIndexA = params.tierOrder.indexOf(tierA);
        const tierIndexB = params.tierOrder.indexOf(tierB);
        
        if (tierIndexA !== tierIndexB) {
          return tierIndexA - tierIndexB;
        }

        // Then by review count (if available)
        return 0;
      })
      .slice(0, params.limit);

    console.log(`✅ Found ${priorityBusinesses.length} priority businesses`);
    return priorityBusinesses;
  }

  createSmartBatches<T>(items: T[], batchSize: number = this.config.batchSize): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async adaptiveDelay() {
    if (!this.config.adaptiveDelay) {
      await this.sleep(this.config.delayBetweenBatches);
      return;
    }

    // Calculate delay based on system load (simplified for now)
    const processingRate = this.results.filter(r => r.status === 'success').length / 
                          ((Date.now() - this.startTime) / 1000 / 60); // per minute

    let delay = this.config.minDelay;
    if (processingRate > 10) {
      delay = Math.min(this.config.maxDelay, delay * 1.5);
    }

    await this.sleep(delay);
  }

  async processBatch(businesses: any[]) {
    console.log(`\n📦 Processing batch of ${businesses.length} businesses...`);
    const batchStart = Date.now();
    
    for (const business of businesses) {
      const businessStart = Date.now();
      
      try {
        console.log(`\n🏢 Processing: ${business.name} (${business.city})`);
        
        // Get reviews for this business
        const reviews = await this.client.query(api.gmbReviews.getBusinessReviews, {
          businessId: business._id,
          limit: this.config.reviewsPerBusiness,
        });

        if (reviews.length === 0) {
          this.results.push({
            businessId: business._id,
            businessName: business.name,
            status: 'skipped',
            error: 'No reviews found',
          });
          console.log(`⚠️  Skipped: No reviews found`);
          continue;
        }

        console.log(`📊 Found ${reviews.length} reviews to analyze`);

        // Process reviews with AI analysis
        let successCount = 0;
        let errorCount = 0;

        for (const review of reviews) {
          try {
            // Check if already analyzed
            const existingTags = await this.client.query(api.aiAnalysisTags.getTagsForReview, {
              reviewId: review._id,
            });

            if (existingTags) {
              console.log(`✓ Review already analyzed`);
              successCount++;
              continue;
            }

            // Analyze review
            await this.client.action(api.ai.analyzeReview.analyzeReviewWithAI, {
              reviewId: review._id,
              businessId: business._id,
              reviewText: review.comment || '',
              rating: review.rating,
            });

            successCount++;
            
            // Small delay between reviews to avoid rate limits
            await this.sleep(100);
            
          } catch (error: any) {
            console.error(`❌ Error analyzing review: ${error.message}`);
            errorCount++;
          }
        }

        // Calculate rankings after processing reviews
        console.log(`🎯 Calculating rankings for ${business.name}...`);
        await this.client.mutation(api.rankings.calculateBusinessRankings.updateBusinessRankings, {
          businessId: business._id,
        });

        // Check for achievements
        console.log(`🏆 Detecting achievements...`);
        await this.client.mutation(api.achievements.detectAchievements.detectBusinessAchievements, {
          businessId: business._id,
        });

        this.results.push({
          businessId: business._id,
          businessName: business.name,
          status: 'success',
          reviewsProcessed: successCount,
          processingTime: Date.now() - businessStart,
        });

        console.log(`✅ Completed: ${successCount} reviews processed, ${errorCount} errors`);

      } catch (error: any) {
        console.error(`❌ Failed to process ${business.name}: ${error.message}`);
        this.results.push({
          businessId: business._id,
          businessName: business.name,
          status: 'failed',
          error: error.message,
          processingTime: Date.now() - businessStart,
        });
      }
    }

    const batchTime = Date.now() - batchStart;
    console.log(`\n✅ Batch completed in ${(batchTime / 1000).toFixed(1)}s`);
  }

  async validateRankings() {
    console.log("\n🔍 Validating rankings...");
    
    // Get ranking statistics
    const stats = await this.client.query(api.batchRankingProcessor.getRankingSystemStatus);
    
    console.log(`📊 Ranking Statistics:`);
    console.log(`   - Total businesses: ${stats.system.totalBusinesses}`);
    console.log(`   - Scoring coverage: ${stats.coverage.scoringCoverage}%`);
    console.log(`   - Average score: ${stats.coverage.avgScore.toFixed(1)}`);
    console.log(`   - Score range: ${stats.coverage.minScore.toFixed(1)} - ${stats.coverage.maxScore.toFixed(1)}`);
    
    return {
      isValid: stats.coverage.scoringCoverage > 0,
      coverage: stats.coverage.scoringCoverage,
      avgScore: stats.coverage.avgScore,
    };
  }

  generateProgressReport() {
    const totalTime = (Date.now() - this.startTime) / 1000 / 60; // minutes
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    
    console.log("\n📊 Processing Report");
    console.log("===================");
    console.log(`Total businesses: ${this.results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log(`⏱️  Total time: ${totalTime.toFixed(1)} minutes`);
    console.log(`⚡ Average time per business: ${((totalTime * 60) / this.results.length).toFixed(1)}s`);
    
    if (failed > 0) {
      console.log("\n❌ Failed businesses:");
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`   - ${r.businessName}: ${r.error}`);
        });
    }
    
    return {
      total: this.results.length,
      successful,
      failed,
      skipped,
      totalTimeMinutes: totalTime,
      avgTimePerBusiness: (totalTime * 60) / this.results.length,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  console.log("🚀 AI Ranking System - Priority Business Processor");
  console.log("=================================================\n");

  if (!CONVEX_URL || CONVEX_URL.includes("YOUR_CONVEX_URL")) {
    console.error("❌ CONVEX_URL environment variable not set");
    console.log("Please set CONVEX_URL in your .env file\n");
    return;
  }

  const processor = new PriorityBusinessProcessor({
    batchSize: 10, // Start with smaller batches for testing
    reviewsPerBusiness: 50, // Limit reviews for initial processing
  });

  try {
    // Phase 1: Get priority businesses
    const businesses = await processor.getPriorityBusinesses({
      categories: PRIORITY_CATEGORIES,
      cities: PRIORITY_CITIES,
      tierOrder: ['power', 'pro', 'starter', 'free'],
      minReviews: 20,
      limit: 100, // Start with first 100
    });

    if (businesses.length === 0) {
      console.log("⚠️  No priority businesses found matching criteria");
      return;
    }

    // Phase 2: Process in batches
    const batches = processor.createSmartBatches(businesses);
    console.log(`\n📋 Processing ${businesses.length} businesses in ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      console.log(`\n========== Batch ${i + 1} of ${batches.length} ==========`);
      await processor.processBatch(batches[i]);
      
      if (i < batches.length - 1) {
        await processor.adaptiveDelay();
      }
    }

    // Phase 3: Validate results
    const validation = await processor.validateRankings();
    
    // Phase 4: Generate report
    const report = processor.generateProgressReport();
    
    console.log("\n✅ Processing complete!");
    console.log(`🎯 Ranking coverage: ${validation.coverage}%`);
    
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PriorityBusinessProcessor };