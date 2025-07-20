import { api } from "./convex/_generated/api.js";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Convex client
const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function checkRecentBusinesses() {
  try {
    console.log("Checking recently created businesses...\n");
    
    // Get businesses created in the last 7 days (expanded search)
    const recentBusinesses = await client.query(api.businesses.getRecentlyCreatedBusinesses, {
      limit: 20,
      hoursAgo: 168 // 7 days
    });
    
    console.log(`Searching in the last 7 days...`);
    
    // Also get all businesses to check general status
    const allBusinesses = await client.query(api.businesses.getBusinesses, {
      limit: 50
    });
    
    console.log(`Found ${recentBusinesses.length} businesses created in the last 7 days:\n`);
    console.log(`Total businesses in database: ${allBusinesses.length}\n`);
    
    if (recentBusinesses.length > 0) {
      recentBusinesses.forEach((business, index) => {
        const createdDate = new Date(business.createdAt).toLocaleString();
        console.log(`${index + 1}. ${business.name}`);
        console.log(`   Slug: ${business.slug}`);
        console.log(`   URL Path: ${business.urlPath || 'NOT SET'}`);
        console.log(`   City: ${business.city}`);
        console.log(`   Category: ${business.category?.name || 'Unknown'}`);
        console.log(`   Created: ${createdDate}`);
        console.log(`   Expected URL: /${business.category?.slug || 'unknown'}/${business.city.toLowerCase().replace(/\s+/g, '-')}/${business.slug}`);
        console.log(`   Active: ${business.active}`);
        console.log("");
      });
    } else {
      console.log("No recent businesses found. Let's check the most recent businesses from all time:\n");
      
      // Sort all businesses by creation date
      const sortedBusinesses = allBusinesses.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
      
      sortedBusinesses.forEach((business, index) => {
        const createdDate = new Date(business.createdAt).toLocaleString();
        console.log(`${index + 1}. ${business.name}`);
        console.log(`   Slug: ${business.slug}`);
        console.log(`   URL Path: ${business.urlPath || 'NOT SET'}`);
        console.log(`   City: ${business.city}`);
        console.log(`   Category: ${business.category?.name || 'Unknown'}`);
        console.log(`   Created: ${createdDate}`);
        console.log(`   Expected URL: /${business.category?.slug || 'unknown'}/${business.city.toLowerCase().replace(/\s+/g, '-')}/${business.slug}`);
        console.log(`   Active: ${business.active}`);
        console.log("");
      });
    }
    
    // Check for businesses with "Sheet2" in the name (CSV import indicator)
    const businessesToCheck = recentBusinesses.length > 0 ? recentBusinesses : allBusinesses;
    const sheet2Businesses = businessesToCheck.filter(b => 
      b.name.toLowerCase().includes('sheet2') || 
      b.name.toLowerCase().includes('row') ||
      b.description?.toLowerCase().includes('sheet2')
    );
    
    if (sheet2Businesses.length > 0) {
      console.log("⚠️  Found businesses with CSV-related names:");
      sheet2Businesses.forEach(business => {
        console.log(`   - ${business.name} (${business.slug})`);
      });
      console.log("");
    }
    
    // Show businesses by data source
    const dataSources = {};
    businessesToCheck.forEach(business => {
      const source = business.dataSource?.primary || 'unknown';
      if (!dataSources[source]) dataSources[source] = [];
      dataSources[source].push(business.name);
    });
    
    console.log("Businesses by data source:");
    Object.entries(dataSources).forEach(([source, businesses]) => {
      console.log(`   ${source}: ${businesses.length} businesses`);
      businesses.forEach(name => console.log(`     - ${name}`));
    });
    
  } catch (error) {
    console.error("Error checking recent businesses:", error);
  }
}

checkRecentBusinesses();