import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Platform statistics tracking
 * Maintains counters for efficient querying of large datasets
 */

// Initialize or get platform stats
export const getOrCreateStats = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("platformStats").first();
    if (stats) {
      return stats;
    }
    
    // Return default stats if none exist
    return {
      totalBusinesses: 0,
      claimedBusinesses: 0,
      verifiedBusinesses: 0,
      totalReviews: 0,
      verifiedReviews: 0,
      totalUsers: 0,
      activeSubscriptions: 0,
      planCounts: {
        free: 0,
        starter: 0,
        pro: 0,
        power: 0,
      },
      lastUpdated: Date.now(),
    };
  },
});

// Increment business count
export const incrementBusinessCount = mutation({
  args: {
    isClaimed: v.boolean(),
    isVerified: v.boolean(),
    planTier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db.query("platformStats").first();
    
    if (stats) {
      await ctx.db.patch(stats._id, {
        totalBusinesses: stats.totalBusinesses + 1,
        claimedBusinesses: args.isClaimed ? stats.claimedBusinesses + 1 : stats.claimedBusinesses,
        verifiedBusinesses: args.isVerified ? stats.verifiedBusinesses + 1 : stats.verifiedBusinesses,
        planCounts: {
          ...stats.planCounts,
          [args.planTier || 'free']: ((stats.planCounts as any)[args.planTier || 'free'] || 0) + 1,
        },
        lastUpdated: Date.now(),
      });
    } else {
      // Create initial stats
      await ctx.db.insert("platformStats", {
        totalBusinesses: 1,
        claimedBusinesses: args.isClaimed ? 1 : 0,
        verifiedBusinesses: args.isVerified ? 1 : 0,
        totalReviews: 0,
        verifiedReviews: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        planCounts: {
          free: args.planTier === 'free' || !args.planTier ? 1 : 0,
          starter: args.planTier === 'starter' ? 1 : 0,
          pro: args.planTier === 'pro' ? 1 : 0,
          power: args.planTier === 'power' ? 1 : 0,
        },
        lastUpdated: Date.now(),
      });
    }
  },
});

