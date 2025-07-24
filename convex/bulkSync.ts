import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Bulk sync state management
export const bulkSyncState = {
  isActive: false,
  isPaused: false,
  total: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  remaining: 0,
  currentBusiness: null as string | null,
  startTime: null as number | null,
  filters: {} as any,
  avgProcessingTime: 0,
};

// Get current bulk sync status
export const getBulkSyncStatus = query({
  handler: async (ctx): Promise<typeof bulkSyncState> => {
    // Get queue statistics
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
    const avgTime = completedToday.reduce((sum, item) => {
      if (item.startedAt && item.completedAt) {
        return sum + (item.completedAt - item.startedAt);
      }
      return sum;
    }, 0) / (completedToday.length || 1);
    
    // Get current processing business
    let currentBusiness = null;
    if (processing.length > 0) {
      const business = await ctx.db.get(processing[0].businessId);
      currentBusiness = business?.name || null;
    }
    
    return {
      isActive: pending.length > 0 || processing.length > 0,
      isPaused: false, // We'll implement pause functionality separately
      total: pending.length + processing.length + completedToday.length + failedToday.length,
      processed: completedToday.length + failedToday.length,
      successful: completedToday.length,
      failed: failedToday.length,
      remaining: pending.length,
      currentBusiness,
      startTime: null,
      filters: {},
      avgProcessingTime: avgTime,
    };
  },
});

// Start bulk sync with filters
export const startBulkSync = action({
  args: {
    filters: v.object({
      city: v.optional(v.string()),
      categoryId: v.optional(v.id("categories")),
      planTier: v.optional(v.union(
        v.literal("free"),
        v.literal("starter"),
        v.literal("pro"),
        v.literal("power")
      )),
      lastSyncBefore: v.optional(v.number()),
    }),
    concurrency: v.optional(v.number()),
    skipErrors: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ added: number; message: string }> => {
    console.log("🚀 Starting bulk sync with filters:", args.filters);
    
    // Get businesses matching filters
    let businesses = await ctx.runQuery(api.bulkSync.getFilteredBusinesses, {
      filters: args.filters,
    });
    
    if (businesses.length === 0) {
      return {
        added: 0,
        message: "No businesses match the selected filters",
      };
    }
    
    console.log(`📊 Found ${businesses.length} businesses to sync`);
    
    // Prioritize by plan tier
    const priorityMap: Record<string, number> = {
      power: 10,
      pro: 7,
      starter: 5,
      free: 3,
    };
    
    // Add businesses to queue with appropriate priority
    const queueItems = businesses.map((b: any) => ({
      businessId: b._id,
      placeId: b.placeId!,
      priority: priorityMap[b.planTier] || 3,
    }));
    
    // Add to queue
    const result = await ctx.runMutation(api.geoScraperQueue.bulkAddToQueue, {
      businesses: queueItems.map((item: any) => ({
        businessId: item.businessId,
        placeId: item.placeId,
      })),
      priority: 5, // Default priority, will be overridden by plan-based priority
    });
    
    // Start processing if concurrency allows
    if (args.concurrency && args.concurrency > 0) {
      await ctx.runAction(api.geoScraperProcessor.processQueue, {
        maxItems: Math.min(args.concurrency * 5, 20),
      });
    }
    
    return {
      added: result.added,
      message: `Added ${result.added} businesses to sync queue`,
    };
  },
});

// Get filtered businesses for bulk sync
export const getFilteredBusinesses = query({
  args: {
    filters: v.object({
      city: v.optional(v.string()),
      categoryId: v.optional(v.id("categories")),
      planTier: v.optional(v.union(
        v.literal("free"),
        v.literal("starter"),
        v.literal("pro"),
        v.literal("power")
      )),
      lastSyncBefore: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<Array<any>> => {
    // Use pagination to reduce memory usage (no by_active index exists)
    let businesses = await ctx.db
      .query("businesses")
      .take(500); // Limit to 500 businesses max for memory efficiency
      
    // Filter for active businesses first
    businesses = businesses.filter(b => b.active);
    
    // Filter by criteria in JavaScript (much smaller dataset now)
    businesses = businesses.filter(b => {
      // Must have place ID
      if (!b.placeId) return false;
      
      // City filter
      if (args.filters.city && b.city !== args.filters.city) return false;
      
      // Category filter
      if (args.filters.categoryId && b.categoryId !== args.filters.categoryId) return false;
      
      // Plan tier filter
      if (args.filters.planTier && b.planTier !== args.filters.planTier) return false;
      
      // Last sync filter
      if (args.filters.lastSyncBefore !== undefined) {
        // Special case: "never" synced (lastSyncBefore will be -1 or very large number)
        if (args.filters.lastSyncBefore === -1) {
          // Only include businesses that have never been synced
          if (b.lastReviewSync) return false;
        } else if (args.filters.lastSyncBefore > 0) {
          // Only include businesses not synced within the timeframe
          if (!b.lastReviewSync || b.lastReviewSync >= args.filters.lastSyncBefore) return false;
        }
      }
      
      // Sync must be enabled
      if (b.geoScraperSyncEnabled === false) return false;
      
      return true;
    });
    
    return businesses;
  },
});

// Pause bulk sync
export const pauseBulkSync = mutation({
  handler: async (ctx): Promise<void> => {
    // Mark all pending items with a low priority to effectively pause them
    const pending = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
      
    for (const item of pending) {
      await ctx.db.patch(item._id, {
        priority: -1, // Negative priority indicates paused
      });
    }
    
    console.log(`⏸️ Paused bulk sync - ${pending.length} items marked`);
  },
});

// Resume bulk sync
export const resumeBulkSync = action({
  handler: async (ctx): Promise<{ resumed: number }> => {
    // Unmark paused items
    await ctx.runMutation(api.bulkSync.unmarkPausedItems);
    
    // Resume processing
    const result = await ctx.runAction(api.geoScraperProcessor.processQueue, {
      maxItems: 20,
    });
    
    return {
      resumed: result.processed,
    };
  },
});

// Unmark paused items
export const unmarkPausedItems = mutation({
  handler: async (ctx): Promise<number> => {
    const paused = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("priority"), -1) // Negative priority indicates paused
        )
      )
      .collect();
      
    let count = 0;
    for (const item of paused) {
      // Restore original priority based on plan tier
      const business = await ctx.db.get(item.businessId);
      const priorityMap: Record<string, number> = {
        power: 10,
        pro: 7,
        starter: 5,
        free: 3,
      };
      
      await ctx.db.patch(item._id, {
        priority: business ? (priorityMap[business.planTier] || 5) : 5,
      });
      count++;
    }
    
    return count;
  },
});

