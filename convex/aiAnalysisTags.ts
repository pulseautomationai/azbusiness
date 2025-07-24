import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";

// Check if a review already has AI analysis tags
export const checkExistingTags = internalQuery({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const existingTag = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .first();
    
    return existingTag !== null;
  },
});

// Get recent AI analysis tags for monitoring
export const getRecentTags = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const tags = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_analysis_date")
      .order("desc")
      .take(limit);
    
    return tags;
  },
});

// Get tags for a specific review
export const getTagsForReview = query({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .first();
  },
});

// Get all tags for a business
export const getBusinessTags = query({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    return await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(limit);
  },
});