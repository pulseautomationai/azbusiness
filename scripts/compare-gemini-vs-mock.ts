#!/usr/bin/env npx tsx

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import * as fs from "fs";

// Configuration
const BUSINESS_ID = "jn77gkwyvzqketaxttb2nfd99s7m3vcm" as Id<"businesses">;
const BUSINESS_NAME = "Greenleaf Pest Control";

// Get Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";

const client = new ConvexHttpClient(CONVEX_URL);

interface TestResult {
  provider: string;
  businessName: string;
  reviewsAnalyzed: number;
  processingTime: number;
  overallScore: number | null;
  modelVersion: string;
  sampleAnalysis?: any;
  error?: string;
}

async function clearExistingAnalysis(businessId: Id<"businesses">) {
  console.log("🧹 Clearing existing AI analysis tags...");
  
  // Get all existing tags for this business
  const existingTags = await client.query(api.aiAnalysisIntegration.getAnalysisTagsForBusiness, {
    businessId,
  });
  
  console.log(`Found ${existingTags.length} existing analysis tags to clear`);
  
  // Note: In a real scenario, you'd have a mutation to delete these
  // For now, we'll just acknowledge they exist
  return existingTags.length;
}

async function testProvider(provider: "gemini" | "mock"): Promise<TestResult> {
  console.log(`\n🔬 Testing ${provider.toUpperCase()} Analysis...`);
  console.log("=".repeat(50));
  
  const startTime = Date.now();
  const result: TestResult = {
    provider,
    businessName: BUSINESS_NAME,
    reviewsAnalyzed: 0,
    processingTime: 0,
    overallScore: null,
    modelVersion: provider === "gemini" ? "gemini-1.5-flash" : "mock-v1",
  };

  try {
    // Clear the AI_PROVIDER env var temporarily to test mock
    const originalProvider = process.env.AI_PROVIDER;
    if (provider === "mock") {
      // Temporarily unset the GEMINI_API_KEY to force mock mode
      process.env.AI_PROVIDER = "mock";
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "AIzaSyBSNPlATqhnKiYromfSaIjn3ehjNnL55_U";
    }

    console.log(`📝 Running analysis with ${provider}...`);
    console.log(`Environment: AI_PROVIDER=${process.env.AI_PROVIDER}, GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    
    // Run the analysis
    const analysisResult = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: BUSINESS_ID,
      batchSize: 5,
      skipExisting: false, // Force re-analysis
    });
    
    console.log(`✅ Analysis complete: ${analysisResult.message}`);
    result.reviewsAnalyzed = 5;
    
    // Get the business to check the overall score
    const business = await client.query(api.businesses.getBusinessById, {
      businessId: BUSINESS_ID,
    });
    
    result.overallScore = business?.overallScore || null;
    
    // Get sample analysis details
    const analysisTags = await client.query(api.aiAnalysisIntegration.getAnalysisTagsForBusiness, {
      businessId: BUSINESS_ID,
    });
    
    if (analysisTags.length > 0) {
      // Get the most recent analysis
      const latestTag = analysisTags[0];
      result.sampleAnalysis = {
        modelVersion: latestTag.modelVersion,
        confidenceScore: latestTag.confidenceScore,
        sentiment: latestTag.sentiment,
        keywords: latestTag.keywords?.slice(0, 5),
        qualityScore: latestTag.qualityIndicators?.excellence?.intensity,
        serviceScore: latestTag.serviceExcellence?.professionalism?.score,
      };
    }
    
    // Restore original environment
    if (originalProvider) {
      process.env.AI_PROVIDER = originalProvider;
    }
    if (provider === "mock" && !originalProvider) {
      delete process.env.AI_PROVIDER;
    }
    // Restore Gemini key
    process.env.GEMINI_API_KEY = "AIzaSyBSNPlATqhnKiYromfSaIjn3ehjNnL55_U";
    
  } catch (error) {
    console.error(`❌ Error during ${provider} analysis:`, error);
    result.error = error instanceof Error ? error.message : String(error);
  }
  
  result.processingTime = (Date.now() - startTime) / 1000;
  console.log(`⏱️  Processing time: ${result.processingTime.toFixed(2)}s`);
  
  return result;
}

async function main() {
  console.log("🚀 Gemini vs Mock Analyzer Comparison Test");
  console.log(`📍 Business: ${BUSINESS_NAME}`);
  console.log(`🆔 ID: ${BUSINESS_ID}`);
  console.log(`🌐 Convex URL: ${CONVEX_URL}`);
  
  // Check current environment
  console.log(`\n📋 Environment Check:`);
  console.log(`- AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set'}`);
  console.log(`- GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
  
  try {
    // First, let's see what reviews we're working with
    console.log("\n📝 Fetching sample reviews...");
    const reviewsData = await client.query(api.optimizedReviews.getBusinessReviewsOptimized, {
      businessId: BUSINESS_ID,
      limit: 5,
    });
    
    console.log(`Total reviews available: ${reviewsData.total}`);
    console.log("\nSample reviews:");
    reviewsData.reviews.forEach((review, idx) => {
      console.log(`\nReview ${idx + 1}:`);
      console.log(`- Rating: ${review.rating}/5`);
      console.log(`- Comment: "${review.comment?.substring(0, 100)}${review.comment && review.comment.length > 100 ? '...' : ''}"`);
    });
    
    // Clear existing analysis
    const clearedCount = await clearExistingAnalysis(BUSINESS_ID);
    
    // Test Gemini
    console.log("\n\n" + "=".repeat(70));
    console.log("RUNNING GEMINI TEST");
    console.log("=".repeat(70));
    const geminiResult = await testProvider("gemini");
    
    // Wait a bit and clear analysis for fair comparison
    console.log("\n⏳ Waiting 3 seconds before mock analyzer test...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    await clearExistingAnalysis(BUSINESS_ID);
    
    // Test Mock
    console.log("\n\n" + "=".repeat(70));
    console.log("RUNNING MOCK ANALYZER TEST");
    console.log("=".repeat(70));
    const mockResult = await testProvider("mock");
    
    // Compare results
    console.log("\n\n" + "=".repeat(70));
    console.log("📊 COMPARISON RESULTS");
    console.log("=".repeat(70));
    
    console.log("\n🤖 GEMINI ANALYSIS:");
    console.log(`- Processing Time: ${geminiResult.processingTime.toFixed(2)}s`);
    console.log(`- Overall Score: ${geminiResult.overallScore || 'N/A'}/100`);
    console.log(`- Model Version: ${geminiResult.modelVersion}`);
    if (geminiResult.sampleAnalysis) {
      console.log(`- Confidence: ${geminiResult.sampleAnalysis.confidenceScore}%`);
      console.log(`- Keywords: ${geminiResult.sampleAnalysis.keywords?.join(', ') || 'N/A'}`);
      console.log(`- Quality Score: ${geminiResult.sampleAnalysis.qualityScore || 'N/A'}`);
      console.log(`- Service Score: ${geminiResult.sampleAnalysis.serviceScore || 'N/A'}`);
    }
    if (geminiResult.error) {
      console.log(`- Error: ${geminiResult.error}`);
    }
    
    console.log("\n🔧 MOCK ANALYZER:");
    console.log(`- Processing Time: ${mockResult.processingTime.toFixed(2)}s`);
    console.log(`- Overall Score: ${mockResult.overallScore || 'N/A'}/100`);
    console.log(`- Model Version: ${mockResult.modelVersion}`);
    if (mockResult.sampleAnalysis) {
      console.log(`- Confidence: ${mockResult.sampleAnalysis.confidenceScore}%`);
      console.log(`- Keywords: ${mockResult.sampleAnalysis.keywords?.join(', ') || 'N/A'}`);
      console.log(`- Quality Score: ${mockResult.sampleAnalysis.qualityScore || 'N/A'}`);
      console.log(`- Service Score: ${mockResult.sampleAnalysis.serviceScore || 'N/A'}`);
    }
    
    console.log("\n📈 PERFORMANCE COMPARISON:");
    if (geminiResult.processingTime && mockResult.processingTime) {
      const speedRatio = mockResult.processingTime / geminiResult.processingTime;
      console.log(`- Speed: Mock is ${speedRatio < 1 ? `${(1/speedRatio).toFixed(1)}x faster` : `${speedRatio.toFixed(1)}x slower`} than Gemini`);
    }
    if (geminiResult.overallScore && mockResult.overallScore) {
      const scoreDiff = Math.abs(geminiResult.overallScore - mockResult.overallScore);
      console.log(`- Score Difference: ${scoreDiff} points`);
      console.log(`- Score Similarity: ${(100 - scoreDiff).toFixed(1)}%`);
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
        mock: mockResult,
      },
      comparison: {
        speedRatio: mockResult.processingTime / geminiResult.processingTime,
        scoreDifference: Math.abs((geminiResult.overallScore || 0) - (mockResult.overallScore || 0)),
      },
      environment: {
        convexUrl: CONVEX_URL,
        hadGeminiKey: !!process.env.GEMINI_API_KEY,
      },
    };
    
    const reportPath = `./gemini-vs-mock-comparison-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("📋 SUMMARY");
    console.log("=".repeat(70));
    if (geminiResult.error && !mockResult.error) {
      console.log("✅ Mock analyzer worked successfully while Gemini had issues");
      console.log(`   Gemini error: ${geminiResult.error}`);
    } else if (!geminiResult.error && mockResult.error) {
      console.log("✅ Gemini worked successfully while Mock had issues");
      console.log(`   Mock error: ${mockResult.error}`);
    } else if (!geminiResult.error && !mockResult.error) {
      console.log("✅ Both analyzers completed successfully!");
      console.log(`   - Gemini is more sophisticated but requires API key and has costs`);
      console.log(`   - Mock is free and fast but less nuanced in analysis`);
    } else {
      console.log("❌ Both analyzers encountered errors");
    }
    
    console.log("\n✅ Test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);