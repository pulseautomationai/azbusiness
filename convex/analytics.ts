import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Track an analytics event
export const trackEvent = mutation({
  args: {
    businessId: v.id("businesses"),
    eventType: v.union(
      v.literal("page_view"),
      v.literal("lead_submit"),
      v.literal("phone_click"),
      v.literal("directions_click"),
      v.literal("website_click"),
      v.literal("social_click"),
      v.literal("cta_click")
    ),
    sourceUrl: v.optional(v.string()),
    deviceType: v.optional(v.union(v.literal("mobile"), v.literal("desktop"), v.literal("tablet"))),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Insert the event
    const eventId = await ctx.db.insert("analyticsEvents", {
      ...args,
      timestamp: Date.now(),
    });
    
    return eventId;
  },
});

// Get comprehensive analytics for a business
export const getBusinessAnalytics = query({
  args: {
    businessId: v.id("businesses"),
    timeRange: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month"),
      v.literal("year")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    
    // Check if user has permission to view analytics
    const identity = await ctx.auth.getUserIdentity();
    if (identity && business.ownerId !== identity.tokenIdentifier) {
      // TODO: Add admin check
      throw new Error("Not authorized to view analytics for this business");
    }
    
    // Calculate date range
    let startDate = args.startDate;
    let endDate = args.endDate || Date.now();
    
    if (!startDate && args.timeRange) {
      const now = Date.now();
      switch (args.timeRange) {
        case "day":
          startDate = now - 24 * 60 * 60 * 1000;
          break;
        case "week":
          startDate = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          startDate = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case "year":
          startDate = now - 365 * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    // Get all events in the time range
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => {
        if (startDate) {
          return q.and(
            q.gte(q.field("timestamp"), startDate),
            q.lte(q.field("timestamp"), endDate)
          );
        }
        return true;
      })
      .collect();
    
    // Calculate comprehensive metrics
    const eventCounts: Record<string, number> = {};
    const deviceTypes: Record<string, number> = {};
    const dailyViews: Record<string, number> = {};
    const hourlyPatterns: Record<number, number> = {};
    const trafficSources: Record<string, number> = {};
    
    for (const event of events) {
      // Count by event type
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
      
      // Count by device type
      if (event.deviceType) {
        deviceTypes[event.deviceType] = (deviceTypes[event.deviceType] || 0) + 1;
      }
      
      // Daily views
      if (event.eventType === "page_view") {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        dailyViews[date] = (dailyViews[date] || 0) + 1;
      }
      
      // Hourly patterns
      const hour = new Date(event.timestamp).getHours();
      hourlyPatterns[hour] = (hourlyPatterns[hour] || 0) + 1;
      
      // Traffic sources
      if (event.sourceUrl) {
        try {
          const hostname = new URL(event.sourceUrl).hostname;
          trafficSources[hostname] = (trafficSources[hostname] || 0) + 1;
        } catch {
          trafficSources["direct"] = (trafficSources["direct"] || 0) + 1;
        }
      } else {
        trafficSources["direct"] = (trafficSources["direct"] || 0) + 1;
      }
    }
    
    // Convert daily views to array for charting
    const dailyViewsArray = Object.entries(dailyViews).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Convert hourly patterns to array
    const hourlyPatternsArray = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyPatterns[hour] || 0,
      label: `${hour}:00`,
    }));
    
    // Calculate conversion metrics
    const pageViews = eventCounts.page_view || 0;
    const leadSubmits = eventCounts.lead_submit || 0;
    const phoneClicks = eventCounts.phone_click || 0;
    const websiteClicks = eventCounts.website_click || 0;
    const totalEngagement = leadSubmits + phoneClicks + websiteClicks;
    
    const conversionRate = pageViews > 0 ? (totalEngagement / pageViews) * 100 : 0;
    
    return {
      totalEvents: events.length,
      eventCounts,
      deviceTypes,
      dailyViews: dailyViewsArray,
      hourlyPatterns: hourlyPatternsArray,
      trafficSources,
      metrics: {
        pageViews,
        leadSubmits,
        phoneClicks,
        websiteClicks,
        totalEngagement,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      timeRange: {
        start: startDate || events[0]?.timestamp,
        end: endDate,
      },
    };
  },
});

