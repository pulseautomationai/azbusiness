import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Get all businesses with filters
export const getBusinesses = query({
  args: {
    categorySlug: v.optional(v.string()),
    citySlug: v.optional(v.string()),
    planTier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("power"))),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all businesses that are active
    let businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Apply category filter if provided
    if (args.categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();
      
      if (category) {
        businesses = businesses.filter(b => b.categoryId === category._id);
      }
    }

    // Apply city filter if provided
    if (args.citySlug) {
      const city = await ctx.db
        .query("cities")
        .withIndex("by_slug", (q) => q.eq("slug", args.citySlug!))
        .first();
      
      if (city) {
        // Use case-insensitive comparison and normalize whitespace
        const cityNameLower = city.name.toLowerCase().trim();
        businesses = businesses.filter(b => 
          b.city.toLowerCase().trim() === cityNameLower
        );
      }
    }

    // Apply plan tier filter if provided
    if (args.planTier) {
      businesses = businesses.filter(b => b.planTier === args.planTier);
    }

    // Filter by featured if specified
    if (args.featured !== undefined) {
      businesses = businesses.filter(b => b.featured === args.featured);
    }

    // Sort by priority (descending) and rating (descending)
    businesses.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.rating - a.rating;
    });

    // Apply limit if specified
    if (args.limit) {
      businesses = businesses.slice(0, args.limit);
    }

    // Get category info for each business
    const businessesWithCategory = await Promise.all(
      businesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return {
          ...business,
          category: category || null,
        };
      })
    );

    return businessesWithCategory;
  },
});

// Get single business by ID
export const getBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    
    if (!business || !business.active) return null;

    const category = await ctx.db.get(business.categoryId);
    
    return {
      ...business,
      category: category || null,
    };
  },
});

// Get single business by slug
export const getBusinessBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!business) return null;

    const category = await ctx.db.get(business.categoryId);
    
    return {
      ...business,
      category: category || null,
    };
  },
});

// Get single business by URL path
export const getBusinessByUrlPath = query({
  args: { urlPath: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_url_path", (q) => q.eq("urlPath", args.urlPath))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!business) return null;

    const category = await ctx.db.get(business.categoryId);
    
    return {
      ...business,
      category: category || null,
    };
  },
});

// Get featured businesses for homepage
export const getFeaturedBusinesses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => 
        q.and(
          q.eq(q.field("active"), true),
          q.eq(q.field("featured"), true)
        )
      )
      .collect();

    // Sort by priority and rating
    businesses.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.rating - a.rating;
    });

    // Get top N businesses
    const topBusinesses = businesses.slice(0, limit);

    // Add category info
    const businessesWithCategory = await Promise.all(
      topBusinesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return {
          ...business,
          category: category || null,
        };
      })
    );

    return businessesWithCategory;
  },
});

// Search businesses
export const searchBusinesses = query({
  args: {
    searchTerm: v.string(),
    citySlug: v.optional(v.string()),
    categorySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get category and city IDs if provided
    let categoryId: Id<"categories"> | undefined;
    let cityName: string | undefined;

    if (args.categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();
      categoryId = category?._id;
    }

    if (args.citySlug) {
      const city = await ctx.db
        .query("cities")
        .withIndex("by_slug", (q) => q.eq("slug", args.citySlug!))
        .first();
      cityName = city?.name;
    }

    // Search with filters
    const searchResults = await ctx.db
      .query("businesses")
      .withSearchIndex("search_businesses", (q) => {
        let search = q.search("name", args.searchTerm);
        
        if (cityName) {
          search = search.eq("city", cityName);
        }
        if (categoryId) {
          search = search.eq("categoryId", categoryId);
        }
        search = search.eq("active", true);
        
        return search;
      })
      .collect();

    // Add category info
    const resultsWithCategory = await Promise.all(
      searchResults.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return {
          ...business,
          category: category || null,
        };
      })
    );

    return resultsWithCategory;
  },
});

