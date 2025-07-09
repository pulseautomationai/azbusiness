import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Original tables
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  
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
    
  // New tables for AZ Business Services
  businesses: defineTable({
    // Basic info
    name: v.string(),
    slug: v.string(),
    urlPath: v.optional(v.string()), // New URL structure path
    logo: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    description: v.string(),
    shortDescription: v.string(), // For cards
    
    // Contact & Location
    phone: v.string(),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    
    // Business details
    categoryId: v.id("categories"),
    services: v.array(v.string()), // List of services offered
    hours: v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    }),
    
    // Subscription & Features
    planTier: v.union(v.literal("free"), v.literal("pro"), v.literal("power")),
    featured: v.boolean(), // Homepage featured spot
    priority: v.number(), // Sorting priority (higher = top)
    
    // Ownership & Status
    ownerId: v.optional(v.string()), // Clerk user ID
    claimed: v.boolean(),
    verified: v.boolean(),
    active: v.boolean(),
    
    // SEO & Social
    socialLinks: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
    
    // Additional Google My Business Data
    imageUrl: v.optional(v.string()), // Main business image from GMB
    favicon: v.optional(v.string()), // Business favicon/logo
    reviewUrl: v.optional(v.string()), // Direct link to Google reviews
    serviceOptions: v.optional(v.string()), // "Onsite services | Online estimates"
    fromTheBusiness: v.optional(v.string()), // "Identifies as veteran-owned"
    offerings: v.optional(v.string()), // "Repair services"
    planning: v.optional(v.string()), // "Appointment required"
    
    // Ratings
    rating: v.number(), // Average rating
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
    icon: v.optional(v.string()), // Icon name or emoji
    order: v.number(), // Display order
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"]),
    
  cities: defineTable({
    name: v.string(),
    slug: v.string(),
    region: v.string(), // e.g., "Phoenix Metro", "Northern Arizona"
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
    userId: v.optional(v.string()), // Clerk user ID, optional for anonymous
    userName: v.string(),
    rating: v.number(), // 1-5
    comment: v.string(),
    verified: v.boolean(), // Verified customer
    helpful: v.number(), // Helpful votes count
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
    service: v.optional(v.string()), // Which service they're interested in
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("converted")),
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
    authorId: v.optional(v.string()), // Clerk user ID
    businessId: v.optional(v.id("businesses")), // For Power plan auto-posts
    categoryTags: v.array(v.string()), // Category slugs
    cityTags: v.array(v.string()), // City slugs
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
    userId: v.string(), // User ID or IP address
    endpoint: v.string(), // API endpoint being rate limited
    timestamp: v.number(), // When the request was made
    ipAddress: v.optional(v.string()), // IP address for additional tracking
  })
    .index("by_user_endpoint", ["userId", "endpoint"])
    .index("by_timestamp", ["timestamp"]),
});
