/**
 * Test Convex Connection and API Access
 * Verifies all necessary APIs are accessible
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testConnection() {
  console.log("🔌 Testing Convex Connection and API Access");
  console.log("==========================================\n");

  // Check environment variables
  console.log("📋 Environment Check:");
  console.log(`CONVEX_URL: ${CONVEX_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log("");

  if (!CONVEX_URL || CONVEX_URL.includes("YOUR_CONVEX_URL")) {
    console.error("❌ CONVEX_URL not configured");
    console.log("Please set CONVEX_URL in your .env file");
    process.exit(1);
  }

  const client = new ConvexHttpClient(CONVEX_URL);
  const tests = {
    passed: 0,
    failed: 0,
    results: [] as Array<{ test: string; status: boolean; error?: string }>
  };

  // Test 1: Basic connectivity
  try {
    console.log("🔍 Test 1: Basic Convex connectivity...");
    const categories = await client.query(api.categories.getCategories);
    console.log(`✅ Connected! Found ${categories.length} categories`);
    tests.passed++;
    tests.results.push({ test: "Basic connectivity", status: true });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "Basic connectivity", status: false, error: error.message });
  }

  // Test 2: Business queries
  try {
    console.log("\n🔍 Test 2: Business queries...");
    const businesses = await client.query(api.businesses.getBusinesses, { limit: 5 });
    console.log(`✅ Business query works! Found ${businesses.length} businesses`);
    tests.passed++;
    tests.results.push({ test: "Business queries", status: true });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "Business queries", status: false, error: error.message });
  }

  // Test 3: Review queries
  try {
    console.log("\n🔍 Test 3: Review queries...");
    // Get a business first
    const businesses = await client.query(api.businesses.getBusinesses, { limit: 1 });
    if (businesses.length > 0) {
      const reviews = await client.query(api.businesses.getBusinessReviews, {
        businessId: businesses[0]._id,
        limit: 5
      });
      console.log(`✅ Review query works! Found ${reviews.length} reviews`);
      tests.passed++;
      tests.results.push({ test: "Review queries", status: true });
    } else {
      console.log("⚠️  No businesses found to test reviews");
      tests.results.push({ test: "Review queries", status: true });
    }
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "Review queries", status: false, error: error.message });
  }

  // Test 4: AI Analysis Tag queries
  try {
    console.log("\n🔍 Test 4: AI Analysis Tag queries...");
    const recentTags = await client.query(api.aiAnalysisTags.getRecentTags, { limit: 5 });
    console.log(`✅ AI tag query works! Found ${recentTags.length} recent tags`);
    tests.passed++;
    tests.results.push({ test: "AI tag queries", status: true });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "AI tag queries", status: false, error: error.message });
  }

  // Test 5: Ranking queries
  try {
    console.log("\n🔍 Test 5: Business ranking queries...");
    const topBusinesses = await client.query(api.rankings.businessRankings.getTopBusinessesAcrossCategories, {
      limit: 5
    });
    console.log(`✅ Ranking query works! Found ${topBusinesses.length} top businesses`);
    tests.passed++;
    tests.results.push({ test: "Ranking queries", status: true });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "Ranking queries", status: false, error: error.message });
  }

  // Test 6: Achievement queries
  try {
    console.log("\n🔍 Test 6: Achievement queries...");
    // Get a business first
    const businesses = await client.query(api.businesses.getBusinesses, { limit: 1 });
    if (businesses.length > 0) {
      const achievements = await client.query(api.achievements.getBusinessAchievements, {
        businessId: businesses[0]._id
      });
      console.log(`✅ Achievement query works! Found ${achievements.length} achievements`);
      tests.passed++;
      tests.results.push({ test: "Achievement queries", status: true });
    } else {
      console.log("⚠️  No businesses found to test achievements");
      tests.results.push({ test: "Achievement queries", status: true });
    }
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "Achievement queries", status: false, error: error.message });
  }

  // Test 7: System status
  try {
    console.log("\n🔍 Test 7: System status queries...");
    const status = await client.query(api.batchRankingProcessor.getRankingSystemStatus);
    console.log(`✅ System status query works!`);
    console.log(`   Total businesses: ${status.system.totalBusinesses}`);
    console.log(`   Scoring coverage: ${status.coverage.scoringCoverage}%`);
    tests.passed++;
    tests.results.push({ test: "System status", status: true });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    tests.failed++;
    tests.results.push({ test: "System status", status: false, error: error.message });
  }

  // Summary
  console.log("\n📊 Test Summary");
  console.log("===============");
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(0)}%`);

  if (tests.failed > 0) {
    console.log("\n❌ Failed Tests:");
    tests.results
      .filter(r => !r.status)
      .forEach(r => {
        console.log(`   - ${r.test}: ${r.error}`);
      });
  }

  // Recommendations
  console.log("\n💡 Recommendations:");
  if (!process.env.OPENAI_API_KEY) {
    console.log("   - Set OPENAI_API_KEY for AI analysis features");
  }
  if (tests.failed > 0) {
    console.log("   - Ensure Convex backend is running: npx convex dev");
    console.log("   - Check that all required Convex functions are deployed");
  } else {
    console.log("   ✅ All systems operational! Ready for AI ranking processing.");
  }

  return tests.failed === 0;
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { testConnection };