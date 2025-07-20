/**
 * Batch Ranking Processor
 * Part of AI Ranking System - Phase 2
 * Handles system-wide ranking calculations and cache management
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Process rankings for all city + category combinations
 */
export const processAllRankings = internalMutation({
  args: {
    forceRecalculate: v.optional(v.boolean()),
    includeAspects: v.optional(v.boolean()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all active cities and categories
    const cities = await ctx.db
      .query("cities")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    if (cities.length === 0 || categories.length === 0) {
      return {
        processed: 0,
        message: "No active cities or categories found"
      };
    }

    let processed = 0;
    let failed = 0;
    let scheduled = 0;
    const errors: string[] = [];
    const batchSize = args.batchSize || 5; // Process 5 combinations at a time

    // Create all city + category combinations
    const combinations: Array<{ city: string, categorySlug: string }> = [];
    for (const city of cities) {
      for (const category of categories) {
        combinations.push({
          city: city.name,
          categorySlug: category.slug,
        });
      }
    }

    console.log(`Processing ${combinations.length} city+category combinations in batches of ${batchSize}`);

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < combinations.length; i += batchSize) {
      const batch = combinations.slice(i, i + batchSize);
      
      for (const combo of batch) {
        try {
          // Check if we need to recalculate this combination
          if (!args.forceRecalculate) {
            const existingCache = await ctx.db
              .query("rankingCache")
              .withIndex("by_cache_key", (q) => q.eq("cacheKey", `${combo.city}-${combo.categorySlug}-overall`))
              .first();

            // Skip if cache is recent (less than 24 hours old)
            if (existingCache && (Date.now() - existingCache.lastUpdated) < 24 * 60 * 60 * 1000) {
              continue;
            }
          }

          // Schedule ranking calculation with a small delay to prevent overload
          await ctx.scheduler.runAfter(scheduled * 2000, internal.calculateCityCategoryRankings, {
            city: combo.city,
            categorySlug: combo.categorySlug,
            forceRecalculate: args.forceRecalculate,
          });

          scheduled++;

          // Optionally schedule aspect-specific rankings
          if (args.includeAspects) {
            const aspects = ["speed", "value", "quality", "reliability"] as const;
            
            for (let aspectIndex = 0; aspectIndex < aspects.length; aspectIndex++) {
              const aspect = aspects[aspectIndex];
              await ctx.scheduler.runAfter((scheduled * 2000) + ((aspectIndex + 1) * 500), internal.calculateAspectRankings, {
                city: combo.city,
                categorySlug: combo.categorySlug,
                aspect,
              });
            }
          }

          processed++;

        } catch (error) {
          failed++;
          errors.push(`Failed to schedule ${combo.city} + ${combo.categorySlug}: ${error}`);
        }
      }

      // Small delay between batches
      if (i + batchSize < combinations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      totalCombinations: combinations.length,
      processed,
      scheduled,
      failed,
      includeAspects: args.includeAspects || false,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit error messages
      estimatedCompletionMinutes: Math.ceil(scheduled * 2 / 60), // Rough estimate
    };
  },
});

/**
 * Update performance badges for all cached rankings
 */
export const updateAllBadges = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all ranking caches
    const allCaches = await ctx.db
      .query("rankingCache")
      .collect();

    if (allCaches.length === 0) {
      return {
        processed: 0,
        message: "No ranking caches found"
      };
    }

    let processed = 0;
    let failed = 0;
    let scheduled = 0;
    const errors: string[] = [];
    const batchSize = args.batchSize || 10; // Process 10 caches at a time

    // Process in batches
    for (let i = 0; i < allCaches.length; i += batchSize) {
      const batch = allCaches.slice(i, i + batchSize);
      
      for (const cache of batch) {
        try {
          // Schedule badge update with delay to prevent overload
          await ctx.scheduler.runAfter(scheduled * 1000, internal.updateRankingCacheWithBadges, {
            city: cache.city,
            category: cache.category,
            rankingType: cache.rankingType,
          });

          scheduled++;
          processed++;

        } catch (error) {
          failed++;
          errors.push(`Failed to schedule badge update for ${cache.cacheKey}: ${error}`);
        }
      }

      // Small delay between batches
      if (i + batchSize < allCaches.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return {
      totalCaches: allCaches.length,
      processed,
      scheduled,
      failed,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      estimatedCompletionMinutes: Math.ceil(scheduled / 60), // Rough estimate
    };
  },
});

