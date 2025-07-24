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

async function importAllReviews() {
  console.log("🚀 Importing Reviews for All 9 Businesses");
  console.log("=========================================\n");
  
  // Get all 9 businesses
  const placeIds = [
    "ChIJwa42GjGtK4cRElGqKAS1OF8", // Thomas Home Services
    "ChIJf9Q9sLxliogRKiXyA__PqWY", // Chandler Heating & Cooling Pros
    "ChIJd13jdi6qK4cRinsG2LYOEVc", // Steve's Ultimate Air
    "ChIJ95Y8rQ0-ZwARn02dfZYlmPg", // Aragon Mechanical
    "ChIJcfpPWcipK4cRUD0RSG8be_w", // newACunit
    "ChIJV9iK6xNpK4cR74-P8V9Mriw", // Airpex
    "ChIJy93nWc2uK4cRgeH9Ay945Cc", // Ken Muncy
    "ChIJacPV3xGI9kgRJJ3i_3FLjus", // Rush HVAC
    "ChIJJxonw86pK4cRf16wbhB5YUo"  // Air Command
  ];
  
  const businesses = await client.query(api.businesses.getBusinessesByPlaceIds, {
    placeIds
  });
  
  console.log(`📊 Found ${businesses.length} businesses to import reviews for\n`);
  
  // Process in batches of 3 (respecting GEOscraper's limit)
  const businessData = businesses.map(b => ({
    businessId: b._id,
    placeId: b.placeId!,
    name: b.name
  }));
  
  const batchSize = 3;
  let totalImported = 0;
  let totalDuplicates = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < businessData.length; i += batchSize) {
    const batch = businessData.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(businessData.length / batchSize)}`);
    console.log(`   Businesses: ${batch.map(b => b.name).join(", ")}`);
    
    try {
      const result = await client.action(api.geoScraperAPI.bulkFetchReviews, {
        businesses: batch.map(b => ({
          businessId: b.businessId,
          placeId: b.placeId
        })),
        maxConcurrent: 3
      });
      
      console.log(`   ✅ Batch completed:`);
      console.log(`      - Reviews imported: ${result.summary.totalImported}`);
      console.log(`      - Duplicates: ${result.summary.totalDuplicates}`);
      console.log(`      - Failed: ${result.summary.failed}`);
      
      totalImported += result.summary.totalImported;
      totalDuplicates += result.summary.totalDuplicates;
      totalFailed += result.summary.failed;
      
      // Show individual results
      result.details.forEach((detail: any) => {
        const business = businesses.find(b => b._id === detail.businessId);
        if (detail.success) {
          console.log(`      ✅ ${business?.name}: ${detail.imported} new, ${detail.duplicates} duplicates`);
        } else {
          console.log(`      ❌ ${business?.name}: ${detail.error}`);
        }
      });
      
      // Wait a bit between batches to be respectful
      if (i + batchSize < businessData.length) {
        console.log("\n⏳ Waiting 2 seconds before next batch...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Batch error:`, error);
      totalFailed += batch.length;
    }
  }
  
  console.log("\n\n📊 FINAL SUMMARY");
  console.log("================");
  console.log(`Total businesses processed: ${businesses.length}`);
  console.log(`Total reviews imported: ${totalImported}`);
  console.log(`Total duplicates skipped: ${totalDuplicates}`);
  console.log(`Total failed: ${totalFailed}`);
  console.log(`\n✅ Import completed!`);
  
  // Check final state
  console.log("\n📋 Final Review Counts:");
  for (const business of businesses) {
    const reviews = await client.query(api.businesses.getBusinessReviews, {
      businessId: business._id
    });
    
    // Get updated business info
    const updatedBusiness = await client.query(api.businesses.getBusinessById, {
      businessId: business._id
    });
    
    console.log(`${business.name}:`);
    console.log(`   - Reviews: ${reviews?.length || 0} (was ${business.reviewCount})`);
    console.log(`   - Rating: ${updatedBusiness?.rating || 0} (was ${business.rating})`);
  }
}

async function main() {
  try {
    await importAllReviews();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();