#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Get Convex URL
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL not found");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function syncReviewCountsBatch() {
  console.log("🔄 Batch Review Count Synchronization");
  console.log("====================================\n");
  
  try {
    // First check if we need to sync
    console.log("🔍 Checking for mismatches...");
    const check = await client.query(api.syncReviewCountsBatch.checkForMismatches, {
      sampleSize: 20
    });
    
    if (!check.hasMismatches) {
      console.log("✅ Sample check shows review counts are synchronized!");
      return;
    }
    
    console.log(`⚠️  Found mismatches in sample of ${check.sampleSize} businesses\n`);
    
    // Process businesses in batches
    let skipCount = 0;
    let totalSynced = 0;
    let totalProcessed = 0;
    let batchNumber = 0;
    const batchSize = 5; // Very small batches
    
    console.log("🚀 Starting synchronization...\n");
    
    while (true) {
      batchNumber++;
      
      // Get next batch of business IDs
      const batch = await client.query(api.syncReviewCountsBatch.getBusinessIdBatch, {
        batchSize,
        skipCount
      });
      
      if (batch.error) {
        console.error(`\n❌ Error: ${batch.error}`);
        break;
      }
      
      if (!batch.businessIds || batch.businessIds.length === 0) {
        console.log("\n✅ No more businesses to process!");
        break;
      }
      
      // Sync this batch
      const result = await client.mutation(api.syncReviewCountsBatch.syncBusinessBatch, {
        businessIds: batch.businessIds
      });
      
      totalProcessed += result.total;
      totalSynced += result.updated;
      
      if (result.updated > 0) {
        console.log(`Batch ${batchNumber}: Updated ${result.updated}/${result.total} businesses`);
        
        // Show details
        for (const detail of result.details) {
          console.log(`  - ${detail.businessName}: ${detail.oldCount} → ${detail.newCount} reviews`);
        }
      } else {
        console.log(`Batch ${batchNumber}: Checked ${result.total} businesses - all correct`);
      }
      
      // Update skip count for next batch
      skipCount = batch.nextSkipCount || skipCount + batchSize;
      
      if (!batch.hasMore) {
        console.log("\n✅ Reached end of all businesses!");
        break;
      }
      
      // Stop after processing a reasonable number
      if (totalProcessed >= 100) {
        console.log(`\n⚠️  Processed ${totalProcessed} businesses.`);
        console.log(`To continue, run the command again.`);
        break;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`Total businesses processed: ${totalProcessed}`);
    console.log(`Total businesses updated: ${totalSynced}`);
    console.log(`Businesses already correct: ${totalProcessed - totalSynced}`);
    
    if (totalSynced > 0) {
      console.log("\n✨ Review counts have been synchronized!");
    }
    
  } catch (error: any) {
    // Check if it's a query limit error
    if (error.message?.includes('limit') && error.message?.includes('16777216')) {
      console.error("\n❌ Query limit error detected!");
      console.error("The database query is too large. This usually means:");
      console.error("- Too many businesses in the database");
      console.error("- Too many reviews to count at once");
      console.error("\nTry syncing a specific business instead:");
      console.error('npm run sync-specific-business "Business Name"');
    } else {
      console.error("❌ Error syncing review counts:", error);
    }
    process.exit(1);
  }
}

// Run the sync
syncReviewCountsBatch().then(() => {
  console.log("\n✨ Done!");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});