// Create a new business listing
export const createBusiness = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    urlPath: v.optional(v.string()),
    shortDescription: v.string(),
    description: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    categoryId: v.id("categories"),
    services: v.array(v.string()),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      throw new Error("A business with this slug already exists");
    }

    const businessId = await ctx.db.insert("businesses", {
      ...args,
      logo: undefined,
      heroImage: undefined,
      coordinates: undefined,
      hours: {
        monday: "9:00 AM - 5:00 PM",
        tuesday: "9:00 AM - 5:00 PM",
        wednesday: "9:00 AM - 5:00 PM",
        thursday: "9:00 AM - 5:00 PM",
        friday: "9:00 AM - 5:00 PM",
        saturday: "Closed",
        sunday: "Closed",
      },
      planTier: "free",
      featured: false,
      priority: 0,
      claimed: !!args.ownerId,
      verified: false,
      active: true,
      socialLinks: undefined,
      rating: 0,
      reviewCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return businessId;
  },
});

// Simple business update function for demo purposes
export const updateBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    updates: v.object({
      planTier: v.optional(v.string()),
      claimed: v.optional(v.boolean()),
      verified: v.optional(v.boolean()),
      featured: v.optional(v.boolean()),
      priority: v.optional(v.number()),
      active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.businessId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Update business URLs for migration
export const updateBusinessUrls = mutation({
  args: {
    businessId: v.id("businesses"),
    newSlug: v.string(),
    newUrlPath: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if new slug already exists (avoid duplicates)
    const existingBusiness = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", args.newSlug))
      .first();
    
    if (existingBusiness && existingBusiness._id !== args.businessId) {
      throw new Error(`A business with slug "${args.newSlug}" already exists`);
    }

    // Update the business
    await ctx.db.patch(args.businessId, {
      slug: args.newSlug,
      urlPath: args.newUrlPath,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete a business
export const deleteBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.businessId);
    return { success: true };
  },
});

// Update business featured status
export const updateBusinessFeaturedStatus = mutation({
  args: {
    businessId: v.id("businesses"),
    featured: v.boolean(),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      featured: args.featured,
      updatedAt: Date.now(),
    };

    // Only update priority if provided
    if (args.priority !== undefined) {
      updateData.priority = args.priority;
    }

    await ctx.db.patch(args.businessId, updateData);
    
    // Get the updated business to return
    const business = await ctx.db.get(args.businessId);
    return { success: true, business };
  },
});

// Admin Functions for Phase 5.1
import { api, internal } from "./_generated/api";

/**
 * Get businesses for admin dashboard with filters
 */
export const getBusinessesForAdmin = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    planTier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("power"))),
    claimStatus: v.optional(v.union(v.literal("claimed"), v.literal("unclaimed"))),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    // const adminAccess = await ctx.runQuery(api.admin.checkAdminAccess, {});
    // if (!adminAccess.hasAccess || !adminAccess.permissions.includes("business_management")) {
    //   throw new Error("Admin access required");
    // }

    let businesses = await ctx.db.query("businesses").collect();

    // Apply filters
    if (args.planTier) {
      businesses = businesses.filter(b => b.planTier === args.planTier);
    }

    if (args.claimStatus === "claimed") {
      businesses = businesses.filter(b => b.claimedByUserId);
    } else if (args.claimStatus === "unclaimed") {
      businesses = businesses.filter(b => !b.claimedByUserId);
    }

    if (args.active !== undefined) {
      businesses = businesses.filter(b => b.active === args.active);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      businesses = businesses.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        b.city.toLowerCase().includes(searchLower) ||
        b.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Get category information for each business
    const businessesWithCategories = await Promise.all(
      businesses.map(async (business) => {
        const category = business.categoryId ? await ctx.db.get(business.categoryId) : null;
        return {
          ...business,
          category,
        };
      })
    );

    // Sort by most recently updated
    businessesWithCategories.sort((a, b) => b.updatedAt - a.updatedAt);

    // Limit results
    const limit = args.limit || 50;
    return businessesWithCategories.slice(0, limit);
  },
});

/**
 * Update business status (admin action)
 */
