/**
 * Master Ranking Algorithm Implementation
 * Part of AI Ranking System - Phase 2
 * Implements composite ranking, tier enhancements, and city+category calculations
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Category-specific performance weights for ranking
 * Based on what matters most for each business type
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
  "auto-repair": { speed: 0.35, quality: 0.3, reliability: 0.25, value: 0.2 },
  "home-improvement": { quality: 0.4, value: 0.3, reliability: 0.2, speed: 0.15 },
  "default": { speed: 0.25, value: 0.25, quality: 0.25, reliability: 0.25 },
};

/**
 * Tier enhancement bonuses (small bonuses for tie-breaking, not score manipulation)
 */
const TIER_BONUSES = {
  "free": 0,
  "starter": 0.02,    // 2% bonus for tie-breaking
  "pro": 0.03,        // 3% bonus for tie-breaking
  "power": 0.05,      // 5% bonus for tie-breaking
};

/**
 * Calculate recency weighting multiplier for reviews
 */
function calculateRecencyWeight(reviews: any[]): number {
  if (reviews.length === 0) return 1;
  
  const now = Date.now();
  const weights = reviews.map(review => {
    const daysSince = (now - review.createdAt) / (1000 * 60 * 60 * 24);
    
    // Exponential decay: more recent reviews have higher impact
    if (daysSince <= 30) return 1.0;      // Full weight for last 30 days
    if (daysSince <= 90) return 0.85;     // 85% weight for 30-90 days
    if (daysSince <= 180) return 0.7;     // 70% weight for 90-180 days
    if (daysSince <= 365) return 0.5;     // 50% weight for 180-365 days
    return 0.3;                           // 30% weight for older than 1 year
  });
  
  return weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
}

/**
 * Detect and handle ranking outliers
 */
