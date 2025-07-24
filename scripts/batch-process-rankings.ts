#!/usr/bin/env npx tsx
/**
 * Batch Process Rankings for Multiple Businesses
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

async function batchProcessRankings() {
  console.log("🚀 Batch Processing Rankings");
  console.log("===========================\n");

  try {
    // First, process some businesses with AI analysis
    console.log("📊 Step 1: Finding businesses to process...");
    
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 500
    });

    // Filter businesses with good review counts for testing
    const eligibleBusinesses = businesses
      .filter(b => b.reviewCount && b.reviewCount >= 5 && b.reviewCount <= 50)
      .slice(0, 20); // Process 20 businesses

    console.log(`Found ${eligibleBusinesses.length} businesses to process\n`);

    // Process AI analysis for each business
    console.log("🤖 Step 2: Running AI analysis...");
    let processedCount = 0;
    
    for (const business of eligibleBusinesses) {
      console.log(`Processing ${processedCount + 1}/${eligibleBusinesses.length}: ${business.name}`);
      
      try {
        // Process with AI (mock)
        await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
          businessId: business._id,
          batchSize: 5,
          skipExisting: false, // Re-process to get fresh data
        });
        
        processedCount++;
        
        // Small delay between businesses
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`   Failed: ${error}`);
      }
    }

    console.log(`\n✅ Processed ${processedCount} businesses with AI analysis\n`);

    // Trigger batch ranking calculation
    console.log("🏆 Step 3: Calculating rankings...");
    
    const rankingResult = await client.mutation(api.rankings.calculateRankings.batchCalculateRankingsPublic, {
      limit: 50
    });
    
    console.log(`✅ Scheduled rankings for ${rankingResult.scheduled} businesses\n`);

    // Wait for rankings to process
    console.log("⏳ Waiting for rankings to complete...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Display top rankings by category
    console.log("\n📊 Top Rankings by Category:");
    console.log("============================");

    const categories = ['pest-control', 'hvac', 'plumbing', 'electrical', 'landscaping'];
    
    for (const category of categories) {
      console.log(`\n🏷️  ${category.toUpperCase()}`);
      
      const categoryRankings = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
        category,
        limit: 5
      });
      
      if (categoryRankings.length === 0) {
        console.log("   No ranked businesses yet");
      } else {
        categoryRankings.forEach((ranking, index) => {
          console.log(`   ${index + 1}. ${ranking.business.name} (${ranking.business.city})`);
          console.log(`      Score: ${ranking.overallScore}/100 | Reviews: ${ranking.business.totalReviews} | Tier: ${ranking.business.planTier || 'free'}`);
        });
      }
    }

    // Display overall top 10
    console.log("\n\n🏅 Overall Top 10 Businesses:");
    console.log("==============================");
    
    const topOverall = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
      limit: 10
    });
    
    topOverall.forEach((ranking, index) => {
      console.log(`\n${index + 1}. ${ranking.business.name} (${ranking.business.city})`);
      console.log(`   Category: ${ranking.business.category?.name || 'Unknown'}`);
      console.log(`   Score: ${ranking.overallScore}/100`);
      console.log(`   Reviews: ${ranking.business.totalReviews} (${ranking.business.avgRating}★)`);
      console.log(`   Tier: ${ranking.business.planTier || 'free'}`);
      
      // Show category score breakdown
      const scores = ranking.categoryScores;
      console.log(`   Breakdown: Q:${scores.qualityIndicators} S:${scores.serviceExcellence} C:${scores.customerExperience} T:${scores.technicalMastery} CA:${scores.competitiveAdvantage} O:${scores.operationalExcellence}`);
    });

    console.log("\n\n✅ Batch processing complete!");
    console.log("\nView results at:");
    console.log("- Homepage: http://localhost:5173/");
    console.log("- Rankings: http://localhost:5173/rankings");

  } catch (error) {
    console.error("❌ Error in batch processing:", error);
    process.exit(1);
  }
}

// Run the script
batchProcessRankings().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});