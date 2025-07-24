import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

// Daily ranking update for all businesses with recent activity
export const dailyRankingUpdate = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[CRON] Starting daily ranking update...");
    
    try {
      // Get businesses that need ranking updates
      const businessesNeedingUpdate = await ctx.runQuery(
        internal.rankings.cronJobs.getBusinessesNeedingRankingUpdate
      );
      
      console.log(`[CRON] Found ${businessesNeedingUpdate.length} businesses needing ranking update`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Process each business
      for (const business of businessesNeedingUpdate) {
        try {
          // Calculate ranking
          await ctx.runMutation(
            internal.rankings.calculateRankings.calculateBusinessRanking,
            { businessId: business._id }
          );
          
          // Detect achievements
          await ctx.runMutation(
            internal.achievements.detectAchievements.detectBusinessAchievements,
            { businessId: business._id }
          );
          
          successCount++;
        } catch (error) {
          console.error(`[CRON] Error updating ranking for business ${business._id}:`, error);
          errorCount++;
        }
      }
      
      // Update ranking positions for all categories and cities
      const categoriesAndCities = await ctx.runQuery(
        internal.rankings.cronJobs.getUniqueCategoriesAndCities
      );
      
      for (const { category, city } of categoriesAndCities) {
        await ctx.runMutation(
          internal.rankings.calculateRankings.updateRankingPositions,
          { category, city }
        );
      }
      
      console.log(`[CRON] Daily ranking update completed. Success: ${successCount}, Errors: ${errorCount}`);
      
      return {
        success: true,
        businessesProcessed: successCount,
        errors: errorCount,
      };
    } catch (error) {
      console.error("[CRON] Fatal error in daily ranking update:", error);
      throw error;
    }
  },
});

// Get businesses that need ranking updates
export const getBusinessesNeedingRankingUpdate = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get businesses with recent reviews (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Get reviews from last 24 hours
    const recentReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();
    
    // Get unique business IDs
    const businessIds = new Set(recentReviews.map(r => r.businessId));
    
    // Also include businesses that have never been ranked
    const unrankedBusinesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .take(1000);
    
    for (const business of unrankedBusinesses) {
      const ranking = await ctx.db
        .query("businessRankings")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .first();
      
      if (!ranking) {
        businessIds.add(business._id);
      }
    }
    
    // Convert to business documents
    const businesses = [];
    for (const businessId of Array.from(businessIds)) {
      const business = await ctx.db.get(businessId);
      if (business && business.active) {
        businesses.push(business);
      }
    }
    
    return businesses;
  },
});

// Get unique categories and cities for ranking position updates
export const getUniqueCategoriesAndCities = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rankings = await ctx.db
      .query("businessRankings")
      .collect();
    
    const uniquePairs = new Map<string, { category: string; city: string }>();
    
    for (const ranking of rankings) {
      const key = `${ranking.category}-${ranking.city}`;
      if (!uniquePairs.has(key)) {
        uniquePairs.set(key, {
          category: ranking.category,
          city: ranking.city,
        });
      }
    }
    
    return Array.from(uniquePairs.values());
  },
});

// Weekly ranking report generation
export const weeklyRankingReport = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    report: any;
  }> => {
    console.log("[CRON] Starting weekly ranking report generation...");
    
    try {
      // Get top performers across all categories
      const topPerformers = await ctx.runQuery(
        internal.rankings.cronJobs.getTopPerformersForReport
      );
      
      // Get biggest movers (up and down)
      const biggestMovers = await ctx.runQuery(
        internal.rankings.cronJobs.getBiggestMoversForReport
      );
      
      // Get achievement statistics
      const achievementStats = await ctx.runQuery(
        internal.rankings.cronJobs.getAchievementStatsForReport
      );
      
      // Store report data (to be implemented with dashboard)
      const report = {
        weekEnding: Date.now(),
        topPerformers,
        biggestMovers,
        achievementStats,
        generatedAt: Date.now(),
      };
      
      console.log("[CRON] Weekly ranking report generated:", {
        topPerformersCount: topPerformers.length,
        moversCount: biggestMovers.length,
        newAchievements: achievementStats.newThisWeek,
      });
      
      // TODO: In Phase 2, store this report and send notifications
      
      return {
        success: true,
        report,
      };
    } catch (error) {
      console.error("[CRON] Error generating weekly ranking report:", error);
      throw error;
    }
  },
});

// Get top performers for weekly report
export const getTopPerformersForReport = internalQuery({
  args: {},
  handler: async (ctx) => {
    const topRankings = await ctx.db
      .query("businessRankings")
      .filter((q) => q.lte(q.field("rankingPosition"), 3))
      .collect();
    
    // Get business details
    const performers = [];
    for (const ranking of topRankings) {
      const business = await ctx.db.get(ranking.businessId);
      if (business) {
        performers.push({
          businessId: ranking.businessId,
          businessName: business.name,
          category: ranking.category,
          city: ranking.city,
          position: ranking.rankingPosition,
          score: ranking.overallScore,
        });
      }
    }
    
    // Sort by score
    performers.sort((a, b) => b.score - a.score);
    
    return performers.slice(0, 20); // Top 20
  },
});

// Get biggest movers for weekly report
export const getBiggestMoversForReport = internalQuery({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const rankings = await ctx.db
      .query("businessRankings")
      .filter((q) => 
        q.and(
          q.neq(q.field("previousPosition"), null),
          q.gte(q.field("updatedAt"), oneWeekAgo)
        )
      )
      .collect();
    
    const movers = [];
    
    for (const ranking of rankings) {
      if (ranking.previousPosition && ranking.previousPosition !== ranking.rankingPosition) {
        const movement = ranking.previousPosition - ranking.rankingPosition;
        const business = await ctx.db.get(ranking.businessId);
        
        if (business && Math.abs(movement) >= 3) { // Moved 3+ positions
          movers.push({
            businessId: ranking.businessId,
            businessName: business.name,
            category: ranking.category,
            city: ranking.city,
            previousPosition: ranking.previousPosition,
            currentPosition: ranking.rankingPosition,
            movement,
            score: ranking.overallScore,
          });
        }
      }
    }
    
    // Sort by absolute movement
    movers.sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement));
    
    return movers.slice(0, 10); // Top 10 movers
  },
});

// Get achievement statistics for weekly report
export const getAchievementStatsForReport = internalQuery({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Get all achievements
    const allAchievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("achievementStatus"), "active"))
      .collect();
    
    // Get new achievements this week
    const newThisWeek = allAchievements.filter(a => a.earnedDate >= oneWeekAgo);
    
    // Count by tier
    const byTier = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    };
    
    for (const achievement of newThisWeek) {
      byTier[achievement.tierLevel]++;
    }
    
    // Most earned achievement types
    const typeCount = new Map<string, number>();
    for (const achievement of newThisWeek) {
      const count = typeCount.get(achievement.achievementType) || 0;
      typeCount.set(achievement.achievementType, count + 1);
    }
    
    const mostEarned = Array.from(typeCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
    
    return {
      totalAchievements: allAchievements.length,
      newThisWeek: newThisWeek.length,
      byTier,
      mostEarned,
    };
  },
});