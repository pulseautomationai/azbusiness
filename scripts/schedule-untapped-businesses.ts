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

async function scheduleUntappedBusinesses() {
  const args = process.argv.slice(2);
  const maxToSchedule = parseInt(args[0]) || 500;
  
  console.log(`📅 Scheduling up to ${maxToSchedule} untapped businesses...\n`);
  
  try {
    // Read the untapped businesses file
    if (!fs.existsSync('untapped-businesses.json')) {
      console.error("❌ No untapped-businesses.json file found. Run 'npm run find-untapped' first.");
      return;
    }
    
    const untappedBusinesses = JSON.parse(fs.readFileSync('untapped-businesses.json', 'utf-8'));
    console.log(`📊 Found ${untappedBusinesses.length} untapped businesses in file\n`);
    
    // Take only the requested amount
    const toSchedule = untappedBusinesses.slice(0, maxToSchedule);
    console.log(`🎯 Scheduling ${toSchedule.length} businesses\n`);
    
    // Group by city for stats
    const cityGroups: Record<string, any[]> = {};
    toSchedule.forEach((b: any) => {
      const city = b.city || 'Unknown';
      if (!cityGroups[city]) cityGroups[city] = [];
      cityGroups[city].push(b);
    });
    
    console.log(`🏙️ Cities represented:`);
    Object.entries(cityGroups)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10)
      .forEach(([city, businesses]) => {
        console.log(`  - ${city}: ${businesses.length} businesses`);
      });
    console.log('');
    
    // Group by review count
    const zeroReviews = toSchedule.filter((b: any) => b.reviewCount === 0);
    const lowReviews = toSchedule.filter((b: any) => b.reviewCount > 0 && b.reviewCount <= 10);
    const otherReviews = toSchedule.filter((b: any) => b.reviewCount > 10);
    
    console.log(`📊 Review breakdown:`);
    console.log(`  - Zero reviews: ${zeroReviews.length}`);
    console.log(`  - Low reviews (1-10): ${lowReviews.length}`);
    console.log(`  - Other reviews (11+): ${otherReviews.length}\n`);
    
    let totalAdded = 0;
    let totalSkipped = 0;
    const BATCH_SIZE = 50;
    
    // Schedule all businesses with high priority since they're from smaller cities
    console.log("🚀 Scheduling businesses from smaller cities...");
    
    for (let i = 0; i < toSchedule.length; i += BATCH_SIZE) {
      const batch = toSchedule.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      // Higher priority for zero reviews
      const priority = batch.every((b: any) => b.reviewCount === 0) ? 10 : 8;
      
      process.stdout.write(`  Batch ${batchNum}/${Math.ceil(toSchedule.length / BATCH_SIZE)}: `);
      
      const result = await client.mutation(api.geoScraperQueue.bulkAddToQueue, {
        businesses: batch.map((b: any) => ({
          businessId: b.businessId,
          placeId: b.placeId,
        })),
        priority: priority,
      });
      
      totalAdded += result.added;
      totalSkipped += result.existing;
      console.log(`Added ${result.added}, Skipped ${result.existing}`);
    }
    
    // Get updated queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total attempted: ${toSchedule.length}`);
    console.log(`  - Successfully added: ${totalAdded}`);
    console.log(`  - Skipped (duplicates): ${totalSkipped}`);
    console.log(`  - Success rate: ${((totalAdded / toSchedule.length) * 100).toFixed(1)}%`);
    console.log(`  - Queue now has: ${queueStatus.pendingCount} pending items`);
    
    // Show sample of what was added
    console.log("\n🏢 Sample businesses scheduled:");
    toSchedule.slice(0, 5).forEach((business: any, index: number) => {
      console.log(`${index + 1}. ${business.name} (${business.city})`);
    });
    
    // Update the file to remove scheduled businesses
    const remaining = untappedBusinesses.slice(maxToSchedule);
    if (remaining.length > 0) {
      fs.writeFileSync('untapped-businesses.json', JSON.stringify(remaining, null, 2));
      console.log(`\n📝 Updated untapped-businesses.json with ${remaining.length} remaining businesses`);
      console.log(`   Run 'npm run schedule-untapped ${Math.min(500, remaining.length)}' to continue`);
    } else {
      fs.unlinkSync('untapped-businesses.json');
      console.log("\n🧹 All businesses scheduled - deleted untapped-businesses.json");
    }
    
  } catch (error) {
    console.error("❌ Error scheduling businesses:", error);
  }
}

// Run the scheduler
scheduleUntappedBusinesses();