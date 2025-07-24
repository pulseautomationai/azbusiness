#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Missing VITE_CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function scheduleZeroReviewBusinesses() {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args[0]) || 100;
  
  console.log(`🔄 Scheduling ${batchSize} businesses with zero reviews...\n`);
  
  try {
    // Find businesses with zero reviews
    const result = await client.query(api.findZeroReviewBusinesses.findBusinessesWithZeroReviews, {
      limit: batchSize,
      excludeInQueue: true,
    });
    
    if (result.businesses.length === 0) {
      console.log("❌ No businesses with zero reviews found that aren't already in queue");
      return;
    }
    
    console.log(`📊 Found ${result.businesses.length} businesses to schedule`);
    console.log(`   - Power: ${result.stats.byTier.power}`);
    console.log(`   - Pro: ${result.stats.byTier.pro}`);
    console.log(`   - Starter: ${result.stats.byTier.starter}`);
    console.log(`   - Free: ${result.stats.byTier.free}\n`);
    
    // Add to queue in batches
    const BATCH_SIZE = 50;
    let totalAdded = 0;
    
    for (let i = 0; i < result.businesses.length; i += BATCH_SIZE) {
      const batch = result.businesses.slice(i, i + BATCH_SIZE);
      
      console.log(`📦 Adding batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} businesses)...`);
      
      const queueResult = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
        businesses: batch.map(b => ({
          businessId: b._id,
          placeId: b.placeId!,
        })),
        priority: 8, // High priority for zero-review businesses
      });
      
      totalAdded += queueResult.added;
      console.log(`   ✅ Added ${queueResult.added} businesses`);
      
      if (queueResult.skipped > 0) {
        console.log(`   ⏭️  Skipped ${queueResult.skipped} (already in queue)`);
      }
    }
    
    // Get updated queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    
    console.log(`\n✅ Successfully added ${totalAdded} businesses to queue`);
    console.log(`📋 Updated Queue Status:`);
    console.log(`   - Total Pending: ${queueStatus.pendingCount}`);
    console.log(`   - Processing: ${queueStatus.processingCount}`);
    
    // Show some examples of what was added
    console.log("\n🏢 Sample businesses added:");
    result.businesses.slice(0, 5).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.city})`);
    });
    
  } catch (error) {
    console.error("❌ Error scheduling businesses:", error);
  }
}

// Run the scheduler
scheduleZeroReviewBusinesses();