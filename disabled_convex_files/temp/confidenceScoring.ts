/**
 * Analysis Confidence Scoring System
 * Part of AI Ranking System - Phase 1.3
 * Provides confidence metrics for AI analysis quality and data reliability
 */

import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Confidence scoring criteria and weights
 */
const CONFIDENCE_WEIGHTS = {
  reviewCount: 0.3,           // 30% - More reviews = higher confidence
  reviewVerification: 0.2,    // 20% - Verified reviews = higher confidence  
  performanceMentions: 0.25,  // 25% - Specific performance mentions = higher confidence
  sentimentConsistency: 0.15, // 15% - Consistent sentiment = higher confidence
  recency: 0.1,              // 10% - Recent reviews = higher confidence
};

/**
 * Calculate review count confidence (0-100)
 */
function calculateReviewCountConfidence(reviewCount: number): number {
  // Confidence increases with review count, plateauing at 50 reviews
  if (reviewCount === 0) return 0;
  if (reviewCount >= 50) return 100;
  
  // Logarithmic scale for diminishing returns
  return Math.min(100, Math.log(reviewCount + 1) / Math.log(51) * 100);
}

/**
 * Calculate verification confidence (0-100)
 */
function calculateVerificationConfidence(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  const verifiedCount = reviews.filter(r => r.verified).length;
  const verificationRate = verifiedCount / reviews.length;
  
  // Boost for GMB reviews (most reliable)
  const gmbCount = reviews.filter(r => r.source === "gmb_api").length;
  const gmbRate = gmbCount / reviews.length;
  
  const baseScore = verificationRate * 100;
  const gmbBonus = gmbRate * 20; // Up to 20 bonus points for GMB reviews
  
  return Math.min(100, baseScore + gmbBonus);
}

/**
 * Calculate performance mentions confidence (0-100)
 */
function calculatePerformanceMentionsConfidence(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  let performanceMentions = 0;
  let totalMentions = 0;
  
  for (const review of reviews) {
    let reviewMentions = 0;
    
    if (review.speedMentions?.hasSpeedMention) {
      reviewMentions++;
      totalMentions++;
    }
    if (review.valueMentions?.hasValueMention) {
      reviewMentions++;
      totalMentions++;
    }
    if (review.qualityMentions?.hasQualityMention) {
      reviewMentions++;
      totalMentions++;
    }
    if (review.reliabilityMentions?.hasReliabilityMention) {
      reviewMentions++;
      totalMentions++;
    }
    
    if (reviewMentions > 0) {
      performanceMentions++;
    }
  }
  
  const mentionRate = performanceMentions / reviews.length;
  const avgMentionsPerReview = totalMentions / reviews.length;
  
  // Base score from mention rate
  const baseScore = mentionRate * 70; // Up to 70 points
  
  // Bonus for multiple mentions per review
  const mentionBonus = Math.min(avgMentionsPerReview * 15, 30); // Up to 30 bonus points
  
  return Math.min(100, baseScore + mentionBonus);
}

/**
 * Calculate sentiment consistency confidence (0-100)
 */
function calculateSentimentConsistencyConfidence(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  const analyzedReviews = reviews.filter(r => r.sentiment?.classification);
  if (analyzedReviews.length === 0) return 0;
  
  // Count sentiment distribution
  const sentimentCounts = {
    positive: analyzedReviews.filter(r => r.sentiment.classification === "positive").length,
    neutral: analyzedReviews.filter(r => r.sentiment.classification === "neutral").length,
    negative: analyzedReviews.filter(r => r.sentiment.classification === "negative").length,
  };
  
  const total = analyzedReviews.length;
  
  // Calculate consistency score
  // Higher score for consistent sentiment, but not penalize negative reviews if they're consistent
  const dominantSentiment = Math.max(sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative);
  const consistencyRate = dominantSentiment / total;
  
  // Base score from consistency
  let baseScore = consistencyRate * 70; // Up to 70 points
  
  // Bonus for positive sentiment dominance (business quality indicator)
  if (sentimentCounts.positive === dominantSentiment && sentimentCounts.positive / total > 0.7) {
    baseScore += 20;
  }
  
  // Small bonus for having some variety (not all 5-star or all 1-star)
  const variety = Object.values(sentimentCounts).filter(count => count > 0).length;
  if (variety >= 2 && variety <= 3) {
    baseScore += 10;
  }
  
  return Math.min(100, baseScore);
}

