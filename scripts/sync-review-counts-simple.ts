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

async function syncReviewCountsSimple() {
  console.log("🔄 Simple Review Count Synchronization");
  console.log("=====================================\n");
  
  try {
    // Process in small batches
    const batchSize = 5; // Very small batches to avoid any query limits
    let offset = 0;
    let totalSynced = 0;
    let totalProcessed = 0;
    let continueProcessing = true;
    
    console.log("🚀 Starting synchronization with batch size of", batchSize, "...\n");
    
    while (continueProcessing) {
      console.log(`Processing batch starting at offset ${offset}...`);
      
      const result = await client.mutation(api.syncReviewCounts.syncAllBusinessReviewCounts, {
        batchSize,
        offset
      });
      
      totalSynced += result.updated;
      totalProcessed += result.total;
      
      if (result.updated > 0) {
        console.log(`✅ Updated ${result.updated} businesses in this batch`);
        
        // Show what was updated
        for (const detail of result.details) {
          console.log(`   - ${detail.businessName}: ${detail.oldCount} → ${detail.newCount} reviews`);
        }
      } else if (result.total > 0) {
        console.log(`✓ Checked ${result.total} businesses - all counts were correct`);
      }
      
      // Check if we should continue
      if (!result.hasMore) {
        console.log("\n✅ Reached end of businesses!");
        continueProcessing = false;
      } else {
        offset = result.nextOffset || offset + batchSize;
        
        // Stop after a reasonable number to avoid timeout
        if (totalProcessed >= 100) {
          console.log(`\n⚠️  Processed ${totalProcessed} businesses. Run again to continue.`);
          continueProcessing = false;
        } else {
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`Total businesses processed: ${totalProcessed}`);
    console.log(`Total businesses updated: ${totalSynced}`);
    console.log(`Businesses with correct counts: ${totalProcessed - totalSynced}`);
    
    if (totalSynced > 0) {
      console.log("\n✨ Review counts have been synchronized!");
    } else {
      console.log("\n✅ All review counts were already correct!");
    }
    
  } catch (error) {
    console.error("❌ Error syncing review counts:", error);
    process.exit(1);
  }
}

// Run the sync
syncReviewCountsSimple().then(() => {
  console.log("\n✨ Done!");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});