#!/usr/bin/env npx tsx
/**
 * Test OpenAI Integration for AI Analysis
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

console.log("🔍 OpenAI Integration Test");
console.log("=========================\n");

// Check OpenAI API key
if (!OPENAI_API_KEY || OPENAI_API_KEY === "your_openai_api_key_here") {
  console.log("⚠️  OpenAI API Key Status: NOT CONFIGURED");
  console.log("   The system will use mock analysis");
  console.log("   To use real OpenAI:");
  console.log("   1. Get an API key from https://platform.openai.com/api-keys");
  console.log("   2. Add it to your .env.local file:");
  console.log("      OPENAI_API_KEY=sk-your-actual-key-here");
  console.log("   3. Re-run this test");
} else {
  console.log("✅ OpenAI API Key Status: CONFIGURED");
  console.log(`   Key preview: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testOpenAIIntegration() {
  try {
    // Get a business with reviews for testing
    console.log("\n📋 Finding test business...");
    
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 10
    });
    
    const testBusiness = businesses.find(b => 
      b.reviewCount && b.reviewCount >= 5 && b.reviewCount <= 20
    );
    
    if (!testBusiness) {
      console.log("❌ No suitable test business found");
      return;
    }

    console.log(`🏢 Testing with: ${testBusiness.name}`);
    console.log(`   Reviews: ${testBusiness.reviewCount}`);
    console.log(`   Category: ${testBusiness.category?.name || 'Unknown'}`);

    // Test the AI analysis
    console.log("\n🤖 Running AI Analysis Test...");
    console.log("   This will use OpenAI if configured, mock data otherwise");
    
    const startTime = Date.now();
    
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: 3, // Small batch for testing
      skipExisting: false,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Test Results:`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Processing Time: ${duration}ms`);
    
    if (result.insights) {
      console.log(`\n🎯 Analysis Quality Indicators:`);
      console.log(`   Performance Scores:`);
      console.log(`      Speed: ${result.insights.performanceScores.speed.toFixed(1)}/10`);
      console.log(`      Value: ${result.insights.performanceScores.value.toFixed(1)}/10`);
      console.log(`      Quality: ${result.insights.performanceScores.quality.toFixed(1)}/10`);
      console.log(`      Reliability: ${result.insights.performanceScores.reliability.toFixed(1)}/10`);
      console.log(`      Expertise: ${result.insights.performanceScores.expertise.toFixed(1)}/10`);
      console.log(`      Customer Impact: ${result.insights.performanceScores.customerImpact.toFixed(1)}/10`);
      
      console.log(`\n   Top Keywords: ${result.insights.topKeywords.join(', ')}`);
      console.log(`   Confidence: ${result.insights.confidence.toFixed(0)}%`);
      console.log(`   Reviews Analyzed: ${result.insights.analysisCount}`);
    }

    // Check if ranking was calculated
    console.log("\n🏆 Checking Ranking Update...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const ranking = await client.query(api.rankings.calculateRankings.getBusinessRanking, {
      businessId: testBusiness._id
    });
    
    if (ranking) {
      console.log(`   Overall Score: ${ranking.overallScore}/100`);
      console.log(`   Reviews Analyzed: ${ranking.reviewsAnalyzed}`);
      console.log(`   Last Updated: ${new Date(ranking.updatedAt).toLocaleString()}`);
      
      console.log(`\n   Category Scores:`);
      Object.entries(ranking.categoryScores).forEach(([category, score]) => {
        console.log(`      ${category}: ${score}/10`);
      });
    }

    // Test quality comparison
    console.log("\n📈 Analysis Quality Assessment:");
    
    if (OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here") {
      console.log("   ✅ Using Real OpenAI Analysis");
      console.log("   Expected improvements:");
      console.log("      - Richer keyword extraction");
      console.log("      - Better sentiment analysis");
      console.log("      - More nuanced scoring");
      console.log("      - Enhanced achievement detection");
    } else {
      console.log("   ⚠️  Using Mock Analysis");
      console.log("   Benefits of switching to OpenAI:");
      console.log("      - Scores could increase to 65-80/100 range");
      console.log("      - More accurate competitive analysis");
      console.log("      - Better quality indicators");
      console.log("      - Enhanced achievement opportunities");
    }

    console.log("\n✅ Integration test complete!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testOpenAIIntegration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});