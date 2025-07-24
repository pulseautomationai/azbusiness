import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import * as fs from "fs";
import * as path from "path";

// Configuration
const BUSINESS_ID = "jn77gkwyvzqketaxttb2nfd99s7m3vcm" as Id<"businesses">;
const BUSINESS_NAME = "Greenleaf Pest Control";
const BATCH_SIZE = 5; // Analyze 5 reviews for testing
const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://just-gnu-369.convex.cloud";

// Initialize Convex client
const client = new ConvexHttpClient(CONVEX_URL);

interface AnalysisResult {
  provider: string;
  startTime: number;
  endTime: number;
  processingTime: number;
  reviewsAnalyzed: number;
  overallScore?: number;
  errors: string[];
  reviews: any[];
  insights?: any;
}

async function runAnalysisWithProvider(provider: "gemini" | "mock"): Promise<AnalysisResult> {
  console.log(`\n🔬 Starting ${provider.toUpperCase()} Analysis...`);
  console.log("=".repeat(50));
  
  const result: AnalysisResult = {
    provider,
    startTime: Date.now(),
    endTime: 0,
    processingTime: 0,
    reviewsAnalyzed: 0,
    errors: [],
    reviews: []
  };

  try {
    // First, clear existing analysis for clean test
    console.log("📋 Clearing existing analysis data...");
    const existingTags = await client.query(api.aiAnalysisIntegration.getAnalysisTagsForBusiness, {
      businessId: BUSINESS_ID,
    });
    
    if (existingTags.length > 0) {
      console.log(`Found ${existingTags.length} existing analysis tags to clear`);
      // Note: In production, we'd have a mutation to clear these
    }

    // Set the AI provider
    console.log(`🔧 Setting AI_PROVIDER to: ${provider}`);
    process.env.AI_PROVIDER = provider === "mock" ? "openai" : "gemini";
    
    // Get some reviews to analyze
    console.log(`📊 Fetching reviews for ${BUSINESS_NAME}...`);
    const reviewsResponse = await client.query(api.optimizedReviews.getBusinessReviewsOptimized, {
      businessId: BUSINESS_ID,
      limit: BATCH_SIZE,
    });
    
    const reviews = reviewsResponse.reviews;
    
    console.log(`Found ${reviews.length} reviews to analyze`);
    
    if (reviews.length === 0) {
      throw new Error("No reviews found for this business");
    }

    // Show sample review
    console.log("\n📝 Sample Review:");
    console.log(`Rating: ${reviews[0].rating}/5`);
    console.log(`Text: "${reviews[0].comment?.substring(0, 200)}${reviews[0].comment?.length > 200 ? '...' : ''}"`);
    
    // Process reviews with AI
    console.log(`\n🤖 Processing ${reviews.length} reviews with ${provider.toUpperCase()}...`);
    
    const processResult = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
      businessId: BUSINESS_ID,
      batchSize: BATCH_SIZE,
      skipExisting: false, // Force reanalysis
    });
    
    console.log("✅ Processing complete!");
    console.log(`Result: ${processResult.message}`);
    
    result.reviewsAnalyzed = reviews.length;
    result.insights = processResult.insights;
    
    // Get the updated business score
    const business = await client.query(api.businesses.getBusinessById, {
      businessId: BUSINESS_ID,
    });
    
    result.overallScore = business?.overallScore;
    console.log(`📊 Overall Business Score: ${result.overallScore || 'Not calculated'}/100`);
    
    // Get analysis details for comparison
    const analysisDetails = await client.query(api.aiAnalysisIntegration.getAnalysisTagsForBusiness, {
      businessId: BUSINESS_ID,
    });
    
    result.reviews = analysisDetails.slice(0, BATCH_SIZE);
    
  } catch (error) {
    console.error(`❌ Error during ${provider} analysis:`, error);
    result.errors.push(error instanceof Error ? error.message : String(error));
  }
  
  result.endTime = Date.now();
  result.processingTime = (result.endTime - result.startTime) / 1000;
  
  console.log(`\n⏱️ ${provider.toUpperCase()} analysis completed in ${result.processingTime.toFixed(2)} seconds`);
  
  return result;
}

