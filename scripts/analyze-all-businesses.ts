import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import logger from "./analysis-logger";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

interface BusinessWithReviewCount {
  _id: Id<"businesses">;
  name: string;
  city: string;
  category?: { name: string };
  reviewCount: number;
  hasAIAnalysis?: boolean;
  lastAnalyzed?: number;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: undefined as number | undefined,
    city: undefined as string | undefined,
    skipAnalyzed: true,
    daysThreshold: 7,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        options.limit = parseInt(args[i + 1]);
        i++;
        break;
      case '--city':
        options.city = args[i + 1];
        i++;
        break;
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
      case '--help':
        console.log(`
AI Analysis Bulk Processor Options:
  --limit <n>      Limit number of businesses to process
  --city <name>    Only process businesses in specific city
  --force          Re-analyze even recently analyzed businesses
  --days <n>       Days threshold for skipping (default: 7)
  --dry-run        Show what would be processed without running
  --help           Show this help message

Examples:
  npm run analyze-all -- --limit 50
  npm run analyze-all -- --city Phoenix --limit 100
  npm run analyze-all -- --force --limit 10
  npm run analyze-all -- --dry-run
        `);
        process.exit(0);
    }
  }

  return options;
}

async function analyzeAllBusinesses() {
  const options = parseArgs();
  
  console.log("🚀 Starting bulk AI analysis for businesses with reviews");
  console.log("📊 Using Internal Analyzer for maximum efficiency");
  console.log("⚙️  Options:", JSON.stringify(options, null, 2), "\n");

  try {
    // Get all businesses with review counts using pagination
    console.log("📋 Fetching businesses with reviews...");
    const allBusinesses: BusinessWithReviewCount[] = [];
    let cursor: string | null | undefined = undefined;
    let pageNum = 1;
    
    // Fetch all businesses page by page
    do {
      console.log(`  📄 Fetching page ${pageNum}...`);
      const response = await client.query(api.businesses.getBusinessesWithReviewCounts, {
        limit: 50, // Fetch 50 at a time to avoid query limits
        cursor
      }) as {
        businesses: BusinessWithReviewCount[];
        nextCursor: string | null;
        hasMore: boolean;
      };
      
      allBusinesses.push(...response.businesses);
      cursor = response.nextCursor;
      pageNum++;
      
      // Small delay between pages to avoid overloading
      if (response.hasMore) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } while (cursor);
    
    console.log(`✅ Fetched ${allBusinesses.length} businesses`);
    
    // Filter to only businesses with reviews
    let businessesWithReviews = allBusinesses.filter(b => b.reviewCount > 0);
    
    // Apply city filter if specified
    if (options.city) {
      businessesWithReviews = businessesWithReviews.filter(b => 
        b.city.toLowerCase() === options.city!.toLowerCase()
      );
      console.log(`🏙️  Filtered to ${businessesWithReviews.length} businesses in ${options.city}`);
    }
    
    console.log(`✅ Found ${businessesWithReviews.length} businesses with reviews`);
    console.log(`📊 Total reviews to analyze: ${businessesWithReviews.reduce((sum, b) => sum + b.reviewCount, 0)}\n`);

    // Sort by review count (process businesses with more reviews first)
    businessesWithReviews.sort((a, b) => b.reviewCount - a.reviewCount);

    // Apply limit if specified
    if (options.limit) {
      businessesWithReviews = businessesWithReviews.slice(0, options.limit);
      console.log(`🎯 Limited to ${businessesWithReviews.length} businesses\n`);
    }

    // If dry run, just show what would be processed
    if (options.dryRun) {
      console.log("🔍 DRY RUN - Would process these businesses:");
      businessesWithReviews.forEach((b, i) => {
        const status = b.hasAIAnalysis ? "✓ Analyzed" : "○ Not analyzed";
        console.log(`  ${i + 1}. ${b.name} (${b.city}) - ${b.reviewCount} reviews [${status}]`);
      });
      console.log(`\n📊 Total: ${businessesWithReviews.length} businesses`);
      return;
    }

    // Track progress
    let processed = 0;
    let successful = 0;
    let failed = 0;
    let skipped = 0;
    const startTime = Date.now();

    // Log batch start
    logger.batchStarted(businessesWithReviews.length, options);

    // Process each business with better rate limiting
    for (const business of businessesWithReviews) {
      processed++;
      const progress = Math.round((processed / businessesWithReviews.length) * 100);
      
      console.log(`\n[${processed}/${businessesWithReviews.length}] (${progress}%) Processing: ${business.name}`);
      console.log(`  📍 ${business.city} | 📝 ${business.reviewCount} reviews`);

      try {
        // Check if already analyzed recently
        if (options.skipAnalyzed && business.hasAIAnalysis && business.lastAnalyzed) {
          const daysSinceAnalysis = (Date.now() - business.lastAnalyzed) / (1000 * 60 * 60 * 24);
          if (daysSinceAnalysis < options.daysThreshold) {
            console.log(`  ⏭️  Skipping - analyzed ${Math.round(daysSinceAnalysis)} days ago`);
            logger.analysisSkipped(business._id, business.name, `Analyzed ${Math.round(daysSinceAnalysis)} days ago`);
            skipped++;
            continue;
          }
        }

        // Process the business reviews
        console.log(`  🤖 Analyzing reviews with Internal Analyzer...`);
        const analysisStartTime = Date.now();
        logger.analysisStarted(business._id, business.name, business.reviewCount);
        
        const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
          businessId: business._id,
          batchSize: 50, // Internal analyzer can handle larger batches
          skipExisting: false, // Re-analyze to ensure consistency
        });

        const processingTime = Date.now() - analysisStartTime;

        if (result.success) {
          successful++;
          console.log(`  ✅ Success! ${result.message}`);
          let overallScore = 0;
          if (result.insights?.performanceScores) {
            overallScore = Math.round(
              (result.insights.performanceScores.speed + 
               result.insights.performanceScores.value + 
               result.insights.performanceScores.quality + 
               result.insights.performanceScores.reliability) * 2.5
            );
            console.log(`  📊 Overall Score: ${overallScore}/100`);
          }
          logger.analysisCompleted(business._id, business.name, overallScore, processingTime);
        } else {
          failed++;
          console.log(`  ❌ Failed: ${result.message}`);
          logger.analysisFailed(business._id, business.name, result.message);
        }

        // Enhanced rate limiting to prevent Convex overload
        if (processed % 5 === 0) {
          console.log("\n⏸️  Pausing to prevent Convex overload (5 sec)...");
          logger.rateLimitPause(5000);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (processed % 10 === 0) {
          console.log("\n⏸️  Extended pause for system health (10 sec)...");
          logger.rateLimitPause(10000);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          // Small delay between each business
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        failed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Error: ${errorMsg}`);
        logger.analysisFailed(business._id, business.name, errorMsg);
      }
    }

    // Final report
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    // Log batch completion
    logger.batchCompleted(successful, failed, skipped, totalTime);

    console.log("\n" + "=".repeat(60));
    console.log("📊 BULK ANALYSIS COMPLETE");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successful} businesses`);
    console.log(`⏭️  Skipped: ${skipped} businesses (recently analyzed)`);
    console.log(`❌ Failed: ${failed} businesses`);
    console.log(`⏱️  Total time: ${minutes}m ${seconds}s`);
    console.log(`⚡ Average time per business: ${(totalTime / processed).toFixed(1)}s`);
    console.log("=".repeat(60));
    console.log("\n📁 Logs saved to: logs/ai-analysis/");
    console.log("   Run 'npm run analyze-log report' for detailed report");

    // Trigger ranking recalculation for all categories
    console.log("\n🏆 Triggering ranking recalculation...");
    await client.mutation(api.rankings.calculateRankings.batchCalculateRankingsPublic, {
      limit: 1000, // Process all businesses
    });
    console.log("✅ Ranking recalculation scheduled");

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Add progress tracking function
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

// Estimate remaining time
function estimateRemainingTime(processed: number, total: number, elapsedSeconds: number): string {
  if (processed === 0) return "calculating...";
  
  const avgSecondsPerItem = elapsedSeconds / processed;
  const remaining = total - processed;
  const estimatedSeconds = Math.round(remaining * avgSecondsPerItem);
  
  return formatTime(estimatedSeconds);
}

// Run the script
const args = process.argv.slice(2);
if (args.length === 0 || !args.includes('--help')) {
  console.log("🚀 AI Business Analysis Bulk Processor");
  console.log("=====================================");
  console.log("Provider: Internal Analyzer (Optimized for speed)");
  console.log("Batch Size: 50 reviews per business");
  console.log("Rate Limiting: Pauses every 5 businesses to prevent overload");
  console.log("\n💡 Tip: Use --help to see all options");
  console.log("💡 Tip: Use --dry-run to preview what will be processed");
  console.log("\nStarting in 3 seconds...\n");

  setTimeout(() => {
    analyzeAllBusinesses()
      .then(() => {
        console.log("\n✅ All done! Your businesses now have AI-powered quality scores.");
        process.exit(0);
      })
      .catch((error) => {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
      });
  }, 3000);
} else {
  // If --help is specified, parseArgs will handle it
  analyzeAllBusinesses();
}