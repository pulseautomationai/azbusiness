import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// Notify business owner when they earn an achievement
export const notifyAchievementEarned = internalAction({
  args: {
    businessId: v.id("businesses"),
    achievementId: v.id("achievements"),
    achievementType: v.string(),
    tierLevel: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement notification system
    // This will be implemented in Phase 2 when we build the dashboard
    // For now, just log the achievement
    
    console.log(`[NOTIFICATION] Achievement earned:`, {
      businessId: args.businessId,
      achievement: args.displayName,
      tier: args.tierLevel,
      type: args.achievementType,
    });

    // In the future, this will:
    // 1. Send email notification (if enabled)
    // 2. Create in-app notification
    // 3. Update dashboard alerts
    // 4. Potentially trigger celebration UI elements
    
    return { success: true };
  },
});

// Notify when achievement progress reaches milestone
export const notifyAchievementProgress = internalAction({
  args: {
    businessId: v.id("businesses"),
    achievementType: v.string(),
    currentProgress: v.number(),
    milestone: v.number(), // 25, 50, 75, 90
  },
  handler: async (ctx, args) => {
    // TODO: Implement progress notification
    console.log(`[NOTIFICATION] Achievement progress milestone:`, {
      businessId: args.businessId,
      achievementType: args.achievementType,
      progress: `${args.currentProgress}%`,
      milestone: `${args.milestone}%`,
    });

    return { success: true };
  },
});

// Notify about tier upgrade opportunities
export const notifyTierUpgradeOpportunity = internalAction({
  args: {
    businessId: v.id("businesses"),
    currentTier: v.string(),
    potentialAchievements: v.array(v.object({
      achievementType: v.string(),
      tierLevel: v.string(),
      displayName: v.string(),
      progress: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // TODO: Implement upgrade opportunity notification
    console.log(`[NOTIFICATION] Tier upgrade opportunity:`, {
      businessId: args.businessId,
      currentTier: args.currentTier,
      achievementsAvailable: args.potentialAchievements.length,
    });

    return { success: true };
  },
});