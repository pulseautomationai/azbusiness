import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Batch import businesses
export const batchImportBusinesses = mutation({
  args: {
    businesses: v.array(v.object({
      name: v.string(),
      slug: v.string(),
      urlPath: v.string(),
      shortDescription: v.string(),
      description: v.string(),
      phone: v.string(),
      email: v.optional(v.string()),
      website: v.optional(v.string()),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      categoryId: v.id("categories"),
      services: v.array(v.string()),
      coordinates: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
      hours: v.object({
        monday: v.optional(v.string()),
        tuesday: v.optional(v.string()),
        wednesday: v.optional(v.string()),
        thursday: v.optional(v.string()),
        friday: v.optional(v.string()),
        saturday: v.optional(v.string()),
        sunday: v.optional(v.string()),
      }),
      rating: v.number(),
      reviewCount: v.number(),
      socialLinks: v.optional(v.object({
        facebook: v.optional(v.string()),
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        youtube: v.optional(v.string()),
      })),
      // Additional GMB fields
      imageUrl: v.optional(v.string()),
      favicon: v.optional(v.string()),
      reviewUrl: v.optional(v.string()),
      serviceOptions: v.optional(v.string()),
      fromTheBusiness: v.optional(v.string()),
      offerings: v.optional(v.string()),
      planning: v.optional(v.string()),
    })),
    skipDuplicates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const businessData of args.businesses) {
      try {
        // Check for duplicate slug if skipDuplicates is enabled
        if (args.skipDuplicates !== false) {
          const existing = await ctx.db
            .query("businesses")
            .withIndex("by_slug", (q) => q.eq("slug", businessData.slug))
            .first();
          
          if (existing) {
            results.skipped++;
            continue;
          }
        }

        // Create business with default values
        const businessId = await ctx.db.insert("businesses", {
          ...businessData,
          logo: undefined,
          heroImage: undefined,
          planTier: "free",
          featured: false,
          priority: 0,
          claimed: false,
          verified: false,
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to import ${businessData.name}: ${error}`);
      }
    }

    return results;
  },
});

// Check if businesses exist by slugs
export const checkBusinessesBySlugs = query({
  args: {
    slugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existingBusinesses = await Promise.all(
      args.slugs.map(async (slug) => {
        const business = await ctx.db
          .query("businesses")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
        return business ? slug : null;
      })
    );

    return existingBusinesses.filter(Boolean);
  },
});

// Get import statistics
export const getImportStats = query({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    // Group by category
    const categoryStats: Record<string, number> = {};
    const cityStats: Record<string, number> = {};
    const planTierStats: Record<string, number> = {};
    
    for (const business of businesses) {
      // Category stats
      const category = await ctx.db.get(business.categoryId);
      if (category) {
        categoryStats[category.name] = (categoryStats[category.name] || 0) + 1;
      }
      
      // City stats
      cityStats[business.city] = (cityStats[business.city] || 0) + 1;
      
      // Plan tier stats
      planTierStats[business.planTier] = (planTierStats[business.planTier] || 0) + 1;
    }

    return {
      totalBusinesses: businesses.length,
      categoryStats,
      cityStats,
      planTierStats,
      averageRating: businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length || 0,
      totalReviews: businesses.reduce((sum, b) => sum + b.reviewCount, 0),
      claimedBusinesses: businesses.filter(b => b.claimed).length,
      verifiedBusinesses: businesses.filter(b => b.verified).length,
      featuredBusinesses: businesses.filter(b => b.featured).length,
    };
  },
});

// Update business URLs for existing businesses
export const updateBusinessURLs = mutation({
  args: {
    businesses: v.array(v.object({
      id: v.id("businesses"),
      slug: v.string(),
      urlPath: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const update of args.businesses) {
      try {
        await ctx.db.patch(update.id, {
          slug: update.slug,
          urlPath: update.urlPath,
          updatedAt: Date.now(),
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to update ${update.id}: ${error}`);
      }
    }

    return results;
  },
});

// Bulk update business fields
export const bulkUpdateBusinesses = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("businesses"),
      updates: v.object({
        planTier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("power"))),
        featured: v.optional(v.boolean()),
        priority: v.optional(v.number()),
        claimed: v.optional(v.boolean()),
        verified: v.optional(v.boolean()),
        active: v.optional(v.boolean()),
      }),
    })),
  },
  handler: async (ctx, args) => {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const { id, updates } of args.updates) {
      try {
        await ctx.db.patch(id, {
          ...updates,
          updatedAt: Date.now(),
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to update ${id}: ${error}`);
      }
    }

    return results;
  },
});

// Delete businesses by IDs
export const deleteBusinesses = mutation({
  args: {
    ids: v.array(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const id of args.ids) {
      try {
        await ctx.db.delete(id);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to delete ${id}: ${error}`);
      }
    }

    return results;
  },
});

// Get businesses with missing data
export const getBusinessesWithMissingData = query({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    const missingData = businesses.filter(business => {
      return (
        !business.email ||
        !business.website ||
        !business.coordinates ||
        !business.socialLinks ||
        business.rating === 0 ||
        business.reviewCount === 0
      );
    });

    return missingData.map(business => ({
      id: business._id,
      name: business.name,
      city: business.city,
      missingFields: {
        email: !business.email,
        website: !business.website,
        coordinates: !business.coordinates,
        socialLinks: !business.socialLinks,
        rating: business.rating === 0,
        reviewCount: business.reviewCount === 0,
      }
    }));
  },
});

// Clean up duplicate businesses
export const cleanupDuplicateBusinesses = mutation({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    const duplicates: Id<"businesses">[] = [];
    const seen = new Set<string>();

    for (const business of businesses) {
      const key = `${business.name}-${business.city}-${business.address}`;
      if (seen.has(key)) {
        duplicates.push(business._id);
      } else {
        seen.add(key);
      }
    }

    // Delete duplicates
    for (const id of duplicates) {
      await ctx.db.delete(id);
    }

    return {
      duplicatesRemoved: duplicates.length,
      remainingBusinesses: businesses.length - duplicates.length,
    };
  },
});

// Export all businesses for backup
export const exportAllBusinesses = query({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    const exportData = await Promise.all(
      businesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return {
          ...business,
          categoryName: category?.name || 'Unknown',
          categorySlug: category?.slug || 'unknown',
        };
      })
    );

    return exportData;
  },
});