import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Metrics types
export type MetricType = 
  | "api_request" 
  | "api_success" 
  | "api_error" 
  | "queue_depth"
  | "processing_time"
  | "reviews_fetched"
  | "reviews_imported";

// Record a metric with rate limiting
export const recordMetric = mutation({
  args: {
    type: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const hour = Math.floor(timestamp / (1000 * 60 * 60));
    const day = Math.floor(timestamp / (1000 * 60 * 60 * 24));
    
    // Skip recording some types of metrics to reduce volume
    const skipTypes = ["api_request", "api_success"]; // These are too frequent
    if (skipTypes.includes(args.type) && Math.random() > 0.1) { // Only record 10% of these
      return;
    }
    
    // For queue depth, only record if it's changed significantly
    if (args.type === "queue_depth") {
      const recentDepth = await ctx.db
        .query("geoScraperMetrics")
        .withIndex("by_type_and_hour", (q) => q.eq("type", "queue_depth").eq("hour", hour))
        .order("desc")
        .take(1);
      
      if (recentDepth.length > 0 && Math.abs(recentDepth[0].value - args.value) < 5) {
        return; // Skip if queue depth hasn't changed by at least 5
      }
    }
    
    // Store raw metric
    await ctx.db.insert("geoScraperMetrics", {
      type: args.type,
      value: args.value,
      timestamp,
      hour,
      day,
      metadata: args.metadata,
    });
  },
});

// Get metrics summary - Simple version with strict limits
export const getMetricsSummarySimple = query({
  args: {
    timeRange: v.optional(v.union(v.literal("hour"), v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Just get the most recent metrics without any filtering
    // This avoids the document limit issue
    const recentMetrics = await ctx.db
      .query("geoScraperMetrics")
      .order("desc")
      .take(100); // Very small limit
    
    // Calculate summary from limited data
    const summary = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalReviewsFetched: 0,
      totalReviewsImported: 0,
    };
    
    for (const metric of recentMetrics) {
      switch (metric.type) {
        case "api_request":
          summary.totalRequests++;
          break;
        case "api_success":
          summary.successfulRequests++;
          break;
        case "api_error":
          summary.failedRequests++;
          break;
        case "reviews_fetched":
          summary.totalReviewsFetched += metric.value;
          break;
        case "reviews_imported":
          summary.totalReviewsImported += metric.value;
          break;
      }
    }
    
    return {
      timeRange: `last ${recentMetrics.length} events`,
      startTime: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].timestamp : now,
      endTime: recentMetrics.length > 0 ? recentMetrics[0].timestamp : now,
      ...summary,
      averageResponseTime: 0,
      errorRates: {},
      queueDepthHistory: [],
      note: "Limited data for performance - last 100 events only"
    };
  },
});

// Get metrics summary
// Optimized version - NOW REDIRECTS TO SIMPLE VERSION TO AVOID DOCUMENT LIMITS
export const getMetricsSummaryOptimized = query({
  args: {
    timeRange: v.optional(v.union(v.literal("hour"), v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    // IMPORTANT: This function was hitting document limits
    // Now it just returns the same data as the simple version
    const now = Date.now();
    
    // Just get the most recent metrics without any filtering
    const recentMetrics = await ctx.db
      .query("geoScraperMetrics")
      .order("desc")
      .take(100); // Very small limit
    
    // Calculate summary from limited data
    const summary = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalReviewsFetched: 0,
      totalReviewsImported: 0,
    };
    
    for (const metric of recentMetrics) {
      switch (metric.type) {
        case "api_request":
          summary.totalRequests++;
          break;
        case "api_success":
          summary.successfulRequests++;
          break;
        case "api_error":
          summary.failedRequests++;
          break;
        case "reviews_fetched":
          summary.totalReviewsFetched += metric.value;
          break;
        case "reviews_imported":
          summary.totalReviewsImported += metric.value;
          break;
      }
    }
    
    return {
      timeRange: `last ${recentMetrics.length} events`,
      startTime: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].timestamp : now,
      endTime: recentMetrics.length > 0 ? recentMetrics[0].timestamp : now,
      ...summary,
      averageResponseTime: 0,
      errorRates: {},
      queueDepthHistory: [],
    };
  },
});

