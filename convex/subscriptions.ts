import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { api } from "./_generated/api";
import { action, httpAction, mutation, query } from "./_generated/server";

const createCheckout = async ({
  customerEmail,
  productId,
  successUrl,
  metadata,
}: {
  customerEmail: string;
  productId: string;
  successUrl: string;
  metadata?: Record<string, string>;
}) => {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }

  const polar = new Polar({
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });

  const checkoutData = {
    products: [productId],
    successUrl: successUrl,
    customerEmail: customerEmail,
    metadata: {
      ...metadata,
      productId: productId,
    },
  };

  console.log(
    "Creating checkout with data:",
    JSON.stringify(checkoutData, null, 2)
  );

  const result = await polar.checkouts.create(checkoutData);
  console.log("Checkout created, URL:", result.url);
  console.log("Checkout ID:", result.id);
  return result;
};

export const getAvailablePlansQuery = query({
  handler: async (ctx) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const cleanedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isRecurring: item.isRecurring,
      prices: item.prices.map((price: any) => ({
        id: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        interval: price.recurringInterval,
      })),
    }));

    return {
      items: cleanedItems,
      pagination: result.pagination,
    };
  },
});

export const getAvailablePlans = action({
  handler: async (ctx) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const cleanedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isRecurring: item.isRecurring,
      prices: item.prices.map((price: any) => ({
        id: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        interval: price.recurringInterval,
      })),
    }));

    return {
      items: cleanedItems,
      pagination: result.pagination,
    };
  },
});

// Debug function to list all products and their prices
export const debugPolarProducts = action({
  handler: async (ctx) => {
    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result: productsResult } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    console.log("Available products and prices:");
    const debugInfo = productsResult.items.map(product => ({
      productId: product.id,
      productName: product.name,
      prices: product.prices.map((price: any) => ({
        priceId: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        interval: price.recurringInterval,
      }))
    }));

    console.log(JSON.stringify(debugInfo, null, 2));
    return debugInfo;
  },
});

export const createCheckoutSession = action({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // First check if user exists
    let user = await ctx.runQuery(api.users.findUserByToken, {
      tokenIdentifier: identity.subject,
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await ctx.runMutation(api.users.upsertUser);

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    // Debug: Log the product ID being used
    console.log(`Creating checkout for product ID: ${args.productId}`);
    
    // Debug: Log the environment variables
    console.log("Environment variables:", {
      FRONTEND_URL: process.env.FRONTEND_URL,
      POLAR_SERVER: process.env.POLAR_SERVER,
      POLAR_ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID ? "Set" : "Missing",
    });

    const successUrl = `${process.env.FRONTEND_URL}/success`;
    console.log("Success URL:", successUrl);

    const checkout = await createCheckout({
      customerEmail: user.email!,
      productId: args.productId,
      successUrl: successUrl,
      metadata: {
        userId: user.tokenIdentifier,
      },
    });

    return checkout.url;
  },
});

export const checkUserSubscriptionStatus = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tokenIdentifier: string;

    if (args.userId) {
      // Use provided userId directly as tokenIdentifier (they are the same)
      tokenIdentifier = args.userId;
    } else {
      // Fall back to auth context
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return { hasActiveSubscription: false };
      }
      tokenIdentifier = identity.subject;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    if (!user) {
      return { hasActiveSubscription: false };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasActiveSubscription = subscription?.status === "active";
    return { hasActiveSubscription };
  },
});

export const checkUserSubscriptionStatusByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk user ID (this assumes the tokenIdentifier contains the Clerk user ID)
    // In Clerk, the subject is typically in the format "user_xxxxx" where xxxxx is the Clerk user ID
    const tokenIdentifier = `user_${args.clerkUserId}`;

    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    // If not found with user_ prefix, try the raw userId
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.clerkUserId))
        .unique();
    }

    if (!user) {
      return { hasActiveSubscription: false };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasActiveSubscription = subscription?.status === "active";
    return { hasActiveSubscription };
  },
});

export const fetchUserSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    return subscription;
  },
});

