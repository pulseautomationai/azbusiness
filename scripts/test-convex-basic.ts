/**
 * Basic Convex connection test
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testBasicConvex() {
  console.log("🔌 Testing Basic Convex Connection");
  console.log("=================================\n");
  console.log(`CONVEX_URL: ${CONVEX_URL}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Test 1: Get businesses (simple query)
    console.log("Test 1: Getting businesses...");
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 5
    });
    console.log(`✅ Found ${businesses.length} businesses\n`);

    // Test 2: Check if processBusinessReviews is available
    console.log("Test 2: Checking API structure...");
    
    // Try to call a simple function to verify connection
    try {
      const categories = await client.query(api.categories.getCategories, {});
      console.log(`✅ API working - found ${categories.length} categories`);
      
      // Check if we can access the action
      console.log("\nTest 3: Checking aiAnalysisIntegration...");
      if (api.aiAnalysisIntegration && api.aiAnalysisIntegration.processBusinessReviews) {
        console.log("✅ processBusinessReviews function is available");
      } else {
        console.log("❌ processBusinessReviews function NOT found");
        console.log("Available in aiAnalysisIntegration:", api.aiAnalysisIntegration);
      }
    } catch (err) {
      console.log("❌ Error accessing API:", err);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testBasicConvex().catch(console.error);
}

export { testBasicConvex };