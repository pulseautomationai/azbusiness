/**
 * Test Processing 5 Businesses
 * Simpler test to process a few businesses and see the results
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testProcessBusinesses() {
  console.log("🧪 Testing AI Ranking Processing - 5 Businesses");
  console.log("==============================================\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // 1. Get 5 businesses with the most reviews
    console.log("📋 Step 1: Finding 5 businesses to test...");
    const allBusinesses = await client.query(api.businesses.getBusinesses, {
      limit: 100
    });

    // Get review counts for each business
    const businessesWithReviews = await Promise.all(
      allBusinesses.slice(0, 20).map(async (business) => {
        try {
          const reviews = await client.query(api.businesses.getBusinessReviews, {
            businessId: business._id,
            limit: 20  // Reduced to avoid data size limits
          });
          return {
            business,
            reviewCount: reviews.length,
            reviews: reviews // Use all fetched reviews
          };
        } catch (error) {
          return {
            business,
            reviewCount: 0,
            reviews: []
          };
        }
      })
    );

    // Sort by review count and take top 5
    const topBusinesses = businessesWithReviews
      .filter(b => b.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);

    if (topBusinesses.length === 0) {
      console.log("❌ No businesses with reviews found!");
      return;
    }

    console.log("\n✅ Found businesses to test:");
    topBusinesses.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.business.name} (${item.business.city}) - ${item.reviewCount} reviews`);
    });

    // 2. Process each business
    console.log("\n📊 Step 2: Processing businesses...\n");

    for (let i = 0; i < topBusinesses.length; i++) {
      const { business, reviews } = topBusinesses[i];
      console.log(`\n🏢 Processing ${i + 1}/5: ${business.name}`);
      console.log(`   Category: ${business.categoryId}`);
      console.log(`   Reviews: ${reviews.length}`);
      console.log(`   Current Tier: ${business.planTier}`);

      // Process each review (mock AI analysis for now)
      let positiveCount = 0;
      let totalRating = 0;
      const keywords: Record<string, number> = {};
      const quotes: string[] = [];

      reviews.forEach(review => {
        totalRating += review.rating;
        if (review.rating >= 4) positiveCount++;

        // Extract keywords (simple version)
        const words = (review.comment || '').toLowerCase().split(/\s+/);
        const importantWords = ['professional', 'excellent', 'great', 'fast', 'quality', 'reliable', 'honest', 'fair', 'clean', 'friendly'];
        
        words.forEach(word => {
          if (importantWords.includes(word)) {
            keywords[word] = (keywords[word] || 0) + 1;
          }
        });

        // Extract good quotes
        if (review.rating >= 4 && review.comment && review.comment.length > 50) {
          const sentences = review.comment.split(/[.!?]+/).filter(s => s.trim().length > 20);
          if (sentences.length > 0) {
            quotes.push(sentences[0].trim());
          }
        }
      });

      const avgRating = totalRating / reviews.length;
      const positiveRate = (positiveCount / reviews.length) * 100;

      // Calculate mock scores
      const qualityScore = Math.min(10, (avgRating - 3) * 2.5);
      const reliabilityScore = Math.min(10, positiveRate / 10);
      const overallScore = (qualityScore + reliabilityScore) * 5;

      console.log(`\n   📈 Analysis Results:`);
      console.log(`      Average Rating: ${avgRating.toFixed(2)}/5`);
      console.log(`      Positive Rate: ${positiveRate.toFixed(1)}%`);
      console.log(`      Quality Score: ${qualityScore.toFixed(1)}/10`);
      console.log(`      Reliability Score: ${reliabilityScore.toFixed(1)}/10`);
      console.log(`      Overall Ranking Score: ${overallScore.toFixed(1)}/100`);
      
      console.log(`\n   🔑 Top Keywords:`);
      const topKeywords = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      topKeywords.forEach(([word, count]) => {
        console.log(`      - ${word}: ${count} mentions`);
      });

      console.log(`\n   💬 Sample Customer Quotes:`);
      quotes.slice(0, 3).forEach(quote => {
        console.log(`      "${quote}"`);
      });

      // Check what achievements they might qualify for
      console.log(`\n   🏆 Potential Achievements:`);
      if (avgRating >= 4.8) {
        console.log(`      ⭐ Excellence Award (4.8+ rating)`);
      }
      if (positiveRate >= 95) {
        console.log(`      🎯 Customer Satisfaction Master (95%+ positive)`);
      }
      if (keywords['professional'] >= 5) {
        console.log(`      👔 Professional Service Award`);
      }
      if (keywords['fast'] >= 5 || keywords['quick'] >= 5) {
        console.log(`      ⚡ Speed Demon Award`);
      }
    }

    // 3. Show ranking comparison
    console.log("\n\n🏅 Ranking Results (Based on Overall Score):");
    console.log("==========================================");
    
    const rankedBusinesses = topBusinesses.map(item => {
      const avgRating = item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length;
      const positiveRate = (item.reviews.filter(r => r.rating >= 4).length / item.reviews.length) * 100;
      const qualityScore = Math.min(10, (avgRating - 3) * 2.5);
      const reliabilityScore = Math.min(10, positiveRate / 10);
      const overallScore = (qualityScore + reliabilityScore) * 5;
      
      return {
        name: item.business.name,
        city: item.business.city,
        tier: item.business.planTier,
        overallScore
      };
    }).sort((a, b) => b.overallScore - a.overallScore);

    rankedBusinesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.city})`);
      console.log(`   Score: ${business.overallScore.toFixed(1)}/100 | Tier: ${business.tier}`);
    });

    console.log("\n✅ Test Complete!");
    console.log("\n💡 Next Steps:");
    console.log("1. This was a simplified test - real AI analysis will be much more sophisticated");
    console.log("2. The actual system will analyze sentiment, extract better keywords, and identify patterns");
    console.log("3. Rankings will be calculated across categories and cities");
    console.log("4. Achievements will be automatically detected and assigned");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testProcessBusinesses().catch(console.error);
}

export { testProcessBusinesses };