#!/usr/bin/env npx tsx
/**
 * Test OpenAI Integration with Single Business (Optimized)
 * Tests our optimized OpenAI integration with timeout handling
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

console.log("🧪 Optimized OpenAI Integration Test");
console.log("===================================\n");

// Check OpenAI API key
const useOpenAI = OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";

if (!useOpenAI) {
  console.log("⚠️  OpenAI API Key Status: NOT CONFIGURED");
  console.log("   This test will use mock analysis");
  console.log("   To test real OpenAI, add OPENAI_API_KEY to .env.local");
} else {
  console.log("✅ OpenAI API Key Status: CONFIGURED");
  console.log(`   Key preview: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);
  console.log("   Using optimized settings:");
  console.log("   - 10 review limit per business");
  console.log("   - 15 second timeout per request");
  console.log("   - 500ms delay between reviews");
  console.log("   - Simplified JSON schema");
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testSingleBusiness() {
  try {
    // Get a test business with moderate review count
    console.log("\n📋 Finding suitable test business...");
    
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 50
    });
    
    const testBusiness = businesses.find(b => 
      b.reviewCount && 
      b.reviewCount >= 10 && 
      b.reviewCount <= 30 &&
      b.category?.name &&
      b.city
    );
    
    if (!testBusiness) {
      console.log("❌ No suitable test business found");
      return;
    }

    console.log(`🏢 Selected: ${testBusiness.name}`);
    console.log(`   Reviews: ${testBusiness.reviewCount}`);
    console.log(`   Category: ${testBusiness.category?.name}`);
    console.log(`   City: ${testBusiness.city}`);
    console.log(`   Current Score: ${testBusiness.overallScore || 'Not ranked'}`);

    // Test the optimized AI analysis
    console.log("\n🤖 Running Optimized AI Analysis...");
    console.log(`   Mode: ${useOpenAI ? 'Real OpenAI' : 'Mock Analysis'}`);
    console.log(`   Max Reviews: ${useOpenAI ? '10' : '50'}`);
    
    const startTime = Date.now();
    
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: useOpenAI ? 10 : 20, // Optimized batch size
      skipExisting: false, // Fresh analysis
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Test Results:`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`   Average: ${result.insights ? (duration / result.insights.analysisCount / 1000).toFixed(1) : 'N/A'}s per review`);
    
    if (result.insights && result.success) {
      console.log(`\n🎯 Analysis Quality:`);
      const scores = result.insights.performanceScores;
      console.log(`   Speed: ${scores.speed.toFixed(1)}/10`);
      console.log(`   Value: ${scores.value.toFixed(1)}/10`);
      console.log(`   Quality: ${scores.quality.toFixed(1)}/10`);
      console.log(`   Reliability: ${scores.reliability.toFixed(1)}/10`);
      console.log(`   Expertise: ${scores.expertise.toFixed(1)}/10`);
      console.log(`   Customer Impact: ${scores.customerImpact.toFixed(1)}/10`);
      
      const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
      console.log(`   Overall Avg: ${avgScore.toFixed(1)}/10`);
      
      console.log(`\n   Keywords: ${result.insights.topKeywords.slice(0, 5).join(', ')}`);
      console.log(`   Confidence: ${result.insights.confidence.toFixed(0)}%`);
      console.log(`   Reviews Analyzed: ${result.insights.analysisCount}`);
    }

    // Check if ranking was updated
    console.log("\n🏆 Checking Updated Ranking...");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for processing
    
    const ranking = await client.query(api.rankings.calculateRankings.getBusinessRanking, {
      businessId: testBusiness._id
    });
    
    if (ranking) {
      console.log(`   Overall Score: ${ranking.overallScore}/100`);
      console.log(`   Category Rank: ${ranking.rankingPosition || 'TBD'}`);
      console.log(`   Last Updated: ${new Date(ranking.updatedAt).toLocaleString()}`);
    } else {
      console.log("   ⚠️ Ranking not yet calculated");
    }

    // Performance assessment
    console.log("\n📈 Performance Assessment:");
    
    if (useOpenAI) {
      if (duration < 30000) { // Under 30 seconds
        console.log("   ✅ Excellent - Under 30 seconds");
      } else if (duration < 60000) { // Under 1 minute
        console.log("   ✅ Good - Under 1 minute");
      } else {
        console.log("   ⚠️ Slow - Consider reducing batch size");
      }
      
      if (result.success) {
        console.log("   ✅ No timeouts - OpenAI integration stable");
      } else {
        console.log("   ❌ Failed - Check error messages above");
      }
    } else {
      console.log("   ✅ Mock mode - Fast and reliable");
      console.log("   💡 Ready to switch to OpenAI for real results");
    }

    console.log("\n✅ Single business test complete!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSingleBusiness().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});