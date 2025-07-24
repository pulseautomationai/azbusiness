/**
 * Ranking Quality Validator
 * Ensures AI rankings are accurate and well-distributed
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

interface ValidationResult {
  distributionNormal: boolean;
  knownBusinessesCorrect: number;
  anomaliesFound: number;
  recommendations: string[];
  details: {
    scoreDistribution: ScoreDistribution;
    categoryBalance: CategoryBalance;
    geographicCoverage: GeographicCoverage;
    tierFairness: TierFairness;
  };
}

interface ScoreDistribution {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  isNormal: boolean;
}

interface CategoryBalance {
  categories: Map<string, CategoryStats>;
  isBalanced: boolean;
  outliers: string[];
}

interface CategoryStats {
  name: string;
  count: number;
  avgScore: number;
  stdDev: number;
}

interface GeographicCoverage {
  cities: Map<string, CityStats>;
  coverage: number;
  missingCities: string[];
}

interface CityStats {
  name: string;
  businessCount: number;
  avgScore: number;
}

interface TierFairness {
  tiers: Map<string, TierStats>;
  isFair: boolean;
  concerns: string[];
}

interface TierStats {
  tier: string;
  count: number;
  avgScore: number;
  topPercentage: number;
}

class RankingValidator {
  private client: ConvexHttpClient;

  constructor() {
    this.client = new ConvexHttpClient(CONVEX_URL);
  }

  async validateRankings(): Promise<ValidationResult> {
    console.log("🔍 Starting comprehensive ranking validation...\n");

    // 1. Analyze score distribution
    const distribution = await this.analyzeRankingDistribution();
    
    // 2. Check known good businesses
    const knownValidation = await this.validateKnownBusinesses();
    
    // 3. Detect anomalies
    const anomalies = await this.detectRankingAnomalies();
    
    // 4. Check category balance
    const categoryBalance = await this.analyzeCategoryBalance();
    
    // 5. Verify geographic coverage
    const geoCoverage = await this.analyzeGeographicCoverage();
    
    // 6. Assess tier fairness
    const tierFairness = await this.analyzeTierFairness();
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      distribution,
      knownValidation,
      anomalies,
      categoryBalance,
      geoCoverage,
      tierFairness,
    });

    return {
      distributionNormal: distribution.isNormal,
      knownBusinessesCorrect: knownValidation.correctCount,
      anomaliesFound: anomalies.length,
      recommendations,
      details: {
        scoreDistribution: distribution,
        categoryBalance,
        geographicCoverage: geoCoverage,
        tierFairness,
      },
    };
  }

  private async analyzeRankingDistribution(): Promise<ScoreDistribution> {
    console.log("📊 Analyzing score distribution...");
    
    const rankings = await this.client.query(api.rankings.businessRankings.getAllRankings, {
      limit: 10000,
    });

    if (rankings.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
        isNormal: false,
      };
    }

    const scores = rankings.map(r => r.overallScore).sort((a, b) => a - b);
    
    // Calculate statistics
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const median = scores[Math.floor(scores.length / 2)];
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate percentiles
    const percentiles = {
      p10: scores[Math.floor(scores.length * 0.1)],
      p25: scores[Math.floor(scores.length * 0.25)],
      p50: median,
      p75: scores[Math.floor(scores.length * 0.75)],
      p90: scores[Math.floor(scores.length * 0.9)],
    };

    // Check if distribution is normal (simplified)
    const isNormal = mean > 40 && mean < 70 && stdDev > 10 && stdDev < 30;

    console.log(`  Mean: ${mean.toFixed(1)}, StdDev: ${stdDev.toFixed(1)}`);
    console.log(`  Distribution: ${isNormal ? '✅ Normal' : '⚠️  Skewed'}`);

    return {
      mean,
      median,
      stdDev,
      min: scores[0],
      max: scores[scores.length - 1],
      percentiles,
      isNormal,
    };
  }

  private async validateKnownBusinesses(): Promise<{ correctCount: number; total: number }> {
    console.log("\n🎯 Validating known high-performers...");
    
    // Define known good businesses (these should be well-known quality businesses)
    const knownGoodBusinesses = [
      { name: "Phoenix Premier HVAC", expectedRank: "top10", category: "hvac" },
      { name: "Scottsdale Elite Plumbing", expectedRank: "top10", category: "plumbing" },
      { name: "Mesa Professional Electric", expectedRank: "top20", category: "electrical" },
    ];

    let correctCount = 0;
    
    for (const knownBusiness of knownGoodBusinesses) {
      // Try to find the business
      const businesses = await this.client.query(api.businesses.getBusinesses, {
        categorySlug: knownBusiness.category,
        limit: 100,
      });
      
      const business = businesses.find(b => 
        b.name.toLowerCase().includes(knownBusiness.name.toLowerCase())
      );
      
      if (business) {
        // Check if it has expected ranking
        const ranking = await this.client.query(api.rankings.businessRankings.getBusinessRanking, {
          businessId: business._id,
        });
        
        if (ranking) {
          const isCorrect = this.checkExpectedRank(ranking.rankingPosition, knownBusiness.expectedRank);
          if (isCorrect) correctCount++;
          
          console.log(`  ${knownBusiness.name}: ${isCorrect ? '✅' : '❌'} (Rank: ${ranking.rankingPosition})`);
        }
      }
    }

    console.log(`  Validated: ${correctCount}/${knownGoodBusinesses.length} correct`);
    
    return { correctCount, total: knownGoodBusinesses.length };
  }

  private checkExpectedRank(actual: number, expected: string): boolean {
    if (expected === "top10") return actual <= 10;
    if (expected === "top20") return actual <= 20;
    if (expected === "top50") return actual <= 50;
    return false;
  }

  private async detectRankingAnomalies(): Promise<Array<{ businessId: Id<"businesses">; issue: string }>> {
    console.log("\n🔍 Detecting ranking anomalies...");
    
    const anomalies: Array<{ businessId: Id<"businesses">; issue: string }> = [];
    
    // Get all rankings
    const rankings = await this.client.query(api.rankings.businessRankings.getAllRankings, {
      limit: 1000,
    });

    for (const ranking of rankings) {
      // Check for extreme scores
      if (ranking.overallScore > 95) {
        anomalies.push({
          businessId: ranking.businessId,
          issue: `Suspiciously high score: ${ranking.overallScore}`,
        });
      }
      
      if (ranking.overallScore < 5 && ranking.reviewsAnalyzed > 10) {
        anomalies.push({
          businessId: ranking.businessId,
          issue: `Suspiciously low score despite ${ranking.reviewsAnalyzed} reviews`,
        });
      }
      
      // Check for inconsistent sub-scores
      const scores = Object.values(ranking.categoryScores);
      const scoreVariance = this.calculateVariance(scores);
      if (scoreVariance > 40) {
        anomalies.push({
          businessId: ranking.businessId,
          issue: `High variance in category scores: ${scoreVariance.toFixed(1)}`,
        });
      }
    }

    console.log(`  Found ${anomalies.length} anomalies`);
    
    return anomalies;
  }

  private async analyzeCategoryBalance(): Promise<CategoryBalance> {
    console.log("\n📊 Analyzing category balance...");
    
    const categories = await this.client.query(api.categories.getCategories);
    const categoryStats = new Map<string, CategoryStats>();
    const outliers: string[] = [];

    for (const category of categories) {
      const businesses = await this.client.query(api.businesses.getBusinesses, {
        categorySlug: category.slug,
        limit: 1000,
      });

      const rankings = await Promise.all(
        businesses.map(b => 
          this.client.query(api.rankings.businessRankings.getBusinessRanking, {
            businessId: b._id,
          })
        )
      );

      const validRankings = rankings.filter(r => r !== null);
      
      if (validRankings.length > 0) {
        const scores = validRankings.map(r => r!.overallScore);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const stdDev = Math.sqrt(
          scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
        );

        categoryStats.set(category.slug, {
          name: category.name,
          count: validRankings.length,
          avgScore,
          stdDev,
        });

        // Check for outliers
        if (avgScore < 30 || avgScore > 80) {
          outliers.push(category.name);
        }
      }
    }

    const isBalanced = outliers.length === 0;
    console.log(`  Categories analyzed: ${categoryStats.size}`);
    console.log(`  Balance: ${isBalanced ? '✅ Good' : '⚠️  Has outliers'}`);

    return { categories: categoryStats, isBalanced, outliers };
  }

  private async analyzeGeographicCoverage(): Promise<GeographicCoverage> {
    console.log("\n🗺️  Analyzing geographic coverage...");
    
    const cities = await this.client.query(api.cities.getCities);
    const cityStats = new Map<string, CityStats>();
    const missingCities: string[] = [];

    for (const city of cities) {
      const businesses = await this.client.query(api.businesses.getBusinesses, {
        citySlug: city.slug,
        limit: 1000,
      });

      const rankings = await Promise.all(
        businesses.map(b => 
          this.client.query(api.rankings.businessRankings.getBusinessRanking, {
            businessId: b._id,
          })
        )
      );

      const validRankings = rankings.filter(r => r !== null);
      
      if (validRankings.length > 0) {
        const avgScore = validRankings.reduce((sum, r) => sum + r!.overallScore, 0) / validRankings.length;
        
        cityStats.set(city.slug, {
          name: city.name,
          businessCount: validRankings.length,
          avgScore,
        });
      } else {
        missingCities.push(city.name);
      }
    }

    const coverage = (cityStats.size / cities.length) * 100;
    console.log(`  Coverage: ${coverage.toFixed(1)}% of cities have ranked businesses`);

    return { cities: cityStats, coverage, missingCities };
  }

  private async analyzeTierFairness(): Promise<TierFairness> {
    console.log("\n⚖️  Analyzing tier fairness...");
    
    const tiers = ['free', 'starter', 'pro', 'power'];
    const tierStats = new Map<string, TierStats>();
    const concerns: string[] = [];

    // Get top 100 businesses
    const topBusinesses = await this.client.query(api.rankings.businessRankings.getTopBusinessesAcrossCategories, {
      limit: 100,
    });

    for (const tier of tiers) {
      const businesses = await this.client.query(api.businesses.getBusinesses, {
        planTier: tier as any,
        limit: 1000,
      });

      const rankings = await Promise.all(
        businesses.map(b => 
          this.client.query(api.rankings.businessRankings.getBusinessRanking, {
            businessId: b._id,
          })
        )
      );

      const validRankings = rankings.filter(r => r !== null);
      
      if (validRankings.length > 0) {
        const avgScore = validRankings.reduce((sum, r) => sum + r!.overallScore, 0) / validRankings.length;
        const topCount = topBusinesses.filter(b => b.planTier === tier).length;
        const topPercentage = (topCount / topBusinesses.length) * 100;

        tierStats.set(tier, {
          tier,
          count: validRankings.length,
          avgScore,
          topPercentage,
        });

        // Check for unfairness
        if (tier === 'free' && topPercentage > 50) {
          concerns.push("Free tier dominates top rankings");
        }
        if (tier === 'power' && topPercentage < 10) {
          concerns.push("Power tier underrepresented in top rankings");
        }
      }
    }

    const isFair = concerns.length === 0;
    console.log(`  Fairness: ${isFair ? '✅ Good' : '⚠️  Has concerns'}`);

    return { tiers: tierStats, isFair, concerns };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  }

  private generateRecommendations(validation: any): string[] {
    const recommendations: string[] = [];

    // Distribution recommendations
    if (!validation.distribution.isNormal) {
      if (validation.distribution.mean < 40) {
        recommendations.push("Scores are too low overall - consider adjusting scoring algorithm");
      } else if (validation.distribution.mean > 70) {
        recommendations.push("Scores are too high overall - increase differentiation in scoring");
      }
      if (validation.distribution.stdDev < 10) {
        recommendations.push("Scores lack variation - enhance discrimination between businesses");
      }
    }

    // Category balance recommendations
    if (!validation.categoryBalance.isBalanced) {
      recommendations.push(`Review scoring for categories: ${validation.categoryBalance.outliers.join(', ')}`);
    }

    // Geographic coverage recommendations
    if (validation.geoCoverage.coverage < 80) {
      recommendations.push(`Expand processing to cities: ${validation.geoCoverage.missingCities.slice(0, 5).join(', ')}`);
    }

    // Tier fairness recommendations
    if (!validation.tierFairness.isFair) {
      validation.tierFairness.concerns.forEach(concern => recommendations.push(concern));
    }

    // Anomaly recommendations
    if (validation.anomalies.length > 10) {
      recommendations.push("High number of anomalies detected - review scoring algorithm");
    }

    return recommendations;
  }

  async generateReport(result: ValidationResult) {
    console.log("\n📋 Validation Report");
    console.log("===================");
    
    console.log("\n✅ Overall Status:");
    console.log(`  Distribution: ${result.distributionNormal ? '✅ Normal' : '❌ Abnormal'}`);
    console.log(`  Known Businesses: ${result.knownBusinessesCorrect} validated`);
    console.log(`  Anomalies: ${result.anomaliesFound} found`);
    
    console.log("\n📊 Score Distribution:");
    const dist = result.details.scoreDistribution;
    console.log(`  Mean: ${dist.mean.toFixed(1)} ± ${dist.stdDev.toFixed(1)}`);
    console.log(`  Range: ${dist.min.toFixed(1)} - ${dist.max.toFixed(1)}`);
    console.log(`  Percentiles: P25=${dist.percentiles.p25.toFixed(1)}, P50=${dist.percentiles.p50.toFixed(1)}, P75=${dist.percentiles.p75.toFixed(1)}`);
    
    console.log("\n🔧 Recommendations:");
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    
    return result;
  }
}

async function main() {
  console.log("🏆 AI Ranking System - Quality Validator");
  console.log("=======================================\n");

  if (!CONVEX_URL || CONVEX_URL.includes("YOUR_CONVEX_URL")) {
    console.error("❌ CONVEX_URL environment variable not set");
    console.log("Please set CONVEX_URL in your .env file\n");
    return;
  }

  const validator = new RankingValidator();

  try {
    const result = await validator.validateRankings();
    await validator.generateReport(result);
    
    // Exit with appropriate code
    if (result.distributionNormal && result.anomaliesFound < 10) {
      console.log("\n✅ Validation passed!");
      process.exit(0);
    } else {
      console.log("\n⚠️  Validation completed with warnings");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("\n❌ Validation failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RankingValidator };