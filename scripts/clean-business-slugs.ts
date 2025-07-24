#!/usr/bin/env node

/**
 * Migration script to clean up business slugs by removing city names
 * 
 * This script:
 * 1. Fetches all businesses with city names in their slugs
 * 2. Removes the city suffix from the slug
 * 3. Updates the urlPath to match the new slug
 * 4. Provides detailed progress reporting
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import type { Id } from "../convex/_generated/dataModel.js";
import * as dotenv from "dotenv";
import { createInterface } from "readline";

// Load environment variables
dotenv.config({ path: ".env.local" });

interface BusinessToUpdate {
  id: Id<"businesses">;
  name: string;
  city: string;
  oldSlug: string;
  newSlug: string;
  oldUrlPath: string;
  newUrlPath: string;
}

class SlugCleaner {
  private client: ConvexHttpClient;
  private stats = {
    total: 0,
    needsUpdate: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  constructor() {
    const convexUrl = process.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("VITE_CONVEX_URL environment variable is required");
    }
    this.client = new ConvexHttpClient(convexUrl);
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async analyze() {
    console.log("🔍 Analyzing businesses for slug cleanup...\n");

    try {
      // Get all businesses
      const businesses = await this.client.query(api.batchImport.exportAllBusinesses);
      this.stats.total = businesses.length;

      const businessesToUpdate: BusinessToUpdate[] = [];

      for (const business of businesses) {
        const citySlug = this.generateSlug(business.city);
        const citySlugSuffix = `-${citySlug}`;
        
        // Check if the slug ends with the city
        if (business.slug.endsWith(citySlugSuffix)) {
          // Remove the city suffix from the slug
          const newSlug = business.slug.slice(0, -citySlugSuffix.length);
          
          // Update the urlPath as well
          // Old format: /category/city/business-name-city
          // New format: /category/city/business-name
          let newUrlPath = business.urlPath;
          if (business.urlPath.endsWith(business.slug)) {
            // Replace the old slug at the end with the new one
            newUrlPath = business.urlPath.slice(0, -business.slug.length) + newSlug;
          }
          
          businessesToUpdate.push({
            id: business._id,
            name: business.name,
            city: business.city,
            oldSlug: business.slug,
            newSlug: newSlug,
            oldUrlPath: business.urlPath,
            newUrlPath: newUrlPath,
          });
        }
      }

      this.stats.needsUpdate = businessesToUpdate.length;

      console.log("📊 Analysis Results:");
      console.log(`Total businesses: ${this.stats.total}`);
      console.log(`Need slug update: ${this.stats.needsUpdate}`);
      console.log(`Already correct: ${this.stats.total - this.stats.needsUpdate}`);

      if (businessesToUpdate.length > 0) {
        console.log("\n📋 Sample of businesses to update:");
        businessesToUpdate.slice(0, 5).forEach(b => {
          console.log(`\n  Business: "${b.name}" in ${b.city}`);
          console.log(`    Slug: ${b.oldSlug} → ${b.newSlug}`);
          console.log(`    URL: ${b.oldUrlPath} → ${b.newUrlPath}`);
        });
        if (businessesToUpdate.length > 5) {
          console.log(`\n  ... and ${businessesToUpdate.length - 5} more`);
        }
      }

      return businessesToUpdate;
    } catch (error) {
      console.error("❌ Error during analysis:", error);
      throw error;
    }
  }

  async migrate(businessesToUpdate: BusinessToUpdate[], dryRun = false) {
    if (businessesToUpdate.length === 0) {
      console.log("\n✅ No businesses need updating!");
      return;
    }

    if (dryRun) {
      console.log("\n🔄 DRY RUN - No changes will be made");
      return;
    }

    console.log(`\n🚀 Starting migration of ${businessesToUpdate.length} businesses...`);

    const BATCH_SIZE = 50;
    const batches = [];
    
    for (let i = 0; i < businessesToUpdate.length; i += BATCH_SIZE) {
      batches.push(businessesToUpdate.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Processing in ${batches.length} batches of up to ${BATCH_SIZE} businesses each`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} businesses)...`);

      try {
        // Create the updates for this batch
        const updates = batch.map(b => ({
          id: b.id,
          slug: b.newSlug,
          urlPath: b.newUrlPath,
        }));

        // Use the updateBusinessURLs mutation
        const result = await this.client.mutation(api.batchImport.updateBusinessURLs, {
          businesses: updates
        });

        this.stats.updated += result.successful;
        this.stats.failed += result.failed;

        if (result.errors && result.errors.length > 0) {
          console.error(`❌ Errors in batch ${i + 1}:`, result.errors);
        }

        console.log(`✅ Batch ${i + 1} complete: ${result.successful} updated, ${result.failed} failed`);

        // Small delay to avoid overwhelming the system
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Error processing batch ${i + 1}:`, error);
        this.stats.failed += batch.length;
      }
    }

    console.log("\n📊 Migration Complete!");
    console.log(`✅ Successfully updated: ${this.stats.updated}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipConfirmation = args.includes("--yes") || args.includes("-y");

  console.log("🧹 Business Slug Cleanup Tool");
  console.log("============================");
  console.log("This tool will remove city names from business slugs\n");

  const cleaner = new SlugCleaner();

  try {
    // Analyze businesses
    const businessesToUpdate = await cleaner.analyze();

    if (businessesToUpdate.length === 0) {
      return;
    }

    // Ask for confirmation unless skipped
    if (!dryRun && !skipConfirmation) {
      console.log("\n⚠️  WARNING: This will update the slugs and URLs for the businesses listed above.");
      console.log("Make sure you have a backup of your database before proceeding.\n");
      
      const readline = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        readline.question("Do you want to proceed? (yes/no): ", resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
        console.log("\n❌ Migration cancelled");
        return;
      }
    }

    // Run migration
    await cleaner.migrate(businessesToUpdate, dryRun);

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });