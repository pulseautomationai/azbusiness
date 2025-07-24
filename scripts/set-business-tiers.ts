#!/usr/bin/env npx tsx
/**
 * Set Business Tiers for Testing
 * Updates businesses to different tier levels to test ranking display
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Test business configurations
const TEST_BUSINESSES = [
  {
    name: "Enviro Tech Pest Control",
    city: "Paradise Valley",
    newTier: "power"
  },
  {
    name: "Cummings Termite & Pest",
    city: "Carefree", 
    newTier: "pro"
  },
  {
    name: "Maximum Exterminating Inc. since 1996",
    city: "Carefree",
    newTier: "starter"
  }
];

async function setBusinessTiers() {
  console.log("🎯 Setting Business Tiers for Testing");
  console.log("===================================\n");

  try {
    // Get all businesses
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 500
    });

    console.log(`Found ${businesses.length} total businesses\n`);

    // Update each test business
    for (const testBiz of TEST_BUSINESSES) {
      const business = businesses.find(b => 
        b.name === testBiz.name && b.city === testBiz.city
      );

      if (business) {
        console.log(`📊 Updating ${business.name} (${business.city})`);
        console.log(`   Current tier: ${business.planTier || 'free'}`);
        console.log(`   New tier: ${testBiz.newTier}`);
        
        try {
          await client.mutation(api.businesses.updateBusinessTier, {
            businessId: business._id,
            planTier: testBiz.newTier as any
          });
          
          console.log(`   ✅ Successfully updated to ${testBiz.newTier}\n`);
        } catch (error) {
          console.error(`   ❌ Failed to update: ${error}\n`);
        }
      } else {
        console.log(`❌ Could not find: ${testBiz.name} in ${testBiz.city}\n`);
      }
    }

    console.log("\n✨ Tier updates complete!");
    console.log("\nNext steps:");
    console.log("1. Run the ranking calculation");
    console.log("2. Check the dashboard for achievement visibility");
    console.log("3. View homepage rankings to see tier effects");

  } catch (error) {
    console.error("❌ Error setting business tiers:", error);
    process.exit(1);
  }
}

// Run the script
setBusinessTiers().then(() => {
  console.log("\n✅ Script completed successfully");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});