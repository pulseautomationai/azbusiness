/**
 * Performance Badge Generation System
 * Part of AI Ranking System - Phase 2.3
 * Generates specific, measurable performance badges with metrics
 */

import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Badge color schemes by performance level
 */
const BADGE_COLORS = {
  gold: {
    background: "#FFD700",
    text: "#8B4513",
    border: "#FFA500",
    priority: 1,
  },
  silver: {
    background: "#C0C0C0", 
    text: "#2F4F4F",
    border: "#A9A9A9",
    priority: 2,
  },
  bronze: {
    background: "#CD7F32",
    text: "#FFFFFF",
    border: "#8B4513",
    priority: 3,
  },
  blue: {
    background: "#4169E1",
    text: "#FFFFFF", 
    border: "#0000CD",
    priority: 4,
  },
  green: {
    background: "#32CD32",
    text: "#FFFFFF",
    border: "#228B22",
    priority: 5,
  },
};

/**
 * Badge criteria and thresholds
 */
const BADGE_CRITERIA = {
  speed: {
    "lightning_fast": {
      minScore: 9.0,
      minMentions: 5,
      requiresResponseTime: true,
      color: "gold",
      priority: 1,
    },
    "rapid_response": {
      minScore: 8.0,
      minMentions: 3,
      requiresResponseTime: true,
      color: "silver",
      priority: 2,
    },
    "quick_service": {
      minScore: 7.0,
      minMentions: 2,
      requiresResponseTime: false,
      color: "bronze",
      priority: 3,
    },
    "emergency_ready": {
      minScore: 6.0,
      minMentions: 2,
      requiresUrgency: "high",
      color: "blue",
      priority: 4,
    },
  },
  value: {
    "exceptional_value": {
      minScore: 9.0,
      minMentions: 5,
      maxExpensiveRate: 0.1,
      color: "gold",
      priority: 1,
    },
    "great_value": {
      minScore: 8.0,
      minMentions: 3,
      maxExpensiveRate: 0.2,
      color: "silver",
      priority: 2,
    },
    "fair_pricing": {
      minScore: 7.0,
      minMentions: 2,
      maxExpensiveRate: 0.3,
      color: "bronze",
      priority: 3,
    },
    "budget_friendly": {
      minScore: 6.5,
      minMentions: 2,
      requiresCheapMentions: true,
      color: "green",
      priority: 4,
    },
  },
  quality: {
    "master_craftsman": {
      minScore: 9.5,
      minMentions: 5,
      requiresDetailOriented: 0.7,
      color: "gold",
      priority: 1,
    },
    "expert_quality": {
      minScore: 8.5,
      minMentions: 3,
      requiresDetailOriented: 0.5,
      color: "silver",
      priority: 2,
    },
    "quality_work": {
      minScore: 7.5,
      minMentions: 2,
      requiresDetailOriented: 0.3,
      color: "bronze",
      priority: 3,
    },
    "attention_to_detail": {
      minScore: 7.0,
      minMentions: 2,
      requiresDetailOriented: 0.6,
      color: "blue",
      priority: 4,
    },
  },
  reliability: {
    "ultra_reliable": {
      minScore: 9.0,
      minMentions: 5,
      requiresFollowThrough: 0.8,
      color: "gold",
      priority: 1,
    },
    "dependable": {
      minScore: 8.0,
      minMentions: 3,
      requiresFollowThrough: 0.6,
      color: "silver",
      priority: 2,
    },
    "consistent": {
      minScore: 7.0,
      minMentions: 2,
      requiresFollowThrough: 0.4,
      color: "bronze",
      priority: 3,
    },
    "trustworthy": {
      minScore: 7.5,
      minMentions: 3,
      requiresFollowThrough: 0.5,
      color: "blue",
      priority: 4,
    },
  },
};

/**
 * Generate specific badge text with metrics
 */
