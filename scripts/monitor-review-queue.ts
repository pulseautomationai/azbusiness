#!/usr/bin/env node

/**
 * Review Queue Monitor
 * 
 * Real-time monitoring dashboard for the review import queue system.
 * Provides detailed insights into queue status, processing metrics,
 * and system health during overnight operations.
 * 
 * Usage:
 *   npm run monitor-queue                    # Start monitoring dashboard
 *   npm run monitor-queue -- --interval 10  # Update every 10 seconds
 *   npm run monitor-queue -- --compact      # Compact display mode
 */

import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

interface MonitorOptions {
  interval?: number;
  compact?: boolean;
  showHistory?: boolean;
}

interface QueueMetrics {
  pendingCount: number;
  processingCount: number;
  activeConnections: number;
  maxConnections: number;
  queueDepth: number;
  recentCompleted: number;
  recentFailed: number;
}

interface DetailedMetrics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  totalReviewsFetched: number;
  totalReviewsImported: number;
  errorsByType: Record<string, number>;
}

class ReviewQueueMonitor {
  private options: MonitorOptions;
  private startTime: number;
  private previousStats: QueueMetrics | null = null;
  private sessionStats = {
    totalProcessed: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    totalReviewsImported: 0
  };

  constructor(options: MonitorOptions = {}) {
    this.options = {
      interval: 5,
      compact: false,
      showHistory: false,
      ...options
    };
    this.startTime = Date.now();
  }

  /**
   * Get current queue status
   */
  private async getQueueStatus(): Promise<QueueMetrics | null> {
    try {
      return await client.query(api.geoScraperQueue.getQueueStatus);
    } catch (error) {
      console.error('Error getting queue status:', error);
      return null;
    }
  }

  /**
   * Get detailed metrics from GeoScraper
   */
  private async getDetailedMetrics(): Promise<DetailedMetrics | null> {
    try {
      const metrics = await client.query(api.geoScraperMetrics.getMetricsSummarySimple, {
        timeRange: "hour" // Only get last hour to reduce data
      });
      return {
        totalRequests: metrics.totalRequests || 0,
        successRate: metrics.successfulRequests > 0 ? 
          (metrics.successfulRequests / metrics.totalRequests) * 100 : 0,
        avgResponseTime: metrics.averageResponseTime || 0,
        totalReviewsFetched: metrics.totalReviewsFetched || 0,
        totalReviewsImported: metrics.totalReviewsImported || 0,
        errorsByType: metrics.errorRates || {}
      };
    } catch (error) {
      console.error('Error getting detailed metrics:', error);
      return null;
    }
  }

  /**
   * Clear the console and move cursor to top
   */
  private clearScreen() {
    if (!this.options.compact) {
      console.clear();
    } else {
      // Just add some space in compact mode
      console.log('\n'.repeat(2));
    }
  }

