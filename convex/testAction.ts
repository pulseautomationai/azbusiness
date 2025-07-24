import { v } from "convex/values";
import { action } from "./_generated/server";

// Simple test action
export const testSimple = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Test action called with:", args.message);
    return {
      success: true,
      echo: args.message,
      timestamp: Date.now(),
    };
  },
});