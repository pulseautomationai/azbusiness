#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Missing VITE_CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function analyzeQueue() {
  console.log("🔍 Analyzing Review Sync Queue...\n");
  
  try {
    // Get queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Queue Overview:");
    console.log(`  - Pending: ${queueStatus.pendingCount}`);
    console.log(`  - Processing: ${queueStatus.processingCount}`);
    console.log(`  - Recent Completed: ${queueStatus.recentCompleted}`);
    console.log(`  - Recent Failed: ${queueStatus.recentFailed}\n`);
    
    // Get pending items to analyze
    const pendingItems = await client.query(api.geoScraperQueue.getNextQueueItems, {
      limit: 100,
    });
    
    console.log(`📊 Analyzing ${pendingItems.length} pending items...\n`);
    
    // Get business details for sample items
    const businessMap = new Map();
    
    // Get details for first few businesses to avoid too many queries
    for (let i = 0; i < Math.min(10, pendingItems.length); i++) {
      try {
        const business = await client.query(api.businesses.getBusinessById, {
          businessId: pendingItems[i].businessId,
        });
        if (business) {
          businessMap.set(business._id, business);
        }
      } catch (error) {
        // Skip if business not found
      }
    }
    
    // Analyze the queue
    const stats = {
      byPriority: {} as Record<number, number>,
      byRetryCount: {} as Record<number, number>,
      withErrors: 0,
      byPlanTier: {
        power: 0,
        pro: 0,
        starter: 0,
        free: 0,
      },
      byReviewCount: {
        zero: 0,
        low: 0,  // 1-10
        medium: 0, // 11-50
        high: 0,  // 50+
      },
      oldestRequest: Infinity,
      newestRequest: 0,
    };
    
    for (const item of pendingItems) {
      // Priority stats
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
      
      // Retry stats
      stats.byRetryCount[item.retryCount] = (stats.byRetryCount[item.retryCount] || 0) + 1;
      
      // Error stats
      if (item.lastError) {
        stats.withErrors++;
      }
      
      // Time stats
      if (item.requestedAt < stats.oldestRequest) {
        stats.oldestRequest = item.requestedAt;
      }
      if (item.requestedAt > stats.newestRequest) {
        stats.newestRequest = item.requestedAt;
      }
      
      // Business stats
      const business = businessMap.get(item.businessId);
      if (business) {
        const tier = business.planTier || 'free';
        if (tier in stats.byPlanTier) {
          stats.byPlanTier[tier as keyof typeof stats.byPlanTier]++;
        }
        
        const reviewCount = business.reviewCount || 0;
        if (reviewCount === 0) {
          stats.byReviewCount.zero++;
        } else if (reviewCount <= 10) {
          stats.byReviewCount.low++;
        } else if (reviewCount <= 50) {
          stats.byReviewCount.medium++;
        } else {
          stats.byReviewCount.high++;
        }
      }
    }
    
    // Display results
    console.log("⏱️ Queue Age:");
    console.log(`  - Oldest item: ${new Date(stats.oldestRequest).toLocaleString()}`);
    console.log(`  - Newest item: ${new Date(stats.newestRequest).toLocaleString()}`);
    console.log(`  - Age span: ${Math.round((stats.newestRequest - stats.oldestRequest) / (1000 * 60 * 60))} hours\n`);
    
    console.log("🎯 By Priority:");
    Object.entries(stats.byPriority)
      .sort(([a], [b]) => Number(b) - Number(a))
      .forEach(([priority, count]) => {
        console.log(`  - Priority ${priority}: ${count} items`);
      });
    
    console.log("\n🔄 By Retry Count:");
    Object.entries(stats.byRetryCount)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([retries, count]) => {
        console.log(`  - ${retries} retries: ${count} items`);
      });
    console.log(`  - With errors: ${stats.withErrors} items`);
    
    console.log("\n💳 By Plan Tier:");
    console.log(`  - Power: ${stats.byPlanTier.power}`);
    console.log(`  - Pro: ${stats.byPlanTier.pro}`);
    console.log(`  - Starter: ${stats.byPlanTier.starter}`);
    console.log(`  - Free: ${stats.byPlanTier.free}`);
    
    console.log("\n📊 By Review Count:");
    console.log(`  - Zero reviews: ${stats.byReviewCount.zero}`);
    console.log(`  - Low (1-10): ${stats.byReviewCount.low}`);
    console.log(`  - Medium (11-50): ${stats.byReviewCount.medium}`);
    console.log(`  - High (50+): ${stats.byReviewCount.high}`);
    
    // Show some examples
    console.log("\n🏢 Sample businesses in queue:");
    for (let i = 0; i < Math.min(5, pendingItems.length); i++) {
      const item = pendingItems[i];
      const business = businessMap.get(item.businessId);
      if (business) {
        console.log(`${i + 1}. ${business.name}`);
        console.log(`   - Reviews: ${business.reviewCount || 0}`);
        console.log(`   - Priority: ${item.priority}`);
        console.log(`   - Retries: ${item.retryCount}`);
        if (item.lastError) {
          console.log(`   - Last error: ${item.lastError}`);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error analyzing queue:", error);
  }
}

// Run the analysis
analyzeQueue();