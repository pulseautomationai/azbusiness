#!/usr/bin/env npx tsx
/**
 * Quick OpenAI Test - Direct business ID
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!CONVEX_URL) {
  console.error("❌ Missing CONVEX_URL environment variable");
  process.exit(1);
}

const useOpenAI = OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";

console.log("⚡ Quick OpenAI Test");
console.log("===================");
console.log(`🤖 Mode: ${useOpenAI ? 'Real OpenAI' : 'Mock Analysis'}`);

const client = new ConvexHttpClient(CONVEX_URL);

async function quickTest() {
  try {
    // Use a known business ID - we'll grab the first one from earlier tests
    console.log("\n🎯 Testing with known business...");
    
    // Test just the AI processing directly
    const startTime = Date.now();
    
    // Get any business for testing with limited reviews
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 20  // Look through more options
    });
    
    if (!businesses || businesses.length === 0) {
      console.log("❌ No businesses found");
      return;
    }

    // Find a business with reasonable review count for testing
    const testBusiness = businesses.find(b => 
      b.reviewCount && b.reviewCount >= 5 && b.reviewCount <= 20
    ) || businesses[0];
    console.log(`🏢 Testing: ${testBusiness.name} (${testBusiness.reviewCount || 0} reviews)`);
    
    // Run AI analysis with very small batch
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: 2, // Very small for testing
      skipExisting: false,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Results:`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
    
    if (result.success && result.insights) {
      console.log(`   Analyzed: ${result.insights.analysisCount} reviews`);
      console.log(`   Confidence: ${result.insights.confidence.toFixed(0)}%`);
      console.log(`   Top Keywords: ${result.insights.topKeywords.slice(0, 3).join(', ')}`);
    }

    console.log("\n✅ Quick test complete!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

quickTest().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});