export const getMetricsSummary = query({
  args: {
    timeRange: v.optional(v.union(
      v.literal("hour"),
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timeRange = args.timeRange || "day";
    
    let startTime: number;
    switch (timeRange) {
      case "hour":
        startTime = now - (60 * 60 * 1000);
        break;
      case "day":
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    // Get metrics in batches to avoid document limit
    const metrics: any[] = [];
    let lastId: any = null;
    const batchSize = 1000;
    
    while (true) {
      let query = ctx.db
        .query("geoScraperMetrics")
        .filter((q) => q.gte(q.field("timestamp"), startTime));
      
      if (lastId) {
        query = query.filter((q) => q.gt(q.field("_id"), lastId));
      }
      
      const batch = await query.take(batchSize);
      
      if (batch.length === 0) break;
      
      metrics.push(...batch);
      lastId = batch[batch.length - 1]._id;
      
      // Stop if we've collected too many metrics (safety limit)
      if (metrics.length > 30000) break;
      
      if (batch.length < batchSize) break;
    }
    
    // Calculate summary statistics
    const summary = {
      timeRange,
      startTime,
      endTime: now,
      totalRequests: metrics.filter(m => m.type === "api_request").length,
      successfulRequests: metrics.filter(m => m.type === "api_success").length,
      failedRequests: metrics.filter(m => m.type === "api_error").length,
      averageResponseTime: 0,
      totalReviewsFetched: 0,
      totalReviewsImported: 0,
      errorRates: {} as Record<string, number>,
      queueDepthHistory: [] as { timestamp: number; depth: number }[],
    };
    
    // Calculate averages and totals
    const responseTimes = metrics.filter(m => m.type === "processing_time");
    if (responseTimes.length > 0) {
      summary.averageResponseTime = responseTimes.reduce((sum, m) => sum + m.value, 0) / responseTimes.length;
    }
    
    summary.totalReviewsFetched = metrics
      .filter(m => m.type === "reviews_fetched")
      .reduce((sum, m) => sum + m.value, 0);
    
    summary.totalReviewsImported = metrics
      .filter(m => m.type === "reviews_imported")
      .reduce((sum, m) => sum + m.value, 0);
    
    // Calculate error rates by type
    const errors = metrics.filter(m => m.type === "api_error");
    const errorTypes: Record<string, number> = {};
    errors.forEach(error => {
      const errorType = error.metadata?.errorCode || "unknown";
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    Object.entries(errorTypes).forEach(([type, count]) => {
      summary.errorRates[type] = count / summary.totalRequests;
    });
    
    // Get queue depth history
    const queueMetrics = metrics
      .filter(m => m.type === "queue_depth")
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-20); // Last 20 data points
    
    summary.queueDepthHistory = queueMetrics.map(m => ({
      timestamp: m.timestamp,
      depth: m.value,
    }));
    
    return summary;
  },
});

// Get hourly metrics
export const getHourlyMetrics = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursToFetch = args.hours || 24;
    const now = Date.now();
    const currentHour = Math.floor(now / (1000 * 60 * 60));
    const startHour = currentHour - hoursToFetch;
    
    // Get hourly metrics in batches to avoid document limit
    const metrics: any[] = [];
    let lastId: any = null;
    const batchSize = 1000;
    
    while (true) {
      let query = ctx.db
        .query("geoScraperMetrics")
        .filter((q) => q.gte(q.field("hour"), startHour));
      
      if (lastId) {
        query = query.filter((q) => q.gt(q.field("_id"), lastId));
      }
      
      const batch = await query.take(batchSize);
      
      if (batch.length === 0) break;
      
      metrics.push(...batch);
      lastId = batch[batch.length - 1]._id;
      
      // Stop if we've collected too many metrics (safety limit)
      if (metrics.length > 30000) break;
      
      if (batch.length < batchSize) break;
    }
    
    // Group by hour
    const hourlyData: Record<number, {
      requests: number;
      successes: number;
      errors: number;
      avgResponseTime: number;
      reviewsFetched: number;
      reviewsImported: number;
    }> = {};
    
    // Initialize hours
    for (let h = startHour; h <= currentHour; h++) {
      hourlyData[h] = {
        requests: 0,
        successes: 0,
        errors: 0,
        avgResponseTime: 0,
        reviewsFetched: 0,
        reviewsImported: 0,
      };
    }
    
    // Aggregate metrics
    metrics.forEach(metric => {
      const hour = metric.hour;
      if (!hourlyData[hour]) return;
      
      switch (metric.type) {
        case "api_request":
          hourlyData[hour].requests++;
          break;
        case "api_success":
          hourlyData[hour].successes++;
          break;
        case "api_error":
          hourlyData[hour].errors++;
          break;
        case "reviews_fetched":
          hourlyData[hour].reviewsFetched += metric.value;
          break;
        case "reviews_imported":
          hourlyData[hour].reviewsImported += metric.value;
          break;
      }
    });
    
    // Calculate response times
    const responseTimes = metrics.filter(m => m.type === "processing_time");
    responseTimes.forEach(metric => {
      const hour = metric.hour;
      if (!hourlyData[hour]) return;
      
      const hourMetrics = responseTimes.filter(m => m.hour === hour);
      if (hourMetrics.length > 0) {
        hourlyData[hour].avgResponseTime = 
          hourMetrics.reduce((sum, m) => sum + m.value, 0) / hourMetrics.length;
      }
    });
    
    // Convert to array
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      timestamp: parseInt(hour) * 60 * 60 * 1000,
      ...data,
    })).sort((a, b) => a.hour - b.hour);
  },
});

