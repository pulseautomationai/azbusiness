/**
 * Real-time Ranking System Monitor
 * Tracks progress and health of AI ranking processing
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

interface MonitoringMetrics {
  processed: number;
  failed: number;
  averageProcessingTime: number;
  averageConfidenceScore: number;
  rankingDistribution: Map<string, number>;
  errorTypes: Map<string, number>;
  coverage: {
    total: number;
    withScores: number;
    percentage: number;
  };
  topPerformers: Array<{
    name: string;
    city: string;
    category: string;
    score: number;
  }>;
}

class RankingMonitor {
  private client: ConvexHttpClient;
  private refreshInterval: number = 30000; // 30 seconds
  private isRunning: boolean = false;

  constructor() {
    this.client = new ConvexHttpClient(CONVEX_URL);
  }

  async collectMetrics(): Promise<MonitoringMetrics> {
    // Get system status
    const systemStatus = await this.client.query(api.batchRankingProcessor.getRankingSystemStatus);
    
    // Get recent AI analysis tags to calculate average confidence
    const recentTags = await this.client.query(api.aiAnalysisTags.getRecentTags, {
      limit: 100,
    });
    
    const avgConfidence = recentTags.length > 0
      ? recentTags.reduce((sum, tag) => sum + (tag.confidenceScore || 0), 0) / recentTags.length
      : 0;

    // Get ranking distribution
    const distribution = new Map<string, number>();
    const categories = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    
    // Get top performers
    const topPerformers = await this.client.query(api.rankings.businessRankings.getTopBusinessesAcrossCategories, {
      limit: 10,
    });

    return {
      processed: systemStatus.coverage.withScores,
      failed: 0, // TODO: Track failed processing
      averageProcessingTime: 0, // TODO: Track processing times
      averageConfidenceScore: avgConfidence,
      rankingDistribution: distribution,
      errorTypes: new Map(),
      coverage: {
        total: systemStatus.system.totalBusinesses,
        withScores: systemStatus.coverage.withScores,
        percentage: systemStatus.coverage.scoringCoverage,
      },
      topPerformers: topPerformers.map(b => ({
        name: b.name,
        city: b.city,
        category: b.categoryName || 'Unknown',
        score: b.overallScore,
      })),
    };
  }

  async checkQuality(metrics: MonitoringMetrics) {
    const alerts: string[] = [];

    // Check confidence scores
    if (metrics.averageConfidenceScore < 70) {
      alerts.push(`⚠️  Low confidence score: ${metrics.averageConfidenceScore.toFixed(1)}%`);
    }

    // Check coverage
    if (metrics.coverage.percentage < 10) {
      alerts.push(`⚠️  Low coverage: Only ${metrics.coverage.percentage.toFixed(1)}% of businesses have rankings`);
    }

    // Check for processing issues
    if (metrics.failed > metrics.processed * 0.1) {
      alerts.push(`🚨 High failure rate: ${((metrics.failed / metrics.processed) * 100).toFixed(1)}%`);
    }

    return alerts;
  }

  displayDashboard(metrics: MonitoringMetrics, alerts: string[]) {
    // Clear console
    console.clear();

    console.log("🎯 AI Ranking System Monitor");
    console.log("============================");
    console.log(new Date().toLocaleString());
    console.log("");

    // Coverage stats
    console.log("📊 Coverage Statistics");
    console.log(`Total Businesses: ${metrics.coverage.total}`);
    console.log(`With Rankings: ${metrics.coverage.withScores} (${metrics.coverage.percentage.toFixed(1)}%)`);
    console.log(`Average Confidence: ${metrics.averageConfidenceScore.toFixed(1)}%`);
    console.log("");

    // Top performers
    console.log("🏆 Current Top Performers");
    metrics.topPerformers.slice(0, 5).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.city}) - ${business.category}`);
      console.log(`   Score: ${business.score.toFixed(1)}/100`);
    });
    console.log("");

    // Alerts
    if (alerts.length > 0) {
      console.log("⚠️  Alerts");
      alerts.forEach(alert => console.log(alert));
      console.log("");
    }

    // Processing status
    console.log("⚡ Processing Status");
    console.log(`Processed: ${metrics.processed}`);
    console.log(`Failed: ${metrics.failed}`);
    console.log("");

    console.log("Press Ctrl+C to stop monitoring");
  }

  async validateRankingDistribution() {
    const rankings = await this.client.query(api.rankings.businessRankings.getAllRankings, {
      limit: 1000,
    });

    if (rankings.length === 0) {
      return { isNormal: false, message: "No rankings found" };
    }

    // Calculate distribution statistics
    const scores = rankings.map(r => r.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Check if distribution is reasonable
    const isNormal = mean > 40 && mean < 70 && stdDev > 10 && stdDev < 30;

    return {
      isNormal,
      mean,
      stdDev,
      message: isNormal ? "Distribution looks healthy" : "Distribution may need adjustment",
    };
  }

  async start() {
    console.log("🚀 Starting ranking monitor...\n");
    this.isRunning = true;

    while (this.isRunning) {
      try {
        const metrics = await this.collectMetrics();
        const alerts = await this.checkQuality(metrics);
        this.displayDashboard(metrics, alerts);

        // Validate distribution periodically
        if (Math.random() < 0.1) { // 10% chance each cycle
          const distribution = await this.validateRankingDistribution();
          if (!distribution.isNormal) {
            console.log(`\n📊 Distribution Check: ${distribution.message}`);
          }
        }

        await this.sleep(this.refreshInterval);
      } catch (error) {
        console.error("❌ Monitoring error:", error);
        await this.sleep(5000); // Wait 5s before retrying
      }
    }
  }

  stop() {
    this.isRunning = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  if (!CONVEX_URL || CONVEX_URL.includes("YOUR_CONVEX_URL")) {
    console.error("❌ CONVEX_URL environment variable not set");
    console.log("Please set CONVEX_URL in your .env file\n");
    return;
  }

  const monitor = new RankingMonitor();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log("\n\n👋 Stopping monitor...");
    monitor.stop();
    process.exit(0);
  });

  await monitor.start();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RankingMonitor };