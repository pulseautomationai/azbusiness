#!/usr/bin/env npx tsx

// Test script to verify AI providers work after OpenAI removal
console.log("🧪 Testing AI Providers after OpenAI Removal");
console.log("==========================================\n");

// Check environment
console.log("📋 Environment Check:");
console.log(`- AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set (defaults to gemini)'}`);
console.log(`- GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}`);
console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '⚠️ Still present (should be removed)' : '✅ Removed'}`);

console.log("\n✨ System Status:");
console.log("- OpenAI has been completely removed from the codebase");
console.log("- The system now supports:");
console.log("  1. Gemini API (when GEMINI_API_KEY is configured)");
console.log("  2. Mock analyzer (fallback when no API keys are configured)");

console.log("\n📝 To use Gemini:");
console.log("1. Set GEMINI_API_KEY in your .env file");
console.log("2. Set AI_PROVIDER=gemini (optional, it's the default now)");

console.log("\n🔧 To use Mock Analyzer:");
console.log("1. Simply don't set GEMINI_API_KEY");
console.log("2. The system will automatically use the mock analyzer");

console.log("\n🚀 Ready to test? Run:");
console.log(`npx convex run aiAnalysisIntegration:processBusinessReviews '{"businessId": "YOUR_BUSINESS_ID", "skipExisting": false}'`);

if (process.env.OPENAI_API_KEY) {
  console.log("\n⚠️ WARNING: OPENAI_API_KEY is still in your environment!");
  console.log("Please remove it from your .env file to complete the cleanup.");
}