#!/usr/bin/env npx tsx
/**
 * Enhanced Overnight Processing Monitor with Quality Metrics
 * Real-time dashboard for monitoring overnight AI analysis
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Monitor configuration
const REFRESH_INTERVAL = 30000; // 30 seconds
const CHECKPOINT_FILE = 'logs/overnight-checkpoint.json';
const ERROR_LOG_FILE = 'logs/overnight-errors.log';

interface CheckpointData {
  startTime: number;
  processedBusinesses: string[];
  failedBusinesses: Array<{
    businessId: string;
    businessName: string;
    error: string;
    attempts: number;
  }>;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  totalReviewsAnalyzed: number;
  totalTokensUsed: number;
  qualityMetrics: {
    totalConfidence: number;
    totalKeywords: number;
    lowConfidenceCount: number;
  };
}

interface MonitorStats {
  checkpoint: CheckpointData | null;
  currentBusiness: any | null;
  recentBusinesses: any[];
  topRankings: any[];
  errorRate: number;
  avgProcessingTime: number;
  estimatedCompletion: string;
  costEstimate: number;
  qualityScore: number;
}

// Load checkpoint data
function loadCheckpoint(): CheckpointData | null {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Could not load checkpoint:", error);
  }
  return null;
}

// Get recent errors from log
function getRecentErrors(limit: number = 5): string[] {
  try {
    if (fs.existsSync(ERROR_LOG_FILE)) {
      const content = fs.readFileSync(ERROR_LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n');
      return lines.slice(-limit);
    }
  } catch (error) {
    // Ignore
  }
  return [];
}

// Format duration
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Format percentage bar
function formatProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Get monitor statistics
async function getMonitorStats(): Promise<MonitorStats> {
  const checkpoint = loadCheckpoint();
  
  if (!checkpoint) {
    return {
      checkpoint: null,
      currentBusiness: null,
      recentBusinesses: [],
      topRankings: [],
      errorRate: 0,
      avgProcessingTime: 0,
      estimatedCompletion: "Not started",
      costEstimate: 0,
      qualityScore: 0
    };
  }
  
  // Get all businesses to find current and pending
  const allBusinesses = await client.query(api.businesses.getBusinesses, { limit: 500 });
  
  // Find businesses being processed
  const processedIds = new Set(checkpoint.processedBusinesses);
  const pendingBusinesses = allBusinesses
    .filter(b => b.reviewCount && b.reviewCount >= 5 && (!b.overallScore || b.overallScore === 0))
    .filter(b => !processedIds.has(b._id))
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  
  // Get recently processed businesses
  const recentIds = checkpoint.processedBusinesses.slice(-10);
  const recentBusinesses = allBusinesses.filter(b => recentIds.includes(b._id));
  
  // Get top rankings
  const topRankings = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
    limit: 5
  });
  
  // Calculate statistics
  const runtime = Date.now() - checkpoint.startTime;
  const avgProcessingTime = checkpoint.totalProcessed > 0 
    ? runtime / checkpoint.totalProcessed 
    : 0;
  
  const remainingBusinesses = pendingBusinesses.length;
  const estimatedRemaining = avgProcessingTime * remainingBusinesses;
  const estimatedCompletion = new Date(Date.now() + estimatedRemaining).toLocaleTimeString();
  
  const errorRate = checkpoint.totalProcessed > 0
    ? (checkpoint.totalFailed / checkpoint.totalProcessed) * 100
    : 0;
  
  const avgConfidence = checkpoint.totalSuccess > 0
    ? checkpoint.qualityMetrics.totalConfidence / checkpoint.totalSuccess
    : 0;
  
  const avgKeywords = checkpoint.totalSuccess > 0
    ? checkpoint.qualityMetrics.totalKeywords / checkpoint.totalSuccess
    : 0;
  
  const qualityScore = (avgConfidence * 0.7) + (Math.min(avgKeywords / 20, 1) * 30);
  
  const costEstimate = (checkpoint.totalTokensUsed * 0.15) / 1000000; // $0.15 per 1M tokens
  
  return {
    checkpoint,
    currentBusiness: pendingBusinesses[0] || null,
    recentBusinesses,
    topRankings,
    errorRate,
    avgProcessingTime,
    estimatedCompletion,
    costEstimate,
    qualityScore
  };
}

// Display monitor dashboard
function displayDashboard(stats: MonitorStats) {
  console.clear();
  
  if (!stats.checkpoint) {
    console.log("🌙 OVERNIGHT PROCESSING MONITOR - ENHANCED");
    console.log("==========================================");
    console.log("\n⏳ Waiting for processing to start...");
    console.log("\nMake sure overnight-process-enhanced.ts is running");
    return;
  }
  
  const checkpoint = stats.checkpoint;
  const runtime = Date.now() - checkpoint.startTime;
  const totalBusinesses = checkpoint.totalProcessed + (stats.currentBusiness ? 1 : 0) + 
                         (stats.recentBusinesses.length > 0 ? stats.recentBusinesses.length : 0);
  const progress = checkpoint.totalProcessed / Math.max(totalBusinesses, 1) * 100;
  
  console.log("🌙 OVERNIGHT PROCESSING MONITOR - ENHANCED");
  console.log("==========================================");
  console.log(`Started: ${new Date(checkpoint.startTime).toLocaleTimeString()} | Running: ${formatDuration(runtime)}\n`);
  
  // Progress Overview
  console.log("📊 Progress Overview");
  console.log(`├─ Total: ${totalBusinesses} businesses`);
  console.log(`├─ Completed: ${checkpoint.totalProcessed} (${progress.toFixed(1)}%)`);
  if (stats.currentBusiness) {
    console.log(`├─ In Progress: ${stats.currentBusiness.name} (${stats.currentBusiness.reviewCount} reviews)`);
  }
  console.log(`└─ Remaining: ${totalBusinesses - checkpoint.totalProcessed}\n`);
  
  // Progress Bar
  console.log(`Progress: ${formatProgressBar(progress)} ${progress.toFixed(1)}%\n`);
  
  // Quality Metrics
  const avgConfidence = checkpoint.totalSuccess > 0
    ? checkpoint.qualityMetrics.totalConfidence / checkpoint.totalSuccess
    : 0;
  const avgKeywords = checkpoint.totalSuccess > 0
    ? checkpoint.qualityMetrics.totalKeywords / checkpoint.totalSuccess
    : 0;
  
  console.log("📈 Quality Metrics (Last Session)");
  console.log(`├─ Avg Confidence: ${avgConfidence.toFixed(1)}% ${avgConfidence >= 85 ? '✅' : '⚠️'}`);
  console.log(`├─ Avg Keywords: ${avgKeywords.toFixed(1)} per business`);
  console.log(`├─ Avg Processing: ${formatDuration(stats.avgProcessingTime)} per business`);
  console.log(`└─ Review Coverage: ${checkpoint.totalReviewsAnalyzed} reviews analyzed\n`);
  
  // Current Business Detail
  if (stats.currentBusiness) {
    const sampleSize = getReviewSampleSize(stats.currentBusiness.reviewCount);
    console.log("🎯 Current Business Detail");
    console.log(`├─ Name: ${stats.currentBusiness.name}`);
    console.log(`├─ Total Reviews: ${stats.currentBusiness.reviewCount}`);
    console.log(`├─ Analyzing: ${sampleSize} reviews (${(sampleSize / stats.currentBusiness.reviewCount * 100).toFixed(1)}%)`);
    console.log(`└─ Category: ${stats.currentBusiness.category?.name || 'Unknown'}\n`);
  }
  
  // Cost Tracking
  console.log("💰 Cost Tracking");
  console.log(`├─ Reviews Analyzed: ${checkpoint.totalReviewsAnalyzed.toLocaleString()}`);
  console.log(`├─ Tokens Used: ~${checkpoint.totalTokensUsed.toLocaleString()}`);
  console.log(`├─ Estimated Cost: $${stats.costEstimate.toFixed(2)}`);
  console.log(`└─ Cost per Business: $${checkpoint.totalSuccess > 0 ? (stats.costEstimate / checkpoint.totalSuccess).toFixed(3) : '0.000'}\n`);
  
  // Performance & Errors
  console.log("⚠️ Performance & Quality Alerts");
  console.log(`├─ Success Rate: ${checkpoint.totalProcessed > 0 ? ((checkpoint.totalSuccess / checkpoint.totalProcessed) * 100).toFixed(1) : 0}%`);
  console.log(`├─ Error Rate: ${stats.errorRate.toFixed(1)}%`);
  console.log(`├─ Low Confidence (<80%): ${checkpoint.qualityMetrics.lowConfidenceCount} businesses`);
  console.log(`└─ Failed Businesses: ${checkpoint.totalFailed}\n`);
  
  // Recent Errors
  const recentErrors = getRecentErrors(3);
  if (recentErrors.length > 0) {
    console.log("❌ Recent Errors:");
    recentErrors.forEach(error => {
      const match = error.match(/\[(.*?)\] (.*?): (.*)/);
      if (match) {
        const [, timestamp, business, message] = match;
        console.log(`├─ ${business}: ${message.substring(0, 50)}...`);
      }
    });
    console.log("");
  }
  
  // Top Rankings Update
  if (stats.topRankings.length > 0) {
    console.log("🏆 Current Top Rankings");
    stats.topRankings.forEach((ranking, index) => {
      console.log(`${index + 1}. ${ranking.business.name.substring(0, 30).padEnd(30)} ${ranking.overallScore}/100`);
    });
    console.log("");
  }
  
  // Footer
  console.log("─".repeat(42));
  console.log(`⏰ Est. Completion: ${stats.estimatedCompletion}`);
  console.log(`💾 Last Checkpoint: ${new Date().toLocaleTimeString()}`);
  console.log("\nPress Ctrl+C to stop monitoring");
}

// Get review sample size (matching processor logic)
function getReviewSampleSize(totalReviews: number): number {
  if (totalReviews >= 500) return 60;
  if (totalReviews >= 250) return 50;
  if (totalReviews >= 100) return 40;
  if (totalReviews >= 50) return 30;
  if (totalReviews >= 25) return 20;
  return totalReviews;
}

// Main monitoring loop
async function monitor() {
  console.log("🔍 Starting enhanced overnight monitor...");
  console.log("This will update every 30 seconds");
  console.log("Press Ctrl+C to stop\n");
  
  // Initial display
  try {
    const stats = await getMonitorStats();
    displayDashboard(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
  }
  
  // Update loop
  const interval = setInterval(async () => {
    try {
      const stats = await getMonitorStats();
      displayDashboard(stats);
    } catch (error) {
      console.error("Error updating monitor:", error);
    }
  }, REFRESH_INTERVAL);
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log("\n\n👋 Monitor stopped");
    process.exit(0);
  });
}

// Run the monitor
monitor().catch((error) => {
  console.error("❌ Monitor failed:", error);
  process.exit(1);
});