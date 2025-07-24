import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Fixed duplicate checking function that matches the actual import logic
 */
export const checkDuplicateReviewsFixed = query({
  args: {
    reviews: v.array(v.object({
      reviewId: v.string(),
      userName: v.string(),
      comment: v.string(),
      businessName: v.string(),
      businessPhone: v.optional(v.string()),
      businessAddress: v.optional(v.string()),
      businessId: v.optional(v.string()),
      businessPlaceId: v.optional(v.string()),
      placeId: v.optional(v.string()), // Support both field names
      rating: v.number(),
    })),
    source: v.union(
      v.literal("gmb_import"),
      v.literal("yelp_import"),
      v.literal("facebook_import"),
      v.literal("manual")
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      totalReviews: args.reviews.length,
      duplicates: 0,
      businessMatchFailures: 0,
      wouldImport: 0,
      duplicateDetails: [] as Array<{
        reviewId: string,
        businessName: string,
        duplicateType: string,
        reason: string
      }>
    };

    for (const reviewData of args.reviews) {
      // Step 1: Find business match (using same logic as import)
      const businessMatch = await findBusinessMatchForDuplicateCheck(ctx, reviewData);
      
      if (!businessMatch) {
        results.businessMatchFailures++;
        results.duplicateDetails.push({
          reviewId: reviewData.reviewId,
          businessName: reviewData.businessName,
          duplicateType: 'business_not_found',
          reason: 'Could not match to any business in database'
        });
        continue;
      }

      // Step 2: Check for exact review ID duplicate (same as import)
      const existingReview = await ctx.db
        .query("reviews")
        .withIndex("by_review_id", (q) => q.eq("reviewId", reviewData.reviewId))
        .first();

      if (existingReview) {
        results.duplicates++;
        results.duplicateDetails.push({
          reviewId: reviewData.reviewId,
          businessName: reviewData.businessName,
          duplicateType: 'exact_id',
          reason: `Review ID already exists in database`
        });
        continue;
      }

      // Step 3: Check for content similarity (same as import)
      const similarReview = await findSimilarReviewFixed(ctx, businessMatch.businessId, reviewData.comment, reviewData.userName);
      if (similarReview) {
        results.duplicates++;
        results.duplicateDetails.push({
          reviewId: reviewData.reviewId,
          businessName: reviewData.businessName,
          duplicateType: 'similar_content',
          reason: `Similar review found from same user (90%+ match)`
        });
        continue;
      }

      // Would be imported
      results.wouldImport++;
    }

    return results;
  },
});

// Helper function that matches the business matching logic used in import
async function findBusinessMatchForDuplicateCheck(ctx: any, reviewData: any): Promise<{ businessId: Id<"businesses">, confidence: number } | null> {
  const businesses = await ctx.db.query("businesses").collect();
  
  // Strategy 1: Google Place ID match (HIGHEST PRIORITY)
  const placeId = reviewData.placeId || reviewData.businessPlaceId;
  if (placeId) {
    console.log(`🎯 Priority #1: Looking for place_id match: ${placeId}`);
    const placeIdMatch = businesses.find((b: any) => b.placeId === placeId);
    if (placeIdMatch) {
      console.log(`✅ Found exact place_id match: ${placeIdMatch.name} (${placeIdMatch._id})`);
      return { businessId: placeIdMatch._id, confidence: 1.0 };
    } else {
      console.log(`❌ No place_id match found for: ${placeId}`);
    }
  }

  // Strategy 2: Exact business ID match
  if (reviewData.businessId) {
    console.log(`🔍 Strategy #2: Looking for businessId match: ${reviewData.businessId}`);
    const business = businesses.find((b: any) => b._id === reviewData.businessId);
    if (business) {
      console.log(`✅ Found businessId match: ${business.name}`);
      return { businessId: business._id, confidence: 1.0 };
    }
  }

  // Strategy 3: Phone number match
  if (reviewData.businessPhone) {
    const phoneMatch = businesses.find((b: any) => normalizePhone(b.phone) === normalizePhone(reviewData.businessPhone));
    if (phoneMatch) {
      return { businessId: phoneMatch._id, confidence: 0.95 };
    }
  }

  // Strategy 4: Fuzzy name match (exactly like import)
  const fuzzyMatches = businesses
    .map((business: any) => ({
      business,
      similarity: calculateStringSimilarity(
        normalizeBusinessName(business.name),
        normalizeBusinessName(reviewData.businessName)
      )
    }))
    .filter((match: any) => match.similarity > 0.85)
    .sort((a: any, b: any) => b.similarity - a.similarity);

  if (fuzzyMatches.length > 0) {
    return {
      businessId: fuzzyMatches[0].business._id,
      confidence: fuzzyMatches[0].similarity
    };
  }

  return null;
}

