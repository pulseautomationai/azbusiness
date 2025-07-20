/**
 * GMB Reviews sync and management functions
 * Enhanced for AI Ranking System with tier-based limits
 */

import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Get tier-based review import limits
 */
const getTierLimits = (planTier: string) => {
  const limits = {
    "free": { import: 15, display: 3 },
    "starter": { import: 25, display: 8 },
    "pro": { import: 40, display: 15 },
    "power": { import: 100, display: -1 }, // unlimited display
  };
  return limits[planTier as keyof typeof limits] || limits.free;
};

/**
 * Sync reviews from GMB API for a claimed business
 */
export const syncBusinessReviews = mutation({
  args: { 
    businessId: v.id("businesses"),
    forceSync: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Check if user has permission to sync this business
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Check if user owns this business or is admin
    const isOwner = business.claimedByUserId === identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Permission denied");
    }

    // Check if business has GMB connection
    if (business.dataSource.primary !== "gmb_api" || !business.dataSource.gmbLocationId) {
      throw new Error("Business is not connected to Google My Business");
    }

    // Get tier limits for this business
    const tierLimits = getTierLimits(business.planTier);
    
    // Update business with tier-based limits if not set
    if (!business.maxReviewImport || !business.maxReviewDisplay) {
      await ctx.db.patch(args.businessId, {
        maxReviewImport: tierLimits.import,
        maxReviewDisplay: tierLimits.display,
      });
    }

    // Check rate limiting (unless forced)
    if (!args.forceSync) {
      const lastSync = business.dataSource.lastSyncedAt;
      if (lastSync && Date.now() - lastSync < 60 * 60 * 1000) { // 1 hour
        throw new Error("Reviews were synced recently. Wait at least 1 hour between syncs.");
      }
    }

    // Create sync batch record
    const batchId = await ctx.db.insert("importBatches", {
      importType: "gmb_review_sync",
      importedBy: user!._id,
      importedAt: Date.now(),
      status: "pending",
      businessCount: 1,
      reviewCount: 0,
      source: "gmb_api",
      sourceMetadata: {
        businessId: args.businessId,
        gmbLocationId: business.dataSource.gmbLocationId,
      },
      createdAt: Date.now(),
    });

    // Schedule the actual sync (this would be handled by a webhook/cron in production)
    // TODO: Implement internal.syncGMBReviewsInternal function
    // await ctx.scheduler.runAfter(0, internal.syncGMBReviewsInternal, {
    //   batchId,
    //   businessId: args.businessId,
    //   gmbLocationId: business.dataSource.gmbLocationId!,
    // });

    return { batchId, status: "started" };
  },
});

/**
 * Internal function to actually perform the GMB review sync
 * This would be called by a webhook from your backend service that has the GMB tokens
 */
