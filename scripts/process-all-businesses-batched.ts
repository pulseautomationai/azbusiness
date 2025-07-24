import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import logger from "./analysis-logger";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Batch configuration
const BATCH_SIZE = 100; // Process 100 businesses per batch
const PAUSE_BETWEEN_BATCHES = 30000; // 30 seconds between batches
const SMALL_DELAY = 2000; // 2 seconds between individual businesses
const MAX_RETRIES = 3;

interface BusinessWithReviewCount {
  _id: Id<"businesses">;
  name: string;
  city: string;
  category?: { name: string };
  reviewCount: number;
  hasAIAnalysis?: boolean;
  lastAnalyzed?: number;
}

interface BatchProgress {
  totalBatches: number;
  currentBatch: number;
  processedBusinesses: number;
  totalBusinesses: number;
  startTime: number;
  estimatedTimeRemaining: string;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skipAnalyzed: true,
    daysThreshold: 7,
    dryRun: false,
    startBatch: 1,
    maxBatches: undefined as number | undefined,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--force':
        options.skipAnalyzed = false;
        break;
      case '--days':
        options.daysThreshold = parseInt(args[i + 1]);
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--start-batch':
        options.startBatch = parseInt(args[i + 1]);
        i++;
        break;
      case '--max-batches':
        options.maxBatches = parseInt(args[i + 1]);
        i++;
        break;
      case '--help':
        console.log(`
Batch Process All Businesses - AI Analysis & Ranking

Options:
  --force          Re-analyze even recently analyzed businesses
  --days <n>       Days threshold for skipping (default: 7)
  --dry-run        Show what would be processed without running
  --start-batch <n> Start from specific batch number
  --max-batches <n> Maximum number of batches to process
  --help           Show this help message

Examples:
  npm run process-all-batched                    # Process all businesses
  npm run process-all-batched -- --dry-run       # Preview batches
  npm run process-all-batched -- --start-batch 5 # Resume from batch 5
  npm run process-all-batched -- --max-batches 10 # Process only 10 batches
        `);
        process.exit(0);
    }
  }

  return options;
}

// Fetch all businesses with reviews
async function fetchAllBusinessesWithReviews(): Promise<BusinessWithReviewCount[]> {
  console.log("📋 Fetching all businesses with reviews...");
  const allBusinesses: BusinessWithReviewCount[] = [];
  let cursor: string | null | undefined = undefined;
  let pageNum = 1;
  
  do {
    console.log(`  📄 Fetching page ${pageNum}...`);
    const response = await client.query(api.businesses.getBusinessesWithReviewCounts, {
      limit: 50,
      cursor
    }) as {
      businesses: BusinessWithReviewCount[];
      nextCursor: string | null;
      hasMore: boolean;
    };
    
    allBusinesses.push(...response.businesses);
    cursor = response.nextCursor;
    pageNum++;
    
    if (response.hasMore) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } while (cursor);
  
  // Filter to only businesses with reviews
  const businessesWithReviews = allBusinesses.filter(b => b.reviewCount > 0);
  console.log(`✅ Found ${businessesWithReviews.length} businesses with reviews`);
  
  return businessesWithReviews;
}

