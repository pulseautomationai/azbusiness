import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new lead
export const createLead = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    service: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });

    // TODO: Send email notification to business owner
    // TODO: Send confirmation email to lead

    return leadId;
  },
});

// Get leads for a business
export const getBusinessLeads = query({
  args: {
    businessId: v.id("businesses"),
    status: v.optional(v.union(v.literal("new"), v.literal("contacted"), v.literal("converted"))),
  },
  handler: async (ctx, args) => {
    let leadsQuery = ctx.db
      .query("leads")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId));

    if (args.status) {
      leadsQuery = leadsQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const leads = await leadsQuery
      .order("desc")
      .collect();

    return leads;
  },
});

// Update lead status
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("converted")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, {
      status: args.status,
    });
  },
});