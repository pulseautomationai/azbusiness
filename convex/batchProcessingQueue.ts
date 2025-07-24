import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

// Queue item status
export const QueueStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  RETRYING: "retrying",
} as const;

// Queue item type
export const QueueType = {
  AI_ANALYSIS: "ai_analysis",
  RANKING_CALCULATION: "ranking_calculation",
  ACHIEVEMENT_DETECTION: "achievement_detection",
  BATCH_PROCESSING: "batch_processing",
} as const;

// Add item to processing queue
export const enqueueItem = internalMutation({
  args: {
    type: v.union(
      v.literal("ai_analysis"),
      v.literal("ranking_calculation"),
      v.literal("achievement_detection"),
      v.literal("batch_processing")
    ),
    businessId: v.id("businesses"),
    priority: v.optional(v.number()), // 1-10, higher is more important
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existingItem = await ctx.db
      .query("processingQueue")
      .withIndex("by_business_type_status", (q) =>
        q
          .eq("businessId", args.businessId)
          .eq("type", args.type)
          .eq("status", QueueStatus.PENDING)
      )
      .first();

    // Don't duplicate pending items
    if (existingItem) {
      return existingItem._id;
    }

    const queueId = await ctx.db.insert("processingQueue", {
      type: args.type,
      businessId: args.businessId,
      status: QueueStatus.PENDING,
      priority: args.priority || 5,
      attempts: 0,
      metadata: args.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return queueId;
  },
});

// Batch enqueue multiple items
export const batchEnqueue = mutation({
  args: {
    items: v.array(
      v.object({
        type: v.union(
          v.literal("ai_analysis"),
          v.literal("ranking_calculation"),
          v.literal("achievement_detection"),
          v.literal("batch_processing")
        ),
        businessId: v.id("businesses"),
        priority: v.optional(v.number()),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const queueIds: Id<"processingQueue">[] = [];

    for (const item of args.items) {
      const queueId = await ctx.runMutation(internal.batchProcessingQueue.enqueueItem, item);
      queueIds.push(queueId);
    }

    return queueIds;
  },
});

// Get next item from queue
export const getNextQueueItem = internalQuery({
  args: {
    type: v.optional(v.union(
      v.literal("ai_analysis"),
      v.literal("ranking_calculation"),
      v.literal("achievement_detection"),
      v.literal("batch_processing")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("processingQueue")
      .withIndex("by_status_priority", (q) =>
        q.eq("status", QueueStatus.PENDING)
      );

    const items = await query.collect();
    
    // Filter by type if specified
    const filteredItems = args.type
      ? items.filter(item => item.type === args.type)
      : items;

    // Sort by priority (descending) and created date (ascending)
    filteredItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.createdAt - b.createdAt; // Older items first
    });

    return filteredItems[0] || null;
  },
});

// Update queue item status
export const updateQueueItemStatus = internalMutation({
  args: {
    queueId: v.id("processingQueue"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("retrying")
    ),
    error: v.optional(v.string()),
    result: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.queueId);
    if (!item) return;

    await ctx.db.patch(args.queueId, {
      status: args.status,
      error: args.error,
      result: args.result,
      updatedAt: Date.now(),
      ...(args.status === "processing" ? { startedAt: Date.now() } : {}),
      ...(args.status === "completed" || args.status === "failed" 
        ? { completedAt: Date.now() } 
        : {}),
    });
  },
});

// Increment retry count
export const incrementRetryCount = internalMutation({
  args: {
    queueId: v.id("processingQueue"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.queueId);
    if (!item) return;

    await ctx.db.patch(args.queueId, {
      attempts: item.attempts + 1,
      lastAttemptAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get queue statistics
export const getQueueStats = query({
  handler: async (ctx) => {
    const allItems = await ctx.db.query("processingQueue").collect();
    
    const stats = {
      total: allItems.length,
      byStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retrying: 0,
      },
      byType: {
        ai_analysis: 0,
        ranking_calculation: 0,
        achievement_detection: 0,
        batch_processing: 0,
      },
      oldestPending: null as Date | null,
      averageProcessingTime: 0,
    };

    let totalProcessingTime = 0;
    let processedCount = 0;

    for (const item of allItems) {
      // Count by status
      stats.byStatus[item.status as keyof typeof stats.byStatus]++;
      
      // Count by type
      stats.byType[item.type as keyof typeof stats.byType]++;
      
      // Find oldest pending
      if (item.status === "pending" && (!stats.oldestPending || item.createdAt < stats.oldestPending.getTime())) {
        stats.oldestPending = new Date(item.createdAt);
      }
      
      // Calculate average processing time
      if (item.status === "completed" && item.startedAt && item.completedAt) {
        totalProcessingTime += item.completedAt - item.startedAt;
        processedCount++;
      }
    }

    if (processedCount > 0) {
      stats.averageProcessingTime = totalProcessingTime / processedCount;
    }

    return stats;
  },
});

// Clean up old completed items
export const cleanupCompletedItems = internalMutation({
  args: {
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - (args.olderThanDays || 7) * 24 * 60 * 60 * 1000;
    
    const oldItems = await ctx.db
      .query("processingQueue")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "completed"),
          q.lt(q.field("completedAt"), cutoffDate)
        )
      )
      .collect();

    let deletedCount = 0;
    for (const item of oldItems) {
      await ctx.db.delete(item._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});

// Get queue items for a specific business
export const getBusinessQueueItems = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("processingQueue")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .collect();

    return items;
  },
});

// Retry failed items
export const retryFailedItems = mutation({
  args: {
    type: v.optional(v.union(
      v.literal("ai_analysis"),
      v.literal("ranking_calculation"),
      v.literal("achievement_detection"),
      v.literal("batch_processing")
    )),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxRetries = args.maxRetries || 3;
    
    let query = ctx.db
      .query("processingQueue")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "failed"),
          q.lt(q.field("attempts"), maxRetries)
        )
      );

    const failedItems = await query.collect();
    
    // Filter by type if specified
    const itemsToRetry = args.type
      ? failedItems.filter(item => item.type === args.type)
      : failedItems;

    let retriedCount = 0;
    for (const item of itemsToRetry) {
      await ctx.db.patch(item._id, {
        status: QueueStatus.RETRYING,
        updatedAt: Date.now(),
      });
      retriedCount++;
    }

    return { retriedCount };
  },
});