function generateBadgeText(badgeType: string, aspect: string, metrics: any): string {
  const templates = {
    speed: {
      lightning_fast: `Lightning Fast • ${metrics.avgResponseTime || 'Same Day'} Response`,
      rapid_response: `Rapid Response • ${metrics.avgResponseTime || 'Quick'} Service`,
      quick_service: `Quick Service • ${metrics.speedMentions} Speed Reviews`,
      emergency_ready: `Emergency Ready • ${metrics.urgencyMentions} Urgent Calls`,
    },
    value: {
      exceptional_value: `Exceptional Value • ${metrics.fairPriceRate}% Say Fair Price`,
      great_value: `Great Value • ${metrics.valueMentions} Value Reviews`,
      fair_pricing: `Fair Pricing • ${metrics.fairPriceRate}% Appreciate Cost`,
      budget_friendly: `Budget Friendly • ${metrics.cheapMentions} Affordable Reviews`,
    },
    quality: {
      master_craftsman: `Master Craftsman • ${metrics.detailRate}% Note Detail`,
      expert_quality: `Expert Quality • ${metrics.qualityMentions} Quality Reviews`,
      quality_work: `Quality Work • ${Math.round(metrics.avgQualityScore * 10)/10}/10 Quality`,
      attention_to_detail: `Attention to Detail • ${metrics.detailMentions} Detail Reviews`,
    },
    reliability: {
      ultra_reliable: `Ultra Reliable • ${metrics.followThroughRate}% Follow Through`,
      dependable: `Dependable • ${metrics.reliabilityMentions} Reliability Reviews`,
      consistent: `Consistent • ${Math.round(metrics.avgReliabilityScore * 10)/10}/10 Consistency`,
      trustworthy: `Trustworthy • ${metrics.followThroughMentions} Keep Promises`,
    },
  };

  return templates[aspect as keyof typeof templates]?.[badgeType as keyof any] || 
         `${badgeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
}

/**
 * Calculate metrics for badge generation
 */
function calculateBadgeMetrics(reviews: any[], aspect: string): any {
  const aspectReviews = reviews.filter(r => {
    switch (aspect) {
      case 'speed': return r.speedMentions?.hasSpeedMention;
      case 'value': return r.valueMentions?.hasValueMention;
      case 'quality': return r.qualityMentions?.hasQualityMention;
      case 'reliability': return r.reliabilityMentions?.hasReliabilityMention;
      default: return false;
    }
  });

  if (aspectReviews.length === 0) return null;

  const baseMetrics = {
    totalReviews: reviews.length,
    aspectReviews: aspectReviews.length,
    aspectMentions: aspectReviews.length,
  };

  switch (aspect) {
    case 'speed':
      const responseTimeMentions = aspectReviews.filter(r => r.speedMentions?.responseTime);
      const urgencyMentions = aspectReviews.filter(r => r.speedMentions?.urgencyLevel === 'high');
      const avgResponseTime = responseTimeMentions.length > 0 ? 
        getMostCommonResponseTime(responseTimeMentions.map(r => r.speedMentions.responseTime)) : null;
      
      return {
        ...baseMetrics,
        speedMentions: aspectReviews.length,
        responseTimeMentions: responseTimeMentions.length,
        urgencyMentions: urgencyMentions.length,
        avgResponseTime,
      };

    case 'value':
      const fairPriceMentions = aspectReviews.filter(r => r.valueMentions?.pricePerception === 'fair');
      const cheapMentions = aspectReviews.filter(r => r.valueMentions?.pricePerception === 'cheap');
      const expensiveMentions = aspectReviews.filter(r => r.valueMentions?.pricePerception === 'expensive');
      
      return {
        ...baseMetrics,
        valueMentions: aspectReviews.length,
        fairPriceMentions: fairPriceMentions.length,
        cheapMentions: cheapMentions.length,
        expensiveMentions: expensiveMentions.length,
        fairPriceRate: Math.round((fairPriceMentions.length / aspectReviews.length) * 100),
        expensiveRate: expensiveMentions.length / aspectReviews.length,
      };

    case 'quality':
      const detailMentions = aspectReviews.filter(r => r.qualityMentions?.detailOriented);
      const qualityScores = aspectReviews.filter(r => r.qualityMentions?.workmanshipScore)
        .map(r => r.qualityMentions.workmanshipScore);
      const avgQualityScore = qualityScores.length > 0 ?
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0;
      
      return {
        ...baseMetrics,
        qualityMentions: aspectReviews.length,
        detailMentions: detailMentions.length,
        detailRate: Math.round((detailMentions.length / aspectReviews.length) * 100),
        avgQualityScore,
      };

    case 'reliability':
      const followThroughMentions = aspectReviews.filter(r => r.reliabilityMentions?.followThrough);
      const consistencyScores = aspectReviews.filter(r => r.reliabilityMentions?.consistencyScore)
        .map(r => r.reliabilityMentions.consistencyScore);
      const avgReliabilityScore = consistencyScores.length > 0 ?
        consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length : 0;
      
      return {
        ...baseMetrics,
        reliabilityMentions: aspectReviews.length,
        followThroughMentions: followThroughMentions.length,
        followThroughRate: Math.round((followThroughMentions.length / aspectReviews.length) * 100),
        avgReliabilityScore,
      };

    default:
      return baseMetrics;
  }
}

/**
 * Helper function to get most common response time
 */
function getMostCommonResponseTime(responseTimes: string[]): string {
  if (responseTimes.length === 0) return "Fast";
  
  const timeCounts: Record<string, number> = {};
  responseTimes.forEach(time => {
    const normalized = time.toLowerCase();
    if (normalized.includes('minute')) timeCounts['Minutes'] = (timeCounts['Minutes'] || 0) + 1;
    else if (normalized.includes('hour')) timeCounts['Hours'] = (timeCounts['Hours'] || 0) + 1;
    else if (normalized.includes('same day')) timeCounts['Same Day'] = (timeCounts['Same Day'] || 0) + 1;
    else if (normalized.includes('immediate')) timeCounts['Immediate'] = (timeCounts['Immediate'] || 0) + 1;
    else timeCounts['Fast'] = (timeCounts['Fast'] || 0) + 1;
  });
  
  return Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Check if business qualifies for a specific badge
 */
function qualifiesForBadge(
  badgeType: string,
  criteria: any,
  businessScore: number,
  metrics: any
): boolean {
  // Check minimum score
  if (businessScore < criteria.minScore) return false;
  
  // Check minimum mentions
  if (metrics.aspectMentions < criteria.minMentions) return false;
  
  // Check specific criteria based on badge type
  if (criteria.requiresResponseTime && !metrics.responseTimeMentions) return false;
  if (criteria.requiresUrgency && metrics.urgencyMentions === 0) return false;
  if (criteria.maxExpensiveRate && metrics.expensiveRate > criteria.maxExpensiveRate) return false;
  if (criteria.requiresCheapMentions && metrics.cheapMentions === 0) return false;
  if (criteria.requiresDetailOriented && (metrics.detailRate / 100) < criteria.requiresDetailOriented) return false;
  if (criteria.requiresFollowThrough && (metrics.followThroughRate / 100) < criteria.requiresFollowThrough) return false;
  
  return true;
}

/**
 * Generate performance badges for a business
 */
export const generateBusinessBadges = internalMutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get analyzed reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.neq(q.field("sentiment"), undefined))
      .collect();

    if (reviews.length === 0) {
      return {
        businessId: args.businessId,
        badges: [],
        message: "No analyzed reviews available for badge generation"
      };
    }

    const badges: any[] = [];
    const aspects = ['speed', 'value', 'quality', 'reliability'] as const;

    for (const aspect of aspects) {
      const businessScore = business[`${aspect}Score` as keyof typeof business] as number;
      if (!businessScore || businessScore === 0) continue;

      const metrics = calculateBadgeMetrics(reviews, aspect);
      if (!metrics) continue;

      const aspectCriteria = BADGE_CRITERIA[aspect];
      
      // Check each badge type for this aspect (in priority order)
      for (const [badgeType, criteria] of Object.entries(aspectCriteria)) {
        if (qualifiesForBadge(badgeType, criteria, businessScore, metrics)) {
          const badgeText = generateBadgeText(badgeType, aspect, metrics);
          const colors = BADGE_COLORS[criteria.color as keyof typeof BADGE_COLORS];
          
          badges.push({
            id: `${aspect}_${badgeType}`,
            type: badgeType,
            aspect,
            text: badgeText,
            score: businessScore,
            priority: criteria.priority,
            colors,
            metrics: {
              score: businessScore,
              mentions: metrics.aspectMentions,
              totalReviews: metrics.totalReviews,
            },
          });
          
          // Only award one badge per aspect (highest priority)
          break;
        }
      }
    }

    // Sort badges by priority (lower number = higher priority)
    badges.sort((a, b) => a.priority - b.priority);

    // Limit to top 3 badges for display
    const displayBadges = badges.slice(0, 3);

    return {
      businessId: args.businessId,
      badges: displayBadges,
      allEligibleBadges: badges,
      badgeCount: displayBadges.length,
    };
  },
});

/**
 * Update ranking cache with performance badges
 */
export const updateRankingCacheWithBadges = internalMutation({
  args: {
    city: v.string(),
    category: v.string(),
    rankingType: v.union(v.literal("overall"), v.literal("speed"), v.literal("value"), v.literal("quality"), v.literal("reliability")),
  },
  handler: async (ctx, args) => {
    const cacheKey = `${args.city}-${args.category}-${args.rankingType}`;
    
    const cachedRanking = await ctx.db
      .query("rankingCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", cacheKey))
      .first();

    if (!cachedRanking) {
      return { message: "No cached ranking found to update" };
    }

    let updated = 0;
    const updatedRankings = [];

    for (const ranking of cachedRanking.rankings) {
      try {
        const badgeResult = await ctx.runMutation(internal.generateBusinessBadges, {
          businessId: ranking.businessId,
        });

        const performanceBadges = badgeResult.badges.map((badge: any) => badge.text);
        
        updatedRankings.push({
          ...ranking,
          performanceBadges,
        });
        
        updated++;
      } catch (error) {
        console.error(`Failed to generate badges for business ${ranking.businessId}:`, error);
        updatedRankings.push(ranking); // Keep original without badges
      }
    }

    // Update the cached ranking with badges
    await ctx.db.patch(cachedRanking._id, {
      rankings: updatedRankings,
      lastUpdated: Date.now(),
    });

    return {
      cacheKey,
      updated,
      total: cachedRanking.rankings.length,
      message: `Updated ${updated} businesses with performance badges`
    };
  },
});

/**
 * Get business badges for display
 */
export const getBusinessBadges = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Check if we have cached badge data in ranking cache
    const rankings = await ctx.db
      .query("rankingCache")
      .filter((q) => q.gt(q.field("lastUpdated"), 0))
      .collect();

    // Look for this business in any ranking cache
    let cachedBadges: string[] = [];
    for (const ranking of rankings) {
      const businessRanking = ranking.rankings.find(r => r.businessId === args.businessId);
      if (businessRanking && businessRanking.performanceBadges?.length > 0) {
        cachedBadges = businessRanking.performanceBadges;
        break;
      }
    }

    if (cachedBadges.length > 0) {
      return {
        businessId: args.businessId,
        badges: cachedBadges.map((text, index) => ({
          id: `cached_${index}`,
          text,
          cached: true,
        })),
        cached: true,
      };
    }

    // If no cached badges, generate them on demand
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.neq(q.field("sentiment"), undefined))
      .collect();

    if (reviews.length === 0) {
      return {
        businessId: args.businessId,
        badges: [],
        message: "No analyzed reviews available"
      };
    }

    const badges: any[] = [];
    const aspects = ['speed', 'value', 'quality', 'reliability'] as const;

    for (const aspect of aspects) {
      const businessScore = business[`${aspect}Score` as keyof typeof business] as number;
      if (!businessScore || businessScore === 0) continue;

      const metrics = calculateBadgeMetrics(reviews, aspect);
      if (!metrics) continue;

      const aspectCriteria = BADGE_CRITERIA[aspect];
      
      for (const [badgeType, criteria] of Object.entries(aspectCriteria)) {
        if (qualifiesForBadge(badgeType, criteria, businessScore, metrics)) {
          const badgeText = generateBadgeText(badgeType, aspect, metrics);
          const colors = BADGE_COLORS[criteria.color as keyof typeof BADGE_COLORS];
          
          badges.push({
            id: `${aspect}_${badgeType}`,
            type: badgeType,
            aspect,
            text: badgeText,
            priority: criteria.priority,
            colors,
          });
          break;
        }
      }
    }

    badges.sort((a, b) => a.priority - b.priority);

    return {
      businessId: args.businessId,
      badges: badges.slice(0, 3),
      cached: false,
    };
  },
});