/**
 * Clean up expired ranking caches
 */
export const cleanupExpiredCaches = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find all expired caches
    const expiredCaches = await ctx.db
      .query("rankingCache")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    let deleted = 0;
    const errors: string[] = [];

    for (const cache of expiredCaches) {
      try {
        await ctx.db.delete(cache._id);
        deleted++;
      } catch (error) {
        errors.push(`Failed to delete cache ${cache.cacheKey}: ${error}`);
      }
    }

    return {
      found: expiredCaches.length,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

/**
 * Get ranking processing status and statistics
 */
export const getRankingSystemStatus = query({
  args: {},
  handler: async (ctx, args) => {
    // Get system statistics
    const [cities, categories, businesses, caches, performanceMetrics] = await Promise.all([
      ctx.db.query("cities").withIndex("by_active", (q) => q.eq("active", true)).collect(),
      ctx.db.query("categories").withIndex("by_active", (q) => q.eq("active", true)).collect(),
      ctx.db.query("businesses").filter((q) => q.eq(q.field("active"), true)).collect(),
      ctx.db.query("rankingCache").collect(),
      ctx.db.query("performanceMetrics").collect(),
    ]);

    // Calculate coverage statistics
    const totalCombinations = cities.length * categories.length;
    const cachedCombinations = new Set(caches.map(c => `${c.city}-${c.category}`)).size;
    
    // Calculate freshness of caches
    const now = Date.now();
    const fresh = caches.filter(c => (now - c.lastUpdated) < 24 * 60 * 60 * 1000); // < 24 hours
    const stale = caches.filter(c => (now - c.lastUpdated) >= 24 * 60 * 60 * 1000 && now < c.expiresAt); // 24h - 7 days
    const expired = caches.filter(c => now >= c.expiresAt); // > 7 days

    // Calculate business scoring coverage
    const businessesWithScores = businesses.filter(b => 
      b.speedScore || b.valueScore || b.qualityScore || b.reliabilityScore
    );

    const businessesWithRankings = businesses.filter(b => 
      b.cityRanking || b.categoryRanking
    );

    // Calculate average scores by city
    const cityStats: Record<string, any> = {};
    for (const city of cities) {
      const cityBusinesses = businesses.filter(b => b.city === city.name);
      const cityScored = cityBusinesses.filter(b => b.overallScore && b.overallScore > 0);
      
      cityStats[city.name] = {
        totalBusinesses: cityBusinesses.length,
        scoredBusinesses: cityScored.length,
        avgScore: cityScored.length > 0 
          ? Math.round((cityScored.reduce((sum, b) => sum + (b.overallScore || 0), 0) / cityScored.length) * 100) / 100
          : 0,
        coverage: cityBusinesses.length > 0 ? Math.round((cityScored.length / cityBusinesses.length) * 100) : 0,
      };
    }

    return {
      system: {
        totalCities: cities.length,
        totalCategories: categories.length,
        totalBusinesses: businesses.length,
        totalCombinations,
        activeMetrics: performanceMetrics.length,
      },
      coverage: {
        cachedCombinations,
        coveragePercentage: totalCombinations > 0 ? Math.round((cachedCombinations / totalCombinations) * 100) : 0,
        businessesWithScores: businessesWithScores.length,
        businessesWithRankings: businessesWithRankings.length,
        scoringCoverage: businesses.length > 0 ? Math.round((businessesWithScores.length / businesses.length) * 100) : 0,
        rankingCoverage: businesses.length > 0 ? Math.round((businessesWithRankings.length / businesses.length) * 100) : 0,
      },
      cacheHealth: {
        totalCaches: caches.length,
        fresh: fresh.length,
        stale: stale.length,
        expired: expired.length,
        freshPercentage: caches.length > 0 ? Math.round((fresh.length / caches.length) * 100) : 0,
      },
      cityStats,
      recommendations: generateSystemRecommendations({
        totalCombinations,
        cachedCombinations,
        businessesWithScores: businessesWithScores.length,
        totalBusinesses: businesses.length,
        freshCaches: fresh.length,
        totalCaches: caches.length,
        expiredCaches: expired.length,
      }),
    };
  },
});

/**
 * Generate system health recommendations
 */
function generateSystemRecommendations(stats: any): string[] {
  const recommendations: string[] = [];
  
  // Coverage recommendations
  if (stats.cachedCombinations < stats.totalCombinations * 0.8) {
    recommendations.push("Run full ranking calculation to improve city+category coverage");
  }
  
  if (stats.businessesWithScores < stats.totalBusinesses * 0.7) {
    recommendations.push("Run performance score calculation for more businesses");
  }
  
  // Cache health recommendations
  if (stats.freshCaches < stats.totalCaches * 0.5) {
    recommendations.push("Schedule ranking updates to refresh stale caches");
  }
  
  if (stats.expiredCaches > 0) {
    recommendations.push("Clean up expired ranking caches to free storage");
  }
  
  // Performance recommendations
  if (stats.totalCaches > 1000) {
    recommendations.push("Consider implementing cache rotation to manage storage");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Ranking system is healthy and well-maintained");
  }
  
  return recommendations;
}

/**
 * Manual trigger for system-wide ranking updates
 */
export const triggerSystemRankingUpdate = mutation({
  args: {
    includeAspects: v.optional(v.boolean()),
    forceRecalculate: v.optional(v.boolean()),
    cleanupFirst: v.optional(v.boolean()),
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

    // Optionally cleanup expired caches first
    if (args.cleanupFirst) {
      await ctx.scheduler.runAfter(0, internal.cleanupExpiredCaches, {});
    }

    // Schedule the main ranking processing
    await ctx.scheduler.runAfter(args.cleanupFirst ? 5000 : 0, internal.processAllRankings, {
      forceRecalculate: args.forceRecalculate || false,
      includeAspects: args.includeAspects || false,
      batchSize: 5,
    });

    // Schedule badge updates after rankings complete (with delay)
    await ctx.scheduler.runAfter(30000, internal.updateAllBadges, {
      batchSize: 10,
    });

    return {
      status: "system_update_scheduled",
      includeAspects: args.includeAspects || false,
      forceRecalculate: args.forceRecalculate || false,
      cleanupFirst: args.cleanupFirst || false,
      estimatedDuration: "30-60 minutes",
      message: "System-wide ranking update has been scheduled"
    };
  },
});

/**
 * Get ranking update progress (for admin monitoring)
 */
export const getRankingUpdateProgress = query({
  args: {
    timeframe: v.optional(v.string()), // "1h", "24h", "7d"
  },
  handler: async (ctx, args) => {
    const timeframeDays = {
      "1h": 1/24,
      "24h": 1,
      "7d": 7,
    }[args.timeframe || "24h"] || 1;

    const cutoff = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);

    // Get recent ranking caches
    const recentCaches = await ctx.db
      .query("rankingCache")
      .filter((q) => q.gt(q.field("lastUpdated"), cutoff))
      .collect();

    // Group by update time (hourly buckets for visualization)
    const hourlyUpdates: Record<string, number> = {};
    const hourlyAspects: Record<string, Record<string, number>> = {};

    for (const cache of recentCaches) {
      const hour = new Date(cache.lastUpdated).toISOString().substring(0, 13); // YYYY-MM-DDTHH
      hourlyUpdates[hour] = (hourlyUpdates[hour] || 0) + 1;
      
      if (!hourlyAspects[hour]) {
        hourlyAspects[hour] = {};
      }
      hourlyAspects[hour][cache.rankingType] = (hourlyAspects[hour][cache.rankingType] || 0) + 1;
    }

    // Calculate processing rate
    const totalHours = timeframeDays * 24;
    const avgUpdatesPerHour = recentCaches.length / totalHours;

    return {
      timeframe: args.timeframe || "24h",
      totalUpdates: recentCaches.length,
      avgUpdatesPerHour: Math.round(avgUpdatesPerHour * 10) / 10,
      hourlyBreakdown: Object.entries(hourlyUpdates)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([hour, count]) => ({
          hour,
          updates: count,
          aspects: hourlyAspects[hour] || {},
        })),
      rankingTypeDistribution: recentCaches.reduce((acc, cache) => {
        acc[cache.rankingType] = (acc[cache.rankingType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});