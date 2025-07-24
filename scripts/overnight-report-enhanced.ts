#!/usr/bin/env npx tsx
/**
 * Enhanced Overnight Processing Report Generator
 * Generates comprehensive reports from overnight processing results
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

// Report configuration
const REPORT_CONFIG = {
  CHECKPOINT_FILE: 'logs/overnight-checkpoint.json',
  ERROR_LOG_FILE: 'logs/overnight-errors.log',
  OUTPUT_DIR: 'logs/reports',
  LOW_CONFIDENCE_THRESHOLD: 80,
  LOW_KEYWORD_THRESHOLD: 5,
  HIGH_REVIEW_THRESHOLD: 100,
};

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

interface BusinessAnalysis {
  business: any;
  ranking?: any;
  achievements?: any[];
  qualityScore: number;
  reviewCoverage: number;
  processingTime?: number;
  needsAttention: boolean;
  attentionReasons: string[];
}

interface ReportData {
  checkpoint: CheckpointData;
  processingSummary: {
    duration: string;
    successRate: number;
    errorRate: number;
    avgProcessingTime: string;
    totalCost: number;
    costPerBusiness: number;
  };
  qualitySummary: {
    avgConfidence: number;
    avgKeywords: number;
    lowConfidenceBusinesses: BusinessAnalysis[];
    highPerformers: BusinessAnalysis[];
  };
  rankingSummary: {
    totalRanked: number;
    topOverall: any[];
    topByCategory: Record<string, any[]>;
    topByCity: Record<string, any[]>;
    biggestMovers: any[];
  };
  achievementSummary: {
    totalAchievements: number;
    newAchievements: any[];
    achievementsByTier: Record<string, number>;
    topAchievers: any[];
  };
  errorSummary: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    failedBusinesses: any[];
    recommendedActions: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(REPORT_CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(REPORT_CONFIG.OUTPUT_DIR, { recursive: true });
  }
}

// Load checkpoint data
function loadCheckpoint(): CheckpointData | null {
  try {
    if (fs.existsSync(REPORT_CONFIG.CHECKPOINT_FILE)) {
      const data = fs.readFileSync(REPORT_CONFIG.CHECKPOINT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Could not load checkpoint:", error);
  }
  return null;
}

// Parse error log
function parseErrorLog(): Array<{ timestamp: string; business: string; error: string }> {
  const errors: Array<{ timestamp: string; business: string; error: string }> = [];
  
  try {
    if (fs.existsSync(REPORT_CONFIG.ERROR_LOG_FILE)) {
      const content = fs.readFileSync(REPORT_CONFIG.ERROR_LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n');
      
      lines.forEach(line => {
        const match = line.match(/\[(.*?)\] (.*?): (.*)/);
        if (match) {
          const [, timestamp, business, error] = match;
          errors.push({ timestamp, business, error });
        }
      });
    }
  } catch (error) {
    console.error("Could not parse error log:", error);
  }
  
  return errors;
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

// Analyze business quality
async function analyzeBusinessQuality(businessId: string): Promise<BusinessAnalysis | null> {
  try {
    const business = await client.query(api.businesses.getBusinessById, { businessId });
    if (!business) return null;
    
    const ranking = await client.query(api.rankings.calculateRankings.getBusinessRanking, { 
      businessId 
    }).catch(() => null);
    
    const achievements = await client.query(api.achievements.getBusinessAchievements, { 
      businessId 
    }).catch(() => []);
    
    const qualityScore = business.overallScore || 0;
    const reviewCoverage = business.reviewCount ? 
      Math.min((business.reviewsAnalyzed || 0) / business.reviewCount * 100, 100) : 0;
    
    const attentionReasons: string[] = [];
    
    // Check for issues needing attention
    if (qualityScore < REPORT_CONFIG.LOW_CONFIDENCE_THRESHOLD) {
      attentionReasons.push(`Low quality score: ${qualityScore}%`);
    }
    
    if (business.reviewCount && business.reviewCount > REPORT_CONFIG.HIGH_REVIEW_THRESHOLD && reviewCoverage < 50) {
      attentionReasons.push(`Low review coverage: ${reviewCoverage.toFixed(1)}% of ${business.reviewCount} reviews`);
    }
    
    if (!ranking || ranking.rankingPosition > 100) {
      attentionReasons.push("Not in top 100 rankings");
    }
    
    return {
      business,
      ranking,
      achievements,
      qualityScore,
      reviewCoverage,
      needsAttention: attentionReasons.length > 0,
      attentionReasons
    };
  } catch (error) {
    console.error(`Error analyzing business ${businessId}:`, error);
    return null;
  }
}

// Generate comprehensive report
async function generateReport(): Promise<ReportData | null> {
  console.log("📊 Generating Enhanced Overnight Processing Report...\n");
  
  const checkpoint = loadCheckpoint();
  if (!checkpoint) {
    console.error("❌ No checkpoint file found. Make sure overnight processing has run.");
    return null;
  }
  
  const errors = parseErrorLog();
  const duration = Date.now() - checkpoint.startTime;
  
  // Calculate basic metrics
  const avgConfidence = checkpoint.totalSuccess > 0 
    ? checkpoint.qualityMetrics.totalConfidence / checkpoint.totalSuccess 
    : 0;
  const avgKeywords = checkpoint.totalSuccess > 0 
    ? checkpoint.qualityMetrics.totalKeywords / checkpoint.totalSuccess 
    : 0;
  
  console.log("📈 Analyzing processed businesses...");
  
  // Get all processed businesses details
  const processedAnalyses: BusinessAnalysis[] = [];
  for (let i = 0; i < Math.min(checkpoint.processedBusinesses.length, 50); i++) {
    const analysis = await analyzeBusinessQuality(checkpoint.processedBusinesses[i]);
    if (analysis) {
      processedAnalyses.push(analysis);
    }
    
    // Show progress
    if ((i + 1) % 10 === 0) {
      console.log(`   Analyzed ${i + 1}/${Math.min(checkpoint.processedBusinesses.length, 50)} businesses...`);
    }
  }
  
  // Get ranking data
  console.log("\n🏆 Fetching ranking data...");
  const topOverall = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, { 
    limit: 10 
  });
  
  // Get achievements data
  console.log("🎯 Fetching achievement data...");
  const recentAchievements = await client.query(api.achievements.getRecentAchievements, { 
    limit: 20 
  }).catch(() => []);
  
  // Analyze quality issues
  const lowConfidenceBusinesses = processedAnalyses
    .filter(a => a.qualityScore < REPORT_CONFIG.LOW_CONFIDENCE_THRESHOLD)
    .sort((a, b) => a.qualityScore - b.qualityScore);
  
  const highPerformers = processedAnalyses
    .filter(a => a.qualityScore >= 90)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);
  
  // Analyze errors
  const errorsByType: Record<string, number> = {};
  errors.forEach(error => {
    const type = error.error.includes('timeout') ? 'Timeout' :
                 error.error.includes('rate limit') ? 'Rate Limit' :
                 error.error.includes('API') ? 'API Error' :
                 'Other';
    errorsByType[type] = (errorsByType[type] || 0) + 1;
  });
  
  // Generate recommendations
  const recommendations = {
    immediate: [],
    shortTerm: [],
    longTerm: []
  };
  
  if (checkpoint.totalFailed > checkpoint.totalProcessed * 0.1) {
    recommendations.immediate.push("High failure rate detected - investigate error patterns");
  }
  
  if (lowConfidenceBusinesses.length > checkpoint.totalSuccess * 0.2) {
    recommendations.immediate.push(`${lowConfidenceBusinesses.length} businesses have low confidence scores - review AI analysis quality`);
  }
  
  if (avgConfidence < 85) {
    recommendations.shortTerm.push("Average confidence below target - consider adjusting review sampling or AI prompts");
  }
  
  if (checkpoint.totalReviewsAnalyzed > 10000) {
    recommendations.longTerm.push("High token usage - consider implementing review summarization for cost optimization");
  }
  
  // Calculate costs
  const totalCost = (checkpoint.totalTokensUsed * 0.15) / 1000000; // $0.15 per 1M tokens
  const costPerBusiness = checkpoint.totalSuccess > 0 ? totalCost / checkpoint.totalSuccess : 0;
  
  const report: ReportData = {
    checkpoint,
    processingSummary: {
      duration: formatDuration(duration),
      successRate: checkpoint.totalProcessed > 0 ? 
        (checkpoint.totalSuccess / checkpoint.totalProcessed) * 100 : 0,
      errorRate: checkpoint.totalProcessed > 0 ? 
        (checkpoint.totalFailed / checkpoint.totalProcessed) * 100 : 0,
      avgProcessingTime: checkpoint.totalProcessed > 0 ? 
        formatDuration(duration / checkpoint.totalProcessed) : "N/A",
      totalCost,
      costPerBusiness
    },
    qualitySummary: {
      avgConfidence,
      avgKeywords,
      lowConfidenceBusinesses: lowConfidenceBusinesses.slice(0, 10),
      highPerformers
    },
    rankingSummary: {
      totalRanked: processedAnalyses.filter(a => a.ranking).length,
      topOverall,
      topByCategory: {}, // Would need additional queries
      topByCity: {}, // Would need additional queries
      biggestMovers: [] // Would need historical data
    },
    achievementSummary: {
      totalAchievements: recentAchievements.length,
      newAchievements: recentAchievements.slice(0, 10),
      achievementsByTier: {}, // Would need additional analysis
      topAchievers: [] // Would need additional queries
    },
    errorSummary: {
      totalErrors: checkpoint.totalFailed,
      errorsByType,
      failedBusinesses: checkpoint.failedBusinesses,
      recommendedActions: recommendations.immediate
    },
    recommendations
  };
  
  return report;
}

// Format report for display
function displayReport(report: ReportData) {
  console.clear();
  console.log("🌅 OVERNIGHT PROCESSING REPORT - ENHANCED");
  console.log("=========================================");
  console.log(`Generated: ${new Date().toLocaleString()}\n`);
  
  // Executive Summary
  console.log("📋 EXECUTIVE SUMMARY");
  console.log("-------------------");
  console.log(`✅ Successfully processed ${report.checkpoint.totalSuccess} businesses in ${report.processingSummary.duration}`);
  console.log(`📊 Success Rate: ${report.processingSummary.successRate.toFixed(1)}%`);
  console.log(`💰 Total Cost: $${report.processingSummary.totalCost.toFixed(2)} ($${report.processingSummary.costPerBusiness.toFixed(3)}/business)`);
  console.log(`🎯 Average Quality Score: ${report.qualitySummary.avgConfidence.toFixed(1)}%\n`);
  
  // Quality Metrics
  console.log("📈 QUALITY METRICS");
  console.log("------------------");
  console.log(`Average Confidence: ${report.qualitySummary.avgConfidence.toFixed(1)}%`);
  console.log(`Average Keywords: ${report.qualitySummary.avgKeywords.toFixed(1)} per business`);
  console.log(`Low Confidence: ${report.checkpoint.qualityMetrics.lowConfidenceCount} businesses`);
  console.log(`Reviews Analyzed: ${report.checkpoint.totalReviewsAnalyzed.toLocaleString()}\n`);
  
  // Top Performers
  if (report.qualitySummary.highPerformers.length > 0) {
    console.log("🌟 TOP PERFORMERS");
    console.log("-----------------");
    report.qualitySummary.highPerformers.slice(0, 5).forEach((analysis, index) => {
      console.log(`${index + 1}. ${analysis.business.name} (${analysis.business.city})`);
      console.log(`   Score: ${analysis.qualityScore}/100 | Reviews: ${analysis.business.reviewCount}`);
    });
    console.log();
  }
  
  // Businesses Needing Attention
  if (report.qualitySummary.lowConfidenceBusinesses.length > 0) {
    console.log("⚠️  BUSINESSES NEEDING ATTENTION");
    console.log("--------------------------------");
    report.qualitySummary.lowConfidenceBusinesses.slice(0, 5).forEach(analysis => {
      console.log(`• ${analysis.business.name} (${analysis.business.city})`);
      analysis.attentionReasons.forEach(reason => {
        console.log(`  - ${reason}`);
      });
    });
    console.log();
  }
  
  // Error Summary
  if (report.errorSummary.totalErrors > 0) {
    console.log("❌ ERROR SUMMARY");
    console.log("----------------");
    console.log(`Total Errors: ${report.errorSummary.totalErrors}`);
    Object.entries(report.errorSummary.errorsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log();
    
    if (report.errorSummary.failedBusinesses.length > 0) {
      console.log("Failed Businesses:");
      report.errorSummary.failedBusinesses.slice(0, 5).forEach(failure => {
        console.log(`  • ${failure.businessName}: ${failure.error.substring(0, 50)}...`);
      });
      console.log();
    }
  }
  
  // Current Rankings
  if (report.rankingSummary.topOverall.length > 0) {
    console.log("🏆 CURRENT TOP RANKINGS");
    console.log("-----------------------");
    report.rankingSummary.topOverall.slice(0, 5).forEach((ranking, index) => {
      console.log(`${index + 1}. ${ranking.business.name} - ${ranking.overallScore}/100`);
      console.log(`   ${ranking.business.city} | ${ranking.business.category?.name || 'Unknown'}`);
    });
    console.log();
  }
  
  // Recommendations
  console.log("💡 RECOMMENDATIONS");
  console.log("------------------");
  
  if (report.recommendations.immediate.length > 0) {
    console.log("🚨 Immediate Actions:");
    report.recommendations.immediate.forEach(rec => {
      console.log(`   • ${rec}`);
    });
    console.log();
  }
  
  if (report.recommendations.shortTerm.length > 0) {
    console.log("📅 Short-term Improvements:");
    report.recommendations.shortTerm.forEach(rec => {
      console.log(`   • ${rec}`);
    });
    console.log();
  }
  
  if (report.recommendations.longTerm.length > 0) {
    console.log("🎯 Long-term Optimizations:");
    report.recommendations.longTerm.forEach(rec => {
      console.log(`   • ${rec}`);
    });
  }
}

// Save report to file
function saveReport(report: ReportData) {
  ensureOutputDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `overnight-report-${timestamp}.json`;
  const filepath = path.join(REPORT_CONFIG.OUTPUT_DIR, filename);
  
  // Save detailed JSON report
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  
  // Save summary text report
  const summaryFilename = `overnight-summary-${timestamp}.txt`;
  const summaryPath = path.join(REPORT_CONFIG.OUTPUT_DIR, summaryFilename);
  
  let summary = `OVERNIGHT PROCESSING SUMMARY
Generated: ${new Date().toLocaleString()}
========================================

PROCESSING RESULTS
------------------
Duration: ${report.processingSummary.duration}
Total Processed: ${report.checkpoint.totalProcessed}
Successful: ${report.checkpoint.totalSuccess} (${report.processingSummary.successRate.toFixed(1)}%)
Failed: ${report.checkpoint.totalFailed} (${report.processingSummary.errorRate.toFixed(1)}%)

QUALITY METRICS
---------------
Average Confidence: ${report.qualitySummary.avgConfidence.toFixed(1)}%
Average Keywords: ${report.qualitySummary.avgKeywords.toFixed(1)}
Low Confidence Count: ${report.checkpoint.qualityMetrics.lowConfidenceCount}
Reviews Analyzed: ${report.checkpoint.totalReviewsAnalyzed.toLocaleString()}

COST ANALYSIS
-------------
Total Tokens: ~${report.checkpoint.totalTokensUsed.toLocaleString()}
Total Cost: $${report.processingSummary.totalCost.toFixed(2)}
Cost per Business: $${report.processingSummary.costPerBusiness.toFixed(3)}

RECOMMENDATIONS
---------------
`;

  if (report.recommendations.immediate.length > 0) {
    summary += "\nImmediate Actions:\n";
    report.recommendations.immediate.forEach(rec => {
      summary += `• ${rec}\n`;
    });
  }
  
  if (report.recommendations.shortTerm.length > 0) {
    summary += "\nShort-term Improvements:\n";
    report.recommendations.shortTerm.forEach(rec => {
      summary += `• ${rec}\n`;
    });
  }
  
  fs.writeFileSync(summaryPath, summary);
  
  console.log(`\n\n📄 Reports saved:`);
  console.log(`   Detailed: ${filepath}`);
  console.log(`   Summary: ${summaryPath}`);
}

// Main function
async function main() {
  try {
    const report = await generateReport();
    
    if (!report) {
      console.error("❌ Could not generate report");
      process.exit(1);
    }
    
    displayReport(report);
    saveReport(report);
    
    console.log("\n\n✅ Report generation complete!");
    
  } catch (error) {
    console.error("❌ Error generating report:", error);
    process.exit(1);
  }
}

// Run the report generator
main();