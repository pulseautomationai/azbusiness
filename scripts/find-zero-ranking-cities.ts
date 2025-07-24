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

async function findZeroRankingCities() {
  console.log("🔍 Finding ALL cities with zero rankings...\n");
  
  try {
    // Get all active businesses by querying without filters
    console.log("📊 Loading all businesses...");
    
    // Get all categories first to iterate through
    const categories = await client.query(api.categories.getCategories, {});
    
    // Collect all businesses by querying each category
    const allBusinesses: any[] = [];
    const businessIds = new Set<string>();
    
    for (const category of categories) {
      const categoryBusinesses = await client.query(api.businesses.getBusinesses, {
        categorySlug: category.slug,
        limit: 1000,
      });
      
      // Add only unique businesses
      categoryBusinesses.forEach(business => {
        if (!businessIds.has(business._id)) {
          businessIds.add(business._id);
          allBusinesses.push(business);
        }
      });
    }
    
    console.log(`✅ Found ${allBusinesses.length} total businesses\n`);
    
    // Get all cities from the businesses
    const cityMap = new Map<string, any[]>();
    allBusinesses.forEach(business => {
      if (business.city && business.active) {
        const cityKey = business.city.toLowerCase().trim();
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, []);
        }
        cityMap.get(cityKey)!.push(business);
      }
    });
    
    console.log(`🏙️ Found ${cityMap.size} unique cities with businesses\n`);
    
    // Check which cities have rankings
    console.log("🏆 Checking for cities with rankings...");
    const citiesWithRankings = new Set<string>();
    
    // For each category, get top rankings and collect cities
    console.log(`📊 Checking rankings across ${categories.length} categories...`);
    for (const category of categories) {
      try {
        const rankings = await client.query(api.rankings.realtimeUpdates.subscribeToCategoryRankings, {
          category: category.slug,
          limit: 100, // Get top 100 per category to find all cities with rankings
        });
        
        rankings.forEach(ranking => {
          if (ranking.city) {
            citiesWithRankings.add(ranking.city.toLowerCase().trim());
          }
        });
      } catch (error) {
        // Category might not have rankings yet
      }
    }
    
    console.log(`✅ Found ${citiesWithRankings.size} cities with rankings\n`);
    
    // Find cities with ZERO rankings
    const zeroRankingCities: string[] = [];
    const citiesWithBusinessesNoRankings: Array<{
      city: string;
      businessCount: number;
      eligibleBusinesses: any[];
    }> = [];
    
    for (const [cityKey, businesses] of cityMap.entries()) {
      if (!citiesWithRankings.has(cityKey)) {
        const cityName = businesses[0].city; // Get proper case city name
        zeroRankingCities.push(cityName);
        
        // Find businesses eligible for review import (have placeId, active, no recent sync)
        const eligible = businesses.filter(b => 
          b.placeId && 
          b.active && 
          !b.lastReviewSync
        );
        
        if (eligible.length > 0) {
          citiesWithBusinessesNoRankings.push({
            city: cityName,
            businessCount: businesses.length,
            eligibleBusinesses: eligible,
          });
        }
      }
    }
    
    // Sort by business count (descending)
    citiesWithBusinessesNoRankings.sort((a, b) => b.businessCount - a.businessCount);
    
    console.log(`🚨 Found ${zeroRankingCities.length} cities with ZERO rankings!\n`);
    
    // Show top cities by business count
    console.log("📊 Top 20 cities with NO rankings (by business count):");
    citiesWithBusinessesNoRankings.slice(0, 20).forEach((cityData, index) => {
      console.log(`${index + 1}. ${cityData.city}: ${cityData.businessCount} businesses (${cityData.eligibleBusinesses.length} eligible for import)`);
    });
    
    // Collect all eligible businesses from zero-ranking cities
    const allEligibleBusinesses: any[] = [];
    citiesWithBusinessesNoRankings.forEach(cityData => {
      cityData.eligibleBusinesses.forEach(business => {
        allEligibleBusinesses.push({
          businessId: business._id,
          placeId: business.placeId,
          name: business.name,
          city: business.city,
          reviewCount: business.reviewCount || 0,
          categoryId: business.categoryId,
        });
      });
    });
    
    // Sort by priority: zero reviews first
    allEligibleBusinesses.sort((a, b) => {
      const aZero = !a.reviewCount || a.reviewCount === 0;
      const bZero = !b.reviewCount || b.reviewCount === 0;
      
      if (aZero && !bZero) return -1;
      if (!aZero && bZero) return 1;
      
      return 0;
    });
    
    // Show statistics
    console.log("\n📊 Statistics:");
    console.log(`  - Total cities with zero rankings: ${zeroRankingCities.length}`);
    console.log(`  - Total businesses in these cities: ${citiesWithBusinessesNoRankings.reduce((sum, c) => sum + c.businessCount, 0)}`);
    console.log(`  - Eligible businesses for import: ${allEligibleBusinesses.length}`);
    console.log(`  - Zero-review businesses: ${allEligibleBusinesses.filter(b => !b.reviewCount || b.reviewCount === 0).length}`);
    
    // Show sample businesses
    console.log("\n🏢 Sample eligible businesses from zero-ranking cities:");
    allEligibleBusinesses.slice(0, 10).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   - City: ${business.city}`);
      console.log(`   - Reviews: ${business.reviewCount || 0}`);
    });
    
    // Save results
    if (allEligibleBusinesses.length > 0) {
      const fs = await import('fs');
      
      // Save eligible businesses
      fs.writeFileSync('zero-ranking-cities-businesses.json', JSON.stringify(allEligibleBusinesses, null, 2));
      console.log(`\n✅ Saved ${allEligibleBusinesses.length} eligible businesses to zero-ranking-cities-businesses.json`);
      
      // Save city statistics
      const cityStats = citiesWithBusinessesNoRankings.map(c => ({
        city: c.city,
        totalBusinesses: c.businessCount,
        eligibleForImport: c.eligibleBusinesses.length,
      }));
      
      fs.writeFileSync('zero-ranking-cities-stats.json', JSON.stringify(cityStats, null, 2));
      console.log(`✅ Saved city statistics to zero-ranking-cities-stats.json`);
      
      console.log("\n🚀 Next steps:");
      console.log("   1. Review the cities and businesses found");
      console.log("   2. Run 'npm run schedule-zero-ranking' to add them to import queue");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the search
findZeroRankingCities();