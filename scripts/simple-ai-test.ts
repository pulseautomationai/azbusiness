#!/usr/bin/env npx tsx

// Simple test to compare AI providers
console.log("🧪 Simple AI Provider Test");
console.log("========================\n");

// Test configuration
const BUSINESS_ID = "jn77gkwyvzqketaxttb2nfd99s7m3vcm";
const BUSINESS_NAME = "Greenleaf Pest Control";

console.log(`📍 Testing with business: ${BUSINESS_NAME}`);
console.log(`🆔 Business ID: ${BUSINESS_ID}`);

// Check environment
console.log("\n📋 Environment Status:");
console.log(`- AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set (defaults to openai)'}`);
console.log(`- GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}`);  
console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);

console.log("\n📝 Test Instructions:");
console.log("1. First, let's run with Gemini:");
console.log("   export AI_PROVIDER=gemini");
console.log(`   npx convex run aiAnalysisIntegration:processBusinessReviews '{"businessId": "${BUSINESS_ID}", "batchSize": 5, "skipExisting": false}'`);

console.log("\n2. Then run with internal analyzer:");
console.log("   export AI_PROVIDER=openai");
console.log(`   npx convex run aiAnalysisIntegration:processBusinessReviews '{"businessId": "${BUSINESS_ID}", "batchSize": 5, "skipExisting": false}'`);

console.log("\n3. Check the results:");
console.log(`   npx convex run businesses:getBusinessById '{"businessId": "${BUSINESS_ID}"}' | jq '.overallScore'`);

console.log("\n💡 Note: The internal analyzer will be used if API keys are not configured.");