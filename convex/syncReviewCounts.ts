import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Query to get businesses with mismatched review counts
export const getBusinessesWithMismatchedCounts = query({
  args: { 
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 50); // Cap at 50 to avoid query limits
    const offset = args.offset || 0;
    
    // Get businesses with pagination
    const allBusinesses = await ctx.db.query("businesses").collect();
    const businesses = allBusinesses.slice(offset, offset + limit);
    
    const mismatches = [];
    
    for (const business of businesses) {
      // Count reviews more efficiently
      let actualCount = 0;
      
      // First check if any reviews exist
      const hasReviews = await ctx.db
        .query("reviews")
        .filter((q) => q.eq(q.field("businessId"), business._id))
        .first();
      
      if (hasReviews || business.reviewCount > 0) {
        // Only count all reviews if there's a potential mismatch
        const reviews = await ctx.db
          .query("reviews")
          .filter((q) => q.eq(q.field("businessId"), business._id))
          .collect();
        actualCount = reviews.length;
      }
      
      const storedCount = business.reviewCount;
      
      if (actualCount !== storedCount) {
        mismatches.push({
          businessId: business._id,
          businessName: business.name,
          storedCount,
          actualCount,
          difference: actualCount - storedCount,
        });
      }
    }
    
    return {
      total: businesses.length,
      totalBusinesses: allBusinesses.length,
      offset,
      mismatches: mismatches.length,
      businesses: mismatches,
      hasMore: offset + limit < allBusinesses.length,
    };
  },
});

// Mutation to sync review count for a single business
export const syncBusinessReviewCount = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    // Get the business
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    
    // Count actual reviews
    const reviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
    
    const actualCount = reviews.length;
    const oldCount = business.reviewCount;
    
    // Calculate average rating while we're at it
    let averageRating = business.rating;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    }
    
    // Update the business
    await ctx.db.patch(args.businessId, {
      reviewCount: actualCount,
      rating: averageRating,
      updatedAt: Date.now(),
    });
    
    return {
      businessId: args.businessId,
      businessName: business.name,
      oldCount,
      newCount: actualCount,
      oldRating: business.rating,
      newRating: averageRating,
      updated: oldCount !== actualCount || business.rating !== averageRating,
    };
  },
});

// Mutation to sync all business review counts
export const syncAllBusinessReviewCounts = mutation({
  args: {
    batchSize: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(args.batchSize || 10, 20); // Smaller batches to avoid query limits
    const offset = args.offset || 0;
    
    // Get businesses with proper pagination - don't fetch all at once
    const businesses = await ctx.db
      .query("businesses")
      .order("asc")
      .take(batchSize);
    
    const results = {
      total: businesses.length,
      updated: 0,
      errors: 0,
      details: [] as any[],
      hasMore: businesses.length === batchSize, // If we got a full batch, there might be more
      nextOffset: offset + batchSize,
    };
    
    for (const business of businesses) {
      try {
        // Count actual reviews more efficiently
        let actualCount = 0;
        let averageRating = business.rating;
        
        // First check if any reviews exist
        const hasReviews = await ctx.db
          .query("reviews")
          .filter((q) => q.eq(q.field("businessId"), business._id))
          .first();
        
        if (hasReviews || business.reviewCount > 0) {
          // Only fetch all reviews if needed
          const reviews = await ctx.db
            .query("reviews")
            .filter((q) => q.eq(q.field("businessId"), business._id))
            .collect();
          
          actualCount = reviews.length;
          
          // Calculate average rating
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
          }
        }
        
        const oldCount = business.reviewCount;
        
        // Update if needed
        if (oldCount !== actualCount || business.rating !== averageRating) {
          await ctx.db.patch(business._id, {
            reviewCount: actualCount,
            rating: averageRating,
            updatedAt: Date.now(),
          });
          
          results.updated++;
          results.details.push({
            businessName: business.name,
            oldCount,
            newCount: actualCount,
            oldRating: business.rating,
            newRating: averageRating,
          });
        }
      } catch (error) {
        results.errors++;
        console.error(`Error syncing business ${business._id}:`, error);
      }
    }
    
    return results;
  },
});

// Query to get sync status
export const getSyncStatus = query({
  handler: async (ctx) => {
    // Sample businesses to check - reduced to avoid query limit
    const sampleSize = 20;
    const businesses = await ctx.db.query("businesses").take(sampleSize);
    
    let correctCount = 0;
    let incorrectCount = 0;
    let totalStoredReviews = 0;
    let totalActualReviews = 0;
    
    for (const business of businesses) {
      // Count reviews without fetching all of them
      const reviewsQuery = ctx.db
        .query("reviews")
        .filter((q) => q.eq(q.field("businessId"), business._id));
      
      // Take just 1 to check if any exist, then use a counter
      const firstReview = await reviewsQuery.first();
      let actualCount = 0;
      
      if (firstReview) {
        // If there are reviews, count them in batches
        const allReviews = await reviewsQuery.collect();
        actualCount = allReviews.length;
      }
      
      totalStoredReviews += business.reviewCount;
      totalActualReviews += actualCount;
      
      if (actualCount === business.reviewCount) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
    
    return {
      sampleSize,
      correctCount,
      incorrectCount,
      accuracy: sampleSize > 0 ? Math.round((correctCount / sampleSize) * 100) : 0,
      totalStoredReviews,
      totalActualReviews,
      discrepancy: totalActualReviews - totalStoredReviews,
    };
  },
});

// Mutation to sync review counts for businesses with specific IDs
export const syncSpecificBusinesses = mutation({
  args: {
    businessIds: v.array(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const businessId of args.businessIds) {
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
      let averageRating = business.rating;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
      }
      
      // Update the business
      await ctx.db.patch(businessId, {
        reviewCount: actualCount,
        rating: averageRating,
        updatedAt: Date.now(),
      });
      
      results.push({
        businessId,
        businessName: business.name,
        oldCount,
        newCount: actualCount,
        oldRating: business.rating,
        newRating: averageRating,
      });
    }
    
    return results;
  },
});