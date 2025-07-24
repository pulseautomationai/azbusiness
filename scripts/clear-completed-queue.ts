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

// Add function to clear old completed items
async function clearCompletedQueue() {
  console.log("🧹 Clearing completed queue items...\n");
  
  try {
    // First clear stuck items
    console.log("🔄 Clearing stuck items...");
    const stuckResult = await client.mutation(api.geoScraperQueue.clearStuckItems);
    console.log(`  - Cleared ${stuckResult.cleared} stuck items\n`);
    
    // Get queue status
    const beforeStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Queue Status:");
    console.log(`  - Pending: ${beforeStatus.pendingCount}`);
    console.log(`  - Processing: ${beforeStatus.processingCount}`);
    console.log(`  - Recent Completed: ${beforeStatus.recentCompleted}`);
    console.log(`  - Recent Failed: ${beforeStatus.recentFailed}\n`);
    
    // Note: Convex doesn't have a built-in way to delete completed items
    // but they shouldn't interfere with new additions
    
    console.log("💡 Tips to add more businesses:");
    console.log("1. Failed items will retry automatically (up to 3 times)");
    console.log("2. Completed items don't block new additions");
    console.log("3. Look for businesses in smaller cities");
    console.log("4. Target businesses with specific characteristics (e.g., specific categories)");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the cleaner
clearCompletedQueue();