import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Queue status types
export type QueueStatus = "pending" | "processing" | "completed" | "failed";

// Define the queue table schema
export const addToQueue = mutation({
  args: {
    businessId: v.id("businesses"),
    placeId: v.string(),
    priority: v.optional(v.number()), // 1-10, higher is more important
  },
  handler: async (ctx, args) => {
    // Check if already in queue
    const existing = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => 
        q.and(
          q.eq(q.field("businessId"), args.businessId),
          q.neq(q.field("status"), "completed")
        )
      )
      .first();
    
    if (existing) {
      console.log(`Business ${args.businessId} already in queue`);
      return existing._id;
    }
    
    // Add to queue
    const queueId = await ctx.db.insert("reviewSyncQueue", {
      businessId: args.businessId,
      placeId: args.placeId,
      priority: args.priority || 5,
      status: "pending",
      requestedAt: Date.now(),
      retryCount: 0,
    });
    
    return queueId;
  },
});

// Get queue status
export const getQueueStatus = query({
  handler: async (ctx) => {
    // Use indexes and limit results to avoid document limit
    const MAX_COUNT = 1000; // Maximum items to count
    const RECENT_TIME = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    
    // Count pending items (limit to recent ones)
    const pendingQuery = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.gte(q.field("requestedAt"), RECENT_TIME))
      .take(MAX_COUNT);
    const pendingCount = pendingQuery.length;
    
    // Count processing items (should be small)
    const processingQuery = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .take(100); // Should never be more than a few
    const processingCount = processingQuery.length;
    
    // Get recent completed (already limited)
    const recentCompleted = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(10);
    
    // Get recent failed (already limited)
    const recentFailed = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .order("desc")
      .take(5);
    
    return {
      pendingCount: pendingCount,
      processingCount,
      activeConnections: processingCount,
      maxConnections: 3,
      queueDepth: pendingCount,
      recentCompleted: recentCompleted.length,
      recentFailed: recentFailed.length,
    };
  },
});

// Get next items to process
export const getNextQueueItems = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;
    
    // Get current processing count using index
    const processing = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .take(10); // Max concurrent is 3, so 10 is more than enough
    
    const availableSlots = Math.max(0, 3 - processing.length);
    
    if (availableSlots === 0) {
      return [];
    }
    
    // Get next items by priority and request time using index
    const pendingItems = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc") // This will order by _creationTime descending
      .take(Math.min(50, limit * 10)); // Take more than needed for sorting
    
    // Filter out paused items (negative priority) and sort
    const activePendingItems = pendingItems.filter(item => item.priority >= 0);
    
    // Sort by priority (descending) then by requestedAt (ascending)
    const sortedItems = activePendingItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.requestedAt - b.requestedAt; // Earlier requests first
    });
    
    return sortedItems.slice(0, Math.min(availableSlots, limit));
  },
});

// Mark item as processing
export const markAsProcessing = mutation({
  args: {
    queueId: v.id("reviewSyncQueue"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueId, {
      status: "processing",
      startedAt: Date.now(),
    });
  },
});

// Mark item as completed
export const markAsCompleted = mutation({
  args: {
    queueId: v.id("reviewSyncQueue"),
    results: v.object({
      fetched: v.number(),
      filtered: v.number(),
      imported: v.number(),
      skipped: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueId, {
      status: "completed",
      completedAt: Date.now(),
      results: args.results,
    });
  },
});

// Mark item as failed
export const markAsFailed = mutation({
  args: {
    queueId: v.id("reviewSyncQueue"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.queueId);
    if (!item) return;
    
    const retryCount = (item.retryCount || 0) + 1;
    const maxRetries = 3;
    
    if (retryCount < maxRetries) {
      // Reset to pending for retry
      await ctx.db.patch(args.queueId, {
        status: "pending",
        retryCount,
        lastError: args.error,
        lastErrorAt: Date.now(),
      });
    } else {
      // Max retries exceeded
      await ctx.db.patch(args.queueId, {
        status: "failed",
        retryCount,
        lastError: args.error,
        failedAt: Date.now(),
      });
    }
  },
});

// Clear stuck items (processing for too long)
export const clearStuckItems = mutation({
  handler: async (ctx) => {
    const stuckThreshold = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    // Use index to find processing items
    const processing = await ctx.db
      .query("reviewSyncQueue")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .take(100); // Should be very few processing items
    
    let cleared = 0;
    
    for (const item of processing) {
      if (item.startedAt && (now - item.startedAt) > stuckThreshold) {
        await ctx.db.patch(item._id, {
          status: "pending",
          retryCount: (item.retryCount || 0) + 1,
          lastError: "Processing timeout - marked as stuck",
          lastErrorAt: now,
        });
        cleared++;
      }
    }
    
    return { cleared };
  },
});

// Bulk add businesses to queue
export const bulkAddToQueue = mutation({
  args: {
    businesses: v.array(v.object({
      businessId: v.id("businesses"),
      placeId: v.string(),
    })),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    // Limit batch size to prevent document limit errors
    const MAX_BATCH_SIZE = 100;
    if (args.businesses.length > MAX_BATCH_SIZE) {
      throw new Error(`Batch size ${args.businesses.length} exceeds maximum of ${MAX_BATCH_SIZE}`);
    }
    
    for (const business of args.businesses) {
      // Check if already in queue using index
      const existing = await ctx.db
        .query("reviewSyncQueue")
        .withIndex("by_business", (q) => q.eq("businessId", business.businessId))
        .filter((q) => q.neq(q.field("status"), "completed"))
        .first();
      
      if (!existing) {
        const queueId = await ctx.db.insert("reviewSyncQueue", {
          businessId: business.businessId,
          placeId: business.placeId,
          priority: args.priority || 5,
          status: "pending",
          requestedAt: Date.now(),
          retryCount: 0,
        });
        
        results.push({ businessId: business.businessId, queueId, status: "added" });
      } else {
        results.push({ businessId: business.businessId, queueId: existing._id, status: "existing" });
      }
    }
    
    return {
      total: args.businesses.length,
      added: results.filter(r => r.status === "added").length,
      existing: results.filter(r => r.status === "existing").length,
      results,
    };
  },
});