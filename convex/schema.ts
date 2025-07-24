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
    
    // Tier-specific performance data
    performanceData: v.optional(v.object({
      ranking: v.optional(v.number()),
      responseTime: v.optional(v.string()),
      satisfaction: v.optional(v.number()),
      areaAverage: v.optional(v.number()),
      competitivePosition: v.optional(v.string()),
      marketPosition: v.optional(v.string()),
    })),
    
    // AI insights by tier level
    aiInsights: v.optional(v.object({
      basic: v.optional(v.array(v.string())),
      enhanced: v.optional(v.array(v.string())),
      professional: v.optional(v.array(v.string())),
      premium: v.optional(v.array(v.string())),
    })),

    // AI Ranking System Fields (NEW)
    // Review Import Limits by Tier
    maxReviewImport: v.optional(v.number()), // 15, 25, 40, 100 based on tier
    maxReviewDisplay: v.optional(v.number()), // 3, 8, 15, unlimited based on tier
    
    // Performance Scores (cached for fast access)
    speedScore: v.optional(v.number()),      // 0-10 score from AI analysis
    valueScore: v.optional(v.number()),      // 0-10 score from AI analysis
    qualityScore: v.optional(v.number()),    // 0-10 score from AI analysis
    reliabilityScore: v.optional(v.number()), // 0-10 score from AI analysis
    overallScore: v.optional(v.number()),    // Weighted composite score
    
    // Ranking Positions (cached for performance)
    cityRanking: v.optional(v.number()),     // Position within city
    categoryRanking: v.optional(v.number()), // Position within category
    lastRankingUpdate: v.optional(v.number()), // When rankings were last calculated
    
    // Tier-Based Features
    canRespondToReviews: v.optional(v.boolean()),
    hasAdvancedAnalytics: v.optional(v.boolean()),
    hasRealTimeUpdates: v.optional(v.boolean()),
    hasBasicAnalytics: v.optional(v.boolean()),
    hasEmailAlerts: v.optional(v.boolean()),
    hasCompetitorInsights: v.optional(v.boolean()),
    hasAdvancedAI: v.optional(v.boolean()),
    hasPrioritySupport: v.optional(v.boolean()),
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
    planTier: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("power")),
    featured: v.boolean(),
    priority: v.number(),
    
    // Ownership & Status
    ownerId: v.optional(v.string()),
    claimedByUserId: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
    verified: v.boolean(),
    active: v.boolean(),
    
    // Data Source Tracking
    dataSource: v.object({
      primary: v.union(
        v.literal("gmb_api"),      // Via GMB OAuth
        v.literal("admin_import"), // Admin scraped/imported
        v.literal("user_manual"),  // User manually added
        v.literal("system")        // System generated
      ),
      lastSyncedAt: v.optional(v.number()),
      syncStatus: v.optional(v.string()), // "synced", "pending", "failed"
      gmbLocationId: v.optional(v.string()), // If GMB connected
    }),
    
    // Track which fields have been manually edited
    editedFields: v.optional(v.array(v.string())), // ["description", "hours"]
    
    // Additional Google My Business Data
    imageUrl: v.optional(v.string()),
    favicon: v.optional(v.string()),
    reviewUrl: v.optional(v.string()),
    serviceOptions: v.optional(v.string()),
    fromTheBusiness: v.optional(v.string()),
    offerings: v.optional(v.string()),
    planning: v.optional(v.string()),
    
    // GMB Identifiers for Review Matching
    placeId: v.optional(v.string()),        // Google Place ID (primary key for review matching)
    gmbUrl: v.optional(v.string()),         // Google My Business profile URL  
    cid: v.optional(v.string()),            // Google Customer ID / Citation ID
    gmbClaimed: v.optional(v.boolean()),    // Whether business is claimed on GMB
    
    // Review Sync Configuration (Phase 2)
    lastReviewSync: v.optional(v.number()),     // Timestamp of last review sync
    geoScraperSyncEnabled: v.optional(v.boolean()), // Enable/disable auto sync (default true)
    syncStatus: v.optional(v.union(
      v.literal("idle"),
      v.literal("syncing"),
      v.literal("error")
    )),
    lastSyncError: v.optional(v.string()),      // Last sync error message
    
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
    .index("by_placeId", ["placeId"])     // For GMB review matching
    .index("by_cid", ["cid"])             // For secondary review matching
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
    
    // Review content
    reviewId: v.string(), // External ID (GMB, Yelp, etc)
    userId: v.optional(v.string()),
    userName: v.string(),
    authorPhotoUrl: v.optional(v.string()),
    rating: v.number(),
    comment: v.string(),
    verified: v.boolean(),
    helpful: v.number(),
    
    // Source tracking
    source: v.union(
      v.literal("gmb_api"),      // Live from GMB
      v.literal("gmb_import"),   // Scraped GMB
      v.literal("yelp_import"),  // Scraped Yelp
      v.literal("facebook_import"), // Scraped Facebook
      v.literal("direct"),       // Platform review
      v.literal("manual")        // Admin added
    ),
    sourceUrl: v.optional(v.string()),
    importBatchId: v.optional(v.string()),
    
    // Review metadata
    originalCreateTime: v.optional(v.string()), // ISO string from source
    originalUpdateTime: v.optional(v.string()),
    
    // Business reply (if any)
    reply: v.optional(v.object({
      text: v.string(),
      createdAt: v.number(),
      authorName: v.optional(v.string()),
    })),
    
    // AI Analysis Results (pre-computed for performance)
    sentiment: v.optional(v.object({
      score: v.number(),    // -1 to 1
      magnitude: v.number(), // 0 to 1
      classification: v.optional(v.union(
        v.literal("positive"),
        v.literal("neutral"), 
        v.literal("negative")
      )),
    })),
    
    // Performance Mention Analysis
    speedMentions: v.optional(v.object({
      hasSpeedMention: v.boolean(),
      responseTime: v.optional(v.string()), // "12 minutes", "same day"
      urgencyLevel: v.optional(v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )),
    })),
    
    valueMentions: v.optional(v.object({
      hasValueMention: v.boolean(),
      pricePerception: v.optional(v.union(
        v.literal("expensive"),
        v.literal("fair"),
        v.literal("cheap")
      )),
      valueScore: v.optional(v.number()), // 0-10
    })),
    
    qualityMentions: v.optional(v.object({
      hasQualityMention: v.boolean(),
      workmanshipScore: v.optional(v.number()), // 0-10
      detailOriented: v.optional(v.boolean()),
    })),
    
    reliabilityMentions: v.optional(v.object({
      hasReliabilityMention: v.boolean(),
      consistencyScore: v.optional(v.number()), // 0-10
      followThrough: v.optional(v.boolean()),
    })),
    
    // Display Controls for Tier System
    visibleToTier: v.optional(v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("power")
    )),
    isDisplayed: v.optional(v.boolean()),
    displayPriority: v.optional(v.number()), // Higher priority reviews shown first
    
    keywords: v.optional(v.array(v.string())),
    flagged: v.optional(v.boolean()),
    
    // Timestamps
    createdAt: v.number(),
    syncedAt: v.optional(v.number()),
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"])
    .index("by_business_source", ["businessId", "source"])
    .index("by_review_id", ["reviewId"])
    .index("by_import_batch", ["importBatchId"]),
    
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
    
  // Multi-source data tracking table
  businessDataSources: defineTable({
    businessId: v.id("businesses"),
    fieldName: v.string(), // "name", "phone", "address", etc.
    
    // Current active value (what's shown)
    currentValue: v.any(),
    currentSource: v.string(), // "gmb_api", "admin_import", "user_manual"
    currentUpdatedAt: v.number(),
    
    // All available values from different sources
    sources: v.array(v.object({
      source: v.string(),
      value: v.any(),
      updatedAt: v.number(),
      confidence: v.optional(v.number()), // 0-100 for imported data
      metadata: v.optional(v.any()), // Import batch ID, GMB sync ID, etc.
    })),
    
    // Override settings
    locked: v.optional(v.boolean()), // Prevent auto-updates
    preferredSource: v.optional(v.string()), // Override default priority
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_field", ["fieldName"])
    .index("by_business_field", ["businessId", "fieldName"]),
    
  // Import tracking table
  importBatches: defineTable({
    importType: v.string(), // "gmb_scrape", "csv_upload", "manual"
    importedBy: v.optional(v.id("users")),
    importedAt: v.number(),
    
    status: v.string(), // "pending", "processing", "completed", "failed"
    
    // What was imported
    businessCount: v.number(),
    reviewCount: v.optional(v.number()),
    
    // Import metadata
    source: v.string(), // "gmb_places_api", "manual_scrape", etc.
    sourceMetadata: v.optional(v.any()), // Search parameters, CSV filename, etc.
    
    // Results
    results: v.optional(v.object({
      created: v.number(),
      updated: v.number(),
      failed: v.number(),
      duplicates: v.number(),
    })),
    
    errors: v.optional(v.array(v.string())),
    
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_imported_by", ["importedBy"])
    .index("by_type", ["importType"])
    .index("by_created", ["createdAt"]),
    
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
    
  // Import validation results table
  importValidationResults: defineTable({
    batchId: v.id("importBatches"),
    status: v.string(), // "running", "completed", "failed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    overallScore: v.number(), // 0-100%
    
    // Validation categories with detailed results
    categories: v.object({
      databaseIntegrity: v.object({
        passed: v.boolean(),
        score: v.number(),
        checks: v.array(v.object({
          name: v.string(),
          passed: v.boolean(),
          message: v.string(),
          details: v.optional(v.any()),
        })),
        duration: v.number(),
      }),
      dataQuality: v.object({
        passed: v.boolean(),
        score: v.number(),
        checks: v.array(v.object({
          name: v.string(),
          passed: v.boolean(),
          message: v.string(),
          details: v.optional(v.any()),
        })),
        duration: v.number(),
      }),
      seoCompliance: v.object({
        passed: v.boolean(),
        score: v.number(),
        checks: v.array(v.object({
          name: v.string(),
          passed: v.boolean(),
          message: v.string(),
          details: v.optional(v.any()),
        })),
        duration: v.number(),
      }),
      sitemapIntegration: v.object({
        passed: v.boolean(),
        score: v.number(),
        checks: v.array(v.object({
          name: v.string(),
          passed: v.boolean(),
          message: v.string(),
          details: v.optional(v.any()),
        })),
        duration: v.number(),
      }),
      functionalSystems: v.object({
        passed: v.boolean(),
        score: v.number(),
        checks: v.array(v.object({
          name: v.string(),
          passed: v.boolean(),
          message: v.string(),
          details: v.optional(v.any()),
        })),
        duration: v.number(),
      }),
      performance: v.object({
        passed: v.boolean(),
        score: v.number(),
        checks: v.array(v.object({
          name: v.string(),
          passed: v.boolean(),
          message: v.string(),
          details: v.optional(v.any()),
        })),
        duration: v.number(),
      }),
    }),
    
    // Sample businesses for testing
    sampleBusinesses: v.array(v.object({
      _id: v.id("businesses"),
      name: v.string(),
      urlPath: v.string(),
      city: v.string(),
      category: v.string(),
    })),
    
    recommendations: v.array(v.string()),
    
    errors: v.array(v.object({
      category: v.string(),
      businessId: v.optional(v.id("businesses")),
      message: v.string(),
      severity: v.string(), // "error", "warning", "info"
    })),
    
    statistics: v.object({
      totalBusinesses: v.number(),
      expectedBusinesses: v.number(),
      successfulCreated: v.number(),
      failedCreated: v.number(),
      duplicatesSkipped: v.number(),
    }),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_batch", ["batchId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // AI Ranking System Tables (NEW)
  
  // Performance metrics cache for efficient ranking calculations
  performanceMetrics: defineTable({
    businessId: v.id("businesses"),
    
    // Speed Metrics
    avgResponseMentions: v.optional(v.number()),
    emergencyAvailability: v.optional(v.boolean()),
    speedRanking: v.optional(v.number()),
    
    // Value Metrics  
    priceRanking: v.optional(v.number()),
    valuePerceptionScore: v.optional(v.number()),
    transparencyScore: v.optional(v.number()),
    
    // Quality Metrics
    qualityRanking: v.optional(v.number()),
    craftsmanshipScore: v.optional(v.number()),
    detailScore: v.optional(v.number()),
    
    // Reliability Metrics
    reliabilityRanking: v.optional(v.number()),
    consistencyScore: v.optional(v.number()),
    communicationScore: v.optional(v.number()),
    
    // Metadata
    lastUpdated: v.number(),
    totalReviewsAnalyzed: v.number(),
    confidenceLevel: v.optional(v.number()), // 0-100% based on data quality
    
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_last_updated", ["lastUpdated"])
    .index("by_confidence", ["confidenceLevel"]),

  // Ranking cache for fast homepage and category lookups
  rankingCache: defineTable({
    cacheKey: v.string(), // "scottsdale-hvac-speed", "phoenix-plumbing-overall"
    
    rankings: v.array(v.object({
      businessId: v.id("businesses"),
      rank: v.number(),
      score: v.number(),
      performanceBadges: v.array(v.string()),
    })),
    
    lastUpdated: v.number(),
    expiresAt: v.number(),
    city: v.string(),
    category: v.string(),
    rankingType: v.union(
      v.literal("speed"),
      v.literal("value"), 
      v.literal("quality"),
      v.literal("reliability"),
      v.literal("overall")
    ),
    
    createdAt: v.number(),
  })
    .index("by_cache_key", ["cacheKey"])
    .index("by_city_category", ["city", "category"])
    .index("by_ranking_type", ["rankingType"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_last_updated", ["lastUpdated"]),

  // Review sync queue for GeoScraper API
  reviewSyncQueue: defineTable({
    businessId: v.id("businesses"),
    placeId: v.string(),
    priority: v.number(), // 1-10, higher is more important
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    requestedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    retryCount: v.number(),
    lastError: v.optional(v.string()),
    lastErrorAt: v.optional(v.number()),
    results: v.optional(v.object({
      fetched: v.number(),
      filtered: v.number(),
      imported: v.number(),
      skipped: v.number(),
    })),
  })
    .index("by_business", ["businessId"])
    .index("by_status", ["status"])
    .index("by_priority_and_status", ["priority", "status"])
    .index("by_requested_at", ["requestedAt"]),
    
  // GeoScraper API metrics
  geoScraperMetrics: defineTable({
    type: v.string(), // api_request, api_success, api_error, queue_depth, processing_time, reviews_fetched, reviews_imported
    value: v.number(),
    timestamp: v.number(),
    hour: v.number(), // For hourly aggregation
    day: v.number(), // For daily aggregation
    metadata: v.optional(v.any()), // Additional context (error codes, business IDs, etc.)
  })
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"])
    .index("by_hour", ["hour"])
    .index("by_day", ["day"])
    .index("by_type_and_hour", ["type", "hour"]),
    
  // Review sync logs for tracking sync history (Phase 2)
  reviewSyncLogs: defineTable({
    businessId: v.id("businesses"),
    syncStarted: v.number(),
    syncCompleted: v.optional(v.number()),
    reviewsFetched: v.number(),
    reviewsFiltered: v.number(),
    reviewsImported: v.number(),
    reviewsDuplicate: v.number(),
    error: v.optional(v.string()),
    status: v.union(
      v.literal("success"),
      v.literal("partial"),
      v.literal("failed")
    ),
  })
    .index("by_business", ["businessId"])
    .index("by_sync_started", ["syncStarted"])
    .index("by_status", ["status"]),
    
  // Platform statistics for efficient dashboard queries
  platformStats: defineTable({
    totalBusinesses: v.number(),
    claimedBusinesses: v.number(), 
    verifiedBusinesses: v.number(),
    totalReviews: v.number(),
    verifiedReviews: v.number(),
    totalUsers: v.number(),
    activeSubscriptions: v.number(),
    planCounts: v.object({
      free: v.number(),
      starter: v.number(),
      pro: v.number(),
      power: v.number(),
    }),
    lastUpdated: v.number(),
  }),
  
  // AI-powered ranking and achievement tables
  businessRankings: defineTable({
    businessId: v.id("businesses"),
    
    // Overall ranking data
    overallScore: v.number(), // 0-100 weighted composite score
    rankingPosition: v.number(), // Current rank in category/city
    previousPosition: v.optional(v.number()), // For trend tracking
    
    // Category-specific scores from AI analysis
    categoryScores: v.object({
      qualityIndicators: v.number(), // 0-10
      serviceExcellence: v.number(), // 0-10
      customerExperience: v.number(), // 0-10
      technicalMastery: v.number(), // 0-10
      competitiveAdvantage: v.number(), // 0-10
      operationalExcellence: v.number(), // 0-10
    }),
    
    // Detailed performance metrics
    performanceBreakdown: v.object({
      speedScore: v.number(),
      valueScore: v.number(),
      qualityScore: v.number(),
      reliabilityScore: v.number(),
      expertiseScore: v.number(),
      customerImpactScore: v.number(),
    }),
    
    // Ranking context
    category: v.string(),
    city: v.string(),
    totalBusinessesInCategory: v.number(),
    
    // Metadata
    lastCalculated: v.number(),
    reviewsAnalyzed: v.number(),
    confidenceScore: v.number(), // 0-100% based on data quality
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_category_city", ["category", "city"])
    .index("by_position", ["rankingPosition"])
    .index("by_score", ["overallScore"]),
    
  achievements: defineTable({
    businessId: v.id("businesses"),
    
    // Achievement identification
    achievementType: v.string(), // "perfection_performer", "problem_solver", etc.
    category: v.string(), // "service_excellence", "technical_mastery", etc.
    
    // Tier information
    tierLevel: v.union(
      v.literal("bronze"),
      v.literal("silver"),
      v.literal("gold"),
      v.literal("platinum"),
      v.literal("diamond") // For special competitive awards
    ),
    tierRequirement: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("power")
    ),
    
    // Achievement data
    displayName: v.string(), // "Perfection Master", "Expert Craftsman", etc.
    description: v.string(),
    badgeIcon: v.optional(v.string()), // Emoji or icon identifier
    
    // Qualifying data that earned the achievement
    qualifyingTags: v.any(), // Structured data from AI analysis
    scoreRequirements: v.object({
      metricName: v.string(),
      requiredValue: v.number(),
      actualValue: v.number(),
      percentage: v.optional(v.number()),
    }),
    
    // Display settings
    displayPriority: v.number(), // 1-10, higher shows first
    publicDisplay: v.boolean(), // Show on public profile
    achievementStatus: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("revoked")
    ),
    
    // Metadata
    earnedDate: v.number(),
    expiryDate: v.optional(v.number()), // For time-based achievements
    notificationSent: v.boolean(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_type", ["achievementType"])
    .index("by_category", ["category"])
    .index("by_tier", ["tierLevel"])
    .index("by_status", ["achievementStatus"])
    .index("by_earned_date", ["earnedDate"]),
    
  aiAnalysisTags: defineTable({
    businessId: v.id("businesses"),
    reviewId: v.id("reviews"),
    
    // Analysis metadata
    analysisDate: v.number(),
    modelVersion: v.string(), // "gpt-4", etc.
    confidenceScore: v.number(), // 0-100%
    
    // Quality indicators analysis
    qualityIndicators: v.object({
      excellence: v.object({
        mentioned: v.boolean(),
        intensity: v.number(), // 0-10
        exceeded_expectations: v.boolean(),
        specific_examples: v.array(v.string()),
      }),
      firstTimeSuccess: v.object({
        mentioned: v.boolean(),
        precision_work: v.boolean(),
        got_it_right_first: v.boolean(),
        no_return_visits: v.boolean(),
        single_visit_complete: v.boolean(),
      }),
      attentionToDetail: v.object({
        mentioned: v.boolean(),
        thoroughness: v.number(), // 0-10
        cleanliness: v.boolean(),
        careful_work: v.boolean(),
      }),
    }),
    
    // Service excellence analysis
    serviceExcellence: v.object({
      professionalism: v.object({
        score: v.number(), // 0-10
        punctual: v.boolean(),
        courteous: v.boolean(),
        knowledgeable: v.boolean(),
      }),
      communication: v.object({
        score: v.number(), // 0-10
        clear_explanation: v.boolean(),
        responsive: v.boolean(),
        kept_informed: v.boolean(),
      }),
      expertise: v.object({
        expert_referenced: v.boolean(),
        technical_competency: v.number(), // 0-10
        specialist_noted: v.boolean(),
        master_craftsman: v.boolean(),
      }),
    }),
    
    // Customer experience analysis
    customerExperience: v.object({
      emotionalImpact: v.object({
        stress_relief: v.boolean(),
        peace_of_mind: v.boolean(),
        life_changing: v.boolean(),
        emotional_intensity: v.number(), // 0-10
      }),
      businessImpact: v.object({
        saved_money: v.boolean(),
        improved_efficiency: v.boolean(),
        prevented_disaster: v.boolean(),
        business_value_score: v.number(), // 0-10
      }),
      relationshipBuilding: v.object({
        trust_established: v.boolean(),
        personal_connection: v.boolean(),
        loyalty_indicated: v.boolean(),
        future_service_planned: v.boolean(),
        relationship_score: v.number(), // 0-10
      }),
    }),
    
    // Competitive markers
    competitiveMarkers: v.object({
      comparisonMentions: v.object({
        better_than_others: v.boolean(),
        best_in_area: v.boolean(),
        tried_others_first: v.boolean(),
        comparison_count: v.number(),
      }),
      marketPosition: v.object({
        local_favorite: v.boolean(),
        industry_leader: v.boolean(),
        go_to_provider: v.boolean(),
      }),
      differentiation: v.object({
        unique_approach: v.boolean(),
        special_equipment: v.boolean(),
        innovation_mentioned: v.boolean(),
      }),
    }),
    
    // Business performance
    businessPerformance: v.object({
      responseQuality: v.object({
        quick_response_mentioned: v.boolean(),
        same_day_service: v.boolean(),
        emergency_available: v.boolean(),
        response_speed_score: v.number(), // 0-10
      }),
      valueDelivery: v.object({
        fair_pricing: v.boolean(),
        worth_the_cost: v.boolean(),
        transparent_costs: v.boolean(),
        value_score: v.number(), // 0-10
      }),
      problemResolution: v.object({
        fixed_others_couldnt: v.boolean(),
        complex_issue_resolved: v.boolean(),
        creative_solution: v.boolean(),
        difficulty_level: v.number(), // 0-10
      }),
    }),
    
    // Recommendation strength
    recommendationStrength: v.object({
      would_recommend: v.boolean(),
      already_recommended: v.boolean(),
      tell_everyone: v.boolean(),
      only_company_use: v.boolean(),
      advocacy_score: v.number(), // 0-10
    }),
    
    // Industry-specific tags (extensible)
    industrySpecific: v.optional(v.any()),
    
    // Raw sentiment data
    sentiment: v.object({
      overall: v.number(), // -1 to 1
      magnitude: v.number(), // 0 to 1
      classification: v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative")
      ),
    }),
    
    // Keywords and topics
    keywords: v.array(v.string()),
    topics: v.array(v.string()),
    
    // NEW: Customer Voice Analysis for Power tier
    customerVoiceAnalysis: v.optional(v.object({
      topQuotes: v.array(v.string()),
      commonPhrases: v.array(v.object({
        phrase: v.string(),
        frequency: v.number(),
      })),
      sentimentClusters: v.array(v.object({
        topic: v.string(),
        sentiment: v.number(), // -1 to 1
        count: v.number(),
      })),
    })),
    
    // NEW: Communication Excellence for Power tier
    communicationExcellence: v.optional(v.object({
      explainsClarly: v.object({
        mentioned: v.boolean(),
        frequency: v.number(),
      }),
      proactiveUpdates: v.object({
        mentioned: v.boolean(),
        examples: v.array(v.string()),
      }),
      responsiveness: v.object({
        avgResponseTime: v.string(),
        consistency: v.number(), // 0-10
      }),
    })),
    
    // NEW: Value Transparency for Power tier
    valueTransparency: v.optional(v.object({
      fairPricing: v.object({
        mentioned: v.boolean(),
        frequency: v.number(),
      }),
      noSurpriseCharges: v.object({
        mentioned: v.boolean(),
        frequency: v.number(),
      }),
      priceComplaintRate: v.number(), // 0-1
      valueForMoney: v.object({
        score: v.number(), // 0-10
        examples: v.array(v.string()),
      }),
    })),
    
    // NEW: Trust & Reliability Metrics for Power tier
    trustReliability: v.optional(v.object({
      customerRetention: v.object({
        callThemBack: v.boolean(),
        loyaltyIndicators: v.array(v.string()),
      }),
      consistentPerformance: v.object({
        ratingStability: v.number(), // 0-10
        timespan: v.string(),
      }),
      reliabilityMentions: v.object({
        frequency: v.number(),
        examples: v.array(v.string()),
      }),
    })),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_review", ["reviewId"])
    .index("by_analysis_date", ["analysisDate"])
    .index("by_business_date", ["businessId", "analysisDate"]),
    
  achievementProgress: defineTable({
    businessId: v.id("businesses"),
    achievementType: v.string(),
    
    // Current progress
    currentProgress: v.number(), // 0-100%
    currentValue: v.number(), // Actual metric value
    targetValue: v.number(), // Required value for achievement
    
    // Progress details
    progressDetails: v.object({
      metricName: v.string(),
      unit: v.string(), // "percentage", "count", "score", etc.
      trend: v.union(
        v.literal("improving"),
        v.literal("stable"),
        v.literal("declining")
      ),
      daysToTarget: v.optional(v.number()), // Estimated based on trend
    }),
    
    // Historical tracking
    progressHistory: v.array(v.object({
      date: v.number(),
      value: v.number(),
      percentageComplete: v.number(),
    })),
    
    // Next tier information
    nextTier: v.optional(v.object({
      tierLevel: v.string(),
      tierRequirement: v.string(),
      lockedByPlan: v.boolean(),
      qualifiesForTier: v.boolean(),
    })),
    
    // Recommendations
    recommendations: v.array(v.string()), // Tips to earn achievement
    focusAreas: v.array(v.string()), // Specific areas to improve
    
    // Metadata
    lastCalculated: v.number(),
    notificationsEnabled: v.boolean(),
    lastNotified: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_achievement", ["achievementType"])
    .index("by_business_achievement", ["businessId", "achievementType"])
    .index("by_progress", ["currentProgress"]),
    
  // Batch processing queue for AI analysis
  processingQueue: defineTable({
    type: v.union(
      v.literal("ai_analysis"),
      v.literal("ranking_calculation"),
      v.literal("achievement_detection"),
      v.literal("batch_processing")
    ),
    businessId: v.id("businesses"),
    
    // Queue management
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("retrying")
    ),
    priority: v.number(), // 1-10, higher is more important
    attempts: v.number(),
    
    // Timing
    createdAt: v.number(),
    updatedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    lastAttemptAt: v.optional(v.number()),
    
    // Results and errors
    error: v.optional(v.string()),
    result: v.optional(v.any()),
    metadata: v.optional(v.any()),
  })
    .index("by_business", ["businessId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_status_priority", ["status", "priority"])
    .index("by_business_type_status", ["businessId", "type", "status"]),
});