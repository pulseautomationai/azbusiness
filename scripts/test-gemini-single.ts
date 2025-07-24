#!/usr/bin/env npx tsx
/**
 * Single Review Gemini Test
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

console.log("⚡ Single Review Gemini Test");
console.log("===========================");
console.log(`🤖 Provider: ${process.env.AI_PROVIDER}`);
console.log(`🔑 Gemini Key: ${process.env.GEMINI_API_KEY ? 'configured' : 'missing'}`);

const client = new ConvexHttpClient(CONVEX_URL);

async function testSingleReview() {
  try {
    // Get a business with minimal reviews
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 30
    });
    
    const testBusiness = businesses.find(b => 
      b.reviewCount && b.reviewCount >= 5 && b.reviewCount <= 20
    ) || businesses.find(b => b.reviewCount && b.reviewCount > 0) || businesses[0];

    if (!testBusiness) {
      console.log("❌ No suitable business found");
      return;
    }

    console.log(`🏢 Testing: ${testBusiness.name} (${testBusiness.reviewCount} reviews)`);
    console.log("🎯 Processing 1 review with Gemini...");
    
    const startTime = Date.now();
    
    // Process just 1 review
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: 1, // Single review only
      skipExisting: false,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Results (${(duration/1000).toFixed(1)}s):`);
    console.log(`   ${result.success ? '✅ Success' : '❌ Failed'}: ${result.message}`);
    
    if (result.insights) {
      console.log(`   Reviews: ${result.insights.analysisCount}`);
      console.log(`   Keywords: ${result.insights.topKeywords.slice(0, 4).join(', ')}`);
      console.log(`   Confidence: ${result.insights.confidence.toFixed(0)}%`);
    }

    console.log("\n✅ Single review test complete!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testSingleReview().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});