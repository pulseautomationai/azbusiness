import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Interface for validation results
interface ValidationCategory {
  passed: boolean;
  score: number; // 0-100
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
    details?: any;
  }>;
  duration: number; // milliseconds
}

interface ValidationResults {
  batchId: Id<"importBatches">;
  status: "running" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  overallScore: number; // 0-100%
  categories: {
    databaseIntegrity: ValidationCategory;
    dataQuality: ValidationCategory;
    seoCompliance: ValidationCategory;
    sitemapIntegration: ValidationCategory;
    functionalSystems: ValidationCategory;
    performance: ValidationCategory;
  };
  sampleBusinesses: Array<{
    _id: Id<"businesses">;
    name: string;
    urlPath: string;
    city: string;
    category: string;
  }>;
  recommendations: string[];
  errors: Array<{
    category: string;
    businessId?: Id<"businesses">;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
  statistics: {
    totalBusinesses: number;
    expectedBusinesses: number;
    successfulCreated: number;
    failedCreated: number;
    duplicatesSkipped: number;
  };
}

// Store validation results
export const storeValidationResults = mutation({
  args: {
    results: v.any(),
  },
  handler: async (ctx, args) => {
    const validationId = await ctx.db.insert("importValidationResults", {
      ...args.results,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return validationId;
  },
});

// Get validation results for a batch
export const getValidationResults = query({
  args: {
    batchId: v.id("importBatches"),
  },
  handler: async (ctx, args) => {
    const validation = await ctx.db
      .query("importValidationResults")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .order("desc")
      .first();

    return validation;
  },
});

// Main validation function - orchestrates all checks
export const validateImportBatch = mutation({
  args: {
    batchId: v.id("importBatches"),
    runFullValidation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    // Get import batch details
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error(`Import batch ${args.batchId} not found`);
    }

    // Initialize validation results
    const results: ValidationResults = {
      batchId: args.batchId,
      status: "running",
      startedAt: startTime,
      overallScore: 0,
      categories: {
        databaseIntegrity: { passed: false, score: 0, checks: [], duration: 0 },
        dataQuality: { passed: false, score: 0, checks: [], duration: 0 },
        seoCompliance: { passed: false, score: 0, checks: [], duration: 0 },
        sitemapIntegration: { passed: false, score: 0, checks: [], duration: 0 },
        functionalSystems: { passed: false, score: 0, checks: [], duration: 0 },
        performance: { passed: false, score: 0, checks: [], duration: 0 },
      },
      sampleBusinesses: [],
      recommendations: [],
      errors: [],
      statistics: {
        totalBusinesses: 0,
        expectedBusinesses: batch.businessCount,
        successfulCreated: batch.results?.created || 0,
        failedCreated: batch.results?.failed || 0,
        duplicatesSkipped: batch.results?.duplicates || 0,
      },
    };

    try {
      // 1. Database Integrity Validation
      results.categories.databaseIntegrity = await validateDatabaseIntegrity(ctx, args.batchId, batch);

      // 2. Data Quality Validation
      results.categories.dataQuality = await validateDataQuality(ctx, args.batchId, batch);

      // 3. SEO Compliance Validation
      if (args.runFullValidation) {
        results.categories.seoCompliance = await validateSEOCompliance(ctx, args.batchId, batch);
      }

      // 4. Sitemap Integration (quick check)
      results.categories.sitemapIntegration = await validateSitemapIntegration(ctx, args.batchId, batch);

      // 5. Functional Systems (sample check)
      results.categories.functionalSystems = await validateFunctionalSystems(ctx, args.batchId, batch);

      // 6. Performance Analysis
      results.categories.performance = await validatePerformance(ctx, args.batchId, batch);

      // Calculate overall score
      const categoryScores = Object.values(results.categories).map(cat => cat.score);
      results.overallScore = Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length);

      // Generate recommendations
      results.recommendations = generateRecommendations(results);

      // Select sample businesses for testing
      results.sampleBusinesses = await selectSampleBusinesses(ctx, args.batchId);

      results.status = "completed";
      results.completedAt = Date.now();

    } catch (error) {
      results.status = "failed";
      results.completedAt = Date.now();
      results.errors.push({
        category: "system",
        message: `Validation failed: ${error}`,
        severity: "error",
      });
    }

    // Store results
    await storeValidationResults(ctx, { results });

    return results;
  },
});

// Database integrity validation
async function validateDatabaseIntegrity(ctx: any, batchId: Id<"importBatches">, batch: Doc<"importBatches">): Promise<ValidationCategory> {
  const startTime = Date.now();
  const checks = [];
  let score = 0;

  try {
    // Get businesses created in this batch
    const businesses = await ctx.db
      .query("businesses")
      .filter((q: any) => q.eq(q.field("dataSource.metadata.importBatchId"), batchId))
      .collect();

    const totalBusinesses = businesses.length;

    // Check 1: Business count matches expected
    const expectedCount = batch.results?.created || batch.businessCount;
    const countMatch = totalBusinesses === expectedCount;
    checks.push({
      name: "Business Count Verification",
      passed: countMatch,
      message: countMatch 
        ? `✅ Created ${totalBusinesses} businesses as expected`
        : `❌ Expected ${expectedCount} businesses, found ${totalBusinesses}`,
      details: { expected: expectedCount, actual: totalBusinesses }
    });
    if (countMatch) score += 25;

    // Check 2: All businesses have corresponding businessContent records
    const contentRecords = await Promise.all(
      businesses.map(async (business) => {
        const content = await ctx.db
          .query("businessContent")
          .withIndex("by_business", (q: any) => q.eq("businessId", business._id))
          .first();
        return { businessId: business._id, hasContent: !!content };
      })
    );

    const missingContent = contentRecords.filter(record => !record.hasContent);
    const contentComplete = missingContent.length === 0;
    checks.push({
      name: "Business Content Records",
      passed: contentComplete,
      message: contentComplete
        ? `✅ All ${totalBusinesses} businesses have content records`
        : `❌ ${missingContent.length} businesses missing content records`,
      details: { total: totalBusinesses, missing: missingContent.length }
    });
    if (contentComplete) score += 25;

    // Check 3: All businesses have data source tracking
    const dataSourceRecords = await Promise.all(
      businesses.map(async (business) => {
        const sources = await ctx.db
          .query("businessDataSources")
          .withIndex("by_business", (q: any) => q.eq("businessId", business._id))
          .collect();
        return { businessId: business._id, sourceCount: sources.length };
      })
    );

    const businessesWithSources = dataSourceRecords.filter(record => record.sourceCount > 0);
    const sourceTrackingComplete = businessesWithSources.length === totalBusinesses;
    checks.push({
      name: "Data Source Tracking",
      passed: sourceTrackingComplete,
      message: sourceTrackingComplete
        ? `✅ All businesses have data source tracking`
        : `❌ ${totalBusinesses - businessesWithSources.length} businesses missing source tracking`,
      details: { 
        total: totalBusinesses, 
        withSources: businessesWithSources.length,
        averageFields: businessesWithSources.length > 0 
          ? Math.round(dataSourceRecords.reduce((sum, r) => sum + r.sourceCount, 0) / businessesWithSources.length)
          : 0
      }
    });
    if (sourceTrackingComplete) score += 25;

    // Check 4: Import batch status consistency
    const batchStatusCorrect = batch.status === "completed" && batch.results?.created === totalBusinesses;
    checks.push({
      name: "Import Batch Status",
      passed: batchStatusCorrect,
      message: batchStatusCorrect
        ? `✅ Import batch status is consistent`
        : `❌ Import batch status inconsistent with actual data`,
      details: { 
        batchStatus: batch.status, 
        reportedCreated: batch.results?.created,
        actualCreated: totalBusinesses
      }
    });
    if (batchStatusCorrect) score += 25;

  } catch (error) {
    checks.push({
      name: "Database Integrity Check",
      passed: false,
      message: `❌ Error during validation: ${error}`,
      details: { error: String(error) }
    });
  }

  return {
    passed: score >= 75, // Require 75% to pass
    score,
    checks,
    duration: Date.now() - startTime,
  };
}

// Data quality validation
async function validateDataQuality(ctx: any, batchId: Id<"importBatches">, batch: Doc<"importBatches">): Promise<ValidationCategory> {
  const startTime = Date.now();
  const checks = [];
  let score = 0;

  try {
    // Get businesses from this batch
    const businesses = await ctx.db
      .query("businesses")
      .filter((q: any) => q.eq(q.field("dataSource.metadata.importBatchId"), batchId))
      .collect();

    if (businesses.length === 0) {
      checks.push({
        name: "Data Quality Check",
        passed: false,
        message: "❌ No businesses found for validation",
        details: { businessCount: 0 }
      });
      return { passed: false, score: 0, checks, duration: Date.now() - startTime };
    }

    // Check 1: Required fields populated
    const requiredFields = ['name', 'slug', 'urlPath', 'phone', 'address', 'city', 'categoryId'];
    const fieldValidation = requiredFields.map(field => {
      const missingCount = businesses.filter(business => !business[field] || business[field] === '').length;
      const fieldComplete = missingCount === 0;
      
      return {
        field,
        passed: fieldComplete,
        missingCount,
        completionRate: ((businesses.length - missingCount) / businesses.length) * 100
      };
    });

    const requiredFieldsScore = Math.round(
      fieldValidation.reduce((sum, validation) => sum + validation.completionRate, 0) / requiredFields.length
    );

    checks.push({
      name: "Required Fields Completion",
      passed: requiredFieldsScore >= 95,
      message: `${requiredFieldsScore >= 95 ? '✅' : '❌'} Required fields ${requiredFieldsScore}% complete`,
      details: { 
        score: requiredFieldsScore,
        fieldBreakdown: fieldValidation
      }
    });
    score += Math.round(requiredFieldsScore * 0.4); // 40% of total score

    // Check 2: Data format validation
    const formatValidation = {
      phone: businesses.filter(b => b.phone && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(b.phone)).length,
      email: businesses.filter(b => b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)).length,
      website: businesses.filter(b => b.website && !b.website.startsWith('http')).length,
      zip: businesses.filter(b => b.zip && !/^\d{5}(-\d{4})?$/.test(b.zip)).length,
    };

    const formatIssues = Object.values(formatValidation).reduce((sum, count) => sum + count, 0);
    const formatScore = Math.max(0, 100 - (formatIssues / businesses.length) * 100);

    checks.push({
      name: "Data Format Validation",
      passed: formatScore >= 90,
      message: `${formatScore >= 90 ? '✅' : '❌'} Data format ${Math.round(formatScore)}% compliant`,
      details: {
        score: Math.round(formatScore),
        issues: formatValidation,
        totalIssues: formatIssues
      }
    });
    score += Math.round(formatScore * 0.3); // 30% of total score

    // Check 3: URL slug uniqueness
    const slugs = businesses.map(b => b.slug);
    const uniqueSlugs = new Set(slugs);
    const duplicateCount = slugs.length - uniqueSlugs.size;
    const slugUnique = duplicateCount === 0;

    checks.push({
      name: "URL Slug Uniqueness",
      passed: slugUnique,
      message: slugUnique
        ? `✅ All ${businesses.length} business slugs are unique`
        : `❌ Found ${duplicateCount} duplicate slugs`,
      details: { total: businesses.length, duplicates: duplicateCount }
    });
    if (slugUnique) score += 30; // 30% of total score

  } catch (error) {
    checks.push({
      name: "Data Quality Check",
      passed: false,
      message: `❌ Error during validation: ${error}`,
      details: { error: String(error) }
    });
  }

