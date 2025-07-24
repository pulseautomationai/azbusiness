import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Log file configuration
const LOG_DIR = path.join(process.cwd(), 'logs', 'ai-analysis');
const LOG_FILE = path.join(LOG_DIR, `analysis-${new Date().toISOString().split('T')[0]}.log`);
const ERROR_LOG_FILE = path.join(LOG_DIR, `analysis-errors-${new Date().toISOString().split('T')[0]}.log`);
const SUMMARY_FILE = path.join(LOG_DIR, 'analysis-summary.json');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  businessId?: string;
  businessName?: string;
  action: string;
  details?: any;
  score?: number;
  reviewCount?: number;
  processingTime?: number;
}

interface AnalysisSummary {
  lastUpdated: string;
  totalBusinesses: number;
  analyzedBusinesses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageScore: number;
  averageProcessingTime: number;
  topScores: Array<{
    businessName: string;
    score: number;
    reviewCount: number;
  }>;
  errors: Array<{
    timestamp: string;
    businessName: string;
    error: string;
  }>;
  dailyStats: {
    [date: string]: {
      analyzed: number;
      successful: number;
      failed: number;
      avgScore: number;
    };
  };
}

function log(entry: LogEntry) {
  const logLine = `[${entry.timestamp}] ${entry.level} - ${entry.action}`;
  const details = entry.details ? ` | Details: ${JSON.stringify(entry.details)}` : '';
  const fullLog = logLine + details + '\n';
  
  // Write to main log
  fs.appendFileSync(LOG_FILE, fullLog);
  
  // Write errors to error log
  if (entry.level === 'ERROR') {
    fs.appendFileSync(ERROR_LOG_FILE, fullLog);
  }
  
  // Also output to console with colors
  const colors = {
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Green
    ERROR: '\x1b[31m',   // Red
    WARNING: '\x1b[33m', // Yellow
    RESET: '\x1b[0m'
  };
  
  console.log(`${colors[entry.level]}${logLine}${colors.RESET}${details}`);
}

async function updateSummary() {
  try {
    // Get current summary or create new one
    let summary: AnalysisSummary;
    if (fs.existsSync(SUMMARY_FILE)) {
      summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf-8'));
    } else {
      summary = {
        lastUpdated: new Date().toISOString(),
        totalBusinesses: 0,
        analyzedBusinesses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        averageScore: 0,
        averageProcessingTime: 0,
        topScores: [],
        errors: [],
        dailyStats: {}
      };
    }
    
    // Update with latest data from Convex - fetch all businesses using pagination
    const allBusinesses: any[] = [];
    let cursor: string | null | undefined = undefined;
    
    do {
      const response = await client.query(api.businesses.getBusinessesWithReviewCounts, {
        limit: 50,
        cursor
      });
      allBusinesses.push(...response.businesses);
      cursor = response.nextCursor;
    } while (cursor);
    
    const businesses = allBusinesses;
    const today = new Date().toISOString().split('T')[0];
    
    summary.lastUpdated = new Date().toISOString();
    summary.totalBusinesses = businesses.length;
    summary.analyzedBusinesses = businesses.filter(b => b.hasAIAnalysis).length;
    
    // Initialize daily stats for today if not exists
    if (!summary.dailyStats[today]) {
      summary.dailyStats[today] = {
        analyzed: 0,
        successful: 0,
        failed: 0,
        avgScore: 0
      };
    }
    
    // Save updated summary
    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
    
    return summary;
  } catch (error) {
    log({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      action: 'UPDATE_SUMMARY_FAILED',
      details: { error: error instanceof Error ? error.message : String(error) }
    });
  }
}

