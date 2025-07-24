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

// Test Place IDs provided
const TEST_PLACE_IDS = [
  "ChIJwa42GjGtK4cRElGqKAS1OF8",
  "ChIJf9Q9sLxliogRKiXyA__PqWY",
  "ChIJd13jdi6qK4cRinsG2LYOEVc",
  "ChIJ95Y8rQ0-ZwARn02dfZYlmPg",
  "ChIJcfpPWcipK4cRUD0RSG8be_w",
  "ChIJV9iK6xNpK4cR74-P8V9Mriw",
  "ChIJy93nWc2uK4cRgeH9Ay945Cc",
  "ChIJacPV3xGI9kgRJJ3i_3FLjus",
  "ChIJJxonw86pK4cRf16wbhB5YUo"
];

async function testSinglePlace() {
  console.log("\n🧪 TEST 1: Single Place ID Connection Test");
  console.log("==========================================");
  
  const placeId = TEST_PLACE_IDS[0];
  console.log(`Testing with Place ID: ${placeId}`);
  
  try {
    const result = await client.action(api.geoScraperAPI.testGeoScraperConnection, {
      placeId
    });
    
    if (result.success) {
      console.log(`✅ Success! Found ${result.reviewCount} reviews`);
      if (result.reviews && result.reviews.length > 0) {
        console.log("\n📝 Sample review:");
        const sample = result.reviews[0];
        console.log(`  - Rating: ${sample.rating}`);
        console.log(`  - Date: ${sample.date}`);
        console.log(`  - Author: ${sample.author_title}`);
        console.log(`  - Text: ${sample.text?.substring(0, 100)}...`);
        if (sample.owner_answer) {
          console.log(`  - Has owner response: ✅`);
        }
      }
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function testMultiplePlaces() {
  console.log("\n🧪 TEST 2: Multiple Places with Concurrent Connections");
  console.log("=====================================================");
  
  console.log(`Testing ${TEST_PLACE_IDS.length} Place IDs with 3 concurrent connections`);
  
  try {
    const result = await client.action(api.geoScraperAPI.testMultiplePlaces, {
      placeIds: TEST_PLACE_IDS
    });
    
    console.log("\n📊 Summary:");
    console.log(`  - Total tested: ${result.summary.total}`);
    console.log(`  - Successful: ${result.summary.successful}`);
    console.log(`  - Failed: ${result.summary.failed}`);
    console.log(`  - Total reviews found: ${result.summary.totalReviews}`);
    
    console.log("\n📋 Details:");
    result.results.forEach((r: any, i: number) => {
      if (r.success) {
        console.log(`  ${i + 1}. ${r.placeId}: ✅ ${r.reviewCount} reviews`);
      } else {
        console.log(`  ${i + 1}. ${r.placeId}: ❌ ${r.error}`);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function testBusinessMatching() {
  console.log("\n🧪 TEST 3: Check if these Place IDs match businesses in our database");
  console.log("===================================================================");
  
  try {
    // Query businesses with these Place IDs
    const businesses = await client.query(api.businesses.getBusinessesByPlaceIds, {
      placeIds: TEST_PLACE_IDS
    });
    
    console.log(`\n📊 Found ${businesses.length} matching businesses in database:`);
    
    businesses.forEach((business: any, i: number) => {
      console.log(`\n${i + 1}. ${business.name}`);
      console.log(`   - Place ID: ${business.placeId}`);
      console.log(`   - Current reviews: ${business.reviewCount}`);
      console.log(`   - Rating: ${business.rating}`);
      console.log(`   - Plan: ${business.planTier}`);
    });
    
    if (businesses.length === 0) {
      console.log("⚠️  No businesses found with these Place IDs.");
      console.log("   Make sure the businesses were imported with Place IDs.");
    }
  } catch (error) {
    console.error("❌ Error checking businesses:", error);
  }
}

async function main() {
  console.log("🚀 GEOscraper API Test Suite");
  console.log("============================");
  
  // Run tests
  await testSinglePlace();
  await testMultiplePlaces();
  await testBusinessMatching();
  
  console.log("\n✅ All tests completed!");
  console.log("\nNext steps:");
  console.log("1. Check if Place IDs match businesses in database");
  console.log("2. If matches found, run fetchAndImportReviews");
  console.log("3. Set up automated review scraping for all businesses with Place IDs");
}

main().catch(console.error);