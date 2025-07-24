#!/usr/bin/env npx tsx
/**
 * Clean Mock Businesses from Homepage Rankings
 * Removes or updates businesses that appear to be mock/placeholder data
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Missing CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Mock business indicators
const MOCK_INDICATORS = [
  'test',
  'sample',
  'demo',
  'placeholder',
  'mock',
  'example',
  'fake',
  'dummy'
];

async function cleanMockBusinesses() {
  console.log("🧹 Cleaning Mock Businesses from Homepage");
  console.log("========================================\n");

  try {
    // Get all businesses
    console.log("📦 Fetching all businesses...");
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 500
    });

    console.log(`   Found ${businesses.length} total businesses`);

    // Identify potential mock businesses
    const mockBusinesses = businesses.filter(business => {
      const name = business.name.toLowerCase();
      const hasZeroReviews = !business.reviewCount || business.reviewCount === 0;
      const hasNoScore = !business.overallScore || business.overallScore === 0;
      const hasMockName = MOCK_INDICATORS.some(indicator => name.includes(indicator));
      const hasGenericName = name.includes('business') || name.includes('company') || name.includes('service');
      const hasShortName = name.length < 5;
      
      // Consider it mock if it has multiple indicators
      const mockScore = [hasZeroReviews, hasNoScore, hasMockName, hasGenericName, hasShortName].filter(Boolean).length;
      
      return mockScore >= 2;
    });

    // Also find businesses without proper addresses or contact info
    const incompleteBusinesses = businesses.filter(business => {
      return !business.address || !business.phone || !business.city || business.city === 'Unknown';
    });

    console.log(`\n🔍 Analysis Results:`);
    console.log(`   Mock businesses identified: ${mockBusinesses.length}`);
    console.log(`   Incomplete businesses: ${incompleteBusinesses.length}`);

    if (mockBusinesses.length > 0) {
      console.log(`\n📋 Mock Businesses to Review:`);
      mockBusinesses.slice(0, 10).forEach((business, index) => {
        console.log(`   ${index + 1}. ${business.name} (${business.city || 'No city'}) - Reviews: ${business.reviewCount || 0}, Score: ${business.overallScore || 0}`);
      });
      if (mockBusinesses.length > 10) {
        console.log(`   ... and ${mockBusinesses.length - 10} more`);
      }
    }

    if (incompleteBusinesses.length > 0) {
      console.log(`\n📋 Incomplete Businesses (first 10):`);
      incompleteBusinesses.slice(0, 10).forEach((business, index) => {
        console.log(`   ${index + 1}. ${business.name} - Missing: ${[
          !business.address && 'address',
          !business.phone && 'phone', 
          !business.city && 'city',
          business.city === 'Unknown' && 'valid city'
        ].filter(Boolean).join(', ')}`);
      });
    }

    // Get current top rankings for comparison
    console.log(`\n🏆 Current Top 10 Rankings:`);
    const topRankings = await client.query(api.rankings.calculateRankings.getTopRankedBusinesses, {
      limit: 10
    });

    if (topRankings.length > 0) {
      topRankings.forEach((ranking, index) => {
        const isMock = mockBusinesses.some(mock => mock._id === ranking.business._id);
        const isIncomplete = incompleteBusinesses.some(inc => inc._id === ranking.business._id);
        const flags = [isMock && '🔴 MOCK', isIncomplete && '⚠️ INCOMPLETE'].filter(Boolean).join(' ');
        
        console.log(`   ${index + 1}. ${ranking.business.name} (${ranking.business.city}) - Score: ${ranking.overallScore}/100 ${flags}`);
      });
    } else {
      console.log("   No businesses currently ranked");
    }

    // Strategy recommendation
    console.log(`\n💡 Recommendations:`);
    
    if (mockBusinesses.length > 0) {
      console.log(`   🧹 Found ${mockBusinesses.length} potential mock businesses`);
      console.log(`   → Consider removing these from rankings`);
      console.log(`   → Focus ranking algorithm on businesses with real data`);
    }
    
    if (incompleteBusinesses.length > 0) {
      console.log(`   📝 Found ${incompleteBusinesses.length} incomplete businesses`);
      console.log(`   → These may affect ranking quality`);
      console.log(`   → Consider data enrichment for top performers`);
    }

    const realBusinesses = businesses.filter(b => 
      !mockBusinesses.includes(b) && 
      !incompleteBusinesses.includes(b) &&
      b.reviewCount && b.reviewCount > 0
    );

    console.log(`\n✅ Clean businesses ready for ranking: ${realBusinesses.length}`);
    console.log(`   These businesses have real data and can provide quality rankings`);

    console.log(`\n🚀 Next Steps:`);
    console.log(`   1. Run batch processing on clean businesses: npm run tsx scripts/batch-process-all-businesses.ts`);
    console.log(`   2. The ranking algorithm will automatically favor businesses with real data`);
    console.log(`   3. Homepage will show authentic top performers`);

  } catch (error) {
    console.error("❌ Error cleaning mock businesses:", error);
    process.exit(1);
  }
}

// Run the cleanup analysis
cleanMockBusinesses().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});