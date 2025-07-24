/**
 * Test the simple test action
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CONVEX_URL = process.env.CONVEX_URL || "https://YOUR_CONVEX_URL";

async function testTestAction() {
  console.log("🔌 Testing Simple Test Action");
  console.log("============================\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("Calling testSimple action...");
    
    const result = await client.action(api.testAction.testSimple, {
      message: "Hello from test!"
    });
    
    console.log("✅ Test action successful!");
    console.log("Result:", result);
    
  } catch (error: any) {
    console.log("❌ Test action failed:");
    console.log("Error:", error.message);
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testTestAction().catch(console.error);
}

export { testTestAction };