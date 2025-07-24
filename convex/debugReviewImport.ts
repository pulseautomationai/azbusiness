import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Debug function to test review import with a single review
 */
export const debugSingleReviewImport = mutation({
  args: {
    reviewId: v.string(),
    businessName: v.string(), 
    userName: v.string(),
    comment: v.string(),
    rating: v.number(),
    placeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`\n🔧 DEBUG: Testing single review import`);
    console.log(`📝 Review ID: ${args.reviewId}`);
    console.log(`🏢 Business: ${args.businessName}`);
    console.log(`👤 User: ${args.userName}`);
    console.log(`📍 Place ID: ${args.placeId || 'Not provided'}`);
    
    // Step 1: Check if review ID already exists
    const existingById = await ctx.db
      .query("reviews")
      .withIndex("by_review_id", (q) => q.eq("reviewId", args.reviewId))
      .first();
    
    if (existingById) {
      console.log(`❌ Review ID ${args.reviewId} already exists!`);
      return { 
        status: "duplicate_id", 
        existingReview: {
          id: existingById._id,
          businessId: existingById.businessId,
          userName: existingById.userName
        }
      };
    } else {
      console.log(`✅ Review ID ${args.reviewId} is unique`);
    }
    
    // Step 2: Find business matches
    const allBusinesses = await ctx.db.query("businesses").collect();
    console.log(`📊 Total businesses in DB: ${allBusinesses.length}`);
    
    // Check place_id match first
    if (args.placeId) {
      const placeMatch = allBusinesses.find(b => b.placeId === args.placeId);
      if (placeMatch) {
        console.log(`✅ Found place_id match: ${placeMatch.name}`);
        
        // Check for similar reviews in this business
        const businessReviews = await ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", placeMatch._id))
          .collect();
          
        console.log(`📊 Existing reviews in this business: ${businessReviews.length}`);
        
        const similarReviews = businessReviews.filter(r => 
          r.userName.toLowerCase() === args.userName.toLowerCase()
        );
        
        console.log(`📊 Reviews from same user: ${similarReviews.length}`);
        
        return {
          status: "ready_to_import",
          business: {
            id: placeMatch._id,
            name: placeMatch.name,
            existingReviews: businessReviews.length,
            sameUserReviews: similarReviews.length
          }
        };
      } else {
        console.log(`❌ No place_id match found for: ${args.placeId}`);
        return { status: "no_business_match", placeId: args.placeId };
      }
    } else {
      console.log(`⚠️ No place_id provided, would fall back to name matching`);
      return { status: "no_place_id" };
    }
  },
});

/**
 * Quick query to check total review count by source
 */
export const debugReviewCounts = query({
  handler: async (ctx) => {
    const allReviews = await ctx.db.query("reviews").collect();
    
    const bySource: Record<string, number> = {};
    const byBusiness: Record<string, number> = {};
    
    for (const review of allReviews) {
      bySource[review.source] = (bySource[review.source] || 0) + 1;
      byBusiness[review.businessId] = (byBusiness[review.businessId] || 0) + 1;
    }
    
    return {
      totalReviews: allReviews.length,
      bySource,
      businessesWithReviews: Object.keys(byBusiness).length,
      topBusinessesByReviewCount: Object.entries(byBusiness)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([businessId, count]) => ({ businessId, reviewCount: count }))
    };
  },
});