/**
 * Calculate recency confidence (0-100)
 */
function calculateRecencyConfidence(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  
  let recentReviews = 0;
  let moderatelyRecentReviews = 0;
  let oldReviews = 0;
  
  for (const review of reviews) {
    const age = now - review.createdAt;
    
    if (age <= thirtyDaysMs) {
      recentReviews++;
    } else if (age <= ninetyDaysMs) {
      moderatelyRecentReviews++;
    } else if (age <= oneYearMs) {
      oldReviews++;
    }
    // Reviews older than 1 year don't contribute to recency confidence
  }
  
  const total = reviews.length;
  const recentRate = recentReviews / total;
  const moderateRate = moderatelyRecentReviews / total;
  
  // Score based on recency distribution
  const baseScore = (recentRate * 100) + (moderateRate * 50);
  
  return Math.min(100, baseScore);
}

/**
 * Calculate overall confidence score for a business
 */
export const calculateBusinessConfidenceScore = internalMutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get analyzed reviews for this business
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.neq(q.field("sentiment"), undefined)) // Only analyzed reviews
      .collect();

    if (reviews.length === 0) {
      return {
        businessId: args.businessId,
        overallConfidence: 0,
        breakdown: {
          reviewCount: 0,
          verification: 0,
          performanceMentions: 0,
          sentimentConsistency: 0,
          recency: 0,
        },
        factors: {
          totalReviews: 0,
          analyzedReviews: 0,
          verifiedReviews: 0,
          performanceMentionReviews: 0,
        },
      };
    }

    // Calculate individual confidence components
    const reviewCountConfidence = calculateReviewCountConfidence(reviews.length);
    const verificationConfidence = calculateVerificationConfidence(reviews);
    const performanceMentionsConfidence = calculatePerformanceMentionsConfidence(reviews);
    const sentimentConsistencyConfidence = calculateSentimentConsistencyConfidence(reviews);
    const recencyConfidence = calculateRecencyConfidence(reviews);

    // Calculate weighted overall confidence score
    const overallConfidence = Math.round(
      (reviewCountConfidence * CONFIDENCE_WEIGHTS.reviewCount) +
      (verificationConfidence * CONFIDENCE_WEIGHTS.reviewVerification) +
      (performanceMentionsConfidence * CONFIDENCE_WEIGHTS.performanceMentions) +
      (sentimentConsistencyConfidence * CONFIDENCE_WEIGHTS.sentimentConsistency) +
      (recencyConfidence * CONFIDENCE_WEIGHTS.recency)
    );

    // Gather additional factors for analysis
    const verifiedReviews = reviews.filter(r => r.verified).length;
    const performanceMentionReviews = reviews.filter(r => 
      r.speedMentions?.hasSpeedMention ||
      r.valueMentions?.hasValueMention ||
      r.qualityMentions?.hasQualityMention ||
      r.reliabilityMentions?.hasReliabilityMention
    ).length;

    const result = {
      businessId: args.businessId,
      overallConfidence,
      breakdown: {
        reviewCount: Math.round(reviewCountConfidence),
        verification: Math.round(verificationConfidence),
        performanceMentions: Math.round(performanceMentionsConfidence),
        sentimentConsistency: Math.round(sentimentConsistencyConfidence),
        recency: Math.round(recencyConfidence),
      },
      factors: {
        totalReviews: reviews.length,
        analyzedReviews: reviews.length,
        verifiedReviews,
        performanceMentionReviews,
        gmbReviews: reviews.filter(r => r.source === "gmb_api").length,
        recentReviews: reviews.filter(r => (Date.now() - r.createdAt) <= 30 * 24 * 60 * 60 * 1000).length,
      },
      weights: CONFIDENCE_WEIGHTS,
    };

    // Update performance metrics with confidence score
    const existingMetrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();

    if (existingMetrics) {
      await ctx.db.patch(existingMetrics._id, {
        confidenceLevel: overallConfidence,
        lastUpdated: Date.now(),
      });
    }

    return result;
  },
});

