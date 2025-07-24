#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Missing VITE_CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function scheduleVirginBusinesses() {
  const args = process.argv.slice(2);
  const maxToSchedule = parseInt(args[0]) || 300;
  
  console.log(`📅 Scheduling up to ${maxToSchedule} virgin businesses...\n`);
  
  try {
    // Read the virgin businesses file
    if (!fs.existsSync('virgin-businesses.json')) {
      console.error("❌ No virgin-businesses.json file found. Run 'npm run find-virgin' first.");
      return;
    }
    
    const virginBusinesses = JSON.parse(fs.readFileSync('virgin-businesses.json', 'utf-8'));
    console.log(`📊 Found ${virginBusinesses.length} virgin businesses in file\n`);
    
    // Take only the requested amount
    const toSchedule = virginBusinesses.slice(0, maxToSchedule);
    console.log(`🎯 Scheduling ${toSchedule.length} businesses\n`);
    
    // Group by review count for different priorities
    const zeroReviews = toSchedule.filter((b: any) => b.reviewCount === 0);
    const lowReviews = toSchedule.filter((b: any) => b.reviewCount > 0 && b.reviewCount <= 10);
    const otherReviews = toSchedule.filter((b: any) => b.reviewCount > 10);
    
    console.log(`📊 Breakdown:`);
    console.log(`  - Zero reviews: ${zeroReviews.length}`);
    console.log(`  - Low reviews (1-10): ${lowReviews.length}`);
    console.log(`  - Other reviews (11+): ${otherReviews.length}\n`);
    
    let totalAdded = 0;
    let totalSkipped = 0;
    
    // Schedule zero-review businesses first (highest priority)
    if (zeroReviews.length > 0) {
      console.log("🔴 Scheduling zero-review businesses (Priority 10)...");
      const BATCH_SIZE = 50;
      
      for (let i = 0; i < zeroReviews.length; i += BATCH_SIZE) {
        const batch = zeroReviews.slice(i, i + BATCH_SIZE);
        
        const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
          businesses: batch.map((b: any) => ({
            businessId: b.businessId,
            placeId: b.placeId,
          })),
          priority: 10, // Highest priority for zero reviews
        });
        
        totalAdded += result.added;
        totalSkipped += result.existing;
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Added ${result.added}, Skipped ${result.existing}`);
      }
    }
    
    // Schedule low-review businesses next
    if (lowReviews.length > 0) {
      console.log("\n🟡 Scheduling low-review businesses (Priority 8)...");
      const BATCH_SIZE = 50;
      
      for (let i = 0; i < lowReviews.length; i += BATCH_SIZE) {
        const batch = lowReviews.slice(i, i + BATCH_SIZE);
        
        const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
          businesses: batch.map((b: any) => ({
            businessId: b.businessId,
            placeId: b.placeId,
          })),
          priority: 8,
        });
        
        totalAdded += result.added;
        totalSkipped += result.existing;
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Added ${result.added}, Skipped ${result.existing}`);
      }
    }
    
    // Schedule other businesses
    if (otherReviews.length > 0) {
      console.log("\n🟢 Scheduling other businesses (Priority 6)...");
      const BATCH_SIZE = 50;
      
      for (let i = 0; i < otherReviews.length; i += BATCH_SIZE) {
        const batch = otherReviews.slice(i, i + BATCH_SIZE);
        
        const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
          businesses: batch.map((b: any) => ({
            businessId: b.businessId,
            placeId: b.placeId,
          })),
          priority: 6,
        });
        
        totalAdded += result.added;
        totalSkipped += result.existing;
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Added ${result.added}, Skipped ${result.existing}`);
      }
    }
    
    // Get updated queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total scheduled: ${toSchedule.length}`);
    console.log(`  - Successfully added: ${totalAdded}`);
    console.log(`  - Skipped (duplicates): ${totalSkipped}`);
    console.log(`  - Success rate: ${((totalAdded / toSchedule.length) * 100).toFixed(1)}%`);
    console.log(`  - Queue now has: ${queueStatus.pendingCount} pending items`);
    
    // Update the file to remove scheduled businesses
    const remaining = virginBusinesses.slice(maxToSchedule);
    if (remaining.length > 0) {
      fs.writeFileSync('virgin-businesses.json', JSON.stringify(remaining, null, 2));
      console.log(`\n📝 Updated virgin-businesses.json with ${remaining.length} remaining businesses`);
    } else {
      fs.unlinkSync('virgin-businesses.json');
      console.log("\n🧹 All businesses scheduled - deleted virgin-businesses.json");
    }
    
  } catch (error) {
    console.error("❌ Error scheduling businesses:", error);
  }
}

// Run the scheduler
scheduleVirginBusinesses();