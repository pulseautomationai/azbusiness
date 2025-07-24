#!/usr/bin/env npx tsx
/**
 * Monitor Ranking System Status
 * Shows current state of rankings, achievements, and processing
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

async function monitorRankingStatus() {
  console.log("📊 AI Ranking System Status Monitor");
  console.log("==================================\n");

  try {
    // Get overall statistics
    console.log("🔍 Fetching system statistics...\n");

    // Count businesses with rankings
    const allBusinesses = await client.query(api.businesses.getBusinesses, { limit: 500 });
    const rankedBusinesses = allBusinesses.filter(b => b.overallScore && b.overallScore > 0);
    
    console.log("📈 Overall Statistics:");
    console.log(`   Total Businesses: ${allBusinesses.length}`);
    console.log(`   Ranked Businesses: ${rankedBusinesses.length} (${((rankedBusinesses.length / allBusinesses.length) * 100).toFixed(1)}%)`);
    console.log(`   Unranked Businesses: ${allBusinesses.length - rankedBusinesses.length}`);

    // Tier distribution
    const tierCounts = {
      free: rankedBusinesses.filter(b => !b.planTier || b.planTier === 'free').length,
      starter: rankedBusinesses.filter(b => b.planTier === 'starter').length,
      pro: rankedBusinesses.filter(b => b.planTier === 'pro').length,
      power: rankedBusinesses.filter(b => b.planTier === 'power').length,
    };

    console.log("\n🎯 Tier Distribution (Ranked Only):");
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier.charAt(0).toUpperCase() + tier.slice(1)}: ${count} businesses`);
    });

    // Score distribution
    const scoreRanges = {
      '0-20': rankedBusinesses.filter(b => b.overallScore <= 20).length,
      '21-40': rankedBusinesses.filter(b => b.overallScore > 20 && b.overallScore <= 40).length,
      '41-60': rankedBusinesses.filter(b => b.overallScore > 40 && b.overallScore <= 60).length,
      '61-80': rankedBusinesses.filter(b => b.overallScore > 60 && b.overallScore <= 80).length,
      '81-100': rankedBusinesses.filter(b => b.overallScore > 80).length,
    };

    console.log("\n📊 Score Distribution:");
    Object.entries(scoreRanges).forEach(([range, count]) => {
      const percentage = ((count / rankedBusinesses.length) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(count / 2));
      console.log(`   ${range}: ${bar} ${count} (${percentage}%)`);
    });

    // Category breakdown
    const categoryStats = new Map();
    rankedBusinesses.forEach(b => {
      const category = b.category?.name || 'Unknown';
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, totalScore: 0 });
      }
      const stats = categoryStats.get(category);
      stats.count++;
      stats.totalScore += b.overallScore;
    });

    console.log("\n🏷️  Rankings by Category:");
    const sortedCategories = Array.from(categoryStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    
    sortedCategories.forEach(([category, stats]) => {
      const avgScore = (stats.totalScore / stats.count).toFixed(1);
      console.log(`   ${category}: ${stats.count} businesses (avg score: ${avgScore})`);
    });

    // City breakdown
    const cityStats = new Map();
    rankedBusinesses.forEach(b => {
      const city = b.city || 'Unknown';
      if (!cityStats.has(city)) {
        cityStats.set(city, { count: 0, totalScore: 0 });
      }
      const stats = cityStats.get(city);
      stats.count++;
      stats.totalScore += b.overallScore;
    });

    console.log("\n🌆 Rankings by City:");
    const sortedCities = Array.from(cityStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    
    sortedCities.forEach(([city, stats]) => {
      const avgScore = (stats.totalScore / stats.count).toFixed(1);
      console.log(`   ${city}: ${stats.count} businesses (avg score: ${avgScore})`);
    });

    // Top performers
    console.log("\n🏆 Top 5 Ranked Businesses:");
    const topBusinesses = rankedBusinesses
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);
    
    topBusinesses.forEach((business, index) => {
      console.log(`\n   ${index + 1}. ${business.name}`);
      console.log(`      Score: ${business.overallScore}/100`);
      console.log(`      Location: ${business.city}`);
      console.log(`      Category: ${business.category?.name || 'Unknown'}`);
      console.log(`      Tier: ${business.planTier || 'free'}`);
    });

    // Processing recommendations
    console.log("\n\n💡 Recommendations:");
    
    if (rankedBusinesses.length < 50) {
      console.log("   ⚠️  Less than 50 businesses ranked - run batch processing");
    }
    
    const avgScore = rankedBusinesses.reduce((sum, b) => sum + b.overallScore, 0) / rankedBusinesses.length;
    if (avgScore < 50) {
      console.log(`   ⚠️  Average score is ${avgScore.toFixed(1)}/100 - consider OpenAI integration for better analysis`);
    }
    
    const powerTierCount = tierCounts.power;
    if (powerTierCount < 5) {
      console.log("   ⚠️  Only " + powerTierCount + " Power tier businesses - promote upgrades");
    }

    console.log("\n✅ Status check complete!");

  } catch (error) {
    console.error("❌ Error monitoring status:", error);
    process.exit(1);
  }
}

// Run the monitor
monitorRankingStatus().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});