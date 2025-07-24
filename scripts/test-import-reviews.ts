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

async function testImportForSingleBusiness() {
  console.log("🧪 Testing Review Import for Single Business");
  console.log("===========================================\n");
  
  // Get a test business (Thomas Home Services)
  const placeId = "ChIJwa42GjGtK4cRElGqKAS1OF8";
  
  // Find the business
  const businesses = await client.query(api.businesses.getBusinessesByPlaceIds, {
    placeIds: [placeId]
  });
  
  if (businesses.length === 0) {
    console.error("❌ No business found with Place ID:", placeId);
    return;
  }
  
  const business = businesses[0];
  console.log(`📊 Business: ${business.name}`);
  console.log(`   - ID: ${business._id}`);
  console.log(`   - Place ID: ${business.placeId}`);
  console.log(`   - Current reviews: ${business.reviewCount}`);
  console.log(`   - Current rating: ${business.rating}`);
  
  console.log("\n🔄 Fetching and importing reviews from GEOscraper...");
  
  try {
    const result = await client.action(api.geoScraperAPI.fetchAndImportReviews, {
      businessId: business._id,
      placeId: business.placeId!
    });
    
    if (result.success) {
      console.log("\n✅ Import successful!");
      console.log(`   - Reviews fetched: ${result.fetched}`);
      console.log(`   - Reviews imported: ${result.imported}`);
      console.log(`   - Duplicates skipped: ${result.duplicates}`);
      console.log(`   - Failed: ${result.failed}`);
      
      // Get updated business info
      const updatedBusiness = await client.query(api.businesses.getBusinessById, {
        businessId: business._id
      });
      
      console.log("\n📊 Updated business stats:");
      console.log(`   - Review count: ${updatedBusiness?.reviewCount}`);
      console.log(`   - Rating: ${updatedBusiness?.rating}`);
    } else {
      console.error("❌ Import failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function testBulkImport() {
  console.log("\n\n🧪 Testing Bulk Review Import for Multiple Businesses");
  console.log("====================================================\n");
  
  // Get first 3 businesses
  const placeIds = [
    "ChIJwa42GjGtK4cRElGqKAS1OF8",
    "ChIJf9Q9sLxliogRKiXyA__PqWY",
    "ChIJd13jdi6qK4cRinsG2LYOEVc"
  ];
  
  const businesses = await client.query(api.businesses.getBusinessesByPlaceIds, {
    placeIds
  });
  
  console.log(`📊 Found ${businesses.length} businesses to import reviews for`);
  
  const businessData = businesses.map(b => ({
    businessId: b._id,
    placeId: b.placeId!
  }));
  
  console.log("\n🔄 Starting bulk review import...");
  
  try {
    const result = await client.action(api.geoScraperAPI.bulkFetchReviews, {
      businesses: businessData,
      maxConcurrent: 3
    });
    
    console.log("\n✅ Bulk import completed!");
    console.log("\n📊 Summary:");
    console.log(`   - Total businesses: ${result.summary.totalBusinesses}`);
    console.log(`   - Successful: ${result.summary.successful}`);
    console.log(`   - Failed: ${result.summary.failed}`);
    console.log(`   - Total reviews fetched: ${result.summary.totalFetched}`);
    console.log(`   - Total reviews imported: ${result.summary.totalImported}`);
    console.log(`   - Total duplicates: ${result.summary.totalDuplicates}`);
    
    console.log("\n📋 Details:");
    result.details.forEach((detail: any, i: number) => {
      const business = businesses.find(b => b._id === detail.businessId);
      console.log(`\n${i + 1}. ${business?.name || 'Unknown'}`);
      if (detail.success) {
        console.log(`   ✅ Success: ${detail.imported} imported, ${detail.duplicates} duplicates`);
      } else {
        console.log(`   ❌ Failed: ${detail.error}`);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function main() {
  console.log("🚀 GEOscraper Review Import Test");
  console.log("================================\n");
  
  await testImportForSingleBusiness();
  await testBulkImport();
  
  console.log("\n\n✅ All tests completed!");
  console.log("\nNext steps:");
  console.log("1. Set up scheduled job for regular review syncing");
  console.log("2. Add UI in admin panel for manual review scraping");
  console.log("3. Monitor API usage and costs");
}

main().catch(console.error);