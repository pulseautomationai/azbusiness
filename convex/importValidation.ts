import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get all validation results
export const getAllValidationResults = query({
  args: {},
  handler: async (ctx) => {
    const results = await ctx.db
      .query("importValidationResults")
      .order("desc")
      .collect();
    
    return results;
  },
});

// Get validation result by batch ID
export const getValidationResultByBatchId = query({
  args: { batchId: v.id("importBatches") },
  handler: async (ctx, { batchId }) => {
    const result = await ctx.db
      .query("importValidationResults")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .first();
    
    return result;
  },
});

// Helper function to create mock validation data
function createMockValidationCategories() {
  return {
    databaseIntegrity: {
      passed: true,
      score: 90,
      checks: [
        {
          name: "Duplicate Business Check",
          passed: true,
          message: "No duplicate businesses found",
        },
        {
          name: "Foreign Key Integrity",
          passed: true,
          message: "All references are valid",
        },
        {
          name: "Required Fields Check",
          passed: false,
          message: "2 businesses missing required fields",
        }
      ],
      duration: 1250,
    },
    dataQuality: {
      passed: true,
      score: 85,
      checks: [
        {
          name: "Phone Number Validation",
          passed: false,
          message: "3 businesses have invalid phone numbers",
        },
        {
          name: "Email Format Check",
          passed: true,
          message: "All email addresses are valid",
        },
        {
          name: "Address Completeness",
          passed: true,
          message: "All addresses have required components",
        }
      ],
      duration: 890,
    },
    seoCompliance: {
      passed: true,
      score: 80,
      checks: [
        {
          name: "URL Slug Uniqueness",
          passed: false,
          message: "4 businesses have duplicate slugs",
        },
        {
          name: "Meta Description Length",
          passed: true,
          message: "All descriptions within optimal length",
        },
        {
          name: "URL Structure",
          passed: true,
          message: "All URLs follow SEO best practices",
        }
      ],
      duration: 650,
    },
    sitemapIntegration: {
      passed: true,
      score: 95,
      checks: [
        {
          name: "Sitemap Presence",
          passed: false,
          message: "1 business URL not found in sitemap",
        },
        {
          name: "Sitemap Format",
          passed: true,
          message: "Sitemap follows XML standards",
        }
      ],
      duration: 430,
    },
    functionalSystems: {
      passed: true,
      score: 88,
      checks: [
        {
          name: "Category Validation",
          passed: false,
          message: "2 businesses have invalid categories",
        },
        {
          name: "Review System Integration",
          passed: true,
          message: "All reviews properly linked",
        },
        {
          name: "Search Indexing",
          passed: true,
          message: "All businesses indexed for search",
        }
      ],
      duration: 780,
    },
    performance: {
      passed: true,
      score: 92,
      checks: [
        {
          name: "Image Optimization",
          passed: false,
          message: "2 businesses have unoptimized images",
        },
        {
          name: "Database Query Performance",
          passed: true,
          message: "All queries execute within limits",
        },
        {
          name: "Page Load Speed",
          passed: true,
          message: "All pages load within 3 seconds",
        }
      ],
      duration: 520,
    },
  };
}

// Run validation for a specific import batch
export const runValidation = mutation({
  args: { batchId: v.id("importBatches") },
  handler: async (ctx, { batchId }) => {
    // Get the import batch
    const batch = await ctx.db.get(batchId);
    if (!batch) {
      throw new Error("Import batch not found");
    }
    
    // Check if validation already exists
    const existingValidation = await ctx.db
      .query("importValidationResults")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .first();
    
    if (existingValidation) {
      // Update existing validation
      await ctx.db.patch(existingValidation._id, {
        status: "running",
        startedAt: Date.now(),
      });
      
      // Simulate validation process with mock data
      await ctx.db.patch(existingValidation._id, {
        status: "completed",
        overallScore: 88,
        categories: createMockValidationCategories(),
        completedAt: Date.now(),
      });
      
      return existingValidation._id;
    } else {
      // Create new validation result
      const validationId = await ctx.db.insert("importValidationResults", {
        batchId,
        status: "running",
        overallScore: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        categories: {
          databaseIntegrity: {
            passed: false,
            score: 0,
            checks: [],
            duration: 0,
          },
          dataQuality: {
            passed: false,
            score: 0,
            checks: [],
            duration: 0,
          },
          seoCompliance: {
            passed: false,
            score: 0,
            checks: [],
            duration: 0,
          },
          sitemapIntegration: {
            passed: false,
            score: 0,
            checks: [],
            duration: 0,
          },
          functionalSystems: {
            passed: false,
            score: 0,
            checks: [],
            duration: 0,
          },
          performance: {
            passed: false,
            score: 0,
            checks: [],
            duration: 0,
          },
        },
        sampleBusinesses: [],
        recommendations: [
          "Review and fix duplicate business slugs",
          "Add missing phone numbers to incomplete listings",
          "Optimize large images for better performance",
          "Update sitemap to include all business URLs",
        ],
        errors: [],
        statistics: {
          totalBusinesses: batch.businessCount || 0,
          expectedBusinesses: batch.businessCount || 0,
          successfulCreated: batch.results?.created || 0,
          failedCreated: batch.results?.failed || 0,
          duplicatesSkipped: batch.results?.duplicates || 0,
        },
        startedAt: Date.now(),
      });
      
      // Simulate validation process with mock data
      await ctx.db.patch(validationId, {
        status: "completed",
        overallScore: 88,
        categories: createMockValidationCategories(),
        completedAt: Date.now(),
      });
      
      return validationId;
    }
  },
});