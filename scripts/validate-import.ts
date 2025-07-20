#!/usr/bin/env node

/**
 * Standalone Import Validation Script
 * Validates import batches for quality assurance
 * Usage: npm run validate-import [batchId]
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const client = new ConvexHttpClient(CONVEX_URL);

interface ValidationResults {
  batchId: string;
  status: string;
  overallScore: number;
  categories: Record<string, {
    passed: boolean;
    score: number;
    checks: Array<{ name: string; passed: boolean; message: string; details?: any }>;
    duration: number;
  }>;
  sampleBusinesses: Array<{
    _id: string;
    name: string;
    urlPath: string;
    city: string;
    category: string;
  }>;
  recommendations: string[];
  errors: Array<{ category: string; businessId?: string; message: string; severity: string }>;
  statistics: {
    totalBusinesses: number;
    expectedBusinesses: number;
    successfulCreated: number;
    failedCreated: number;
    duplicatesSkipped: number;
  };
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
};

function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}

function printHeader(text: string): void {
  console.log('\n' + colorize('='.repeat(60), colors.cyan));
  console.log(colorize(text.toUpperCase(), colors.bright + colors.cyan));
  console.log(colorize('='.repeat(60), colors.cyan));
}

function printSubHeader(text: string): void {
  console.log('\n' + colorize(text, colors.bright + colors.blue));
  console.log(colorize('-'.repeat(text.length), colors.blue));
}

function printSuccess(text: string): void {
  console.log(colorize(`✅ ${text}`, colors.green));
}

function printError(text: string): void {
  console.log(colorize(`❌ ${text}`, colors.red));
}

function printWarning(text: string): void {
  console.log(colorize(`⚠️  ${text}`, colors.yellow));
}

function printInfo(text: string): void {
  console.log(colorize(`ℹ️  ${text}`, colors.blue));
}

function getScoreColor(score: number): string {
  if (score >= 90) return colors.green;
  if (score >= 75) return colors.yellow;
  return colors.red;
}

async function listRecentImports(): Promise<void> {
  try {
    printHeader('Recent Import Batches');
    
    const batches = await client.query(api.batchImport.getImportBatches, { limit: 10 });
    
    if (batches.length === 0) {
      printWarning('No import batches found');
      return;
    }

    console.log('\nBatch ID'.padEnd(25) + 'Type'.padEnd(15) + 'Status'.padEnd(12) + 'Businesses'.padEnd(12) + 'Date');
    console.log('-'.repeat(80));

    batches.forEach((batch) => {
      const date = new Date(batch.importedAt).toLocaleDateString();
      const statusColor = batch.status === 'completed' ? colors.green : 
                         batch.status === 'failed' ? colors.red : colors.yellow;
      
      console.log(
        batch._id.slice(-20).padEnd(25) +
        batch.importType.padEnd(15) +
        colorize(batch.status.padEnd(12), statusColor) +
        String(batch.businessCount).padEnd(12) +
        date
      );
    });

    console.log('\nUse: npm run validate-import <batchId> to validate a specific batch');
  } catch (error) {
    printError(`Failed to list imports: ${error}`);
  }
}

async function validateBatch(batchId: string, fullValidation: boolean = false): Promise<void> {
  try {
    printHeader(`Validating Import Batch: ${batchId.slice(-8)}`);
    
    printInfo('Starting validation process...');
    console.log(colorize(`Full validation: ${fullValidation ? 'Yes' : 'No (quick mode)'}`, colors.dim));
    
    const startTime = Date.now();
    
    // Run validation
    const results = await client.mutation(api.importValidation.validateImportBatch, {
      batchId: batchId as any,
      runFullValidation: fullValidation,
    });

    const duration = Date.now() - startTime;
    
    printValidationResults(results, duration);
    
  } catch (error) {
    printError(`Validation failed: ${error}`);
    process.exit(1);
  }
}

function printValidationResults(results: ValidationResults, duration: number): void {
  // Overall Score
  printSubHeader('Overall Results');
  const scoreColor = getScoreColor(results.overallScore);
  console.log(`Overall Score: ${colorize(`${results.overallScore}/100`, scoreColor + colors.bright)}`);
  console.log(`Status: ${results.status === 'completed' ? 
    colorize('COMPLETED', colors.green) : 
    colorize(results.status.toUpperCase(), colors.red)}`);
  console.log(`Duration: ${colorize(`${duration}ms`, colors.dim)}`);

  // Statistics
  printSubHeader('Import Statistics');
  console.log(`Expected Businesses: ${colorize(String(results.statistics.expectedBusinesses), colors.blue)}`);
  console.log(`Successfully Created: ${colorize(String(results.statistics.successfulCreated), colors.green)}`);
  console.log(`Failed: ${colorize(String(results.statistics.failedCreated), colors.red)}`);
  console.log(`Duplicates Skipped: ${colorize(String(results.statistics.duplicatesSkipped), colors.yellow)}`);

  // Category Results
  printSubHeader('Validation Categories');
  
  Object.entries(results.categories).forEach(([categoryName, category]) => {
    const categoryTitle = categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const statusIcon = category.passed ? '✅' : '❌';
    const scoreColor = getScoreColor(category.score);
    
    console.log(`\n${statusIcon} ${colorize(categoryTitle, colors.bright)} (${colorize(`${category.score}/100`, scoreColor)})`);
    console.log(`   Duration: ${colorize(`${category.duration}ms`, colors.dim)}`);
    
    // Show individual checks
    category.checks.forEach((check) => {
      const checkIcon = check.passed ? '  ✓' : '  ✗';
      const checkColor = check.passed ? colors.green : colors.red;
      console.log(`${colorize(checkIcon, checkColor)} ${check.name}: ${check.message}`);
      
      // Show details if available and check failed
      if (!check.passed && check.details) {
        const detailStr = typeof check.details === 'object' ? 
          JSON.stringify(check.details, null, 2).split('\n').map(line => `      ${line}`).join('\n') :
          `      ${check.details}`;
        console.log(colorize(detailStr, colors.dim));
      }
    });
  });

  // Sample Businesses
  if (results.sampleBusinesses.length > 0) {
    printSubHeader('Sample Businesses for Testing');
    results.sampleBusinesses.forEach((business, index) => {
      console.log(`${index + 1}. ${colorize(business.name, colors.bright)} (${business.city})`);
      console.log(`   URL: ${colorize(business.urlPath, colors.blue)}`);
      console.log(`   Category: ${business.category}`);
      console.log(`   Test URL: ${colorize(`http://localhost:5173${business.urlPath}`, colors.cyan)}`);
    });
  }

  // Recommendations
  if (results.recommendations.length > 0) {
    printSubHeader('Recommendations');
    results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  // Errors
  if (results.errors.length > 0) {
    printSubHeader('Errors & Issues');
    results.errors.forEach((error) => {
      const severityColor = error.severity === 'error' ? colors.red :
                           error.severity === 'warning' ? colors.yellow : colors.blue;
      const severityIcon = error.severity === 'error' ? '🚨' :
                          error.severity === 'warning' ? '⚠️' : 'ℹ️';
      
      console.log(`${severityIcon} ${colorize(`[${error.severity.toUpperCase()}]`, severityColor)} ${error.category}: ${error.message}`);
      if (error.businessId) {
        console.log(`   Business ID: ${colorize(error.businessId, colors.dim)}`);
      }
    });
  }

  // Summary
  printSubHeader('Summary');
  
  if (results.overallScore >= 90) {
    printSuccess('Excellent! Import is production-ready.');
  } else if (results.overallScore >= 75) {
    printWarning('Good import quality with minor issues.');
  } else {
    printError('Import has significant issues that should be addressed.');
  }

  console.log(`\nValidation completed in ${colorize(`${duration}ms`, colors.dim)}`);
  
  // Next steps
  console.log('\n' + colorize('Next Steps:', colors.bright));
  console.log('• Test sample business URLs in your browser');
  console.log('• Run sitemap regeneration if needed: npm run generate-sitemap-db');
  console.log('• Review any failed checks and fix underlying issues');
  console.log('• Run full validation for comprehensive SEO testing: --full');
}

async function exportValidationResults(batchId: string): Promise<void> {
  try {
    printInfo('Exporting validation results...');
    
    const results = await client.query(api.importValidation.getValidationResults, {
      batchId: batchId as any,
    });

    if (!results) {
      printError('No validation results found for this batch');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `validation-${batchId.slice(-8)}-${timestamp}.json`;
    
    // Write to file
    const fs = await import('fs');
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    
    printSuccess(`Validation results exported to: ${filename}`);
  } catch (error) {
    printError(`Export failed: ${error}`);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await listRecentImports();
    return;
  }

  const command = args[0];
  
  if (command === '--help' || command === '-h') {
    console.log(colorize('Import Validation Script', colors.bright + colors.cyan));
    console.log('\nUsage:');
    console.log('  npm run validate-import                    # List recent imports');
    console.log('  npm run validate-import <batchId>          # Validate specific batch (quick)');
    console.log('  npm run validate-import <batchId> --full   # Full validation with SEO tests');
    console.log('  npm run validate-import <batchId> --export # Export results to JSON');
    console.log('\nExamples:');
    console.log('  npm run validate-import abc123');
    console.log('  npm run validate-import abc123 --full');
    console.log('  npm run validate-import abc123 --export');
    return;
  }

  const batchId = command;
  const hasFullFlag = args.includes('--full');
  const hasExportFlag = args.includes('--export');

  if (hasExportFlag) {
    await exportValidationResults(batchId);
  } else {
    await validateBatch(batchId, hasFullFlag);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  printError(`Uncaught error: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  printError(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    printError(`Script failed: ${error}`);
    process.exit(1);
  });
}