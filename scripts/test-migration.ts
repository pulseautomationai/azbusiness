#!/usr/bin/env node

/**
 * Test script to verify migration functionality
 * Uses demo business data to test the migration logic
 */

import { SlugGenerator } from "../app/utils/slug-generator";

// Demo business data from the demo route
const demoBusinesses = [
  {
    _id: "sample-business-id",
    name: "Desert Oasis HVAC",
    city: "Phoenix",
    category: { name: "HVAC Services", slug: "hvac-services" },
    slug: "desert-oasis-hvac-phoenix", // Old format
    urlPath: undefined // Missing urlPath
  },
  {
    _id: "related-1",
    name: "Phoenix Plumbing Pros",
    city: "Phoenix", 
    category: { name: "Plumbing Services", slug: "plumbing-services" },
    slug: "phoenix-plumbing-pros-phoenix", // Old format
    urlPath: undefined
  },
  {
    _id: "related-2",
    name: "Sunny Solar Solutions",
    city: "Phoenix",
    category: { name: "Solar Services", slug: "solar-services" },
    slug: "sunny-solar-solutions-phoenix", // Old format
    urlPath: undefined
  }
];

function testMigration() {
  console.log("🧪 Testing migration logic...\n");
  
  demoBusinesses.forEach((business, index) => {
    console.log(`📋 Test ${index + 1}: ${business.name}`);
    console.log(`   Current slug: ${business.slug}`);
    console.log(`   Current urlPath: ${business.urlPath || 'undefined'}`);
    
    // Generate new slug and URL path
    const newSlug = SlugGenerator.generateFullBusinessSlug(
      business.name,
      business.city,
      business.category.name
    );
    
    const newUrlPath = SlugGenerator.generateURLPath(
      business.name,
      business.city,
      business.category.name
    );
    
    console.log(`   New slug: ${newSlug}`);
    console.log(`   New urlPath: ${newUrlPath}`);
    
    // Verify the URL path can be parsed back
    const pathParts = newUrlPath.split('/').filter(Boolean);
    if (pathParts.length === 3) {
      console.log(`   ✅ URL structure valid: /${pathParts[0]}/${pathParts[1]}/${pathParts[2]}`);
    } else {
      console.log(`   ❌ URL structure invalid: ${pathParts.length} parts`);
    }
    
    console.log('');
  });
  
  console.log("✅ Migration test completed!");
}

// Run the test
testMigration();