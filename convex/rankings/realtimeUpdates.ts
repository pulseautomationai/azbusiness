import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

// Real-time subscription for business ranking changes
export const subscribeToBusinessRanking = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const ranking = await ctx.db
      .query("businessRankings")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    return ranking;
  },
});

// Real-time subscription for category rankings
export const subscribeToCategoryRankings = query({
  args: {
    category: v.string(),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("businessRankings")
      .filter((q) => q.eq(q.field("category"), args.category));
    
    if (args.city) {
      query = query.filter((q) => q.eq(q.field("city"), args.city));
    }
    
    const rankings = await query.collect();
    
    // Sort by ranking position
    rankings.sort((a, b) => a.rankingPosition - b.rankingPosition);
    
    const limit = args.limit || 10;
    return rankings.slice(0, limit);
  },
});

// Real-time subscription for achievement updates
export const subscribeToBusinessAchievements = query({
  args: {
    businessId: v.id("businesses"),
    includeProgress: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get active achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("achievementStatus"), "active"))
      .collect();
    
    // Sort by priority and date
    achievements.sort((a, b) => {
      if (a.displayPriority !== b.displayPriority) {
        return b.displayPriority - a.displayPriority;
      }
      return b.earnedDate - a.earnedDate;
    });
    
    if (!args.includeProgress) {
      return { achievements, progress: [] };
    }
    
    // Get achievement progress
    const progress = await ctx.db
      .query("achievementProgress")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();
    
    // Sort progress by percentage complete (highest first)
    progress.sort((a, b) => b.currentProgress - a.currentProgress);
    
    return { achievements, progress };
  },
});

// Trigger real-time ranking update when reviews are added
export const triggerRankingUpdateOnReview = mutation({
  args: {
    businessId: v.id("businesses"),
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    // Schedule AI analysis of the review
    await ctx.scheduler.runAfter(0, "ai/analyzeReview:analyzeReviewWithAI" as any, {
      reviewId: args.reviewId,
      businessId: args.businessId,
      reviewText: "", // Will be fetched in the action
      rating: 0, // Will be fetched in the action
    });
    
    // Schedule ranking recalculation after a delay to allow AI analysis
    await ctx.scheduler.runAfter(5000, internal.rankings.calculateRankings.calculateBusinessRanking, {
      businessId: args.businessId,
    });
    
    // Schedule achievement detection after ranking update
    await ctx.scheduler.runAfter(10000, internal.achievements.detectAchievements.detectBusinessAchievements, {
      businessId: args.businessId,
    });
    
    return { 
      success: true, 
      message: "Ranking update scheduled",
      estimatedCompletionTime: Date.now() + 15000, // 15 seconds
    };
  },
});

// Get ranking movement for a business
export const getRankingMovement = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const ranking = await ctx.db
      .query("businessRankings")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    if (!ranking) {
      return null;
    }
    
    const movement = ranking.previousPosition 
      ? ranking.previousPosition - ranking.rankingPosition 
      : 0;
    
    return {
      currentPosition: ranking.rankingPosition,
      previousPosition: ranking.previousPosition,
      movement,
      direction: movement > 0 ? "up" : movement < 0 ? "down" : "stable",
      percentageChange: ranking.previousPosition 
        ? Math.round((Math.abs(movement) / ranking.previousPosition) * 100) 
        : 0,
    };
  },
});

// Get top movers in a category
export const getTopMovers = query({
  args: {
    category: v.optional(v.string()),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("businessRankings")
      .filter((q) => q.neq(q.field("previousPosition"), null));
    
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    
    if (args.city) {
      query = query.filter((q) => q.eq(q.field("city"), args.city));
    }
    
    const rankings = await query.collect();
    
    // Calculate movement and sort by absolute movement
    const movers = rankings
      .map(ranking => ({
        ...ranking,
        movement: ranking.previousPosition! - ranking.rankingPosition,
        absoluteMovement: Math.abs(ranking.previousPosition! - ranking.rankingPosition),
      }))
      .filter(ranking => ranking.absoluteMovement > 0)
      .sort((a, b) => b.absoluteMovement - a.absoluteMovement);
    
    const limit = args.limit || 10;
    return movers.slice(0, limit);
  },
});

// Batch update rankings for improved performance
export const batchUpdateRankings = internalMutation({
  args: {
    updates: v.array(v.object({
      businessId: v.id("businesses"),
      rankingPosition: v.number(),
      previousPosition: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const updatePromises = args.updates.map(async (update) => {
      const ranking = await ctx.db
        .query("businessRankings")
        .withIndex("by_business", (q) => q.eq("businessId", update.businessId))
        .first();
      
      if (ranking) {
        await ctx.db.patch(ranking._id, {
          rankingPosition: update.rankingPosition,
          previousPosition: update.previousPosition ?? ranking.rankingPosition,
          updatedAt: Date.now(),
        });
      }
    });
    
    await Promise.all(updatePromises);
    
    return { 
      success: true, 
      updatedCount: args.updates.length,
    };
  },
});

// Get recent achievement activity
export const getRecentAchievementActivity = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    let query = ctx.db
      .query("achievements")
      .filter((q) => 
        q.and(
          q.eq(q.field("achievementStatus"), "active"),
          q.gte(q.field("earnedDate"), oneDayAgo)
        )
      );
    
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    
    const recentAchievements = await query.collect();
    
    // Sort by earned date (newest first)
    recentAchievements.sort((a, b) => b.earnedDate - a.earnedDate);
    
    const limit = args.limit || 20;
    const limitedAchievements = recentAchievements.slice(0, limit);
    
    // Get business details for each achievement
    const achievementsWithBusiness = await Promise.all(
      limitedAchievements.map(async (achievement) => {
        const business = await ctx.db.get(achievement.businessId);
        return {
          ...achievement,
          businessName: business?.name || "Unknown Business",
          businessSlug: business?.slug,
        };
      })
    );
    
    return achievementsWithBusiness;
  },
});