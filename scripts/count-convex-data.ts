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

async function countData() {
  console.log("📊 Getting actual data counts from Convex...\n");
  
  try {
    // Use the admin analytics to get counts
    const metrics = await client.query(api.adminAnalytics.getAdminDashboardMetrics);
    
    console.log("📍 Business Statistics:");
    console.log(`  - Total Businesses: ${metrics.businesses.total.toLocaleString()}`);
    console.log(`  - Claimed Businesses: ${metrics.businesses.claimed}`);
    console.log(`  - Verified Businesses: ${metrics.businesses.verified}`);
    console.log(`  - Claim Rate: ${metrics.businesses.claimRate.toFixed(1)}%`);
    
    console.log("\n💬 Review Statistics:");
    console.log(`  - Total Reviews: ${metrics.reviews.total.toLocaleString()}`);
    console.log(`  - Verified Reviews: ${metrics.reviews.verified.toLocaleString()}`);
    console.log(`  - Average per Business: ${metrics.reviews.averagePerBusiness.toFixed(1)}`);
    console.log(`  - Recent Reviews (this month): ${metrics.reviews.recentReviews}`);
    
    console.log("\n📈 Plan Distribution:");
    const plans = metrics.businesses.planDistribution;
    console.log(`  - Free: ${plans.free || 0}`);
    console.log(`  - Starter: ${plans.starter || 0}`);
    console.log(`  - Pro: ${plans.pro || 0}`);
    console.log(`  - Power: ${plans.power || 0}`);
    
    console.log("\n👥 User & Subscription Statistics:");
    console.log(`  - Total Users: ${metrics.subscriptions.total || 0}`);
    console.log(`  - Active Subscriptions: ${metrics.subscriptions.active}`);
    console.log(`  - Monthly Recurring Revenue: $${metrics.revenue.total.toFixed(2)}`);
    
    // Now let's get businesses by city to verify totals
    console.log("\n🏙️ Checking businesses by city...");
    const cityList = await client.query(api.cities.list);
    
    let totalByCity = 0;
    for (const city of cityList.slice(0, 5)) { // Check first 5 cities
      const businessesInCity = await client.query(api.businesses.getBusinesses, {
        citySlug: city.slug,
      });
      console.log(`  - ${city.name}: ${businessesInCity.length} businesses`);
      totalByCity += businessesInCity.length;
    }
    
    console.log(`\n✨ Data appears to be from platform stats which shows:`);
    console.log(`  - ${metrics.businesses.total} total businesses`);
    console.log(`  - ${metrics.reviews.total} total reviews`);
    console.log(`\nThese counts seem low. The platform stats may need to be rebuilt.`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the count
countData();