import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Get business content by business ID
export const getBusinessContent = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("businessContent")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    return content;
  },
});

// Update business content (for Pro/Power users)
export const updateBusinessContent = mutation({
  args: {
    businessId: v.id("businesses"),
    updates: v.object({
      customSummary: v.optional(v.string()),
      heroImageUrl: v.optional(v.string()),
      serviceCards: v.optional(v.array(v.object({
        name: v.string(),
        icon: v.optional(v.string()),
        description: v.optional(v.string()),
        pricing: v.optional(v.string()),
        featured: v.optional(v.boolean()),
      }))),
      customOffers: v.optional(v.array(v.object({
        title: v.string(),
        description: v.string(),
        validUntil: v.optional(v.number()),
        code: v.optional(v.string()),
        type: v.union(v.literal("percentage"), v.literal("fixed"), v.literal("other")),
      }))),
      additionalSocialLinks: v.optional(v.object({
        tiktok: v.optional(v.string()),
        pinterest: v.optional(v.string()),
        yelp: v.optional(v.string()),
        custom: v.optional(v.array(v.object({
          name: v.string(),
          url: v.string(),
        }))),
      })),
    }),
  },
  handler: async (ctx, args) => {
    // Get the business to check ownership and plan
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    
    // Check if user owns this business or is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // TODO: Add admin check
    if (business.ownerId !== identity.tokenIdentifier) {
      throw new Error("Not authorized to edit this business");
    }
    
    // Check plan tier for allowed features
    if (business.planTier === "free") {
      throw new Error("Upgrade to Pro or Power plan to edit business content");
    }
    
    // Get existing content or create new
    let content = await ctx.db
      .query("businessContent")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    if (!content) {
      // Create new content record
      const contentId = await ctx.db.insert("businessContent", {
        businessId: args.businessId,
        ...args.updates,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return contentId;
    } else {
      // Update existing content
      await ctx.db.patch(content._id, {
        ...args.updates,
        updatedAt: Date.now(),
      });
      return content._id;
    }
  },
});

// Update AI-generated content (internal use)
export const updateAIContent = mutation({
  args: {
    businessId: v.id("businesses"),
    aiUpdates: v.object({
      customSummary: v.optional(v.string()),
      serviceCards: v.optional(v.array(v.object({
        name: v.string(),
        icon: v.optional(v.string()),
        description: v.optional(v.string()),
        pricing: v.optional(v.string()),
        featured: v.optional(v.boolean()),
      }))),
      reviewAnalysis: v.optional(v.object({
        lastAnalyzed: v.number(),
        sentiment: v.object({
          positive: v.number(),
          neutral: v.number(),
          negative: v.number(),
        }),
        keywords: v.array(v.string()),
        trends: v.array(v.string()),
        highlights: v.array(v.string()),
        improvements: v.array(v.string()),
      })),
      seoAudit: v.optional(v.object({
        lastRun: v.number(),
        metaScore: v.number(),
        performanceScore: v.number(),
        mobileScore: v.number(),
        suggestions: v.array(v.string()),
        competitorAnalysis: v.optional(v.any()),
      })),
      journeyPreview: v.optional(v.object({
        serpPreview: v.optional(v.string()),
        gmbPreview: v.optional(v.string()),
      })),
      aiEnrichment: v.optional(v.object({
        summaryGeneratedAt: v.optional(v.number()),
        servicesEnrichedAt: v.optional(v.number()),
        reviewsAnalyzedAt: v.optional(v.number()),
        offersGeneratedAt: v.optional(v.number()),
        totalTokensUsed: v.optional(v.number()),
        enrichmentVersion: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    // This is an internal mutation for AI enrichment
    // No auth check needed as it will be called from scheduled functions
    
    let content = await ctx.db
      .query("businessContent")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    if (!content) {
      // Create new content record
      const contentId = await ctx.db.insert("businessContent", {
        businessId: args.businessId,
        ...args.aiUpdates,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return contentId;
    } else {
      // Update existing content
      await ctx.db.patch(content._id, {
        ...args.aiUpdates,
        updatedAt: Date.now(),
      });
      return content._id;
    }
  },
});

// Get businesses needing AI enrichment
export const getBusinessesForEnrichment = query({
  args: {
    limit: v.optional(v.number()),
    planTier: v.optional(v.union(v.literal("pro"), v.literal("power"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get businesses that are Pro or Power tier
    let businessQuery = ctx.db.query("businesses");
    
    if (args.planTier) {
      businessQuery = businessQuery.filter((q) => q.eq(q.field("planTier"), args.planTier));
    } else {
      businessQuery = businessQuery.filter((q) => 
        q.or(
          q.eq(q.field("planTier"), "pro"),
          q.eq(q.field("planTier"), "power")
        )
      );
    }
    
    const businesses = await businessQuery.take(limit);
    
    // Check which ones need enrichment
    const enrichmentCandidates = [];
    
    for (const business of businesses) {
      const content = await ctx.db
        .query("businessContent")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .first();
      
      // Check if content needs enrichment
      const needsEnrichment = !content || 
        !content.customSummary || 
        !content.serviceCards || 
        !content.reviewAnalysis ||
        (content.aiEnrichment?.summaryGeneratedAt && 
         Date.now() - content.aiEnrichment.summaryGeneratedAt > 30 * 24 * 60 * 60 * 1000); // 30 days
      
      if (needsEnrichment) {
        enrichmentCandidates.push({
          business,
          hasContent: !!content,
          missingFields: {
            summary: !content?.customSummary,
            services: !content?.serviceCards,
            reviews: !content?.reviewAnalysis,
          },
        });
      }
    }
    
    return enrichmentCandidates;
  },
});

// Get analytics for business content
export const getContentAnalytics = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("businessContent")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    if (!content) {
      return null;
    }
    
    return {
      hasCustomSummary: !!content.customSummary,
      hasHeroImage: !!content.heroImageUrl,
      serviceCount: content.serviceCards?.length || 0,
      offerCount: content.customOffers?.length || 0,
      lastUpdated: content.updatedAt,
      aiEnrichmentStatus: {
        summaryGenerated: !!content.aiEnrichment?.summaryGeneratedAt,
        servicesEnriched: !!content.aiEnrichment?.servicesEnrichedAt,
        reviewsAnalyzed: !!content.aiEnrichment?.reviewsAnalyzedAt,
        lastEnrichment: Math.max(
          content.aiEnrichment?.summaryGeneratedAt || 0,
          content.aiEnrichment?.servicesEnrichedAt || 0,
          content.aiEnrichment?.reviewsAnalyzedAt || 0
        ),
      },
    };
  },
});