export const updateBusinessStatus = mutation({
  args: {
    businessId: v.id("businesses"),
    action: v.union(
      v.literal("activate"),
      v.literal("deactivate"), 
      v.literal("approve"),
      v.literal("flag"),
      v.literal("feature"),
      v.literal("unfeature")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    // const adminAccess = await ctx.runQuery(api.admin.checkAdminAccess, {});
    // if (!adminAccess.hasAccess || !adminAccess.permissions.includes("business_management")) {
    //   throw new Error("Admin access required");
    // }

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    let updateData: Partial<Doc<"businesses">> = {};

    switch (args.action) {
      case "activate":
        updateData.active = true;
        break;
      case "deactivate":
        updateData.active = false;
        break;
      case "feature":
        updateData.featured = true;
        break;
      case "unfeature":
        updateData.featured = false;
        break;
      case "approve":
        updateData.active = true;
        updateData.verified = true;
        break;
      case "flag":
        // Add to moderation queue
        await ctx.db.insert("businessModerationQueue", {
          businessId: args.businessId,
          status: "flagged",
          priority: "high",
          flags: ["admin_flagged"],
          adminNotes: args.reason,
          createdAt: Date.now(),
        });
        break;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = Date.now();
      await ctx.db.patch(args.businessId, updateData);
    }

    // TODO: Restore admin logging when admin module is available
    // await ctx.runMutation(internal.admin.logAdminAction, {
    //   action: `business_${args.action}`,
    //   targetType: "business",
    //   targetId: args.businessId,
    //   reason: args.reason,
    //   details: { businessName: business.name, action: args.action },
    // });

    return { success: true };
  },
});

/**
 * Bulk update businesses (admin action)
 */
export const bulkUpdateBusinesses = mutation({
  args: {
    businessIds: v.array(v.id("businesses")),
    action: v.union(
      v.literal("activate"),
      v.literal("deactivate"),
      v.literal("approve"), 
      v.literal("flag"),
      v.literal("feature"),
      v.literal("unfeature")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Restore admin access check when admin module is available
    // const adminAccess = await ctx.runQuery(api.admin.checkAdminAccess, {});
    // if (!adminAccess.hasAccess || !adminAccess.permissions.includes("business_management")) {
    //   throw new Error("Admin access required");
    // }

    const results = [];
    
    for (const businessId of args.businessIds) {
      try {
        await ctx.runMutation(api.businesses.updateBusinessStatus, {
          businessId,
          action: args.action,
          reason: args.reason,
        });
        results.push({ businessId, success: true });
      } catch (error) {
        results.push({ businessId, success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    // TODO: Restore admin logging when admin module is available
    // await ctx.runMutation(internal.admin.logAdminAction, {
    //   action: `bulk_${args.action}`,
    //   targetType: "business",
    //   targetId: `${args.businessIds.length}_businesses`,
    //   reason: args.reason,
    //   details: { 
    //     businessCount: args.businessIds.length,
    //     action: args.action,
    //     results 
    //   },
    // });

    return { 
      success: true, 
      results,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
    };
  },
});

/**
 * Export business data (admin action)
 */
export const exportBusinessData = mutation({
  args: {
    filters: v.optional(v.any()),
    selectedIds: v.optional(v.array(v.id("businesses"))),
    format: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // TODO: Add admin access check when admin module is restored

    let businesses;
    
    if (args.selectedIds && args.selectedIds.length > 0) {
      // Export selected businesses
      businesses = await Promise.all(
        args.selectedIds.map(id => ctx.db.get(id))
      );
      businesses = businesses.filter(Boolean);
    } else {
      // Export with filters
      businesses = await ctx.runQuery(api.businesses.getBusinessesForAdmin, {
        ...args.filters,
        limit: 10000, // Large limit for export
      });
    }

    // TODO: Restore admin logging when admin module is available
    // await ctx.runMutation(internal.admin.logAdminAction, {
    //   action: "businesses_exported",
    //   targetType: "business",
    //   targetId: `export_${businesses.length}_businesses`,
    //   details: { 
    //     businessCount: businesses.length,
    //     format: args.format || "csv",
    //     hasFilters: !!args.filters,
    //     selectedIds: !!args.selectedIds?.length,
    //   },
    // });

    return { 
      success: true, 
      businessCount: businesses.length,
      exportTimestamp: Date.now(),
      // In a real implementation, this would generate and return download URL
      data: businesses.slice(0, 100), // Limit response size
    };
  },
});

