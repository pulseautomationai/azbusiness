import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Development helper function to make current user an admin
export const makeCurrentUserAdmin = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated");
    }

    console.log("Identity subject:", identity.subject);
    console.log("Identity email:", identity.email);

    // Find user by token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    console.log("Found user:", user);

    if (!user) {
      throw new Error("User not found - run upsertUser first");
    }

    // Update user to admin role
    await ctx.db.patch(user._id, {
      role: "admin",
      adminPermissions: ["moderation", "analytics", "user_management"],
      isActive: true,
    });

    console.log("User updated to admin");

    return {
      success: true,
      message: `User ${user.email || user.name} is now an admin`,
      userId: user._id,
      role: "admin"
    };
  },
});

// Helper to make any user admin by email
export const makeUserAdminByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Update user to admin role
    await ctx.db.patch(user._id, {
      role: "admin",
      adminPermissions: ["moderation", "analytics", "user_management"],
      isActive: true,
    });

    return {
      success: true,
      message: `User ${user.email || user.name} is now an admin`,
      userId: user._id,
      role: "admin"
    };
  },
});

// List all users (for debugging)
export const listAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenIdentifier: user.tokenIdentifier,
      isActive: user.isActive
    }));
  },
});