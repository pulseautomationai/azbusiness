import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all active categories
export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    
    // Sort by order
    categories.sort((a, b) => a.order - b.order);
    
    return categories;
  },
});

// Get category by slug
export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("active"), true))
      .first();
  },
});

// Get categories with business count
export const getCategoriesWithCount = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    
    // Get business count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const businesses = await ctx.db
          .query("businesses")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .filter((q) => q.eq(q.field("active"), true))
          .collect();
        
        return {
          ...category,
          businessCount: businesses.length,
        };
      })
    );
    
    // Sort by order
    categoriesWithCount.sort((a, b) => a.order - b.order);
    
    return categoriesWithCount;
  },
});