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
  console.log("🔄 Ultra Simple Review Count Sync");
  console.log("=================================\n");
  console.log("This will sync review counts 3 businesses at a time.\n");
  
  let totalUpdated = 0;
  let totalChecked = 0;
  let batchNumber = 0;
  let noUpdatesCount = 0;
  
  try {
    while (true) {
      batchNumber++;
      
      // Process next batch
      const result = await client.mutation(api.syncReviewCountsSimple.syncNextBatch, {});
      
      totalChecked += result.checked;
      totalUpdated += result.updated;
      
      if (result.checked === 0) {
        console.log("\n✅ No more businesses to check!");
        break;
      }
      
      if (result.updated > 0) {
        console.log(`Batch ${batchNumber}: Updated ${result.updated} businesses`);
        for (const detail of result.details) {
          console.log(`  - ${detail.name}: ${detail.oldCount} → ${detail.newCount} reviews`);
        }
        noUpdatesCount = 0;
      } else {
        console.log(`Batch ${batchNumber}: Checked ${result.checked} businesses - all correct`);
        noUpdatesCount++;
      }
      
      // If we've checked many batches without updates, we're probably done
      if (noUpdatesCount >= 10) {
        console.log("\n✅ No updates in last 10 batches - review counts appear to be synced!");
        break;
      }
      
      // Stop after a reasonable number
      if (totalChecked >= 100) {
        console.log(`\n⚠️  Checked ${totalChecked} businesses. Run again to continue.`);
        break;
      }
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`Total businesses checked: ${totalChecked}`);
    console.log(`Total businesses updated: ${totalUpdated}`);
    
  } catch (error: any) {
    if (error.message?.includes('16777216')) {
      console.error("\n❌ Still hitting query limits!");
      console.error("Your database might have too many reviews.");
      console.error("\nTry syncing specific businesses instead:");
      console.error('npm run sync-specific-business "Business Name"');
    } else {
      console.error("❌ Error:", error.message || error);
    }
  }
}

// Run it
syncReviewCounts().then(() => {
  console.log("\n✨ Done!");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});