// Increment review count
export const incrementReviewCount = mutation({
  args: {
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db.query("platformStats").first();
    
    if (stats) {
      await ctx.db.patch(stats._id, {
        totalReviews: stats.totalReviews + 1,
        verifiedReviews: args.isVerified ? stats.verifiedReviews + 1 : stats.verifiedReviews,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Update business plan tier
export const updateBusinessPlanTier = mutation({
  args: {
    oldTier: v.optional(v.string()),
    newTier: v.string(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db.query("platformStats").first();
    
    if (stats) {
      const planCounts = { ...stats.planCounts };
      
      // Decrement old tier
      if (args.oldTier) {
        (planCounts as any)[args.oldTier] = Math.max(0, ((planCounts as any)[args.oldTier] || 0) - 1);
      } else {
        planCounts.free = Math.max(0, (planCounts.free || 0) - 1);
      }
      
      // Increment new tier
      (planCounts as any)[args.newTier] = ((planCounts as any)[args.newTier] || 0) + 1;
      
      await ctx.db.patch(stats._id, {
        planCounts,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Rebuild stats from scratch (admin function)
export const rebuildStats = mutation({
  handler: async (ctx) => {
    // Delete existing stats
    const existingStats = await ctx.db.query("platformStats").first();
    if (existingStats) {
      await ctx.db.delete(existingStats._id);
    }
    
    // Count businesses
    let totalBusinesses = 0;
    let claimedBusinesses = 0;
    let verifiedBusinesses = 0;
    const planCounts = {
      free: 0,
      starter: 0,
      pro: 0,
      power: 0,
    };
    
    // Process businesses in batches to handle large datasets
    let lastId: any = null;
    const batchSize = 1000;
    
    while (true) {
      let query = ctx.db.query("businesses");
      if (lastId) {
        // Continue from last processed business
        query = query.filter((q) => q.gt(q.field("_id"), lastId));
      }
      
      const businessBatch = await query.take(batchSize);
      
      if (businessBatch.length === 0) break;
      
      businessBatch.forEach(business => {
        totalBusinesses++;
        if (business.claimedAt) claimedBusinesses++;
        if (business.verified) verifiedBusinesses++;
        const tier = business.planTier || 'free';
        if (tier === 'free' || tier === 'starter' || tier === 'pro' || tier === 'power') {
          planCounts[tier] = (planCounts[tier] || 0) + 1;
        }
        lastId = business._id;
      });
      
      // Break if we got less than a full batch
      if (businessBatch.length < batchSize) break;
    }
    
    // Count reviews in batches
    let totalReviews = 0;
    let verifiedReviews = 0;
    lastId = null;
    
    while (true) {
      let query = ctx.db.query("reviews");
      if (lastId) {
        query = query.filter((q) => q.gt(q.field("_id"), lastId));
      }
      
      const reviewBatch = await query.take(batchSize);
      
      if (reviewBatch.length === 0) break;
      
      reviewBatch.forEach(review => {
        totalReviews++;
        if (review.verified) verifiedReviews++;
        lastId = review._id;
      });
      
      // Break if we got less than a full batch
      if (reviewBatch.length < batchSize) break;
    }
    
    // Count users
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;
    
    // Count active subscriptions
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === "active" || sub.status === "trialing"
    ).length;
    
    // Create new stats
    await ctx.db.insert("platformStats", {
      totalBusinesses,
      claimedBusinesses,
      verifiedBusinesses,
      totalReviews,
      verifiedReviews,
      totalUsers,
      activeSubscriptions,
      planCounts,
      lastUpdated: Date.now(),
    });
    
    return {
      success: true,
      stats: {
        totalBusinesses,
        claimedBusinesses,
        verifiedBusinesses,
        totalReviews,
        totalUsers,
        activeSubscriptions,
      }
    };
  },
});

// Lightweight stats sync - counts only what's changed recently
export const lightweightStatsSync = mutation({
  handler: async (ctx) => {
    const stats = await ctx.db.query("platformStats").first();
    if (!stats) {
      // Initialize if missing
      await ctx.db.insert("platformStats", {
        totalBusinesses: 0,
        claimedBusinesses: 0,
        verifiedBusinesses: 0,
        totalReviews: 0,
        verifiedReviews: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        planCounts: { free: 0, starter: 0, pro: 0, power: 0 },
        lastUpdated: Date.now(),
      });
      return { success: true, message: "Stats initialized" };
    }
    
    // Get counts from last sync
    const lastSync = stats.lastUpdated;
    const now = Date.now();
    
    // Count new businesses since last sync
    const newBusinesses = await ctx.db
      .query("businesses")
      .filter((q) => q.gt(q.field("createdAt"), lastSync))
      .take(1000);
    
    // Count new reviews since last sync  
    const newReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.gt(q.field("createdAt"), lastSync))
      .take(1000);
    
    // Update incrementally
    if (newBusinesses.length > 0 || newReviews.length > 0) {
      const businessDelta = newBusinesses.length;
      const claimedDelta = newBusinesses.filter(b => b.claimedAt).length;
      const verifiedBusinessDelta = newBusinesses.filter(b => b.verified).length;
      const reviewDelta = newReviews.length;
      const verifiedReviewDelta = newReviews.filter(r => r.verified).length;
      
      await ctx.db.patch(stats._id, {
        totalBusinesses: stats.totalBusinesses + businessDelta,
        claimedBusinesses: stats.claimedBusinesses + claimedDelta,
        verifiedBusinesses: stats.verifiedBusinesses + verifiedBusinessDelta,
        totalReviews: stats.totalReviews + reviewDelta,
        verifiedReviews: stats.verifiedReviews + verifiedReviewDelta,
        lastUpdated: now,
      });
      
      return { 
        success: true, 
        message: `Updated: +${businessDelta} businesses, +${reviewDelta} reviews` 
      };
    }
    
    return { success: true, message: "No changes to sync" };
  },
});

// Update stats manually with accurate counts
export const updateStatsManually = mutation({
  args: {
    totalBusinesses: v.number(),
    totalReviews: v.number(),
    claimedBusinesses: v.number(),
    verifiedBusinesses: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete existing stats
    const existingStats = await ctx.db.query("platformStats").first();
    if (existingStats) {
      await ctx.db.delete(existingStats._id);
    }
    
    // Count users and subscriptions
    const users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === "active" || sub.status === "trialing"
    ).length;
    
    // Create new stats with provided counts
    await ctx.db.insert("platformStats", {
      totalBusinesses: args.totalBusinesses,
      claimedBusinesses: args.claimedBusinesses,
      verifiedBusinesses: args.verifiedBusinesses,
      totalReviews: args.totalReviews,
      verifiedReviews: Math.round(args.totalReviews * 0.12), // Estimate
      totalUsers: users.length,
      activeSubscriptions,
      planCounts: {
        free: args.totalBusinesses - args.claimedBusinesses - 2, // Subtract claimed and power businesses
        starter: 0,
        pro: 0,
        power: 2,
      },
      lastUpdated: Date.now(),
    });
    
    return {
      success: true,
      message: "Platform stats updated successfully"
    };
  },
});