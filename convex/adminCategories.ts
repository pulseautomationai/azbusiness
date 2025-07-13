import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Create a new category (admin only)
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Check if slug already exists
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingCategory) {
      throw new Error("A category with this slug already exists");
    }

    // Get the highest order number and add 1 for new category
    const categories = await ctx.db.query("categories").collect();
    const maxOrder = Math.max(...categories.map(c => c.order), 0);
    
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      icon: args.icon,
      order: args.order ?? (maxOrder + 1),
      active: true,
    });

    return categoryId;
  },
});

/**
 * Update an existing category (admin only)
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // If updating slug, check it doesn't conflict with existing
    if (args.slug && args.slug !== category.slug) {
      const existingCategory = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .first();

      if (existingCategory && existingCategory._id !== args.categoryId) {
        throw new Error("A category with this slug already exists");
      }
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.description !== undefined) updates.description = args.description;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.order !== undefined) updates.order = args.order;
    if (args.active !== undefined) updates.active = args.active;

    await ctx.db.patch(args.categoryId, updates);

    return { success: true };
  },
});

/**
 * Delete a category (admin only)
 */
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Check if any businesses are using this category
    const businessesUsingCategory = await ctx.db
      .query("businesses")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    if (businessesUsingCategory.length > 0) {
      throw new Error(`Cannot delete category: ${businessesUsingCategory.length} businesses are using this category`);
    }

    await ctx.db.delete(args.categoryId);

    return { success: true };
  },
});

/**
 * Reorder categories (admin only)
 */
export const reorderCategories = mutation({
  args: {
    categoryOrders: v.array(v.object({
      categoryId: v.id("categories"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Update all categories with new order
    for (const { categoryId, order } of args.categoryOrders) {
      await ctx.db.patch(categoryId, { order });
    }

    return { success: true };
  },
});