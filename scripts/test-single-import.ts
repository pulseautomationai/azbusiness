#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function testSingleImport() {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('Convex URL not found');
  }
  const convex = new ConvexHttpClient(convexUrl);

  // Get a landscaping category ID
  const categories = await convex.query(api.categories.getCategories);
  const landscapingCategory = categories.find(c => c.slug === 'landscaping');
  
  if (!landscapingCategory) {
    throw new Error('Landscaping category not found');
  }

  console.log('📦 Testing single business import...\n');

  // Create a test business object
  const testBusiness = {
    name: "Test Landscaping Company",
    slug: "landscaping-test-city-test-landscaping-company",
    urlPath: "/landscaping/test-city/test-landscaping-company",
    shortDescription: "Test short description",
    description: "Test full description",
    phone: "(555) 123-4567",
    email: "test@example.com",
    website: "https://test.com",
    address: "123 Test Street",
    city: "Phoenix",
    state: "AZ",
    zip: "85001",
    categoryId: landscapingCategory._id,
    services: ["Service 1", "Service 2"],
    coordinates: { lat: 33.4484, lng: -112.0740 },
    hours: {
      monday: "9 AM - 5 PM",
      tuesday: "9 AM - 5 PM",
      wednesday: "9 AM - 5 PM",
      thursday: "9 AM - 5 PM",
      friday: "9 AM - 5 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    rating: 4.5,
    reviewCount: 10,
    socialLinks: {},
  };

  console.log('📋 Business data to import:');
  console.log(JSON.stringify(testBusiness, null, 2));
  console.log('\n🚀 Importing...\n');

  try {
    const result = await convex.mutation(api.batchImport.batchImportBusinesses, {
      businesses: [testBusiness],
      skipDuplicates: false,
      importSource: "admin_import",
      importBatchId: undefined,
      sourceMetadata: {
        test: true,
        fileName: "test-import.csv"
      }
    });

    console.log('✅ Import result:', result);
  } catch (error) {
    console.error('❌ Import error:', error);
  }
}

testSingleImport().catch(console.error);