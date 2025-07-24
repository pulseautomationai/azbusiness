#!/usr/bin/env npx tsx
/**
 * Test Gemini 2.0 Flash-Lite Integration
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("🧪 Gemini 2.0 Flash-Lite Integration Test");
console.log("========================================");

// Check configuration
if (!GEMINI_API_KEY) {
  console.log("❌ GEMINI_API_KEY not configured");
  console.log("   Add to .env.local:");
  console.log("   GEMINI_API_KEY=your_api_key_here");
  console.log("   AI_PROVIDER=gemini");
  process.exit(1);
}

console.log("✅ Gemini API Key configured");
console.log(`   Key preview: ${GEMINI_API_KEY.substring(0, 15)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 6)}`);
console.log(`   Provider: ${process.env.AI_PROVIDER || 'not set (defaulting to openai)'}`);

const client = new ConvexHttpClient(CONVEX_URL);

async function testGeminiDirect() {
  console.log("\n🤖 Testing Gemini API directly...");
  
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this 5-star review: "Excellent service! Very professional and fast response time." Return JSON with: {"score": number, "keywords": ["array"], "confidence": number}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
          responseMimeType: "application/json"
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("   ✅ Direct API call successful");
      console.log(`   Response: ${content}`);
      
      try {
        const parsed = JSON.parse(content);
        console.log("   ✅ JSON parsing successful");
        return true;
      } catch (e) {
        console.log("   ⚠️ JSON parsing failed");
        return false;
      }
    } else {
      console.log(`   ❌ API call failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testGeminiIntegration() {
  console.log("\n🏢 Testing Gemini with real business...");
  
  try {
    // Get a small business for testing
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 20
    });
    
    const testBusiness = businesses.find(b => 
      b.reviewCount && b.reviewCount >= 5 && b.reviewCount <= 15
    ) || businesses[0];

    if (!testBusiness) {
      console.log("❌ No businesses found");
      return;
    }

    console.log(`   Business: ${testBusiness.name} (${testBusiness.reviewCount} reviews)`);
    
    const startTime = Date.now();
    
    // Process with Gemini
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: 3, // Small test batch
      skipExisting: false,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Integration Results (${(duration/1000).toFixed(1)}s):`);
    console.log(`   ${result.success ? '✅ Success' : '❌ Failed'}: ${result.message}`);
    
    if (result.insights) {
      console.log(`   Reviews analyzed: ${result.insights.analysisCount}`);
      console.log(`   Top keywords: ${result.insights.topKeywords.slice(0, 3).join(', ')}`);
      console.log(`   Confidence: ${result.insights.confidence.toFixed(0)}%`);
      
      const scores = result.insights.performanceScores;
      console.log(`   Quality scores:`);
      console.log(`      Speed: ${scores.speed.toFixed(1)}/10`);
      console.log(`      Value: ${scores.value.toFixed(1)}/10`);
      console.log(`      Quality: ${scores.quality.toFixed(1)}/10`);
    }

    console.log("\n✅ Gemini integration test complete!");

  } catch (error) {
    console.error(`❌ Integration test failed: ${error.message}`);
  }
}

async function runTests() {
  const directSuccess = await testGeminiDirect();
  
  if (directSuccess) {
    await testGeminiIntegration();
  } else {
    console.log("\n❌ Skipping integration test due to direct API failure");
  }
  
  console.log("\n💡 Next steps:");
  console.log("   1. If tests passed, Gemini is ready for production");
  console.log("   2. Run: npm run tsx scripts/batch-process-all-businesses.ts");
  console.log("   3. Monitor costs at: https://aistudio.google.com/apikey");
}

runTests().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});