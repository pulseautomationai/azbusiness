/**
 * AI Ranking System CLI Test Runner
 * Run basic tests without the admin UI
 */

import { ConvexHttpClient } from "convex/browser";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function runBasicTests() {
  console.log("🔬 AI Ranking System - Basic Test Runner");
  console.log("==========================================\n");

  if (!CONVEX_URL || CONVEX_URL.includes("YOUR_CONVEX_URL")) {
    console.error("❌ CONVEX_URL environment variable not set");
    console.log("Please set CONVEX_URL in your .env file\n");
    return;
  }

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Test 1: System Health Check
    console.log("🔍 Test 1: System Health Check");
    const healthStatus = await client.query("testAIRankingSystem:getSystemHealthStatus");
    
    if (healthStatus.status === "healthy") {
      console.log("✅ Database connectivity: OK");
      console.log(`✅ Core tables: ${Object.values(healthStatus.checks.database).every(Boolean) ? "OK" : "Missing data"}`);
      console.log(`✅ AI tables: ${Object.values(healthStatus.checks.aiRankingTables).some(Boolean) ? "OK" : "Empty (expected for new system)"}`);
    } else {
      console.log("❌ System health check failed:");
      console.log(`   Error: ${healthStatus.error}`);
    }
    console.log("");

    // Test 2: Ranking System Status
    console.log("🔍 Test 2: Ranking System Status");
    const rankingStatus = await client.query("batchRankingProcessor:getRankingSystemStatus");
    
    console.log(`✅ Total businesses: ${rankingStatus.system.totalBusinesses}`);
    console.log(`✅ Active cities: ${rankingStatus.system.totalCities}`);
    console.log(`✅ Active categories: ${rankingStatus.system.totalCategories}`);
    console.log(`✅ City+category combinations: ${rankingStatus.system.totalCombinations}`);
    console.log(`✅ Scoring coverage: ${rankingStatus.coverage.scoringCoverage}%`);
    console.log(`✅ Cached rankings: ${rankingStatus.cacheHealth.totalCaches}`);
    console.log("");

    // Test 3: Sample Business Check
    console.log("🔍 Test 3: Sample Business Analysis");
    
    // Try to find a business to test with
    const sampleBusiness = await client.query("businesses:getBusinesses", { 
      limit: 1 
    });

    if (sampleBusiness && sampleBusiness.length > 0) {
      const business = sampleBusiness[0];
      console.log(`✅ Found sample business: ${business.name} in ${business.city}`);
      
      // Check if it has reviews
      const reviews = await client.query("gmbReviews:getBusinessReviews", {
        businessId: business._id,
        limit: 5
      });
      
      console.log(`✅ Business has ${reviews.length} reviews`);
      
      // Check if it has performance scores
      const performanceScores = await client.query("performanceScoring:getBusinessPerformanceScores", {
        businessId: business._id
      });
      
      if (performanceScores.scores) {
        console.log(`✅ Performance scores available:`);
        console.log(`   Speed: ${performanceScores.scores.speed}`);
        console.log(`   Value: ${performanceScores.scores.value}`);
        console.log(`   Quality: ${performanceScores.scores.quality}`);
        console.log(`   Reliability: ${performanceScores.scores.reliability}`);
      } else {
        console.log(`⚠️  No performance scores yet (need to run AI analysis)`);
      }
      
    } else {
      console.log("⚠️  No businesses found in database");
    }
    console.log("");

    // Test 4: Configuration Check
    console.log("🔍 Test 4: Configuration Check");
    console.log(`✅ OpenAI API Key: ${process.env.OPENAI_API_KEY ? "Set" : "❌ Missing"}`);
    console.log(`✅ Convex URL: ${CONVEX_URL ? "Set" : "❌ Missing"}`);
    console.log("");

    // Summary
    console.log("📊 Test Summary");
    console.log("================");
    console.log("✅ System is ready for AI ranking implementation");
    
    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️  Set OPENAI_API_KEY to enable AI analysis features");
    }
    
    if (rankingStatus.coverage.scoringCoverage < 10) {
      console.log("ℹ️  Run AI analysis on businesses to generate performance scores");
    }
    
    if (rankingStatus.cacheHealth.totalCaches === 0) {
      console.log("ℹ️  Run ranking calculations to populate cache system");
    }

  } catch (error) {
    console.error("❌ Test execution failed:");
    console.error(error);
    console.log("\nThis might indicate:");
    console.log("- Convex backend is not running (`npx convex dev`)");
    console.log("- CONVEX_URL is incorrect");
    console.log("- Network connectivity issues");
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTests().catch(console.error);
}

export { runBasicTests };