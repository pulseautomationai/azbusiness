import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Super simple mutation that syncs review counts for a small number of businesses
export const syncNextBatch = mutation({
  args: {},
  handler: async (ctx) => {
    // Get just 3 businesses that might have wrong review counts
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("reviewCount"), 0)) // Focus on businesses showing 0 reviews
      .take(3);
    
    if (businesses.length === 0) {
      // Try businesses with any review count
      const allBusinesses = await ctx.db
        .query("businesses")
        .take(3);
      
      if (allBusinesses.length === 0) {
        return {
          message: "No businesses found",
          updated: 0,
          checked: 0,
        };
      }
      
      businesses.push(...allBusinesses);
    }
    
    let updated = 0;
    const details = [];
    
    for (const business of businesses) {
      // Count actual reviews
      const reviews = await ctx.db
        .query("reviews")
        .filter((q) => q.eq(q.field("businessId"), business._id))
        .collect();
      
      const actualCount = reviews.length;
      
      // Calculate average rating
      let averageRating = 0;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
      }
      
      // Update if different
      if (business.reviewCount !== actualCount || business.rating !== averageRating) {
        await ctx.db.patch(business._id, {
          reviewCount: actualCount,
          rating: averageRating,
          updatedAt: Date.now(),
        });
        
        updated++;
        details.push({
          name: business.name,
          oldCount: business.reviewCount,
          newCount: actualCount,
          oldRating: business.rating,
          newRating: averageRating,
        });
      }
    }
    
    return {
      message: "Batch processed",
      updated,
      checked: businesses.length,
      details,
    };
  },
});