export const syncGMBReviewsInternal = internalMutation({
  args: {
    batchId: v.id("importBatches"),
    businessId: v.id("businesses"),
    reviews: v.array(v.object({
      reviewId: v.string(),
      authorName: v.string(),
      authorPhotoUrl: v.optional(v.string()),
      rating: v.number(),
      comment: v.string(),
      createTime: v.string(),
      updateTime: v.string(),
      reply: v.optional(v.object({
        comment: v.string(),
        updateTime: v.string(),
      })),
    })),
    totalReviewCount: v.number(),
    averageRating: v.number(),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors: string[] = [];

    try {
      // Get business to check tier limits
      const business = await ctx.db.get(args.businessId);
      if (!business) {
        throw new Error("Business not found");
      }

      const tierLimits = getTierLimits(business.planTier);
      const maxImport = business.maxReviewImport || tierLimits.import;

      // Limit reviews to tier maximum (most recent first)
      const reviewsToProcess = args.reviews
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        .slice(0, maxImport);

      skipped = args.reviews.length - reviewsToProcess.length;

      // Update import batch status
      await ctx.db.patch(args.batchId, {
        status: "processing",
        reviewCount: reviewsToProcess.length,
      });

      for (const review of reviewsToProcess) {
        try {
          // Check if review already exists
          const existingReview = await ctx.db
            .query("reviews")
            .withIndex("by_review_id", (q) => q.eq("reviewId", review.reviewId))
            .first();

          const reviewData = {
            businessId: args.businessId,
            reviewId: review.reviewId,
            userName: review.authorName,
            authorPhotoUrl: review.authorPhotoUrl,
            rating: review.rating,
            comment: review.comment,
            verified: true, // GMB reviews are always verified
            helpful: 0,
            source: "gmb_api" as const,
            originalCreateTime: review.createTime,
            originalUpdateTime: review.updateTime,
            reply: review.reply ? {
              text: review.reply.comment,
              createdAt: new Date(review.reply.updateTime).getTime(),
            } : undefined,
            syncedAt: Date.now(),
            importBatchId: args.batchId,
            
            // AI Analysis placeholders (will be filled by AI processing)
            sentiment: undefined,
            speedMentions: undefined,
            valueMentions: undefined,
            qualityMentions: undefined,
            reliabilityMentions: undefined,
            
            // Display controls for tier system
            visibleToTier: "free" as const, // Default to free tier
            isDisplayed: true,
            displayPriority: 0, // Will be calculated during AI analysis
            
            keywords: undefined,
            flagged: false,
            
            createdAt: new Date(review.createTime).getTime(),
          };

          if (existingReview) {
            // Update existing review
            await ctx.db.patch(existingReview._id, reviewData);
            updated++;
          } else {
            // Create new review
            await ctx.db.insert("reviews", reviewData);
            created++;
          }
        } catch (error) {
          errors.push(`Failed to process review ${review.reviewId}: ${error}`);
        }
      }

      // Update business rating stats
      await ctx.db.patch(args.businessId, {
        rating: args.averageRating,
        reviewCount: args.totalReviewCount,
        updatedAt: Date.now(),
        dataSource: {
          ...((await ctx.db.get(args.businessId))!.dataSource),
          lastSyncedAt: Date.now(),
          syncStatus: "synced",
        },
      });

      // Complete the batch
      await ctx.db.patch(args.batchId, {
        status: "completed",
        completedAt: Date.now(),
        results: {
          created,
          updated,
          failed: errors.length,
          duplicates: skipped, // Use skipped for tier-limited reviews
        },
        errors: errors.length > 0 ? errors : undefined,
      });

      // Schedule AI analysis for newly imported reviews
      if (created + updated > 0) {
        // TODO: Schedule AI analysis batch processing
        // await ctx.scheduler.runAfter(0, internal.processReviewsForAI, {
        //   businessId: args.businessId,
        //   batchId: args.batchId,
        // });
      }

      return { 
        created, 
        updated, 
        skipped, 
        errors: errors.length,
        tierLimit: maxImport,
        totalAvailable: args.reviews.length
      };

    } catch (error) {
      // Mark batch as failed
      await ctx.db.patch(args.batchId, {
        status: "failed",
        completedAt: Date.now(),
        errors: [String(error)],
      });
      throw error;
    }
  },
});

/**
 * Get reviews for a business with filtering
 */
export const getBusinessReviews = query({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
    source: v.optional(v.string()),
    minRating: v.optional(v.number()),
    maxRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId));

    const reviews = await query.collect();

    // Apply filters
    let filteredReviews = reviews;

    if (args.source) {
      filteredReviews = filteredReviews.filter(r => r.source === args.source);
    }

    if (args.minRating !== undefined) {
      filteredReviews = filteredReviews.filter(r => r.rating >= args.minRating!);
    }

    if (args.maxRating !== undefined) {
      filteredReviews = filteredReviews.filter(r => r.rating <= args.maxRating!);
    }

    // Sort by creation date (newest first)
    filteredReviews.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (args.limit) {
      filteredReviews = filteredReviews.slice(0, args.limit);
    }

    return filteredReviews;
  },
});

/**
 * Get review analytics for a business
 */
