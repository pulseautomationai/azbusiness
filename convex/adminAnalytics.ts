import { v } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Get admin dashboard metrics
 */
export const getAdminDashboardMetrics = query({
  handler: async (ctx): Promise<{
    revenue: { total: number; growth: number; trend: "up" | "down" };
    customers: { new: number; growth: number; trend: "up" | "down" };
    activeAccounts: { total: number; claimed: number; unclaimed: number; growth: number; trend: "up" | "down" };
    businesses: { total: number; claimed: number; unclaimed: number; verified: number; claimRate: number; planDistribution: any; growth: number; trend: "up" | "down" };
    reviews: { total: number; averagePerBusiness: number; verified: number; recentReviews: number };
    subscriptions: { active: number; total: number; mrr: number; plans: Record<string, number> };
  }> => {
    // TODO: Restore admin access check when admin module is available
    
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    // Get platform stats for accurate counts
    const platformStats: any = await ctx.runQuery(api.platformStats.getOrCreateStats);
    
    // Use actual platform stats instead of hardcoded values
    const accurateCounts: {
      totalBusinesses: number;
      totalReviews: number;
      claimedBusinesses: number;
      verifiedBusinesses: number;
      verifiedReviews: number;
      planCounts: any;
    } = {
      totalBusinesses: platformStats.totalBusinesses,
      totalReviews: platformStats.totalReviews,
      claimedBusinesses: platformStats.claimedBusinesses,
      verifiedBusinesses: platformStats.verifiedBusinesses,
      verifiedReviews: platformStats.verifiedReviews,
      planCounts: platformStats.planCounts || {
        free: platformStats.totalBusinesses - 2,
        starter: 0,
        pro: 0,
        power: 2,
      }
    };
    
    // Get counts and limited data instead of all records
    const users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    
    // For businesses calculations, use a sample
    const businessSample = await ctx.db.query("businesses").take(1000);
    
    // Get recent reviews for statistics
    const recentReviews = await ctx.db
      .query("reviews")
      .take(100);

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

    // Active accounts (users with claimed businesses or active subscriptions)
    const activeUserIds = new Set([
      ...activeSubscriptions.map(sub => sub.userId).filter(Boolean),
    ]);
    const activeAccounts = activeUserIds.size;

    // Business metrics from accurate counts
    const claimedBusinessCount: number = accurateCounts.claimedBusinesses;
    const unclaimedBusinesses = accurateCounts.totalBusinesses - claimedBusinessCount;

    // Plan distribution from accurate counts
    const planCounts = accurateCounts.planCounts;

    // Review statistics from accurate counts
    const totalReviews = accurateCounts.totalReviews;
    const verifiedBusinesses = accurateCounts.verifiedBusinesses;
    const verifiedReviewsCount = accurateCounts.verifiedReviews || 0;
    
    console.log("Debug totalReviews:", totalReviews, "from platformStats:", platformStats.totalReviews);

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
        unclaimed: unclaimedBusinesses,
        growth: 0, // TODO: Calculate based on historical data
        trend: "up" as const,
      },
      businesses: {
        total: accurateCounts.totalBusinesses,
        claimed: claimedBusinessCount,
        unclaimed: accurateCounts.totalBusinesses - claimedBusinessCount,
        verified: verifiedBusinesses,
        claimRate: accurateCounts.totalBusinesses > 0 
          ? (claimedBusinessCount / accurateCounts.totalBusinesses) * 100 
          : 0,
        planDistribution: planCounts,
        growth: 0, // TODO: Calculate based on historical data
        trend: "up" as const,
      },
      reviews: {
        total: totalReviews,
        averagePerBusiness: accurateCounts.totalBusinesses > 0 ? (totalReviews / accurateCounts.totalBusinesses) : 0,
        verified: verifiedReviewsCount,
        recentReviews: recentReviews.length,
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

/**
 * Get business growth analytics over time
 */
export const getBusinessGrowthAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const businesses = await ctx.db.query("businesses").collect();
    const users = await ctx.db.query("users").collect();
    
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);
    
    // Create daily buckets
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startTime + (i * 24 * 60 * 60 * 1000));
      const endOfDay = date.getTime() + (24 * 60 * 60 * 1000);
      
      const businessesOnDay = businesses.filter(b => 
        b.createdAt <= endOfDay
      ).length;
      
      const usersOnDay = users.filter(u => 
        u.createdAt && u.createdAt <= endOfDay
      ).length;
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        businesses: businessesOnDay,
        users: usersOnDay,
      });
    }
    
    return dailyData;
  },
});

/**
 * Get subscription analytics
 */
export const getSubscriptionAnalytics = query({
  handler: async (ctx) => {
    const subscriptions = await ctx.db.query("subscriptions").collect();
    
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === "active" || sub.status === "trialing"
    );
    
    const revenueByMonth = activeSubscriptions.reduce((acc, sub) => {
      if (sub.currentPeriodStart) {
        const month = new Date(sub.currentPeriodStart).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + (sub.amount || 0) / 100;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalActive: activeSubscriptions.length,
      totalRevenue: activeSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0) / 100,
      revenueByMonth,
      statusBreakdown: subscriptions.reduce((acc, sub) => {
        acc[sub.status || "unknown"] = (acc[sub.status || "unknown"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});