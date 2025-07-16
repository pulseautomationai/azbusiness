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
    .index("by_name", ["name"])
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
    
  // Enhanced moderation queue for business validation and claiming
  businessModerationQueue: defineTable({
    businessId: v.id("businesses"),
    type: v.string(), // "claim_request", "content_review", etc.
    status: v.string(),
    priority: v.string(),
    submittedBy: v.id("users"),
    assignedToAdmin: v.optional(v.id("users")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    claimData: v.optional(v.object({
      verificationMethod: v.string(),
      userRole: v.string(),
      contactInfo: v.object({
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        preferredContact: v.string()
      }),
      businessHours: v.optional(v.object({
        timezone: v.string(),
        availableHours: v.string(),
        bestTimeToCall: v.string()
      })),
      verificationData: v.optional(v.any()),
      agreesToTerms: v.boolean(),
      fraudCheckData: v.optional(v.any())
    })),
    flags: v.array(v.string()),
    adminNotes: v.array(v.object({
      admin: v.string(),
      note: v.string(),
      timestamp: v.number(),
      action: v.string(),
      requestedInfo: v.optional(v.array(v.string()))
    })),
  })
    .index("by_business", ["businessId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_submitted_by", ["submittedBy"]),
  
  // Phone verification records
  phoneVerifications: defineTable({
    businessId: v.id("businesses"),
    userId: v.id("users"),
    phoneNumber: v.string(),
    verificationCode: v.string(),
    attempts: v.number(),
    verified: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.number(),
    verifiedAt: v.optional(v.number()),
    ipAddress: v.string(),
    userAgent: v.string(),
  })
    .index("by_phone", ["phoneNumber"])
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"]),
  
  // Email verification records
  emailVerifications: defineTable({
    businessId: v.id("businesses"),
    userId: v.id("users"),
    emailAddress: v.string(),
    verificationToken: v.string(),
    verified: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.number(),
    verifiedAt: v.optional(v.number()),
    ipAddress: v.string(),
    userAgent: v.string(),
  })
    .index("by_email", ["emailAddress"])
    .index("by_token", ["verificationToken"])
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"]),
  
  // Document verification records
  verificationDocuments: defineTable({
    businessId: v.id("businesses"),
    userId: v.id("users"),
    documentType: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileUrl: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "pending_review", "approved", "rejected"
    uploadedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewNotes: v.optional(v.string()),
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
    
  // Business claims with multiple verification methods
  businessClaims: defineTable({
    businessId: v.id("businesses"),
    userId: v.id("users"),
    
    // Basic claim information
    status: v.string(), // "pending", "approved", "rejected", "needs_info"
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    
    // Verification method selection
    verification_method: v.union(
      v.literal("documents"),    // Existing document upload
      v.literal("gmb_oauth"),    // New GMB OAuth
      v.literal("pending")       // During OAuth process
    ),
    
    // Contact and role information
    userRole: v.string(), // "owner", "manager", "employee", etc.
    contactInfo: v.object({
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      preferredContact: v.string()
    }),
    businessHours: v.optional(v.object({
      timezone: v.string(),
      availableHours: v.string(),
      bestTimeToCall: v.string()
    })),
    
    // Document verification data (existing method)
    uploaded_documents: v.optional(v.array(v.object({
      documentType: v.string(),
      fileName: v.string(),
      fileUrl: v.string(),
      uploadedAt: v.number()
    }))),
    
    // GMB OAuth verification data (new method)
    gmb_verification: v.optional(v.object({
      google_account_email: v.string(),
      verified_at: v.number(),
      gmb_location_id: v.string(),
      matched_business_name: v.string(),
      match_confidence: v.number(), // 0-100
      requires_manual_review: v.boolean(),
      verification_details: v.object({
        name_match: v.number(),      // 0-100 similarity score
        address_match: v.number(),   // 0-100 similarity score
        phone_match: v.boolean()     // exact match or not provided
      }),
      oauth_state: v.optional(v.string()), // For OAuth flow tracking
      access_token_hash: v.optional(v.string()), // Hashed token for security
      token_expires_at: v.optional(v.number()),
      all_gmb_locations: v.optional(v.array(v.any())), // Store all user's GMB locations for review
      failure_reason: v.optional(v.string()) // If verification failed
    })),
    
    // Admin review and notes
    admin_notes: v.optional(v.array(v.object({
      admin: v.string(),
      note: v.string(),
      timestamp: v.number(),
      action: v.string()
    }))),
    
    // Terms and fraud prevention
    agreesToTerms: v.boolean(),
    fraudCheckData: v.optional(v.object({
      ipAddress: v.string(),
      userAgent: v.string(),
      duplicateCheck: v.boolean(),
      riskScore: v.optional(v.number())
    }))
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_verification_method", ["verification_method"])
    .index("by_submitted_at", ["submittedAt"]),
});