export const getReviewAnalytics = query({
  args: {
    businessId: v.id("businesses"),
    timeframe: v.optional(v.string()), // "30d", "90d", "1y", "all"
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    // Filter by timeframe
    let filteredReviews = reviews;
    if (args.timeframe && args.timeframe !== "all") {
      const days = {
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[args.timeframe] || 30;

      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      filteredReviews = reviews.filter(r => r.createdAt >= cutoff);
    }

    if (filteredReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        sourceDistribution: [],
        responseRate: 0,
        recentTrend: "stable",
      };
    }

    // Calculate stats
    const totalReviews = filteredReviews.length;
    const averageRating = filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // Rating distribution
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => {
      const count = filteredReviews.filter(r => r.rating === rating).length;
      return {
        rating,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
      };
    });

    // Source distribution
    const sourceCounts = filteredReviews.reduce((acc, review) => {
      acc[review.source] = (acc[review.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceDistribution = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / totalReviews) * 100),
    }));

    // Response rate
    const reviewsWithReplies = filteredReviews.filter(r => r.reply).length;
    const responseRate = totalReviews > 0 ? Math.round((reviewsWithReplies / totalReviews) * 100) : 0;

    // Recent trend (simple - compare last 30 days to previous 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    const recentReviews = reviews.filter(r => r.createdAt >= thirtyDaysAgo);
    const previousReviews = reviews.filter(r => r.createdAt >= sixtyDaysAgo && r.createdAt < thirtyDaysAgo);

    let recentTrend = "stable";
    if (recentReviews.length > previousReviews.length * 1.2) {
      recentTrend = "increasing";
    } else if (recentReviews.length < previousReviews.length * 0.8) {
      recentTrend = "decreasing";
    }

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: ratingCounts,
      sourceDistribution,
      responseRate,
      recentTrend,
    };
  },
});

/**
 * Get sync status for a business
 */
export const getSyncStatus = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get recent sync batches
    const recentBatches = await ctx.db
      .query("importBatches")
      .filter((q) => 
        q.and(
          q.eq(q.field("importType"), "gmb_review_sync"),
          q.eq(q.field("sourceMetadata.businessId"), args.businessId)
        )
      )
      .order("desc")
      .take(5);

    return {
      isGMBConnected: business.dataSource.primary === "gmb_api",
      gmbLocationId: business.dataSource.gmbLocationId,
      lastSyncedAt: business.dataSource.lastSyncedAt,
      syncStatus: business.dataSource.syncStatus,
      canSyncNow: !business.dataSource.lastSyncedAt || 
        (Date.now() - business.dataSource.lastSyncedAt > 60 * 60 * 1000), // 1 hour
      recentBatches: recentBatches.map(batch => ({
        id: batch._id,
        status: batch.status,
        createdAt: batch.createdAt,
        completedAt: batch.completedAt,
        reviewCount: batch.reviewCount,
        results: batch.results,
        errors: batch.errors,
      })),
    };
  },
});

/**
 * Create a review directly (for imports and testing)
 */
export const createDirectReview = mutation({
  args: {
    businessId: v.id("businesses"),
    reviewId: v.string(),
    rating: v.number(),
    comment: v.string(),
    userName: v.string(),
    source: v.union(
      v.literal("gmb_api"),
      v.literal("gmb_import"),
      v.literal("yelp"),
      v.literal("facebook"),
      v.literal("manual")
    ),
    verified: v.optional(v.boolean()),
    originalCreateTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_business_and_review_id", (q) =>
        q.eq("businessId", args.businessId).eq("reviewId", args.reviewId)
      )
      .first();

    if (existingReview) {
      throw new Error(`Review with ID ${args.reviewId} already exists for this business`);
    }

    // Validate rating
    const rating = Math.max(1, Math.min(5, Math.round(args.rating)));

    // Create the review
    const reviewId = await ctx.db.insert("reviews", {
      businessId: args.businessId,
      reviewId: args.reviewId,
      userName: args.userName,
      rating,
      comment: args.comment.trim(),
      verified: args.verified || false,
      source: args.source,
      originalCreateTime: args.originalCreateTime || new Date().toISOString(),
      originalUpdateTime: args.originalCreateTime || new Date().toISOString(),
      syncedAt: Date.now(),
      
      // Initialize analysis fields
      sentiment: undefined,
      keywords: undefined,
      flagged: false,
      
      createdAt: Date.now(),
    });

    // Update business review count and rating
    const business = await ctx.db.get(args.businessId);
    if (business) {
      // Get all reviews for this business to recalculate stats
      const allReviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .collect();

      const totalReviews = allReviews.length;
      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      await ctx.db.patch(args.businessId, {
        reviewCount: totalReviews,
        rating: Math.round(averageRating * 10) / 10,
        updatedAt: Date.now(),
      });
    }

    return reviewId;
  },
});