  return {
    passed: score >= 75,
    score: Math.min(100, score),
    checks,
    duration: Date.now() - startTime,
  };
}

// SEO compliance validation
async function validateSEOCompliance(ctx: any, batchId: Id<"importBatches">, batch: Doc<"importBatches">): Promise<ValidationCategory> {
  const startTime = Date.now();
  const checks = [];
  let score = 0;

  try {
    // Get sample of businesses for SEO testing
    const businesses = await ctx.db
      .query("businesses")
      .filter((q: any) => q.eq(q.field("dataSource.metadata.importBatchId"), batchId))
      .take(10); // Test first 10 for performance

    if (businesses.length === 0) {
      return { passed: false, score: 0, checks: [{ name: "SEO Check", passed: false, message: "No businesses to validate" }], duration: 0 };
    }

    // Check 1: URL pattern compliance
    const urlPatternCompliant = businesses.filter(business => {
      const expectedPattern = /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;
      return business.urlPath && expectedPattern.test(business.urlPath);
    });

    const urlComplianceRate = (urlPatternCompliant.length / businesses.length) * 100;
    checks.push({
      name: "URL Pattern Compliance",
      passed: urlComplianceRate >= 95,
      message: `${urlComplianceRate >= 95 ? '✅' : '❌'} ${Math.round(urlComplianceRate)}% URLs follow pattern`,
      details: {
        compliant: urlPatternCompliant.length,
        total: businesses.length,
        rate: Math.round(urlComplianceRate)
      }
    });
    score += Math.round(urlComplianceRate * 0.5); // 50% of SEO score

    // Check 2: Slug format validation
    const validSlugs = businesses.filter(business => {
      const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      return business.slug && slugPattern.test(business.slug);
    });

    const slugComplianceRate = (validSlugs.length / businesses.length) * 100;
    checks.push({
      name: "SEO Slug Format",
      passed: slugComplianceRate >= 95,
      message: `${slugComplianceRate >= 95 ? '✅' : '❌'} ${Math.round(slugComplianceRate)}% slugs SEO-compliant`,
      details: {
        compliant: validSlugs.length,
        total: businesses.length,
        rate: Math.round(slugComplianceRate)
      }
    });
    score += Math.round(slugComplianceRate * 0.5); // 50% of SEO score

  } catch (error) {
    checks.push({
      name: "SEO Compliance Check",
      passed: false,
      message: `❌ Error during validation: ${error}`,
      details: { error: String(error) }
    });
  }

  return {
    passed: score >= 80,
    score: Math.min(100, score),
    checks,
    duration: Date.now() - startTime,
  };
}

