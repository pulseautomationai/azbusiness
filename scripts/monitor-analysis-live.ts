import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Cache for businesses data
let cachedBusinesses: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 20000; // 20 seconds cache for live monitoring

// ANSI color codes for terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

interface MonitorStats {
  totalBusinesses: number;
  withReviews: number;
  analyzed: number;
  inProgress: number;
  failed: number;
  avgScore: number;
  recentlyAnalyzed: number;
  analysisRate: number;
  estimatedTimeRemaining: string;
}

// Track analysis rate
let previousAnalyzed = 0;
let previousTime = Date.now();

async function clearScreen() {
  console.clear();
  process.stdout.write('\x1Bc'); // Clear scrollback buffer
}

async function fetchBusinessesWithCache() {
  const now = Date.now();
  
  // Use cache if available and not expired
  if (cachedBusinesses && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedBusinesses;
  }
  
  // Fetch new data
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
  
  // Update cache
  cachedBusinesses = allBusinesses;
  lastFetchTime = now;
  
  return allBusinesses;
}

async function getLiveStats(): Promise<MonitorStats> {
  const businesses = await fetchBusinessesWithCache();
  
  const now = Date.now();
  const timeDiff = (now - previousTime) / 1000; // seconds
  
  // Calculate statistics
  const totalBusinesses = businesses.length;
  const withReviews = businesses.filter(b => b.reviewCount > 0).length;
  const analyzed = businesses.filter(b => b.hasAIAnalysis).length;
  
  // Calculate analysis rate (businesses per minute)
  const newlyAnalyzed = analyzed - previousAnalyzed;
  const analysisRate = timeDiff > 0 ? (newlyAnalyzed / timeDiff) * 60 : 0;
  
  // Update tracking
  previousAnalyzed = analyzed;
  previousTime = now;
  
  // Get recently analyzed (last hour)
  const oneHourAgo = now - (60 * 60 * 1000);
  const recentlyAnalyzed = businesses.filter(b => 
    b.lastAnalyzed && b.lastAnalyzed > oneHourAgo
  ).length;
  
  // Estimate remaining time
  const remaining = withReviews - analyzed;
  const estimatedMinutes = analysisRate > 0 ? Math.round(remaining / analysisRate) : 0;
  const estimatedTimeRemaining = formatTime(estimatedMinutes * 60);
  
  // Calculate average score (placeholder - would need to query rankings)
  const avgScore = 75; // You could enhance this by querying actual scores
  
  return {
    totalBusinesses,
    withReviews,
    analyzed,
    inProgress: 0, // Could track this with a status field
    failed: 0, // Could track this with error logging
    avgScore,
    recentlyAnalyzed,
    analysisRate,
    estimatedTimeRemaining,
  };
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "calculating...";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function drawProgressBar(current: number, total: number, width: number = 40): string {
  const percentage = total > 0 ? current / total : 0;
  const filled = Math.round(percentage * width);
  const empty = width - filled;
  
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `[${bar}] ${Math.round(percentage * 100)}%`;
}

function drawDashboard(stats: MonitorStats) {
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║        AI ANALYSIS LIVE MONITOR - ${timestamp}        ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log();
  
  // Overview Stats
  console.log(`${colors.bright}📊 OVERVIEW${colors.reset}`);
  console.log(`   Total Businesses: ${colors.yellow}${stats.totalBusinesses}${colors.reset}`);
  console.log(`   With Reviews: ${colors.yellow}${stats.withReviews}${colors.reset}`);
  console.log(`   Analyzed: ${colors.green}${stats.analyzed}${colors.reset} (${Math.round(stats.analyzed / stats.withReviews * 100)}%)`);
  console.log(`   Remaining: ${colors.red}${stats.withReviews - stats.analyzed}${colors.reset}`);
  console.log();
  
  // Progress Bar
  console.log(`${colors.bright}📈 PROGRESS${colors.reset}`);
  console.log(`   ${drawProgressBar(stats.analyzed, stats.withReviews)}`);
  console.log();
  
  // Performance Metrics
  console.log(`${colors.bright}⚡ PERFORMANCE${colors.reset}`);
  console.log(`   Analysis Rate: ${colors.yellow}${stats.analysisRate.toFixed(1)}${colors.reset} businesses/minute`);
  console.log(`   Recently Analyzed (1h): ${colors.green}${stats.recentlyAnalyzed}${colors.reset}`);
  console.log(`   Est. Time Remaining: ${colors.cyan}${stats.estimatedTimeRemaining}${colors.reset}`);
  console.log();
  
  // Health Indicators
  console.log(`${colors.bright}🏥 SYSTEM HEALTH${colors.reset}`);
  const healthStatus = stats.analysisRate > 0 ? `${colors.green}● ACTIVE${colors.reset}` : `${colors.yellow}● IDLE${colors.reset}`;
  console.log(`   Status: ${healthStatus}`);
  console.log(`   Average Score: ${colors.blue}${stats.avgScore}/100${colors.reset}`);
  console.log();
  
  // Activity Graph (simple ASCII)
  console.log(`${colors.bright}📉 ACTIVITY (last 10 updates)${colors.reset}`);
  console.log(`   Rate: ${"▁▂▃▄▅▆▇█"[Math.min(7, Math.floor(stats.analysisRate / 2))]} ${stats.analysisRate.toFixed(1)}/min`);
  console.log();
  
  // Instructions
  console.log(`${colors.gray}Press Ctrl+C to exit${colors.reset}`);
}

async function startMonitoring() {
  console.log(`${colors.bright}Starting AI Analysis Live Monitor...${colors.reset}\n`);
  
  // Show loading message for first fetch
  if (!cachedBusinesses) {
    console.log(`${colors.yellow}Loading business data...${colors.reset}`);
    console.log(`${colors.dim}This may take a moment with many businesses${colors.reset}`);
  }
  
  // Initial stats fetch
  try {
    const stats = await getLiveStats();
    await clearScreen();
    drawDashboard(stats);
  } catch (error) {
    console.error(`${colors.red}Error fetching initial stats:${colors.reset}`, error);
  }
  
  // Update every 5 seconds
  const interval = setInterval(async () => {
    try {
      const stats = await getLiveStats();
      await clearScreen();
      drawDashboard(stats);
    } catch (error) {
      console.error(`${colors.red}Error updating stats:${colors.reset}`, error);
    }
  }, 5000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(`\n\n${colors.bright}${colors.green}Monitor stopped.${colors.reset}`);
    process.exit(0);
  });
}

// Start the monitor
startMonitoring().catch(console.error);