// Logger functions for different events
export const logger = {
  analysisStarted: (businessId: string, businessName: string, reviewCount: number) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      businessId,
      businessName,
      action: 'ANALYSIS_STARTED',
      reviewCount,
      details: { reviewCount }
    });
  },
  
  analysisCompleted: (businessId: string, businessName: string, score: number, processingTime: number) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      businessId,
      businessName,
      action: 'ANALYSIS_COMPLETED',
      score,
      processingTime,
      details: { score, processingTimeSeconds: processingTime / 1000 }
    });
    
    // Update summary
    updateSummary();
  },
  
  analysisFailed: (businessId: string, businessName: string, error: string) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      businessId,
      businessName,
      action: 'ANALYSIS_FAILED',
      details: { error }
    });
    
    // Update summary
    updateSummary();
  },
  
  analysisSkipped: (businessId: string, businessName: string, reason: string) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      businessId,
      businessName,
      action: 'ANALYSIS_SKIPPED',
      details: { reason }
    });
  },
  
  batchStarted: (totalBusinesses: number, options?: any) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      action: 'BATCH_ANALYSIS_STARTED',
      details: { totalBusinesses, options }
    });
  },
  
  batchCompleted: (successful: number, failed: number, skipped: number, totalTime: number) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      action: 'BATCH_ANALYSIS_COMPLETED',
      details: {
        successful,
        failed,
        skipped,
        totalTimeMinutes: Math.round(totalTime / 60),
        avgTimePerBusiness: Math.round(totalTime / (successful + failed))
      }
    });
  },
  
  rateLimitPause: (duration: number) => {
    log({
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      action: 'RATE_LIMIT_PAUSE',
      details: { durationSeconds: duration / 1000 }
    });
  }
};

// Generate analysis report
async function generateReport() {
  console.log('\n📊 Generating Analysis Report...\n');
  
  try {
    const summary = await updateSummary();
    if (!summary) return;
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    AI ANALYSIS REPORT                          ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log();
    console.log(`Last Updated: ${new Date(summary.lastUpdated).toLocaleString()}`);
    console.log();
    console.log('📈 OVERALL STATISTICS');
    console.log('─────────────────────');
    console.log(`Total Businesses: ${summary.totalBusinesses}`);
    console.log(`Analyzed: ${summary.analyzedBusinesses} (${Math.round(summary.analyzedBusinesses / summary.totalBusinesses * 100)}%)`);
    console.log(`Success Rate: ${summary.successfulAnalyses} successful, ${summary.failedAnalyses} failed`);
    console.log(`Average Score: ${summary.averageScore.toFixed(1)}/100`);
    console.log(`Avg Processing Time: ${summary.averageProcessingTime.toFixed(1)}s per business`);
    console.log();
    
    // Daily breakdown
    console.log('📅 DAILY BREAKDOWN');
    console.log('─────────────────');
    const dates = Object.keys(summary.dailyStats).sort().slice(-7); // Last 7 days
    dates.forEach(date => {
      const stats = summary.dailyStats[date];
      console.log(`${date}: ${stats.analyzed} analyzed (${stats.successful} ✓, ${stats.failed} ✗) - Avg Score: ${stats.avgScore.toFixed(1)}`);
    });
    console.log();
    
    // Top performers
    if (summary.topScores.length > 0) {
      console.log('🏆 TOP PERFORMERS');
      console.log('────────────────');
      summary.topScores.slice(0, 10).forEach((business, index) => {
        console.log(`${index + 1}. ${business.businessName} - Score: ${business.score}/100 (${business.reviewCount} reviews)`);
      });
      console.log();
    }
    
    // Recent errors
    if (summary.errors.length > 0) {
      console.log('⚠️  RECENT ERRORS (Last 5)');
      console.log('─────────────────────────');
      summary.errors.slice(-5).forEach(error => {
        console.log(`[${error.timestamp}] ${error.businessName}: ${error.error}`);
      });
      console.log();
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log();
    console.log(`📁 Full logs available at: ${LOG_DIR}`);
    console.log(`   - Main log: ${path.basename(LOG_FILE)}`);
    console.log(`   - Error log: ${path.basename(ERROR_LOG_FILE)}`);
    console.log(`   - Summary: ${path.basename(SUMMARY_FILE)}`);
    
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'report':
    generateReport()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Failed to generate report:', error);
        process.exit(1);
      });
    break;
    
  case 'watch':
    console.log('📝 Watching for log updates...');
    console.log('Press Ctrl+C to stop\n');
    
    // Tail the log file
    const tail = require('child_process').spawn('tail', ['-f', LOG_FILE]);
    tail.stdout.on('data', (data: Buffer) => {
      process.stdout.write(data);
    });
    
    process.on('SIGINT', () => {
      tail.kill();
      console.log('\n\nLog watching stopped.');
      process.exit(0);
    });
    break;
    
  default:
    console.log(`
AI Analysis Logger

Usage:
  npm run analyze-log report    Generate analysis report
  npm run analyze-log watch     Watch live log updates
  
The logger is automatically used by the analyze-all script.
    `);
}

// Export for use in other scripts
export default logger;