// Sitemap integration validation
async function validateSitemapIntegration(ctx: any, batchId: Id<"importBatches">, batch: Doc<"importBatches">): Promise<ValidationCategory> {
  const startTime = Date.now();
  const checks = [];
  let score = 0;

  try {
    // Check if sitemap cache was invalidated
    const recentInvalidation = await ctx.db
      .query("sitemapCache")
      .order("desc")
      .first();

    const batchCompletedAt = batch.completedAt || Date.now();
    const invalidatedAfterImport = recentInvalidation && 
      recentInvalidation.lastInvalidated >= (batchCompletedAt - 60000); // Within 1 minute

    checks.push({
      name: "Sitemap Cache Invalidation",
      passed: !!invalidatedAfterImport,
      message: invalidatedAfterImport
        ? `✅ Sitemap cache invalidated after import`
        : `❌ Sitemap cache not invalidated`,
      details: {
        lastInvalidation: recentInvalidation?.lastInvalidated,
        importCompleted: batchCompletedAt,
        reason: recentInvalidation?.reason
      }
    });

    if (invalidatedAfterImport) score += 100;

  } catch (error) {
    checks.push({
      name: "Sitemap Integration Check",
      passed: false,
      message: `❌ Error during validation: ${error}`,
      details: { error: String(error) }
    });
  }

  return {
    passed: score >= 50,
    score,
    checks,
    duration: Date.now() - startTime,
  };
}

