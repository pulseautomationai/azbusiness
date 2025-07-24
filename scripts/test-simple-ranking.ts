/**
 * Simple Ranking Test
 * Works with the current ultra-conservative review limits
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testSimpleRanking() {
  console.log("🎯 Simple AI Ranking Test");
  console.log("========================\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // 1. Get some businesses
    console.log("📋 Finding businesses to test...");
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 10
    });

    if (businesses.length === 0) {
      console.log("❌ No businesses found!");
      return;
    }

    console.log(`✅ Found ${businesses.length} businesses\n`);

    // 2. Process each business
    const results = [];
    
    for (let i = 0; i < Math.min(5, businesses.length); i++) {
      const business = businesses[i];
      console.log(`\n🏢 Testing Business ${i + 1}: ${business.name}`);
      console.log(`   City: ${business.city}`);
      console.log(`   Tier: ${business.planTier}`);
      console.log(`   Current Scores: Speed=${business.speedScore || 'N/A'}, Quality=${business.qualityScore || 'N/A'}`);
      
      try {
        // Get reviews (limited to 3 by the function)
        const reviews = await client.query(api.businesses.getBusinessReviews, {
          businessId: business._id,
          limit: 3
        });
        
        console.log(`   Reviews found: ${reviews.length}`);
        
        if (reviews.length > 0) {
          // Calculate simple metrics
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          const hasPositiveReviews = reviews.filter(r => r.rating >= 4).length;
          
          console.log(`   Average Rating: ${avgRating.toFixed(2)}/5`);
          console.log(`   Positive Reviews: ${hasPositiveReviews}/${reviews.length}`);
          
          // Show review snippets
          console.log(`   Review Samples:`);
          reviews.forEach((review, idx) => {
            const snippet = review.comment ? 
              review.comment.substring(0, 100) + (review.comment.length > 100 ? '...' : '') : 
              'No comment';
            console.log(`     ${idx + 1}. ⭐${review.rating} - "${snippet}"`);
          });
          
          // Calculate mock ranking score
          const baseScore = avgRating * 20; // 0-100 scale
          const tierBonus = business.planTier === 'power' ? 10 : business.planTier === 'pro' ? 5 : 0;
          const rankingScore = Math.min(100, baseScore + tierBonus);
          
          results.push({
            name: business.name,
            city: business.city,
            tier: business.planTier,
            avgRating,
            reviewCount: reviews.length,
            rankingScore
          });
          
          console.log(`   📊 Ranking Score: ${rankingScore.toFixed(1)}/100 (includes ${tierBonus} tier bonus)`);
        } else {
          console.log(`   ⚠️  No reviews found - cannot calculate ranking`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error getting reviews: ${error}`);
      }
    }
    
    // 3. Show final rankings
    if (results.length > 0) {
      console.log("\n\n🏆 Final Rankings");
      console.log("================");
      
      const sorted = results.sort((a, b) => b.rankingScore - a.rankingScore);
      sorted.forEach((business, index) => {
        console.log(`\n${index + 1}. ${business.name} (${business.city})`);
        console.log(`   Tier: ${business.tier} | Score: ${business.rankingScore.toFixed(1)}/100`);
        console.log(`   Based on: ${business.avgRating.toFixed(1)}⭐ average from ${business.reviewCount} reviews`);
      });
    }
    
    console.log("\n\n💡 Key Insights:");
    console.log("- Current system limits to 3 reviews per query (ultra-conservative)");
    console.log("- Real AI analysis will examine review content, not just ratings");
    console.log("- Rankings will consider multiple factors beyond star ratings");
    console.log("- Tier bonuses ensure paying customers get visibility benefits");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSimpleRanking().catch(console.error);
}

export { testSimpleRanking };