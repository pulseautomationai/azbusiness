#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Get Convex URL
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL not found");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Get business name from command line
const businessName = process.argv.slice(2).join(' ');

if (!businessName) {
  console.error("❌ Please provide a business name");
  console.error("Usage: npm run sync-specific-business \"Business Name\"");
  process.exit(1);
}

async function syncSpecificBusiness() {
  console.log(`🔍 Searching for business: "${businessName}"...`);
  
  try {
    // Search for the business
    const searchResults = await client.query(api.businesses.searchBusinesses, {
      query: businessName,
      limit: 10
    });
    
    if (searchResults.length === 0) {
      console.error(`❌ No businesses found matching "${businessName}"`);
      return;
    }
    
    // Find exact match or best match
    let targetBusiness = searchResults.find(b => 
      b.name.toLowerCase() === businessName.toLowerCase()
    ) || searchResults[0];
    
    console.log(`\n✅ Found business: ${targetBusiness.name}`);
    console.log(`ID: ${targetBusiness._id}`);
    console.log(`Current review count: ${targetBusiness.reviewCount}`);
    console.log(`Current rating: ${targetBusiness.rating}`);
    
    // Get actual reviews
    const reviews = await client.query(api.businesses.getBusinessReviews, {
      businessId: targetBusiness._id,
      limit: 1000
    });
    
    console.log(`\nActual reviews in database: ${reviews.length}`);
    
    if (reviews.length !== targetBusiness.reviewCount) {
      console.log("\n⚠️  Review count mismatch detected!");
      console.log(`Stored: ${targetBusiness.reviewCount}, Actual: ${reviews.length}`);
      
      // Sync the review count
      console.log("\n🔄 Syncing review count...");
      const result = await client.mutation(api.syncReviewCounts.syncBusinessReviewCount, {
        businessId: targetBusiness._id
      });
      
      console.log("\n✅ Sync complete!");
      console.log(`Review count: ${result.oldCount} → ${result.newCount}`);
      console.log(`Rating: ${result.oldRating} → ${result.newRating}`);
    } else {
      console.log("\n✅ Review count is already synchronized!");
    }
    
    // Show some review details
    if (reviews.length > 0) {
      console.log("\n📋 Recent reviews:");
      const recentReviews = reviews.slice(0, 3);
      for (const review of recentReviews) {
        console.log(`- ${review.userName} (${review.rating}★): "${review.comment.substring(0, 60)}..."`);
      }
      
      if (reviews.length > 3) {
        console.log(`... and ${reviews.length - 3} more reviews`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the sync
syncSpecificBusiness().then(() => {
  console.log("\n✨ Done!");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});