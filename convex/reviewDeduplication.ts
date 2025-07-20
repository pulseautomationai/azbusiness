/**
 * Review Deduplication Logic
 * Part of AI Ranking System - Phase 1.2
 * Handles cross-platform duplicate detection and content similarity
 */

import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

/**
 * Check if two reviews are likely duplicates
 */
function areReviewsDuplicates(review1: any, review2: any): {
  isDuplicate: boolean;
  confidence: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let confidence = 0;
  
  // Exact same review ID from same source
  if (review1.reviewId === review2.reviewId && review1.source === review2.source) {
    return { isDuplicate: true, confidence: 1.0, reasons: ["Same review ID from same source"] };
  }
  
  // Same author and same rating
  if (review1.userName === review2.userName && review1.rating === review2.rating) {
    confidence += 0.3;
    reasons.push("Same author and rating");
  }
  
  // Content similarity
  const normalizedComment1 = normalizeText(review1.comment);
  const normalizedComment2 = normalizeText(review2.comment);
  const contentSimilarity = calculateSimilarity(normalizedComment1, normalizedComment2);
  
  if (contentSimilarity > 0.9) {
    confidence += 0.5;
    reasons.push(`Very similar content (${Math.round(contentSimilarity * 100)}% match)`);
  } else if (contentSimilarity > 0.8) {
    confidence += 0.3;
    reasons.push(`Similar content (${Math.round(contentSimilarity * 100)}% match)`);
  }
  
  // Date proximity (within 7 days)
  const timeDiff = Math.abs(review1.createdAt - review2.createdAt);
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  if (daysDiff <= 1) {
    confidence += 0.2;
    reasons.push("Posted within 1 day");
  } else if (daysDiff <= 7) {
    confidence += 0.1;
    reasons.push("Posted within 1 week");
  }
  
  return {
    isDuplicate: confidence >= 0.7,
    confidence,
    reasons
  };
}

/**
 * Find potential duplicates for a specific review
 */
export const findDuplicateReviews = query({
  args: {
    businessId: v.id("businesses"),
    reviewId: v.optional(v.string()),
    checkAll: v.optional(v.boolean()), // Check all reviews, not just one
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    if (reviews.length < 2) {
      return { duplicates: [], summary: { total: reviews.length, duplicates: 0 } };
    }

    const duplicates: Array<{
      primary: any;
      duplicate: any;
      confidence: number;
      reasons: string[];
    }> = [];

    const processed = new Set<string>();

    for (let i = 0; i < reviews.length; i++) {
      const review1 = reviews[i];
      
      // If checking specific review, skip others as primary
      if (args.reviewId && review1.reviewId !== args.reviewId) {
        continue;
      }
      
      if (processed.has(review1._id)) continue;

      for (let j = i + 1; j < reviews.length; j++) {
        const review2 = reviews[j];
        
        if (processed.has(review2._id)) continue;

        const duplicateCheck = areReviewsDuplicates(review1, review2);
        
        if (duplicateCheck.isDuplicate) {
          duplicates.push({
            primary: {
              id: review1._id,
              reviewId: review1.reviewId,
              source: review1.source,
              author: review1.userName,
              rating: review1.rating,
              comment: review1.comment.substring(0, 100) + "...",
              createdAt: review1.createdAt,
            },
            duplicate: {
              id: review2._id,
              reviewId: review2.reviewId,
              source: review2.source,
              author: review2.userName,
              rating: review2.rating,
              comment: review2.comment.substring(0, 100) + "...",
              createdAt: review2.createdAt,
            },
            confidence: duplicateCheck.confidence,
            reasons: duplicateCheck.reasons,
          });
          
          // Mark the duplicate as processed so it doesn't become a primary
          processed.add(review2._id);
        }
      }
      
      processed.add(review1._id);
    }

    return {
      duplicates,
      summary: {
        total: reviews.length,
        duplicates: duplicates.length,
        processed: processed.size,
      }
    };
  },
});

/**
 * Remove duplicate reviews (keep the most authoritative source)
 */
export const removeDuplicateReviews = internalMutation({
  args: {
    businessId: v.id("businesses"),
    duplicatePairs: v.array(v.object({
      primaryId: v.id("reviews"),
      duplicateId: v.id("reviews"),
      confidence: v.number(),
    })),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sourceAuthority = {
      "gmb_api": 10,        // Highest authority
      "gmb_import": 9,
      "facebook_import": 5,
      "yelp_import": 5,
      "direct": 3,          // Platform reviews
      "manual": 1,          // Lowest authority
    };

    let removed = 0;
    let kept = 0;
    const actions: Array<{
      action: "remove" | "keep";
      reviewId: string;
      source: string;
      reason: string;
    }> = [];

    for (const pair of args.duplicatePairs) {
      const primary = await ctx.db.get(pair.primaryId);
      const duplicate = await ctx.db.get(pair.duplicateId);

      if (!primary || !duplicate) {
        continue;
      }

      const primaryAuthority = sourceAuthority[primary.source as keyof typeof sourceAuthority] || 0;
      const duplicateAuthority = sourceAuthority[duplicate.source as keyof typeof sourceAuthority] || 0;

      let reviewToRemove;
      let reviewToKeep;
      let reason;

      if (primaryAuthority > duplicateAuthority) {
        reviewToRemove = duplicate;
        reviewToKeep = primary;
        reason = `Keeping ${primary.source} over ${duplicate.source} (higher authority)`;
      } else if (duplicateAuthority > primaryAuthority) {
        reviewToRemove = primary;
        reviewToKeep = duplicate;
        reason = `Keeping ${duplicate.source} over ${primary.source} (higher authority)`;
      } else {
        // Same authority, keep the more recent one
        if (primary.createdAt > duplicate.createdAt) {
          reviewToRemove = duplicate;
          reviewToKeep = primary;
          reason = "Keeping more recent review";
        } else {
          reviewToRemove = primary;
          reviewToKeep = duplicate;
          reason = "Keeping more recent review";
        }
      }

      actions.push({
        action: "remove",
        reviewId: reviewToRemove.reviewId,
        source: reviewToRemove.source,
        reason: reason,
      });

      actions.push({
        action: "keep",
        reviewId: reviewToKeep.reviewId,
        source: reviewToKeep.source,
        reason: reason,
      });

      if (!args.dryRun) {
        // Mark as flagged instead of deleting (for audit trail)
        await ctx.db.patch(reviewToRemove._id, {
          flagged: true,
          isDisplayed: false,
          keywords: [...(reviewToRemove.keywords || []), "duplicate_removed"],
        });
        removed++;
      }

      kept++;
    }

    return {
      removed,
      kept,
      actions,
      dryRun: args.dryRun || false,
    };
  },
});

/**
 * Auto-deduplicate reviews during import process
 */
export const autoDeduplicateNewReviews = internalMutation({
  args: {
    businessId: v.id("businesses"),
    importBatchId: v.id("importBatches"),
  },
  handler: async (ctx, args) => {
    // Get all reviews for this business
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    // Get newly imported reviews from this batch
    const newReviews = allReviews.filter(r => r.importBatchId === args.importBatchId);
    const existingReviews = allReviews.filter(r => r.importBatchId !== args.importBatchId);

    let duplicatesFound = 0;
    const duplicateActions: string[] = [];

    for (const newReview of newReviews) {
      for (const existingReview of existingReviews) {
        const duplicateCheck = areReviewsDuplicates(newReview, existingReview);
        
        if (duplicateCheck.isDuplicate) {
          // Flag the new review as duplicate
          await ctx.db.patch(newReview._id, {
            flagged: true,
            isDisplayed: false,
            keywords: [...(newReview.keywords || []), "auto_duplicate_flagged"],
          });
          
          duplicatesFound++;
          duplicateActions.push(
            `Flagged new ${newReview.source} review as duplicate of existing ${existingReview.source} review (${Math.round(duplicateCheck.confidence * 100)}% confidence)`
          );
          break; // Only flag against first duplicate found
        }
      }
    }

    return {
      newReviews: newReviews.length,
      duplicatesFound,
      actions: duplicateActions,
    };
  },
});