#!/usr/bin/env npx tsx
/**
 * Monitor Batch Processing Progress
 * Real-time monitoring of AI analysis and ranking calculations
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

// Priority categories for monitoring
const PRIORITY_CATEGORIES = [
  'pest-control', 'hvac', 'plumbing', 'electrical', 
  'landscaping', 'roofing', 'pool-service', 'garage-door-repair'
];

const PRIORITY_CITIES = [
  'Phoenix', 'Scottsdale', 'Mesa', 'Tucson', 
  'Chandler', 'Gilbert', 'Tempe', 'Glendale'
];

interface ProcessingStats {
  totalBusinesses: number;
  analyzedBusinesses: number;
  rankedBusinesses: number;
  pendingAnalysis: number;
  recentlyProcessed: any[];
  topRankings: any[];
  categoryBreakdown: Record<string, number>;
  cityBreakdown: Record<string, number>;
  aiProviderStats: {
    provider: string;
    avgConfidence: number;
    avgProcessingTime: string;
  };
}

async function getProcessingStats(): Promise<ProcessingStats> {
  console.log("📊 Gathering processing statistics...");

  // Get all businesses
  const allBusinesses = await client.query(api.businesses.getBusinesses, {
    limit: 500
  });

  // Filter for priority businesses
  const priorityBusinesses = allBusinesses.filter(b => {
    const isPriorityCategory = !b.category || PRIORITY_CATEGORIES.includes(b.category.slug || '');
    const isPriorityCity = PRIORITY_CITIES.includes(b.city);
    const hasReviews = b.reviewCount && b.reviewCount >= 5;
    return isPriorityCategory && isPriorityCity && hasReviews;
  });

  // Count analyzed businesses (those with AI scores)
  const analyzedBusinesses = priorityBusinesses.filter(b => 
    b.speedScore || b.valueScore || b.qualityScore || b.reliabilityScore
  );

  // Count ranked businesses (those with overall scores)
  const rankedBusinesses = priorityBusinesses.filter(b => 
    b.overallScore && b.overallScore > 0
  );

  // Recently processed (last 24 hours)
  const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const recentlyProcessed = analyzedBusinesses.filter(b => 
    b.lastRankingUpdate && b.lastRankingUpdate > dayAgo
  ).slice(0, 10);

  // Get top rankings
  const topRankings = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
    limit: 10
  });

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  analyzedBusinesses.forEach(b => {
    const category = b.category?.name || 'Unknown';
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  // City breakdown
  const cityBreakdown: Record<string, number> = {};
  analyzedBusinesses.forEach(b => {
    cityBreakdown[b.city] = (cityBreakdown[b.city] || 0) + 1;
  });

  // AI Provider stats
  const aiProvider = process.env.AI_PROVIDER || 'openai';
  const avgConfidence = analyzedBusinesses.length > 0 
    ? analyzedBusinesses.reduce((sum, b) => sum + (b.overallScore || 0), 0) / analyzedBusinesses.length
    : 0;

  return {
    totalBusinesses: priorityBusinesses.length,
    analyzedBusinesses: analyzedBusinesses.length,
    rankedBusinesses: rankedBusinesses.length,
    pendingAnalysis: priorityBusinesses.length - analyzedBusinesses.length,
    recentlyProcessed,
    topRankings,
    categoryBreakdown,
    cityBreakdown,
    aiProviderStats: {
      provider: aiProvider === 'gemini' ? 'Gemini 2.0 Flash-Lite' : (aiProvider === 'openai' ? 'OpenAI GPT-4' : 'Mock Data'),
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      avgProcessingTime: aiProvider === 'gemini' ? '8-10 seconds' : (aiProvider === 'openai' ? '15-20 seconds' : '1-2 seconds')
    }
  };
}

function displayStats(stats: ProcessingStats) {
  console.clear();
  console.log("🚀 AZ Business Batch Processing Monitor");
  console.log("======================================\n");
  
  // Overall Progress
  const progressPercent = Math.round((stats.analyzedBusinesses / stats.totalBusinesses) * 100);
  const progressBar = '█'.repeat(Math.floor(progressPercent / 5)) + '░'.repeat(20 - Math.floor(progressPercent / 5));
  
  console.log("📈 Overall Progress");
  console.log(`   ${progressBar} ${progressPercent}%`);
  console.log(`   Analyzed: ${stats.analyzedBusinesses}/${stats.totalBusinesses} businesses`);
  console.log(`   Ranked: ${stats.rankedBusinesses} businesses`);
  console.log(`   Pending: ${stats.pendingAnalysis} businesses\n`);

  // AI Provider Info
  console.log("🤖 AI Analysis Engine");
  console.log(`   Provider: ${stats.aiProviderStats.provider}`);
  console.log(`   Average Score: ${stats.aiProviderStats.avgConfidence}/100`);
  console.log(`   Processing Time: ${stats.aiProviderStats.avgProcessingTime}\n`);

  // Category Breakdown
  console.log("🏢 Analysis by Category");
  Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .forEach(([category, count]) => {
      console.log(`   ${category.padEnd(20)} ${count} businesses`);
    });
  console.log();

  // City Breakdown
  console.log("🌆 Analysis by City");
  Object.entries(stats.cityBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .forEach(([city, count]) => {
      console.log(`   ${city.padEnd(20)} ${count} businesses`);
    });
  console.log();

  // Top Rankings
  if (stats.topRankings.length > 0) {
    console.log("🏆 Current Top Rankings");
    stats.topRankings.slice(0, 5).forEach((ranking, index) => {
      const score = ranking.overallScore || 0;
      const reviews = ranking.business.totalReviews || ranking.business.reviewCount || 0;
      console.log(`   ${index + 1}. ${ranking.business.name.padEnd(25)} ${score}/100 (${reviews} reviews)`);
      console.log(`      ${ranking.business.city} • ${ranking.business.category?.name || 'Unknown'}`);
    });
    console.log();
  }

  // Recently Processed
  if (stats.recentlyProcessed.length > 0) {
    console.log("⚡ Recently Processed (Last 24h)");
    stats.recentlyProcessed.slice(0, 5).forEach(business => {
      const timeAgo = Math.round((Date.now() - (business.lastRankingUpdate || 0)) / (60 * 1000));
      console.log(`   ${business.name.padEnd(30)} ${timeAgo}m ago`);
    });
    console.log();
  }

  // Processing Recommendations
  console.log("💡 Recommendations");
  if (stats.pendingAnalysis > 0) {
    console.log(`   🔄 ${stats.pendingAnalysis} businesses still need analysis`);
    console.log(`   ⚡ Run: npx tsx scripts/batch-process-all-businesses.ts`);
  }
  
  if (stats.analyzedBusinesses > stats.rankedBusinesses) {
    const unranked = stats.analyzedBusinesses - stats.rankedBusinesses;
    console.log(`   📊 ${unranked} analyzed businesses need ranking calculation`);
  }
  
  if (stats.rankedBusinesses === 0) {
    console.log(`   🚨 No businesses ranked yet - run batch processing to populate homepage`);
  } else if (stats.rankedBusinesses < 10) {
    console.log(`   📈 Only ${stats.rankedBusinesses} businesses ranked - need more for quality rankings`);
  } else {
    console.log(`   ✅ ${stats.rankedBusinesses} businesses ranked - homepage should show real data`);
  }
  
  console.log(`\n⏰ Last updated: ${new Date().toLocaleTimeString()}`);
  console.log("   Press Ctrl+C to stop monitoring\n");
}

async function monitorProcessing() {
  console.log("🔍 Starting batch processing monitor...");
  console.log("   This will update every 30 seconds");
  console.log("   Press Ctrl+C to stop\n");

  // Initial display
  const initialStats = await getProcessingStats();
  displayStats(initialStats);

  // Update every 30 seconds
  const interval = setInterval(async () => {
    try {
      const stats = await getProcessingStats();
      displayStats(stats);
    } catch (error) {
      console.error("❌ Error updating stats:", error);
    }
  }, 30000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log("\n👋 Monitoring stopped");
    process.exit(0);
  });
}

// Run the monitor
monitorProcessing().catch((error) => {
  console.error("❌ Monitor failed:", error);
  process.exit(1);
});