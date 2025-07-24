/**
 * Script to run the consolidateClaimedToVerified migration
 * This will copy the value from 'claimed' to 'verified' for any businesses
 * that are claimed but not verified
 */

import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Get the Convex URL from environment variable
const convexUrl = process.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error("VITE_CONVEX_URL environment variable is not set");
  process.exit(1);
}

async function runMigration() {
  const client = new ConvexHttpClient(convexUrl);
  
  try {
    console.log("Running consolidateClaimedToVerified migration...");
    
    const result = await client.mutation(api.migrations.consolidateClaimedToVerified, {});
    
    console.log("Migration completed successfully!");
    console.log(`Total businesses: ${result.total}`);
    console.log(`Updated: ${result.updated}`);
    console.log(`Already verified: ${result.alreadyVerified}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();