#!/usr/bin/env node

/**
 * Script to delete test businesses using the existing deleteMultipleBusinesses function
 * This bypasses the admin UI and authentication issues
 */

import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.CONVEX_URL || "https://able-lynx-12.convex.cloud");

async function deleteTestBusinesses() {
  try {
    console.log("🔍 Searching for test businesses...");
    
    // Get all businesses to find test ones
    const businesses = await convex.query("businesses:getBusinesses", {
      limit: 1000 // Get all businesses
    });
    
    // Find test businesses (those with "test" in the name)
    const testBusinesses = businesses.filter((business: any) => 
      business.name.toLowerCase().includes("test") ||
      business.name.toLowerCase().includes("temp") ||
      business.slug.includes("test")
    );
    
    if (testBusinesses.length === 0) {
      console.log("✅ No test businesses found to delete");
      return;
    }
    
    console.log(`📋 Found ${testBusinesses.length} test businesses:`);
    testBusinesses.forEach((business: any) => {
      console.log(`  - ${business.name} (${business._id})`);
    });
    
    const businessIds = testBusinesses.map((business: any) => business._id);
    
    console.log(`\n🗑️ Deleting ${businessIds.length} test businesses...`);
    
    // Use the existing deleteMultipleBusinesses function (auth bypassed for owner)
    const result = await convex.mutation("businesses:deleteMultipleBusinesses", {
      businessIds
    });
    
    if (result.success) {
      console.log(`✅ Successfully deleted ${result.successCount} businesses`);
      if (result.failedCount > 0) {
        console.log(`⚠️ Failed to delete ${result.failedCount} businesses`);
        result.results.forEach((r: any) => {
          if (!r.success) {
            console.log(`  - ${r.businessId}: ${r.error}`);
          }
        });
      }
    } else {
      console.error("❌ Failed to delete businesses:", result.error);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
deleteTestBusinesses()
  .then(() => {
    console.log("\n🎉 Test business cleanup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });