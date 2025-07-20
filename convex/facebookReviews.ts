/**
 * Facebook Reviews import and management functions
 * Part of AI Ranking System - Phase 1.2
 */

import { mutation, internalMutation } from "./_generated/server";
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
 * Import reviews from Facebook for a business
 */
export const importFacebookReviews = mutation({
  args: { 
    businessId: v.id("businesses"),
    facebookPageId: v.string(),
    forceImport: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Check if user has permission to import for this business
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
    if (!args.forceImport) {
      const recentFacebookImport = await ctx.db
        .query("importBatches")
        .filter((q) => 
          q.and(
            q.eq(q.field("importType"), "facebook_import"),
            q.eq(q.field("sourceMetadata.businessId"), args.businessId),
            q.gt(q.field("createdAt"), Date.now() - 24 * 60 * 60 * 1000) // 24 hours
          )
        )
        .first();
      
      if (recentFacebookImport) {
        throw new Error("Facebook reviews were imported recently. Wait at least 24 hours between imports.");
      }
    }

    // Create import batch record
    const batchId = await ctx.db.insert("importBatches", {
      importType: "facebook_import",
      importedBy: user!._id,
      importedAt: Date.now(),
      status: "pending",
      businessCount: 1,
      reviewCount: 0,
      source: "facebook_api",
      sourceMetadata: {
        businessId: args.businessId,
        facebookPageId: args.facebookPageId,
      },
      createdAt: Date.now(),
    });

    // TODO: In production, this would call an external service that has Facebook API access
    // For now, we'll return the batch ID and expect manual processing
    return { batchId, status: "pending_external_processing" };
  },
});

/**
 * Internal function to process Facebook reviews from external scraper service
 */
export const processFacebookReviewsInternal = internalMutation({
  args: {
    batchId: v.id("importBatches"),
    businessId: v.id("businesses"),
    reviews: v.array(v.object({
      reviewId: v.string(),
      authorName: v.string(),
      authorPhotoUrl: v.optional(v.string()),
      rating: v.number(),
      comment: v.string(),
      reviewDate: v.string(), // ISO date string
      facebookUrl: v.string(),
      recommendation: v.optional(v.boolean()), // Facebook's "recommends" feature
    })),
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

      // Check how many reviews we already have for this business
      const existingReviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .collect();

      const remainingSlots = Math.max(0, maxImport - existingReviews.length);

      // Limit reviews to remaining slots (most recent first)
      const reviewsToProcess = args.reviews
        .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
        .slice(0, remainingSlots);

      skipped = args.reviews.length - reviewsToProcess.length;

      // Update import batch status
      await ctx.db.patch(args.batchId, {
        status: "processing",
        reviewCount: reviewsToProcess.length,
      });

      for (const review of reviewsToProcess) {
        try {
          // Check for duplicates (by review content and author)
          const duplicate = await ctx.db
            .query("reviews")
            .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
            .filter((q) => 
              q.and(
                q.eq(q.field("userName"), review.authorName),
                q.eq(q.field("comment"), review.comment),
                q.eq(q.field("rating"), review.rating)
              )
            )
            .first();

          if (duplicate) {
            skipped++;
            continue;
          }

          // Convert Facebook recommendation to 5-star rating if no explicit rating
          let rating = review.rating;
          if (!rating && review.recommendation !== undefined) {
            rating = review.recommendation ? 5 : 2; // Recommend = 5 stars, Not recommend = 2 stars
          }

          const reviewData = {
            businessId: args.businessId,
            reviewId: review.reviewId,
            userName: review.authorName,
            authorPhotoUrl: review.authorPhotoUrl,
            rating: rating || 3, // Default to 3 if no rating available
            comment: review.comment,
            verified: false, // Facebook reviews are not auto-verified
            helpful: 0,
            source: "facebook_import" as const,
            sourceUrl: review.facebookUrl,
            originalCreateTime: review.reviewDate,
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
            
            createdAt: new Date(review.reviewDate).getTime(),
          };

          await ctx.db.insert("reviews", reviewData);
          created++;

        } catch (error) {
          errors.push(`Failed to process Facebook review ${review.reviewId}: ${error}`);
        }
      }

      // Complete the batch
      await ctx.db.patch(args.batchId, {
        status: "completed",
        completedAt: Date.now(),
        results: {
          created,
          updated: 0, // Facebook imports are always new
          failed: errors.length,
          duplicates: skipped,
        },
        errors: errors.length > 0 ? errors : undefined,
      });

      // Schedule AI analysis for newly imported reviews
      if (created > 0) {
        // TODO: Schedule AI analysis batch processing
        // await ctx.scheduler.runAfter(0, internal.processReviewsForAI, {
        //   businessId: args.businessId,
        //   batchId: args.batchId,
        // });
      }

      return { 
        created, 
        updated: 0, 
        skipped, 
        errors: errors.length,
        tierLimit: maxImport,
        totalAvailable: args.reviews.length,
        existingReviews: existingReviews.length
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
 * Get available Facebook import status for a business
 */
export const getFacebookImportStatus = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get recent Facebook import batches
    const recentBatches = await ctx.db
      .query("importBatches")
      .filter((q) => 
        q.and(
          q.eq(q.field("importType"), "facebook_import"),
          q.eq(q.field("sourceMetadata.businessId"), args.businessId)
        )
      )
      .order("desc")
      .take(5);

    const tierLimits = getTierLimits(business.planTier);
    const existingReviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    const facebookReviews = existingReviews.filter(r => r.source === "facebook_import");
    const remainingSlots = Math.max(0, tierLimits.import - existingReviews.length);

    return {
      tierLimit: tierLimits.import,
      existingReviews: existingReviews.length,
      facebookReviews: facebookReviews.length,
      remainingSlots,
      canImportMore: remainingSlots > 0,
      lastImportAt: recentBatches[0]?.createdAt,
      canImportNow: !recentBatches[0] || 
        (Date.now() - recentBatches[0].createdAt > 24 * 60 * 60 * 1000), // 24 hours
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