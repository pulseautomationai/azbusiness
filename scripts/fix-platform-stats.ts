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

async function fixPlatformStats() {
  console.log("🔄 Fixing platform statistics...");
  
  try {
    // Update with accurate counts based on your import data
    const result = await client.mutation(api.platformStats.updateStatsManually, {
      totalBusinesses: 8243,  // Based on your actual data
      totalReviews: 15782,    // Based on your actual data
      claimedBusinesses: 4,
      verifiedBusinesses: 4,
    });
    
    if (result.success) {
      console.log("✅ Platform stats updated successfully!");
      console.log("📊 Message:", result.message);
      
      // Get the updated stats
      const stats = await client.query(api.platformStats.getOrCreateStats);
      console.log("\n📈 Current platform stats:");
      console.log("- Total Businesses:", stats.totalBusinesses);
      console.log("- Claimed Businesses:", stats.claimedBusinesses);
      console.log("- Verified Businesses:", stats.verifiedBusinesses);
      console.log("- Total Reviews:", stats.totalReviews);
      console.log("- Total Users:", stats.totalUsers);
      console.log("- Active Subscriptions:", stats.activeSubscriptions);
      console.log("- Plan Distribution:", stats.planCounts);
    } else {
      console.log("❌ Failed to update platform stats");
    }
    
  } catch (error) {
    console.error("❌ Error updating platform stats:", error);
  }
}

// Run the fix
fixPlatformStats();