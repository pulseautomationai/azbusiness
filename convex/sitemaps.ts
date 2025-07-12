import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active businesses for sitemap generation
export const getAllActiveBusinessesForSitemap = query({
  handler: async (ctx) => {
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Get category info for each business
    const businessesWithCategory = await Promise.all(
      businesses.map(async (business) => {
        const category = business.categoryId 
          ? await ctx.db.get(business.categoryId)
          : null;
        
        return {
          _id: business._id,
          name: business.name,
          city: business.city,
          planTier: business.planTier,
          rating: business.rating,
          updatedAt: business.updatedAt,
          category: category ? {
            name: category.name,
            slug: category.slug
          } : null
        };
      })
    );

    return businessesWithCategory;
  },
});

// Get all active categories
export const getAllActiveCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

// Get all active cities
export const getAllActiveCities = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("cities")
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

// Get all published blog posts for sitemap
export const getAllPublishedPosts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("published"), true))
      .order("desc")
      .collect();
  },
});

// Get sitemap cache status
export const getSitemapCacheStatus = query({
  handler: async (ctx) => {
    const cache = await ctx.db
      .query("sitemapCache")
      .order("desc")
      .first();

    return cache;
  },
});

// Update sitemap cache
export const updateSitemapCache = mutation({
  args: {
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sitemapCache", {
      lastInvalidated: Date.now(),
      reason: args.reason,
      status: "completed",
    });

    return { success: true };
  },
});