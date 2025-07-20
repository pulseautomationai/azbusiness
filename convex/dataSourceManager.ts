import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Multi-Source Data Management and Conflict Resolution
 * 
 * This module provides functions for managing business data from multiple sources
 * and resolving conflicts between different data sources.
 */

// Data source priority (higher number = higher priority)
const SOURCE_PRIORITY = {
  "user_manual": 100,     // User edits have highest priority
  "gmb_api": 90,          // Live GMB data
  "admin_import": 80,     // Admin imported data
  "gmb_scraped": 70,      // Scraped GMB data
  "csv_upload": 60,       // CSV imports
  "system": 10,           // System generated (lowest)
} as const;

// Get data source priority score
function getSourcePriority(source: string): number {
  return SOURCE_PRIORITY[source as keyof typeof SOURCE_PRIORITY] || 0;
}

/**
 * Add or update a data source for a business field
 */
export const addFieldDataSource = mutation({
  args: {
    businessId: v.id("businesses"),
    fieldName: v.string(),
    source: v.string(),
    value: v.any(),
    confidence: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();

    // Check if field data source record exists
    let dataSource = await ctx.db
      .query("businessDataSources")
      .withIndex("by_business_field", (q) => 
        q.eq("businessId", args.businessId).eq("fieldName", args.fieldName)
      )
      .first();

    if (!dataSource) {
      // Create new data source record
      const newDataSource = {
        businessId: args.businessId,
        fieldName: args.fieldName,
        currentValue: args.value,
        currentSource: args.source,
        currentUpdatedAt: currentTime,
        sources: [{
          source: args.source,
          value: args.value,
          updatedAt: currentTime,
          confidence: args.confidence,
          metadata: args.metadata,
        }],
        locked: false,
        preferredSource: undefined,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      await ctx.db.insert("businessDataSources", newDataSource);
    } else {
      // Update existing data source record
      const existingSourceIndex = dataSource.sources.findIndex(s => s.source === args.source);
      
      if (existingSourceIndex >= 0) {
        // Update existing source
        dataSource.sources[existingSourceIndex] = {
          source: args.source,
          value: args.value,
          updatedAt: currentTime,
          confidence: args.confidence,
          metadata: args.metadata,
        };
      } else {
        // Add new source
        dataSource.sources.push({
          source: args.source,
          value: args.value,
          updatedAt: currentTime,
          confidence: args.confidence,
          metadata: args.metadata,
        });
      }

      // Determine if this should become the current value
      const shouldUpdateCurrent = await shouldUseNewSource(
        dataSource.currentSource,
        args.source,
        dataSource.locked,
        dataSource.preferredSource
      );

      const updateData: any = {
        sources: dataSource.sources,
        updatedAt: currentTime,
      };

      if (shouldUpdateCurrent) {
        updateData.currentValue = args.value;
        updateData.currentSource = args.source;
        updateData.currentUpdatedAt = currentTime;

        // Also update the main business record
        const businessUpdate: any = {};
        businessUpdate[args.fieldName] = args.value;
        businessUpdate.updatedAt = currentTime;
        await ctx.db.patch(args.businessId, businessUpdate);
      }

      await ctx.db.patch(dataSource._id, updateData);
    }

    return { success: true };
  },
});

/**
 * Determine if a new source should override the current source
 */
async function shouldUseNewSource(
  currentSource: string,
  newSource: string,
  isLocked: boolean | undefined,
  preferredSource: string | undefined
): Promise<boolean> {
  // If field is locked, don't update
  if (isLocked) {
    return false;
  }

  // If there's a preferred source, use it
  if (preferredSource) {
    return newSource === preferredSource;
  }

  // Use priority-based resolution
  return getSourcePriority(newSource) > getSourcePriority(currentSource);
}

/**
 * Resolve conflicts for all fields of a business
 */
export const resolveBusinessDataConflicts = mutation({
  args: {
    businessId: v.id("businesses"),
    forceUpdate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dataSources = await ctx.db
      .query("businessDataSources")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const businessUpdates: any = {};
    let updatedFields = 0;

    for (const dataSource of dataSources) {
      // Skip locked fields unless force update
      if (dataSource.locked && !args.forceUpdate) {
        continue;
      }

      // Find the best source for this field
      let bestSource = dataSource.sources[0];
      
      if (dataSource.preferredSource) {
        // Use preferred source if available
        const preferred = dataSource.sources.find(s => s.source === dataSource.preferredSource);
        if (preferred) {
          bestSource = preferred;
        }
      } else {
        // Use highest priority source
        bestSource = dataSource.sources.reduce((best, current) => {
          return getSourcePriority(current.source) > getSourcePriority(best.source) ? current : best;
        });
      }

      // Check if we need to update
      if (dataSource.currentSource !== bestSource.source || args.forceUpdate) {
        // Update data source record
        await ctx.db.patch(dataSource._id, {
          currentValue: bestSource.value,
          currentSource: bestSource.source,
          currentUpdatedAt: bestSource.updatedAt,
          updatedAt: Date.now(),
        });

        // Prepare business field update
        businessUpdates[dataSource.fieldName] = bestSource.value;
        updatedFields++;
      }
    }

    // Update business record if needed
    if (Object.keys(businessUpdates).length > 0) {
      businessUpdates.updatedAt = Date.now();
      await ctx.db.patch(args.businessId, businessUpdates);
    }

    return {
      updatedFields,
      changes: Object.keys(businessUpdates),
    };
  },
});

/**
 * Get data source summary for a business
 */
export const getBusinessDataSourceSummary = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const dataSources = await ctx.db
      .query("businessDataSources")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    const summary = {
      totalFields: dataSources.length,
      fieldsBySource: {} as Record<string, number>,
      lockedFields: 0,
      fieldsWithConflicts: 0,
      fields: [] as Array<{
        fieldName: string;
        currentSource: string;
        sourceCount: number;
        hasConflict: boolean;
        locked: boolean;
        preferredSource?: string;
      }>,
    };

    for (const dataSource of dataSources) {
      // Count fields by source
      const currentSource = dataSource.currentSource;
      summary.fieldsBySource[currentSource] = (summary.fieldsBySource[currentSource] || 0) + 1;

      // Count locked fields
      if (dataSource.locked) {
        summary.lockedFields++;
      }

      // Check for conflicts (multiple sources with different values)
      const uniqueValues = new Set(dataSource.sources.map(s => JSON.stringify(s.value)));
      const hasConflict = uniqueValues.size > 1;
      if (hasConflict) {
        summary.fieldsWithConflicts++;
      }

      summary.fields.push({
        fieldName: dataSource.fieldName,
        currentSource: dataSource.currentSource,
        sourceCount: dataSource.sources.length,
        hasConflict,
        locked: dataSource.locked || false,
        preferredSource: dataSource.preferredSource,
      });
    }

    return summary;
  },
});