function detectOutliers(businesses: any[]): {
  outliers: any[],
  adjustedBusinesses: any[],
  flags: string[]
} {
  const outliers: any[] = [];
  const flags: string[] = [];
  
  if (businesses.length < 3) {
    return { outliers: [], adjustedBusinesses: businesses, flags: [] };
  }
  
  // Calculate statistical measures
  const scores = businesses.map(b => b.finalScore).sort((a, b) => a - b);
  const q1 = scores[Math.floor(scores.length * 0.25)];
  const q3 = scores[Math.floor(scores.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const adjustedBusinesses = businesses.map(business => {
    const isOutlier = business.finalScore < lowerBound || business.finalScore > upperBound;
    
    if (isOutlier) {
      outliers.push({
        businessId: business.businessId,
        name: business.name,
        originalScore: business.finalScore,
        reason: business.finalScore > upperBound ? "unusually_high" : "unusually_low",
      });
      
      // Adjust outlier scores toward the bounds
      if (business.finalScore > upperBound) {
        business.finalScore = upperBound + (business.finalScore - upperBound) * 0.3;
        flags.push(`Adjusted ${business.name} from unusually high score`);
      } else {
        business.finalScore = lowerBound + (business.finalScore - lowerBound) * 0.3;
        flags.push(`Adjusted ${business.name} from unusually low score`);
      }
    }
    
    return business;
  });
  
  return { outliers, adjustedBusinesses, flags };
}

/**
 * Implement tie-breaking logic for businesses with similar scores
 */
function applyTieBreaking(businesses: any[]): any[] {
  return businesses.map((business, index, array) => {
    // Find businesses with very similar scores (within 0.1 points)
    const similarScores = array.filter(b => 
      Math.abs(b.finalScore - business.finalScore) <= 0.1 && b.businessId !== business.businessId
    );
    
    if (similarScores.length > 0) {
      // Apply tie-breaking factors
      let tieBreakingBonus = 0;
      
      // 1. Tier bonus (already applied in main calculation)
      // 2. Review count bonus
      if (business.reviewCount > 20) tieBreakingBonus += 0.02;
      if (business.reviewCount > 50) tieBreakingBonus += 0.02;
      
      // 3. Verification bonus
      if (business.verified) tieBreakingBonus += 0.02;
      
      // 4. Recent activity bonus
      if (business.lastRankingUpdate && (Date.now() - business.lastRankingUpdate) < 7 * 24 * 60 * 60 * 1000) {
        tieBreakingBonus += 0.01;
      }
      
      // 5. Performance mention density bonus
      if (business.performanceMentionRate > 0.5) tieBreakingBonus += 0.02;
      
      business.finalScore += tieBreakingBonus;
      business.tieBreakingApplied = tieBreakingBonus;
    }
    
    return business;
  });
}

/**
 * Calculate composite ranking for a business
 */
export const calculateBusinessRanking = internalMutation({
  args: {
    businessId: v.id("businesses"),
    city: v.string(),
    categorySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get analyzed reviews for recency calculation
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.neq(q.field("sentiment"), undefined))
      .collect();

    if (reviews.length === 0) {
      return {
        businessId: args.businessId,
        ranking: null,
        reason: "No analyzed reviews available"
      };
    }

    // Get performance scores (should be calculated in Phase 1)
    const speedScore = business.speedScore || 0;
    const valueScore = business.valueScore || 0;
    const qualityScore = business.qualityScore || 0;
    const reliabilityScore = business.reliabilityScore || 0;

    if (speedScore === 0 && valueScore === 0 && qualityScore === 0 && reliabilityScore === 0) {
      return {
        businessId: args.businessId,
        ranking: null,
        reason: "Performance scores not calculated"
      };
    }

    // Get category weights
    const weights = CATEGORY_WEIGHTS[args.categorySlug as keyof typeof CATEGORY_WEIGHTS] || CATEGORY_WEIGHTS.default;

    // Calculate weighted performance score
    const performanceScore = (
      (speedScore * weights.speed) +
      (valueScore * weights.value) +
      (qualityScore * weights.quality) +
      (reliabilityScore * weights.reliability)
    );

    // Apply recency weighting
    const recencyMultiplier = calculateRecencyWeight(reviews);

    // Apply tier enhancement (small bonus for tie-breaking)
    const tierBonus = TIER_BONUSES[business.planTier as keyof typeof TIER_BONUSES] || 0;

    // Calculate final score
    const finalScore = performanceScore * recencyMultiplier * (1 + tierBonus);

    // Calculate confidence based on data quality
    const performanceMentions = reviews.filter(r => 
      r.speedMentions?.hasSpeedMention ||
      r.valueMentions?.hasValueMention ||
      r.qualityMentions?.hasQualityMention ||
      r.reliabilityMentions?.hasReliabilityMention
    ).length;

    const rankingConfidence = Math.min(
      (reviews.length / 15) * 40 +                                        // 40% max from review count
      (reviews.filter(r => r.verified).length / reviews.length) * 30 +    // 30% max from verification
      (performanceMentions / reviews.length) * 30,                        // 30% max from performance mentions
      100
    );

    return {
      businessId: args.businessId,
      ranking: {
        finalScore: Math.round(finalScore * 100) / 100,
        performanceScore: Math.round(performanceScore * 100) / 100,
        recencyMultiplier: Math.round(recencyMultiplier * 100) / 100,
        tierBonus,
        confidence: Math.round(rankingConfidence),
        componentScores: {
          speed: speedScore,
          value: valueScore,
          quality: qualityScore,
          reliability: reliabilityScore,
        },
        weights,
        reviewCount: reviews.length,
        performanceMentionRate: performanceMentions / reviews.length,
      }
    };
  },
});

/**
 * Calculate and update rankings for all businesses in a city + category
 */
export const calculateCityCategoryRankings = internalMutation({
  args: {
    city: v.string(),
    categorySlug: v.string(),
    forceRecalculate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get category ID from slug
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.categorySlug}`);
    }

    // Get all businesses in this city + category
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("categoryId"), category._id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    if (businesses.length === 0) {
      return {
        city: args.city,
        category: args.categorySlug,
        rankings: [],
        message: "No businesses found"
      };
    }

    // Calculate rankings for each business
    const businessRankings: any[] = [];
    let calculated = 0;
    let failed = 0;

    for (const business of businesses) {
      try {
        const result = await ctx.runMutation(internal.calculateBusinessRanking, {
          businessId: business._id,
          city: args.city,
          categorySlug: args.categorySlug,
        });

        if (result.ranking) {
          businessRankings.push({
            businessId: business._id,
            name: business.name,
            planTier: business.planTier,
            verified: business.verified,
            ...result.ranking,
          });
          calculated++;
        }
      } catch (error) {
        failed++;
        console.error(`Failed to calculate ranking for ${business.name}:`, error);
      }
    }

    if (businessRankings.length === 0) {
      return {
        city: args.city,
        category: args.categorySlug,
        rankings: [],
        message: "No businesses had sufficient data for ranking"
      };
    }

    // Sort by final score (highest first)
    businessRankings.sort((a, b) => b.finalScore - a.finalScore);

    // Apply outlier detection and adjustment
    const { adjustedBusinesses, outliers, flags } = detectOutliers(businessRankings);

    // Apply tie-breaking logic
    const finalBusinesses = applyTieBreaking(adjustedBusinesses);

    // Re-sort after adjustments
    finalBusinesses.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranking positions
    const rankedBusinesses = finalBusinesses.map((business, index) => ({
      ...business,
      rank: index + 1,
      isOutlier: outliers.some(o => o.businessId === business.businessId),
    }));

    // Update businesses with their ranking positions
    for (const rankedBusiness of rankedBusinesses) {
      await ctx.db.patch(rankedBusiness.businessId, {
        cityRanking: rankedBusiness.rank,
        categoryRanking: rankedBusiness.rank, // Same for city+category specific ranking
        lastRankingUpdate: Date.now(),
      });
    }

    // Cache the rankings
    const cacheKey = `${args.city}-${args.categorySlug}-overall`;
    
    // Remove existing cache entry
    const existingCache = await ctx.db
      .query("rankingCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", cacheKey))
      .first();

    if (existingCache) {
      await ctx.db.delete(existingCache._id);
    }

    // Create new cache entry
    await ctx.db.insert("rankingCache", {
      cacheKey,
      rankings: rankedBusinesses.map(b => ({
        businessId: b.businessId,
        rank: b.rank,
        score: b.finalScore,
        performanceBadges: [], // Will be populated in Phase 2.3
      })),
      lastUpdated: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // Cache for 1 week
      city: args.city,
      category: args.categorySlug,
      rankingType: "overall",
      createdAt: Date.now(),
    });

    return {
      city: args.city,
      category: args.categorySlug,
      rankings: rankedBusinesses,
      statistics: {
        totalBusinesses: businesses.length,
        calculated,
        failed,
        outliers: outliers.length,
        averageScore: rankedBusinesses.length > 0 
          ? Math.round((rankedBusinesses.reduce((sum, b) => sum + b.finalScore, 0) / rankedBusinesses.length) * 100) / 100
          : 0,
        averageConfidence: rankedBusinesses.length > 0
          ? Math.round(rankedBusinesses.reduce((sum, b) => sum + b.confidence, 0) / rankedBusinesses.length)
          : 0,
      },
      adjustments: {
        outliers,
        flags,
      },
    };
  },
});

/**
 * Calculate rankings for specific performance aspects (speed, value, quality, reliability)
 */
export const calculateAspectRankings = internalMutation({
  args: {
    city: v.string(),
    categorySlug: v.string(),
    aspect: v.union(v.literal("speed"), v.literal("value"), v.literal("quality"), v.literal("reliability")),
  },
  handler: async (ctx, args) => {
    // Get category ID from slug
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.categorySlug}`);
    }

    // Get all businesses in this city + category with performance scores
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("categoryId"), category._id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Filter businesses that have the specific performance score
    const scoredBusinesses = businesses
      .filter(business => {
        const score = business[`${args.aspect}Score` as keyof typeof business] as number;
        return score && score > 0;
      })
      .map(business => {
        const score = business[`${args.aspect}Score` as keyof typeof business] as number;
        const tierBonus = TIER_BONUSES[business.planTier as keyof typeof TIER_BONUSES] || 0;
        
        return {
          businessId: business._id,
          name: business.name,
          planTier: business.planTier,
          score: score * (1 + tierBonus), // Apply tier bonus
          originalScore: score,
        };
      })
      .sort((a, b) => b.score - a.score); // Highest score first

    if (scoredBusinesses.length === 0) {
      return {
        city: args.city,
        category: args.categorySlug,
        aspect: args.aspect,
        rankings: [],
        message: `No businesses found with ${args.aspect} scores`
      };
    }

    // Assign rankings
    const rankedBusinesses = scoredBusinesses.map((business, index) => ({
      ...business,
      rank: index + 1,
    }));

    // Update performance metrics with aspect-specific rankings
    for (const rankedBusiness of rankedBusinesses) {
      const metrics = await ctx.db
        .query("performanceMetrics")
        .withIndex("by_business", (q) => q.eq("businessId", rankedBusiness.businessId))
        .first();

      if (metrics) {
        await ctx.db.patch(metrics._id, {
          [`${args.aspect}Ranking`]: rankedBusiness.rank,
          lastUpdated: Date.now(),
        });
      }
    }

    // Cache the aspect-specific rankings
    const cacheKey = `${args.city}-${args.categorySlug}-${args.aspect}`;
    
    // Remove existing cache
    const existingCache = await ctx.db
      .query("rankingCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", cacheKey))
      .first();

    if (existingCache) {
      await ctx.db.delete(existingCache._id);
    }

    // Create new cache
    await ctx.db.insert("rankingCache", {
      cacheKey,
      rankings: rankedBusinesses.map(b => ({
        businessId: b.businessId,
        rank: b.rank,
        score: b.score,
        performanceBadges: [], // Will be populated in Phase 2.3
      })),
      lastUpdated: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // Cache for 1 week
      city: args.city,
      category: args.categorySlug,
      rankingType: args.aspect,
      createdAt: Date.now(),
    });

    return {
      city: args.city,
      category: args.categorySlug,
      aspect: args.aspect,
      rankings: rankedBusinesses,
      statistics: {
        totalBusinesses: rankedBusinesses.length,
        averageScore: Math.round((rankedBusinesses.reduce((sum, b) => sum + b.score, 0) / rankedBusinesses.length) * 100) / 100,
        scoreRange: {
          highest: rankedBusinesses[0]?.score || 0,
          lowest: rankedBusinesses[rankedBusinesses.length - 1]?.score || 0,
        },
      },
    };
  },
});

/**
 * Get cached rankings for display
 */
export const getCachedRankings = query({
  args: {
    city: v.string(),
    category: v.string(),
    rankingType: v.union(v.literal("overall"), v.literal("speed"), v.literal("value"), v.literal("quality"), v.literal("reliability")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cacheKey = `${args.city}-${args.category}-${args.rankingType}`;
    
    const cachedRanking = await ctx.db
      .query("rankingCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", cacheKey))
      .first();

    if (!cachedRanking) {
      return {
        rankings: [],
        lastUpdated: null,
        cached: false,
        message: "No cached rankings found"
      };
    }

    // Check if cache is still valid
    const isExpired = Date.now() > cachedRanking.expiresAt;
    
    if (isExpired) {
      return {
        rankings: [],
        lastUpdated: cachedRanking.lastUpdated,
        cached: false,
        expired: true,
        message: "Cached rankings expired"
      };
    }

    // Get business details for the rankings
    const businessIds = cachedRanking.rankings.map(r => r.businessId);
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );

    const enrichedRankings = cachedRanking.rankings
      .slice(0, args.limit || 50)
      .map((ranking, index) => {
        const business = businesses[index];
        return {
          ...ranking,
          business: business ? {
            name: business.name,
            slug: business.slug,
            urlPath: business.urlPath,
            planTier: business.planTier,
            verified: business.verified,
            rating: business.rating,
            reviewCount: business.reviewCount,
            city: business.city,
          } : null,
        };
      })
      .filter(r => r.business !== null); // Remove deleted businesses

    return {
      rankings: enrichedRankings,
      lastUpdated: cachedRanking.lastUpdated,
      cached: true,
      expired: false,
      cacheKey,
      city: args.city,
      category: args.category,
      rankingType: args.rankingType,
    };
  },
});

/**
 * Trigger ranking calculation for a specific city + category
 */
export const triggerRankingCalculation = mutation({
  args: {
    city: v.string(),
    categorySlug: v.string(),
    includeAspects: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check permissions (admin only for manual triggers)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Schedule overall ranking calculation
    await ctx.scheduler.runAfter(0, internal.calculateCityCategoryRankings, {
      city: args.city,
      categorySlug: args.categorySlug,
      forceRecalculate: true,
    });

    // Optionally schedule aspect-specific rankings
    if (args.includeAspects) {
      const aspects = ["speed", "value", "quality", "reliability"] as const;
      
      for (const aspect of aspects) {
        await ctx.scheduler.runAfter(1000, internal.calculateAspectRankings, {
          city: args.city,
          categorySlug: args.categorySlug,
          aspect,
        });
      }
    }

    return {
      status: "calculation_scheduled",
      city: args.city,
      category: args.categorySlug,
      includeAspects: args.includeAspects || false,
      message: "Ranking calculations have been scheduled"
    };
  },
});