#!/usr/bin/env npx tsx

console.log("🧪 Gemini vs Mock Analyzer Test");
console.log("================================\n");

const BUSINESS_ID = "jn77gkwyvzqketaxttb2nfd99s7m3vcm";
const BUSINESS_NAME = "Greenleaf Pest Control";

console.log(`📍 Testing with business: ${BUSINESS_NAME}`);
console.log(`🆔 Business ID: ${BUSINESS_ID}`);

console.log("\n📋 Test Plan:");
console.log("1. First test with Gemini (GEMINI_API_KEY is set)");
console.log("2. Then temporarily rename GEMINI_API_KEY to force mock analyzer");
console.log("3. Compare the results");

console.log("\n⚠️  IMPORTANT: Since Convex runs server-side, we need to:");
console.log("1. Manually edit .env.local to rename GEMINI_API_KEY");
console.log("2. Restart the Convex dev server");
console.log("3. Run the analysis");

console.log("\n📝 Instructions for manual testing:");

console.log("\n=== TEST 1: GEMINI ===");
console.log("1. Ensure GEMINI_API_KEY is set in .env.local");
console.log("2. Run: npx convex dev (if not already running)");
console.log("3. In another terminal, run:");
console.log(`   npx convex run aiAnalysisIntegration:processBusinessReviews '{"businessId": "${BUSINESS_ID}", "batchSize": 5, "skipExisting": false}'`);
console.log("4. Note the results and check:");
console.log(`   npx convex run businesses:getBusinessById '{"businessId": "${BUSINESS_ID}"}' | grep overallScore`);

console.log("\n=== TEST 2: MOCK ANALYZER ===");
console.log("1. Edit .env.local and rename GEMINI_API_KEY to GEMINI_API_KEY_DISABLED");
console.log("2. Restart Convex dev server (Ctrl+C and npx convex dev)");
console.log("3. Run the same analysis command:");
console.log(`   npx convex run aiAnalysisIntegration:processBusinessReviews '{"businessId": "${BUSINESS_ID}", "batchSize": 5, "skipExisting": false}'`);
console.log("4. Note the results and check the score again");

console.log("\n=== TEST 3: RESTORE ===");
console.log("1. Edit .env.local and rename GEMINI_API_KEY_DISABLED back to GEMINI_API_KEY");
console.log("2. Restart Convex dev server");

console.log("\n💡 Expected Results:");
console.log("- Gemini: Should show 'Using Gemini for AI analysis' in logs");
console.log("- Mock: Should show 'Using enhanced mock analysis' in logs");
console.log("- Both should produce similar overall scores (within 10-20 points)");
console.log("- Gemini might take slightly longer but provide more nuanced analysis");

console.log("\n🔍 To check which analyzer was used:");
console.log(`npx convex run aiAnalysisIntegration:getAnalysisTagsForBusiness '{"businessId": "${BUSINESS_ID}"}' | grep modelVersion`);
console.log("- Gemini: modelVersion should be 'gemini-1.5-flash'");
console.log("- Mock: modelVersion should be 'mock-v1'");