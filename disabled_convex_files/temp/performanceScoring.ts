/**
 * Performance Scoring Engine
 * Part of AI Ranking System - Phase 1.3
 * Calculates performance scores from AI analysis for ranking purposes
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Scoring weights for different business categories
 */
const CATEGORY_WEIGHTS = {
  "hvac": { speed: 0.4, quality: 0.35, value: 0.15, reliability: 0.3 },
  "plumbing": { speed: 0.5, reliability: 0.3, value: 0.1, quality: 0.25 },
  "landscaping": { quality: 0.45, value: 0.3, reliability: 0.15, speed: 0.2 },
  "cleaning": { quality: 0.4, reliability: 0.35, value: 0.15, speed: 0.2 },
  "electrical": { speed: 0.4, quality: 0.35, reliability: 0.3, value: 0.15 },
  "roofing": { quality: 0.5, reliability: 0.3, value: 0.2, speed: 0.1 },
  "painting": { quality: 0.45, value: 0.25, reliability: 0.2, speed: 0.1 },
  "pest-control": { speed: 0.4, reliability: 0.35, value: 0.15, quality: 0.25 },
  "default": { speed: 0.25, value: 0.25, quality: 0.25, reliability: 0.25 },
};

/**
 * Calculate speed score from review analysis
 */
function calculateSpeedScore(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  let totalScore = 0;
  let speedMentions = 0;
  let urgencySum = 0;
  
  for (const review of reviews) {
    if (review.speedMentions?.hasSpeedMention) {
      speedMentions++;
      
      // Base score from review rating
      let reviewSpeedScore = review.rating * 2; // 2-10 scale
      
      // Adjust based on urgency level
      switch (review.speedMentions.urgencyLevel) {
        case "high":
          reviewSpeedScore += 2;
          urgencySum += 3;
          break;
        case "medium":
          reviewSpeedScore += 1;
          urgencySum += 2;
          break;
        case "low":
          urgencySum += 1;
          break;
      }
      
      // Adjust based on response time mentions
      const responseTime = review.speedMentions.responseTime?.toLowerCase() || "";
      if (responseTime.includes("minute") || responseTime.includes("immediate")) {
        reviewSpeedScore += 2;
      } else if (responseTime.includes("hour") || responseTime.includes("same day")) {
        reviewSpeedScore += 1;
      }
      
      totalScore += Math.min(reviewSpeedScore, 10); // Cap at 10
    }
  }
  
  if (speedMentions === 0) {
    // No speed mentions, use average rating as fallback
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.min(avgRating * 2, 10);
  }
  
  const baseScore = totalScore / speedMentions;
  const urgencyBonus = Math.min(urgencySum / speedMentions, 2); // Max 2 bonus points
  
  return Math.min(baseScore + urgencyBonus, 10);
}

/**
 * Calculate value score from review analysis
 */
function calculateValueScore(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  let totalScore = 0;
  let valueMentions = 0;
  let pricePerceptions = { expensive: 0, fair: 0, cheap: 0 };
  
  for (const review of reviews) {
    if (review.valueMentions?.hasValueMention) {
      valueMentions++;
      
      // Use the AI-provided value score if available
      if (review.valueMentions.valueScore) {
        totalScore += review.valueMentions.valueScore;
      } else {
        // Fallback calculation based on rating and price perception
        let reviewValueScore = review.rating * 2;
        
        switch (review.valueMentions.pricePerception) {
          case "cheap":
            reviewValueScore += 2;
            pricePerceptions.cheap++;
            break;
          case "fair":
            reviewValueScore += 1;
            pricePerceptions.fair++;
            break;
          case "expensive":
            // Don't penalize if high rating (good value despite cost)
            if (review.rating >= 4) {
              reviewValueScore += 0.5;
            }
            pricePerceptions.expensive++;
            break;
        }
        
        totalScore += Math.min(reviewValueScore, 10);
      }
    }
  }
  
  if (valueMentions === 0) {
    // No value mentions, use average rating as fallback
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.min(avgRating * 2, 10);
  }
  
  let baseScore = totalScore / valueMentions;
  
  // Adjust based on price perception distribution
  if (pricePerceptions.fair > pricePerceptions.expensive) {
    baseScore += 0.5; // Bonus for fair pricing consensus
  }
  if (pricePerceptions.cheap > 0 && pricePerceptions.expensive === 0) {
    baseScore += 1; // Bonus for good value consensus
  }
  
  return Math.min(baseScore, 10);
}

/**
 * Calculate quality score from review analysis
 */
