import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get admin dashboard metrics
 */
export const getAdminDashboardMetrics = query({
  handler: async (ctx) => {
    // TODO: Restore admin access check when admin module is available
    
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    // Get all users and subscriptions
    const users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const businesses = await ctx.db.query("businesses").collect();

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
    const claimedBusinesses = businesses.filter(b => b.claimed);
    const activeUserIds = new Set([
      ...activeSubscriptions.map(sub => sub.userId).filter(Boolean),
      ...claimedBusinesses.map(b => b.claimedByUserId).filter(Boolean)
    ]);
    const activeAccounts = activeUserIds.size;

    // Business metrics
    const claimedBusinessCount = claimedBusinesses.length;
    const unclaimedBusinesses = businesses.filter(b => !b.claimed).length;
    const claimRate = businesses.length > 0 
      ? (claimedBusinessCount / businesses.length) * 100 
      : 0;

    // Plan distribution
    const planCounts = businesses.reduce((acc, business) => {
      acc[business.planTier] = (acc[business.planTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
        total: businesses.length,
        claimed: claimedBusinessCount,
        unclaimed: unclaimedBusinesses,
        claimRate: claimRate,
        planDistribution: planCounts,
        growth: 0, // TODO: Calculate based on historical data
        trend: "up" as const,
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