/**
 * Improved Ranking Algorithm
 * Balances quality vs quantity with statistical confidence
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

// Category volume expectations (reviews per year)
const CATEGORY_PROFILES = {
  // High frequency services
  'pest-control': { expectedAnnual: 200, minCredible: 15 },
  'landscaping': { expectedAnnual: 150, minCredible: 15 },
  'cleaning': { expectedAnnual: 180, minCredible: 20 },
  
  // Medium frequency services  
  'hvac': { expectedAnnual: 80, minCredible: 10 },
  'plumbing': { expectedAnnual: 60, minCredible: 10 },
  'electrical': { expectedAnnual: 50, minCredible: 10 },
  
  // Low frequency services
  'roofing': { expectedAnnual: 30, minCredible: 5 },
  'remodeling': { expectedAnnual: 25, minCredible: 5 },
  'solar': { expectedAnnual: 20, minCredible: 5 },
  
  // Default for unknown categories
  'default': { expectedAnnual: 50, minCredible: 10 }
};

// Calculate statistical confidence based on review count
function calculateConfidence(reviewCount: number, minCredible: number): number {
  if (reviewCount < minCredible) {
    // Below minimum threshold - heavily penalized
    return reviewCount / minCredible * 0.7; // Max 70% confidence
  } else if (reviewCount < minCredible * 3) {
    // Building confidence zone
    return 0.7 + (reviewCount - minCredible) / (minCredible * 2) * 0.25; // 70-95%
  } else {
    // Sufficient reviews - high confidence
    return Math.min(1.0, 0.95 + (reviewCount - minCredible * 3) / 1000 * 0.05); // 95-100%
  }
}

// Calculate volume score with diminishing returns
function calculateVolumeScore(reviewCount: number, expectedAnnual: number): number {
  // Normalize based on category expectations
  const normalized = reviewCount / expectedAnnual;
  
  // Logarithmic curve with diminishing returns
  if (normalized < 0.5) {
    // Under-reviewed: linear growth up to 5 points
    return normalized * 10;
  } else if (normalized < 2) {
    // Normal range: slower growth 5-12 points
    return 5 + (normalized - 0.5) * 4.67;
  } else {
    // Over-reviewed: very slow growth 12-15 points max
    return Math.min(15, 12 + Math.log10(normalized) * 3);
  }
}

// Calculate quality score with consistency bonus
function calculateQualityScore(rating: number, reviewCount: number, confidence: number): number {
  // Base quality from rating (0-80 points)
  const baseQuality = (rating / 5) * 80;
  
  // Consistency bonus (0-20 points)
  // More reviews with high rating = more consistent = higher bonus
  const consistencyBonus = rating >= 4.5 ? 
    Math.min(20, confidence * 20 * (rating - 4) / 1) : // 4.5-5.0 gets bonus
    0;
  
  return baseQuality + consistencyBonus;
}

// Mock AI quality indicators
function mockAIQualityMultiplier(rating: number, tier: string): number {
  // Simulate AI detecting exceptional service patterns
  const baseMultiplier = rating >= 4.8 ? 1.1 : rating >= 4.5 ? 1.05 : 1.0;
  
  // Small tier bonus for AI enhancement quality
  const tierBonus = 
    tier === 'power' ? 0.05 :
    tier === 'pro' ? 0.03 :
    tier === 'starter' ? 0.01 : 0;
    
  return baseMultiplier + tierBonus;
}

async function demonstrateImprovedRanking() {
  console.log("🎯 Improved AI Ranking Algorithm Demo");
  console.log("====================================\n");
  console.log("This algorithm balances quality and quantity with statistical confidence.\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Get businesses
    const businesses = await client.query(api.businesses.getBusinesses, {
      limit: 30
    });

    // Filter and analyze
    const analyzedBusinesses = businesses
      .filter(b => b.reviewCount && b.reviewCount > 0)
      .map(business => {
        // Determine category profile
        const categoryKey = business.categoryId?.toLowerCase() || 'default';
        const profile = CATEGORY_PROFILES[categoryKey as keyof typeof CATEGORY_PROFILES] || CATEGORY_PROFILES.default;
        
        // Calculate components
        const confidence = calculateConfidence(business.reviewCount, profile.minCredible);
        const qualityScore = calculateQualityScore(business.rating || 0, business.reviewCount, confidence);
        const volumeScore = calculateVolumeScore(business.reviewCount, profile.expectedAnnual);
        const aiMultiplier = mockAIQualityMultiplier(business.rating || 0, business.planTier);
        
        // Tier bonuses (smaller than before)
        const tierBonus = 
          business.planTier === 'power' ? 10 :
          business.planTier === 'pro' ? 7 :
          business.planTier === 'starter' ? 4 : 0;
        
        // Final score calculation
        const adjustedScore = (qualityScore * confidence + volumeScore) * aiMultiplier;
        const totalScore = adjustedScore + tierBonus;
        
        return {
          ...business,
          analysis: {
            confidence,
            qualityScore,
            volumeScore,
            aiMultiplier,
            tierBonus,
            adjustedScore,
            totalScore,
            categoryProfile: profile,
          }
        };
      })
      .sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);

    // Display results
    console.log("🏆 RANKING RESULTS (Top 15)\n");
    
    analyzedBusinesses.slice(0, 15).forEach((business, index) => {
      const a = business.analysis;
      console.log(`${index + 1}. ${business.name} (${business.city})`);
      console.log(`   Category: ${business.categoryId || 'general'} | Tier: ${business.planTier.toUpperCase()}`);
      console.log(`   Rating: ${business.rating}⭐ | Reviews: ${business.reviewCount}`);
      console.log(`   📊 Scoring Breakdown:`);
      console.log(`      Quality Score: ${a.qualityScore.toFixed(1)}/100 (${business.rating}⭐ rating)`);
      console.log(`      Confidence: ${(a.confidence * 100).toFixed(0)}% (min ${a.categoryProfile.minCredible} reviews needed)`);
      console.log(`      Volume Score: ${a.volumeScore.toFixed(1)}/15 (vs ${a.categoryProfile.expectedAnnual}/year expected)`);
      console.log(`      AI Quality: ${a.aiMultiplier.toFixed(2)}x multiplier`);
      console.log(`      Tier Bonus: +${a.tierBonus}`);
      console.log(`   📈 TOTAL SCORE: ${a.totalScore.toFixed(1)}\n`);
    });

    // Show edge cases
    console.log("\n🔍 EDGE CASE EXAMPLES\n");
    
    // Low review count examples
    const lowReviewBusinesses = analyzedBusinesses
      .filter(b => b.reviewCount < 10)
      .slice(0, 3);
    
    console.log("Low Review Count Businesses:");
    lowReviewBusinesses.forEach(b => {
      console.log(`- ${b.name}: ${b.reviewCount} reviews, ${b.rating}⭐`);
      console.log(`  Confidence: ${(b.analysis.confidence * 100).toFixed(0)}% → Score: ${b.analysis.totalScore.toFixed(1)}`);
    });

    // High quality, low volume
    console.log("\n\nQuality vs Quantity Comparison:");
    const examples = [
      { name: "A: Perfect Roofing Co", rating: 5.0, reviews: 8, category: 'roofing' },
      { name: "B: Good Roofing Inc", rating: 4.2, reviews: 150, category: 'roofing' },
      { name: "C: Average Pest Control", rating: 4.5, reviews: 300, category: 'pest-control' },
      { name: "D: Excellent HVAC", rating: 4.9, reviews: 25, category: 'hvac' },
    ];

    examples.forEach(ex => {
      const profile = CATEGORY_PROFILES[ex.category as keyof typeof CATEGORY_PROFILES];
      const confidence = calculateConfidence(ex.reviews, profile.minCredible);
      const qualityScore = calculateQualityScore(ex.rating, ex.reviews, confidence);
      const volumeScore = calculateVolumeScore(ex.reviews, profile.expectedAnnual);
      const total = (qualityScore * confidence + volumeScore) * 1.0;
      
      console.log(`\n${ex.name}`);
      console.log(`  ${ex.rating}⭐ with ${ex.reviews} reviews (${ex.category})`);
      console.log(`  Quality: ${qualityScore.toFixed(1)} × Confidence: ${(confidence * 100).toFixed(0)}% = ${(qualityScore * confidence).toFixed(1)}`);
      console.log(`  Volume: ${volumeScore.toFixed(1)} | Total: ${total.toFixed(1)}`);
    });

    console.log("\n\n💡 KEY IMPROVEMENTS:");
    console.log("1. Statistical confidence prevents gaming with few perfect reviews");
    console.log("2. Category-specific expectations (roofing vs pest control)");
    console.log("3. Quality score includes consistency bonus for sustained excellence");
    console.log("4. Volume score has diminishing returns after category norms");
    console.log("5. Minimum review thresholds ensure credibility");
    console.log("6. AI quality multiplier rewards exceptional service patterns");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateImprovedRanking().catch(console.error);
}

export { demonstrateImprovedRanking };