// Get aggregated analytics for multiple businesses (admin use)
export const getAggregatedAnalytics = query({
  args: {
    businessIds: v.optional(v.array(v.id("businesses"))),
    timeRange: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month"),
      v.literal("year")
    )),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin authorization check
    
    let query = ctx.db.query("analyticsEvents");
    
    // Filter by businesses if specified
    if (args.businessIds && args.businessIds.length > 0) {
      // Note: This is not efficient for large numbers of businesses
      // Consider adding a composite index or different approach for production
      const events = await query.collect();
      const filteredEvents = events.filter(e => 
        e.businessId && args.businessIds!.includes(e.businessId)
      );
      
      return {
        totalEvents: filteredEvents.length,
        byBusiness: args.businessIds.reduce((acc, id) => {
          acc[id] = filteredEvents.filter(e => e.businessId === id).length;
          return acc;
        }, {} as Record<string, number>),
      };
    }
    
    // Get all events
    const events = await query.collect();
    
    // Group by business
    const byBusiness: Record<string, number> = {};
    for (const event of events) {
      if (event.businessId) {
        byBusiness[event.businessId] = (byBusiness[event.businessId] || 0) + 1;
      }
    }
    
    return {
      totalEvents: events.length,
      totalBusinesses: Object.keys(byBusiness).length,
      byBusiness,
    };
  },
});

// Get popular businesses by analytics
export const getPopularBusinesses = query({
  args: {
    limit: v.optional(v.number()),
    eventType: v.optional(v.union(
      v.literal("page_view"),
      v.literal("lead_submit"),
      v.literal("phone_click")
    )),
    timeRange: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const eventType = args.eventType || "page_view";
    
    // Calculate date range
    let startDate;
    const now = Date.now();
    switch (args.timeRange) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    // Get events in time range
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_type", (q) => q.eq("eventType", eventType))
      .filter((q) => q.gte(q.field("timestamp"), startDate))
      .collect();
    
    // Count by business
    const businessCounts: Record<string, number> = {};
    for (const event of events) {
      if (event.businessId) {
        businessCounts[event.businessId] = (businessCounts[event.businessId] || 0) + 1;
      }
    }
    
    // Sort and get top businesses
    const topBusinessIds = Object.entries(businessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id as Id<"businesses">);
    
    // Get business details
    const businesses = await Promise.all(
      topBusinessIds.map(async (id) => {
        const business = await ctx.db.get(id);
        return business ? {
          ...business,
          analyticsCount: businessCounts[id],
        } : null;
      })
    );
    
    return businesses.filter(Boolean);
  },
});

// Clean up old analytics events (scheduled function)
export const cleanupOldAnalytics = mutation({
  args: {
    daysToKeep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysToKeep = args.daysToKeep || 90;
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    // Get old events
    const oldEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffDate))
      .collect();
    
    // Delete them
    let deletedCount = 0;
    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
      deletedCount++;
    }
    
    return {
      deletedCount,
      cutoffDate: new Date(cutoffDate).toISOString(),
    };
  },
});

// Get revenue history for the dashboard
export const getRevenueHistory = query({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    // Group by month and calculate revenue
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Calculate revenue for this month based on plan tiers
      const monthlyRevenue = businesses.reduce((sum, business) => {
        // Only count businesses created before or during this month
        const businessCreatedAt = new Date(business._creationTime);
        if (businessCreatedAt <= monthDate) {
          if (business.planTier === 'pro') return sum + 29;
          if (business.planTier === 'power') return sum + 97;
        }
        return sum;
      }, 0);
      
      const subscriptions = businesses.filter(b => 
        b.planTier === 'pro' || b.planTier === 'power'
      ).length;
      
      monthlyData.push({
        month: monthName,
        revenue: monthlyRevenue,
        subscriptions: subscriptions
      });
    }
    
    return monthlyData;
  },
});

// Get real-time metrics for the dashboard
export const getRealTimeMetrics = query({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    const users = await ctx.db.query("users").collect();
    const reviews = await ctx.db.query("reviews").collect();
    
    // Calculate metrics
    const totalBusinesses = businesses.length;
    const claimedBusinesses = businesses.filter(b => b.claimedAt).length;
    const verifiedBusinesses = businesses.filter(b => b.verified).length;
    
    // Calculate today's activity (using creation time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const todayBusinesses = businesses.filter(b => b._creationTime >= todayTime).length;
    const todayReviews = reviews.filter(r => r._creationTime >= todayTime).length;
    const todayUsers = users.filter(u => u._creationTime >= todayTime).length;
    
    // Calculate revenue
    const totalRevenue = businesses.reduce((sum, business) => {
      if (business.planTier === 'pro') return sum + 29;
      if (business.planTier === 'power') return sum + 97;
      return sum;
    }, 0);
    
    return {
      businesses: {
        total: totalBusinesses,
        claimed: claimedBusinesses,
        verified: verifiedBusinesses,
        todayNew: todayBusinesses,
      },
      users: {
        total: users.length,
        todayNew: todayUsers,
      },
      reviews: {
        total: reviews.length,
        todayNew: todayReviews,
      },
      revenue: {
        total: totalRevenue,
        mrr: totalRevenue, // Monthly recurring revenue
      },
      subscriptions: {
        free: businesses.filter(b => !b.planTier || b.planTier === 'free').length,
        starter: businesses.filter(b => b.planTier === 'starter').length,
        pro: businesses.filter(b => b.planTier === 'pro').length,
        power: businesses.filter(b => b.planTier === 'power').length,
      }
    };
  },
});

