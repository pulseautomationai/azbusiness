/**
 * Test Ranking with Optimized Review Fetching
 * Processes businesses with up to 200 reviews
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testRankingWithReviews() {
  console.log("🚀 AI Ranking Test with Real Reviews");
  console.log("===================================\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // 1. Get businesses
    console.log("📋 Step 1: Finding businesses with reviews...");
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 10
    });

    // Filter to only businesses with reviews
    const businessesWithReviews = businesses.filter(b => b.reviewCount && b.reviewCount > 0);
    
    console.log(`Found ${businessesWithReviews.length} businesses with reviews\n`);

    if (businessesWithReviews.length === 0) {
      console.log("❌ No businesses with reviews found!");
      return;
    }

    // 2. Process top 5 businesses
    const results = [];
    const topBusinesses = businessesWithReviews.slice(0, 5);

    for (let i = 0; i < topBusinesses.length; i++) {
      const business = topBusinesses[i];
      console.log(`\n🏢 Processing ${i + 1}/5: ${business.name}`);
      console.log(`   Location: ${business.city}`);
      console.log(`   Tier: ${business.planTier}`);
      console.log(`   Stored Review Count: ${business.reviewCount}`);
      console.log(`   Stored Rating: ${business.rating}`);

      try {
        // Get review stats first
        const stats = await client.query(api.optimizedReviews.getBusinessReviewStats, {
          businessId: business._id
        });

        if (stats) {
          console.log(`\n   📊 Review Statistics:`);
          console.log(`      Total Reviews: ${stats.totalReviews}`);
          console.log(`      Average Rating: ${stats.avgRating}/5`);
          console.log(`      Recent Trend: ${stats.recentTrend.direction} (${stats.recentTrend.avgRating}/5)`);
          console.log(`      Rating Distribution:`);
          console.log(`         5⭐: ${stats.distribution[5]} reviews`);
          console.log(`         4⭐: ${stats.distribution[4]} reviews`);
          console.log(`         3⭐: ${stats.distribution[3]} reviews`);
          console.log(`         2⭐: ${stats.distribution[2]} reviews`);
          console.log(`         1⭐: ${stats.distribution[1]} reviews`);

          // Get sample reviews for analysis
          const sampleData = await client.query(api.optimizedReviews.sampleBusinessReviews, {
            businessId: business._id,
            sampleSize: 50
          });

          console.log(`\n   🔍 Sample Analysis (${sampleData.reviews.length} reviews):`);
          
          // Analyze the sample
          const keywords: Record<string, number> = {};
          const sentiments = { positive: 0, neutral: 0, negative: 0 };
          const quotes: string[] = [];

          sampleData.reviews.forEach(review => {
            // Sentiment based on rating
            if (review.rating >= 4) sentiments.positive++;
            else if (review.rating === 3) sentiments.neutral++;
            else sentiments.negative++;

            // Extract keywords
            if (review.comment) {
              const words = review.comment.toLowerCase().split(/\s+/);
              const importantWords = [
                'professional', 'excellent', 'great', 'fast', 'quality', 
                'reliable', 'honest', 'fair', 'clean', 'friendly',
                'responsive', 'knowledgeable', 'efficient', 'thorough',
                'recommended', 'best', 'amazing', 'outstanding'
              ];
              
              words.forEach(word => {
                if (importantWords.includes(word)) {
                  keywords[word] = (keywords[word] || 0) + 1;
                }
              });

              // Extract good quotes from high-rated reviews
              if (review.rating >= 4 && review.comment.length > 50) {
                const sentences = review.comment.split(/[.!?]+/).filter(s => s.trim().length > 20);
                if (sentences.length > 0 && quotes.length < 3) {
                  quotes.push(sentences[0].trim());
                }
              }
            }
          });

          // Show top keywords
          const topKeywords = Object.entries(keywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          console.log(`      Sentiment: ${sentiments.positive} positive, ${sentiments.neutral} neutral, ${sentiments.negative} negative`);
          console.log(`      Top Keywords:`);
          topKeywords.forEach(([word, count]) => {
            console.log(`         - ${word}: ${count} mentions`);
          });

          if (quotes.length > 0) {
            console.log(`      Customer Quotes:`);
            quotes.forEach((quote, idx) => {
              console.log(`         ${idx + 1}. "${quote}"`);
            });
          }

          // Calculate ranking score
          const baseScore = stats.avgRating * 20; // 0-100
          const volumeBonus = Math.min(10, Math.log10(stats.totalReviews + 1) * 5); // Up to 10 points for volume
          const trendBonus = stats.recentTrend.direction === 'improving' ? 5 : 0;
          const tierBonus = business.planTier === 'power' ? 10 : business.planTier === 'pro' ? 5 : 0;
          const sentimentBonus = (sentiments.positive / sampleData.reviews.length) * 10; // Up to 10 points
          
          const totalScore = baseScore + volumeBonus + trendBonus + tierBonus + sentimentBonus;

          console.log(`\n   🎯 Ranking Score Breakdown:`);
          console.log(`      Base Score (rating): ${baseScore.toFixed(1)}/100`);
          console.log(`      Volume Bonus: +${volumeBonus.toFixed(1)}`);
          console.log(`      Trend Bonus: +${trendBonus}`);
          console.log(`      Tier Bonus: +${tierBonus}`);
          console.log(`      Sentiment Bonus: +${sentimentBonus.toFixed(1)}`);
          console.log(`      TOTAL SCORE: ${totalScore.toFixed(1)}/125`);

          results.push({
            name: business.name,
            city: business.city,
            tier: business.planTier,
            totalReviews: stats.totalReviews,
            avgRating: stats.avgRating,
            score: totalScore,
            trend: stats.recentTrend.direction,
          });
        }
      } catch (error) {
        console.error(`   ❌ Error processing: ${error}`);
      }
    }

    // 3. Show final rankings
    if (results.length > 0) {
      console.log("\n\n🏆 FINAL RANKINGS");
      console.log("=================");
      
      const sorted = results.sort((a, b) => b.score - a.score);
      sorted.forEach((business, index) => {
        console.log(`\n${index + 1}. ${business.name} (${business.city})`);
        console.log(`   Score: ${business.score.toFixed(1)}/125 | Tier: ${business.tier}`);
        console.log(`   Rating: ${business.avgRating}⭐ from ${business.totalReviews} reviews`);
        console.log(`   Trend: ${business.trend}`);
      });

      console.log("\n\n📈 Insights:");
      console.log("- Ranking combines rating, volume, trend, tier, and sentiment");
      console.log("- Higher tier businesses get visibility boost (Power: +10, Pro: +5)");
      console.log("- Review volume and positive sentiment contribute to ranking");
      console.log("- Recent trends can boost businesses that are improving");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testRankingWithReviews().catch(console.error);
}

export { testRankingWithReviews };