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

// The 9 Place IDs from our test
const TEST_PLACE_IDS = [
  { placeId: "ChIJwa42GjGtK4cRElGqKAS1OF8", name: "Thomas Home Services", expectedReviews: 11 },
  { placeId: "ChIJf9Q9sLxliogRKiXyA__PqWY", name: "Chandler Heating & Cooling Pros", expectedReviews: 11 },
  { placeId: "ChIJd13jdi6qK4cRinsG2LYOEVc", name: "Steve's Ultimate Air Heating & Cooling Services LLC", expectedReviews: 11 },
  { placeId: "ChIJ95Y8rQ0-ZwARn02dfZYlmPg", name: "Aragon Mechanical LLC", expectedReviews: 11 },
  { placeId: "ChIJcfpPWcipK4cRUD0RSG8be_w", name: "newACunit", expectedReviews: 11 },
  { placeId: "ChIJV9iK6xNpK4cR74-P8V9Mriw", name: "Airpex Cooling Heating and Plumbing Inc.", expectedReviews: 11 },
  { placeId: "ChIJy93nWc2uK4cRgeH9Ay945Cc", name: "Ken Muncy Air Conditioning", expectedReviews: 11 },
  { placeId: "ChIJacPV3xGI9kgRJJ3i_3FLjus", name: "Rush HVAC LLC", expectedReviews: 6 },
  { placeId: "ChIJJxonw86pK4cRf16wbhB5YUo", name: "Air Command Heating & Cooling", expectedReviews: 11 }
];

async function checkReviewCounts() {
  console.log("🔍 Checking Review Counts for All 9 Businesses");
  console.log("==============================================\n");
  
  let totalExpected = 0;
  let totalActual = 0;
  let businessesWithReviews = 0;
  let businessesMissing = 0;
  
  for (const testBusiness of TEST_PLACE_IDS) {
    totalExpected += testBusiness.expectedReviews;
    
    // Find the business
    const businesses = await client.query(api.businesses.getBusinessesByPlaceIds, {
      placeIds: [testBusiness.placeId]
    });
    
    if (businesses.length === 0) {
      console.log(`❌ ${testBusiness.name}`);
      console.log(`   - Status: NOT FOUND IN DATABASE`);
      console.log(`   - Expected reviews: ${testBusiness.expectedReviews}`);
      console.log(`   - Place ID: ${testBusiness.placeId}\n`);
      businessesMissing++;
      continue;
    }
    
    const business = businesses[0];
    
    // Get actual reviews
    const reviews = await client.query(api.businesses.getBusinessReviews, {
      businessId: business._id
    });
    
    const actualReviews = reviews?.length || 0;
    totalActual += actualReviews;
    
    const status = actualReviews === testBusiness.expectedReviews ? "✅" : 
                   actualReviews > 0 ? "⚠️" : "❌";
    
    if (actualReviews > 0) businessesWithReviews++;
    
    console.log(`${status} ${business.name}`);
    console.log(`   - Business ID: ${business._id}`);
    console.log(`   - Review Count (stored): ${business.reviewCount}`);
    console.log(`   - Review Count (actual): ${actualReviews}`);
    console.log(`   - Expected: ${testBusiness.expectedReviews}`);
    console.log(`   - Rating: ${business.rating}`);
    if (business.reviewCount !== actualReviews) {
      console.log(`   - ⚠️  MISMATCH: Stored count (${business.reviewCount}) ≠ Actual count (${actualReviews})`);
    }
    console.log("");
  }
  
  console.log("\n📊 SUMMARY");
  console.log("==========");
  console.log(`Total businesses checked: ${TEST_PLACE_IDS.length}`);
  console.log(`Businesses found: ${TEST_PLACE_IDS.length - businessesMissing}`);
  console.log(`Businesses missing: ${businessesMissing}`);
  console.log(`Businesses with reviews: ${businessesWithReviews}`);
  console.log(`Total expected reviews: ${totalExpected}`);
  console.log(`Total actual reviews: ${totalActual}`);
  console.log(`Missing reviews: ${totalExpected - totalActual}`);
  
  if (totalActual < totalExpected) {
    console.log("\n⚠️  ISSUES DETECTED:");
    console.log("1. Not all reviews were imported successfully");
    console.log("2. You may need to re-run the import for businesses with 0 reviews");
    console.log("3. Check if the businesses have the correct placeId field set");
  }
}

async function checkAllReviews() {
  console.log("\n\n🔍 Checking All Reviews in Database");
  console.log("===================================\n");
  
  // This is a simple check - in production you might want to paginate
  try {
    const reviewStats = await client.query(api.reviewImportOptimized.getImportStats);
    console.log(`Total reviews in database: ${reviewStats.totalReviews}`);
    console.log(`Total businesses in database: ${reviewStats.totalBusinesses}`);
    console.log(`Average reviews per business: ${reviewStats.averageReviewsPerBusiness}`);
    console.log(`Businesses with reviews: ${reviewStats.sampleStats.percentageWithReviews}% (sample of ${reviewStats.sampleStats.businessesChecked})`);
  } catch (error) {
    console.error("Error getting review stats:", error);
  }
}

async function main() {
  await checkReviewCounts();
  await checkAllReviews();
  
  console.log("\n\n💡 NEXT STEPS:");
  console.log("==============");
  console.log("1. If businesses are missing, make sure they're imported with placeId fields");
  console.log("2. If reviews are missing, re-run the review import:");
  console.log("   npm run test-import-reviews");
  console.log("3. If review counts are mismatched, update the business stats");
}

main().catch(console.error);