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

async function clearBadReviews() {
  console.log("🧹 Clearing reviews with bad data (Anonymous/Invalid Date)");
  console.log("=====================================================\n");
  
  // Get all reviews for our 9 test businesses
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
  
  console.log(`Found ${businesses.length} businesses to check\n`);
  
  // Clear all reviews for these businesses (easier than selective deletion)
  console.log("🗑️  Clearing all reviews for these businesses...");
  
  await client.mutation(api.reviewImportOptimized.clearReviewsForBusinesses, {
    businessIds: businesses.map(b => b._id)
  });
  
  console.log("✅ Reviews cleared!");
}

async function reimportReviews() {
  console.log("\n\n🔄 Re-importing reviews with fixed data mapping");
  console.log("==============================================\n");
  
  // Get all 9 businesses again
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
  
  const businessData = businesses.map(b => ({
    businessId: b._id,
    placeId: b.placeId!,
    name: b.name
  }));
  
  // Process in batches of 3
  const batchSize = 3;
  let totalImported = 0;
  
  for (let i = 0; i < businessData.length; i += batchSize) {
    const batch = businessData.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}`);
    console.log(`   Businesses: ${batch.map(b => b.name).join(", ")}`);
    
    try {
      const result = await client.action(api.geoScraperAPI.bulkFetchReviews, {
        businesses: batch.map(b => ({
          businessId: b.businessId,
          placeId: b.placeId
        })),
        maxConcurrent: 3
      });
      
      console.log(`   ✅ Imported: ${result.summary.totalImported} reviews (${result.summary.totalSkipped} skipped - no text)`);
      totalImported += result.summary.totalImported;
      
      // Wait between batches
      if (i + batchSize < businessData.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Batch error:`, error);
    }
  }
  
  console.log(`\n✅ Total reviews imported: ${totalImported}`);
}

async function verifyResults() {
  console.log("\n\n🔍 Verifying Fixed Reviews");
  console.log("=========================\n");
  
  // Check a sample business
  const business = await client.query(api.businesses.getBusinessesByPlaceIds, {
    placeIds: ["ChIJwa42GjGtK4cRElGqKAS1OF8"] // Thomas Home Services
  });
  
  if (business.length > 0) {
    const reviews = await client.query(api.businesses.getBusinessReviews, {
      businessId: business[0]._id
    });
    
    console.log(`Sample reviews for ${business[0].name}:`);
    reviews.slice(0, 3).forEach((review: any, index: number) => {
      console.log(`\nReview ${index + 1}:`);
      console.log(`  - User: ${review.userName}`);
      console.log(`  - Date: ${new Date(review.createdAt).toLocaleDateString()}`);
      console.log(`  - Rating: ${review.rating} stars`);
      console.log(`  - Comment: ${review.comment?.substring(0, 100)}...`);
    });
  }
}

async function main() {
  try {
    await clearBadReviews();
    await reimportReviews();
    await verifyResults();
    
    console.log("\n\n✅ Review data fixed! Refresh your business listing page to see the corrected reviews.");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();