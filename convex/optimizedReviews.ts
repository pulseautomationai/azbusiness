import { v } from "convex/values";
import { query } from "./_generated/server";

// Optimized review query that only fetches essential fields
export const getBusinessReviewsOptimized = query({
  args: { 
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 200); // Allow up to 200 reviews
    const offset = args.offset || 0;
    
    try {
      // Get the business first
      const business = await ctx.db.get(args.businessId);
      if (!business) {
        return { reviews: [], total: 0, businessName: '' };
      }

      // Query reviews with only essential fields to reduce data size
      const allReviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .order("desc")
        .collect();

      // Return only the fields we need for ranking
      const reviews = allReviews.slice(offset, offset + limit).map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment?.substring(0, 500), // Limit comment length
        userName: review.userName?.substring(0, 50), // Limit user name length
        createdAt: review.createdAt,
        verified: review.verified,
      }));

      return {
        reviews,
        total: allReviews.length,
        businessName: business.name,
      };
    } catch (error) {
      console.error("Error in getBusinessReviewsOptimized:", error);
      return { reviews: [], total: 0, businessName: '' };
    }
  },
});

// Get review statistics without fetching full reviews
export const getBusinessReviewStats = query({
  args: { 
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    try {
      const business = await ctx.db.get(args.businessId);
      if (!business) {
        return null;
      }

      // Get all reviews for this business
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .collect();

      // Calculate statistics
      const totalReviews = reviews.length;
      const ratings = reviews.map(r => r.rating);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      // Rating distribution
      const distribution = {
        5: ratings.filter(r => r === 5).length,
        4: ratings.filter(r => r === 4).length,
        3: ratings.filter(r => r === 3).length,
        2: ratings.filter(r => r === 2).length,
        1: ratings.filter(r => r === 1).length,
      };

      // Recent trend (last 30 reviews)
      const recentReviews = reviews.slice(0, 30);
      const recentAvg = recentReviews.length > 0
        ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
        : avgRating;

      return {
        businessId: args.businessId,
        businessName: business.name,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(2)),
        distribution,
        recentTrend: {
          avgRating: parseFloat(recentAvg.toFixed(2)),
          direction: recentAvg > avgRating ? 'improving' : recentAvg < avgRating ? 'declining' : 'stable',
        },
        lastReviewDate: reviews[0]?.createdAt || null,
      };
    } catch (error) {
      console.error("Error in getBusinessReviewStats:", error);
      return null;
    }
  },
});

// Sample reviews for AI analysis - gets a representative sample
export const sampleBusinessReviews = query({
  args: { 
    businessId: v.id("businesses"),
    sampleSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sampleSize = args.sampleSize || 50;
    
    try {
      // Get all review IDs first (lightweight)
      const allReviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .collect();

      const totalReviews = allReviews.length;
      
      if (totalReviews <= sampleSize) {
        // If we have fewer reviews than sample size, return all
        return {
          reviews: allReviews.map(r => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment?.substring(0, 500),
            createdAt: r.createdAt,
          })),
          totalReviews,
          sampleType: 'complete',
        };
      }

      // Sample strategy: Get a mix of recent and distributed reviews
      const sampleIndices = new Set<number>();
      
      // Include 20% most recent reviews
      const recentCount = Math.floor(sampleSize * 0.2);
      for (let i = 0; i < recentCount; i++) {
        sampleIndices.add(i);
      }
      
      // Include reviews distributed across the timeline
      const step = Math.floor(totalReviews / (sampleSize - recentCount));
      for (let i = recentCount; i < sampleSize; i++) {
        const index = Math.min(i * step, totalReviews - 1);
        sampleIndices.add(index);
      }

      // Get the sampled reviews
      const sampledReviews = Array.from(sampleIndices)
        .sort((a, b) => a - b)
        .map(index => ({
          _id: allReviews[index]._id,
          rating: allReviews[index].rating,
          comment: allReviews[index].comment?.substring(0, 500),
          createdAt: allReviews[index].createdAt,
        }));

      return {
        reviews: sampledReviews,
        totalReviews,
        sampleType: 'sampled',
      };
    } catch (error) {
      console.error("Error in sampleBusinessReviews:", error);
      return {
        reviews: [],
        totalReviews: 0,
        sampleType: 'error',
      };
    }
  },
});