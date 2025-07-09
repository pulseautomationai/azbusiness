import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per user
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up old entries every 5 minutes

// Check if user is rate limited
export const checkRateLimit = internalQuery({
  args: {
    userId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // Count requests in the current window
    const recentRequests = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_endpoint", (q) => 
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .filter((q) => q.gt(q.field("timestamp"), windowStart))
      .collect();

    const requestCount = recentRequests.length;
    const isRateLimited = requestCount >= MAX_REQUESTS_PER_WINDOW;

    return {
      isRateLimited,
      requestCount,
      maxRequests: MAX_REQUESTS_PER_WINDOW,
      windowMs: RATE_LIMIT_WINDOW_MS,
      resetTime: windowStart + RATE_LIMIT_WINDOW_MS,
    };
  },
});

// Record a request
export const recordRequest = internalMutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Record the request
    await ctx.db.insert("rateLimits", {
      userId: args.userId,
      endpoint: args.endpoint,
      timestamp: now,
      ipAddress: args.ipAddress,
    });

    // Cleanup old entries occasionally (simple approach)
    const shouldCleanup = Math.random() < 0.01; // 1% chance per request
    if (shouldCleanup) {
      await cleanupOldEntries(ctx);
    }

    return { success: true };
  },
});

// Clean up old rate limit entries
export const cleanupRateLimitEntries = mutation({
  args: {},
  handler: async (ctx) => {
    await cleanupOldEntries(ctx);
    return { success: true };
  },
});

// Helper function to clean up old entries
async function cleanupOldEntries(ctx: any): Promise<void> {
  const cutoffTime = Date.now() - (RATE_LIMIT_WINDOW_MS * 2); // Keep 2 windows worth of data
  
  const oldEntries = await ctx.db
    .query("rateLimits")
    .withIndex("by_timestamp", (q: any) => q.lt(q.field("timestamp"), cutoffTime))
    .collect();

  for (const entry of oldEntries) {
    await ctx.db.delete(entry._id);
  }

  if (oldEntries.length > 0) {
    console.log(`Cleaned up ${oldEntries.length} old rate limit entries`);
  }
}

// Get rate limit status for a user
export const getRateLimitStatus = query({
  args: {
    userId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    const recentRequests = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_endpoint", (q) => 
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .filter((q) => q.gt(q.field("timestamp"), windowStart))
      .collect();

    const requestCount = recentRequests.length;
    const remainingRequests = Math.max(0, MAX_REQUESTS_PER_WINDOW - requestCount);

    return {
      requestCount,
      remainingRequests,
      maxRequests: MAX_REQUESTS_PER_WINDOW,
      windowMs: RATE_LIMIT_WINDOW_MS,
      resetTime: windowStart + RATE_LIMIT_WINDOW_MS,
    };
  },
});