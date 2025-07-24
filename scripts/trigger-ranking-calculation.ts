#!/usr/bin/env npx tsx
/**
 * Trigger Ranking Calculation for Test Businesses
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

// Test business names
const TEST_BUSINESSES = [
  { name: "Enviro Tech Pest Control", city: "Paradise Valley" },
  { name: "Cummings Termite & Pest", city: "Carefree" },
  { name: "Maximum Exterminating Inc. since 1996", city: "Carefree" }
];

async function triggerRankingCalculation() {
  console.log("🏆 Triggering Ranking Calculations");
  console.log("==================================\n");

  try {
    // Get all businesses
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 500
    });

    // Find test businesses and trigger rankings
    for (const testBiz of TEST_BUSINESSES) {
      const business = businesses.find(b => 
        b.name === testBiz.name && b.city === testBiz.city
      );

      if (business) {
        console.log(`📊 Triggering ranking for: ${business.name}`);
        console.log(`   Tier: ${business.planTier}`);
        console.log(`   Reviews: ${business.reviewCount || 0}`);
        
        try {
          // Trigger the ranking calculation
          const result = await client.mutation(api.rankings.calculateRankings.triggerRankingCalculation, {
            businessId: business._id
          });
          
          console.log(`   ✅ ${result.message}\n`);
          
          // Wait a bit for the calculation to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if ranking was created
          const ranking = await client.query(api.rankings.calculateRankings.getBusinessRanking, {
            businessId: business._id
          });
          
          if (ranking) {
            console.log(`   📈 Ranking Results:`);
            console.log(`      Overall Score: ${ranking.overallScore}/100`);
            console.log(`      Position: #${ranking.rankingPosition || 'TBD'}`);
            console.log(`      Reviews Analyzed: ${ranking.reviewsAnalyzed}`);
            console.log(`      Category Scores:`);
            console.log(`         Quality: ${ranking.categoryScores.qualityIndicators}`);
            console.log(`         Service: ${ranking.categoryScores.serviceExcellence}`);
            console.log(`         Customer: ${ranking.categoryScores.customerExperience}`);
            console.log(`         Technical: ${ranking.categoryScores.technicalMastery}`);
            console.log(`         Competitive: ${ranking.categoryScores.competitiveAdvantage}`);
            console.log(`         Operational: ${ranking.categoryScores.operationalExcellence}\n`);
          } else {
            console.log(`   ⚠️  No ranking found yet\n`);
          }
          
        } catch (error) {
          console.error(`   ❌ Failed to trigger ranking: ${error}\n`);
        }
      } else {
        console.log(`❌ Could not find: ${testBiz.name} in ${testBiz.city}\n`);
      }
    }

    // Get top ranked businesses
    console.log("\n🏅 Top Ranked Businesses (All Categories):");
    console.log("==========================================");
    
    const topRanked = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
      limit: 10
    });
    
    topRanked.forEach((ranking, index) => {
      console.log(`\n${index + 1}. ${ranking.business.name} (${ranking.business.city})`);
      console.log(`   Category: ${ranking.business.category?.name || 'Unknown'}`);
      console.log(`   Tier: ${ranking.business.planTier || 'free'}`);
      console.log(`   Score: ${ranking.overallScore}/100`);
      console.log(`   Reviews: ${ranking.business.totalReviews} (${ranking.business.avgRating}★)`);
      if (ranking.achievements.length > 0) {
        console.log(`   🏆 Achievements: ${ranking.achievements.map(a => a.displayName).join(', ')}`);
      }
    });

    console.log("\n\n✅ Ranking calculation complete!");
    console.log("\nView the businesses at:");
    console.log("- Homepage: http://localhost:5173/");
    console.log("- Dashboard: http://localhost:5173/dashboard/achievements");

  } catch (error) {
    console.error("❌ Error triggering rankings:", error);
    process.exit(1);
  }
}

// Run the script
triggerRankingCalculation().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});