  /**
   * Display the monitoring dashboard
   */
  private async displayDashboard() {
    const now = new Date();
    const runtime = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(runtime / 3600);
    const minutes = Math.floor((runtime % 3600) / 60);
    const seconds = runtime % 60;

    // Get current data
    const queueStatus = await this.getQueueStatus();
    const detailedMetrics = await this.getDetailedMetrics();

    if (!queueStatus) {
      console.log('❌ Unable to fetch queue status');
      return;
    }

    // Calculate deltas if we have previous stats
    let deltaProcessed = 0;
    let deltaSuccessful = 0;
    let deltaFailed = 0;
    
    if (this.previousStats) {
      deltaProcessed = (queueStatus.recentCompleted + queueStatus.recentFailed) - 
                      (this.previousStats.recentCompleted + this.previousStats.recentFailed);
      deltaSuccessful = queueStatus.recentCompleted - this.previousStats.recentCompleted;
      deltaFailed = queueStatus.recentFailed - this.previousStats.recentFailed;
      
      this.sessionStats.totalProcessed += deltaProcessed;
      this.sessionStats.totalSuccessful += deltaSuccessful;
      this.sessionStats.totalFailed += deltaFailed;
    }

    this.clearScreen();

    // Header
    console.log('🚀 Arizona Business Review Queue Monitor');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📅 ${now.toLocaleString()} | Runtime: ${hours}h ${minutes}m ${seconds}s`);

    // Queue Status
    console.log('\n📊 QUEUE STATUS');
    console.log('─────────────────────────────────────────');
    console.log(`📋 Pending: ${queueStatus.pendingCount} items`);
    console.log(`⚡ Processing: ${queueStatus.processingCount}/${queueStatus.maxConnections} connections`);
    console.log(`📈 Queue Depth: ${queueStatus.queueDepth}`);
    
    // Connection status indicator
    const connectionStatus = queueStatus.processingCount === queueStatus.maxConnections ? '🔴 FULL' :
                            queueStatus.processingCount > 0 ? '🟡 ACTIVE' : '🟢 IDLE';
    console.log(`🔗 Connections: ${connectionStatus}`);

    // Processing Stats
    console.log('\n📈 PROCESSING STATS');
    console.log('─────────────────────────────────────────');
    console.log(`✅ Recent Completed: ${queueStatus.recentCompleted}`);
    console.log(`❌ Recent Failed: ${queueStatus.recentFailed}`);
    
    if (this.sessionStats.totalProcessed > 0) {
      const successRate = ((this.sessionStats.totalSuccessful / this.sessionStats.totalProcessed) * 100).toFixed(1);
      console.log(`📊 Session Total: ${this.sessionStats.totalProcessed} (${successRate}% success)`);
      
      // Processing rate
      const processingRate = (this.sessionStats.totalProcessed / (runtime / 60)).toFixed(1);
      console.log(`⚡ Processing Rate: ${processingRate} items/minute`);
    }

    // Show deltas if available
    if (deltaProcessed > 0) {
      console.log(`📊 Since last update: +${deltaProcessed} processed (${deltaSuccessful} success, ${deltaFailed} failed)`);
    }

    // Detailed Metrics
    if (detailedMetrics) {
      console.log('\n🔍 DETAILED METRICS');
      console.log('─────────────────────────────────────────');
      console.log(`📞 Total API Requests: ${detailedMetrics.totalRequests.toLocaleString()}`);
      console.log(`📝 Reviews Fetched: ${detailedMetrics.totalReviewsFetched.toLocaleString()}`);
      console.log(`💾 Reviews Imported: ${detailedMetrics.totalReviewsImported.toLocaleString()}`);
      console.log(`⏱️  Avg Response Time: ${detailedMetrics.avgResponseTime.toFixed(0)}ms`);
      console.log(`✅ Success Rate: ${detailedMetrics.successRate.toFixed(1)}%`);

      // Show error breakdown if there are errors
      const totalErrors = Object.values(detailedMetrics.errorsByType).reduce((sum, count) => sum + count, 0);
      if (totalErrors > 0) {
        console.log('\n⚠️  ERROR BREAKDOWN');
        console.log('─────────────────────────────────────────');
        Object.entries(detailedMetrics.errorsByType)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .forEach(([error, count]) => {
            console.log(`   ${error}: ${count}`);
          });
      }
    }

    // Status indicator
    if (queueStatus.pendingCount === 0 && queueStatus.processingCount === 0) {
      console.log('\n🎯 STATUS: Queue is empty - waiting for new items');
    } else if (queueStatus.processingCount === queueStatus.maxConnections) {
      console.log('\n🎯 STATUS: All connections busy - processing at maximum capacity');
    } else {
      console.log(`\n🎯 STATUS: Processing ${queueStatus.processingCount} items, ${queueStatus.pendingCount} queued`);
    }

    // ETA Calculation
    if (queueStatus.pendingCount > 0 && this.sessionStats.totalProcessed > 0) {
      const avgTimePerItem = runtime / this.sessionStats.totalProcessed;
      const etaSeconds = Math.ceil((queueStatus.pendingCount * avgTimePerItem) / queueStatus.maxConnections);
      const etaHours = Math.floor(etaSeconds / 3600);
      const etaMinutes = Math.floor((etaSeconds % 3600) / 60);
      
      console.log(`⏰ Estimated completion: ${etaHours}h ${etaMinutes}m`);
    }

    // Footer
    console.log('\n─────────────────────────────────────────');
    console.log(`Next update in ${this.options.interval} seconds | Press Ctrl+C to stop`);

    // Store current stats for delta calculation
    this.previousStats = { ...queueStatus };
  }

  /**
   * Start monitoring
   */
  async start() {
    console.log('🎯 Starting Review Queue Monitor...');
    console.log(`⚙️  Update interval: ${this.options.interval} seconds\n`);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Monitor stopped by user');
      process.exit(0);
    });

    // Initial display
    await this.displayDashboard();

    // Set up interval
    const interval = setInterval(async () => {
      try {
        await this.displayDashboard();
      } catch (error) {
        console.error('Error updating dashboard:', error);
      }
    }, this.options.interval! * 1000);

    // Keep the process running
    process.on('SIGTERM', () => {
      clearInterval(interval);
      console.log('\n🛑 Monitor stopped');
      process.exit(0);
    });
  }
}

// Parse command line arguments
function parseArgs(): MonitorOptions {
  const args = process.argv.slice(2);
  const options: MonitorOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--interval':
        options.interval = parseInt(args[++i]) || 5;
        break;
      case '--compact':
        options.compact = true;
        break;
      case '--history':
        options.showHistory = true;
        break;
      case '--help':
        console.log(`
Review Queue Monitor - Usage:

Options:
  --interval <seconds>    Update interval in seconds (default: 5)
  --compact              Use compact display mode
  --history              Show processing history
  --help                 Show this help message

Examples:
  npm run monitor-queue                    # Monitor with 5-second updates
  npm run monitor-queue -- --interval 10  # Update every 10 seconds
  npm run monitor-queue -- --compact      # Compact display mode
`);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const monitor = new ReviewQueueMonitor(options);
    await monitor.start();
  } catch (error) {
    console.error('❌ Monitor error:', error);
    process.exit(1);
  }
}

// ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}