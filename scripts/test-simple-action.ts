/**
 * Test calling a simple Convex action
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testSimpleAction() {
  console.log("🔌 Testing Convex Action Call");
  console.log("============================\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // First, let's get a business ID
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 1
    });
    
    if (businesses.length === 0) {
      console.log("❌ No businesses found");
      return;
    }

    const business = businesses[0];
    console.log(`Found business: ${business.name} (${business._id})`);
    console.log(`Reviews: ${business.reviewCount}\n`);

    // Try to call the action directly
    console.log("Attempting to call processBusinessReviews action...");
    
    try {
      // Check if the function exists
      console.log("Function type:", typeof api.aiAnalysisIntegration?.processBusinessReviews);
      
      if (!api.aiAnalysisIntegration?.processBusinessReviews) {
        console.log("❌ Function not found in API");
        console.log("Available methods in aiAnalysisIntegration:", 
          api.aiAnalysisIntegration ? Object.keys(api.aiAnalysisIntegration) : "Module not found"
        );
        return;
      }

      const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
        businessId: business._id,
        batchSize: 1, // Just process 1 review to test
        skipExisting: true,
      });
      
      console.log("✅ Action called successfully!");
      console.log("Result:", result);
      
    } catch (error: any) {
      console.log("❌ Action call failed:");
      console.log("Error:", error.message);
      
      // Check if it's a deployment issue
      if (error.message.includes("Could not find public function")) {
        console.log("\n🔧 Possible fixes:");
        console.log("1. Make sure convex dev is running");
        console.log("2. Check for syntax errors in aiAnalysisIntegration.ts");
        console.log("3. Try restarting convex dev");
        console.log("4. Check if the function is properly exported");
      }
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSimpleAction().catch(console.error);
}

export { testSimpleAction };