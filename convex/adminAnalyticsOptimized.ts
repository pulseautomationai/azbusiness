import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Optimized admin dashboard metrics that handles large datasets
 */
export const getAdminDashboardMetricsOptimized = query({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    // Get users and subscriptions (these are typically smaller datasets)
    const users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    
    // Count businesses without loading all data
    let totalBusinessesCount = 0;
    let claimedBusinessCount = 0;
    let verifiedBusinessCount = 0;
    const planCounts: Record<string, number> = {};
    
    // Process businesses in batches
    const batchSize = 100;
    let hasMore = true;
    let lastId: Id<"businesses"> | null = null;
    
    while (hasMore) {
      const query = ctx.db.query("businesses");
      if (lastId) {
        // Continue from last ID for pagination
        const batch = await query
          .filter((q) => q.gt(q.field("_id"), lastId))
          .order("asc")
          .take(batchSize);
        
        if (batch.length < batchSize) {
          hasMore = false;
        }
        
        if (batch.length > 0) {
          lastId = batch[batch.length - 1]._id;
          
          // Process batch
          totalBusinessesCount += batch.length;
          claimedBusinessCount += batch.filter(b => b.claimedAt).length;
          verifiedBusinessCount += batch.filter(b => b.verified).length;
          
          batch.forEach(business => {
            const tier = business.planTier || "free";
            planCounts[tier] = (planCounts[tier] || 0) + 1;
          });
        } else {
          hasMore = false;
        }
      } else {
        // First batch
        const batch = await query.order("asc").take(batchSize);
        
        if (batch.length < batchSize) {
          hasMore = false;
        }
        
        if (batch.length > 0) {
          lastId = batch[batch.length - 1]._id;
          
          // Process batch
          totalBusinessesCount += batch.length;
          claimedBusinessCount += batch.filter(b => b.claimedAt).length;
          verifiedBusinessCount += batch.filter(b => b.verified).length;
          
          batch.forEach(business => {
            const tier = business.planTier || "free";
            planCounts[tier] = (planCounts[tier] || 0) + 1;
          });
        } else {
          hasMore = false;
        }
      }
    }
    
    // Count reviews efficiently
    let totalReviewsCount = 0;
    let verifiedReviewsCount = 0;
    let recentReviewsCount = 0;
    
    // Sample reviews for statistics
    const reviewSample = await ctx.db
      .query("reviews")
      .order("desc")
      .take(100);
    
    // Process review counts in batches
    hasMore = true;
    let reviewLastId: Id<"reviews"> | null = null;
    
    while (hasMore) {
      const query = ctx.db.query("reviews");
      if (reviewLastId) {
        const batch = await query
          .filter((q) => q.gt(q.field("_id"), reviewLastId))
          .order("asc")
          .take(batchSize);
        
        if (batch.length < batchSize) {
          hasMore = false;
        }
        
        if (batch.length > 0) {
          reviewLastId = batch[batch.length - 1]._id;
          totalReviewsCount += batch.length;
          verifiedReviewsCount += batch.filter(r => r.verified).length;
          recentReviewsCount += batch.filter(r => r._creationTime > thirtyDaysAgo).length;
        } else {
          hasMore = false;
        }
      } else {
        const batch = await query.order("asc").take(batchSize);
        
        if (batch.length < batchSize) {
          hasMore = false;
        }
        
        if (batch.length > 0) {
          reviewLastId = batch[batch.length - 1]._id;
          totalReviewsCount += batch.length;
          verifiedReviewsCount += batch.filter(r => r.verified).length;
          recentReviewsCount += batch.filter(r => r._creationTime > thirtyDaysAgo).length;
        } else {
          hasMore = false;
        }
      }
    }

    // Calculate subscription revenue
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === "active" || sub.status === "trialing"
    );
    
    // Calculate monthly recurring revenue (MRR)
    const totalMRR = activeSubscriptions.reduce((total, sub) => {
      if (sub.amount && sub.interval === "month") {
        return total + (sub.amount / 100); // Convert from cents to dollars
      }
      if (sub.amount && sub.interval === "year") {
        return total + (sub.amount / 100 / 12); // Convert annual to monthly
      }
      return total;
    }, 0);

    // Get new users in the last 30 days
    const recentUsers = users.filter(user => 
      user.createdAt && user.createdAt > thirtyDaysAgo
    );

    // Get new users in the previous 30 days (for comparison)
    const previousPeriodUsers = users.filter(user => 
      user.createdAt && 
      user.createdAt > sixtyDaysAgo && 
      user.createdAt <= thirtyDaysAgo
    );

    // Calculate growth metrics
    const newCustomersThisPeriod = recentUsers.length;
    const newCustomersPreviousPeriod = previousPeriodUsers.length;
    const customerGrowthRate = previousPeriodUsers.length > 0 
      ? ((newCustomersThisPeriod - newCustomersPreviousPeriod) / newCustomersPreviousPeriod) * 100
      : newCustomersThisPeriod > 0 ? 100 : 0;

    // Active accounts (approximate based on subscriptions)
    const activeAccounts = activeSubscriptions.length + Math.floor(claimedBusinessCount * 0.3); // Estimate

    return {
      revenue: {
        total: totalMRR,
        growth: 0, // TODO: Calculate based on historical data
        trend: "up" as const,
      },
      customers: {
        new: newCustomersThisPeriod,
        growth: customerGrowthRate,
        trend: customerGrowthRate >= 0 ? "up" as const : "down" as const,
      },
      activeAccounts: {
        total: activeAccounts,
        claimed: claimedBusinessCount,
        unclaimed: totalBusinessesCount - claimedBusinessCount,
        growth: 0, // TODO: Calculate based on historical data
        trend: "up" as const,
      },
      businesses: {
        total: totalBusinessesCount,
        claimed: claimedBusinessCount,
        unclaimed: totalBusinessesCount - claimedBusinessCount,
        verified: verifiedBusinessCount,
        claimRate: totalBusinessesCount > 0 
          ? (claimedBusinessCount / totalBusinessesCount) * 100 
          : 0,
        planDistribution: planCounts,
        growth: 0, // TODO: Calculate based on historical data
        trend: "up" as const,
      },
      reviews: {
        total: totalReviewsCount,
        averagePerBusiness: totalBusinessesCount > 0 ? (totalReviewsCount / totalBusinessesCount) : 0,
        verified: verifiedReviewsCount,
        recentReviews: recentReviewsCount,
      },
      subscriptions: {
        active: activeSubscriptions.length,
        total: subscriptions.length,
        mrr: totalMRR,
        plans: activeSubscriptions.reduce((acc, sub) => {
          // Map polar price IDs to plan names
          const planName = sub.polarPriceId?.includes("pro") ? "pro" : 
                          sub.polarPriceId?.includes("power") ? "power" : "unknown";
          acc[planName] = (acc[planName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  },
});