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

async function findFreshBusinesses() {
  console.log("🔍 Finding fresh businesses not in queue...\n");
  
  try {
    // Get current queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Current Queue Status:");
    console.log(`  - Pending: ${queueStatus.pendingCount}`);
    console.log(`  - Processing: ${queueStatus.processingCount}\n`);
    
    // Get all cities to search through
    const cities = ['Phoenix', 'Scottsdale', 'Mesa', 'Tempe', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Avondale'];
    
    console.log("🏙️ Searching businesses by city...\n");
    
    const freshBusinesses = [];
    const targetCount = 200;
    
    for (const city of cities) {
      if (freshBusinesses.length >= targetCount) break;
      
      console.log(`🔍 Checking ${city}...`);
      
      // Get businesses from this city
      const cityBusinesses = await client.query(api.businesses.getBusinesses, {
        citySlug: city.toLowerCase().replace(/\s+/g, '-'),
        limit: 100,
      });
      
      // Filter for businesses that:
      // 1. Have a placeId (required for sync)
      // 2. Have zero reviews OR haven't been synced in 7+ days
      // 3. Are active
      const eligibleBusinesses = cityBusinesses.filter(business => {
        if (!business.placeId || !business.active) return false;
        
        const hasZeroReviews = !business.reviewCount || business.reviewCount === 0;
        const lastSyncTime = business.lastReviewSync || 0;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const needsSync = hasZeroReviews || lastSyncTime < sevenDaysAgo;
        
        return needsSync;
      });
      
      console.log(`  - Found ${eligibleBusinesses.length} eligible businesses`);
      
      // Add to our list
      freshBusinesses.push(...eligibleBusinesses);
    }
    
    // Sort by priority: zero reviews first, then by last sync time
    freshBusinesses.sort((a, b) => {
      const aZero = !a.reviewCount || a.reviewCount === 0;
      const bZero = !b.reviewCount || b.reviewCount === 0;
      
      if (aZero && !bZero) return -1;
      if (!aZero && bZero) return 1;
      
      const aLastSync = a.lastReviewSync || 0;
      const bLastSync = b.lastReviewSync || 0;
      return aLastSync - bLastSync;
    });
    
    // Take only what we need
    const finalBusinesses = freshBusinesses.slice(0, targetCount);
    
    // Analyze what we found
    const stats = {
      total: finalBusinesses.length,
      zeroReviews: finalBusinesses.filter(b => !b.reviewCount || b.reviewCount === 0).length,
      neverSynced: finalBusinesses.filter(b => !b.lastReviewSync).length,
      byCity: {} as Record<string, number>,
    };
    
    finalBusinesses.forEach(business => {
      const city = business.city || 'Unknown';
      stats.byCity[city] = (stats.byCity[city] || 0) + 1;
    });
    
    console.log("\n📊 Fresh Businesses Found:");
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - Zero reviews: ${stats.zeroReviews}`);
    console.log(`  - Never synced: ${stats.neverSynced}\n`);
    
    console.log("🏙️ By City:");
    Object.entries(stats.byCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`  - ${city}: ${count}`);
      });
    
    console.log("\n🏢 Sample businesses:");
    finalBusinesses.slice(0, 10).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   - City: ${business.city}`);
      console.log(`   - Reviews: ${business.reviewCount || 0}`);
      console.log(`   - Last sync: ${business.lastReviewSync ? new Date(business.lastReviewSync).toLocaleDateString() : 'Never'}`);
    });
    
    // Save to a file for scheduling
    if (finalBusinesses.length > 0) {
      const fs = await import('fs');
      const businessData = finalBusinesses.map(b => ({
        businessId: b._id,
        placeId: b.placeId,
        name: b.name,
        city: b.city,
        reviewCount: b.reviewCount || 0,
      }));
      
      fs.writeFileSync('fresh-businesses.json', JSON.stringify(businessData, null, 2));
      console.log("\n✅ Saved fresh businesses to fresh-businesses.json");
      console.log("   Run 'npm run schedule-fresh' to add them to queue");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the search
findFreshBusinesses();