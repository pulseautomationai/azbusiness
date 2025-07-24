/**
 * Test AI Analysis with Mock Data
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing CONVEX_URL environment variable");
  process.exit(1);
}

async function testAIAnalysisWithMock() {
  console.log("🤖 Testing AI Analysis with Mock Data");
  console.log("=====================================\n");
  console.log(`CONVEX_URL: ${CONVEX_URL}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // 1. Get test businesses
    console.log("📋 Step 1: Finding test businesses...");
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 10
    });

    // Filter to businesses with manageable review counts (10-50)
    const testBusinesses = businesses
      .filter(b => b.reviewCount && b.reviewCount >= 10 && b.reviewCount <= 50)
      .slice(0, 3);

    if (testBusinesses.length === 0) {
      console.log("❌ No suitable test businesses found (need 10-50 reviews)");
      return;
    }

    console.log(`\nFound ${testBusinesses.length} businesses to test:`);
    testBusinesses.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name} (${b.city}) - ${b.reviewCount} reviews, Tier: ${b.planTier}`);
    });

    // 2. Process each business
    console.log("\n\n📊 Step 2: Processing businesses with AI...\n");

    for (let i = 0; i < testBusinesses.length; i++) {
      const business = testBusinesses[i];
      
      console.log(`\n🏢 Processing ${i + 1}/${testBusinesses.length}: ${business.name}`);
      
      try {
        // Process reviews with AI - reduced batch size
        console.log("   🤖 Running AI analysis (mock mode)...");
        const result = await client.action(api.aiAnalysisIntegration.processBusinessReviews, {
          businessId: business._id,
          batchSize: 2, // Very small batch to avoid timeouts
          skipExisting: true,
        });

        if (result.success) {
          console.log(`   ✅ ${result.message}`);
          
          if (result.insights) {
            console.log("\n   📈 AI Insights:");
            console.log(`      Performance Scores:`);
            console.log(`         Speed: ${result.insights.performanceScores.speed.toFixed(1)}/10`);
            console.log(`         Value: ${result.insights.performanceScores.value.toFixed(1)}/10`);
            console.log(`         Quality: ${result.insights.performanceScores.quality.toFixed(1)}/10`);
            console.log(`         Reliability: ${result.insights.performanceScores.reliability.toFixed(1)}/10`);
            
            console.log(`      Top Keywords: ${result.insights.topKeywords.join(', ')}`);
            console.log(`      Confidence: ${result.insights.confidence.toFixed(0)}%`);
          }
        } else {
          console.log(`   ❌ Failed: ${result.message}`);
        }

      } catch (error) {
        console.error(`   ❌ Error: ${error}`);
      }
    }

    console.log("\n\n💡 Next Steps:");
    console.log("1. Check the Convex dashboard for updated business scores");
    console.log("2. Run the ranking calculation script");
    console.log("3. View the businesses on the frontend to see rankings");
    console.log("4. Change business tiers to see ranking effects");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAIAnalysisWithMock().catch(console.error);
}

export { testAIAnalysisWithMock };