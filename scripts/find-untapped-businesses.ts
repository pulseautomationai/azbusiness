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

async function findUntappedBusinesses() {
  console.log("🔍 Finding untapped businesses in smaller cities and specific categories...\n");
  
  try {
    // Small/medium Arizona cities often overlooked
    const untappedCities = [
      // East Valley suburbs
      'Apache Junction', 'Queen Creek', 'San Tan Valley', 'Gold Canyon',
      
      // West Valley
      'Litchfield Park', 'Tolleson', 'El Mirage', 'Youngtown', 'Waddell',
      
      // North Phoenix area
      'Cave Creek', 'Carefree', 'New River', 'Anthem', 'Desert Hills',
      
      // Pinal County
      'Florence', 'Eloy', 'Coolidge', 'Casa Grande', 'Maricopa',
      
      // Northern Arizona
      'Sedona', 'Cottonwood', 'Camp Verde', 'Payson', 'Show Low',
      
      // Southern Arizona  
      'Sierra Vista', 'Benson', 'Willcox', 'Bisbee', 'Douglas',
      
      // Western Arizona
      'Lake Havasu City', 'Bullhead City', 'Kingman', 'Parker', 'Quartzsite',
      
      // Other areas
      'Wickenburg', 'Superior', 'Globe', 'Miami', 'Safford'
    ];
    
    console.log(`🏙️ Searching ${untappedCities.length} smaller Arizona cities...\n`);
    
    const untappedBusinesses = [];
    const cityStats: Record<string, number> = {};
    
    for (const city of untappedCities) {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      
      try {
        const cityBusinesses = await client.query(api.businesses.getBusinesses, {
          citySlug: citySlug,
          limit: 100,
        });
        
        if (cityBusinesses.length === 0) {
          // Try without slug (direct city name)
          const directCityBusinesses = await client.query(api.businesses.getBusinesses, {
            limit: 100,
          });
          
          const filtered = directCityBusinesses.filter(b => 
            b.city?.toLowerCase() === city.toLowerCase() && 
            b.placeId && 
            b.active &&
            !b.lastReviewSync
          );
          
          if (filtered.length > 0) {
            cityStats[city] = filtered.length;
            untappedBusinesses.push(...filtered);
            console.log(`✅ ${city}: Found ${filtered.length} untapped businesses`);
          }
        } else {
          const eligible = cityBusinesses.filter(b => 
            b.placeId && 
            b.active && 
            !b.lastReviewSync
          );
          
          if (eligible.length > 0) {
            cityStats[city] = eligible.length;
            untappedBusinesses.push(...eligible);
            console.log(`✅ ${city}: Found ${eligible.length} untapped businesses`);
          }
        }
      } catch (error) {
        // Skip cities with errors
      }
    }
    
    // Also search by categories with low coverage
    console.log("\n🏢 Searching specific business categories...\n");
    
    const targetCategories = [
      'home-services', 'automotive', 'health-medical', 'professional-services',
      'real-estate', 'legal', 'financial-services', 'education',
      'beauty-spas', 'contractors', 'plumbers', 'electricians'
    ];
    
    for (const category of targetCategories) {
      try {
        const categoryBusinesses = await client.query(api.businesses.getBusinesses, {
          categorySlug: category,
          limit: 100,
        });
        
        const eligible = categoryBusinesses.filter(b => 
          b.placeId && 
          b.active && 
          !b.lastReviewSync &&
          (!b.reviewCount || b.reviewCount === 0)
        );
        
        if (eligible.length > 0) {
          console.log(`✅ ${category}: Found ${eligible.length} zero-review businesses`);
          untappedBusinesses.push(...eligible);
        }
      } catch (error) {
        // Skip categories with errors
      }
    }
    
    // Remove duplicates
    const uniqueBusinesses = Array.from(
      new Map(untappedBusinesses.map(b => [b._id, b])).values()
    );
    
    // Sort by priority: zero reviews first, then by city
    uniqueBusinesses.sort((a, b) => {
      const aZero = !a.reviewCount || a.reviewCount === 0;
      const bZero = !b.reviewCount || b.reviewCount === 0;
      
      if (aZero && !bZero) return -1;
      if (!aZero && bZero) return 1;
      
      return 0;
    });
    
    // Analyze results
    const stats = {
      total: uniqueBusinesses.length,
      zeroReviews: uniqueBusinesses.filter(b => !b.reviewCount || b.reviewCount === 0).length,
      byCity: cityStats,
    };
    
    console.log("\n📊 Untapped Businesses Found:");
    console.log(`  - Total unique: ${stats.total}`);
    console.log(`  - Zero reviews: ${stats.zeroReviews}`);
    
    console.log("\n🏢 Sample untapped businesses:");
    uniqueBusinesses.slice(0, 10).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   - City: ${business.city}`);
      console.log(`   - Category: ${business.categoryId}`);
      console.log(`   - Reviews: ${business.reviewCount || 0}`);
    });
    
    // Save for scheduling
    if (uniqueBusinesses.length > 0) {
      const fs = await import('fs');
      const businessData = uniqueBusinesses.map(b => ({
        businessId: b._id,
        placeId: b.placeId,
        name: b.name,
        city: b.city,
        reviewCount: b.reviewCount || 0,
      }));
      
      fs.writeFileSync('untapped-businesses.json', JSON.stringify(businessData, null, 2));
      console.log(`\n✅ Saved ${uniqueBusinesses.length} untapped businesses to untapped-businesses.json`);
      console.log("   Run 'npm run schedule-untapped' to add them to queue");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the search
findUntappedBusinesses();