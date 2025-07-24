import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Daily review sync job - prioritizes by plan tier and last sync time
export const dailyReviewSync = action({
  handler: async (ctx): Promise<{
    businessesFound: number;
    addedToQueue: number;
    processed: number;
    failed: number;
    remaining: number;
  } | { message: string }> => {
    console.log("🔄 Starting daily review sync...");
    
    // Get businesses that need syncing
    const businesses = await ctx.runQuery(api.reviewSync.getBusinessesForSync, {
      limit: 100, // Process up to 100 businesses per run
    });
    
    console.log(`📊 Found ${businesses.length} businesses to sync`);
    
    if (businesses.length === 0) {
      return { message: "No businesses to sync" };
    }
    
    // Add businesses to sync queue
    const queueResult = await ctx.runMutation(api.geoScraperQueue.bulkAddToQueue, {
      businesses: businesses.map((b: any) => ({
        businessId: b._id,
        placeId: b.placeId!,
      })),
      priority: 5, // Default priority for scheduled syncs
    });
    
    console.log(`✅ Added ${queueResult.added} businesses to sync queue`);
    
    // Start processing the queue
    const processResult = await ctx.runAction(api.geoScraperProcessor.processQueue, {
      maxItems: 20, // Process up to 20 items
    });
    
    console.log(`📦 Processed ${processResult.processed} items from queue`);
    
    return {
      businessesFound: businesses.length,
      addedToQueue: queueResult.added,
      processed: processResult.processed,
      failed: processResult.failed,
      remaining: processResult.remaining,
    };
  },
});

// Hourly queue refill - adds businesses to keep queue running overnight
export const hourlyQueueRefill = action({
  handler: async (ctx): Promise<{
    currentQueueDepth: number;
    businessesAdded: number;
    message: string;
  }> => {
    console.log("🔄 Starting hourly queue refill...");
    
    // Check current queue status
    const queueStatus = await ctx.runQuery(api.geoScraperQueue.getQueueStatus);
    console.log(`📊 Current queue depth: ${queueStatus.pendingCount}`);
    
    // Only add more if queue is getting low (less than 500 pending for overnight)
    if (queueStatus.pendingCount >= 500) {
      return {
        currentQueueDepth: queueStatus.pendingCount,
        businessesAdded: 0,
        message: `Queue has sufficient items (${queueStatus.pendingCount}), skipping refill`,
      };
    }
    
    // Calculate how many to add (target 600 in queue for overnight processing)
    const targetToAdd = Math.min(600 - queueStatus.pendingCount, 300);
    
    // Get businesses that need syncing (including those with existing reviews)
    const businesses = await ctx.runQuery(api.reviewSync.getBusinessesForSync, {
      limit: targetToAdd,
      includeExisting: true, // Include businesses that already have reviews
    });
    
    console.log(`📊 Found ${businesses.length} businesses to add`);
    
    if (businesses.length === 0) {
      return {
        currentQueueDepth: queueStatus.pendingCount,
        businessesAdded: 0,
        message: "No businesses available to add",
      };
    }
    
    // Add businesses to sync queue in smaller batches to avoid document limits
    let totalAdded = 0;
    const batchSize = 50;
    
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      const queueResult = await ctx.runMutation(api.geoScraperQueue.bulkAddToQueue, {
        businesses: batch.map((b: any) => ({
          businessId: b._id,
          placeId: b.placeId!,
        })),
        priority: 7, // Higher priority for overnight processing
      });
      totalAdded += queueResult.added;
    }
    
    console.log(`✅ Added ${totalAdded} businesses to sync queue`);
    
    return {
      currentQueueDepth: queueStatus.pendingCount + totalAdded,
      businessesAdded: totalAdded,
      message: `Successfully added ${totalAdded} businesses to queue`,
    };
  },
});

// Get businesses that need review syncing
export const getBusinessesForSync = query({
  args: {
    limit: v.optional(v.number()),
    includeExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Array<any>> => {
    const limit = args.limit || 50;
    const includeExisting = args.includeExisting || false;
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Get businesses with place IDs using limit to avoid document limit errors
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => 
        q.and(
          q.neq(q.field("placeId"), undefined),
          q.neq(q.field("geoScraperSyncEnabled"), false),
          q.eq(q.field("active"), true)
        )
      )
      .take(limit * 2); // Take more than needed for filtering and sorting
    
    // Sort by priority (Power > Pro > Starter > Free) and last sync time
    const priorityMap: Record<string, number> = {
      power: 4,
      pro: 3,
      starter: 2,
      free: 1,
    };
    
    const sortedBusinesses = businesses
      .filter(b => {
        // Skip if currently syncing
        if (b.syncStatus === "syncing") {
          return false;
        }
        
        // If includeExisting is true, don't filter by last sync time
        if (includeExisting) {
          return true;
        }
        
        // Skip if synced recently (only when not including existing)
        if (b.lastReviewSync && b.lastReviewSync > twentyFourHoursAgo) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // First sort by plan tier
        const aPriority = priorityMap[a.planTier] || 0;
        const bPriority = priorityMap[b.planTier] || 0;
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Then by last sync time (never synced first)
        const aLastSync = a.lastReviewSync || 0;
        const bLastSync = b.lastReviewSync || 0;
        return aLastSync - bLastSync;
      })
      .slice(0, limit);
    
    return sortedBusinesses;
  },
});