// Functional systems validation
async function validateFunctionalSystems(ctx: any, batchId: Id<"importBatches">, batch: Doc<"importBatches">): Promise<ValidationCategory> {
  const startTime = Date.now();
  const checks = [];
  let score = 100; // Start optimistic

  try {
    // Get sample businesses
    const businesses = await ctx.db
      .query("businesses")
      .filter((q: any) => q.eq(q.field("dataSource.metadata.importBatchId"), batchId))
      .take(5);

    // Check 1: Plan tier defaults
    const defaultPlanTier = businesses.filter(b => b.planTier === "free");
    const planTierCorrect = defaultPlanTier.length === businesses.length;

    checks.push({
      name: "Plan Tier Defaults",
      passed: planTierCorrect,
      message: planTierCorrect
        ? `✅ All businesses set to default 'free' plan`
        : `❌ Some businesses have incorrect plan tier`,
      details: {
        total: businesses.length,
        freeplan: defaultPlanTier.length
      }
    });

    if (!planTierCorrect) score -= 25;

    // Check 2: Active status
    const activeBusinesses = businesses.filter(b => b.active === true);
    const allActive = activeBusinesses.length === businesses.length;

    checks.push({
      name: "Active Status",
      passed: allActive,
      message: allActive
        ? `✅ All businesses are active`
        : `❌ Some businesses are not active`,
      details: {
        total: businesses.length,
        active: activeBusinesses.length
      }
    });

    if (!allActive) score -= 25;

    // Check 3: Category references
    const categoriesExist = await Promise.all(
      businesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return !!category;
      })
    );

    const validCategories = categoriesExist.filter(Boolean).length;
    const categoriesValid = validCategories === businesses.length;

    checks.push({
      name: "Category References",
      passed: categoriesValid,
      message: categoriesValid
        ? `✅ All category references are valid`
        : `❌ Some category references are invalid`,
      details: {
        total: businesses.length,
        valid: validCategories
      }
    });

    if (!categoriesValid) score -= 25;

    // Check 4: Required timestamps
    const timestampsValid = businesses.filter(b => 
      b.createdAt && b.updatedAt && 
      b.createdAt > 0 && b.updatedAt > 0
    ).length;

    const timestampsCorrect = timestampsValid === businesses.length;

    checks.push({
      name: "Timestamp Integrity",
      passed: timestampsCorrect,
      message: timestampsCorrect
        ? `✅ All timestamps are properly set`
        : `❌ Some timestamps are missing or invalid`,
      details: {
        total: businesses.length,
        valid: timestampsValid
      }
    });

    if (!timestampsCorrect) score -= 25;

  } catch (error) {
    checks.push({
      name: "Functional Systems Check",
      passed: false,
      message: `❌ Error during validation: ${error}`,
      details: { error: String(error) }
    });
    score = 0;
  }

  return {
    passed: score >= 75,
    score: Math.max(0, score),
    checks,
    duration: Date.now() - startTime,
  };
}

