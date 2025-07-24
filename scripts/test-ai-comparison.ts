#!/usr/bin/env npx tsx
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import * as fs from "fs";

// Configuration
const BUSINESS_ID = "jn77gkwyvzqketaxttb2nfd99s7m3vcm" as Id<"businesses">;
const BUSINESS_NAME = "Greenleaf Pest Control";
const REVIEW_COUNT = 5; // Analyze 5 reviews for testing

// Get Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not set in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface TestResult {
  provider: string;
  businessName: string;
  reviewsAnalyzed: number;
  processingTime: number;
  overallScore: number | null;
  sampleAnalysis?: any;
  error?: string;
}

async function testProvider(provider: "gemini" | "internal"): Promise<TestResult> {
  console.log(`\n🔬 Testing ${provider.toUpperCase()} Analysis...`);
  console.log("=".repeat(50));
  
  const startTime = Date.now();
  const result: TestResult = {
    provider,
    businessName: BUSINESS_NAME,
    reviewsAnalyzed: 0,
    processingTime: 0,
    overallScore: null,
  };

  try {
    // First check if we have Gemini API key if testing Gemini
    if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
      console.log("⚠️  Note: GEMINI_API_KEY not set, will use fallback to internal analyzer");
    }

    // Set the provider by creating a temporary script
    const providerScript = `
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient("${CONVEX_URL}");

async function runAnalysis() {
  // For testing, we'll run with the current environment settings
  const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
    businessId: "${BUSINESS_ID}",
    batchSize: ${REVIEW_COUNT},
    skipExisting: false,
  });
  
  console.log(JSON.stringify(result));
}

runAnalysis().catch(console.error);
`;

    // Save and run the provider script
    const scriptPath = `/tmp/test-${provider}-${Date.now()}.ts`;
    fs.writeFileSync(scriptPath, providerScript);
    
    console.log(`📝 Running analysis with ${provider}...`);
    
    // Execute with the appropriate environment variable
    const { execSync } = require('child_process');
    const env = { ...process.env };
    env.AI_PROVIDER = provider === "gemini" ? "gemini" : "openai"; // openai will use mock
    
    const output = execSync(`npx tsx ${scriptPath}`, { 
      env, 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'inherit']
    });
    
    // Parse the result
    const analysisResult = JSON.parse(output);
    console.log(`✅ Analysis complete: ${analysisResult.message}`);
    
    // Get the business to check the score
    const business = await client.query(api.businesses.getBusinessById, {
      businessId: BUSINESS_ID,
    });
    
    result.overallScore = business?.overallScore || null;
    result.reviewsAnalyzed = REVIEW_COUNT;
    
    // Get sample analysis details
    const analysisTags = await client.query(api.aiAnalysisIntegration.getAnalysisTagsForBusiness, {
      businessId: BUSINESS_ID,
    });
    
    if (analysisTags.length > 0) {
      result.sampleAnalysis = {
        modelVersion: analysisTags[0].modelVersion,
        confidenceScore: analysisTags[0].confidenceScore,
        sentiment: analysisTags[0].sentiment,
        keywords: analysisTags[0].keywords?.slice(0, 5),
        qualityScore: analysisTags[0].qualityIndicators?.excellence?.intensity,
      };
    }
    
    // Clean up
    fs.unlinkSync(scriptPath);
    
  } catch (error) {
    console.error(`❌ Error during ${provider} analysis:`, error);
    result.error = error instanceof Error ? error.message : String(error);
  }
  
  result.processingTime = (Date.now() - startTime) / 1000;
  console.log(`⏱️  Processing time: ${result.processingTime.toFixed(2)}s`);
  
  return result;
}

async function main() {
  console.log("🚀 AI Provider Comparison Test");
  console.log(`📍 Business: ${BUSINESS_NAME}`);
  console.log(`🆔 ID: ${BUSINESS_ID}`);
  console.log(`📊 Reviews to analyze: ${REVIEW_COUNT}`);
  
  // Check current environment
  console.log(`\n📋 Environment Check:`);
  console.log(`- AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set (defaults to openai)'}`);
  console.log(`- GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
  
  try {
    // First, let's see what reviews we're working with
    console.log("\n📝 Fetching sample reviews...");
    const reviewsData = await client.query(api.optimizedReviews.getBusinessReviewsOptimized, {
      businessId: BUSINESS_ID,
      limit: 3,
    });
    
    console.log(`Total reviews available: ${reviewsData.total}`);
    console.log("\nSample reviews:");
    reviewsData.reviews.forEach((review, idx) => {
      console.log(`\nReview ${idx + 1}:`);
      console.log(`- Rating: ${review.rating}/5`);
      console.log(`- Comment: "${review.comment?.substring(0, 100)}${review.comment && review.comment.length > 100 ? '...' : ''}"`);
    });
    
    // Test Gemini
    const geminiResult = await testProvider("gemini");
    
    // Wait a bit between tests
    console.log("\n⏳ Waiting 3 seconds before internal analyzer test...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test Internal
    const internalResult = await testProvider("internal");
    
    // Compare results
    console.log("\n📊 COMPARISON RESULTS");
    console.log("=".repeat(70));
    
    console.log("\n🤖 GEMINI ANALYSIS:");
    console.log(`- Processing Time: ${geminiResult.processingTime.toFixed(2)}s`);
    console.log(`- Overall Score: ${geminiResult.overallScore || 'N/A'}/100`);
    if (geminiResult.sampleAnalysis) {
      console.log(`- Model: ${geminiResult.sampleAnalysis.modelVersion}`);
      console.log(`- Confidence: ${geminiResult.sampleAnalysis.confidenceScore}%`);
      console.log(`- Keywords: ${geminiResult.sampleAnalysis.keywords?.join(', ') || 'N/A'}`);
    }
    if (geminiResult.error) {
      console.log(`- Error: ${geminiResult.error}`);
    }
    
    console.log("\n🔧 INTERNAL ANALYZER:");
    console.log(`- Processing Time: ${internalResult.processingTime.toFixed(2)}s`);
    console.log(`- Overall Score: ${internalResult.overallScore || 'N/A'}/100`);
    if (internalResult.sampleAnalysis) {
      console.log(`- Model: ${internalResult.sampleAnalysis.modelVersion}`);
      console.log(`- Confidence: ${internalResult.sampleAnalysis.confidenceScore}%`);
      console.log(`- Keywords: ${internalResult.sampleAnalysis.keywords?.join(', ') || 'N/A'}`);
    }
    
    console.log("\n📈 PERFORMANCE COMPARISON:");
    if (geminiResult.processingTime && internalResult.processingTime) {
      const speedRatio = internalResult.processingTime / geminiResult.processingTime;
      console.log(`- Speed: Internal is ${speedRatio < 1 ? `${(1/speedRatio).toFixed(1)}x faster` : `${speedRatio.toFixed(1)}x slower`}`);
    }
    if (geminiResult.overallScore && internalResult.overallScore) {
      const scoreDiff = Math.abs(geminiResult.overallScore - internalResult.overallScore);
      console.log(`- Score Difference: ${scoreDiff} points`);
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      business: {
        id: BUSINESS_ID,
        name: BUSINESS_NAME,
      },
      results: {
        gemini: geminiResult,
        internal: internalResult,
      },
      comparison: {
        speedRatio: internalResult.processingTime / geminiResult.processingTime,
        scoreDifference: Math.abs((geminiResult.overallScore || 0) - (internalResult.overallScore || 0)),
      },
    };
    
    const reportPath = `./ai-comparison-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    console.log("\n✅ Test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);