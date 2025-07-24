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

async function findUnreviewedBusinesses() {
  console.log("🔍 Finding businesses with no reviews...\n");
  
  try {
    // First check queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Current Queue Status:");
    console.log(`  - Pending: ${queueStatus.pendingCount}`);
    console.log(`  - Processing: ${queueStatus.processingCount}`);
    console.log(`  - Queue Depth: ${queueStatus.queueDepth}\n`);
    
    // Get businesses for sync (which includes never-synced businesses)
    console.log("🔍 Finding businesses that need syncing...");
    const businesses = await client.query(api.reviewSync.getBusinessesForSync, {
      limit: 500,
      includeExisting: false, // Only get businesses without recent sync
    });
    
    console.log(`📊 Found ${businesses.length} businesses eligible for sync`);
    
    // Analyze the businesses
    const stats = {
      total: businesses.length,
      neverSynced: 0,
      zeroReviews: 0,
      byTier: {
        power: 0,
        pro: 0,
        starter: 0,
        free: 0,
      },
      byCityPrefix: {} as Record<string, number>,
    };
    
    const neverSyncedBusinesses = [];
    const zeroReviewBusinesses = [];
    
    for (const business of businesses) {
      // Check if never synced
      if (!business.lastReviewSync) {
        stats.neverSynced++;
        neverSyncedBusinesses.push(business);
      }
      
      // Check if zero reviews
      if (!business.reviewCount || business.reviewCount === 0) {
        stats.zeroReviews++;
        zeroReviewBusinesses.push(business);
      }
      
      // Count by tier
      const tier = business.planTier || 'free';
      if (tier in stats.byTier) {
        stats.byTier[tier as keyof typeof stats.byTier]++;
      }
      
      // Count by city prefix (first letter)
      const cityPrefix = business.city ? business.city[0].toUpperCase() : 'Unknown';
      stats.byCityPrefix[cityPrefix] = (stats.byCityPrefix[cityPrefix] || 0) + 1;
    }
    
    console.log("\n📈 Statistics:");
    console.log(`  - Never synced: ${stats.neverSynced}`);
    console.log(`  - Zero reviews: ${stats.zeroReviews}`);
    console.log(`\n  By Tier:`);
    console.log(`    - Power: ${stats.byTier.power}`);
    console.log(`    - Pro: ${stats.byTier.pro}`);
    console.log(`    - Starter: ${stats.byTier.starter}`);
    console.log(`    - Free: ${stats.byTier.free}`);
    
    console.log(`\n  By City Prefix:`);
    const sortedCityPrefixes = Object.entries(stats.byCityPrefix)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 10);
    for (const [prefix, count] of sortedCityPrefixes) {
      console.log(`    - ${prefix}: ${count}`);
    }
    
    // Show some examples of never-synced businesses
    if (neverSyncedBusinesses.length > 0) {
      console.log("\n🆕 Sample never-synced businesses:");
      neverSyncedBusinesses.slice(0, 5).forEach((business, index) => {
        console.log(`${index + 1}. ${business.name}`);
        console.log(`   - City: ${business.city}`);
        console.log(`   - Plan: ${business.planTier || 'free'}`);
        console.log(`   - Reviews: ${business.reviewCount || 0}`);
      });
    }
    
    // Show some zero-review businesses
    if (zeroReviewBusinesses.length > 0) {
      console.log("\n📭 Sample zero-review businesses:");
      zeroReviewBusinesses.slice(0, 5).forEach((business, index) => {
        console.log(`${index + 1}. ${business.name}`);
        console.log(`   - City: ${business.city}`);
        console.log(`   - Plan: ${business.planTier || 'free'}`);
      });
    }
    
    // Provide next steps
    console.log("\n💡 Next Steps:");
    console.log("1. To add ALL these businesses to queue:");
    console.log("   npm run mass-schedule");
    console.log("\n2. To add a specific number (e.g., 200):");
    console.log("   npm run schedule-reviews 200");
    console.log("\n3. To process the queue:");
    console.log("   npm run process-queue");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the search
findUnreviewedBusinesses();