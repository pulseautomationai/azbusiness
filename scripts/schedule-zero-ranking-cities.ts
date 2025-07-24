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

async function scheduleZeroRankingCities() {
  const args = process.argv.slice(2);
  const maxToSchedule = parseInt(args[0]) || 500;
  
  console.log(`📅 Scheduling up to ${maxToSchedule} businesses from zero-ranking cities...\n`);
  
  try {
    // Read the zero-ranking cities businesses file
    if (!fs.existsSync('zero-ranking-cities-businesses.json')) {
      console.error("❌ No zero-ranking-cities-businesses.json file found. Run 'npm run find-zero-ranking' first.");
      return;
    }
    
    const allBusinesses = JSON.parse(fs.readFileSync('zero-ranking-cities-businesses.json', 'utf-8'));
    console.log(`📊 Found ${allBusinesses.length} eligible businesses in file\n`);
    
    // Take only the requested amount
    const toSchedule = allBusinesses.slice(0, maxToSchedule);
    console.log(`🎯 Scheduling ${toSchedule.length} businesses\n`);
    
    // Group by city for stats
    const cityGroups: Record<string, any[]> = {};
    toSchedule.forEach((b: any) => {
      const city = b.city || 'Unknown';
      if (!cityGroups[city]) cityGroups[city] = [];
      cityGroups[city].push(b);
    });
    
    console.log(`🏙️ Cities being processed (${Object.keys(cityGroups).length} total):`);
    Object.entries(cityGroups)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 15)
      .forEach(([city, businesses]) => {
        console.log(`  - ${city}: ${businesses.length} businesses`);
      });
    if (Object.keys(cityGroups).length > 15) {
      console.log(`  ... and ${Object.keys(cityGroups).length - 15} more cities`);
    }
    console.log('');
    
    // Group by review count
    const zeroReviews = toSchedule.filter((b: any) => b.reviewCount === 0);
    const lowReviews = toSchedule.filter((b: any) => b.reviewCount > 0 && b.reviewCount <= 10);
    const mediumReviews = toSchedule.filter((b: any) => b.reviewCount > 10 && b.reviewCount <= 50);
    const highReviews = toSchedule.filter((b: any) => b.reviewCount > 50);
    
    console.log(`📊 Review distribution:`);
    console.log(`  - Zero reviews: ${zeroReviews.length} (${(zeroReviews.length / toSchedule.length * 100).toFixed(1)}%)`);
    console.log(`  - Low reviews (1-10): ${lowReviews.length} (${(lowReviews.length / toSchedule.length * 100).toFixed(1)}%)`);
    console.log(`  - Medium reviews (11-50): ${mediumReviews.length} (${(mediumReviews.length / toSchedule.length * 100).toFixed(1)}%)`);
    console.log(`  - High reviews (51+): ${highReviews.length} (${(highReviews.length / toSchedule.length * 100).toFixed(1)}%)\n`);
    
    let totalAdded = 0;
    let totalSkipped = 0;
    const BATCH_SIZE = 50;
    
    // Schedule businesses with priority based on review count
    console.log("🚀 Scheduling businesses from zero-ranking cities...");
    
    for (let i = 0; i < toSchedule.length; i += BATCH_SIZE) {
      const batch = toSchedule.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      // Higher priority for zero reviews, decreasing with review count
      const avgReviews = batch.reduce((sum: number, b: any) => sum + (b.reviewCount || 0), 0) / batch.length;
      let priority = 10;
      if (avgReviews > 0 && avgReviews <= 10) priority = 9;
      else if (avgReviews > 10 && avgReviews <= 50) priority = 8;
      else if (avgReviews > 50) priority = 7;
      
      process.stdout.write(`  Batch ${batchNum}/${Math.ceil(toSchedule.length / BATCH_SIZE)} (priority ${priority}): `);
      
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
    
    // Show which cities were scheduled
    const scheduledCities = new Set(toSchedule.map((b: any) => b.city));
    console.log(`\n🏙️ Cities scheduled: ${scheduledCities.size}`);
    
    // Show sample of what was added
    console.log("\n🏢 Sample businesses scheduled:");
    toSchedule.slice(0, 10).forEach((business: any, index: number) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   - City: ${business.city}`);
      console.log(`   - Reviews: ${business.reviewCount || 0}`);
    });
    
    // Update the file to remove scheduled businesses
    const remaining = allBusinesses.slice(maxToSchedule);
    if (remaining.length > 0) {
      fs.writeFileSync('zero-ranking-cities-businesses.json', JSON.stringify(remaining, null, 2));
      console.log(`\n📝 Updated zero-ranking-cities-businesses.json with ${remaining.length} remaining businesses`);
      console.log(`   Run 'npm run schedule-zero-ranking ${Math.min(500, remaining.length)}' to continue`);
    } else {
      fs.unlinkSync('zero-ranking-cities-businesses.json');
      console.log("\n🧹 All businesses scheduled - deleted zero-ranking-cities-businesses.json");
    }
    
    // Show stats file reminder
    if (fs.existsSync('zero-ranking-cities-stats.json')) {
      console.log("\n📊 City statistics available in zero-ranking-cities-stats.json");
    }
    
  } catch (error) {
    console.error("❌ Error scheduling businesses:", error);
  }
}

// Run the scheduler
scheduleZeroRankingCities();