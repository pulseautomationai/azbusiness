import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Enhanced batch import businesses with multi-source support
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
      // GMB Identifiers for Review Matching
      placeId: v.optional(v.string()),
      gmbUrl: v.optional(v.string()),
      cid: v.optional(v.string()),
      gmbClaimed: v.optional(v.boolean()),
    })),
    skipDuplicates: v.optional(v.boolean()),
    // Multi-source tracking parameters
    importSource: v.optional(v.string()), // "admin_import", "csv_upload", etc.
    importBatchId: v.optional(v.id("importBatches")),
    sourceMetadata: v.optional(v.any()), // CSV filename, scrape parameters, etc.
  },
  handler: async (ctx, args) => {
    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Default import source
    const importSource = args.importSource || "admin_import";
    const currentTime = Date.now();

    for (const businessData of args.businesses) {
      try {
        // DEBUG: Log the business data being imported
        console.log("🔍 Importing business:", {
          name: businessData.name,
          address: businessData.address,
          city: businessData.city,
          slug: businessData.slug
        });
        
        // Enhanced duplicate detection using multiple criteria
        if (args.skipDuplicates !== false) {
          // First check by slug for quick match
          let existing = await ctx.db
            .query("businesses")
            .withIndex("by_slug", (q) => q.eq("slug", businessData.slug))
            .first();
          
          // If no slug match, check for actual duplicates using business data
          if (!existing) {
            const allBusinesses = await ctx.db.query("businesses").collect();
            
            // Find potential duplicates by name + address/city combination
            existing = allBusinesses.find(business => {
              // Normalize strings for comparison
              const normalizeName = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
              const normalizeAddress = (addr: string) => addr.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
              const normalizeCity = (city: string) => city.toLowerCase().trim();
              
              const nameMatch = normalizeName(business.name) === normalizeName(businessData.name);
              
              // Check for address match OR city match (for businesses that might have slight address differences)
              const addressMatch = normalizeAddress(business.address) === normalizeAddress(businessData.address);
              const cityMatch = normalizeCity(business.city) === normalizeCity(businessData.city);
              
              // Consider it a duplicate if:
              // 1. Same name AND same address
              // 2. Same name AND same city AND same phone (for businesses that moved but kept same name/phone)
              const samePhonePart = business.phone && businessData.phone && 
                business.phone.replace(/\D/g, '').slice(-7) === businessData.phone.replace(/\D/g, '').slice(-7);
              
              return nameMatch && (addressMatch || (cityMatch && samePhonePart));
            }) || null;
          }
          
          if (existing) {
            console.log("🔍 Duplicate detected:", {
              existingBusiness: {
                id: existing._id,
                name: existing.name,
                address: existing.address,
                city: existing.city
              },
              newBusiness: {
                name: businessData.name,
                address: businessData.address,
                city: businessData.city
              }
            });
            results.skipped++;
            continue;
          }
        }

        // Create business with multi-source data tracking
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
          // Enhanced data source tracking
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

        // Create field-level source tracking for all imported fields
        const fieldsToTrack = [
          { name: "name", value: businessData.name },
          { name: "description", value: businessData.description },
          { name: "shortDescription", value: businessData.shortDescription },
          { name: "phone", value: businessData.phone },
          { name: "email", value: businessData.email },
          { name: "website", value: businessData.website },
          { name: "address", value: businessData.address },
          { name: "city", value: businessData.city },
          { name: "state", value: businessData.state },
          { name: "zip", value: businessData.zip },
          { name: "coordinates", value: businessData.coordinates },
          { name: "hours", value: businessData.hours },
          { name: "rating", value: businessData.rating },
          { name: "reviewCount", value: businessData.reviewCount },
          { name: "socialLinks", value: businessData.socialLinks },
          { name: "services", value: businessData.services },
          // GMB-specific fields
          { name: "imageUrl", value: businessData.imageUrl },
          { name: "favicon", value: businessData.favicon },
          { name: "reviewUrl", value: businessData.reviewUrl },
          { name: "serviceOptions", value: businessData.serviceOptions },
          { name: "fromTheBusiness", value: businessData.fromTheBusiness },
          { name: "offerings", value: businessData.offerings },
          { name: "planning", value: businessData.planning },
          // GMB Identifiers for Review Matching
          { name: "placeId", value: businessData.placeId },
          { name: "gmbUrl", value: businessData.gmbUrl },
          { name: "cid", value: businessData.cid },
          { name: "gmbClaimed", value: businessData.gmbClaimed },
        ];

        // Store source data for each field
        for (const field of fieldsToTrack) {
          if (field.value !== undefined && field.value !== null) {
            await ctx.db.insert("businessDataSources", {
              businessId,
              fieldName: field.name,
              currentValue: field.value,
              currentSource: importSource,
              currentUpdatedAt: currentTime,
              sources: [{
                source: importSource,
                value: field.value,
                updatedAt: currentTime,
                confidence: 85, // Default confidence for CSV imports
                metadata: {
                  importBatchId: args.importBatchId,
                  sourceMetadata: args.sourceMetadata,
                },
              }],
              locked: false,
              preferredSource: undefined,
              createdAt: currentTime,
              updatedAt: currentTime,
            });
          }
        }

        // Create corresponding business_content record
        await ctx.db.insert("businessContent", {
          businessId,
          customSummary: undefined,
          heroImageUrl: undefined,
          serviceCards: undefined,
          customOffers: undefined,
          additionalSocialLinks: undefined,
          seoAudit: undefined,
          reviewAnalysis: undefined,
          journeyPreview: undefined,
          aiEnrichment: undefined,
          createdAt: currentTime,
          updatedAt: currentTime,
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

// Multi-source data management functions

// Create import batch record
export const createImportBatch = mutation({
  args: {
    importType: v.string(),
    importedBy: v.id("users"),
    source: v.string(),
    sourceMetadata: v.optional(v.any()),
    businessCount: v.number(),
    reviewCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchId = await ctx.db.insert("importBatches", {
      ...args,
      importedAt: Date.now(),
      status: "pending",
      results: undefined,
      errors: undefined,
      createdAt: Date.now(),
      completedAt: undefined,
    });

    return batchId;
  },
});

// Update import batch status and results
export const updateImportBatch = mutation({
  args: {
    batchId: v.id("importBatches"),
    status: v.string(),
    results: v.optional(v.object({
      created: v.number(),
      updated: v.number(),
      failed: v.number(),
      duplicates: v.number(),
    })),
    errors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
    };

    if (args.results) {
      updateData.results = args.results;
    }

    if (args.errors) {
      updateData.errors = args.errors;
    }

    if (args.status === "completed" || args.status === "failed") {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(args.batchId, updateData);
  },
});

// Get import batch history
export const getImportBatches = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("importBatches").order("desc");

    if (args.status) {
      query = ctx.db
        .query("importBatches")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc");
    }

    const batches = await query.take(args.limit || 50);

    // Enrich with user information
    const enrichedBatches = await Promise.all(
      batches.map(async (batch) => {
        const user = batch.importedBy ? await ctx.db.get(batch.importedBy) : null;
        return {
          ...batch,
          importedByName: user?.name || "System",
          importedByEmail: user?.email || "",
        };
      })
    );

    return enrichedBatches;
  },
});

// Get business data sources for a specific business
export const getBusinessDataSources = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const dataSources = await ctx.db
      .query("businessDataSources")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    return dataSources;
  },
});

