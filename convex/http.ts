import { httpRouter } from "convex/server";
import { paymentWebhook, testWebhookEndpoint } from "./subscriptions";
import { httpAction } from "./_generated/server";
// Removed OpenAI imports as we're no longer using OpenAI
// import { openai } from "@ai-sdk/openai";
// import { streamText } from "ai";
import { internal } from "./_generated/api";

// Chat endpoint disabled - OpenAI has been removed from the system
export const chat = httpAction(async (ctx, req) => {
  return new Response(JSON.stringify({ 
    error: "Chat endpoint disabled", 
    message: "OpenAI integration has been removed. Please use Gemini or the mock analyzer instead." 
  }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
});

// Original chat implementation commented out:
/*
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
*/

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

// GMB OAuth routes
http.route({
  path: "/api/auth/gmb/start",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const claimId = url.searchParams.get("claimId");
      const userId = url.searchParams.get("userId");
      
      if (!claimId || !userId) {
        return new Response(JSON.stringify({ error: "Missing claimId or userId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Generate secure state parameter
      const state = Buffer.from(`${claimId}:${userId}:${Date.now()}`).toString('base64url');
      
      // Build Google OAuth URL
      const oauthParams = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        redirect_uri: process.env.GMB_OAUTH_REDIRECT_URI || '',
        response_type: 'code',
        scope: process.env.GMB_OAUTH_SCOPES || 'https://www.googleapis.com/auth/business.manage',
        state: state,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${oauthParams.toString()}`;
      
      // Store state in claim record (TODO: implement updateClaimOAuthState)
      // For now, we'll store the state in the OAuth flow and update the claim in the callback
      
      // Redirect to Google OAuth
      return new Response(null, {
        status: 302,
        headers: {
          Location: oauthUrl,
          "Cache-Control": "no-cache"
        }
      });
      
    } catch (error) {
      console.error("GMB OAuth start error:", error);
      return new Response(JSON.stringify({ error: "Failed to start OAuth flow" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
});

http.route({
  path: "/api/auth/gmb/callback",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      
      // Handle OAuth denial/error
      if (error || !code || !state) {
        const errorReason = error === "access_denied" ? "User denied authorization" : "OAuth flow failed";
        
        // If we have state, try to update the claim
        if (state) {
          try {
            const decoded = Buffer.from(state, 'base64url').toString();
            const [claimId] = decoded.split(':');
            
            if (claimId) {
              // TODO: Implement updateGMBVerificationFailure
              console.log(`Would update claim ${claimId} with failure: ${errorReason}`);
            }
          } catch (stateError) {
            console.error("Failed to parse state on error:", stateError);
          }
        }
        
        // Redirect to claim page with error
        const redirectUrl = `${process.env.FRONTEND_URL}/claim-business?error=${encodeURIComponent(errorReason)}`;
        return new Response(null, {
          status: 302,
          headers: { Location: redirectUrl }
        });
      }
      
      // Validate state parameter
      let claimId: string;
      let userId: string;
      try {
        const decoded = Buffer.from(state, 'base64url').toString();
        const [cId, uId, timestamp] = decoded.split(':');
        
        if (!cId || !uId || !timestamp) {
          throw new Error("Invalid state format");
        }
        
        const ts = parseInt(timestamp);
        const now = Date.now();
        
        // State expires after 30 minutes
        if (now - ts > 30 * 60 * 1000) {
          throw new Error("State expired");
        }
        
        claimId = cId;
        userId = uId;
      } catch (stateError) {
        console.error("State validation failed:", stateError);
        const redirectUrl = `${process.env.FRONTEND_URL}/claim-business?error=invalid_state`;
        return new Response(null, {
          status: 302,
          headers: { Location: redirectUrl }
        });
      }
      
      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code: code,
          grant_type: "authorization_code",
          redirect_uri: process.env.GMB_OAUTH_REDIRECT_URI || ''
        })
      });
      
      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error("Token exchange failed:", tokenError);
        
        // TODO: Implement updateGMBVerificationFailure
        console.log(`Would update claim ${claimId} with token exchange failure`);
        
        const redirectUrl = `${process.env.FRONTEND_URL}/claim-business?error=token_exchange_failed`;
        return new Response(null, {
          status: 302,
          headers: { Location: redirectUrl }
        });
      }
      
      const tokens = await tokenResponse.json();
      
      // Get user info and GMB data
      const [userInfoResponse, gmbAccountsResponse] = await Promise.all([
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        }),
        fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        })
      ]);
      
      if (!userInfoResponse.ok || !gmbAccountsResponse.ok) {
        // TODO: Implement updateGMBVerificationFailure
        console.log(`Would update claim ${claimId} with GMB API failure`);
        
        const redirectUrl = `${process.env.FRONTEND_URL}/claim-business?error=gmb_api_failed`;
        return new Response(null, {
          status: 302,
          headers: { Location: redirectUrl }
        });
      }
      
      const userInfo = await userInfoResponse.json();
      const gmbAccounts = await gmbAccountsResponse.json();
      
      // Get all GMB locations
      const allLocations: any[] = [];
      
      if (gmbAccounts.accounts && gmbAccounts.accounts.length > 0) {
        for (const account of gmbAccounts.accounts) {
          try {
            const accountId = account.name.split('/').pop();
            const locationsResponse = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
              { headers: { Authorization: `Bearer ${tokens.access_token}` } }
            );
            
            if (locationsResponse.ok) {
              const locationsData = await locationsResponse.json();
              if (locationsData.locations) {
                allLocations.push(...locationsData.locations);
              }
            }
          } catch (locationError) {
            console.error("Failed to fetch locations for account:", account.name, locationError);
          }
        }
      }
      
      // Process verification with business matching
      // TODO: Implement processGMBVerification - for now simulate success
      const verificationResult = {
        verified: allLocations.length > 0,
        confidence: allLocations.length > 0 ? 90 : 0,
        requiresManualReview: false,
        status: allLocations.length > 0 ? "approved" : "pending"
      };
      
      console.log(`GMB OAuth completed for claim ${claimId}:`, {
        userEmail: userInfo.email,
        locationsFound: allLocations.length,
        result: verificationResult
      });
      
      // Redirect based on verification result
      let redirectUrl: string;
      if (verificationResult.verified) {
        redirectUrl = `${process.env.FRONTEND_URL}/claim-business?success=verified&confidence=${verificationResult.confidence}`;
      } else if (verificationResult.requiresManualReview) {
        redirectUrl = `${process.env.FRONTEND_URL}/claim-business?success=review_required&confidence=${verificationResult.confidence}`;
      } else {
        redirectUrl = `${process.env.FRONTEND_URL}/claim-business?error=no_match&confidence=${verificationResult.confidence}`;
      }
      
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl }
      });
      
    } catch (error) {
      console.error("GMB OAuth callback error:", error);
      const redirectUrl = `${process.env.FRONTEND_URL}/claim-business?error=callback_failed`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl }
      });
    }
  })
});

// Test route to verify HTTP is working
http.route({
  path: "/test",
  method: "GET",
  handler: httpAction(async () => {
    return new Response("HTTP routes working!", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  })
});

// Log that routes are configured
console.log("HTTP routes configured");

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