// Performance validation
async function validatePerformance(ctx: any, batchId: Id<"importBatches">, batch: Doc<"importBatches">): Promise<ValidationCategory> {
  const startTime = Date.now();
  const checks = [];
  let score = 0;

  try {
    const importDuration = batch.completedAt ? (batch.completedAt - batch.createdAt) : 0;
    const businessesCreated = batch.results?.created || 0;
    const businessesPerSecond = importDuration > 0 ? (businessesCreated / (importDuration / 1000)) : 0;

    // Check 1: Import speed performance
    const speedAcceptable = businessesPerSecond >= 0.5; // At least 0.5 businesses per second
    checks.push({
      name: "Import Speed Performance",
      passed: speedAcceptable,
      message: speedAcceptable
        ? `✅ Import speed: ${businessesPerSecond.toFixed(2)} businesses/second`
        : `❌ Import speed slow: ${businessesPerSecond.toFixed(2)} businesses/second`,
      details: {
        duration: importDuration,
        businessesCreated,
        rate: businessesPerSecond.toFixed(2)
      }
    });

    if (speedAcceptable) score += 50;

    // Check 2: Error rate
    const totalProcessed = (batch.results?.created || 0) + (batch.results?.failed || 0);
    const errorRate = totalProcessed > 0 ? ((batch.results?.failed || 0) / totalProcessed) * 100 : 0;
    const lowErrorRate = errorRate <= 5; // Less than 5% error rate

    checks.push({
      name: "Error Rate Analysis",
      passed: lowErrorRate,
      message: lowErrorRate
        ? `✅ Low error rate: ${errorRate.toFixed(1)}%`
        : `❌ High error rate: ${errorRate.toFixed(1)}%`,
      details: {
        totalProcessed,
        failed: batch.results?.failed || 0,
        errorRate: errorRate.toFixed(1)
      }
    });

    if (lowErrorRate) score += 50;

  } catch (error) {
    checks.push({
      name: "Performance Analysis",
      passed: false,
      message: `❌ Error during validation: ${error}`,
      details: { error: String(error) }
    });
  }

  return {
    passed: score >= 75,
    score,
    checks,
    duration: Date.now() - startTime,
  };
}

