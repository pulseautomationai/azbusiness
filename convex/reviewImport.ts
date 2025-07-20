import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Business matching interface for review import
interface BusinessMatch {
  businessId: Id<"businesses">;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'address' | 'manual';
}

// Review data structure for import
interface ReviewData {
  reviewId: string;
  rating: number;
  comment: string;
  userName: string;
  businessName: string;
  businessPhone?: string;
  businessAddress?: string;
  businessId?: string;
  businessPlaceId?: string;  // Google Place ID for accurate matching
  userId?: string;
  authorPhotoUrl?: string;
  verified?: boolean;
  helpful?: number;
  sourceUrl?: string;
  originalCreateTime?: string;
  originalUpdateTime?: string;
  replyText?: string;
  replyAuthorName?: string;
  replyCreatedAt?: string;
}

// Enhanced batch import reviews with business matching
export const batchImportReviews = mutation({
  args: {
    reviews: v.array(v.object({
      reviewId: v.string(),
      rating: v.number(),
      comment: v.string(),
      userName: v.string(),
      businessName: v.string(),
      businessPhone: v.optional(v.string()),
      businessAddress: v.optional(v.string()),
      businessId: v.optional(v.string()),
      businessPlaceId: v.optional(v.string()),
      userId: v.optional(v.string()),
      authorPhotoUrl: v.optional(v.string()),
      verified: v.optional(v.boolean()),
      helpful: v.optional(v.number()),
      sourceUrl: v.optional(v.string()),
      originalCreateTime: v.optional(v.string()),
      originalUpdateTime: v.optional(v.string()),
      replyText: v.optional(v.string()),
      replyAuthorName: v.optional(v.string()),
      replyCreatedAt: v.optional(v.string()),
    })),
    source: v.union(
      v.literal("gmb_import"),
      v.literal("yelp_import"),
      v.literal("facebook_import"),
      v.literal("manual")
    ),
    importBatchId: v.optional(v.string()),
    skipDuplicates: v.optional(v.boolean()),
    sourceMetadata: v.optional(v.object({
      fileName: v.string(),
      csvType: v.string(),
      batchNumber: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Get user identity for import tracking (optional)
    const identity = await ctx.auth.getUserIdentity();
    
    let importedBy: any = undefined; // Default to undefined (optional field)
    
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .first();
      
      if (user) {
        importedBy = user._id;
        console.log(`Import tracked to user: ${user.name || user.email || 'Unknown'}`);
      } else {
        console.log(`User not found for token: ${identity.tokenIdentifier}, using anonymous import`);
      }
    } else {
      console.log(`No authentication found, using anonymous import`);
    }

    // Create import batch record for history tracking
    const batchId = await ctx.db.insert("importBatches", {
      importType: "review_import",
      importedBy: importedBy,
      importedAt: Date.now(),
      status: "processing",
      businessCount: 0, // We're importing reviews, not businesses
      reviewCount: args.reviews.length,
      source: args.sourceMetadata?.fileName ? "csv_upload" : "manual",
      sourceMetadata: args.sourceMetadata,
      createdAt: Date.now(),
    });

    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      duplicates: 0,
      errors: [] as string[],
      businessMatches: [] as Array<{
        businessName: string;
        matchType: string;
        confidence: number;
      }>,
    };

    try {
      console.log(`Starting batch import with ${args.reviews.length} reviews`);
      
      // Get all businesses for matching
      const allBusinesses = await ctx.db.query("businesses").collect();
      const businessMap = new Map(allBusinesses.map(b => [b._id, b]));
      
      console.log(`Found ${allBusinesses.length} businesses in database for matching`);

      for (const reviewData of args.reviews) {
        try {
          console.log(`Processing review for business: ${reviewData.businessName}`);
          
          // Step 1: Find matching business
          const businessMatch = await findBusinessMatch(reviewData, allBusinesses);
          
          if (!businessMatch) {
            results.failed++;
            console.log(`No matching business found for: ${reviewData.businessName}`);
            results.errors.push(`No matching business found for: ${reviewData.businessName}`);
            continue;
          }
          
          console.log(`Found business match: ${businessMatch.matchType} with confidence ${businessMatch.confidence}`);

          const business = businessMap.get(businessMatch.businessId);
          if (!business) {
            results.failed++;
            console.log(`Business not found in map: ${businessMatch.businessId}`);
            results.errors.push(`Business not found: ${businessMatch.businessId}`);
            continue;
          }

          console.log(`Business found: ${business.name}, planTier: ${business.planTier}`);

          // Step 2: Check tier-based review limits
          const currentReviewCount = await ctx.db
            .query("reviews")
            .withIndex("by_business", (q: any) => q.eq("businessId", businessMatch.businessId))
            .collect();

          const reviewLimit = getReviewLimitForTier(business.planTier);
          console.log(`Review limit check: ${currentReviewCount.length}/${reviewLimit} for ${business.planTier} tier`);
          
          if (currentReviewCount.length >= reviewLimit) {
            results.skipped++;
            console.log(`Review limit reached for ${business.name}`);
            results.errors.push(`Review limit reached for ${business.name} (${business.planTier} tier: ${reviewLimit} reviews)`);
            continue;
          }

          // Step 3: Check for duplicates
          console.log(`Checking duplicates for review ID: ${reviewData.reviewId}`);
          if (args.skipDuplicates) {
            const existingReview = await ctx.db
              .query("reviews")
              .withIndex("by_review_id", (q: any) => q.eq("reviewId", reviewData.reviewId))
              .first();

            if (existingReview) {
              results.duplicates++;
              console.log(`Duplicate review ID found: ${reviewData.reviewId}`);
              continue;
            }

            // Also check for content similarity
            const similarReview = await findSimilarReview(ctx, businessMatch.businessId, reviewData.comment, reviewData.userName);
            if (similarReview) {
              results.duplicates++;
              console.log(`Similar review found for user: ${reviewData.userName}`);
              continue;
            }
          }

          // Step 4: Prepare review object
          const reviewObject = {
            businessId: businessMatch.businessId,
            reviewId: reviewData.reviewId,
            userId: reviewData.userId,
            userName: reviewData.userName,
            authorPhotoUrl: reviewData.authorPhotoUrl,
            rating: Math.max(1, Math.min(5, reviewData.rating)), // Ensure 1-5 range
            comment: reviewData.comment.trim(),
            verified: reviewData.verified ?? false,
            helpful: reviewData.helpful ?? 0,
            source: args.source,
            sourceUrl: reviewData.sourceUrl,
            importBatchId: batchId,
            originalCreateTime: reviewData.originalCreateTime,
            originalUpdateTime: reviewData.originalUpdateTime,
            reply: reviewData.replyText ? {
              text: reviewData.replyText,
              createdAt: reviewData.replyCreatedAt ? 
                new Date(reviewData.replyCreatedAt).getTime() : 
                Date.now(),
              authorName: reviewData.replyAuthorName || "Business Owner",
            } : undefined,
            // Timestamps (syncedAt instead of updatedAt to match schema)
            createdAt: reviewData.originalCreateTime ? 
              new Date(reviewData.originalCreateTime).getTime() : 
              Date.now(),
            syncedAt: Date.now(),
          };

          // Step 5: Insert review
          console.log(`Inserting review for business: ${business.name}`);
          try {
            await ctx.db.insert("reviews", reviewObject);
            console.log(`Review inserted successfully for: ${reviewData.userName}`);
          } catch (insertError) {
            console.error(`Failed to insert review:`, insertError);
            results.failed++;
            results.errors.push(`Failed to insert review for ${reviewData.userName}: ${insertError}`);
            continue;
          }
          
          // Step 6: Update business review count and rating
          try {
            await updateBusinessReviewStats(ctx, businessMatch.businessId);
            console.log(`Business stats updated for: ${business.name}`);
          } catch (updateError) {
            console.error(`Failed to update business stats:`, updateError);
            // Don't fail the review for this, just log it
          }

          results.successful++;
          console.log(`Review successfully processed for: ${reviewData.userName}`);
          results.businessMatches.push({
            businessName: reviewData.businessName,
            matchType: businessMatch.matchType,
            confidence: businessMatch.confidence,
          });

        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to import review for ${reviewData.businessName}: ${error}`);
        }
      }

      // Update import batch with final results
      await ctx.db.patch(batchId, {
        status: "completed",
        completedAt: Date.now(),
        results: {
          created: results.successful,
          updated: 0, // Reviews are always created, not updated
          failed: results.failed,
          duplicates: results.duplicates + results.skipped,
        },
        errors: results.errors.length > 0 ? results.errors : undefined,
      });

      console.log(`Import batch ${batchId} completed: ${results.successful} successful, ${results.failed} failed`);

      return results;
    } catch (error) {
      // Mark batch as failed
      await ctx.db.patch(batchId, {
        status: "failed",
        completedAt: Date.now(),
        errors: [String(error)],
      });
      throw new Error(`Batch review import failed: ${error}`);
    }
  },
});

// Helper function to find matching business
async function findBusinessMatch(reviewData: ReviewData, businesses: Doc<"businesses">[]): Promise<BusinessMatch | null> {
  // Strategy 1: Exact match by Google Place ID (highest priority)
  if (reviewData.businessPlaceId) {
    const placeMatch = businesses.find(b => b.placeId === reviewData.businessPlaceId);
    if (placeMatch) {
      return {
        businessId: placeMatch._id,
        confidence: 1.0,
        matchType: 'exact'
      };
    }
  }

  // Strategy 2: Exact match by business ID if provided
  if (reviewData.businessId) {
    const business = businesses.find(b => b._id === reviewData.businessId);
    if (business) {
      return {
        businessId: business._id,
        confidence: 1.0,
        matchType: 'manual'
      };
    }
  }

  // Strategy 3: Exact match by name + phone
  if (reviewData.businessPhone) {
    const normalizedPhone = normalizePhone(reviewData.businessPhone);
    const exactMatch = businesses.find(b => 
      normalizeBusinessName(b.name) === normalizeBusinessName(reviewData.businessName) &&
      normalizePhone(b.phone) === normalizedPhone
    );
    if (exactMatch) {
      return {
        businessId: exactMatch._id,
        confidence: 0.95,
        matchType: 'exact'
      };
    }
  }

  // Strategy 4: Fuzzy match by name + city
  const fuzzyMatches = businesses
    .map(business => ({
      business,
      similarity: calculateStringSimilarity(
        normalizeBusinessName(business.name),
        normalizeBusinessName(reviewData.businessName)
      )
    }))
    .filter(match => match.similarity > 0.85)
    .sort((a, b) => b.similarity - a.similarity);

  if (fuzzyMatches.length > 0) {
    return {
      businessId: fuzzyMatches[0].business._id,
      confidence: fuzzyMatches[0].similarity,
      matchType: 'fuzzy'
    };
  }

  // Strategy 5: Address match if available
  if (reviewData.businessAddress) {
    const addressMatch = businesses.find(b =>
      normalizeAddress(b.address).includes(normalizeAddress(reviewData.businessAddress!)) ||
      normalizeAddress(reviewData.businessAddress!).includes(normalizeAddress(b.address))
    );
    if (addressMatch) {
      return {
        businessId: addressMatch._id,
        confidence: 0.8,
        matchType: 'address'
      };
    }
  }

  return null;
}

// Helper function to check for similar reviews (content-based deduplication)
async function findSimilarReview(ctx: any, businessId: Id<"businesses">, comment: string, userName: string): Promise<Doc<"reviews"> | null> {
  const existingReviews = await ctx.db
    .query("reviews")
    .withIndex("by_business", (q: any) => q.eq("businessId", businessId))
    .collect();

  for (const review of existingReviews) {
    // Check for same user and similar content
    if (review.userName.toLowerCase() === userName.toLowerCase()) {
      const similarity = calculateStringSimilarity(
        review.comment.toLowerCase(),
        comment.toLowerCase()
      );
      if (similarity > 0.9) {
        return review;
      }
    }
  }

  return null;
}

// Helper function to get review limit based on plan tier
function getReviewLimitForTier(planTier: string): number {
  switch (planTier) {
    case 'free': return 15;
    case 'starter': return 25;
    case 'pro': return 40;
    case 'power': return 100;
    default: return 15;
  }
}

// Helper function to update business review statistics
async function updateBusinessReviewStats(ctx: any, businessId: Id<"businesses">): Promise<void> {
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_business", (q: any) => q.eq("businessId", businessId))
    .collect();

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
    : 0;

  await ctx.db.patch(businessId, {
    reviewCount: totalReviews,
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    updatedAt: Date.now(),
  });
}

// Utility functions
function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, ''); // Keep only digits
}

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Query to get review import statistics
export const getReviewImportStats = query({
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").collect();
    
    // Group by source
    const sourceStats: Record<string, number> = {};
    const businessStats: Record<string, number> = {};
    
    for (const review of reviews) {
      // Source stats
      sourceStats[review.source] = (sourceStats[review.source] || 0) + 1;
      
      // Business stats
      const business = await ctx.db.get(review.businessId);
      if (business) {
        businessStats[business.name] = (businessStats[business.name] || 0) + 1;
      }
    }

    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    return {
      totalReviews: reviews.length,
      sourceStats,
      businessStats: Object.entries(businessStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Top 10 businesses with most reviews
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
      ratingDistribution,
      averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0,
      verifiedReviews: reviews.filter(r => r.verified).length,
      reviewsWithReplies: reviews.filter(r => r.reply).length,
    };
  },
});

// Query to check for duplicate reviews during preview stage
export const checkDuplicateReviews = query({
  args: {
    reviewId: v.string(),
    userName: v.string(),
    comment: v.string(),
    businessName: v.string(),
  },
  handler: async (ctx, args) => {
    // First check for exact review ID match
    const exactIdMatch = await ctx.db
      .query("reviews")
      .withIndex("by_review_id", (q) => q.eq("reviewId", args.reviewId))
      .first();

    if (exactIdMatch) {
      return {
        isDuplicate: true,
        duplicateType: 'exact_id' as const,
        existingReview: exactIdMatch
      };
    }

    // Find businesses that match the business name
    const allBusinesses = await ctx.db.query("businesses").collect();
    const matchingBusinesses = allBusinesses.filter(business => {
      const normalizedBusinessName = normalizeBusinessName(business.name);
      const normalizedSearchName = normalizeBusinessName(args.businessName);
      return calculateStringSimilarity(normalizedBusinessName, normalizedSearchName) > 0.85;
    });

    // Check for similar content within matching businesses
    for (const business of matchingBusinesses) {
      const businessReviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .collect();

      for (const review of businessReviews) {
        // Check for same user and similar content
        if (review.userName.toLowerCase() === args.userName.toLowerCase()) {
          const commentSimilarity = calculateStringSimilarity(
            review.comment.toLowerCase(),
            args.comment.toLowerCase()
          );
          
          if (commentSimilarity > 0.9) {
            return {
              isDuplicate: true,
              duplicateType: 'similar_content' as const,
              existingReview: review
            };
          }
        }
      }
    }

    return {
      isDuplicate: false,
      duplicateType: null,
      existingReview: null
    };
  },
});

// Query to find businesses without reviews (for targeted scraping)
export const getBusinessesNeedingReviews = query({
  args: {
    limit: v.optional(v.number()),
    planTier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const businesses = await ctx.db.query("businesses").collect();
    
    const businessesNeedingReviews = [];
    
    for (const business of businesses) {
      if (args.planTier && business.planTier !== args.planTier) {
        continue;
      }
      
      const reviewCount = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .collect();
      
      const reviewLimit = getReviewLimitForTier(business.planTier);
      
      if (reviewCount.length < reviewLimit) {
        businessesNeedingReviews.push({
          ...business,
          currentReviews: reviewCount.length,
          reviewLimit,
          reviewsNeeded: reviewLimit - reviewCount.length,
        });
      }
    }
    
    // Sort by priority (highest tier businesses first, then by fewest reviews)
    const tierPriority = { power: 4, pro: 3, starter: 2, free: 1 };
    businessesNeedingReviews.sort((a, b) => {
      const tierDiff = (tierPriority[b.planTier as keyof typeof tierPriority] || 0) - 
                      (tierPriority[a.planTier as keyof typeof tierPriority] || 0);
      if (tierDiff !== 0) return tierDiff;
      return a.currentReviews - b.currentReviews;
    });
    
    return businessesNeedingReviews.slice(0, args.limit || 50);
  },
});