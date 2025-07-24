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

async function findVirginBusinesses() {
  console.log("🔍 Finding virgin businesses (never touched by review sync)...\n");
  
  try {
    // Get queue status
    const queueStatus = await client.query(api.geoScraperQueue.getQueueStatus);
    console.log("📋 Current Queue Status:");
    console.log(`  - Pending: ${queueStatus.pendingCount}`);
    console.log(`  - Processing: ${queueStatus.processingCount}\n`);
    
    // Get ALL businesses from queue (pending, processing, and recently completed)
    console.log("📥 Loading queue history to exclude...");
    
    // Get pending/processing items
    const pendingItems = await client.query(api.geoScraperQueue.getNextQueueItems, {
      limit: 1000,
    });
    
    const queuedBusinessIds = new Set(pendingItems.map(item => item.businessId));
    console.log(`  - Found ${queuedBusinessIds.size} businesses in active queue`);
    
    // Now search for businesses by different criteria
    const allCities = [
      'Phoenix', 'Scottsdale', 'Mesa', 'Tempe', 'Chandler', 'Gilbert', 
      'Glendale', 'Peoria', 'Surprise', 'Avondale', 'Goodyear', 'Buckeye',
      'Queen Creek', 'Maricopa', 'Casa Grande', 'Flagstaff', 'Tucson',
      'Yuma', 'Prescott', 'Lake Havasu City', 'Bullhead City', 'Kingman',
      'Sierra Vista', 'Oro Valley', 'Prescott Valley', 'Apache Junction',
      'Sun City', 'Sun City West', 'Fountain Hills', 'Paradise Valley',
      'Cave Creek', 'Carefree', 'Litchfield Park', 'Tolleson', 'El Mirage',
      'Youngtown', 'Wickenburg', 'Florence', 'Eloy', 'Coolidge', 'San Tan Valley'
    ];
    
    console.log(`\n🏙️ Searching ${allCities.length} Arizona cities...\n`);
    
    const virginBusinesses = [];
    const targetCount = 500;
    const processedCities = new Set<string>();
    
    // Search each city
    for (const city of allCities) {
      if (virginBusinesses.length >= targetCount) break;
      
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      
      // Skip if we've already processed this city
      if (processedCities.has(citySlug)) continue;
      processedCities.add(citySlug);
      
      try {
        const cityBusinesses = await client.query(api.businesses.getBusinesses, {
          citySlug: citySlug,
          limit: 100,
        });
        
        // Filter for virgin businesses
        const eligible = cityBusinesses.filter(business => {
          // Must have placeId and be active
          if (!business.placeId || !business.active) return false;
          
          // Skip if in queue
          if (queuedBusinessIds.has(business._id)) return false;
          
          // Priority criteria:
          // 1. Never synced (no lastReviewSync)
          // 2. Zero reviews
          // 3. No sync status
          const neverSynced = !business.lastReviewSync;
          const zeroReviews = !business.reviewCount || business.reviewCount === 0;
          const noSyncStatus = !business.syncStatus || business.syncStatus === 'idle';
          
          return neverSynced && noSyncStatus;
        });
        
        if (eligible.length > 0) {
          console.log(`✅ ${city}: Found ${eligible.length} virgin businesses`);
          virginBusinesses.push(...eligible);
        }
      } catch (error) {
        // Skip cities that don't exist in the system
      }
    }
    
    // Sort by priority: zero reviews first
    virginBusinesses.sort((a, b) => {
      const aZero = !a.reviewCount || a.reviewCount === 0;
      const bZero = !b.reviewCount || b.reviewCount === 0;
      
      if (aZero && !bZero) return -1;
      if (!aZero && bZero) return 1;
      
      return 0;
    });
    
    // Take only what we need
    const finalBusinesses = virginBusinesses.slice(0, targetCount);
    
    // Analyze results
    const stats = {
      total: finalBusinesses.length,
      zeroReviews: finalBusinesses.filter(b => !b.reviewCount || b.reviewCount === 0).length,
      withReviews: finalBusinesses.filter(b => b.reviewCount && b.reviewCount > 0).length,
      byCity: {} as Record<string, number>,
      byReviewRange: {
        zero: 0,
        '1-10': 0,
        '11-50': 0,
        '51-100': 0,
        '100+': 0,
      },
    };
    
    finalBusinesses.forEach(business => {
      // City stats
      const city = business.city || 'Unknown';
      stats.byCity[city] = (stats.byCity[city] || 0) + 1;
      
      // Review range stats
      const reviews = business.reviewCount || 0;
      if (reviews === 0) stats.byReviewRange.zero++;
      else if (reviews <= 10) stats.byReviewRange['1-10']++;
      else if (reviews <= 50) stats.byReviewRange['11-50']++;
      else if (reviews <= 100) stats.byReviewRange['51-100']++;
      else stats.byReviewRange['100+']++;
    });
    
    console.log("\n📊 Virgin Businesses Found:");
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - Zero reviews: ${stats.zeroReviews}`);
    console.log(`  - With reviews: ${stats.withReviews}\n`);
    
    console.log("📈 By Review Count:");
    Object.entries(stats.byReviewRange).forEach(([range, count]) => {
      console.log(`  - ${range}: ${count}`);
    });
    
    console.log("\n🏙️ Top Cities:");
    Object.entries(stats.byCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`  - ${city}: ${count}`);
      });
    
    console.log("\n🏢 Sample virgin businesses:");
    finalBusinesses.slice(0, 10).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   - City: ${business.city}`);
      console.log(`   - Reviews: ${business.reviewCount || 0}`);
      console.log(`   - PlaceId: ${business.placeId}`);
    });
    
    // Save for bulk scheduling
    if (finalBusinesses.length > 0) {
      const fs = await import('fs');
      const businessData = finalBusinesses.map(b => ({
        businessId: b._id,
        placeId: b.placeId,
        name: b.name,
        city: b.city,
        reviewCount: b.reviewCount || 0,
      }));
      
      fs.writeFileSync('virgin-businesses.json', JSON.stringify(businessData, null, 2));
      console.log(`\n✅ Saved ${finalBusinesses.length} virgin businesses to virgin-businesses.json`);
      console.log("   Run 'npm run schedule-virgin' to add them to queue");
    } else {
      console.log("\n❌ No virgin businesses found!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the search
findVirginBusinesses();