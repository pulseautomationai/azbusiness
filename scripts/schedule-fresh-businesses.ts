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

async function scheduleFreshBusinesses() {
  console.log("📅 Scheduling fresh businesses...\n");
  
  try {
    // Read the fresh businesses file
    if (!fs.existsSync('fresh-businesses.json')) {
      console.error("❌ No fresh-businesses.json file found. Run 'npm run find-fresh' first.");
      return;
    }
    
    const freshBusinesses = JSON.parse(fs.readFileSync('fresh-businesses.json', 'utf-8'));
    console.log(`📊 Found ${freshBusinesses.length} fresh businesses to schedule\n`);
    
    // Get current queue to check for duplicates
    const pendingItems = await client.query(api.geoScraperQueue.getNextQueueItems, {
      limit: 1000,
    });
    
    const businessIdsInQueue = new Set(pendingItems.map(item => item.businessId));
    console.log(`📋 ${businessIdsInQueue.size} businesses already in queue\n`);
    
    // Filter out businesses already in queue
    const toSchedule = freshBusinesses.filter((b: any) => !businessIdsInQueue.has(b.businessId));
    console.log(`✅ ${toSchedule.length} businesses are truly fresh (not in queue)\n`);
    
    if (toSchedule.length === 0) {
      console.log("❌ All fresh businesses are already in queue!");
      return;
    }
    
    // Add to queue in batches
    const BATCH_SIZE = 50;
    let totalAdded = 0;
    let totalSkipped = 0;
    
    for (let i = 0; i < toSchedule.length; i += BATCH_SIZE) {
      const batch = toSchedule.slice(i, i + BATCH_SIZE);
      
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} businesses)...`);
      
      const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
        businesses: batch.map((b: any) => ({
          businessId: b.businessId,
          placeId: b.placeId,
        })),
        priority: 9, // High priority for fresh businesses
      });
      
      totalAdded += result.added;
      totalSkipped += result.existing;
      
      console.log(`  ✅ Added: ${result.added}`);
      console.log(`  ⏭️  Skipped: ${result.existing}`);
    }
    
    // Get updated queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total added: ${totalAdded}`);
    console.log(`  - Total skipped: ${totalSkipped}`);
    console.log(`  - Queue now has: ${queueStatus.pendingCount} pending items`);
    
    // Show what was added
    console.log("\n🏢 Sample businesses added:");
    toSchedule.slice(0, 5).forEach((business: any, index: number) => {
      console.log(`${index + 1}. ${business.name} (${business.city})`);
      console.log(`   - Reviews: ${business.reviewCount}`);
    });
    
    // Clean up
    fs.unlinkSync('fresh-businesses.json');
    console.log("\n🧹 Cleaned up fresh-businesses.json");
    
  } catch (error) {
    console.error("❌ Error scheduling businesses:", error);
  }
}

// Run the scheduler
scheduleFreshBusinesses();