import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    // Get the user's identity from the auth context
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Check if we've already stored this identity before
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (user !== null) {
      return user;
    }

    return null;
  },
});

export const upsertUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (existingUser) {
      // Update if needed
      if (
        existingUser.name !== identity.name ||
        existingUser.email !== identity.email
      ) {
        await ctx.db.patch(existingUser._id, {
          name: identity.name,
          email: identity.email,
        });
      }
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.subject,
    });

    return await ctx.db.get(userId);
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Get current user data
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    return user;
  },
});

// Admin Functions
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user for admin check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    let users = await ctx.db.query("users").collect();

    // Apply search filter if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by most recently created
    users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Apply limit
    const limit = args.limit || 50;
    return users.slice(0, limit);
  },
});

export const getUsersWithBusinesses = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user for admin check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    let users = await ctx.db.query("users").collect();

    // Apply search filter if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Get businesses for each user
    const usersWithBusinesses = await Promise.all(
      users.map(async (user) => {
        const claimedBusinesses = await ctx.db
          .query("businesses")
          .filter((q) => q.eq(q.field("claimedByUserId"), user._id))
          .collect();

        return {
          ...user,
          claimedBusinesses,
        };
      })
    );

    // Sort by most recently created
    usersWithBusinesses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Apply limit
    const limit = args.limit || 50;
    return usersWithBusinesses.slice(0, limit);
  },
});

export const updateUserBusinessPlanTier = mutation({
  args: {
    businessId: v.id("businesses"),
    planTier: v.union(v.literal("free"), v.literal("pro"), v.literal("power")),
  },
  handler: async (ctx, args) => {
    // Get current user for admin check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get the business to verify it exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Update the business plan tier
    await ctx.db.patch(args.businessId, {
      planTier: args.planTier,
      updatedAt: Date.now(),
    });

    return { success: true, businessName: business.name, newPlanTier: args.planTier };
  },
});

export const removeBusinessClaim = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    // Get current user for admin check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get the business to verify it exists
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Remove the claim and reset to free tier
    await ctx.db.patch(args.businessId, {
      claimed: false,
      claimedByUserId: undefined,
      claimedAt: undefined,
      verified: false,
      planTier: "free",
      updatedAt: Date.now(),
    });

    return { success: true, businessName: business.name };
  },
});
