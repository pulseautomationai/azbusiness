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

async function updatePlatformStats() {
  console.log("🔄 Updating platform statistics...");
  
  try {
    // First, let's rebuild the stats from scratch
    console.log("📊 Rebuilding platform stats from database...");
    const result = await client.mutation(api.platformStats.rebuildStats);
    
    if (result.success) {
      console.log("✅ Platform stats rebuilt successfully!");
      console.log("📈 Updated stats:", result.stats);
    } else {
      console.log("❌ Failed to rebuild platform stats");
    }
    
  } catch (error) {
    console.error("❌ Error updating platform stats:", error);
  }
}

// Run the update
updatePlatformStats();