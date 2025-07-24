#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import fs from 'fs';
import Papa from 'papaparse';

// Get Convex URL
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL not found");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function checkImportCapacity() {
  console.log("🔍 Checking Current Import Capacity\n");
  
  try {
    // Get current stats for both reviews and businesses
    const [reviewStats, businessStats] = await Promise.all([
      client.query("reviewImportOptimized:getImportStats"),
      client.query("businessImportOptimized:getBusinessImportStats")
    ]);
    
    console.log("📊 Current Database State:");
    console.log(`   Total Businesses: ${businessStats.totalBusinesses.toLocaleString()}`);
    console.log(`   Total Reviews: ${reviewStats.totalReviews.toLocaleString()}`);
    console.log(`   Avg Reviews/Business: ${reviewStats.averageReviewsPerBusiness}`);
    console.log(`   Avg Business Rating: ${businessStats.averageRating.toFixed(1)}`);
    
    console.log("\n📈 Business Analysis:");
    console.log(`   Businesses Checked: ${businessStats.sampleStats.businessesChecked}`);
    console.log(`   With PlaceID: ${businessStats.sampleStats.businessesWithPlaceId} (${businessStats.sampleStats.percentageWithPlaceId}%)`);
    console.log(`   With Reviews: ${businessStats.sampleStats.businessesWithReviews} (${businessStats.sampleStats.percentageWithReviews}%)`);
    
    console.log("\n📈 Review Analysis:");
    console.log(`   Reviews Checked: ${reviewStats.sampleStats.businessesChecked}`);
    console.log(`   Sample Size: ${reviewStats.sampleSize || reviewStats.totalReviews}`);
    
    console.log("\n⚠️ Current Limits:");
    console.log(`   Max Reads per Function: ${reviewStats.limits.maxReadsPerFunction}`);
    console.log(`   Review Batch Size: ${reviewStats.limits.recommendedBatchSize}`);
    console.log(`   Business Batch Size: ${businessStats.limits.recommendedBatchSize}`);
    console.log(`   Max Function Duration: ${reviewStats.limits.maxFunctionDuration}`);
    
    console.log("\n🚀 Business Import Recommendations:");
    
    if (businessStats.totalBusinesses < 5000) {
      console.log("   ✅ Low volume: You can import 500+ businesses per batch");
    } else if (businessStats.totalBusinesses < 20000) {
      console.log("   ⚠️ Medium volume: Limit to 250-400 businesses per batch");
    } else {
      console.log("   🔥 High volume: Limit to 100-250 businesses per batch");
    }
    
    console.log("\n🚀 Review Import Recommendations:");
    
    if (reviewStats.totalReviews < 10000) {
      console.log("   ✅ Low volume: You can import 1000+ reviews per batch");
    } else if (reviewStats.totalReviews < 50000) {
      console.log("   ⚠️ Medium volume: Limit to 500-750 reviews per batch");
    } else {
      console.log("   🔥 High volume: Limit to 200-500 reviews per batch");
      console.log("   🔥 Consider using skipDuplicateCheck=true if you pre-filter duplicates");
    }
    
    console.log("\n💡 Optimization Tips:");
    console.log("   • Use skipDuplicateCheck=true for faster imports (if pre-filtered)");
    console.log("   • Process files in 500-review chunks for best performance");
    console.log("   • Ensure all reviews have PlaceIDs for efficient business matching");
    console.log("   • Pre-validate your CSV files before importing");
    
  } catch (error) {
    console.error("❌ Error checking capacity:", error);
  }
}

async function analyzeCSVFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  console.log(`\n📄 Analyzing CSV File: ${filePath}`);
  
  const csvContent = fs.readFileSync(filePath, 'utf8');
  
  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data as any[];
      const headers = Object.keys(data[0] || {});
      
      console.log(`   📊 File Stats:`);
      console.log(`      Rows: ${data.length.toLocaleString()}`);
      console.log(`      Columns: ${headers.length}`);
      
      // Check for important fields
      const hasPlaceId = headers.some(h => h.toLowerCase().includes('place'));
      const hasReviewId = headers.some(h => h.toLowerCase().includes('review') && h.toLowerCase().includes('id'));
      const hasBusiness = headers.some(h => h.toLowerCase().includes('business'));
      
      console.log(`   ✅ Field Analysis:`);
      console.log(`      Has PlaceID: ${hasPlaceId ? '✅' : '❌'}`);
      console.log(`      Has ReviewID: ${hasReviewId ? '✅' : '❌'}`);
      console.log(`      Has Business Name: ${hasBusiness ? '✅' : '❌'}`);
      
      // Calculate recommended batches
      const recommendedBatchSize = data.length > 50000 ? 200 : data.length > 10000 ? 500 : 1000;
      const batches = Math.ceil(data.length / recommendedBatchSize);
      
      console.log(`   🚀 Import Recommendations:`);
      console.log(`      Recommended Batch Size: ${recommendedBatchSize}`);
      console.log(`      Number of Batches: ${batches}`);
      console.log(`      Estimated Time: ${batches * 2} - ${batches * 5} minutes`);
      
      if (!hasPlaceId) {
        console.log(`      ⚠️ Warning: Missing PlaceID will cause business matching failures`);
      }
      if (!hasReviewId) {
        console.log(`      ⚠️ Warning: Missing ReviewID will prevent duplicate detection`);
      }
      
      // Show sample row
      console.log(`   📋 Sample Row:`);
      console.log(JSON.stringify(data[0], null, 2));
    },
    error: (error) => {
      console.error("❌ Error parsing CSV:", error);
    }
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const csvFile = args[0];
  
  if (csvFile) {
    await analyzeCSVFile(csvFile);
  }
  
  await checkImportCapacity();
}

main().catch(console.error);