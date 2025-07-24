#!/usr/bin/env npx tsx
/**
 * Enhanced Overnight Business Processing with Dynamic Review Sampling
 * Processes businesses in order of review count with intelligent sampling
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

// Enhanced configuration with dynamic review sampling
const OVERNIGHT_CONFIG = {
  BATCH_SIZE: 5,                    // Reduced to prevent overload with more reviews
  DELAY_BETWEEN_BATCHES: 8000,      // 8 seconds between batches
  DELAY_BETWEEN_BUSINESSES: 3000,   // 3 seconds between businesses
  ERROR_RETRY_LIMIT: 2,
  PAUSE_ON_ERROR_COUNT: 5,
  MIN_CONFIDENCE_SCORE: 80,
  MIN_KEYWORDS_EXTRACTED: 5,
  CHECKPOINT_INTERVAL: 10,          // Save progress every 10 businesses
  
  // Dynamic review sampling based on total reviews
  getReviewSampleSize: (totalReviews: number): number => {
    if (totalReviews >= 500) return 60;
    if (totalReviews >= 250) return 50;
    if (totalReviews >= 100) return 40;
    if (totalReviews >= 50) return 30;
    if (totalReviews >= 25) return 20;
    return totalReviews; // For <25, analyze all
  }
};

// Checkpoint file paths
const CHECKPOINT_FILE = 'logs/overnight-checkpoint.json';
const ERROR_LOG_FILE = 'logs/overnight-errors.log';
const PROGRESS_LOG_FILE = 'logs/overnight-progress.log';

// Ensure logs directory exists
const logsDir = path.dirname(CHECKPOINT_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

interface ProcessingState {
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
  consecutiveErrors: number;
  lastCheckpoint: number;
  totalReviewsAnalyzed: number;
  totalTokensUsed: number;
  qualityMetrics: {
    totalConfidence: number;
    totalKeywords: number;
    lowConfidenceCount: number;
  };
}

// Load or initialize processing state
function loadCheckpoint(): ProcessingState {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, 'utf-8');
      console.log("📂 Loaded checkpoint from previous run");
      return JSON.parse(data);
    }
  } catch (error) {
    console.log("⚠️  Could not load checkpoint, starting fresh");
  }
  
  return {
    startTime: Date.now(),
    processedBusinesses: [],
    failedBusinesses: [],
    totalProcessed: 0,
    totalSuccess: 0,
    totalFailed: 0,
    consecutiveErrors: 0,
    lastCheckpoint: Date.now(),
    totalReviewsAnalyzed: 0,
    totalTokensUsed: 0,
    qualityMetrics: {
      totalConfidence: 0,
      totalKeywords: 0,
      lowConfidenceCount: 0
    }
  };
}

// Save checkpoint
function saveCheckpoint(state: ProcessingState) {
  try {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(state, null, 2));
    state.lastCheckpoint = Date.now();
  } catch (error) {
    console.error("❌ Failed to save checkpoint:", error);
  }
}

// Log error
function logError(businessName: string, error: any) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${businessName}: ${error.message || error}\n`;
  fs.appendFileSync(ERROR_LOG_FILE, errorMessage);
}

// Log progress
function logProgress(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(PROGRESS_LOG_FILE, logMessage);
  console.log(message);
}

// Calculate estimated completion time
function estimateCompletion(state: ProcessingState, remaining: number): string {
  if (state.totalProcessed === 0) return "Calculating...";
  
  const avgTimePerBusiness = (Date.now() - state.startTime) / state.totalProcessed;
  const remainingTime = avgTimePerBusiness * remaining;
  const completionTime = new Date(Date.now() + remainingTime);
  
  return completionTime.toLocaleTimeString();
}

// Process a single business with enhanced error handling
async function processBusiness(
  business: any, 
  state: ProcessingState,
  retryCount: number = 0
): Promise<boolean> {
  try {
    const reviewCount = business.reviewCount || 0;
    const sampleSize = OVERNIGHT_CONFIG.getReviewSampleSize(reviewCount);
    
    logProgress(
      `\n🏢 Processing: ${business.name} (${business.city})\n` +
      `   Reviews: ${reviewCount} total, analyzing ${sampleSize}`
    );
    
    // Process with AI
    const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: business._id,
      batchSize: sampleSize,
      skipExisting: false
    });
    
    if (result.success) {
      // Update quality metrics
      const confidence = result.insights?.confidence || 0;
      const keywords = result.insights?.topKeywords?.length || 0;
      
      state.qualityMetrics.totalConfidence += confidence;
      state.qualityMetrics.totalKeywords += keywords;
      
      if (confidence < OVERNIGHT_CONFIG.MIN_CONFIDENCE_SCORE) {
        state.qualityMetrics.lowConfidenceCount++;
        logProgress(`   ⚠️  Low confidence: ${confidence}% (may need review)`);
      }
      
      state.totalReviewsAnalyzed += sampleSize;
      state.totalTokensUsed += sampleSize * 200; // Rough estimate
      
      logProgress(
        `   ✅ Success! Confidence: ${confidence}%, Keywords: ${keywords}\n` +
        `   Message: ${result.message}`
      );
      
      return true;
    } else {
      throw new Error(result.message || "Unknown error");
    }
    
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    
    if (retryCount < OVERNIGHT_CONFIG.ERROR_RETRY_LIMIT) {
      logProgress(`   ⚠️  Error: ${errorMsg}, retrying (${retryCount + 1}/${OVERNIGHT_CONFIG.ERROR_RETRY_LIMIT})...`);
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
      
      return processBusiness(business, state, retryCount + 1);
    } else {
      logError(business.name, error);
      state.failedBusinesses.push({
        businessId: business._id,
        businessName: business.name,
        error: errorMsg,
        attempts: retryCount + 1
      });
      
      logProgress(`   ❌ Failed after ${retryCount + 1} attempts: ${errorMsg}`);
      return false;
    }
  }
}

// Main processing function
async function processOvernight() {
  console.log("🌙 ENHANCED OVERNIGHT PROCESSING");
  console.log("================================\n");
  
  const state = loadCheckpoint();
  
  try {
    // Get all businesses pending analysis
    logProgress("📊 Fetching businesses for processing...");
    
    const allBusinesses = await client.query(api.businesses.getBusinesses, { 
      limit: 500 
    });
    
    // Filter businesses that need processing
    const pendingBusinesses = allBusinesses
      .filter(b => {
        const hasReviews = b.reviewCount && b.reviewCount >= 5;
        const notProcessed = !state.processedBusinesses.includes(b._id);
        const needsAnalysis = !b.overallScore || b.overallScore === 0;
        return hasReviews && notProcessed && needsAnalysis;
      })
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); // Highest reviews first
    
    logProgress(`Found ${pendingBusinesses.length} businesses to process`);
    
    if (pendingBusinesses.length === 0) {
      logProgress("✅ All businesses have been processed!");
      return;
    }
    
    // Process in batches
    for (let i = 0; i < pendingBusinesses.length; i += OVERNIGHT_CONFIG.BATCH_SIZE) {
      const batch = pendingBusinesses.slice(i, i + OVERNIGHT_CONFIG.BATCH_SIZE);
      const batchNumber = Math.floor(i / OVERNIGHT_CONFIG.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(pendingBusinesses.length / OVERNIGHT_CONFIG.BATCH_SIZE);
      
      logProgress(
        `\n📦 Batch ${batchNumber}/${totalBatches} - Processing ${batch.length} businesses\n` +
        `   Progress: ${state.totalProcessed}/${pendingBusinesses.length + state.totalProcessed} total\n` +
        `   Est. completion: ${estimateCompletion(state, pendingBusinesses.length - i)}`
      );
      
      // Process each business in the batch
      for (const business of batch) {
        const success = await processBusiness(business, state);
        
        state.totalProcessed++;
        if (success) {
          state.totalSuccess++;
          state.processedBusinesses.push(business._id);
          state.consecutiveErrors = 0;
        } else {
          state.totalFailed++;
          state.consecutiveErrors++;
        }
        
        // Check for too many consecutive errors
        if (state.consecutiveErrors >= OVERNIGHT_CONFIG.PAUSE_ON_ERROR_COUNT) {
          logProgress("\n🚨 Too many consecutive errors, pausing for 30 seconds...");
          await new Promise(resolve => setTimeout(resolve, 30000));
          state.consecutiveErrors = 0;
        }
        
        // Save checkpoint periodically
        if (state.totalProcessed % OVERNIGHT_CONFIG.CHECKPOINT_INTERVAL === 0) {
          saveCheckpoint(state);
          logProgress("💾 Checkpoint saved");
        }
        
        // Delay between businesses
        await new Promise(resolve => setTimeout(resolve, OVERNIGHT_CONFIG.DELAY_BETWEEN_BUSINESSES));
      }
      
      // Delay between batches
      if (i + OVERNIGHT_CONFIG.BATCH_SIZE < pendingBusinesses.length) {
        logProgress(`\n⏳ Waiting ${OVERNIGHT_CONFIG.DELAY_BETWEEN_BATCHES / 1000}s before next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, OVERNIGHT_CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Final summary
    const duration = Math.round((Date.now() - state.startTime) / 1000 / 60);
    const avgConfidence = state.qualityMetrics.totalConfidence / state.totalSuccess;
    const avgKeywords = state.qualityMetrics.totalKeywords / state.totalSuccess;
    const estimatedCost = (state.totalTokensUsed * 0.15) / 1000000; // $0.15 per 1M tokens
    
    const summary = `
🎉 OVERNIGHT PROCESSING COMPLETE!
================================
Duration: ${duration} minutes
Total Processed: ${state.totalProcessed}
Successful: ${state.totalSuccess} (${Math.round(state.totalSuccess / state.totalProcessed * 100)}%)
Failed: ${state.totalFailed}
Reviews Analyzed: ${state.totalReviewsAnalyzed}

📊 Quality Metrics:
Average Confidence: ${Math.round(avgConfidence)}%
Average Keywords: ${Math.round(avgKeywords)}
Low Confidence: ${state.qualityMetrics.lowConfidenceCount} businesses

💰 Cost Estimate:
Tokens Used: ~${state.totalTokensUsed.toLocaleString()}
Estimated Cost: $${estimatedCost.toFixed(2)}

${state.failedBusinesses.length > 0 ? `\n❌ Failed Businesses:\n${state.failedBusinesses.map(f => `   - ${f.businessName}: ${f.error}`).join('\n')}` : ''}
`;
    
    logProgress(summary);
    
    // Save final state
    saveCheckpoint(state);
    
    // Create completion report
    const reportPath = `logs/overnight-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: summary,
      state: state,
      completedAt: new Date().toISOString()
    }, null, 2));
    
    logProgress(`\n📄 Full report saved to: ${reportPath}`);
    
  } catch (error) {
    logProgress(`\n❌ Fatal error: ${error}`);
    saveCheckpoint(state);
    process.exit(1);
  }
}

// Run the overnight processor
processOvernight().then(() => {
  console.log("\n✅ Processing complete. Good morning! ☀️");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Overnight processing failed:", error);
  process.exit(1);
});