/**
 * Calculate confidence scores for multiple businesses
 */
export const calculateBatchConfidenceScores = internalMutation({
  args: {
    businessIds: v.optional(v.array(v.id("businesses"))),
    city: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let businesses;
    
    if (args.businessIds) {
      businesses = await Promise.all(
        args.businessIds.map(id => ctx.db.get(id))
      );
      businesses = businesses.filter(Boolean);
    } else {
      let query = ctx.db.query("businesses");
      
      if (args.city) {
        query = query.withIndex("by_city", (q) => q.eq("city", args.city));
      } else if (args.categoryId) {
        query = query.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId));
      }
      
      businesses = await query.take(args.limit || 50);
    }

    let processed = 0;
    let failed = 0;
    const results: any[] = [];
    const errors: string[] = [];

    for (const business of businesses) {
      try {
        const result = await ctx.runMutation(internal.calculateBusinessConfidenceScore, {
          businessId: business._id,
        });
        
        results.push(result);
        processed++;
        
      } catch (error) {
        failed++;
        errors.push(`Business ${business._id} (${business.name}): ${error}`);
      }
    }

    return {
      processed,
      failed,
      results,
      errors: errors.length > 0 ? errors : undefined,
      averageConfidence: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.overallConfidence, 0) / results.length)
        : 0,
    };
  },
});

/**
 * Get confidence score analytics for admin dashboard
 */
export const getConfidenceAnalytics = query({
  args: {
    city: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    // Get performance metrics with confidence scores
    let businesses;
    
    if (args.city) {
      businesses = await ctx.db
        .query("businesses")
        .withIndex("by_city", (q) => q.eq("city", args.city))
        .collect();
    } else if (args.categoryId) {
      businesses = await ctx.db
        .query("businesses")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .collect();
    } else {
      businesses = await ctx.db.query("businesses").collect();
    }

    const metricsPromises = businesses.map(b =>
      ctx.db
        .query("performanceMetrics")
        .withIndex("by_business", (q) => q.eq("businessId", b._id))
        .first()
    );

    const allMetrics = await Promise.all(metricsPromises);
    const metrics = allMetrics.filter(Boolean); // Remove null entries

    if (metrics.length === 0) {
      return {
        totalBusinesses: businesses.length,
        businessesWithConfidenceScores: 0,
        averageConfidence: 0,
        confidenceDistribution: [],
        lowConfidenceBusinesses: [],
        highConfidenceBusinesses: [],
      };
    }

    // Analyze confidence distribution
    const confidenceScores = metrics.map(m => m.confidenceLevel || 0);
    const averageConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    // Group into confidence buckets
    const buckets = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };

    confidenceScores.forEach(score => {
      if (score <= 20) buckets["0-20"]++;
      else if (score <= 40) buckets["21-40"]++;
      else if (score <= 60) buckets["41-60"]++;
      else if (score <= 80) buckets["61-80"]++;
      else buckets["81-100"]++;
    });

    const confidenceDistribution = Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / metrics.length) * 100),
    }));

    // Identify businesses needing attention
    const businessMetricsPairs = businesses.map((b, i) => ({ business: b, metrics: allMetrics[i] }));
    
    const lowConfidenceBusinesses = businessMetricsPairs
      .filter(pair => pair.metrics && pair.metrics.confidenceLevel < 40)
      .map(pair => ({
        id: pair.business._id,
        name: pair.business.name,
        city: pair.business.city,
        confidence: pair.metrics.confidenceLevel,
        reviewsAnalyzed: pair.metrics.totalReviewsAnalyzed,
      }))
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 10);

    const highConfidenceBusinesses = businessMetricsPairs
      .filter(pair => pair.metrics && pair.metrics.confidenceLevel >= 80)
      .map(pair => ({
        id: pair.business._id,
        name: pair.business.name,
        city: pair.business.city,
        confidence: pair.metrics.confidenceLevel,
        reviewsAnalyzed: pair.metrics.totalReviewsAnalyzed,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    return {
      totalBusinesses: businesses.length,
      businessesWithConfidenceScores: metrics.length,
      averageConfidence: Math.round(averageConfidence),
      confidenceDistribution,
      lowConfidenceBusinesses,
      highConfidenceBusinesses,
      qualityMetrics: {
        highConfidenceRate: Math.round((buckets["81-100"] / metrics.length) * 100),
        mediumConfidenceRate: Math.round(((buckets["41-60"] + buckets["61-80"]) / metrics.length) * 100),
        lowConfidenceRate: Math.round(((buckets["0-20"] + buckets["21-40"]) / metrics.length) * 100),
      },
    };
  },
});

