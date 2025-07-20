import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * OWNER ACCESS FUNCTIONS
 * These functions bypass all authentication for John Schulenburg (owner)
 * Use these when the regular admin functions are blocked
 */

// Delete multiple businesses without any auth checks
export const ownerDeleteBusinesses = mutation({
  args: {
    businessIds: v.array(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    console.log("OWNER DELETE: Deleting businesses:", args.businessIds);
    
    const results = [];
    
    for (const businessId of args.businessIds) {
      try {
        // Get business info before deletion for logging
        const business = await ctx.db.get(businessId);
        if (!business) {
          results.push({ 
            businessId, 
            success: false, 
            error: "Business not found" 
          });
          continue;
        }
        
        // Delete the business
        await ctx.db.delete(businessId);
        
        // Trigger sitemap cache invalidation
        await ctx.db.insert("sitemapCache", {
          lastInvalidated: Date.now(),
          reason: `Owner bulk deleted: ${business.name}`,
          status: "pending",
        });
        
        results.push({ businessId, success: true, businessName: business.name });
      } catch (error) {
        console.error(`Owner delete error for business ${businessId}:`, error);
        results.push({ 
          businessId, 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    return {
      success: true,
      results,
      successCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
    };
  },
});

// Get all users without auth checks
export const ownerGetAllUsers = query({
  args: {},
  handler: async (ctx) => {
    console.log("OWNER ACCESS: Getting all users");
    return await ctx.db.query("users").collect();
  },
});

// Make any user admin by email without auth checks
export const ownerMakeUserAdmin = mutation({
  args: { 
    email: v.string(),
    role: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    console.log("OWNER ACCESS: Making user admin:", args.email);
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    await ctx.db.patch(user._id, {
      role: args.role || "super_admin",
      adminPermissions: ["moderation", "analytics", "user_management", "system_admin"],
      isActive: true,
    });

    return {
      success: true,
      message: `${args.email} is now a ${args.role || "super_admin"}`,
      userId: user._id,
    };
  },
});

// Clean up duplicate users
export const ownerCleanupUsers = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("OWNER ACCESS: Cleaning up duplicate users");
    
    const allUsers = await ctx.db.query("users").collect();
    const seenEmails = new Set();
    const seenTokens = new Set();
    const duplicates = [];

    for (const user of allUsers) {
      if (user.email && seenEmails.has(user.email)) {
        duplicates.push({ type: "email", user });
      } else if (user.email) {
        seenEmails.add(user.email);
      }

      if (user.tokenIdentifier && seenTokens.has(user.tokenIdentifier)) {
        duplicates.push({ type: "token", user });
      } else if (user.tokenIdentifier) {
        seenTokens.add(user.tokenIdentifier);
      }
    }

    console.log(`Found ${duplicates.length} duplicate users`);
    return {
      totalUsers: allUsers.length,
      duplicates: duplicates.length,
      duplicateUsers: duplicates
    };
  },
});