export const handleWebhookEvent = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      // Extract event type from webhook payload
      const eventType = args.body.type;
      const eventData = args.body.data;

      if (!eventType) {
        throw new Error("Webhook event missing type field");
      }

      if (!eventData) {
        throw new Error("Webhook event missing data field");
      }

      // Store webhook event
      await ctx.db.insert("webhookEvents", {
        type: eventType,
        polarEventId: eventData.id,
        createdAt: eventData.created_at,
        modifiedAt: eventData.modified_at || eventData.created_at,
        data: eventData,
      });

      console.log(`Stored webhook event: ${eventType} with ID: ${eventData.id}`);

      switch (eventType) {
        case "subscription.created":
          console.log(`Processing subscription.created for user: ${eventData.metadata?.userId}`);
          console.log("Full webhook data:", JSON.stringify(eventData, null, 2));
          console.log("Metadata received:", JSON.stringify(eventData.metadata, null, 2));
          
          // Insert new subscription
          await ctx.db.insert("subscriptions", {
            polarId: eventData.id,
            polarPriceId: eventData.price_id,
            currency: eventData.currency,
            interval: eventData.recurring_interval,
            userId: eventData.metadata?.userId,
            status: eventData.status,
            currentPeriodStart: new Date(eventData.current_period_start).getTime(),
            currentPeriodEnd: new Date(eventData.current_period_end).getTime(),
            cancelAtPeriodEnd: eventData.cancel_at_period_end,
            amount: eventData.amount,
            startedAt: eventData.started_at ? new Date(eventData.started_at).getTime() : undefined,
            endedAt: eventData.ended_at ? new Date(eventData.ended_at).getTime() : undefined,
            canceledAt: eventData.canceled_at ? new Date(eventData.canceled_at).getTime() : undefined,
            customerCancellationReason: eventData.customer_cancellation_reason || undefined,
            customerCancellationComment: eventData.customer_cancellation_comment || undefined,
            metadata: eventData.metadata || {},
            customFieldData: eventData.custom_field_data || {},
            customerId: eventData.customer_id,
          });
          console.log(`Created subscription record for Polar ID: ${eventData.id}`);
          break;

      case "subscription.updated":
        // Find existing subscription
        const existingSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (existingSub) {
          await ctx.db.patch(existingSub._id, {
            amount: args.body.data.amount,
            status: args.body.data.status,
            currentPeriodStart: new Date(
              args.body.data.current_period_start
            ).getTime(),
            currentPeriodEnd: new Date(
              args.body.data.current_period_end
            ).getTime(),
            cancelAtPeriodEnd: args.body.data.cancel_at_period_end,
            metadata: args.body.data.metadata || {},
            customFieldData: args.body.data.custom_field_data || {},
          });
        }
        break;

      case "subscription.active":
        // Find and update subscription
        const activeSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (activeSub) {
          await ctx.db.patch(activeSub._id, {
            status: args.body.data.status,
            startedAt: new Date(args.body.data.started_at).getTime(),
          });
        }
        break;

      case "subscription.canceled":
        // Find and update subscription
        const canceledSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (canceledSub) {
          await ctx.db.patch(canceledSub._id, {
            status: args.body.data.status,
            canceledAt: args.body.data.canceled_at
              ? new Date(args.body.data.canceled_at).getTime()
              : undefined,
            customerCancellationReason:
              args.body.data.customer_cancellation_reason || undefined,
            customerCancellationComment:
              args.body.data.customer_cancellation_comment || undefined,
          });
        }
        break;

      case "subscription.uncanceled":
        // Find and update subscription
        const uncanceledSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (uncanceledSub) {
          await ctx.db.patch(uncanceledSub._id, {
            status: args.body.data.status,
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
            customerCancellationReason: undefined,
            customerCancellationComment: undefined,
          });
        }
        break;

      case "subscription.revoked":
        // Find and update subscription
        const revokedSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (revokedSub) {
          await ctx.db.patch(revokedSub._id, {
            status: "revoked",
            endedAt: args.body.data.ended_at
              ? new Date(args.body.data.ended_at).getTime()
              : undefined,
          });
        }
        break;

      case "order.created":
        // Orders are handled through the subscription events
        break;

        default:
          console.log(`Unhandled event type: ${eventType}`);
          break;
      }
      
      console.log(`Successfully processed webhook event: ${eventType}`);
    } catch (error) {
      console.error("Error processing webhook event:", error);
      throw error; // Re-throw to let the HTTP handler deal with it
    }
  },
});

// Use our own validation similar to validateEvent from @polar-sh/sdk/webhooks
// The only diffference is we use btoa to encode the secret since Convex js runtime doesn't support Buffer
const validateEvent = (
  body: string | Buffer,
  headers: Record<string, string>,
  secret: string
) => {
  const base64Secret = btoa(secret);
  const webhook = new Webhook(base64Secret);
  webhook.verify(body, headers);
};

export const paymentWebhook = httpAction(async (ctx, request) => {
  try {
    const rawBody = await request.text();

    // Internally validateEvent uses headers as a dictionary e.g. headers["webhook-id"]
    // So we need to convert the headers to a dictionary
    // (request.headers is a Headers object which is accessed as request.headers.get("webhook-id"))
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Validate the webhook event
    if (!process.env.POLAR_WEBHOOK_SECRET) {
      console.error("POLAR_WEBHOOK_SECRET environment variable is not configured");
      throw new Error(
        "POLAR_WEBHOOK_SECRET environment variable is not configured"
      );
    }
    
    validateEvent(rawBody, headers, process.env.POLAR_WEBHOOK_SECRET);

    const body = JSON.parse(rawBody);
    
    // Log the webhook event for debugging
    console.log(`Processing webhook event: ${body.type}`, {
      eventId: body.data?.id,
      type: body.type,
      timestamp: new Date().toISOString()
    });

    // track events and based on events store data
    await ctx.runMutation(api.subscriptions.handleWebhookEvent, {
      body,
    });

    console.log(`Successfully processed webhook event: ${body.type}`);

    return new Response(JSON.stringify({ 
      message: "Webhook received!", 
      eventType: body.type,
      eventId: body.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    
    if (error instanceof WebhookVerificationError) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ 
          message: "Webhook verification failed",
          error: "Invalid signature" 
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Log specific error details for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing failed:", errorMessage);

    return new Response(JSON.stringify({ 
      message: "Webhook processing failed",
      error: errorMessage 
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
});

export const createCustomerPortalUrl = action({
  handler: async (ctx, args: { customerId: string }) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    try {
      const result = await polar.customerSessions.create({
        customerId: args.customerId,
      });

      // Only return the URL to avoid Convex type issues
      return { url: result.customerPortalUrl };
    } catch (error) {
      console.error("Error creating customer session:", error);
      throw new Error("Failed to create customer session");
    }
  },
});

// Test endpoint to verify webhook configuration
export const testWebhookEndpoint = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    environment: {
      hasWebhookSecret: !!process.env.POLAR_WEBHOOK_SECRET,
      hasAccessToken: !!process.env.POLAR_ACCESS_TOKEN,
      hasOrganizationId: !!process.env.POLAR_ORGANIZATION_ID,
    }
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