/**
 * Get detailed confidence score for a specific business
 */
export const getBusinessConfidenceDetails = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    const analyzedReviews = reviews.filter(r => r.sentiment?.classification);

    return {
      businessId: args.businessId,
      businessName: business.name,
      overallConfidence: metrics?.confidenceLevel || 0,
      reviewStats: {
        total: reviews.length,
        analyzed: analyzedReviews.length,
        verified: reviews.filter(r => r.verified).length,
        withPerformanceMentions: analyzedReviews.filter(r => 
          r.speedMentions?.hasSpeedMention ||
          r.valueMentions?.hasValueMention ||
          r.qualityMentions?.hasQualityMention ||
          r.reliabilityMentions?.hasReliabilityMention
        ).length,
        sources: {
          gmb: reviews.filter(r => r.source === "gmb_api").length,
          yelp: reviews.filter(r => r.source === "yelp_import").length,
          facebook: reviews.filter(r => r.source === "facebook_import").length,
          direct: reviews.filter(r => r.source === "direct").length,
        },
      },
      recommendations: generateConfidenceRecommendations(reviews, analyzedReviews, metrics?.confidenceLevel || 0),
      lastUpdated: metrics?.lastUpdated,
    };
  },
});

/**
 * Generate recommendations for improving confidence scores
 */
function generateConfidenceRecommendations(reviews: any[], analyzedReviews: any[], confidenceScore: number): string[] {
  const recommendations: string[] = [];
  
  if (reviews.length < 10) {
    recommendations.push("Encourage more customer reviews to increase confidence. Aim for at least 10 reviews.");
  }
  
  if (analyzedReviews.length < reviews.length * 0.8) {
    recommendations.push("Run AI analysis on remaining reviews to improve scoring accuracy.");
  }
  
  const verifiedRate = reviews.filter(r => r.verified).length / reviews.length;
  if (verifiedRate < 0.5) {
    recommendations.push("Connect Google My Business to increase verified review percentage.");
  }
  
  const performanceMentionRate = analyzedReviews.filter(r => 
    r.speedMentions?.hasSpeedMention ||
    r.valueMentions?.hasValueMention ||
    r.qualityMentions?.hasQualityMention ||
    r.reliabilityMentions?.hasReliabilityMention
  ).length / Math.max(analyzedReviews.length, 1);
  
  if (performanceMentionRate < 0.3) {
    recommendations.push("Encourage customers to mention specific aspects like speed, quality, or value in their reviews.");
  }
  
  const recentReviews = reviews.filter(r => (Date.now() - r.createdAt) <= 90 * 24 * 60 * 60 * 1000);
  if (recentReviews.length < reviews.length * 0.3) {
    recommendations.push("Focus on getting more recent reviews to improve recency confidence.");
  }
  
  if (confidenceScore >= 80) {
    recommendations.push("Excellent confidence score! Continue maintaining high service quality.");
  } else if (confidenceScore >= 60) {
    recommendations.push("Good confidence score. Focus on areas with lower scores to improve further.");
  } else {
    recommendations.push("Low confidence score indicates need for more review data and engagement.");
  }
  
  return recommendations;
}