/**
 * Bulk update field preferences
 */
export const bulkUpdateFieldPreferences = mutation({
  args: {
    businessId: v.id("businesses"),
    updates: v.array(v.object({
      fieldName: v.string(),
      preferredSource: v.optional(v.string()),
      locked: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    let updatedCount = 0;

    for (const update of args.updates) {
      const dataSource = await ctx.db
        .query("businessDataSources")
        .withIndex("by_business_field", (q) => 
          q.eq("businessId", args.businessId).eq("fieldName", update.fieldName)
        )
        .first();

      if (dataSource) {
        const updateData: any = {
          updatedAt: Date.now(),
        };

        if (update.preferredSource !== undefined) {
          updateData.preferredSource = update.preferredSource || undefined;
        }

        if (update.locked !== undefined) {
          updateData.locked = update.locked;
        }

        await ctx.db.patch(dataSource._id, updateData);
        updatedCount++;
      }
    }

    return { updatedCount };
  },
});

/**
 * Export data source audit report
 */
export const exportDataSourceAudit = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    includeMetadata: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dataSources = args.businessId 
      ? await ctx.db
          .query("businessDataSources")
          .withIndex("by_business", (q) => q.eq("businessId", args.businessId!))
          .collect()
      : await ctx.db.query("businessDataSources").collect();

    const auditData = await Promise.all(
      dataSources.map(async (dataSource) => {
        const business = await ctx.db.get(dataSource.businessId);
        
        const record: any = {
          businessId: dataSource.businessId,
          businessName: business?.name || "Unknown",
          fieldName: dataSource.fieldName,
          currentValue: dataSource.currentValue,
          currentSource: dataSource.currentSource,
          currentUpdatedAt: dataSource.currentUpdatedAt,
          sourceCount: dataSource.sources.length,
          locked: dataSource.locked,
          preferredSource: dataSource.preferredSource,
          hasConflict: new Set(dataSource.sources.map(s => JSON.stringify(s.value))).size > 1,
        };

        if (args.includeMetadata) {
          record.sources = dataSource.sources;
        }

        return record;
      })
    );

    return auditData;
  },
});

/**
 * Clean up orphaned data sources (businesses that no longer exist)
 */
export const cleanupOrphanedDataSources = mutation({
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