import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Simple mutation to sync a batch of businesses by IDs
export const syncBusinessBatch = mutation({
  args: {
    businessIds: v.array(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const results = {
      total: args.businessIds.length,
      updated: 0,
      errors: 0,
      details: [] as any[],
    };
    
    for (const businessId of args.businessIds) {
      try {
        const business = await ctx.db.get(businessId);
        if (!business) continue;
        
        // Count actual reviews
        const reviews = await ctx.db
          .query("reviews")
          .filter((q) => q.eq(q.field("businessId"), businessId))
          .collect();
        
        const actualCount = reviews.length;
        const oldCount = business.reviewCount;
        
        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
        }
        
        // Update if needed
        if (oldCount !== actualCount || business.rating !== averageRating) {
          await ctx.db.patch(businessId, {
            reviewCount: actualCount,
            rating: averageRating,
            updatedAt: Date.now(),
          });
          
          results.updated++;
          results.details.push({
            businessId,
            businessName: business.name,
            oldCount,
            newCount: actualCount,
            oldRating: business.rating,
            newRating: averageRating,
          });
        }
      } catch (error) {
        results.errors++;
        console.error(`Error syncing business ${businessId}:`, error);
      }
    }
    
    return results;
  },
});

// Query to get a batch of business IDs
export const getBusinessIdBatch = query({
  args: {
    batchSize: v.optional(v.number()),
    skipCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(args.batchSize || 10, 20);
    const skipCount = args.skipCount || 0;
    
    // Simple approach - just get businesses starting from skipCount
    const businesses = await ctx.db
      .query("businesses")
      .order("asc")
      .take(batchSize);
    
    // Since Convex doesn't support skip, we'll use a workaround
    // Get more businesses and manually skip
    if (skipCount > 0) {
      // This is not ideal but necessary for now
      // We'll limit how many we can skip to avoid the query limit
      const maxSkip = 100;
      if (skipCount > maxSkip) {
        return {
          businessIds: [],
          nextSkipCount: skipCount,
          hasMore: false,
          error: `Cannot skip more than ${maxSkip} businesses at once`,
        };
      }
      
      // Get skipCount + batchSize businesses
      const allNeeded = await ctx.db
        .query("businesses")
        .order("asc")
        .take(skipCount + batchSize);
      
      // Skip the first skipCount
      const businesses = allNeeded.slice(skipCount);
      
      return {
        businessIds: businesses.map(b => b._id),
        nextSkipCount: skipCount + businesses.length,
        hasMore: businesses.length === batchSize,
      };
    }
    
    return {
      businessIds: businesses.map(b => b._id),
      nextSkipCount: businesses.length,
      hasMore: businesses.length === batchSize,
    };
  },
});

// Simple query to check if there are any businesses with mismatched counts
export const checkForMismatches = query({
  args: {
    sampleSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sampleSize = args.sampleSize || 10;
    const businesses = await ctx.db.query("businesses").take(sampleSize);
    
    let mismatches = 0;
    
    for (const business of businesses) {
      // Quick check - if reviewCount is 0 and we have reviews, it's a mismatch
      if (business.reviewCount === 0) {
        const hasReviews = await ctx.db
          .query("reviews")
          .filter((q) => q.eq(q.field("businessId"), business._id))
          .first();
        
        if (hasReviews) {
          mismatches++;
        }
      }
    }
    
    return {
      sampleSize,
      mismatches,
      hasMismatches: mismatches > 0,
    };
  },
});