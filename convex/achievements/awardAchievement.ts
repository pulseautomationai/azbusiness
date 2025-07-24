import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

// Award an achievement to a business (internal)
export const awardAchievementToBusinessInternal = internalMutation({
  args: {
    businessId: v.id("businesses"),
    achievementType: v.string(),
    category: v.string(),
    tierLevel: v.string(),
    tierRequirement: v.string(),
    displayName: v.string(),
    description: v.string(),
    badgeIcon: v.string(),
    qualifyingData: v.any(),
    scoreRequirements: v.any(),
    displayPriority: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if achievement already exists (defensive coding)
    const existingAchievement = await ctx.db
      .query("achievements")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) =>
        q.and(
          q.eq(q.field("achievementType"), args.achievementType),
          q.eq(q.field("tierLevel"), args.tierLevel)
        )
      )
      .first();

    if (existingAchievement) {
      console.log(
        `Achievement ${args.achievementType} (${args.tierLevel}) already exists for business ${args.businessId}`
      );
      return existingAchievement._id;
    }

    // Award the achievement
    const achievementId = await ctx.db.insert("achievements", {
      businessId: args.businessId,
      achievementType: args.achievementType,
      category: args.category,
      tierLevel: args.tierLevel as "bronze" | "silver" | "gold" | "platinum" | "diamond",
      tierRequirement: args.tierRequirement as "free" | "starter" | "pro" | "power",
      displayName: args.displayName,
      description: args.description,
      badgeIcon: args.badgeIcon,
      qualifyingTags: args.qualifyingData,
      scoreRequirements: args.scoreRequirements,
      displayPriority: args.displayPriority,
      publicDisplay: true,
      achievementStatus: "active",
      earnedDate: Date.now(),
      notificationSent: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update achievement progress to mark as completed
    const progress = await ctx.db
      .query("achievementProgress")
      .withIndex("by_business_achievement", (q) =>
        q.eq("businessId", args.businessId).eq("achievementType", args.achievementType)
      )
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        currentProgress: 100,
        updatedAt: Date.now(),
      });
    }

    // Trigger notification (to be implemented)
    await ctx.scheduler.runAfter(
      0,
      internal.achievements.notifications.notifyAchievementEarned,
      {
        businessId: args.businessId,
        achievementId,
        achievementType: args.achievementType,
        tierLevel: args.tierLevel,
        displayName: args.displayName,
      }
    );

    console.log(
      `Awarded ${args.displayName} (${args.tierLevel}) to business ${args.businessId}`
    );

    return achievementId;
  },
});

// Public mutation to manually award achievements (admin use)
export const awardAchievementManual = mutation({
  args: {
    businessId: v.id("businesses"),
    achievementType: v.string(),
    tierLevel: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    achievementId: Id<"achievements">;
    message: string;
  }> => {
    // Get user and check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Import achievement definitions
    const { getAchievementDefinition } = await import("./achievementDefinitions");
    
    const achievementDef = getAchievementDefinition(args.achievementType);
    if (!achievementDef) {
      throw new Error(`Achievement type ${args.achievementType} not found`);
    }

    const tierDef = achievementDef.tiers[args.tierLevel as keyof typeof achievementDef.tiers];
    if (!tierDef) {
      throw new Error(`Tier ${args.tierLevel} not found for achievement ${args.achievementType}`);
    }

    // Award the achievement
    const achievementId = await ctx.runMutation(
      internal.achievements.awardAchievement.awardAchievementToBusinessInternal,
      {
        businessId: args.businessId,
        achievementType: args.achievementType,
        category: achievementDef.category,
        tierLevel: args.tierLevel,
        tierRequirement: tierDef.tierAccess,
        displayName: tierDef.displayText,
        description: achievementDef.description,
        badgeIcon: tierDef.badgeIcon,
        qualifyingData: { manual: true, awardedBy: user._id },
        scoreRequirements: tierDef.requirements,
        displayPriority: tierDef.displayPriority,
      }
    );

    return {
      success: true,
      achievementId,
      message: `Successfully awarded ${tierDef.displayText} to business`,
    };
  },
});

// Revoke an achievement (admin use)
export const revokeAchievement = mutation({
  args: {
    achievementId: v.id("achievements"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user and check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get the achievement
    const achievement = await ctx.db.get(args.achievementId);
    if (!achievement) {
      throw new Error("Achievement not found");
    }

    // Mark as inactive rather than deleting
    await ctx.db.patch(args.achievementId, {
      achievementStatus: "revoked" as const,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Achievement revoked successfully",
    };
  },
});

// Get all achievements for a business
export const getBusinessAchievements = mutation({
  args: {
    businessId: v.id("businesses"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("achievements")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("achievementStatus"), "active"));
    }

    const achievements = await query.collect();

    // Sort by display priority and earned date
    achievements.sort((a, b) => {
      if (a.displayPriority !== b.displayPriority) {
        return b.displayPriority - a.displayPriority; // Higher priority first
      }
      return b.earnedDate - a.earnedDate; // Newer first
    });

    return achievements;
  },
});

// Get achievement statistics for admin dashboard
export const getAchievementStatistics = mutation({
  args: {},
  handler: async (ctx) => {
    // Get user and check admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all achievements
    const allAchievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("achievementStatus"), "active"))
      .collect();

    // Calculate statistics
    const stats = {
      totalAchievements: allAchievements.length,
      byTier: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        diamond: 0,
      },
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      recentlyAwarded: [] as any[],
      mostCommon: [] as any[],
    };

    // Count by tier
    for (const achievement of allAchievements) {
      stats.byTier[achievement.tierLevel]++;
      
      // Count by category
      if (!stats.byCategory[achievement.category]) {
        stats.byCategory[achievement.category] = 0;
      }
      stats.byCategory[achievement.category]++;
      
      // Count by type
      if (!stats.byType[achievement.achievementType]) {
        stats.byType[achievement.achievementType] = 0;
      }
      stats.byType[achievement.achievementType]++;
    }

    // Get recently awarded (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    stats.recentlyAwarded = allAchievements
      .filter((a) => a.earnedDate > thirtyDaysAgo)
      .sort((a, b) => b.earnedDate - a.earnedDate)
      .slice(0, 10);

    // Get most common achievement types
    const typeCountArray = Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    stats.mostCommon = typeCountArray.map(([type, count]) => ({ type, count }));

    return stats;
  },
});