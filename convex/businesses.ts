import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Get business by ID
export const getBusinessById = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.businessId);
  }
});

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
    city: v.optional(v.string()),
    zipcode: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
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

    if (args.city) {
      businesses = businesses.filter(b => b.city.toLowerCase() === args.city!.toLowerCase());
    }

    if (args.zipcode) {
      businesses = businesses.filter(b => b.zip === args.zipcode);
    }

    if (args.categoryId) {
      businesses = businesses.filter(b => b.categoryId === args.categoryId);
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
    // Get current user for admin check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

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
          type: "admin_flag",
          status: "flagged",
          priority: "high",
          submittedBy: user._id,
          submittedAt: Date.now(),
          flags: ["admin_flagged"],
          adminNotes: [{
            admin: "System",
            note: args.reason || "Business flagged by admin",
            timestamp: Date.now(),
            action: "flagged"
          }],
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

/**
 * Get unique cities from all businesses for admin filters
 */
export const getUniqueCities = query({
  handler: async (ctx) => {
    // TODO: Restore admin access check when admin module is available
    
    const businesses = await ctx.db.query("businesses").collect();
    
    // Get unique cities and sort them
    const cities = [...new Set(businesses.map(b => b.city))].sort();
    
    return cities;
  },
});

/**
 * Get unique zipcodes from all businesses for admin filters
 */
export const getUniqueZipcodes = query({
  handler: async (ctx) => {
    // TODO: Restore admin access check when admin module is available
    
    const businesses = await ctx.db.query("businesses").collect();
    
    // Get unique zipcodes and sort them
    const zipcodes = [...new Set(businesses.map(b => b.zip))].sort();
    
    return zipcodes;
  },
});

/**
 * Get businesses owned by the current user
 */
export const getUserBusinesses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Find businesses where ownerId matches the current user
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("ownerId"), identity.subject))
      .collect();

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

    // Sort by most recently updated
    businessesWithCategory.sort((a, b) => b.updatedAt - a.updatedAt);

    return businessesWithCategory;
  },
});

/**
 * Search businesses by service and zipcode with proximity sorting
 */
export const searchBusinessesByZipcode = query({
  args: {
    service: v.string(),
    zipcode: v.optional(v.string()),
    radius: v.optional(v.number()), // in miles, default 25
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 25;
    const limit = args.limit || 20;

    // Get all active businesses
    let businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Filter by service (search in name, description, and services)
    const serviceQuery = args.service.toLowerCase();
    businesses = businesses.filter(business => 
      business.name.toLowerCase().includes(serviceQuery) ||
      business.description?.toLowerCase().includes(serviceQuery) ||
      business.shortDescription?.toLowerCase().includes(serviceQuery) ||
      business.services?.some(service => service.toLowerCase().includes(serviceQuery))
    );

    // Add category info and calculate distance if zipcode provided
    const businessesWithDetails = await Promise.all(
      businesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        
        let distance = 0;
        if (args.zipcode) {
          // Get zipcode coordinates
          const zipcodeCoords = getZipcodeCoordinates(args.zipcode);
          if (zipcodeCoords && business.coordinates) {
            distance = calculateDistance(
              zipcodeCoords.lat, 
              zipcodeCoords.lng, 
              business.coordinates.lat, 
              business.coordinates.lng
            );
          } else if (zipcodeCoords) {
            // If business doesn't have coordinates, estimate based on city
            // This is a fallback - in production you'd geocode the address
            const cityCoords = getCityCoordinates(business.city);
            if (cityCoords) {
              distance = calculateDistance(
                zipcodeCoords.lat, 
                zipcodeCoords.lng, 
                cityCoords.lat, 
                cityCoords.lng
              );
            }
          }
        }

        return {
          ...business,
          category: category || null,
          distance,
        };
      })
    );

    // Filter by radius if zipcode provided
    let filteredBusinesses = businessesWithDetails;
    if (args.zipcode) {
      filteredBusinesses = businessesWithDetails.filter(business => 
        business.distance <= radius
      );
    }

    // Sort by: 1) Plan tier (power > pro > free), 2) Distance, 3) Rating
    filteredBusinesses.sort((a, b) => {
      // Plan tier priority
      const planPriority: Record<string, number> = { power: 3, pro: 2, free: 1 };
      const aPriority = planPriority[a.planTier] || 0;
      const bPriority = planPriority[b.planTier] || 0;
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // Distance (if zipcode provided)
      if (args.zipcode && a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      
      // Rating
      return b.rating - a.rating;
    });

    // Apply limit
    return filteredBusinesses.slice(0, limit);
  },
});