// Helper function that matches the similarity checking in import
async function findSimilarReviewFixed(ctx: any, businessId: Id<"businesses">, comment: string, userName: string): Promise<Doc<"reviews"> | null> {
  const existingReviews = await ctx.db
    .query("reviews")
    .withIndex("by_business", (q: any) => q.eq("businessId", businessId))
    .collect();

  for (const review of existingReviews) {
    // Check for same user and similar content (exactly like import)
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

// Helper functions (same as used in import)
function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(llc|inc|corp|co|ltd|company|business|services?|group|enterprises?)\b/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
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

/**
 * Diagnostic function to analyze why duplicate detection failed
 */
export const diagnoseDuplicateDetection = query({
  args: {
    reviewId: v.string(),
    businessName: v.string(),
    placeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`🔍 Diagnosing review: ${args.reviewId} for business: ${args.businessName}`);
    if (args.placeId) {
      console.log(`🎯 Checking place_id: ${args.placeId}`);
    }
    
    // Check for place_id match first
    let placeIdMatch = null;
    if (args.placeId) {
      const allBusinesses = await ctx.db.query("businesses").collect();
      placeIdMatch = allBusinesses.find(b => b.placeId === args.placeId);
      if (placeIdMatch) {
        console.log(`✅ Found place_id match: ${placeIdMatch.name} (${placeIdMatch._id})`);
      } else {
        console.log(`❌ No place_id match found for: ${args.placeId}`);
      }
    }
    
    // Check if review exists by ID
    const existingById = await ctx.db
      .query("reviews")
      .withIndex("by_review_id", (q) => q.eq("reviewId", args.reviewId))
      .first();
    
    // Get all businesses and their matches
    const businesses = await ctx.db.query("businesses").collect();
    const businessMatches = businesses
      .map(business => ({
        id: business._id,
        name: business.name,
        normalizedName: normalizeBusinessName(business.name),
        similarity: calculateStringSimilarity(
          normalizeBusinessName(business.name),
          normalizeBusinessName(args.businessName)
        )
      }))
      .filter(match => match.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity);
    
    // Count reviews for top matches
    const businessStats = await Promise.all(
      businessMatches.slice(0, 5).map(async (match) => {
        const reviewCount = await ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", match.id))
          .collect();
        
        return {
          ...match,
          reviewCount: reviewCount.length,
          hasReviewId: reviewCount.some(r => r.reviewId === args.reviewId)
        };
      })
    );
    
    return {
      placeId: args.placeId,
      placeIdMatch: placeIdMatch ? {
        businessId: placeIdMatch._id,
        businessName: placeIdMatch.name,
        placeId: placeIdMatch.placeId
      } : null,
      reviewExistsById: !!existingById,
      existingReviewBusiness: existingById ? {
        businessId: existingById.businessId,
        businessName: businesses.find(b => b._id === existingById.businessId)?.name
      } : null,
      businessMatches: businessStats,
      searchBusinessName: args.businessName,
      normalizedSearchName: normalizeBusinessName(args.businessName),
    };
  },
});

/**
 * Test function to verify place_id priority matching
 */
export const testPlaceIdMatching = query({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🧪 Testing place_id matching for: ${args.placeId}`);
    
    const businesses = await ctx.db.query("businesses").collect();
    
    // Find exact place_id match
    const exactMatch = businesses.find(b => b.placeId === args.placeId);
    
    // Find businesses with place_ids (for debugging)
    const businessesWithPlaceIds = businesses
      .filter(b => b.placeId)
      .map(b => ({
        id: b._id,
        name: b.name,
        placeId: b.placeId,
        isMatch: b.placeId === args.placeId
      }));
    
    return {
      searchPlaceId: args.placeId,
      exactMatch: exactMatch ? {
        businessId: exactMatch._id,
        businessName: exactMatch.name,
        placeId: exactMatch.placeId
      } : null,
      totalBusinessesWithPlaceIds: businessesWithPlaceIds.length,
      businessesWithPlaceIds: businessesWithPlaceIds.slice(0, 10), // Show first 10 for debugging
    };
  },
});