// Get current queue metrics
export const getCurrentQueueMetrics = query({
  handler: async (ctx) => {
    // Get current queue status
    const pending = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    
    const processing = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => q.eq(q.field("status"), "processing"))
      .collect();
    
    const completedToday = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "completed"),
          q.gte(q.field("completedAt"), Date.now() - 24 * 60 * 60 * 1000)
        )
      )
      .collect();
    
    const failedToday = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "failed"),
          q.gte(q.field("failedAt"), Date.now() - 24 * 60 * 60 * 1000)
        )
      )
      .collect();
    
    // Calculate average processing time
    const avgProcessingTime = completedToday.reduce((sum, item) => {
      if (item.startedAt && item.completedAt) {
        return sum + (item.completedAt - item.startedAt);
      }
      return sum;
    }, 0) / (completedToday.length || 1);
    
    return {
      currentQueueDepth: pending.length,
      activeConnections: processing.length,
      maxConnections: 3,
      completedToday: completedToday.length,
      failedToday: failedToday.length,
      avgProcessingTime: Math.round(avgProcessingTime / 1000), // in seconds
      successRate: completedToday.length / (completedToday.length + failedToday.length) || 0,
    };
  },
});

// Clean up old metrics (run periodically)
export const cleanupOldMetrics = mutation({
  args: {
    daysToKeep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysToKeep = args.daysToKeep || 7; // Keep only 7 days by default
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    let deleted = 0;
    let lastId: any = null;
    const batchSize = 100; // Delete in smaller batches
    
    while (true) {
      let query = ctx.db
        .query("geoScraperMetrics")
        .filter((q) => q.lt(q.field("timestamp"), cutoffTime));
      
      if (lastId) {
        query = query.filter((q) => q.gt(q.field("_id"), lastId));
      }
      
      const batch = await query.take(batchSize);
      
      if (batch.length === 0) break;
      
      for (const metric of batch) {
        await ctx.db.delete(metric._id);
        deleted++;
      }
      
      lastId = batch[batch.length - 1]._id;
      
      if (batch.length < batchSize) break;
    }
    
    return { 
      deleted,
      cutoffDate: new Date(cutoffTime).toISOString(),
      daysKept: daysToKeep 
    };
  },
});