function calculateQualityScore(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  let totalScore = 0;
  let qualityMentions = 0;
  let detailOrientedCount = 0;
  
  for (const review of reviews) {
    if (review.qualityMentions?.hasQualityMention) {
      qualityMentions++;
      
      // Use AI-provided workmanship score if available
      if (review.qualityMentions.workmanshipScore) {
        totalScore += review.qualityMentions.workmanshipScore;
      } else {
        // Fallback to rating-based score
        totalScore += review.rating * 2;
      }
      
      // Bonus for detail-oriented work
      if (review.qualityMentions.detailOriented) {
        detailOrientedCount++;
        totalScore += 1;
      }
    }
  }
  
  if (qualityMentions === 0) {
    // No quality mentions, use average rating as fallback
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.min(avgRating * 2, 10);
  }
  
  const baseScore = totalScore / qualityMentions;
  const detailBonus = Math.min((detailOrientedCount / qualityMentions) * 2, 1); // Max 1 bonus point
  
  return Math.min(baseScore + detailBonus, 10);
}

/**
 * Calculate reliability score from review analysis
 */
function calculateReliabilityScore(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  let totalScore = 0;
  let reliabilityMentions = 0;
  let followThroughCount = 0;
  
  for (const review of reviews) {
    if (review.reliabilityMentions?.hasReliabilityMention) {
      reliabilityMentions++;
      
      // Use AI-provided consistency score if available
      if (review.reliabilityMentions.consistencyScore) {
        totalScore += review.reliabilityMentions.consistencyScore;
      } else {
        // Fallback to rating-based score
        totalScore += review.rating * 2;
      }
      
      // Bonus for follow-through
      if (review.reliabilityMentions.followThrough) {
        followThroughCount++;
        totalScore += 1;
      }
    }
  }
  
  if (reliabilityMentions === 0) {
    // No reliability mentions, use average rating as fallback
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.min(avgRating * 2, 10);
  }
  
  const baseScore = totalScore / reliabilityMentions;
  const followThroughBonus = Math.min((followThroughCount / reliabilityMentions) * 2, 1); // Max 1 bonus point
  
  return Math.min(baseScore + followThroughBonus, 10);
}

/**
 * Calculate recency weighting multiplier
 */
function calculateRecencyWeight(reviews: any[]): number {
  if (reviews.length === 0) return 1;
  
  const now = Date.now();
  const weights = reviews.map(review => {
    const daysSince = (now - review.createdAt) / (1000 * 60 * 60 * 24);
    
    // Exponential decay over time
    if (daysSince <= 30) return 1.0;      // Full weight for last 30 days
    if (daysSince <= 90) return 0.8;      // 80% weight for 30-90 days
    if (daysSince <= 180) return 0.6;     // 60% weight for 90-180 days
    if (daysSince <= 365) return 0.4;     // 40% weight for 180-365 days
    return 0.2;                           // 20% weight for older than 1 year
  });
  
  return weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
}

/**
 * Calculate and update performance scores for a business
 */