// Helper function to get coordinates for Arizona zipcodes
function getZipcodeCoordinates(zipcode: string): { lat: number; lng: number } | null {
  // Simplified mapping of some Arizona zipcodes to coordinates
  // In production, this would use a proper geocoding service
  const zipcodeMap: Record<string, { lat: number; lng: number }> = {
    "85001": { lat: 33.4484, lng: -112.0740 }, // Phoenix
    "85003": { lat: 33.4734, lng: -112.0879 },
    "85004": { lat: 33.4500, lng: -112.0667 },
    "85006": { lat: 33.4173, lng: -112.0278 },
    "85007": { lat: 33.3939, lng: -112.0717 },
    "85008": { lat: 33.4756, lng: -112.0440 },
    "85009": { lat: 33.4147, lng: -112.1058 },
    "85013": { lat: 33.5128, lng: -112.0847 },
    "85014": { lat: 33.5053, lng: -112.0364 },
    "85015": { lat: 33.5206, lng: -112.0031 },
    "85016": { lat: 33.5031, lng: -111.9678 },
    "85017": { lat: 33.4539, lng: -112.1158 },
    "85018": { lat: 33.4781, lng: -111.9831 },
    "85019": { lat: 33.5306, lng: -112.1367 },
    "85020": { lat: 33.4414, lng: -111.9681 },
    "85021": { lat: 33.5642, lng: -112.0881 },
    "85022": { lat: 33.6114, lng: -112.0278 },
    "85023": { lat: 33.4653, lng: -112.1431 },
    "85024": { lat: 33.6331, lng: -111.9931 },
    "85026": { lat: 33.6181, lng: -112.0631 },
    "85027": { lat: 33.6328, lng: -112.1431 },
    "85028": { lat: 33.3506, lng: -111.9581 },
    "85029": { lat: 33.5781, lng: -112.1331 },
    "85032": { lat: 33.3781, lng: -111.9331 },
    "85033": { lat: 33.3531, lng: -112.0131 },
    "85034": { lat: 33.3531, lng: -112.0531 },
    "85035": { lat: 33.3831, lng: -112.0931 },
    "85037": { lat: 33.3631, lng: -112.1531 },
    "85040": { lat: 33.4031, lng: -111.9131 },
    "85041": { lat: 33.3331, lng: -111.9731 },
    "85042": { lat: 33.3131, lng: -111.9331 },
    "85043": { lat: 33.3231, lng: -112.0131 },
    "85044": { lat: 33.3431, lng: -111.8831 },
    "85045": { lat: 33.2931, lng: -111.9131 },
    "85048": { lat: 33.2631, lng: -111.8631 },
    "85050": { lat: 33.2831, lng: -111.7831 },
    "85051": { lat: 33.5281, lng: -112.2631 },
    "85053": { lat: 33.6781, lng: -112.2031 },
    "85054": { lat: 33.6681, lng: -112.1631 },
    "85083": { lat: 33.5881, lng: -112.2231 },
    // Mesa
    "85201": { lat: 33.4152, lng: -111.8315 },
    "85202": { lat: 33.4019, lng: -111.8181 },
    "85203": { lat: 33.4147, lng: -111.8448 },
    "85204": { lat: 33.4314, lng: -111.8448 },
    "85205": { lat: 33.3897, lng: -111.8581 },
    "85206": { lat: 33.3681, lng: -111.8448 },
    "85207": { lat: 33.4481, lng: -111.8248 },
    "85208": { lat: 33.4681, lng: -111.8648 },
    "85209": { lat: 33.3281, lng: -111.8148 },
    "85210": { lat: 33.3081, lng: -111.8448 },
    "85212": { lat: 33.2881, lng: -111.8048 },
    "85213": { lat: 33.2681, lng: -111.8248 },
    // Tucson area
    "85701": { lat: 32.2217, lng: -110.9265 },
    "85705": { lat: 32.2581, lng: -110.9681 },
    "85710": { lat: 32.1681, lng: -110.8781 },
    "85715": { lat: 32.1981, lng: -110.8181 },
    "85719": { lat: 32.2981, lng: -110.9381 },
    "85741": { lat: 32.3681, lng: -111.0081 },
    "85748": { lat: 32.1181, lng: -110.8381 },
    // Flagstaff
    "86001": { lat: 35.1983, lng: -111.6513 },
    "86004": { lat: 35.2181, lng: -111.6713 },
    // Add more as needed...
  };

  return zipcodeMap[zipcode] || null;
}

// Helper function to get coordinates for major Arizona cities
function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const cityMap: Record<string, { lat: number; lng: number }> = {
    "phoenix": { lat: 33.4484, lng: -112.0740 },
    "tucson": { lat: 32.2217, lng: -110.9265 },
    "mesa": { lat: 33.4152, lng: -111.8315 },
    "chandler": { lat: 33.3062, lng: -111.8413 },
    "scottsdale": { lat: 33.4942, lng: -111.9261 },
    "glendale": { lat: 33.5387, lng: -112.1860 },
    "gilbert": { lat: 33.3528, lng: -111.7890 },
    "tempe": { lat: 33.4255, lng: -111.9400 },
    "peoria": { lat: 33.5806, lng: -112.2374 },
    "surprise": { lat: 33.6292, lng: -112.3679 },
    "yuma": { lat: 32.6927, lng: -114.6277 },
    "avondale": { lat: 33.4356, lng: -112.3496 },
    "flagstaff": { lat: 35.1983, lng: -111.6513 },
    "goodyear": { lat: 33.4355, lng: -112.3576 },
    "buckeye": { lat: 33.3703, lng: -112.5838 },
    "lake havasu city": { lat: 34.4839, lng: -114.3226 },
    "casa grande": { lat: 32.8795, lng: -111.7574 },
    "sierra vista": { lat: 31.5455, lng: -110.3032 },
    "maricopa": { lat: 33.0581, lng: -112.0476 },
    "oro valley": { lat: 32.3909, lng: -110.9665 },
    "prescott": { lat: 34.5400, lng: -112.4685 },
    "bullhead city": { lat: 35.1478, lng: -114.5683 },
    "prescott valley": { lat: 34.6100, lng: -112.3157 },
    "apache junction": { lat: 33.4151, lng: -111.5495 }
  };

  return cityMap[cityName.toLowerCase()] || null;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

