import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Process a single queue item
export const processQueueItem = action({
  args: {
    queueId: v.id("reviewSyncQueue"),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Get the queue item
      const queueItem = await ctx.runQuery(api.geoScraperProcessor.getQueueItem, {
        queueId: args.queueId,
      });
      
      if (!queueItem) {
        throw new Error("Queue item not found");
      }
      
      if (queueItem.status !== "pending") {
        console.log(`Queue item ${args.queueId} is not pending (status: ${queueItem.status})`);
        return { skipped: true, reason: "Not pending" };
      }
      
      // Mark as processing
      await ctx.runMutation(api.geoScraperQueue.markAsProcessing, {
        queueId: args.queueId,
      });
      
      console.log(`🔄 Processing review sync for business ${queueItem.businessId}`);
      
      // Mark sync started
      const logId = await ctx.runMutation(api.reviewSync.markSyncStarted, {
        businessId: queueItem.businessId,
      });
      
      // Fetch and import reviews (limit to 200 per business)
      const result = await ctx.runAction(api.geoScraperAPI.fetchAndImportReviews, {
        businessId: queueItem.businessId,
        placeId: queueItem.placeId,
        maxReviews: 200, // Limit to 200 reviews for efficiency
      });
      
      if (result.success) {
        // Mark queue as completed
        await ctx.runMutation(api.geoScraperQueue.markAsCompleted, {
          queueId: args.queueId,
          results: {
            fetched: result.fetched || 0,
            filtered: result.filtered || 0,
            imported: result.imported || 0,
            skipped: result.skipped || 0,
          },
        });
        
        // Mark sync as completed
        await ctx.runMutation(api.reviewSync.markSyncCompleted, {
          businessId: queueItem.businessId,
          logId,
          results: {
            fetched: result.fetched || 0,
            filtered: result.filtered || 0,
            imported: result.imported || 0,
            duplicates: result.duplicates || 0,
          },
        });
        
        console.log(`✅ Completed sync for business ${queueItem.businessId}: ${result.imported} imported`);
      } else {
        // Mark queue as failed
        await ctx.runMutation(api.geoScraperQueue.markAsFailed, {
          queueId: args.queueId,
          error: result.error || "Unknown error",
        });
        
        // Mark sync as failed
        await ctx.runMutation(api.reviewSync.markSyncFailed, {
          businessId: queueItem.businessId,
          logId,
          error: result.error || "Unknown error",
        });
        
        console.log(`❌ Failed sync for business ${queueItem.businessId}: ${result.error}`);
      }
      
      return result;
    } catch (error: any) {
      console.error(`❌ Error processing queue item ${args.queueId}:`, error);
      
      // Try to mark as failed
      try {
        await ctx.runMutation(api.geoScraperQueue.markAsFailed, {
          queueId: args.queueId,
          error: error.message,
        });
      } catch (updateError) {
        console.error("Failed to update queue status:", updateError);
      }
      
      throw error;
    }
  },
});

// Process multiple queue items respecting concurrency limits
export const processQueue = action({
  args: {
    maxItems: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    const maxItems = args.maxItems || 10;
    
    console.log(`🚀 Starting queue processing (max items: ${maxItems})`);
    
    // Get queue status
    const status = await ctx.runQuery(api.geoScraperQueue.getQueueStatus);
    console.log(`📊 Queue status: ${status.pendingCount} pending, ${status.processingCount} processing`);
    
    // Record queue depth metric
    await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
      type: "queue_depth",
      value: status.pendingCount,
      metadata: { processingCount: status.processingCount },
    });
    
    if (status.processingCount >= 3) {
      console.log(`⚠️ Already at max concurrent connections (${status.processingCount}/3)`);
      return {
        processed: 0,
        reason: "Max concurrent connections reached",
      };
    }
    
    // Get next items to process
    const nextItems = await ctx.runQuery(api.geoScraperQueue.getNextQueueItems, {
      limit: Math.min(maxItems, 3 - status.processingCount),
    });
    
    if (nextItems.length === 0) {
      console.log("📭 No items to process");
      return {
        processed: 0,
        reason: "Queue empty",
      };
    }
    
    console.log(`📦 Processing ${nextItems.length} items`);
    
    // Process items in parallel (respecting concurrency limit)
    const results = await Promise.allSettled(
      nextItems.map((item: any) => 
        ctx.runAction(api.geoScraperProcessor.processQueueItem, {
          queueId: item._id,
        })
      )
    );
    
    // Count successes and failures
    const processed = results.filter((r: PromiseSettledResult<any>) => r.status === "fulfilled").length;
    const failed = results.filter((r: PromiseSettledResult<any>) => r.status === "rejected").length;
    
    console.log(`✅ Processed ${processed} items, ${failed} failed`);
    
    // Check if there are more items to process
    const remainingStatus = await ctx.runQuery(api.geoScraperQueue.getQueueStatus);
    
    return {
      processed,
      failed,
      remaining: remainingStatus.pendingCount,
      processing: remainingStatus.processingCount,
    };
  },
});

// Add helper query to get a single queue item
export const getQueueItem = query({
  args: {
    queueId: v.id("reviewSyncQueue"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.queueId);
  },
});