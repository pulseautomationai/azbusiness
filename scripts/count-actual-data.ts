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

async function countActualData() {
  console.log("📊 Counting actual data in Convex database...\n");
  
  try {
    // Get businesses count
    const businesses = await client.query(api.businesses.getAllBusinesses);
    console.log(`📍 Total Businesses: ${businesses.length.toLocaleString()}`);
    
    // Count claimed businesses
    const claimedBusinesses = businesses.filter(b => b.claimed || b.claimedAt).length;
    console.log(`✅ Claimed Businesses: ${claimedBusinesses}`);
    
    // Count verified businesses
    const verifiedBusinesses = businesses.filter(b => b.verified).length;
    console.log(`🏆 Verified Businesses: ${verifiedBusinesses}`);
    
    // Count plan distribution
    const planDistribution = {
      free: 0,
      starter: 0,
      pro: 0,
      power: 0
    };
    
    businesses.forEach(business => {
      const tier = business.planTier || 'free';
      if (tier in planDistribution) {
        planDistribution[tier as keyof typeof planDistribution]++;
      } else {
        planDistribution.free++;
      }
    });
    
    console.log(`\n📈 Plan Distribution:`);
    console.log(`  - Free: ${planDistribution.free}`);
    console.log(`  - Starter: ${planDistribution.starter}`);
    console.log(`  - Pro: ${planDistribution.pro}`);
    console.log(`  - Power: ${planDistribution.power}`);
    
    // Get reviews count - we'll need to count in batches
    console.log(`\n💬 Counting reviews (this may take a moment)...`);
    let totalReviews = 0;
    let verifiedReviews = 0;
    
    // Count reviews for each business
    for (const business of businesses) {
      try {
        const reviews = await client.query(api.reviews.getBusinessReviews, { 
          businessId: business._id 
        });
        totalReviews += reviews.length;
        verifiedReviews += reviews.filter(r => r.verified).length;
      } catch (error) {
        // Skip if there's an error getting reviews for this business
      }
    }
    
    console.log(`💬 Total Reviews: ${totalReviews.toLocaleString()}`);
    console.log(`✅ Verified Reviews: ${verifiedReviews.toLocaleString()}`);
    console.log(`📊 Average Reviews per Business: ${(totalReviews / businesses.length).toFixed(1)}`);
    
    // Get users count
    const users = await client.query(api.users.list);
    console.log(`\n👥 Total Users: ${users.length}`);
    
    // Get subscriptions
    const subscriptions = await client.query(api.subscriptions.list);
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === "active" || sub.status === "trialing"
    );
    console.log(`💳 Active Subscriptions: ${activeSubscriptions.length}`);
    
    console.log(`\n✨ Summary for updating platform stats:`);
    console.log(`- Total Businesses: ${businesses.length}`);
    console.log(`- Total Reviews: ${totalReviews}`);
    console.log(`- Claimed Businesses: ${claimedBusinesses}`);
    console.log(`- Verified Businesses: ${verifiedBusinesses}`);
    
  } catch (error) {
    console.error("❌ Error counting data:", error);
  }
}

// Run the count
countActualData();