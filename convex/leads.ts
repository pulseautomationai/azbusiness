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
    // Get business to check plan tier
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Check if business has Pro or Power plan to receive leads
    if (business.planTier === "free") {
      throw new Error("Business must upgrade to Pro or Power to receive leads");
    }

    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });

    // TODO: Send email notification to business owner for Pro+ plans
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

// Get lead analytics for a business
export const getLeadAnalytics = query({
  args: {
    businessId: v.id("businesses"),
    timeRange: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("quarter"), v.literal("year"))),
  },
  handler: async (ctx, args) => {
    const timeRange = args.timeRange || "month";
    
    // Calculate time range
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      quarter: 90 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };
    const startTime = now - ranges[timeRange];

    // Get all leads for the business in the time range
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();

    // Calculate metrics
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === "new").length;
    const contactedLeads = leads.filter(l => l.status === "contacted").length;
    const convertedLeads = leads.filter(l => l.status === "converted").length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Group by service
    const serviceBreakdown = leads.reduce((acc, lead) => {
      const service = lead.service || "General Inquiry";
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily breakdown for charts
    const dailyBreakdown = leads.reduce((acc, lead) => {
      const date = new Date(lead.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      conversionRate,
      serviceBreakdown,
      dailyBreakdown,
      timeRange: {
        start: startTime,
        end: now,
      },
    };
  },
});

// Get recent leads for dashboard
export const getRecentLeads = query({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    return await ctx.db
      .query("leads")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(limit);
  },
});