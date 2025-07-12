import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Original tables
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    role: v.optional(v.string()),
    adminPermissions: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"])
    .index("by_role", ["role"])
    .index("by_email", ["email"]),
  
  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
    
  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),
    
  // New tables for AZ Business Services - simplified
  businesses: defineTable({
    // Basic info
    name: v.string(),
    slug: v.string(),
    urlPath: v.optional(v.string()),
    logo: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    description: v.string(),
    shortDescription: v.string(),
    
    // Contact & Location
    phone: v.string(),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    
    // Business details
    categoryId: v.id("categories"),
    services: v.array(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    socialLinks: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
    hours: v.optional(v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
    
    // Subscription & Features
    planTier: v.string(),
    featured: v.boolean(),
    priority: v.number(),
    
    // Ownership & Status
    ownerId: v.optional(v.string()),
    claimedByUserId: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
    claimed: v.boolean(),
    verified: v.boolean(),
    active: v.boolean(),
    
    // Additional Google My Business Data
    imageUrl: v.optional(v.string()),
    favicon: v.optional(v.string()),
    reviewUrl: v.optional(v.string()),
    serviceOptions: v.optional(v.string()),
    fromTheBusiness: v.optional(v.string()),
    offerings: v.optional(v.string()),
    planning: v.optional(v.string()),
    
    // Ratings
    rating: v.number(),
    reviewCount: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_url_path", ["urlPath"])
    .index("by_category", ["categoryId"])
    .index("by_city", ["city"])
    .index("by_owner", ["ownerId"])
    .index("by_plan", ["planTier"])
    .searchIndex("search_businesses", {
      searchField: "name",
      filterFields: ["city", "categoryId", "active"],
    }),
    
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"]),
    
  cities: defineTable({
    name: v.string(),
    slug: v.string(),
    region: v.string(),
    description: v.optional(v.string()),
    population: v.optional(v.number()),
    order: v.number(),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_region", ["region"])
    .index("by_active", ["active"]),
    
  reviews: defineTable({
    businessId: v.id("businesses"),
    userId: v.optional(v.string()),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    verified: v.boolean(),
    helpful: v.number(),
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),
    
  leads: defineTable({
    businessId: v.id("businesses"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    service: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),
    
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    authorId: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
    categoryTags: v.array(v.string()),
    cityTags: v.array(v.string()),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_business", ["businessId"])
    .index("by_published", ["published", "publishedAt"])
    .searchIndex("search_posts", {
      searchField: "title",
      filterFields: ["published"],
    }),
    
  rateLimits: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
  })
    .index("by_user_endpoint", ["userId", "endpoint"])
    .index("by_timestamp", ["timestamp"]),
    
  sitemapCache: defineTable({
    lastInvalidated: v.number(),
    reason: v.string(),
    status: v.string(),
  })
    .index("by_timestamp", ["lastInvalidated"])
    .index("by_status", ["status"]),
    
  // Business content for AI-generated and editable fields
  businessContent: defineTable({
    businessId: v.id("businesses"),
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
      type: v.string(),
    }))),
    additionalSocialLinks: v.optional(v.object({
      tiktok: v.optional(v.string()),
      pinterest: v.optional(v.string()),
      yelp: v.optional(v.string()),
    })),
    seoAudit: v.optional(v.object({
      lastRun: v.number(),
      metaScore: v.number(),
      performanceScore: v.number(),
      mobileScore: v.number(),
      suggestions: v.array(v.string()),
    })),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"]),
    
  // Analytics events for tracking
  analyticsEvents: defineTable({
    businessId: v.optional(v.id("businesses")),
    eventType: v.string(),
    sourceUrl: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_type", ["eventType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_business_type", ["businessId", "eventType"]),
    
  // Basic moderation queue for business validation
  businessModerationQueue: defineTable({
    businessId: v.id("businesses"),
    status: v.string(),
    submittedBy: v.optional(v.string()),
    assignedToAdmin: v.optional(v.string()),
    priority: v.string(),
    flags: v.array(v.string()),
    adminNotes: v.optional(v.string()),
    reviewStartedAt: v.optional(v.number()),
    reviewCompletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_status", ["status"]),
});