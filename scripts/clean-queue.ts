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

async function cleanQueue() {
  console.log("🧹 Cleaning Review Sync Queue...\n");
  
  try {
    // First, get current queue status
    const beforeStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Before Cleaning:");
    console.log(`  - Pending: ${beforeStatus.pendingCount}`);
    console.log(`  - Processing: ${beforeStatus.processingCount}\n`);
    
    // Clear stuck items
    console.log("🔄 Clearing stuck items...");
    const stuckResult = await client.mutation(api.geoScraperQueue.clearStuckItems);
    console.log(`  - Cleared ${stuckResult.cleared} stuck items\n`);
    
    // Get businesses that are truly eligible for sync
    console.log("🔍 Finding truly eligible businesses...");
    const eligibleBusinesses = await client.query(api.reviewSync.getBusinessesForSync, {
      limit: 500,
      includeExisting: false,
    });
    
    console.log(`  - Found ${eligibleBusinesses.length} eligible businesses`);
    
    // Check how many are already in queue
    const pendingItems = await client.query(api.geoScraperQueue.getNextQueueItems, {
      limit: 500,
    });
    
    const businessIdsInQueue = new Set(pendingItems.map(item => item.businessId));
    const newBusinesses = eligibleBusinesses.filter(b => !businessIdsInQueue.has(b._id));
    
    console.log(`  - ${newBusinesses.length} are NOT in queue\n`);
    
    if (newBusinesses.length > 0) {
      console.log("➕ Adding new businesses to queue...");
      
      // Add in batches of 50
      const BATCH_SIZE = 50;
      let totalAdded = 0;
      
      for (let i = 0; i < Math.min(newBusinesses.length, 200); i += BATCH_SIZE) {
        const batch = newBusinesses.slice(i, i + BATCH_SIZE);
        
        const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
          businesses: batch.map(b => ({
            businessId: b._id,
            placeId: b.placeId!,
          })),
          priority: 6,
        });
        
        totalAdded += result.added;
        console.log(`  - Batch ${Math.floor(i / BATCH_SIZE) + 1}: Added ${result.added} (${result.existing} already existed)`);
      }
      
      console.log(`\n✅ Total added: ${totalAdded}`);
    }
    
    // Get updated status
    const afterStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("\n📋 After Cleaning:");
    console.log(`  - Pending: ${afterStatus.pendingCount} (${afterStatus.pendingCount - beforeStatus.pendingCount > 0 ? '+' : ''}${afterStatus.pendingCount - beforeStatus.pendingCount})`);
    console.log(`  - Processing: ${afterStatus.processingCount}`);
    
  } catch (error) {
    console.error("❌ Error cleaning queue:", error);
  }
}

// Run the cleaner
cleanQueue();