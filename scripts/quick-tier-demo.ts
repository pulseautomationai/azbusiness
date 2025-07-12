// Quick script to update business tiers for demo
// Run with: npx tsx scripts/quick-tier-demo.ts

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function updateBusinessToDemo() {
  try {
    console.log("🔍 Finding businesses to demo...");
    
    // Get first few businesses
    const businesses = await client.query(api.businesses.getBusinesses, { limit: 3 });
    
    if (businesses.length === 0) {
      console.log("❌ No businesses found. Please import some first with 'npm run import-csv'");
      return;
    }

    console.log(`Found ${businesses.length} businesses`);

    // Update first business to PRO
    if (businesses[0]) {
      await client.mutation(api.businesses.updateBusiness, {
        businessId: businesses[0]._id,
        updates: {
          planTier: "pro",
          claimed: true,
          verified: true,
          priority: 5
        }
      });
      
      const proUrl = `/hvac-services/phoenix/${businesses[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      console.log(`✅ Updated ${businesses[0].name} to PRO tier`);
      console.log(`🔗 PRO Demo: http://localhost:5173${proUrl}`);
    }

    // Update second business to POWER (if available)
    if (businesses[1]) {
      await client.mutation(api.businesses.updateBusiness, {
        businessId: businesses[1]._id,
        updates: {
          planTier: "power",
          claimed: true,
          verified: true,
          featured: true,
          priority: 10
        }
      });
      
      const powerUrl = `/hvac-services/phoenix/${businesses[1].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      console.log(`✅ Updated ${businesses[1].name} to POWER tier`);
      console.log(`🔗 POWER Demo: http://localhost:5173${powerUrl}`);
    }

    // Keep third business as FREE for comparison
    if (businesses[2]) {
      const freeUrl = `/hvac-services/phoenix/${businesses[2].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      console.log(`✅ ${businesses[2].name} remains FREE tier`);
      console.log(`🔗 FREE Demo: http://localhost:5173${freeUrl}`);
    }

    console.log("\n🎉 Demo setup complete!");
    console.log("\nYou now have:");
    console.log("📱 FREE tier - Basic features with upgrade prompts");
    console.log("✨ PRO tier - Full contact forms, analytics, enhanced content");
    console.log("⚡ POWER tier - Complete AI suite and advanced features");
    
  } catch (error) {
    console.error("❌ Error updating businesses:", error);
  }
}

updateBusinessToDemo();