// Mark business sync as started
export const markSyncStarted = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args): Promise<any> => {
    await ctx.db.patch(args.businessId, {
      syncStatus: "syncing",
      lastSyncError: undefined,
    });
    
    // Create sync log entry
    const logId = await ctx.db.insert("reviewSyncLogs", {
      businessId: args.businessId,
      syncStarted: Date.now(),
      reviewsFetched: 0,
      reviewsFiltered: 0,
      reviewsImported: 0,
      reviewsDuplicate: 0,
      status: "failed", // Will be updated on completion
    });
    
    return logId;
  },
});

// Mark business sync as completed
export const markSyncCompleted = mutation({
  args: {
    businessId: v.id("businesses"),
    logId: v.id("reviewSyncLogs"),
    results: v.object({
      fetched: v.number(),
      filtered: v.number(),
      imported: v.number(),
      duplicates: v.number(),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    // Update business
    await ctx.db.patch(args.businessId, {
      syncStatus: "idle",
      lastReviewSync: Date.now(),
      lastSyncError: undefined,
    });
    
    // Update sync log
    await ctx.db.patch(args.logId, {
      syncCompleted: Date.now(),
      reviewsFetched: args.results.fetched,
      reviewsFiltered: args.results.filtered,
      reviewsImported: args.results.imported,
      reviewsDuplicate: args.results.duplicates,
      status: "success",
    });
  },
});

// Mark business sync as failed
export const markSyncFailed = mutation({
  args: {
    businessId: v.id("businesses"),
    logId: v.optional(v.id("reviewSyncLogs")),
    error: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    // Update business
    await ctx.db.patch(args.businessId, {
      syncStatus: "error",
      lastSyncError: args.error,
    });
    
    // Update sync log if exists
    if (args.logId) {
      await ctx.db.patch(args.logId, {
        syncCompleted: Date.now(),
        error: args.error,
        status: "failed",
      });
    }
  },
});

// Manual sync for a single business
export const syncBusinessReviews = action({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get business details
    const business = await ctx.runQuery(api.businesses.getBusinessById, {
      businessId: args.businessId,
    });
    
    if (!business) {
      throw new Error("Business not found");
    }
    
    if (!business.placeId) {
      throw new Error("Business has no Place ID");
    }
    
    console.log(`🔄 Manual sync requested for ${business.name}`);
    
    // Mark sync started
    const logId = await ctx.runMutation(api.reviewSync.markSyncStarted, {
      businessId: args.businessId,
    });
    
    try {
      // Fetch and import reviews (limit to 200 per business)
      const result = await ctx.runAction(api.geoScraperAPI.fetchAndImportReviews, {
        businessId: args.businessId,
        placeId: business.placeId,
        maxReviews: 200, // Limit to 200 reviews for efficiency
      });
      
      if (result.success) {
        // Mark sync completed
        await ctx.runMutation(api.reviewSync.markSyncCompleted, {
          businessId: args.businessId,
          logId,
          results: {
            fetched: result.fetched || 0,
            filtered: result.filtered || 0,
            imported: result.imported || 0,
            duplicates: result.duplicates || 0,
          },
        });
        
        console.log(`✅ Sync completed for ${business.name}`);
      } else {
        // Mark sync failed
        await ctx.runMutation(api.reviewSync.markSyncFailed, {
          businessId: args.businessId,
          logId,
          error: result.error || "Unknown error",
        });
        
        console.log(`❌ Sync failed for ${business.name}: ${result.error}`);
      }
      
      return result;
    } catch (error: any) {
      // Mark sync failed
      await ctx.runMutation(api.reviewSync.markSyncFailed, {
        businessId: args.businessId,
        logId,
        error: error.message,
      });
      
      throw error;
    }
  },
});

// Get sync history for a business
export const getBusinessSyncHistory = query({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<any>> => {
    const limit = args.limit || 10;
    
    const logs = await ctx.db
      .query("reviewSyncLogs")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(limit);
    
    return logs;
  },
});

// Get recent sync activity
export const getRecentSyncActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<any>> => {
    const limit = args.limit || 20;
    
    const logs = await ctx.db
      .query("reviewSyncLogs")
      .order("desc")
      .take(limit);
    
    // Get business names
    const logsWithBusinesses = await Promise.all(
      logs.map(async (log) => {
        const business = await ctx.db.get(log.businessId);
        return {
          ...log,
          businessName: business?.name || "Unknown",
        };
      })
    );
    
    return logsWithBusinesses;
  },
});

// Toggle sync enabled for a business
export const toggleBusinessSync = mutation({
  args: {
    businessId: v.id("businesses"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.businessId, {
      geoScraperSyncEnabled: args.enabled,
    });
  },
});