function compareResults(geminiResult: AnalysisResult, mockResult: AnalysisResult) {
  console.log("\n📊 COMPARISON REPORT");
  console.log("=".repeat(70));
  
  const report = {
    business: BUSINESS_NAME,
    businessId: BUSINESS_ID,
    timestamp: new Date().toISOString(),
    summary: {
      gemini: {
        processingTime: geminiResult.processingTime,
        reviewsAnalyzed: geminiResult.reviewsAnalyzed,
        overallScore: geminiResult.overallScore,
        errors: geminiResult.errors.length,
      },
      mock: {
        processingTime: mockResult.processingTime,
        reviewsAnalyzed: mockResult.reviewsAnalyzed,
        overallScore: mockResult.overallScore,
        errors: mockResult.errors.length,
      }
    },
    detailedComparison: [] as any[],
  };
  
  // Compare individual review analyses
  console.log("\n📝 REVIEW-BY-REVIEW COMPARISON:");
  console.log("-".repeat(70));
  
  const maxReviews = Math.min(geminiResult.reviews.length, mockResult.reviews.length, 3);
  
  for (let i = 0; i < maxReviews; i++) {
    const geminiReview = geminiResult.reviews[i];
    const mockReview = mockResult.reviews[i];
    
    console.log(`\nReview ${i + 1}:`);
    
    const comparison = {
      reviewIndex: i + 1,
      gemini: extractKeyMetrics(geminiReview),
      mock: extractKeyMetrics(mockReview),
      differences: {} as any,
    };
    
    // Calculate differences
    if (geminiReview && mockReview) {
      comparison.differences = {
        sentimentDelta: Math.abs((geminiReview.sentiment?.overall || 0) - (mockReview.sentiment?.overall || 0)),
        confidenceDelta: Math.abs((geminiReview.confidenceScore || 0) - (mockReview.confidenceScore || 0)),
        keywordOverlap: calculateKeywordOverlap(geminiReview.keywords || [], mockReview.keywords || []),
      };
    }
    
    report.detailedComparison.push(comparison);
    
    // Print comparison
    console.log("Gemini Analysis:");
    console.log(`  - Sentiment: ${geminiReview?.sentiment?.overall?.toFixed(2) || 'N/A'} (${geminiReview?.sentiment?.classification || 'N/A'})`);
    console.log(`  - Confidence: ${geminiReview?.confidenceScore || 'N/A'}%`);
    console.log(`  - Keywords: ${(geminiReview?.keywords || []).slice(0, 5).join(', ')}`);
    
    console.log("Mock Analysis:");
    console.log(`  - Sentiment: ${mockReview?.sentiment?.overall?.toFixed(2) || 'N/A'} (${mockReview?.sentiment?.classification || 'N/A'})`);
    console.log(`  - Confidence: ${mockReview?.confidenceScore || 'N/A'}%`);
    console.log(`  - Keywords: ${(mockReview?.keywords || []).slice(0, 5).join(', ')}`);
  }
  
  // Summary statistics
  console.log("\n📈 SUMMARY STATISTICS:");
  console.log("-".repeat(70));
  console.log(`Processing Speed: Gemini ${geminiResult.processingTime.toFixed(2)}s vs Mock ${mockResult.processingTime.toFixed(2)}s`);
  console.log(`Speed Difference: ${((mockResult.processingTime / geminiResult.processingTime) * 100).toFixed(0)}% (Mock is ${mockResult.processingTime < geminiResult.processingTime ? 'faster' : 'slower'})`);
  console.log(`Overall Score Difference: ${Math.abs((geminiResult.overallScore || 0) - (mockResult.overallScore || 0))} points`);
  
  // Save detailed report to file
  const reportPath = path.join(__dirname, `../ai-comparison-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  return report;
}

function extractKeyMetrics(review: any) {
  if (!review) return null;
  
  return {
    sentiment: review.sentiment,
    confidence: review.confidenceScore,
    keywords: review.keywords || [],
    qualityScore: review.qualityIndicators?.excellence?.intensity || 0,
    professionalismScore: review.serviceExcellence?.professionalism?.score || 0,
    recommendationScore: review.recommendationStrength?.advocacy_score || 0,
  };
}

function calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1.map(k => k.toLowerCase()));
  const set2 = new Set(keywords2.map(k => k.toLowerCase()));
  
  let overlap = 0;
  set1.forEach(keyword => {
    if (set2.has(keyword)) overlap++;
  });
  
  return (overlap / Math.max(set1.size, set2.size)) * 100;
}

// Main execution
async function main() {
  console.log("🚀 AI Analysis Comparison Test");
  console.log(`📍 Business: ${BUSINESS_NAME}`);
  console.log(`🆔 ID: ${BUSINESS_ID}`);
  console.log(`📊 Batch Size: ${BATCH_SIZE} reviews`);
  
  try {
    // Run Gemini analysis
    const geminiResult = await runAnalysisWithProvider("gemini");
    
    // Wait a bit to avoid any rate limiting
    console.log("\n⏳ Waiting 3 seconds before running mock analysis...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run Mock analysis
    const mockResult = await runAnalysisWithProvider("mock");
    
    // Compare results
    const comparison = compareResults(geminiResult, mockResult);
    
    console.log("\n✅ Test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}