export const calculateBusinessPerformanceScores = internalMutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get all analyzed reviews for this business
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.neq(q.field("sentiment"), undefined)) // Only analyzed reviews
      .collect();

    if (reviews.length === 0) {
      return { 
        businessId: args.businessId,
        scores: null,
        reason: "No analyzed reviews available for scoring"
      };
    }

    // Calculate individual performance scores
    const speedScore = calculateSpeedScore(reviews);
    const valueScore = calculateValueScore(reviews);
    const qualityScore = calculateQualityScore(reviews);
    const reliabilityScore = calculateReliabilityScore(reviews);

    // Get category weights
    const category = await ctx.db.get(business.categoryId);
    const categorySlug = category?.slug || "default";
    const weights = CATEGORY_WEIGHTS[categorySlug as keyof typeof CATEGORY_WEIGHTS] || CATEGORY_WEIGHTS.default;

    // Calculate weighted overall score
    const weightedScore = (
      (speedScore * weights.speed) +
      (valueScore * weights.value) +
      (qualityScore * weights.quality) +
      (reliabilityScore * weights.reliability)
    );

    // Apply recency weighting
    const recencyMultiplier = calculateRecencyWeight(reviews);
    const finalScore = weightedScore * recencyMultiplier;

    // Calculate confidence level based on data quality
    const confidenceLevel = Math.min(
      (reviews.length / 10) * 50 + // 50% max from review count (10+ reviews = full confidence)
      (reviews.filter(r => r.verified).length / reviews.length) * 25 + // 25% max from verification
      ((reviews.filter(r => r.speedMentions?.hasSpeedMention || 
                           r.valueMentions?.hasValueMention || 
                           r.qualityMentions?.hasQualityMention || 
                           r.reliabilityMentions?.hasReliabilityMention).length / reviews.length) * 25), // 25% max from performance mentions
      100
    );

    // Update business with calculated scores
    await ctx.db.patch(args.businessId, {
      speedScore: Math.round(speedScore * 10) / 10,
      valueScore: Math.round(valueScore * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10,
      reliabilityScore: Math.round(reliabilityScore * 10) / 10,
      overallScore: Math.round(finalScore * 10) / 10,
      lastRankingUpdate: Date.now(),
    });

    // Update or create performance metrics record
    const existingMetrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();

    const metricsData = {
      businessId: args.businessId,
      
      // Individual scores for detailed breakdown
      avgResponseMentions: reviews.filter(r => r.speedMentions?.hasSpeedMention).length,
      emergencyAvailability: reviews.some(r => r.speedMentions?.urgencyLevel === "high"),
      speedRanking: 0, // Will be calculated in ranking phase
      
      priceRanking: 0, // Will be calculated in ranking phase
      valuePerceptionScore: valueScore,
      transparencyScore: reviews.filter(r => r.valueMentions?.pricePerception === "fair").length / Math.max(reviews.filter(r => r.valueMentions?.hasValueMention).length, 1) * 10,
      
      qualityRanking: 0, // Will be calculated in ranking phase
      craftsmanshipScore: qualityScore,
      detailScore: reviews.filter(r => r.qualityMentions?.detailOriented).length / Math.max(reviews.filter(r => r.qualityMentions?.hasQualityMention).length, 1) * 10,
      
      reliabilityRanking: 0, // Will be calculated in ranking phase
      consistencyScore: reliabilityScore,
      communicationScore: reviews.filter(r => r.reliabilityMentions?.followThrough).length / Math.max(reviews.filter(r => r.reliabilityMentions?.hasReliabilityMention).length, 1) * 10,
      
      lastUpdated: Date.now(),
      totalReviewsAnalyzed: reviews.length,
      confidenceLevel: Math.round(confidenceLevel),
      
      createdAt: existingMetrics?.createdAt || Date.now(),
    };

    if (existingMetrics) {
      await ctx.db.patch(existingMetrics._id, metricsData);
    } else {
      await ctx.db.insert("performanceMetrics", metricsData);
    }

    return {
      businessId: args.businessId,
      scores: {
        speed: speedScore,
        value: valueScore,
        quality: qualityScore,
        reliability: reliabilityScore,
        overall: finalScore,
      },
      metrics: {
        reviewsAnalyzed: reviews.length,
        confidenceLevel: Math.round(confidenceLevel),
        recencyMultiplier: Math.round(recencyMultiplier * 100) / 100,
        categoryWeights: weights,
      },
    };
  },
});

/**
 * Calculate performance scores for multiple businesses in batch
 */
export const calculateBatchPerformanceScores = internalMutation({
  args: {
    businessIds: v.optional(v.array(v.id("businesses"))),
    city: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let businesses;
    
    if (args.businessIds) {
      // Process specific businesses
      businesses = await Promise.all(
        args.businessIds.map(id => ctx.db.get(id))
      );
      businesses = businesses.filter(Boolean); // Remove null entries
    } else {
      // Process businesses by criteria
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
        const result = await ctx.runMutation(internal.calculateBusinessPerformanceScores, {
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
      results: results.filter(r => r.scores !== null),
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

/**
 * Get performance scores for a business
 */
export const getBusinessPerformanceScores = query({
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

    const category = await ctx.db.get(business.categoryId);

    return {
      businessId: args.businessId,
      businessName: business.name,
      category: category?.name,
      scores: {
        speed: business.speedScore || 0,
        value: business.valueScore || 0,
        quality: business.qualityScore || 0,
        reliability: business.reliabilityScore || 0,
        overall: business.overallScore || 0,
      },
      rankings: {
        city: business.cityRanking,
        category: business.categoryRanking,
      },
      metrics: metrics ? {
        confidenceLevel: metrics.confidenceLevel,
        totalReviewsAnalyzed: metrics.totalReviewsAnalyzed,
        lastUpdated: metrics.lastUpdated,
        detailedScores: {
          valuePerception: metrics.valuePerceptionScore,
          transparency: metrics.transparencyScore,
          craftsmanship: metrics.craftsmanshipScore,
          detailOriented: metrics.detailScore,
          consistency: metrics.consistencyScore,
          communication: metrics.communicationScore,
        },
      } : null,
      lastRankingUpdate: business.lastRankingUpdate,
    };
  },
});

/**
 * Trigger performance score calculation for a business
 */
export const triggerPerformanceCalculation = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    // Check permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Schedule performance calculation
    await ctx.scheduler.runAfter(0, internal.calculateBusinessPerformanceScores, {
      businessId: args.businessId,
    });

    return { 
      status: "calculation_scheduled",
      businessId: args.businessId,
      message: "Performance score calculation has been scheduled"
    };
  },
});