/**
 * Ranking Simulation
 * Shows how ranking would work based on stored data
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function simulateRanking() {
  console.log("🎯 AI Ranking Simulation");
  console.log("=======================\n");
  console.log("This simulation shows how businesses would rank based on their stored data.\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Get businesses with reviews
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 20
    });

    // Filter and prepare ranking data
    const businessesWithScores = businesses
      .filter(b => b.reviewCount && b.reviewCount > 0)
      .map(business => {
        // Base score from rating (0-100)
        const ratingScore = (business.rating || 0) * 20;
        
        // Volume bonus (logarithmic, up to 15 points)
        const volumeScore = Math.min(15, Math.log10(business.reviewCount + 1) * 5);
        
        // Tier bonus
        const tierScore = 
          business.planTier === 'power' ? 15 :
          business.planTier === 'pro' ? 10 :
          business.planTier === 'starter' ? 5 : 0;
        
        // Simulated quality indicators (would come from AI analysis)
        const qualityMultiplier = business.rating >= 4.8 ? 1.1 : 1.0;
        
        // Total score
        const totalScore = (ratingScore + volumeScore) * qualityMultiplier + tierScore;
        
        return {
          name: business.name,
          city: business.city,
          category: business.categoryId,
          tier: business.planTier,
          rating: business.rating,
          reviewCount: business.reviewCount,
          scores: {
            rating: ratingScore,
            volume: volumeScore,
            tier: tierScore,
            quality: qualityMultiplier,
            total: totalScore
          }
        };
      })
      .sort((a, b) => b.scores.total - a.scores.total);

    // Display results
    console.log("🏆 TOP 10 BUSINESSES BY RANKING SCORE\n");
    
    businessesWithScores.slice(0, 10).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.city})`);
      console.log(`   Tier: ${business.tier.toUpperCase()} | Rating: ${business.rating}⭐ | Reviews: ${business.reviewCount}`);
      console.log(`   Score Breakdown:`);
      console.log(`   - Rating Score: ${business.scores.rating.toFixed(1)}/100`);
      console.log(`   - Volume Bonus: +${business.scores.volume.toFixed(1)}`);
      console.log(`   - Tier Bonus: +${business.scores.tier}`);
      console.log(`   - Quality Multiplier: ${business.scores.quality}x`);
      console.log(`   📊 TOTAL SCORE: ${business.scores.total.toFixed(1)}\n`);
    });

    // Tier distribution analysis
    console.log("\n📈 INSIGHTS BY TIER\n");
    
    const tierGroups = {
      power: businessesWithScores.filter(b => b.tier === 'power'),
      pro: businessesWithScores.filter(b => b.tier === 'pro'),
      starter: businessesWithScores.filter(b => b.tier === 'starter'),
      free: businessesWithScores.filter(b => b.tier === 'free')
    };

    Object.entries(tierGroups).forEach(([tier, businesses]) => {
      if (businesses.length > 0) {
        const avgScore = businesses.reduce((sum, b) => sum + b.scores.total, 0) / businesses.length;
        const topRanked = businesses.filter((_, index) => index < 10).length;
        
        console.log(`${tier.toUpperCase()} Tier:`);
        console.log(`  - Businesses: ${businesses.length}`);
        console.log(`  - Avg Score: ${avgScore.toFixed(1)}`);
        console.log(`  - In Top 10: ${topRanked} (${(topRanked / Math.min(10, businessesWithScores.length) * 100).toFixed(0)}%)`);
      }
    });

    // Ranking factors explanation
    console.log("\n\n🎯 HOW RANKING WORKS\n");
    console.log("1. BASE SCORE (0-100): Rating × 20");
    console.log("   - 5.0 stars = 100 points");
    console.log("   - 4.5 stars = 90 points");
    console.log("   - 4.0 stars = 80 points");
    
    console.log("\n2. VOLUME BONUS (0-15): Logarithmic scale based on review count");
    console.log("   - 10 reviews ≈ 5 points");
    console.log("   - 100 reviews ≈ 10 points");
    console.log("   - 500+ reviews ≈ 13-15 points");
    
    console.log("\n3. TIER BONUS: Ensures paying customers get visibility");
    console.log("   - Power: +15 points");
    console.log("   - Pro: +10 points");
    console.log("   - Starter: +5 points");
    console.log("   - Free: +0 points");
    
    console.log("\n4. QUALITY MULTIPLIER: AI-detected excellence (future)");
    console.log("   - Exceptional service: 1.1x multiplier");
    console.log("   - Standard service: 1.0x multiplier");
    
    console.log("\n\n💡 NEXT STEPS FOR REAL IMPLEMENTATION");
    console.log("1. Deploy optimized review fetching functions");
    console.log("2. Implement AI analysis for review content");
    console.log("3. Add achievement detection based on review patterns");
    console.log("4. Create category-specific and city-specific rankings");
    console.log("5. Build real-time ranking updates as new reviews come in");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run simulation
if (import.meta.url === `file://${process.argv[1]}`) {
  simulateRanking().catch(console.error);
}

export { simulateRanking };