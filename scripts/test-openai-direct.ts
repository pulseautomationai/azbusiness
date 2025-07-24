#!/usr/bin/env npx tsx
/**
 * Direct OpenAI API Test
 * Tests OpenAI API without Convex processing
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("🧪 Direct OpenAI API Test");
console.log("========================");

async function testOpenAIDirect() {
  const useOpenAI = OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";
  
  if (!useOpenAI) {
    console.log("❌ OpenAI API key not configured");
    return;
  }

  console.log("✅ OpenAI API key configured");
  console.log(`   Key preview: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);

  try {
    console.log("\n🤖 Testing OpenAI API call...");
    const startTime = Date.now();

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Test analysis. Return JSON: {"score": number, "keywords": ["test"], "confidence": 90}`
          },
          {
            role: "user",
            content: `5-star review: "Great service, fast response, excellent work!"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    console.log(`   Duration: ${duration}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const completion = await response.json();
      console.log(`   Usage: ${completion.usage?.total_tokens || 'unknown'} tokens`);
      console.log(`   Response: ${completion.choices[0].message.content}`);
      console.log("\n✅ OpenAI API working correctly!");
    } else {
      const error = await response.text();
      console.log(`   Error: ${error}`);
      console.log("\n❌ OpenAI API call failed");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("   ⚠️ Request timed out after 15 seconds");
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

testOpenAIDirect().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});