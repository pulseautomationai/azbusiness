import { httpRouter } from "convex/server";
import { paymentWebhook, testWebhookEndpoint } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { internal } from "./_generated/api";

export const chat = httpAction(async (ctx, req) => {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extract the `messages` and user info from the body of the request
    const { messages, userId } = await req.json();
    
    // Use IP address as fallback if userId not provided
    const identifier = userId || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

    // Check rate limit
    const rateLimitStatus = await ctx.runQuery(internal.rateLimit.checkRateLimit, {
      userId: identifier,
      endpoint: "chat"
    });

    if (rateLimitStatus.isRateLimited) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        message: `Too many requests. You can make ${rateLimitStatus.maxRequests} requests per ${rateLimitStatus.windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { 
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": rateLimitStatus.maxRequests.toString(),
          "X-RateLimit-Remaining": (rateLimitStatus.maxRequests - rateLimitStatus.requestCount).toString(),
          "X-RateLimit-Reset": rateLimitStatus.resetTime.toString()
        }
      });
    }

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      async onFinish({ text }) {
        // Record successful request for rate limiting
        await ctx.runMutation(internal.rateLimit.recordRequest, {
          userId: identifier,
          endpoint: "chat",
          ipAddress: ipAddress || undefined
        });
        
        // implement your own logic here, e.g. for storing messages
        // or recording token usage
        console.log(text);
      },
    });

    // Respond with the stream including rate limit headers
    return result.toDataStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        Vary: "origin",
        "X-RateLimit-Limit": rateLimitStatus.maxRequests.toString(),
        "X-RateLimit-Remaining": (rateLimitStatus.maxRequests - rateLimitStatus.requestCount - 1).toString(),
        "X-RateLimit-Reset": rateLimitStatus.resetTime.toString()
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

const http = httpRouter();

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/api/auth/webhook",
  method: "POST",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

http.route({
  path: "/payments/webhook/test",
  method: "GET",
  handler: testWebhookEndpoint,
});

// Log that routes are configured
console.log("HTTP routes configured");

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
