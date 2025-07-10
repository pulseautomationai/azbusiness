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