// Update field source preference
export const updateFieldSource = mutation({
  args: {
    businessId: v.id("businesses"),
    fieldName: v.string(),
    newSource: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dataSource = await ctx.db
      .query("businessDataSources")
      .withIndex("by_business_field", (q) => 
        q.eq("businessId", args.businessId).eq("fieldName", args.fieldName)
      )
      .first();

    if (!dataSource) {
      throw new Error(`Data source not found for field ${args.fieldName}`);
    }

    // Find the source with the new value
    const newSourceData = dataSource.sources.find(s => s.source === args.newSource);
    if (!newSourceData) {
      throw new Error(`Source ${args.newSource} not available for field ${args.fieldName}`);
    }

    // Update the current value and source
    await ctx.db.patch(dataSource._id, {
      currentValue: newSourceData.value,
      currentSource: args.newSource,
      currentUpdatedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Also update the main business record if needed
    const updateData: any = {};
    updateData[args.fieldName] = newSourceData.value;
    updateData.updatedAt = Date.now();

    await ctx.db.patch(args.businessId, updateData);

    return { success: true };
  },
});

// Lock/unlock field from automatic updates
export const toggleFieldLock = mutation({
  args: {
    businessId: v.id("businesses"),
    fieldName: v.string(),
    locked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const dataSource = await ctx.db
      .query("businessDataSources")
      .withIndex("by_business_field", (q) => 
        q.eq("businessId", args.businessId).eq("fieldName", args.fieldName)
      )
      .first();

    if (!dataSource) {
      throw new Error(`Data source not found for field ${args.fieldName}`);
    }

    await ctx.db.patch(dataSource._id, {
      locked: args.locked,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Admin-specific functions for import management

// Get detailed import statistics for admin dashboard
export const getImportStatistics = query({
  handler: async (ctx) => {
    const importBatches = await ctx.db.query("importBatches").collect();
    const businesses = await ctx.db.query("businesses").collect();
    
    // Calculate import success rates by source
    const sourceStats = importBatches.reduce((acc, batch) => {
      if (!acc[batch.source]) {
        acc[batch.source] = {
          total: 0,
          successful: 0,
          failed: 0,
          totalBusinesses: 0,
        };
      }
      
      acc[batch.source].total++;
      if (batch.status === "completed") {
        acc[batch.source].successful++;
        acc[batch.source].totalBusinesses += batch.results?.created || 0;
      } else if (batch.status === "failed") {
        acc[batch.source].failed++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate data source distribution
    const dataSourceDistribution = businesses.reduce((acc, business) => {
      const source = business.dataSource?.primary || "system";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentImports = importBatches.filter(batch => batch.importedAt > thirtyDaysAgo);

    return {
      totalImports: importBatches.length,
      recentImports: recentImports.length,
      totalBusinesses: businesses.length,
      sourceStats,
      dataSourceDistribution,
      averageImportSize: importBatches.length > 0 
        ? Math.round(importBatches.reduce((sum, batch) => sum + batch.businessCount, 0) / importBatches.length)
        : 0,
      lastImportDate: importBatches.length > 0 
        ? Math.max(...importBatches.map(batch => batch.importedAt))
        : null,
    };
  },
});

// Get businesses with data source conflicts
export const getBusinessesWithConflicts = query({
  args: {
    limit: v.optional(v.number()),
    hasConflicts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const businesses = await ctx.db.query("businesses").take(args.limit || 50);
    
    const businessesWithSources = await Promise.all(
      businesses.map(async (business) => {
        const dataSources = await ctx.db
          .query("businessDataSources")
          .withIndex("by_business", (q) => q.eq("businessId", business._id))
          .collect();

        const conflictCount = dataSources.filter(source => 
          source.sources.length > 1 && 
          new Set(source.sources.map(s => JSON.stringify(s.value))).size > 1
        ).length;

        const lockedFields = dataSources.filter(source => source.locked).length;

        return {
          ...business,
          conflictCount,
          lockedFields,
          totalDataSources: dataSources.length,
          hasConflicts: conflictCount > 0,
        };
      })
    );

    // Filter based on conflicts if requested
    if (args.hasConflicts !== undefined) {
      return businessesWithSources.filter(b => b.hasConflicts === args.hasConflicts);
    }

    return businessesWithSources;
  },
});

// Get import performance metrics
export const getImportPerformanceMetrics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("importBatches");
    
    const batches = await query.collect();
    
    // Filter by date range if provided
    const filteredBatches = batches.filter(batch => {
      if (args.startDate && batch.importedAt < args.startDate) return false;
      if (args.endDate && batch.importedAt > args.endDate) return false;
      return true;
    });

    // Calculate metrics
    const totalBatches = filteredBatches.length;
    const completedBatches = filteredBatches.filter(b => b.status === "completed");
    const failedBatches = filteredBatches.filter(b => b.status === "failed");
    
    const totalBusinessesProcessed = filteredBatches.reduce((sum, batch) => 
      sum + (batch.results?.created || 0) + (batch.results?.failed || 0) + (batch.results?.duplicates || 0), 0
    );
    
    const totalBusinessesCreated = filteredBatches.reduce((sum, batch) => 
      sum + (batch.results?.created || 0), 0
    );

    const averageProcessingTime = completedBatches.length > 0
      ? completedBatches.reduce((sum, batch) => {
          const duration = (batch.completedAt || batch.importedAt) - batch.createdAt;
          return sum + duration;
        }, 0) / completedBatches.length
      : 0;

    // Error analysis
    const commonErrors = filteredBatches
      .flatMap(batch => batch.errors || [])
      .reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topErrors = Object.entries(commonErrors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    return {
      period: {
        start: args.startDate,
        end: args.endDate,
        duration: (args.endDate || Date.now()) - (args.startDate || 0),
      },
      overview: {
        totalBatches,
        successfulBatches: completedBatches.length,
        failedBatches: failedBatches.length,
        successRate: totalBatches > 0 ? (completedBatches.length / totalBatches) * 100 : 0,
      },
      businessMetrics: {
        totalProcessed: totalBusinessesProcessed,
        totalCreated: totalBusinessesCreated,
        averagePerBatch: totalBatches > 0 ? totalBusinessesProcessed / totalBatches : 0,
        creationRate: totalBusinessesProcessed > 0 ? (totalBusinessesCreated / totalBusinessesProcessed) * 100 : 0,
      },
      performance: {
        averageProcessingTime: Math.round(averageProcessingTime / 1000), // Convert to seconds
        fastestImport: completedBatches.length > 0 
          ? Math.min(...completedBatches.map(b => (b.completedAt || b.importedAt) - b.createdAt)) / 1000
          : 0,
        slowestImport: completedBatches.length > 0 
          ? Math.max(...completedBatches.map(b => (b.completedAt || b.importedAt) - b.createdAt)) / 1000
          : 0,
      },
      errorAnalysis: {
        totalErrors: Object.values(commonErrors).reduce((sum, count) => sum + count, 0),
        uniqueErrorTypes: Object.keys(commonErrors).length,
        topErrors,
      },
    };
  },
});

// Delete import batch
export const deleteImportBatch = mutation({
  args: {
    batchId: v.id("importBatches"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.batchId);
  },
});

// Fix existing pending imports that should be completed
export const fixPendingImports = mutation({
  handler: async (ctx) => {
    const pendingImports = await ctx.db
      .query("importBatches")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    let fixedCount = 0;
    
    for (const batch of pendingImports) {
      // Check if businesses were actually created for this batch
      const businesses = await ctx.db
        .query("businesses")
        .filter((q) => 
          q.eq(q.field("dataSource.primary"), "admin_import")
        )
        .collect();
      
      // Count businesses that were likely created by this batch
      // (created around the same time as the batch)
      const batchTimeWindow = 10 * 60 * 1000; // 10 minutes
      const relatedBusinesses = businesses.filter(business => 
        Math.abs(business.createdAt - batch.importedAt) < batchTimeWindow
      );
      
      if (relatedBusinesses.length > 0) {
        // Mark as completed with the estimated results
        await ctx.db.patch(batch._id, {
          status: "completed",
          completedAt: batch.importedAt + 60000, // Assume it took 1 minute
          results: {
            created: relatedBusinesses.length,
            updated: 0,
            failed: Math.max(0, batch.businessCount - relatedBusinesses.length),
            duplicates: 0,
          }
        });
        fixedCount++;
      }
    }

    return { fixedCount };
  },
});

// Cleanup old failed/pending imports
export const cleanupOldImports = mutation({
  handler: async (ctx) => {
    const oldImports = await ctx.db
      .query("importBatches")
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "failed"),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    const deletedCount = oldImports.length;
    
    for (const batch of oldImports) {
      await ctx.db.delete(batch._id);
    }

    return { deletedCount };
  },
});

// Cleanup and maintenance functions

// Find and report potential duplicates in existing data
export const findPotentialDuplicates = query({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    const duplicateGroups: Array<{
      duplicates: typeof businesses;
      reason: string;
    }> = [];

    // Group businesses by normalized name + city
    const businessGroups = new Map<string, typeof businesses>();
    
    for (const business of businesses) {
      const normalizeName = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
      const normalizeCity = (city: string) => city.toLowerCase().trim();
      
      const key = `${normalizeName(business.name)}-${normalizeCity(business.city)}`;
      
      if (!businessGroups.has(key)) {
        businessGroups.set(key, []);
      }
      businessGroups.get(key)!.push(business);
    }

    // Find groups with multiple businesses
    for (const [key, group] of businessGroups.entries()) {
      if (group.length > 1) {
        duplicateGroups.push({
          duplicates: group,
          reason: "Same name and city"
        });
      }
    }

    // Also check for same name + same phone across different cities
    const phoneGroups = new Map<string, typeof businesses>();
    for (const business of businesses) {
      if (business.phone) {
        const normalizedPhone = business.phone.replace(/\D/g, '').slice(-10); // Last 10 digits
        if (normalizedPhone.length >= 7) {
          if (!phoneGroups.has(normalizedPhone)) {
            phoneGroups.set(normalizedPhone, []);
          }
          phoneGroups.get(normalizedPhone)!.push(business);
        }
      }
    }

    for (const [phone, group] of phoneGroups.entries()) {
      if (group.length > 1) {
        // Check if they have similar names
        const firstBusiness = group[0];
        const similarName = group.filter(b => {
          const normalizeName = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
          return normalizeName(b.name) === normalizeName(firstBusiness.name);
        });
        
        if (similarName.length > 1) {
          duplicateGroups.push({
            duplicates: similarName,
            reason: "Same name and phone number"
          });
        }
      }
    }

    return {
      totalBusinesses: businesses.length,
      duplicateGroups: duplicateGroups.slice(0, 20), // Limit to first 20 groups
      totalDuplicateGroups: duplicateGroups.length,
    };
  },
});

// Remove orphaned data sources
export const cleanupOrphanedSources = mutation({
  handler: async (ctx) => {
    const dataSources = await ctx.db.query("businessDataSources").collect();
    let cleanedUp = 0;

    for (const dataSource of dataSources) {
      const business = await ctx.db.get(dataSource.businessId);
      if (!business) {
        await ctx.db.delete(dataSource._id);
        cleanedUp++;
      }
    }

    return { cleanedUp };
  },
});

// Recalculate data source priorities
export const recalculateDataPriorities = mutation({
  args: {
    businessIds: v.optional(v.array(v.id("businesses"))),
  },
  handler: async (ctx, args) => {
    let businesses;
    
    if (args.businessIds) {
      businesses = await Promise.all(
        args.businessIds.map(id => ctx.db.get(id))
      );
    } else {
      businesses = await ctx.db.query("businesses").collect();
    }

    let updated = 0;

    for (const business of businesses) {
      if (!business) continue;

      // Resolve conflicts for this business
      const dataSources = await ctx.db
        .query("businessDataSources")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .collect();

      for (const dataSource of dataSources) {
        // Find highest priority source
        const highestPrioritySource = dataSource.sources.reduce((best, current) => {
          const priorities = {
            "user_manual": 100,
            "gmb_api": 90,
            "admin_import": 80,
            "gmb_scraped": 70,
            "csv_upload": 60,
            "system": 10,
          };
          
          const currentPriority = priorities[current.source as keyof typeof priorities] || 0;
          const bestPriority = priorities[best.source as keyof typeof priorities] || 0;
          
          return currentPriority > bestPriority ? current : best;
        });

        // Update if different
        if (dataSource.currentSource !== highestPrioritySource.source) {
          await ctx.db.patch(dataSource._id, {
            currentValue: highestPrioritySource.value,
            currentSource: highestPrioritySource.source,
            currentUpdatedAt: highestPrioritySource.updatedAt,
            updatedAt: Date.now(),
          });

          // Update business record
          const businessUpdate: any = {};
          businessUpdate[dataSource.fieldName] = highestPrioritySource.value;
          businessUpdate.updatedAt = Date.now();
          await ctx.db.patch(business._id, businessUpdate);
          
          updated++;
        }
      }
    }

    return { updated };
  },
});