// Process a single batch of businesses
async function processBatch(
  businesses: BusinessWithReviewCount[], 
  batchNumber: number, 
  options: any,
  progress: BatchProgress
): Promise<{ successful: number; failed: number; skipped: number }> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 BATCH ${batchNumber} - Processing ${businesses.length} businesses`);
  console.log(`${"=".repeat(60)}\n`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const businessNum = (batchNumber - 1) * BATCH_SIZE + i + 1;
    
    console.log(`[${businessNum}/${progress.totalBusinesses}] Processing: ${business.name}`);
    console.log(`  📍 ${business.city} | 📝 ${business.reviewCount} reviews`);
    
    // Check if already analyzed recently
    if (options.skipAnalyzed && business.hasAIAnalysis && business.lastAnalyzed) {
      const daysSinceAnalysis = (Date.now() - business.lastAnalyzed) / (1000 * 60 * 60 * 24);
      if (daysSinceAnalysis < options.daysThreshold) {
        console.log(`  ⏭️  Skipping - analyzed ${Math.round(daysSinceAnalysis)} days ago`);
        skipped++;
        continue;
      }
    }
    
    // Process the business with retries
    let retries = 0;
    let success = false;
    
    while (retries < MAX_RETRIES && !success) {
      try {
        console.log(`  🤖 Analyzing reviews with Internal Analyzer...`);
        const analysisStartTime = Date.now();
        
        const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
          businessId: business._id,
          batchSize: 50,
          skipExisting: false,
        });
        
        const processingTime = Date.now() - analysisStartTime;
        
        if (result.success) {
          successful++;
          success = true;
          console.log(`  ✅ Success! ${result.message} (${processingTime}ms)`);
          logger.analysisCompleted(business._id, business.name, 0, processingTime);
        } else {
          throw new Error(result.message);
        }
        
      } catch (error) {
        retries++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Attempt ${retries}/${MAX_RETRIES} failed: ${errorMsg}`);
        
        if (retries < MAX_RETRIES) {
          console.log(`  ⏳ Retrying in 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          failed++;
          logger.analysisFailed(business._id, business.name, errorMsg);
        }
      }
    }
    
    // Small delay between businesses
    await new Promise(resolve => setTimeout(resolve, SMALL_DELAY));
  }
  
  return { successful, failed, skipped };
}

// Update progress display
function displayProgress(progress: BatchProgress) {
  const elapsedTime = Date.now() - progress.startTime;
  const avgTimePerBatch = elapsedTime / progress.currentBatch;
  const remainingBatches = progress.totalBatches - progress.currentBatch;
  const estimatedTimeMs = remainingBatches * avgTimePerBatch;
  
  progress.estimatedTimeRemaining = formatTime(Math.round(estimatedTimeMs / 1000));
  
  console.log(`\n📊 OVERALL PROGRESS`);
  console.log(`   Batches: ${progress.currentBatch}/${progress.totalBatches}`);
  console.log(`   Businesses: ${progress.processedBusinesses}/${progress.totalBusinesses}`);
  console.log(`   Progress: ${Math.round((progress.processedBusinesses / progress.totalBusinesses) * 100)}%`);
  console.log(`   Est. Time Remaining: ${progress.estimatedTimeRemaining}`);
  console.log(`   Elapsed Time: ${formatTime(Math.round(elapsedTime / 1000))}`);
}

// Format time helper
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Trigger ranking recalculation for all businesses
async function triggerRankingRecalculation() {
  console.log("\n🏆 Triggering ranking recalculation for ALL businesses...");
  
  try {
    // Use cursor-based pagination for ranking calculation
    let cursor: string | null | undefined = undefined;
    let batchNum = 1;
    let totalScheduled = 0;
    const rankingBatchSize = 100; // Smaller batches to avoid overwhelming scheduler
    
    do {
      console.log(`  📊 Scheduling ranking batch ${batchNum}...`);
      
      const result = await client.mutation(api.rankings.calculateRankings.batchCalculateRankingsPublic, {
        limit: rankingBatchSize,
        cursor: cursor
      });
      
      totalScheduled += result.scheduled;
      cursor = result.nextCursor || null;
      
      console.log(`    ✓ Scheduled ${result.scheduled} businesses (Total: ${totalScheduled})`);
      
      if (result.hasMore && cursor) {
        batchNum++;
        // Wait between ranking batches to avoid overwhelming the scheduler
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      }
    } while (cursor);
    
    console.log(`  ✅ All ${totalScheduled} businesses scheduled for ranking!`);
  } catch (error) {
    console.error("  ❌ Error scheduling rankings:", error);
  }
}

// Main processing function
async function processAllBusinessesBatched() {
  const options = parseArgs();
  
  console.log("🚀 Batch Processing All Businesses with AI Analysis");
  console.log("📊 Using Internal Analyzer for efficiency");
  console.log("⚙️  Options:", JSON.stringify(options, null, 2), "\n");
  
  try {
    // Fetch all businesses
    const allBusinesses = await fetchAllBusinessesWithReviews();
    
    // Sort by review count (process businesses with more reviews first)
    allBusinesses.sort((a, b) => b.reviewCount - a.reviewCount);
    
    // Calculate batches
    const totalBatches = Math.ceil(allBusinesses.length / BATCH_SIZE);
    const startBatch = options.startBatch;
    const endBatch = options.maxBatches 
      ? Math.min(startBatch + options.maxBatches - 1, totalBatches)
      : totalBatches;
    
    console.log(`\n📦 BATCH PLAN`);
    console.log(`   Total businesses: ${allBusinesses.length}`);
    console.log(`   Batch size: ${BATCH_SIZE}`);
    console.log(`   Total batches: ${totalBatches}`);
    console.log(`   Processing batches: ${startBatch} to ${endBatch}`);
    console.log(`   Pause between batches: ${PAUSE_BETWEEN_BATCHES / 1000}s`);
    
    if (options.dryRun) {
      console.log("\n🔍 DRY RUN - Preview of batches:");
      for (let i = startBatch; i <= endBatch; i++) {
        const startIdx = (i - 1) * BATCH_SIZE;
        const endIdx = Math.min(startIdx + BATCH_SIZE, allBusinesses.length);
        const batchBusinesses = allBusinesses.slice(startIdx, endIdx);
        
        console.log(`\nBatch ${i}: ${batchBusinesses.length} businesses`);
        console.log(`  First: ${batchBusinesses[0]?.name || 'N/A'} (${batchBusinesses[0]?.reviewCount || 0} reviews)`);
        console.log(`  Last: ${batchBusinesses[batchBusinesses.length - 1]?.name || 'N/A'} (${batchBusinesses[batchBusinesses.length - 1]?.reviewCount || 0} reviews)`);
      }
      return;
    }
    
    // Initialize progress tracking
    const progress: BatchProgress = {
      totalBatches: endBatch - startBatch + 1,
      currentBatch: 0,
      processedBusinesses: (startBatch - 1) * BATCH_SIZE,
      totalBusinesses: allBusinesses.length,
      startTime: Date.now(),
      estimatedTimeRemaining: "calculating...",
    };
    
    // Start batch logging
    logger.batchStarted(allBusinesses.length, options);
    
    // Process each batch
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    
    for (let batchNum = startBatch; batchNum <= endBatch; batchNum++) {
      progress.currentBatch = batchNum - startBatch + 1;
      
      const startIdx = (batchNum - 1) * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, allBusinesses.length);
      const batchBusinesses = allBusinesses.slice(startIdx, endIdx);
      
      if (batchBusinesses.length === 0) break;
      
      // Process the batch
      const batchResults = await processBatch(batchBusinesses, batchNum, options, progress);
      
      totalSuccessful += batchResults.successful;
      totalFailed += batchResults.failed;
      totalSkipped += batchResults.skipped;
      progress.processedBusinesses = Math.min(endIdx, allBusinesses.length);
      
      // Display progress
      displayProgress(progress);
      
      // Pause between batches (except for the last one)
      if (batchNum < endBatch && endIdx < allBusinesses.length) {
        console.log(`\n⏸️  Pausing ${PAUSE_BETWEEN_BATCHES / 1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_BATCHES));
      }
    }
    
    // Final report
    const totalTime = Math.round((Date.now() - progress.startTime) / 1000);
    logger.batchCompleted(totalSuccessful, totalFailed, totalSkipped, totalTime);
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 BATCH PROCESSING COMPLETE");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${totalSuccessful} businesses`);
    console.log(`⏭️  Skipped: ${totalSkipped} businesses (recently analyzed)`);
    console.log(`❌ Failed: ${totalFailed} businesses`);
    console.log(`⏱️  Total time: ${formatTime(totalTime)}`);
    console.log("=".repeat(60));
    
    // Trigger ranking recalculation
    await triggerRankingRecalculation();
    
    console.log("\n✅ All done! Your businesses are being ranked.");
    console.log("📁 Logs saved to: logs/ai-analysis/");
    
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
const args = process.argv.slice(2);
if (args.length === 0 || !args.includes('--help')) {
  console.log("🚀 Batch Process All Businesses");
  console.log("=====================================");
  console.log("This script processes ALL businesses in manageable batches");
  console.log("to avoid Convex memory limits and scheduling restrictions.");
  console.log("\n💡 Tip: Use --help to see all options");
  console.log("\nStarting in 3 seconds...\n");

  setTimeout(() => {
    processAllBusinessesBatched()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
      });
  }, 3000);
} else {
  // If --help is specified, parseArgs will handle it
  processAllBusinessesBatched();
}