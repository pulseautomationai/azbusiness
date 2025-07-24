#!/usr/bin/env npx tsx
/**
 * Minimal OpenAI Test - Process just 1 review
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

console.log("⚡ Minimal OpenAI Test - 1 Review Only");
console.log("=====================================");

const client = new ConvexHttpClient(CONVEX_URL);

async function minimalTest() {
  try {
    // Get a business with few reviews
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 50
    });
    
    const testBusiness = businesses.find(b => 
      b.reviewCount && b.reviewCount >= 5 && b.reviewCount <= 15
    );

    if (!testBusiness) {
      console.log("❌ No suitable business found");
      return;
    }

    console.log(`🏢 Testing: ${testBusiness.name} (${testBusiness.reviewCount} reviews)`);
    console.log("🎯 Processing just 1 review with OpenAI...");
    
    const startTime = Date.now();
    
    // Process with minimal batch size
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: 1, // Process just 1 review
      skipExisting: false,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Results (${(duration/1000).toFixed(1)}s):`);
    console.log(`   ${result.success ? '✅ Success' : '❌ Failed'}: ${result.message}`);
    
    if (result.insights) {
      console.log(`   Reviews: ${result.insights.analysisCount}`);
      console.log(`   Keywords: ${result.insights.topKeywords.slice(0, 3).join(', ')}`);
    }

    console.log("\n✅ Minimal test complete!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

minimalTest().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});