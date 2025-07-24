import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Cache for businesses data
let cachedBusinesses: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

async function clearScreen() {
  console.clear();
  process.stdout.write('\x1Bc');
}

async function getSystemHealth() {
  try {
    // Check if Convex is running
    const convexRunning = await execAsync('pgrep -f "convex dev"')
      .then(() => true)
      .catch(() => false);
    
    // Check if analysis script is running
    const analysisRunning = await execAsync('pgrep -f "analyze-all-businesses"')
      .then(() => true)
      .catch(() => false);
    
    // Get log file size
    const logDir = path.join(process.cwd(), 'logs', 'ai-analysis');
    const logFile = path.join(logDir, `analysis-${new Date().toISOString().split('T')[0]}.log`);
    let logSize = 0;
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      logSize = stats.size;
    }
    
    return {
      convexRunning,
      analysisRunning,
      logSize,
    };
  } catch (error) {
    return {
      convexRunning: false,
      analysisRunning: false,
      logSize: 0,
    };
  }
}

async function getRecentLogs(lines: number = 5): Promise<string[]> {
  const logDir = path.join(process.cwd(), 'logs', 'ai-analysis');
  const logFile = path.join(logDir, `analysis-${new Date().toISOString().split('T')[0]}.log`);
  
  if (!fs.existsSync(logFile)) {
    return [];
  }
  
  const content = fs.readFileSync(logFile, 'utf-8');
  const logLines = content.trim().split('\n');
  return logLines.slice(-lines);
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
  let pageNum = 1;
  
  do {
    const response = await client.query(api.businesses.getBusinessesWithReviewCounts, {
      limit: 50,
      cursor
    });
    allBusinesses.push(...response.businesses);
    cursor = response.nextCursor;
    pageNum++;
    
    // Show progress without clearing screen
    if (pageNum % 10 === 0) {
      process.stdout.write(`\r${colors.yellow}Loading data... ${allBusinesses.length} businesses loaded${colors.reset}`);
    }
  } while (cursor);
  
  // Clear the progress line
  process.stdout.write('\r' + ' '.repeat(60) + '\r');
  
  // Update cache
  cachedBusinesses = allBusinesses;
  lastFetchTime = now;
  
  return allBusinesses;
}

async function displayDashboard() {
  try {
    await clearScreen();
    
    // Check if we need to show loading message
    if (!cachedBusinesses) {
      console.log(`${colors.yellow}Loading business data for the first time...${colors.reset}`);
      console.log(`${colors.dim}This may take a moment with many businesses${colors.reset}\n`);
    }
    
    const businesses = await fetchBusinessesWithCache();
  const systemHealth = await getSystemHealth();
  const recentLogs = await getRecentLogs(5);
  
  // Calculate stats
  const totalBusinesses = businesses.length;
  const withReviews = businesses.filter(b => b.reviewCount > 0).length;
  const analyzed = businesses.filter(b => b.hasAIAnalysis).length;
  const notAnalyzed = businesses.filter(b => b.reviewCount > 0 && !b.hasAIAnalysis).length;
  const percentage = withReviews > 0 ? Math.round((analyzed / withReviews) * 100) : 0;
  
  // Header
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║               AI ANALYSIS MONITORING DASHBOARD                     ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log();
  
  // System Status
  console.log(`${colors.bright}🏥 SYSTEM STATUS${colors.reset}`);
  console.log(`   Convex Backend: ${systemHealth.convexRunning ? `${colors.green}● RUNNING${colors.reset}` : `${colors.red}● STOPPED${colors.reset}`}`);
  console.log(`   Analysis Script: ${systemHealth.analysisRunning ? `${colors.green}● RUNNING${colors.reset}` : `${colors.yellow}● IDLE${colors.reset}`}`);
  console.log(`   Log File Size: ${(systemHealth.logSize / 1024).toFixed(1)} KB`);
  console.log();
  
  // Analysis Progress
  console.log(`${colors.bright}📊 ANALYSIS PROGRESS${colors.reset}`);
  console.log(`   Total Businesses: ${colors.yellow}${totalBusinesses}${colors.reset}`);
  console.log(`   With Reviews: ${colors.yellow}${withReviews}${colors.reset}`);
  console.log(`   Analyzed: ${colors.green}${analyzed}${colors.reset} (${percentage}%)`);
  console.log(`   Not Analyzed: ${colors.red}${notAnalyzed}${colors.reset}`);
  console.log();
  
  // Progress Bar
  const barWidth = 50;
  const filled = Math.round((percentage / 100) * barWidth);
  const empty = barWidth - filled;
  const progressBar = `${"█".repeat(filled)}${"░".repeat(empty)}`;
  console.log(`   Progress: [${colors.green}${progressBar}${colors.reset}] ${percentage}%`);
  console.log();
  
  // Top Unanalyzed
  console.log(`${colors.bright}🎯 TOP UNANALYZED BUSINESSES${colors.reset}`);
  const topUnanalyzed = businesses
    .filter(b => b.reviewCount > 0 && !b.hasAIAnalysis)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);
  
  if (topUnanalyzed.length > 0) {
    topUnanalyzed.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name} (${b.city}) - ${colors.yellow}${b.reviewCount} reviews${colors.reset}`);
    });
  } else {
    console.log(`   ${colors.green}All businesses analyzed!${colors.reset}`);
  }
  console.log();
  
  // Recent Activity
  console.log(`${colors.bright}📋 RECENT ACTIVITY${colors.reset}`);
  if (recentLogs.length > 0) {
    recentLogs.forEach(log => {
      const match = log.match(/\[(.*?)\] (\w+) - (.+)/);
      if (match) {
        const [, timestamp, level, message] = match;
        const time = new Date(timestamp).toLocaleTimeString();
        const levelColor = level === 'SUCCESS' ? colors.green : 
                         level === 'ERROR' ? colors.red : 
                         level === 'WARNING' ? colors.yellow : colors.gray;
        console.log(`   ${colors.dim}${time}${colors.reset} ${levelColor}${message.substring(0, 50)}${colors.reset}`);
      }
    });
  } else {
    console.log(`   ${colors.gray}No recent activity${colors.reset}`);
  }
  console.log();
  
  // Commands
  console.log(`${colors.bright}⌨️  QUICK COMMANDS${colors.reset}`);
  console.log(`   ${colors.cyan}npm run analyze-all -- --limit 50${colors.reset}     Start analysis (50 businesses)`);
  console.log(`   ${colors.cyan}npm run monitor-live${colors.reset}                  Live monitoring view`);
  console.log(`   ${colors.cyan}npm run analyze-log report${colors.reset}            Generate detailed report`);
  console.log();
  
  // Footer
  console.log(`${colors.dim}Last updated: ${new Date().toLocaleString()} | Press Ctrl+C to exit${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error displaying dashboard:${colors.reset}`, error);
  }
}

// Main function
async function main() {
  console.log(`${colors.bright}Starting AI Analysis Dashboard...${colors.reset}\n`);
  
  // Display dashboard immediately
  await displayDashboard();
  
  // Update every 10 seconds
  const interval = setInterval(async () => {
    await displayDashboard();
  }, 10000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(`\n\n${colors.bright}${colors.green}Dashboard stopped.${colors.reset}`);
    process.exit(0);
  });
}

// Run the dashboard
main().catch(error => {
  console.error(`${colors.red}Error running dashboard:${colors.reset}`, error);
  process.exit(1);
});