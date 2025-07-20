#!/usr/bin/env tsx

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import CSVProcessor from '../app/utils/csv-processor';
import DataValidator from '../app/utils/data-validator';
import FieldMappingDetector from '../config/field-mappings';
import CategoryDetector from '../config/category-detector';
import { SlugGenerator } from '../app/utils/slug-generator';
import ImportConfigManager from '../config/import-config';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function traceImport() {
  const csvFilePath = '/Users/john/Dev/Personal/azbusiness/data/imports/landscapersSedona.csv';
  
  console.log('🔍 Starting trace import...\n');
  
  // Initialize components
  const csvProcessor = new CSVProcessor();
  const categoryDetector = new CategoryDetector();
  const configManager = new ImportConfigManager();
  
  // Initialize Convex client
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('Convex URL not found');
  }
  const convex = new ConvexHttpClient(convexUrl);
  
  // Step 1: Read CSV file
  const rows = await csvProcessor.readCSV(csvFilePath);
  console.log(`📋 Read ${rows.length} rows from CSV\n`);
  
  // Step 2: Detect field mapping
  const headers = Object.keys(rows[0]);
  const csvType = FieldMappingDetector.detectBusinessCSVType(headers);
  const fieldMapping = FieldMappingDetector.getMappingByType(csvType);
  console.log(`🎯 CSV type: ${csvType}\n`);
  
  // Step 3: Get categories from database
  const categories = await convex.query(api.categories.getCategories);
  const categoryMap = new Map(categories.map(cat => [cat.slug, cat._id]));
  console.log(`📂 Loaded ${categories.length} categories\n`);
  
  // Step 4: Process first row
  const firstRow = rows[0];
  const cleanedRow = csvProcessor.cleanRow(firstRow);
  
  console.log('🔄 Processing first row...');
  console.log('Raw data sample:');
  console.log(`  Name: "${firstRow[fieldMapping.name]}"`);
  console.log(`  Address: "${firstRow[fieldMapping.address]}"`);
  console.log(`  City: "${firstRow[fieldMapping.city]}"\n`);
  
  // Step 5: Validate and process
  const { data, validation } = DataValidator.processCSVRow(cleanedRow, fieldMapping);
  
  if (!validation.valid || !data) {
    console.log('❌ Validation failed:', validation.errors);
    return;
  }
  
  console.log('✅ Validation passed');
  console.log('Processed data:');
  console.log(`  Name: "${data.name}"`);
  console.log(`  Address: "${data.address}"`);
  console.log(`  City: "${data.city}"\n`);
  
  // Step 6: Detect category
  const detectedCategory = categoryDetector.detectCategory(
    data.name,
    data.description,
    data.category
  );
  console.log(`🏷️ Detected category: ${detectedCategory}`);
  
  const categoryId = categoryMap.get(detectedCategory || '');
  if (!categoryId) {
    console.log('❌ Category not found in database');
    return;
  }
  console.log(`✅ Category ID: ${categoryId}\n`);
  
  // Step 7: Generate slug and URL
  const categoryName = categoryDetector.getCategoryName(detectedCategory || '') || detectedCategory || '';
  const businessSlug = SlugGenerator.generateFullBusinessSlug(data.name, data.city, categoryName);
  const urlPath = SlugGenerator.generateURLPath(data.name, data.city, categoryName);
  
  console.log(`🔗 Generated slug: ${businessSlug}`);
  console.log(`🔗 Generated URL: ${urlPath}\n`);
  
  // Step 8: Generate services and hours
  const services = configManager.getDefaultServices(detectedCategory || '');
  const hours = data.hours || configManager.getDefaultHours(detectedCategory || '');
  
  // Step 9: Create business object
  const business = {
    name: data.name,
    slug: businessSlug,
    urlPath: urlPath,
    shortDescription: data.shortDescription || SlugGenerator.generateShortDescription(data.name, categoryName, data.city),
    description: data.description || `Professional ${categoryName.toLowerCase()} services in ${data.city}, Arizona.`,
    phone: data.phone,
    email: data.email || undefined,
    website: data.website,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    categoryId: categoryId,
    services: services,
    coordinates: data.latitude && data.longitude ? {
      lat: data.latitude,
      lng: data.longitude
    } : undefined,
    hours: hours,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    socialLinks: data.socialLinks,
    // Additional GMB fields
    imageUrl: data.imageUrl,
    favicon: data.favicon,
    reviewUrl: data.reviewUrl,
    serviceOptions: data.serviceOptions,
    fromTheBusiness: data.fromTheBusiness,
    offerings: data.offerings,
    planning: data.planning
  };
  
  console.log('📦 Final business object:');
  console.log(JSON.stringify(business, null, 2));
  
  // Step 10: Test the batch import mutation
  console.log('\n🚀 Testing batch import...');
  
  try {
    const result = await convex.mutation(api.batchImport.batchImportBusinesses, {
      businesses: [business],
      skipDuplicates: true,
      importSource: "admin_import",
      sourceMetadata: {
        fileName: 'trace-test.csv',
        csvType: csvType,
        test: true
      }
    });
    
    console.log('\n✅ Import result:', result);
  } catch (error) {
    console.error('\n❌ Import error:', error);
  }
}

// Run the trace
traceImport().catch(console.error);