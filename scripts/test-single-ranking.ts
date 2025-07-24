#!/usr/bin/env npx tsx
/**
 * Test single business ranking calculation
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testSingleRanking() {
  console.log("🧪 Testing Single Business Ranking");
  console.log("=================================\n");

  try {
    // Get a test business
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 10
    });
    
    const testBusiness = businesses.find(b => b.name === "Enviro Tech Pest Control");
    
    if (!testBusiness) {
      console.error("❌ Test business not found");
      return;
    }

    console.log(`📊 Testing with: ${testBusiness.name}`);
    console.log(`   Tier: ${testBusiness.planTier}`);
    console.log(`   Reviews: ${testBusiness.reviewCount}\n`);

    // Process AI analysis
    console.log("🤖 Running AI analysis...");
    const aiResult = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: testBusiness._id,
      batchSize: 3,
      skipExisting: false,
    });
    
    console.log(`✅ ${aiResult.message}\n`);

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Trigger ranking calculation
    console.log("🏆 Calculating ranking...");
    const rankingResult = await client.mutation(api.rankings.calculateRankings.triggerRankingCalculation, {
      businessId: testBusiness._id
    });
    
    console.log(`✅ ${rankingResult.message}\n`);

    // Wait for calculation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the ranking
    const ranking = await client.query(api.rankings.calculateRankings.getBusinessRanking, {
      businessId: testBusiness._id
    });

    if (ranking) {
      console.log("📈 Ranking Results:");
      console.log(`   Overall Score: ${ranking.overallScore}/100`);
      console.log(`   Reviews Analyzed: ${ranking.reviewsAnalyzed}`);
      console.log(`   Confidence: ${ranking.confidenceScore}%`);
      console.log("\n   Category Scores:");
      Object.entries(ranking.categoryScores).forEach(([category, score]) => {
        console.log(`      ${category}: ${score}`);
      });
      console.log("\n   Performance Breakdown:");
      Object.entries(ranking.performanceBreakdown).forEach(([metric, score]) => {
        console.log(`      ${metric}: ${score}`);
      });
    }

    // Check achievements
    const achievements = await client.query(api.achievements.detectAchievements.getBusinessAchievements, {
      businessId: testBusiness._id
    });

    if (achievements.length > 0) {
      console.log("\n🏆 Achievements:");
      achievements.forEach(a => {
        console.log(`   - ${a.displayName} (${a.tierLevel})`);
      });
    }

    console.log("\n✅ Test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSingleRanking().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});