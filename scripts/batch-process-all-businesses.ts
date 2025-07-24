#!/usr/bin/env npx tsx
/**
 * Batch Process All Businesses for Rankings
 * Processes businesses in controlled batches to avoid timeouts
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

// Check if OpenAI is configured
const useOpenAI = process.env.OPENAI_API_KEY && 
                 process.env.OPENAI_API_KEY !== "your_openai_api_key_here";

// Get AI provider for optimized configuration
const aiProvider = process.env.AI_PROVIDER || 'openai';

// Configuration - optimized per AI provider
const CONFIG = {
  BATCH_SIZE: aiProvider === 'gemini' ? 10 : (useOpenAI ? 5 : 15),              // Gemini: 10, OpenAI: 5, Mock: 15
  REVIEWS_PER_BUSINESS: aiProvider === 'gemini' ? 8 : (useOpenAI ? 3 : 10),     // Gemini: 8, OpenAI: 3, Mock: 10
  DELAY_BETWEEN_BATCHES: aiProvider === 'gemini' ? 3000 : (useOpenAI ? 5000 : 2000), // Gemini: 3s, OpenAI: 5s, Mock: 2s
  DELAY_BETWEEN_BUSINESSES: aiProvider === 'gemini' ? 1000 : (useOpenAI ? 2000 : 500), // Gemini: 1s, OpenAI: 2s, Mock: 0.5s
  TARGET_BUSINESSES: aiProvider === 'gemini' ? 50 : (useOpenAI ? 15 : 30),      // Gemini: 50, OpenAI: 15, Mock: 30
  MIN_REVIEWS: 5,                              // Minimum reviews required
  MAX_REVIEWS: aiProvider === 'gemini' ? 75 : (useOpenAI ? 50 : 100),          // Gemini: 75, OpenAI: 50, Mock: 100
};

// Priority categories for initial launch
const PRIORITY_CATEGORIES = [
  'pest-control',
  'hvac', 
  'plumbing',
  'electrical',
  'landscaping',
  'roofing',
  'pool-service',
  'garage-door-repair'
];

// Priority cities
const PRIORITY_CITIES = [
  'Phoenix',
  'Scottsdale',
  'Mesa',
  'Tucson',
  'Chandler',
  'Gilbert',
  'Tempe',
  'Glendale'
];

async function batchProcessAllBusinesses() {
  console.log("🚀 Batch Processing All Businesses for Rankings");
  console.log("===========================================\n");
  console.log(`🤖 AI Mode: ${aiProvider === 'gemini' ? 'Gemini 2.0 Flash-Lite' : (useOpenAI ? 'OpenAI (Real Analysis)' : 'Mock Data')}`);
  console.log(`Configuration:`);
  console.log(`  Batch Size: ${CONFIG.BATCH_SIZE} businesses`);
  console.log(`  Reviews per Business: ${CONFIG.REVIEWS_PER_BUSINESS}`);
  console.log(`  Target Total: ${CONFIG.TARGET_BUSINESSES} businesses`);
  console.log(`  Priority Categories: ${PRIORITY_CATEGORIES.join(', ')}`);
  console.log(`  Priority Cities: ${PRIORITY_CITIES.join(', ')}\n`);

  try {
    // Track progress
    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // Get all businesses
    console.log(`\n📦 Fetching businesses...`);

    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 500
    });

    if (!businesses || businesses.length === 0) {
      console.log("No businesses found to process");
      return;
    }

    // Filter for priority businesses
    const eligibleBusinesses = businesses.filter(b => {
      const hasEnoughReviews = b.reviewCount && b.reviewCount >= CONFIG.MIN_REVIEWS && b.reviewCount <= CONFIG.MAX_REVIEWS;
      const isPriorityCategory = !b.category || PRIORITY_CATEGORIES.includes(b.category.slug || '');
      const isPriorityCity = PRIORITY_CITIES.includes(b.city);
      const notYetRanked = !b.overallScore || b.overallScore === 0;
      
      return hasEnoughReviews && isPriorityCategory && isPriorityCity && notYetRanked;
    });

    console.log(`  Found ${eligibleBusinesses.length} eligible businesses`);
    console.log(`  Will process ${Math.min(eligibleBusinesses.length, CONFIG.TARGET_BUSINESSES)} businesses`);

    // Process businesses in batches
    const businessesToProcess = eligibleBusinesses.slice(0, CONFIG.TARGET_BUSINESSES);
    
    for (let i = 0; i < businessesToProcess.length; i += CONFIG.BATCH_SIZE) {
      const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
      const batch = businessesToProcess.slice(i, i + CONFIG.BATCH_SIZE);
      
      console.log(`\n📦 Batch ${batchNumber} - Processing ${batch.length} businesses...`);
      
      for (const business of batch) {
        try {
          console.log(`\n  🏢 Processing ${totalProcessed + 1}/${CONFIG.TARGET_BUSINESSES}: ${business.name}`);
          console.log(`     City: ${business.city} | Category: ${business.category?.name || 'Unknown'}`);
          console.log(`     Reviews: ${business.reviewCount} | Tier: ${business.planTier || 'free'}`);

          // Process AI analysis
          const aiResult = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
            businessId: business._id,
            batchSize: CONFIG.REVIEWS_PER_BUSINESS,
            skipExisting: false, // Re-process for fresh data
          });

          console.log(`     ✅ AI Analysis: ${aiResult.message}`);

          // Small delay between businesses
          await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BUSINESSES));

          successCount++;
        } catch (error) {
          console.error(`     ❌ Error: ${error}`);
          errorCount++;
        }

        totalProcessed++;
      }

      // Delay between batches
      if (i + CONFIG.BATCH_SIZE < businessesToProcess.length) {
        console.log(`\n⏳ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }

    // Calculate rankings for all processed businesses
    console.log("\n\n🏆 Triggering Ranking Calculations...");
    const rankingResult = await client.mutation(api.rankings.calculateRankings.batchCalculateRankingsPublic, {
      limit: totalProcessed + 50 // Include some buffer
    });
    
    console.log(`✅ Scheduled rankings for ${rankingResult.scheduled} businesses`);

    // Wait for rankings to complete
    console.log("\n⏳ Waiting for rankings to complete...");
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

    // Display summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log("\n\n📊 Processing Summary");
    console.log("====================");
    console.log(`  Total Processed: ${totalProcessed}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Duration: ${duration} seconds`);
    console.log(`  Average: ${(duration / totalProcessed).toFixed(1)} seconds per business`);

    // Get top rankings to verify
    console.log("\n\n🏅 Top 10 Overall Rankings:");
    console.log("===========================");
    
    const topRankings = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
      limit: 10
    });

    topRankings.forEach((ranking, index) => {
      console.log(`\n${index + 1}. ${ranking.business.name} (${ranking.business.city})`);
      console.log(`   Category: ${ranking.business.category?.name || 'Unknown'}`);
      console.log(`   Score: ${ranking.overallScore}/100`);
      console.log(`   Reviews: ${ranking.business.totalReviews}`);
      console.log(`   Tier: ${ranking.business.planTier || 'free'}`);
    });

    console.log("\n\n✅ Batch processing complete!");
    console.log("\nView the rankings at:");
    console.log("- Homepage: http://localhost:5173/");
    console.log("- Business Dashboard: http://localhost:5173/dashboard/achievements");

  } catch (error) {
    console.error("❌ Fatal error in batch processing:", error);
    process.exit(1);
  }
}

// Run the script
batchProcessAllBusinesses().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});