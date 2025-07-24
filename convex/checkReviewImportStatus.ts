import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Check the import status of specific businesses and their reviews
 */
export const checkBusinessesAndReviews = query({
  args: {
    placeIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const placeId of args.placeIds) {
      // Find business by placeId
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_placeId", (q) => q.eq("placeId", placeId))
        .first();
      
      if (!business) {
        results.push({
          placeId,
          status: "business_not_found",
          businessName: null,
          businessId: null,
          reviewCount: 0,
          reviews: [],
        });
        continue;
      }
      
      // Get reviews for this business
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .collect();
      
      // Get a sample of reviews (first 5)
      const sampleReviews = reviews.slice(0, 5).map(r => ({
        reviewId: r.reviewId,
        userName: r.userName,
        rating: r.rating,
        source: r.source,
        createdAt: r.createdAt,
        commentPreview: r.comment.substring(0, 100) + "...",
      }));
      
      results.push({
        placeId,
        status: "found",
        businessName: business.name,
        businessId: business._id,
        businessSlug: business.slug,
        businessUrlPath: business.urlPath,
        storedReviewCount: business.reviewCount,
        actualReviewCount: reviews.length,
        reviewCountMismatch: business.reviewCount !== reviews.length,
        reviews: sampleReviews,
        reviewSources: reviews.reduce((acc, r) => {
          acc[r.source] = (acc[r.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      });
    }
    
    // Summary stats
    const summary = {
      totalBusinessesChecked: args.placeIds.length,
      businessesFound: results.filter(r => r.status === "found").length,
      businessesNotFound: results.filter(r => r.status === "business_not_found").length,
      totalReviewsFound: results.reduce((sum, r) => sum + (r.actualReviewCount || 0), 0),
      businessesWithReviews: results.filter(r => (r.actualReviewCount || 0) > 0).length,
      businessesWithoutReviews: results.filter(r => r.status === "found" && r.actualReviewCount === 0).length,
      businessesWithMismatchedCounts: results.filter(r => r.reviewCountMismatch).length,
    };
    
    return {
      summary,
      businesses: results,
    };
  },
});

/**
 * Check for duplicate reviews by reviewId
 */
export const checkDuplicateReviews = query({
  args: {
    reviewIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const duplicates = [];
    const notFound = [];
    
    for (const reviewId of args.reviewIds) {
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_review_id", (q) => q.eq("reviewId", reviewId))
        .collect();
      
      if (reviews.length === 0) {
        notFound.push(reviewId);
      } else if (reviews.length > 1) {
        // Found duplicates
        const businessNames = await Promise.all(
          reviews.map(async (r) => {
            const business = await ctx.db.get(r.businessId);
            return business?.name || "Unknown";
          })
        );
        
        duplicates.push({
          reviewId,
          count: reviews.length,
          businesses: businessNames,
          reviews: reviews.map(r => ({
            id: r._id,
            userName: r.userName,
            rating: r.rating,
            source: r.source,
          })),
        });
      }
    }
    
    return {
      totalChecked: args.reviewIds.length,
      duplicatesFound: duplicates.length,
      notFound: notFound.length,
      duplicates,
      notFoundIds: notFound,
    };
  },
});

/**
 * Get all businesses with placeId and their review counts
 */
export const getAllBusinessesWithPlaceId = query({
  handler: async (ctx) => {
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.neq(q.field("placeId"), undefined))
      .collect();
    
    const businessData = await Promise.all(
      businesses.map(async (business) => {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", business._id))
          .collect();
        
        return {
          name: business.name,
          placeId: business.placeId,
          businessId: business._id,
          urlPath: business.urlPath,
          storedReviewCount: business.reviewCount,
          actualReviewCount: reviews.length,
          mismatch: business.reviewCount !== reviews.length,
        };
      })
    );
    
    // Sort by actual review count descending
    businessData.sort((a, b) => b.actualReviewCount - a.actualReviewCount);
    
    return {
      totalBusinesses: businessData.length,
      businessesWithReviews: businessData.filter(b => b.actualReviewCount > 0).length,
      businessesWithMismatch: businessData.filter(b => b.mismatch).length,
      businesses: businessData,
    };
  },
});