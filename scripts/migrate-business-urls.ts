#!/usr/bin/env node

/**
 * Migration script to update existing businesses to new URL structure
 * 
 * This script:
 * 1. Fetches all existing businesses from the database
 * 2. Updates their slug and urlPath fields to match the new format
 * 3. Provides detailed progress reporting
 * 4. Handles errors gracefully
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { SlugGenerator } from "../app/utils/slug-generator";
import { CategoryMapping } from "../config/category-detector";

interface MigrationStats {
  total: number;
  updated: number;
  failed: number;
  errors: string[];
}

class BusinessURLMigrator {
  private client: ConvexHttpClient;
  private stats: MigrationStats = {
    total: 0,
    updated: 0,
    failed: 0,
    errors: []
  };

  constructor() {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
    }
    this.client = new ConvexHttpClient(convexUrl);
  }

  async migrateAllBusinesses(): Promise<MigrationStats> {
    console.log("🚀 Starting business URL migration...");
    
    try {
      // Get all businesses
      const businesses = await this.client.query(api.businesses.getBusinesses, {});
      this.stats.total = businesses.length;
      
      console.log(`📊 Found ${businesses.length} businesses to migrate`);
      
      if (businesses.length === 0) {
        console.log("✅ No businesses found to migrate");
        return this.stats;
      }

      // Get all categories for lookup
      const categories = await this.client.query(api.categories.getCategories, {});
      const categoryMap = new Map(categories.map(cat => [cat._id, cat]));

      // Process businesses in batches
      const batchSize = 10;
      const batches = this.createBatches(businesses, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n📦 Processing batch ${i + 1}/${batches.length} (${batch.length} businesses)`);
        
        await this.processBatch(batch, categoryMap);
        
        // Show progress
        const progress = ((i + 1) / batches.length * 100).toFixed(1);
        console.log(`📈 Progress: ${progress}% (${this.stats.updated}/${this.stats.total} updated)`);
      }

      this.printFinalReport();
      return this.stats;

    } catch (error) {
      console.error("❌ Migration failed:", error);
      this.stats.errors.push(`Migration failed: ${error.message}`);
      throw error;
    }
  }

  private async processBatch(businesses: any[], categoryMap: Map<string, any>): Promise<void> {
    const promises = businesses.map(business => this.migrateBusiness(business, categoryMap));
    await Promise.allSettled(promises);
  }

  private async migrateBusiness(business: any, categoryMap: Map<string, any>): Promise<void> {
    try {
      const category = categoryMap.get(business.categoryId);
      if (!category) {
        throw new Error(`Category not found for business ${business.name}`);
      }

      // Generate new slug and URL path
      const newSlug = SlugGenerator.generateFullBusinessSlug(
        business.name,
        business.city,
        category.name
      );
      
      const newUrlPath = SlugGenerator.generateURLPath(
        business.name,
        business.city,
        category.name
      );

      // Check if this business already has the new format
      if (business.slug === newSlug && business.urlPath === newUrlPath) {
        console.log(`⏩ Skipping ${business.name} (already migrated)`);
        this.stats.updated++;
        return;
      }

      // Update the business
      await this.client.mutation(api.businesses.updateBusinessUrls, {
        businessId: business._id,
        newSlug,
        newUrlPath
      });

      console.log(`✅ Updated: ${business.name}`);
      console.log(`   Old slug: ${business.slug}`);
      console.log(`   New slug: ${newSlug}`);
      console.log(`   URL path: ${newUrlPath}`);
      
      this.stats.updated++;

    } catch (error) {
      console.error(`❌ Failed to migrate ${business.name}:`, error.message);
      this.stats.failed++;
      this.stats.errors.push(`${business.name}: ${error.message}`);
    }
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private printFinalReport(): void {
    console.log("\n" + "=".repeat(50));
    console.log("📋 MIGRATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`📊 Total businesses: ${this.stats.total}`);
    console.log(`✅ Successfully updated: ${this.stats.updated}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`📈 Success rate: ${((this.stats.updated / this.stats.total) * 100).toFixed(1)}%`);
    
    if (this.stats.errors.length > 0) {
      console.log("\n🚨 ERRORS:");
      this.stats.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    console.log("\n✨ Migration completed!");
  }
}

// Add the mutation function to convex/businesses.ts
const UPDATE_BUSINESS_URLS_MUTATION = `
// Add this to convex/businesses.ts
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
      throw new Error(\`A business with slug "\${args.newSlug}" already exists\`);
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
`;

// Run the migration if this file is executed directly
if (require.main === module) {
  const migrator = new BusinessURLMigrator();
  
  migrator.migrateAllBusinesses()
    .then((stats) => {
      console.log("\n🎉 Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration failed:", error);
      process.exit(1);
    });
}

export default BusinessURLMigrator;