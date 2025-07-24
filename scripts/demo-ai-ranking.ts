/**
 * Demo AI Ranking System
 * Shows how AI analysis would affect rankings
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

// Mock AI analysis for demonstration
function mockAIAnalysis(businessName: string, rating: number, reviewCount: number, tier: string) {
  // Simulate AI-extracted insights based on business characteristics
  const baseQuality = rating / 5;
  const tierMultiplier = tier === 'power' ? 1.15 : tier === 'pro' ? 1.1 : tier === 'starter' ? 1.05 : 1.0;
  
  // Simulate performance scores (0-10)
  const scores = {
    speed: (baseQuality * 8 + Math.random() * 2) * tierMultiplier,
    value: (baseQuality * 7.5 + Math.random() * 2.5) * tierMultiplier,
    quality: (baseQuality * 9 + Math.random() * 1) * tierMultiplier,
    reliability: (baseQuality * 8.5 + Math.random() * 1.5) * tierMultiplier,
    expertise: (baseQuality * 8 + Math.random() * 2) * tierMultiplier,
    customerImpact: (baseQuality * 8.5 + Math.random() * 1.5) * tierMultiplier,
  };

  // Keywords would be extracted from reviews
  const keywordPools = {
    excellent: ['professional', 'excellent', 'outstanding', 'exceptional', 'best'],
    good: ['quality', 'reliable', 'efficient', 'friendly', 'responsive'],
    service: ['fast', 'prompt', 'thorough', 'knowledgeable', 'experienced'],
  };

  const keywords = [
    ...keywordPools.excellent.slice(0, Math.floor(baseQuality * 3)),
    ...keywordPools.good.slice(0, Math.floor(baseQuality * 2)),
    ...keywordPools.service.slice(0, Math.floor(baseQuality * 2)),
  ];

  // Sample customer quotes
  const quotes = rating >= 4.5 ? [
    "Absolutely the best service I've ever received!",
    "They went above and beyond my expectations.",
    "Professional, courteous, and highly skilled team."
  ] : rating >= 4 ? [
    "Great service at a fair price.",
    "Very satisfied with their work.",
    "Would definitely use them again."
  ] : [];

  return {
    scores,
    keywords,
    quotes: quotes.slice(0, 2),
    confidence: 75 + reviewCount / 10,
  };
}

async function demoAIRanking() {
  console.log("🎯 AI-Powered Ranking System Demo");
  console.log("================================\n");
  console.log("This demo shows how AI analysis affects business rankings.\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Get businesses
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 20
    });

    // Filter to businesses with reviews
    const testBusinesses = businesses
      .filter(b => b.reviewCount && b.reviewCount > 0)
      .slice(0, 10);

    console.log("📊 Analyzing businesses with simulated AI...\n");

    // Process each business with mock AI
    const analyzedBusinesses = testBusinesses.map(business => {
      const analysis = mockAIAnalysis(
        business.name,
        business.rating || 0,
        business.reviewCount || 0,
        business.planTier
      );

      // Calculate ranking score
      const baseScore = Object.values(analysis.scores).reduce((a, b) => a + b, 0) / 6 * 10; // Average * 10
      const volumeBonus = Math.min(10, Math.log10(business.reviewCount + 1) * 4);
      const tierBonus = 
        business.planTier === 'power' ? 15 :
        business.planTier === 'pro' ? 10 :
        business.planTier === 'starter' ? 5 : 0;
      
      const totalScore = baseScore + volumeBonus + tierBonus;

      return {
        ...business,
        aiAnalysis: analysis,
        rankingScore: totalScore,
        scoreBreakdown: {
          base: baseScore,
          volume: volumeBonus,
          tier: tierBonus,
        }
      };
    });

    // Sort by ranking score
    analyzedBusinesses.sort((a, b) => b.rankingScore - a.rankingScore);

    // Display results
    console.log("🏆 AI-POWERED RANKINGS\n");
    
    analyzedBusinesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.city})`);
      console.log(`   Tier: ${business.planTier.toUpperCase()} | Rating: ${business.rating}⭐ | Reviews: ${business.reviewCount}`);
      console.log(`   AI Performance Scores:`);
      console.log(`      Speed: ${business.aiAnalysis.scores.speed.toFixed(1)}/10`);
      console.log(`      Quality: ${business.aiAnalysis.scores.quality.toFixed(1)}/10`);
      console.log(`      Value: ${business.aiAnalysis.scores.value.toFixed(1)}/10`);
      console.log(`      Reliability: ${business.aiAnalysis.scores.reliability.toFixed(1)}/10`);
      console.log(`   Keywords: ${business.aiAnalysis.keywords.join(', ')}`);
      if (business.aiAnalysis.quotes.length > 0) {
        console.log(`   Top Quote: "${business.aiAnalysis.quotes[0]}"`);
      }
      console.log(`   📊 RANKING SCORE: ${business.rankingScore.toFixed(1)}`);
      console.log(`      (Base: ${business.scoreBreakdown.base.toFixed(1)} + Volume: ${business.scoreBreakdown.volume.toFixed(1)} + Tier: ${business.scoreBreakdown.tier})\n`);
    });

    // Tier analysis
    console.log("\n📈 TIER PERFORMANCE ANALYSIS\n");
    
    const tierGroups = {
      power: analyzedBusinesses.filter(b => b.planTier === 'power'),
      pro: analyzedBusinesses.filter(b => b.planTier === 'pro'),
      starter: analyzedBusinesses.filter(b => b.planTier === 'starter'),
      free: analyzedBusinesses.filter(b => b.planTier === 'free'),
    };

    Object.entries(tierGroups).forEach(([tier, businesses]) => {
      if (businesses.length > 0) {
        const avgScore = businesses.reduce((sum, b) => sum + b.rankingScore, 0) / businesses.length;
        const topPositions = businesses.filter((b, i) => analyzedBusinesses.indexOf(b) < 5).length;
        
        console.log(`${tier.toUpperCase()} Tier (${businesses.length} businesses):`);
        console.log(`   Average Score: ${avgScore.toFixed(1)}`);
        console.log(`   In Top 5: ${topPositions} businesses`);
        
        if (tier !== 'free') {
          const bonus = tier === 'power' ? 15 : tier === 'pro' ? 10 : 5;
          console.log(`   Tier Bonus: +${bonus} points`);
        }
        console.log('');
      }
    });

    // AI insights summary
    console.log("\n🤖 AI ANALYSIS INSIGHTS\n");
    console.log("1. AI analyzes review content to extract performance metrics");
    console.log("2. Businesses with higher tiers get slight quality multipliers");
    console.log("3. Volume bonus rewards businesses with more reviews");
    console.log("4. Tier bonus ensures paying customers get visibility boost");
    console.log("5. Keywords and quotes provide rich content for profiles");
    
    console.log("\n💡 KEY BENEFITS:");
    console.log("- FREE businesses can still rank #1 with excellent service");
    console.log("- PAID tiers get guaranteed visibility boost (5-15 points)");
    console.log("- AI ensures quality service is recognized regardless of tier");
    console.log("- Rich insights help customers make informed decisions");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demoAIRanking().catch(console.error);
}

export { demoAIRanking };