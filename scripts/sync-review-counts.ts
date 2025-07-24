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

async function syncReviewCounts() {
  console.log("🔄 Starting Review Count Synchronization");
  console.log("======================================\n");
  
  try {
    // First, check the current status
    console.log("📊 Checking current sync status...");
    const status = await client.query(api.syncReviewCounts.getSyncStatus);
    
    console.log(`Sample size: ${status.sampleSize} businesses`);
    console.log(`Correctly synced: ${status.correctCount} (${status.accuracy}%)`);
    console.log(`Need sync: ${status.incorrectCount}`);
    console.log(`Total stored reviews: ${status.totalStoredReviews}`);
    console.log(`Total actual reviews: ${status.totalActualReviews}`);
    console.log(`Discrepancy: ${status.discrepancy}\n`);
    
    if (status.incorrectCount === 0) {
      console.log("✅ All review counts are already synchronized!");
      return;
    }
    
    // Get businesses with mismatched counts
    console.log("🔍 Finding businesses with mismatched review counts...");
    
    // Check mismatches in batches
    let offset = 0;
    let totalMismatches = 0;
    let allMismatches = [];
    let hasMore = true;
    
    while (hasMore && offset < 200) { // Check up to 200 businesses
      const batch = await client.query(api.syncReviewCounts.getBusinessesWithMismatchedCounts, {
        limit: 20,
        offset
      });
      
      totalMismatches += batch.mismatches;
      allMismatches = allMismatches.concat(batch.businesses);
      hasMore = batch.hasMore;
      offset += 20;
      
      if (batch.mismatches > 0) {
        console.log(`  Checked ${offset} businesses, found ${batch.mismatches} mismatches...`);
      }
    }
    
    console.log(`\nFound ${totalMismatches} businesses with incorrect review counts\n`);
    
    if (totalMismatches === 0) {
      console.log("✅ No mismatches found!");
      return;
    }
    
    // Show some examples
    console.log("📋 Examples of mismatches:");
    const examples = allMismatches.slice(0, 5);
    for (const business of examples) {
      console.log(`- ${business.businessName}`);
      console.log(`  Stored: ${business.storedCount}, Actual: ${business.actualCount} (${business.difference > 0 ? '+' : ''}${business.difference})`);
    }
    
    if (allMismatches.length > 5) {
      console.log(`... and ${allMismatches.length - 5} more\n`);
    }
    
    // Ask for confirmation
    console.log("\n⚠️  This will update review counts for all mismatched businesses.");
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Sync in batches
    console.log("🚀 Starting synchronization...\n");
    
    let totalSynced = 0;
    let totalProcessed = 0;
    const batchSize = 10; // Smaller batches to avoid query limits
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const result = await client.mutation(api.syncReviewCounts.syncAllBusinessReviewCounts, {
        batchSize,
        offset
      });
      
      totalSynced += result.updated;
      totalProcessed += result.total;
      
      if (result.total > 0) {
        console.log(`✅ Processed batch ${Math.floor(offset / batchSize) + 1}: ${result.updated}/${result.total} updated`);
        
        // Show details for first batch
        if (offset === 0 && result.details.length > 0) {
          console.log("\nUpdated businesses:");
          for (const detail of result.details.slice(0, 5)) {
            console.log(`- ${detail.businessName}: ${detail.oldCount} → ${detail.newCount} reviews, ${detail.oldRating} → ${detail.newRating} rating`);
          }
          if (result.details.length > 5) {
            console.log(`... and ${result.details.length - 5} more`);
          }
          console.log("");
        }
      }
      
      hasMore = result.hasMore;
      offset = result.nextOffset || offset + batchSize;
      
      if (hasMore) {
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Stop after processing a reasonable number
      if (totalProcessed >= 500) {
        console.log("\n⚠️  Processed 500 businesses. Run the command again to continue with more.");
        break;
      }
    }
    
    console.log(`\n✅ Synchronization complete!`);
    console.log(`Total businesses updated: ${totalSynced}`);
    
    // Check final status
    console.log("\n📊 Final sync status:");
    const finalStatus = await client.query(api.syncReviewCounts.getSyncStatus);
    console.log(`Accuracy: ${finalStatus.accuracy}%`);
    console.log(`Remaining discrepancy: ${finalStatus.discrepancy}`);
    
  } catch (error) {
    console.error("❌ Error syncing review counts:", error);
    process.exit(1);
  }
}

// Run the sync
syncReviewCounts().then(() => {
  console.log("\n✨ Done!");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});