// Generate recommendations based on validation results
function generateRecommendations(results: ValidationResults): string[] {
  const recommendations = [];

  // Database integrity recommendations
  if (results.categories.databaseIntegrity.score < 75) {
    recommendations.push("🔧 Run database cleanup to fix integrity issues");
  }

  // Data quality recommendations
  if (results.categories.dataQuality.score < 75) {
    recommendations.push("📝 Review and clean up data format issues before next import");
  }

  // SEO recommendations
  if (results.categories.seoCompliance.score < 80) {
    recommendations.push("🔍 Update URL generation logic to improve SEO compliance");
  }

  // Performance recommendations
  if (results.categories.performance.score < 75) {
    recommendations.push("⚡ Consider optimizing import batch size for better performance");
  }

  // Sitemap recommendations
  if (!results.categories.sitemapIntegration.passed) {
    recommendations.push("🗺️ Manually regenerate sitemap to include new businesses");
  }

  // Overall recommendations
  if (results.overallScore < 70) {
    recommendations.push("🚨 Consider reviewing import process - multiple issues detected");
  } else if (results.overallScore >= 90) {
    recommendations.push("✨ Excellent import quality - ready for production use");
  }

  return recommendations;
}

// Select sample businesses for testing
async function selectSampleBusinesses(ctx: any, batchId: Id<"importBatches">) {
  const businesses = await ctx.db
    .query("businesses")
    .filter((q: any) => q.eq(q.field("dataSource.metadata.importBatchId"), batchId))
    .take(100); // Get first 100

  // Select 5 random samples
  const samples = [];
  const sampleSize = Math.min(5, businesses.length);
  
  for (let i = 0; i < sampleSize; i++) {
    const randomIndex = Math.floor(Math.random() * businesses.length);
    const business = businesses[randomIndex];
    
    const category = await ctx.db.get(business.categoryId);
    
    samples.push({
      _id: business._id,
      name: business.name,
      urlPath: business.urlPath || '',
      city: business.city,
      category: category?.name || 'Unknown',
    });
    
    // Remove selected business to avoid duplicates
    businesses.splice(randomIndex, 1);
  }

  return samples;
}

// Quick validation for specific businesses
export const validateBusinessBatch = query({
  args: {
    businessIds: v.array(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const businessId of args.businessIds) {
      const business = await ctx.db.get(businessId);
      if (!business) continue;

      const validation = {
        businessId,
        name: business.name,
        checks: {
          hasRequiredFields: !!(business.name && business.slug && business.urlPath),
          hasValidSlug: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(business.slug || ''),
          hasValidUrlPath: /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/.test(business.urlPath || ''),
          hasBusinessContent: false,
          hasDataSources: false,
        },
        score: 0,
      };

      // Check for business content
      const content = await ctx.db
        .query("businessContent")
        .withIndex("by_business", (q) => q.eq("businessId", businessId))
        .first();
      validation.checks.hasBusinessContent = !!content;

      // Check for data sources
      const sources = await ctx.db
        .query("businessDataSources")
        .withIndex("by_business", (q) => q.eq("businessId", businessId))
        .collect();
      validation.checks.hasDataSources = sources.length > 0;

      // Calculate score
      const passedChecks = Object.values(validation.checks).filter(Boolean).length;
      validation.score = (passedChecks / Object.keys(validation.checks).length) * 100;

      results.push(validation);
    }

    return results;
  },
});

// Get all validation results for admin dashboard
export const getAllValidationResults = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const validations = await ctx.db
      .query("importValidationResults")
      .order("desc")
      .take(args.limit || 20);

    // Enrich with batch information
    const enrichedValidations = await Promise.all(
      validations.map(async (validation) => {
        const batch = await ctx.db.get(validation.batchId);
        return {
          ...validation,
          batchInfo: batch ? {
            importType: batch.importType,
            source: batch.source,
            businessCount: batch.businessCount,
            importedAt: batch.importedAt,
          } : null,
        };
      })
    );

    return enrichedValidations;
  },
});