// Get plan distribution data for pie chart
export const getPlanDistribution = query({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    const total = businesses.length || 1; // Avoid division by zero
    
    const distribution = [
      {
        name: 'Free',
        value: Math.round((businesses.filter(b => !b.planTier || b.planTier === 'free').length / total) * 100),
        count: businesses.filter(b => !b.planTier || b.planTier === 'free').length,
        color: '#94a3b8'
      },
      {
        name: 'Starter',
        value: Math.round((businesses.filter(b => b.planTier === 'starter').length / total) * 100),
        count: businesses.filter(b => b.planTier === 'starter').length,
        color: '#3b82f6'
      },
      {
        name: 'Pro',
        value: Math.round((businesses.filter(b => b.planTier === 'pro').length / total) * 100),
        count: businesses.filter(b => b.planTier === 'pro').length,
        color: '#10b981'
      },
      {
        name: 'Power',
        value: Math.round((businesses.filter(b => b.planTier === 'power').length / total) * 100),
        count: businesses.filter(b => b.planTier === 'power').length,
        color: '#f59e0b'
      }
    ];
    
    return distribution;
  },
});

// Get recent activity for live feed
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    // Get recent businesses
    const recentBusinesses = await ctx.db
      .query("businesses")
      .order("desc")
      .take(limit);
    
    // Get recent reviews
    const recentReviews = await ctx.db
      .query("reviews")
      .order("desc")
      .take(limit);
    
    // Get recent users
    const recentUsers = await ctx.db
      .query("users")
      .order("desc")
      .take(limit);
    
    // Combine and sort by creation time
    const activities = [];
    
    // Add business claims
    for (const business of recentBusinesses) {
      if (business.claimedAt) {
        activities.push({
          id: business._id,
          type: 'claim' as const,
          user: 'Business Owner',
          business: business.name,
          timestamp: business._creationTime,
          _creationTime: business._creationTime,
        });
      }
    }
    
    // Add reviews
    for (const review of recentReviews) {
      const business = await ctx.db.get(review.businessId);
      activities.push({
        id: review._id,
        type: 'review' as const,
        user: review.userName || 'Anonymous',
        business: business?.name || 'Unknown Business',
        rating: review.rating,
        timestamp: review._creationTime,
        _creationTime: review._creationTime,
      });
    }
    
    // Add user signups
    for (const user of recentUsers) {
      activities.push({
        id: user._id,
        type: 'signup' as const,
        user: user.name || 'New User',
        timestamp: user._creationTime,
        _creationTime: user._creationTime,
      });
    }
    
    // Sort by creation time and return most recent
    return activities
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit)
      .map(({ _creationTime, ...activity }) => activity);
  },
});

// Get conversion funnel data
export const getConversionFunnel = query({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    const users = await ctx.db.query("users").collect();
    
    // For now, we'll estimate visitors (in production, this would come from PostHog)
    const estimatedVisitors = users.length * 10; // Rough estimate
    const signups = users.length;
    const claimed = businesses.filter(b => b.claimedAt).length;
    const subscribed = businesses.filter(b => b.planTier === 'pro' || b.planTier === 'power').length;
    
    return {
      visitors: estimatedVisitors,
      signups,
      claimed,
      subscribed,
      rates: {
        visitorToSignup: signups > 0 ? (signups / estimatedVisitors) * 100 : 0,
        signupToClaim: signups > 0 ? (claimed / signups) * 100 : 0,
        claimToSubscription: claimed > 0 ? (subscribed / claimed) * 100 : 0,
        overall: estimatedVisitors > 0 ? (subscribed / estimatedVisitors) * 100 : 0,
      }
    };
  },
});