// Cancel bulk sync
export const cancelBulkSync = mutation({
  handler: async (ctx): Promise<{ cancelled: number }> => {
    // Remove all pending items from queue
    const pending = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
      
    let cancelled = 0;
    for (const item of pending) {
      await ctx.db.delete(item._id);
      cancelled++;
    }
    
    console.log(`🛑 Cancelled bulk sync - removed ${cancelled} items from queue`);
    
    return { cancelled };
  },
});

// Retry failed sync items
export const retryFailedSyncs = mutation({
  handler: async (ctx): Promise<{ retried: number }> => {
    // Get all failed items from the last 24 hours
    const failedItems = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "failed"),
          q.gte(q.field("failedAt"), Date.now() - 24 * 60 * 60 * 1000)
        )
      )
      .collect();
    
    let retried = 0;
    for (const item of failedItems) {
      // Reset the item to pending status with original priority
      await ctx.db.patch(item._id, {
        status: "pending",
        retryCount: 0,
        failedAt: undefined,
        lastError: undefined,
        lastErrorAt: undefined,
      });
      retried++;
    }
    
    console.log(`♻️ Retrying ${retried} failed sync items`);
    
    return { retried };
  },
});

// Get recent sync errors for debugging
export const getRecentSyncErrors = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<any>> => {
    const limit = args.limit || 10;
    
    // First try to get failed items
    let items = await ctx.db
      .query("reviewSyncQueue")
      .filter((q) => q.eq(q.field("status"), "failed"))
      .order("desc")
      .take(limit);
      
    // If no failed items, get items with errors
    if (items.length === 0) {
      items = await ctx.db
        .query("reviewSyncQueue")
        .filter((q) => q.neq(q.field("lastError"), undefined))
        .order("desc")
        .take(limit);
    }
      
    console.log(`Found ${items.length} items with errors, first few:`, items.slice(0, 3));
      
    // Get business names for each failed item
    const errors = await Promise.all(
      items.map(async (item) => {
        const business = await ctx.db.get(item.businessId);
        return {
          businessName: business?.name || "Unknown",
          placeId: item.placeId,
          error: item.lastError || "No error message",
          failedAt: item.failedAt || item.lastErrorAt || item.requestedAt,
          retryCount: item.retryCount,
          status: item.status,
        };
      })
    );
    
    return errors;
  },
});

// Get bulk sync history
export const getBulkSyncHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<any>> => {
    const limit = args.limit || 10;
    
    // Group sync logs by time window to identify bulk operations
    const logs = await ctx.db
      .query("reviewSyncLogs")
      .order("desc")
      .take(limit * 10); // Get more to group them
      
    // Group by 5-minute windows
    const grouped: Map<number, any[]> = new Map();
    
    for (const log of logs) {
      const window = Math.floor(log.syncStarted / (5 * 60 * 1000));
      if (!grouped.has(window)) {
        grouped.set(window, []);
      }
      grouped.get(window)!.push(log);
    }
    
    // Convert to bulk sync entries
    const bulkSyncs = Array.from(grouped.entries())
      .filter(([_, logs]) => logs.length >= 5) // At least 5 syncs in window
      .map(([window, logs]) => {
        const successful = logs.filter(l => l.status === "success").length;
        const failed = logs.filter(l => l.status === "failed").length;
        const totalReviews = logs.reduce((sum, l) => sum + (l.reviewsImported || 0), 0);
        
        return {
          startTime: window * 5 * 60 * 1000,
          endTime: Math.max(...logs.map(l => l.syncCompleted || l.syncStarted)),
          businessCount: logs.length,
          successful,
          failed,
          totalReviews,
        };
      })
      .slice(0, limit);
      
    return bulkSyncs;
  },
});