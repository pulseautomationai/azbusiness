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

async function findZeroReviewBusinesses() {
  console.log("🔍 Finding businesses with zero reviews not in queue...\n");
  
  try {
    // First check queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Current Queue Status:");
    console.log(`  - Pending: ${queueStatus.pendingCount}`);
    console.log(`  - Processing: ${queueStatus.processingCount}`);
    console.log(`  - Queue Depth: ${queueStatus.queueDepth}\n`);
    
    // Find businesses with zero reviews
    const result = await client.query(api.findZeroReviewBusinesses.findBusinessesWithZeroReviews, {
      limit: 500,
      excludeInQueue: true,
    });
    
    console.log("📊 Zero Review Business Stats:");
    console.log(`  - Total with zero reviews: ${result.stats.totalZeroReviews}`);
    console.log(`  - Already in queue: ${result.stats.inQueue}`);
    console.log(`  - Available to add: ${result.stats.available}`);
    console.log(`  - Returned: ${result.stats.returned}\n`);
    
    console.log("📈 By Tier:");
    console.log(`  - Power: ${result.stats.byTier.power}`);
    console.log(`  - Pro: ${result.stats.byTier.pro}`);
    console.log(`  - Starter: ${result.stats.byTier.starter}`);
    console.log(`  - Free: ${result.stats.byTier.free}\n`);
    
    // Show some examples
    if (result.businesses.length > 0) {
      console.log("🏢 Sample businesses found:");
      result.businesses.slice(0, 10).forEach((business, index) => {
        console.log(`${index + 1}. ${business.name}`);
        console.log(`   - City: ${business.city}`);
        console.log(`   - Plan: ${business.planTier || 'free'}`);
        console.log(`   - Review Count: ${business.reviewCount || 0}`);
        console.log(`   - Place ID: ${business.placeId}`);
      });
    }
    
    // Check for never-synced businesses
    console.log("\n🆕 Checking for never-synced businesses...");
    const neverSynced = await client.query(api.findZeroReviewBusinesses.findNeverSyncedBusinesses, {
      limit: 100,
    });
    
    console.log(`Found ${neverSynced.total} businesses that have never been synced`);
    
    // Ask if user wants to add them to queue
    if (result.businesses.length > 0) {
      console.log("\n💡 To add these businesses to the review sync queue:");
      console.log("   Run: npm run schedule-zero-reviews");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the search
findZeroReviewBusinesses();