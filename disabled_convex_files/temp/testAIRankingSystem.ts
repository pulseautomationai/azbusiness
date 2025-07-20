/**
 * AI Ranking System Test Suite
 * Comprehensive testing for Phases 1 & 2 implementation
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Test data for system validation
 */
const TEST_REVIEWS = [
  {
    reviewId: "test_speed_1",
    userName: "John Smith",
    rating: 5,
    comment: "Amazing service! They responded within 15 minutes and fixed our AC emergency on the same day. Lightning fast response time!",
    source: "gmb_api" as const,
    verified: true,
  },
  {
    reviewId: "test_value_1", 
    userName: "Sarah Johnson",
    rating: 5,
    comment: "Excellent value for money. Fair pricing and no hidden fees. They provided an upfront quote and stuck to it. Great value!",
    source: "gmb_api" as const,
    verified: true,
  },
  {
    reviewId: "test_quality_1",
    userName: "Mike Chen",
    rating: 5,
    comment: "Outstanding quality work. Very detail-oriented and professional craftsmanship. They went above and beyond with attention to detail.",
    source: "gmb_api" as const,
    verified: true,
  },
  {
    reviewId: "test_reliability_1",
    userName: "Lisa Davis",
    rating: 5,
    comment: "Extremely reliable and trustworthy. They always follow through on their promises and maintain consistent quality service.",
    source: "gmb_api" as const,
    verified: true,
  },
  {
    reviewId: "test_mixed_1",
    userName: "Tom Wilson",
    rating: 4,
    comment: "Good service overall. Quick response time and fair price. The work quality was solid and they were reliable.",
    source: "yelp_import" as const,
    verified: false,
  },
];

/**
 * Create test business with reviews
 */
