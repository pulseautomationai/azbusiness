import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Efficient hooks for updating platform stats
 * These use direct database operations to avoid nested mutations
 */

// Helper to update platform stats efficiently
async function updatePlatformStats(
  ctx: any,
  updates: {
    businessDelta?: number;
    claimedDelta?: number;
    verifiedDelta?: number;
    reviewDelta?: number;
    verifiedReviewDelta?: number;
    planChanges?: { from: string; to: string };
  }
) {
  const stats = await ctx.db.query("platformStats").first();
  if (!stats) return;

  const newStats: any = {
    lastUpdated: Date.now(),
  };

  if (updates.businessDelta !== undefined) {
    newStats.totalBusinesses = Math.max(0, stats.totalBusinesses + updates.businessDelta);
  }

  if (updates.claimedDelta !== undefined) {
    newStats.claimedBusinesses = Math.max(0, stats.claimedBusinesses + updates.claimedDelta);
  }

  if (updates.verifiedDelta !== undefined) {
    newStats.verifiedBusinesses = Math.max(0, stats.verifiedBusinesses + updates.verifiedDelta);
  }

  if (updates.reviewDelta !== undefined) {
    newStats.totalReviews = Math.max(0, stats.totalReviews + updates.reviewDelta);
  }

  if (updates.verifiedReviewDelta !== undefined) {
    newStats.verifiedReviews = Math.max(0, stats.verifiedReviews + updates.verifiedReviewDelta);
  }

  if (updates.planChanges) {
    const planCounts = { ...stats.planCounts };
    const fromPlan = updates.planChanges.from || 'free';
    const toPlan = updates.planChanges.to;
    
    planCounts[fromPlan] = Math.max(0, (planCounts[fromPlan] || 0) - 1);
    planCounts[toPlan] = (planCounts[toPlan] || 0) + 1;
    
    newStats.planCounts = planCounts;
  }

  await ctx.db.patch(stats._id, newStats);
}

// Create business with stats update
export const createBusinessWithStats = internalMutation({
  args: {
    businessData: v.any(),
  },
  handler: async (ctx, args) => {
    // Insert the business
    const businessId = await ctx.db.insert("businesses", args.businessData);
    
    // Update stats efficiently
    await updatePlatformStats(ctx, {
      businessDelta: 1,
      claimedDelta: args.businessData.claimed ? 1 : 0,
      verifiedDelta: args.businessData.verified ? 1 : 0,
      planChanges: { from: '', to: args.businessData.planTier || 'free' }
    });
    
    return businessId;
  },
});

// Batch create businesses with single stats update
export const batchCreateBusinessesWithStats = internalMutation({
  args: {
    businesses: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const businessIds = [];
    let claimedCount = 0;
    let verifiedCount = 0;
    const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, power: 0 };
    
    // Insert all businesses
    for (const business of args.businesses) {
      const id = await ctx.db.insert("businesses", business);
      businessIds.push(id);
      
      if (business.claimed) claimedCount++;
      if (business.verified) verifiedCount++;
      planCounts[business.planTier || 'free']++;
    }
    
    // Single stats update for all businesses
    const stats = await ctx.db.query("platformStats").first();
    if (stats) {
      const newPlanCounts = { ...stats.planCounts };
      Object.entries(planCounts).forEach(([tier, count]) => {
        (newPlanCounts as any)[tier] = ((newPlanCounts as any)[tier] || 0) + count;
      });
      
      await ctx.db.patch(stats._id, {
        totalBusinesses: stats.totalBusinesses + args.businesses.length,
        claimedBusinesses: stats.claimedBusinesses + claimedCount,
        verifiedBusinesses: stats.verifiedBusinesses + verifiedCount,
        planCounts: newPlanCounts,
        lastUpdated: Date.now(),
      });
    }
    
    return businessIds;
  },
});

// Update business claim status
export const updateBusinessClaimWithStats = internalMutation({
  args: {
    businessId: v.id("businesses"),
    claimed: v.boolean(),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) throw new Error("Business not found");
    
    // Update the business
    await ctx.db.patch(args.businessId, {
      claimedByUserId: args.claimed ? args.ownerId : undefined,
      ownerId: args.ownerId,
      claimedAt: args.claimed ? Date.now() : undefined,
    });
    
    // Update stats if claim status changed
    const wasClaimed = !!business.claimedByUserId;
    if (args.claimed !== wasClaimed) {
      await updatePlatformStats(ctx, {
        claimedDelta: args.claimed ? 1 : -1,
      });
    }
  },
});

// Batch create reviews with single stats update
export const batchCreateReviewsWithStats = internalMutation({
  args: {
    reviews: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const reviewIds = [];
    let verifiedCount = 0;
    
    // Insert all reviews
    for (const review of args.reviews) {
      const id = await ctx.db.insert("reviews", review);
      reviewIds.push(id);
      if (review.verified) verifiedCount++;
    }
    
    // Single stats update
    await updatePlatformStats(ctx, {
      reviewDelta: args.reviews.length,
      verifiedReviewDelta: verifiedCount,
    });
    
    return reviewIds;
  },
});