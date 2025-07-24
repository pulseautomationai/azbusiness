import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Optimized business batch import that handles large datasets efficiently
export const importBusinessBatch = mutation({
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
      // GMB fields
      placeId: v.optional(v.string()),
      cid: v.optional(v.string()),
    })),
    importSource: v.optional(v.union(
      v.literal("admin_import"),
      v.literal("gmb_api"),
      v.literal("user_manual"),
      v.literal("system")
    )),
    skipDuplicateCheck: v.optional(v.boolean()), // For faster imports when you know there are no duplicates
  },
  handler: async (ctx, args) => {
    const batchSize = args.businesses.length;
    console.log(`\n🚀 Processing business batch of ${batchSize} businesses`);
    
    const results = {
      totalProcessed: batchSize,
      newBusinessesAdded: 0,
      existingBusinessesSkipped: 0,
      errors: 0,
      errorMessages: [] as string[],
    };
    
    const importSource = args.importSource || "admin_import";
    const currentTime = Date.now();
    
    // Build a set of identifiers we need to check for duplicates
    const slugsToCheck = new Set<string>();
    const placeIdsToCheck = new Set<string>();
    
    args.businesses.forEach(business => {
      slugsToCheck.add(business.slug);
      if (business.placeId) placeIdsToCheck.add(business.placeId);
    });
    
    // Check for existing businesses efficiently
    const existingSlugs = new Set<string>();
    const existingPlaceIds = new Set<string>();
    
    if (!args.skipDuplicateCheck) {
      // Check slugs in batches
      for (const slug of slugsToCheck) {
        const existing = await ctx.db
          .query("businesses")
          .withIndex("by_slug", q => q.eq("slug", slug))
          .first();
        
        if (existing) {
          existingSlugs.add(slug);
        }
      }
      
      // Check PlaceIDs in batches
      for (const placeId of placeIdsToCheck) {
        const existing = await ctx.db
          .query("businesses")
          .withIndex("by_placeId", q => q.eq("placeId", placeId))
          .first();
        
        if (existing) {
          existingPlaceIds.add(placeId);
        }
      }
    }
    
    console.log(`🔍 Found ${existingSlugs.size} existing slugs and ${existingPlaceIds.size} existing PlaceIDs`);
    
    // Process businesses
    for (const businessData of args.businesses) {
      try {
        // Check for duplicates
        const isDuplicate = existingSlugs.has(businessData.slug) || 
                           (businessData.placeId && existingPlaceIds.has(businessData.placeId));
        
        if (isDuplicate) {
          results.existingBusinessesSkipped++;
          continue;
        }
        
        // Insert the business
        const businessId = await ctx.db.insert("businesses", {
          ...businessData,
          logo: undefined,
          heroImage: undefined,
          planTier: "free",
          featured: false,
          priority: 0,
          verified: false,
          claimedAt: undefined,
          active: true,
          // Data source tracking
          dataSource: {
            primary: importSource as any,
            lastSyncedAt: currentTime,
            syncStatus: "synced",
            gmbLocationId: undefined,
          },
          editedFields: [],
          createdAt: currentTime,
          updatedAt: currentTime,
        });
        
        results.newBusinessesAdded++;
        
        // Log progress
        if (results.newBusinessesAdded % 50 === 0) {
          console.log(`✅ Progress: ${results.newBusinessesAdded} businesses added`);
        }
        
      } catch (error: any) {
        results.errors++;
        const errorMsg = `Error with business ${businessData.name}: ${error.message}`;
        console.error(errorMsg);
        
        if (results.errorMessages.length < 10) {
          results.errorMessages.push(errorMsg);
        }
      }
    }
    
    // Summary
    console.log(`\n✅ BUSINESS IMPORT COMPLETE:`);
    console.log(`   - New businesses added: ${results.newBusinessesAdded}`);
    console.log(`   - Duplicates skipped: ${results.existingBusinessesSkipped}`);
    console.log(`   - Errors: ${results.errors}`);
    
    return results;
  },
});

// Get business import statistics
export const getBusinessImportStats = query({
  handler: async (ctx) => {
    const allBusinesses = await ctx.db.query("businesses").collect();
    const totalBusinesses = allBusinesses.length;
    
    // Get a sample to check for import distribution
    const businessSample = await ctx.db
      .query("businesses")
      .take(100);
    
    let businessesWithPlaceId = 0;
    let businessesWithReviews = 0;
    
    for (const business of businessSample) {
      if (business.placeId) {
        businessesWithPlaceId++;
      }
      
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", q => q.eq("businessId", business._id))
        .take(1);
        
      if (reviews.length > 0) {
        businessesWithReviews++;
      }
    }
    
    // Count by data source
    const sourceCount = new Map<string, number>();
    businessSample.forEach(business => {
      const source = business.dataSource?.primary || "unknown";
      sourceCount.set(source, (sourceCount.get(source) || 0) + 1);
    });
    
    return {
      totalBusinesses,
      averageRating: totalBusinesses > 0 ? 
        allBusinesses.reduce((sum, b) => sum + (b.rating || 0), 0) / totalBusinesses : 0,
      sampleStats: {
        businessesChecked: businessSample.length,
        businessesWithPlaceId,
        businessesWithReviews,
        percentageWithPlaceId: businessSample.length > 0 ? 
          Math.round(businessesWithPlaceId / businessSample.length * 100) : 0,
        percentageWithReviews: businessSample.length > 0 ? 
          Math.round(businessesWithReviews / businessSample.length * 100) : 0,
      },
      sourceDistribution: Object.fromEntries(sourceCount),
      limits: {
        maxReadsPerFunction: "~400,000 documents" as const,
        recommendedBatchSize: "200-500 businesses per import" as const,
        maxFunctionDuration: "1 minute" as const,
      },
    };
  },
});

// Clear all businesses (for testing)
export const clearAllBusinesses = mutation({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    let deleted = 0;
    
    for (const business of businesses) {
      await ctx.db.delete(business._id);
      deleted++;
      
      if (deleted % 50 === 0) {
        console.log(`Deleted ${deleted} businesses...`);
      }
    }
    
    return { deleted };
  },
});