export const createTestBusiness = internalMutation({
  args: {
    name: v.string(),
    city: v.string(),
    categorySlug: v.string(),
    planTier: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("power")),
  },
  handler: async (ctx, args) => {
    // Get category ID
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category ${args.categorySlug} not found`);
    }

    // Create test business
    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      slug: args.name.toLowerCase().replace(/\s+/g, "-"),
      urlPath: `${args.categorySlug}/${args.city.toLowerCase()}/${args.name.toLowerCase().replace(/\s+/g, "-")}`,
      description: `Test business for AI ranking system validation`,
      shortDescription: `Test ${args.categorySlug} business in ${args.city}`,
      phone: "(555) 123-4567",
      address: "123 Test Street",
      city: args.city,
      state: "AZ",
      zip: "85001",
      categoryId: category._id,
      services: ["Test Service 1", "Test Service 2"],
      planTier: args.planTier,
      featured: false,
      priority: 0,
      claimed: true,
      verified: true,
      active: true,
      dataSource: {
        primary: "admin_import",
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
      },
      rating: 4.8,
      reviewCount: TEST_REVIEWS.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add test reviews
    for (const reviewData of TEST_REVIEWS) {
      await ctx.db.insert("reviews", {
        businessId,
        ...reviewData,
        helpful: 0,
        originalCreateTime: new Date().toISOString(),
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random dates within last 30 days
        syncedAt: Date.now(),
      });
    }

    return {
      businessId,
      name: args.name,
      reviewsCreated: TEST_REVIEWS.length,
    };
  },
});

/**
 * Test Phase 1: AI Analysis Pipeline
 */
export const testPhase1AIAnalysis = internalMutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const testResults = {
      phase: "Phase 1: AI Analysis Pipeline",
      tests: [] as any[],
      summary: {
        passed: 0,
        failed: 0,
        total: 0,
      },
    };

    // Test 1: Review Import System
    try {
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .collect();

      testResults.tests.push({
        name: "Review Import System",
        passed: reviews.length === TEST_REVIEWS.length,
        expected: TEST_REVIEWS.length,
        actual: reviews.length,
        details: `Expected ${TEST_REVIEWS.length} reviews, found ${reviews.length}`,
      });

      if (reviews.length === TEST_REVIEWS.length) testResults.summary.passed++;
      else testResults.summary.failed++;
      testResults.summary.total++;

      // Test 2: AI Analysis Processing
      let analysisResults;
      try {
        analysisResults = await ctx.runMutation(internal.processReviewBatchForAI, {
          businessId: args.businessId,
          limit: 10,
        });

        testResults.tests.push({
          name: "AI Analysis Processing",
          passed: analysisResults.analyzed > 0,
          expected: "At least 1 review analyzed",
          actual: `${analysisResults.analyzed} reviews analyzed`,
          details: `Processed ${analysisResults.processed} reviews, analyzed ${analysisResults.analyzed}, skipped ${analysisResults.skipped}`,
        });

        if (analysisResults.analyzed > 0) testResults.summary.passed++;
        else testResults.summary.failed++;
        testResults.summary.total++;

      } catch (error) {
        testResults.tests.push({
          name: "AI Analysis Processing",
          passed: false,
          expected: "Successful AI analysis",
          actual: `Error: ${error}`,
          details: "AI analysis failed - check OpenAI API key and connectivity",
        });
        testResults.summary.failed++;
        testResults.summary.total++;
      }

      // Test 3: Performance Score Calculation
      let scoringResults;
      try {
        scoringResults = await ctx.runMutation(internal.calculateBusinessPerformanceScores, {
          businessId: args.businessId,
        });

        const hasValidScores = scoringResults.scores && 
          (scoringResults.scores.speed > 0 || scoringResults.scores.value > 0 || 
           scoringResults.scores.quality > 0 || scoringResults.scores.reliability > 0);

        testResults.tests.push({
          name: "Performance Score Calculation",
          passed: hasValidScores,
          expected: "Valid performance scores",
          actual: scoringResults.scores ? 
            `Speed: ${scoringResults.scores.speed}, Value: ${scoringResults.scores.value}, Quality: ${scoringResults.scores.quality}, Reliability: ${scoringResults.scores.reliability}` :
            "No scores calculated",
          details: scoringResults.reason || "Performance scores calculated successfully",
        });

        if (hasValidScores) testResults.summary.passed++;
        else testResults.summary.failed++;
        testResults.summary.total++;

      } catch (error) {
        testResults.tests.push({
          name: "Performance Score Calculation",
          passed: false,
          expected: "Valid performance scores",
          actual: `Error: ${error}`,
          details: "Performance scoring failed",
        });
        testResults.summary.failed++;
        testResults.summary.total++;
      }

      // Test 4: Confidence Scoring
      try {
        const confidenceResult = await ctx.runMutation(internal.calculateBusinessConfidenceScore, {
          businessId: args.businessId,
        });

        const hasValidConfidence = confidenceResult.overallConfidence > 0;

        testResults.tests.push({
          name: "Confidence Scoring",
          passed: hasValidConfidence,
          expected: "Valid confidence score",
          actual: `Overall confidence: ${confidenceResult.overallConfidence}%`,
          details: `Breakdown - Reviews: ${confidenceResult.breakdown.reviewCount}%, Verification: ${confidenceResult.breakdown.verification}%, Performance: ${confidenceResult.breakdown.performanceMentions}%`,
        });

        if (hasValidConfidence) testResults.summary.passed++;
        else testResults.summary.failed++;
        testResults.summary.total++;

      } catch (error) {
        testResults.tests.push({
          name: "Confidence Scoring",
          passed: false,
          expected: "Valid confidence score",
          actual: `Error: ${error}`,
          details: "Confidence scoring failed",
        });
        testResults.summary.failed++;
        testResults.summary.total++;
      }

      // Test 5: Review Deduplication
      try {
        const duplicateCheck = await ctx.runQuery(internal.findDuplicateReviews, {
          businessId: args.businessId,
          checkAll: true,
        });

        testResults.tests.push({
          name: "Review Deduplication",
          passed: duplicateCheck.duplicates.length === 0,
          expected: "No duplicates in test data",
          actual: `${duplicateCheck.duplicates.length} duplicates found`,
          details: `Total reviews: ${duplicateCheck.summary.total}, duplicates: ${duplicateCheck.summary.duplicates}`,
        });

        if (duplicateCheck.duplicates.length === 0) testResults.summary.passed++;
        else testResults.summary.failed++;
        testResults.summary.total++;

      } catch (error) {
        testResults.tests.push({
          name: "Review Deduplication",
          passed: false,
          expected: "Successful deduplication check",
          actual: `Error: ${error}`,
          details: "Deduplication check failed",
        });
        testResults.summary.failed++;
        testResults.summary.total++;
      }

    } catch (error) {
      testResults.tests.push({
        name: "Phase 1 Setup",
        passed: false,
        expected: "Successful test setup",
        actual: `Error: ${error}`,
        details: "Failed to set up Phase 1 tests",
      });
      testResults.summary.failed++;
      testResults.summary.total++;
    }

    return testResults;
  },
});

/**
 * Test Phase 2: Ranking Algorithm
 */
export const testPhase2RankingAlgorithm = internalMutation({
  args: {
    businessId: v.id("businesses"),
    city: v.string(),
    categorySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const testResults = {
      phase: "Phase 2: Ranking Algorithm",
      tests: [] as any[],
      summary: {
        passed: 0,
        failed: 0,
        total: 0,
      },
    };

    // Test 1: Individual Business Ranking Calculation
    try {
      const rankingResult = await ctx.runMutation(internal.calculateBusinessRanking, {
        businessId: args.businessId,
        city: args.city,
        categorySlug: args.categorySlug,
      });

      const hasValidRanking = rankingResult.ranking && rankingResult.ranking.finalScore > 0;

      testResults.tests.push({
        name: "Individual Business Ranking",
        passed: hasValidRanking,
        expected: "Valid ranking calculation",
        actual: rankingResult.ranking ? 
          `Final Score: ${rankingResult.ranking.finalScore}, Confidence: ${rankingResult.ranking.confidence}%` :
          "No ranking calculated",
        details: rankingResult.reason || "Ranking calculated successfully",
      });

      if (hasValidRanking) testResults.summary.passed++;
      else testResults.summary.failed++;
      testResults.summary.total++;

    } catch (error) {
      testResults.tests.push({
        name: "Individual Business Ranking",
        passed: false,
        expected: "Valid ranking calculation",
        actual: `Error: ${error}`,
        details: "Individual ranking calculation failed",
      });
      testResults.summary.failed++;
      testResults.summary.total++;
    }

    // Test 2: City + Category Ranking System
    try {
      const cityRankingResult = await ctx.runMutation(internal.calculateCityCategoryRankings, {
        city: args.city,
        categorySlug: args.categorySlug,
        forceRecalculate: true,
      });

      const hasValidCityRankings = cityRankingResult.rankings.length > 0;

      testResults.tests.push({
        name: "City + Category Ranking System",
        passed: hasValidCityRankings,
        expected: "Valid city rankings",
        actual: `${cityRankingResult.rankings.length} businesses ranked`,
        details: `Average score: ${cityRankingResult.statistics?.averageScore || 'N/A'}, confidence: ${cityRankingResult.statistics?.averageConfidence || 'N/A'}%`,
      });

      if (hasValidCityRankings) testResults.summary.passed++;
      else testResults.summary.failed++;
      testResults.summary.total++;

      // Test 3: Aspect-Specific Rankings
      const aspects = ["speed", "value", "quality", "reliability"] as const;
      let aspectTestsPassed = 0;
      let aspectTestsTotal = aspects.length;

      for (const aspect of aspects) {
        try {
          const aspectResult = await ctx.runMutation(internal.calculateAspectRankings, {
            city: args.city,
            categorySlug: args.categorySlug,
            aspect,
          });

          if (aspectResult.rankings.length > 0) {
            aspectTestsPassed++;
          }
        } catch (error) {
          console.error(`Aspect ranking failed for ${aspect}:`, error);
        }
      }

      testResults.tests.push({
        name: "Aspect-Specific Rankings",
        passed: aspectTestsPassed === aspectTestsTotal,
        expected: `All ${aspectTestsTotal} aspects ranked`,
        actual: `${aspectTestsPassed} aspects successfully ranked`,
        details: `Speed, Value, Quality, Reliability rankings`,
      });

      if (aspectTestsPassed === aspectTestsTotal) testResults.summary.passed++;
      else testResults.summary.failed++;
      testResults.summary.total++;

    } catch (error) {
      testResults.tests.push({
        name: "City + Category Ranking System",
        passed: false,
        expected: "Valid city rankings",
        actual: `Error: ${error}`,
        details: "City ranking calculation failed",
      });
      testResults.summary.failed++;
      testResults.summary.total++;
    }

    // Test 4: Performance Badge Generation
    try {
      const badgeResult = await ctx.runMutation(internal.generateBusinessBadges, {
        businessId: args.businessId,
      });

      const hasValidBadges = badgeResult.badges.length > 0;

      testResults.tests.push({
        name: "Performance Badge Generation",
        passed: hasValidBadges,
        expected: "Valid performance badges",
        actual: `${badgeResult.badges.length} badges generated`,
        details: badgeResult.badges.map((b: any) => b.text).join(", ") || "No badges generated",
      });

      if (hasValidBadges) testResults.summary.passed++;
      else testResults.summary.failed++;
      testResults.summary.total++;

    } catch (error) {
      testResults.tests.push({
        name: "Performance Badge Generation",
        passed: false,
        expected: "Valid performance badges",
        actual: `Error: ${error}`,
        details: "Badge generation failed",
      });
      testResults.summary.failed++;
      testResults.summary.total++;
    }

    // Test 5: Ranking Cache System
    try {
      const cacheResult = await ctx.runQuery(internal.getCachedRankings, {
        city: args.city,
        category: args.categorySlug,
        rankingType: "overall",
        limit: 10,
      });

      const hasValidCache = cacheResult.rankings.length > 0 && cacheResult.cached;

      testResults.tests.push({
        name: "Ranking Cache System",
        passed: hasValidCache,
        expected: "Valid cached rankings",
        actual: cacheResult.cached ? 
          `${cacheResult.rankings.length} cached rankings` :
          "No cached rankings found",
        details: `Cache key: ${cacheResult.cacheKey || 'N/A'}, last updated: ${cacheResult.lastUpdated ? new Date(cacheResult.lastUpdated).toLocaleString() : 'N/A'}`,
      });

      if (hasValidCache) testResults.summary.passed++;
      else testResults.summary.failed++;
      testResults.summary.total++;

    } catch (error) {
      testResults.tests.push({
        name: "Ranking Cache System",
        passed: false,
        expected: "Valid cached rankings",
        actual: `Error: ${error}`,
        details: "Cache system test failed",
      });
      testResults.summary.failed++;
      testResults.summary.total++;
    }

    return testResults;
  },
});

/**
 * Run comprehensive test suite
 */
export const runComprehensiveTests: any = mutation({
  args: {
    testBusinessName: v.optional(v.string()),
    testCity: v.optional(v.string()),
    testCategory: v.optional(v.string()),
    testPlanTier: v.optional(v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("power"))),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Admin permissions required for testing");
    }

    const testBusinessName = args.testBusinessName || "AI Test Business";
    const testCity = args.testCity || "Phoenix";
    const testCategory = args.testCategory || "hvac";
    const testPlanTier = args.testPlanTier || "pro";

    try {
      // Create test business
      const testBusiness: any = await ctx.runMutation(internal.createTestBusiness, {
        name: testBusinessName,
        city: testCity,
        categorySlug: testCategory,
        planTier: testPlanTier,
      });

      // Run Phase 1 tests
      const phase1Results: any = await ctx.runMutation(internal.testPhase1AIAnalysis, {
        businessId: testBusiness.businessId,
      });

      // Run Phase 2 tests
      const phase2Results: any = await ctx.runMutation(internal.testPhase2RankingAlgorithm, {
        businessId: testBusiness.businessId,
        city: testCity,
        categorySlug: testCategory,
      });

      // Compile overall results
      const overallResults: any = {
        testRun: {
          timestamp: Date.now(),
          testBusiness: {
            id: testBusiness.businessId,
            name: testBusinessName,
            city: testCity,
            category: testCategory,
            planTier: testPlanTier,
          },
          adminUser: user.name || user.email,
        },
        phases: [phase1Results, phase2Results],
        summary: {
          totalTests: phase1Results.summary.total + phase2Results.summary.total,
          totalPassed: phase1Results.summary.passed + phase2Results.summary.passed,
          totalFailed: phase1Results.summary.failed + phase2Results.summary.failed,
          successRate: 0,
        },
        recommendations: [] as string[],
      };

      overallResults.summary.successRate = overallResults.summary.totalTests > 0 ?
        Math.round((overallResults.summary.totalPassed / overallResults.summary.totalTests) * 100) : 0;

      // Generate recommendations
      if (overallResults.summary.successRate < 100) {
        overallResults.recommendations.push("Some tests failed - check error details and system configuration");
      }
      if (phase1Results.summary.failed > 0) {
        overallResults.recommendations.push("Phase 1 issues detected - verify OpenAI API key and review import system");
      }
      if (phase2Results.summary.failed > 0) {
        overallResults.recommendations.push("Phase 2 issues detected - check ranking algorithm and database indexes");
      }
      if (overallResults.summary.successRate >= 80) {
        overallResults.recommendations.push("System is performing well - ready for production use");
      }

      return overallResults;

    } catch (error) {
      return {
        testRun: {
          timestamp: Date.now(),
          status: "failed",
          error: String(error),
        },
        phases: [],
        summary: {
          totalTests: 0,
          totalPassed: 0,
          totalFailed: 1,
          successRate: 0,
        },
        recommendations: [
          "Test setup failed - check database connectivity and permissions",
          "Verify all required tables exist and are properly indexed",
        ],
      };
    }
  },
});

/**
 * Get system health status for testing
 */
export const getSystemHealthStatus = query({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Check database connectivity
      const [businesses, categories, cities, reviews] = await Promise.all([
        ctx.db.query("businesses").take(1),
        ctx.db.query("categories").take(1),
        ctx.db.query("cities").take(1),
        ctx.db.query("reviews").take(1),
      ]);

      // Check AI ranking tables
      const [performanceMetrics, rankingCache] = await Promise.all([
        ctx.db.query("performanceMetrics").take(1),
        ctx.db.query("rankingCache").take(1),
      ]);

      return {
        status: "healthy",
        checks: {
          database: {
            businesses: businesses.length > 0,
            categories: categories.length > 0,
            cities: cities.length > 0,
            reviews: reviews.length > 0,
          },
          aiRankingTables: {
            performanceMetrics: performanceMetrics.length > 0,
            rankingCache: rankingCache.length > 0,
          },
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: String(error),
        timestamp: Date.now(),
      };
    }
  },
});

/**
 * Clean up test data
 */
export const cleanupTestData = mutation({
  args: {
    testBusinessName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Admin permissions required");
    }

    try {
      // Find test business
      const testBusiness = await ctx.db
        .query("businesses")
        .withIndex("by_name", (q) => q.eq("name", args.testBusinessName))
        .first();

      if (!testBusiness) {
        return { message: "Test business not found", cleaned: false };
      }

      // Delete related reviews
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", testBusiness._id))
        .collect();

      for (const review of reviews) {
        await ctx.db.delete(review._id);
      }

      // Delete performance metrics
      const metrics = await ctx.db
        .query("performanceMetrics")
        .withIndex("by_business", (q) => q.eq("businessId", testBusiness._id))
        .first();

      if (metrics) {
        await ctx.db.delete(metrics._id);
      }

      // Delete business
      await ctx.db.delete(testBusiness._id);

      return {
        message: `Cleaned up test business: ${args.testBusinessName}`,
        cleaned: true,
        deletedReviews: reviews.length,
        deletedMetrics: metrics ? 1 : 0,
      };
    } catch (error) {
      return {
        message: `Cleanup failed: ${error}`,
        cleaned: false,
      };
    }
  },
});