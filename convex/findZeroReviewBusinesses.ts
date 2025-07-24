import { v } from "convex/values";
import { query } from "./_generated/server";

// Find businesses with zero reviews not in queue
export const findBusinessesWithZeroReviews = query({
  args: {
    limit: v.optional(v.number()),
    excludeInQueue: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const excludeInQueue = args.excludeInQueue !== false;
    
    console.log(`🔍 Searching for businesses with zero reviews...`);
    
    // First, get businesses that are in the queue to exclude them
    let businessIdsInQueue = new Set<string>();
    
    if (excludeInQueue) {
      // Get all pending/processing items from queue
      const queueItems = await ctx.db
        .query("reviewSyncQueue")
        .filter((q) => 
          q.or(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("status"), "processing")
          )
        )
        .take(5000); // Get a reasonable number
      
      businessIdsInQueue = new Set(queueItems.map(item => item.businessId));
      console.log(`📋 Found ${businessIdsInQueue.size} businesses already in queue`);
    }
    
    // Get businesses with zero review count
    const candidates = await ctx.db
      .query("businesses")
      .filter((q) => 
        q.and(
          q.eq(q.field("active"), true),
          q.neq(q.field("placeId"), undefined),
          q.or(
            q.eq(q.field("reviewCount"), 0),
            q.eq(q.field("reviewCount"), undefined)
          )
        )
      )
      .take(limit * 3); // Take extra to account for filtering
    
    console.log(`🔍 Found ${candidates.length} businesses with zero reviews`);
    
    // Filter out businesses already in queue
    const filteredBusinesses = candidates.filter(business => {
      if (excludeInQueue && businessIdsInQueue.has(business._id)) {
        return false;
      }
      return true;
    });
    
    console.log(`✅ ${filteredBusinesses.length} businesses not in queue`);
    
    // Sort by priority (Power > Pro > Starter > Free) and creation time
    const priorityMap: Record<string, number> = {
      power: 4,
      pro: 3,
      starter: 2,
      free: 1,
    };
    
    const sortedBusinesses = filteredBusinesses
      .sort((a, b) => {
        // First sort by plan tier
        const aPriority = priorityMap[a.planTier || 'free'] || 0;
        const bPriority = priorityMap[b.planTier || 'free'] || 0;
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Then by creation time (older first)
        return a._creationTime - b._creationTime;
      })
      .slice(0, limit);
    
    // Get some stats
    const stats = {
      totalZeroReviews: candidates.length,
      inQueue: businessIdsInQueue.size,
      available: filteredBusinesses.length,
      returned: sortedBusinesses.length,
      byTier: {
        power: sortedBusinesses.filter(b => b.planTier === 'power').length,
        pro: sortedBusinesses.filter(b => b.planTier === 'pro').length,
        starter: sortedBusinesses.filter(b => b.planTier === 'starter').length,
        free: sortedBusinesses.filter(b => !b.planTier || b.planTier === 'free').length,
      }
    };
    
    console.log(`📊 Stats:`, stats);
    
    return {
      businesses: sortedBusinesses,
      stats
    };
  },
});

// Find businesses that have never been synced
export const findNeverSyncedBusinesses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    // Get businesses that have never been synced
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => 
        q.and(
          q.eq(q.field("active"), true),
          q.neq(q.field("placeId"), undefined),
          q.eq(q.field("lastReviewSync"), undefined)
        )
      )
      .take(limit);
    
    console.log(`🔍 Found ${businesses.length} businesses never synced`);
    
    // Sort by plan tier
    const priorityMap: Record<string, number> = {
      power: 4,
      pro: 3,
      starter: 2,
      free: 1,
    };
    
    const sortedBusinesses = businesses
      .sort((a, b) => {
        const aPriority = priorityMap[a.planTier || 'free'] || 0;
        const bPriority = priorityMap[b.planTier || 'free'] || 0;
        return bPriority - aPriority;
      });
    
    return {
      businesses: sortedBusinesses,
      total: businesses.length
    };
  },
});