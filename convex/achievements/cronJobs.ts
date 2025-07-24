import { v } from "convex/values";
import { internalAction, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

// Hourly check for achievements on recently reviewed businesses
export const hourlyAchievementCheck = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[CRON] Starting hourly achievement check...");
    
    try {
      // Get businesses with recent AI analysis (last hour)
      const businessesToCheck = await ctx.runQuery(
        internal.achievements.cronJobs.getBusinessesForAchievementCheck
      );
      
      console.log(`[CRON] Checking achievements for ${businessesToCheck.length} businesses`);
      
      let totalAchievementsAwarded = 0;
      let businessesProcessed = 0;
      
      for (const business of businessesToCheck) {
        try {
          const newAchievements = await ctx.runMutation(
            internal.achievements.detectAchievements.detectBusinessAchievements,
            { businessId: business._id }
          );
          
          totalAchievementsAwarded += newAchievements.length;
          businessesProcessed++;
          
          if (newAchievements.length > 0) {
            console.log(`[CRON] Awarded ${newAchievements.length} achievements to business ${business.name}`);
          }
        } catch (error) {
          console.error(`[CRON] Error checking achievements for business ${business._id}:`, error);
        }
      }
      
      console.log(`[CRON] Hourly achievement check completed. Businesses: ${businessesProcessed}, New achievements: ${totalAchievementsAwarded}`);
      
      return {
        success: true,
        businessesProcessed,
        achievementsAwarded: totalAchievementsAwarded,
      };
    } catch (error) {
      console.error("[CRON] Fatal error in hourly achievement check:", error);
      throw error;
    }
  },
});

// Get businesses that need achievement checking
export const getBusinessesForAchievementCheck = internalQuery({
  args: {},
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    // Get recent AI analyses
    const recentAnalyses = await ctx.db
      .query("aiAnalysisTags")
      .filter((q) => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();
    
    // Get unique business IDs
    const businessIds = new Set(recentAnalyses.map(a => a.businessId));
    
    // Convert to business documents and filter by plan tier
    const businesses = [];
    for (const businessId of Array.from(businessIds)) {
      const business = await ctx.db.get(businessId);
      // Only check active businesses with a plan (not just free tier)
      if (business && business.active && business.planTier !== "free") {
        businesses.push(business);
      }
    }
    
    return businesses;
  },
});

// Weekly comprehensive achievement audit
export const weeklyAchievementAudit = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("[CRON] Starting weekly achievement audit...");
    
    try {
      // Get all active businesses with plans
      const businessesToAudit = await ctx.runQuery(
        internal.achievements.cronJobs.getBusinessesForWeeklyAudit
      );
      
      console.log(`[CRON] Auditing achievements for ${businessesToAudit.length} businesses`);
      
      let totalAchievementsAwarded = 0;
      let totalProgressUpdated = 0;
      let businessesProcessed = 0;
      
      // Process in batches to avoid timeouts
      const batchSize = 50;
      for (let i = 0; i < businessesToAudit.length; i += batchSize) {
        const batch = businessesToAudit.slice(i, i + batchSize);
        
        for (const business of batch) {
          try {
            // Detect new achievements
            const newAchievements = await ctx.runMutation(
              internal.achievements.detectAchievements.detectBusinessAchievements,
              { businessId: business._id }
            );
            
            totalAchievementsAwarded += newAchievements.length;
            
            // Progress is updated automatically in detectBusinessAchievements
            const progressRecords = await ctx.runQuery(
              internal.achievements.cronJobs.getBusinessAchievementProgress,
              { businessId: business._id }
            );
            
            totalProgressUpdated += progressRecords.length;
            businessesProcessed++;
            
          } catch (error) {
            console.error(`[CRON] Error auditing achievements for business ${business._id}:`, error);
          }
        }
        
        console.log(`[CRON] Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businessesToAudit.length / batchSize)}`);
      }
      
      // Generate audit summary
      const auditSummary: any = await ctx.runQuery(
        internal.achievements.cronJobs.generateAuditSummary
      );
      
      console.log("[CRON] Weekly achievement audit completed:", {
        businessesProcessed,
        newAchievements: totalAchievementsAwarded,
        progressUpdated: totalProgressUpdated,
        ...auditSummary,
      });
      
      return {
        success: true,
        businessesProcessed,
        achievementsAwarded: totalAchievementsAwarded,
        progressRecordsUpdated: totalProgressUpdated,
        summary: auditSummary,
      };
    } catch (error) {
      console.error("[CRON] Fatal error in weekly achievement audit:", error);
      throw error;
    }
  },
});

// Get businesses for weekly audit
export const getBusinessesForWeeklyAudit = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all active businesses with paid plans
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => 
        q.and(
          q.eq(q.field("active"), true),
          q.neq(q.field("planTier"), "free")
        )
      )
      .collect();
    
    // Filter to only businesses with at least some reviews
    const businessesWithReviews = [];
    for (const business of businesses) {
      const reviewCount = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .take(1)
        .then(reviews => reviews.length);
      
      if (reviewCount > 0) {
        businessesWithReviews.push(business);
      }
    }
    
    return businessesWithReviews;
  },
});

// Get achievement progress for a business (internal query for cron jobs)
export const getBusinessAchievementProgress = internalQuery({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("achievementProgress")
      .withIndex("by_business_achievement", (q) => q.eq("businessId", args.businessId))
      .collect();
  },
});

// Get achievement progress for a business (public query for dashboard)
export const getBusinessAchievementProgressPublic = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("achievementProgress")
      .withIndex("by_business_achievement", (q) => q.eq("businessId", args.businessId))
      .collect();
  },
});

// Generate audit summary
export const generateAuditSummary = internalQuery({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Total achievements by tier
    const allAchievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("achievementStatus"), "active"))
      .collect();
    
    const achievementsByTier = {
      bronze: allAchievements.filter(a => a.tierLevel === "bronze").length,
      silver: allAchievements.filter(a => a.tierLevel === "silver").length,
      gold: allAchievements.filter(a => a.tierLevel === "gold").length,
      platinum: allAchievements.filter(a => a.tierLevel === "platinum").length,
      diamond: allAchievements.filter(a => a.tierLevel === "diamond").length,
    };
    
    // New achievements this week
    const newThisWeek = allAchievements.filter(a => a.earnedDate >= oneWeekAgo).length;
    
    // Businesses with achievements
    const uniqueBusinessIds = new Set(allAchievements.map(a => a.businessId));
    const businessesWithAchievements = uniqueBusinessIds.size;
    
    // Average achievements per business
    const avgAchievementsPerBusiness = allAchievements.length / Math.max(1, businessesWithAchievements);
    
    // Most common achievement types
    const achievementTypeCounts = new Map<string, number>();
    for (const achievement of allAchievements) {
      const count = achievementTypeCounts.get(achievement.achievementType) || 0;
      achievementTypeCounts.set(achievement.achievementType, count + 1);
    }
    
    const mostCommonTypes = Array.from(achievementTypeCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
    
    return {
      totalAchievements: allAchievements.length,
      achievementsByTier,
      newThisWeek,
      businessesWithAchievements,
      avgAchievementsPerBusiness: Math.round(avgAchievementsPerBusiness * 10) / 10,
      mostCommonTypes,
    };
  },
});