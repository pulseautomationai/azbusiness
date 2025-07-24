import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Optimized review import that handles large batches efficiently
export const importReviewBatch = mutation({
  args: {
    reviews: v.array(v.object({
      reviewId: v.string(),
      rating: v.number(),
      comment: v.string(),
      userName: v.string(),
      businessName: v.string(),
      place_id: v.optional(v.string()),
      businessPlaceId: v.optional(v.string()),
      businessId: v.optional(v.id("businesses")), // Pre-matched business ID for GEOscraper
      authorPhotoUrl: v.optional(v.string()),
      verified: v.optional(v.boolean()),
      helpful: v.optional(v.number()),
      source: v.optional(v.string()),
      sourceUrl: v.optional(v.string()),
      originalCreateTime: v.optional(v.string()),
      reply: v.optional(v.object({
        text: v.string(),
        createdAt: v.number(),
        authorName: v.string(),
      })),
    })),
    skipDuplicateCheck: v.optional(v.boolean()), // For faster imports when you know there are no duplicates
  },
  handler: async (ctx, args) => {
    const batchSize = args.reviews.length;
    console.log(`\n🚀 Processing batch of ${batchSize} reviews`);
    
    const results = {
      totalProcessed: batchSize,
      newReviewsAdded: 0,
      existingReviewsSkipped: 0,
      businessNotFound: 0,
      errors: 0,
      errorMessages: [] as string[],
      created: 0, // Alias for compatibility
      duplicates: 0, // Alias for compatibility
      failed: 0, // Alias for compatibility
    };
    
    // Build a set of PlaceIDs we need to look up
    const placeIdsNeeded = new Set<string>();
    args.reviews.forEach(review => {
      const placeId = review.place_id || review.businessPlaceId;
      if (placeId) placeIdsNeeded.add(placeId);
    });
    
    // Only fetch businesses that match our PlaceIDs
    const businessMap = new Map();
    for (const placeId of placeIdsNeeded) {
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_placeId", q => q.eq("placeId", placeId))
        .first();
      
      if (business) {
        businessMap.set(placeId, business);
      }
    }
    
    console.log(`📊 Found ${businessMap.size} matching businesses`);
    
    // Build a set of reviewIds for duplicate checking (if not skipped)
    const reviewIdsToCheck = args.skipDuplicateCheck ? new Set<string>() : 
      new Set(args.reviews.map(r => r.reviewId));
    
    // Check for existing reviews in bulk (only if not skipping)
    const existingReviewIds = new Set<string>();
    if (!args.skipDuplicateCheck && reviewIdsToCheck.size > 0) {
      // Check in smaller chunks to avoid reading too many documents
      const reviewIdArray = Array.from(reviewIdsToCheck);
      const chunkSize = 100; // Check 100 at a time
      
      for (let i = 0; i < reviewIdArray.length; i += chunkSize) {
        const chunk = reviewIdArray.slice(i, i + chunkSize);
        
        // Check each reviewId in the chunk
        for (const reviewId of chunk) {
          const existing = await ctx.db
            .query("reviews")
            .withIndex("by_review_id", q => q.eq("reviewId", reviewId))
            .first();
          
          if (existing) {
            existingReviewIds.add(reviewId);
          }
        }
      }
    }
    
    console.log(`🔍 Found ${existingReviewIds.size} existing reviews to skip`);
    
    // Process reviews
    for (const review of args.reviews) {
      try {
        // Debug log the first review
        if (results.totalProcessed === 0) {
          console.log(`🔍 First review data being imported:`, {
            reviewId: review.reviewId,
            userName: review.userName,
            comment: review.comment?.substring(0, 50),
            rating: review.rating,
            originalCreateTime: review.originalCreateTime,
          });
        }
        
        let businessId: any;
        
        // If businessId is pre-matched (from GEOscraper), use it directly
        if (review.businessId) {
          businessId = review.businessId;
        } else {
          // Otherwise, look up by Place ID
          const placeId = review.place_id || review.businessPlaceId;
          
          // Check if business exists
          if (!placeId || !businessMap.has(placeId)) {
            results.businessNotFound++;
            continue;
          }
          
          const business = businessMap.get(placeId)!;
          businessId = business._id;
        }
        
        // Check if review already exists
        if (existingReviewIds.has(review.reviewId)) {
          results.existingReviewsSkipped++;
          continue;
        }
        
        // Insert the review with all available fields
        await ctx.db.insert("reviews", {
          businessId,
          reviewId: review.reviewId,
          userName: review.userName,
          authorPhotoUrl: review.authorPhotoUrl,
          rating: Math.max(1, Math.min(5, review.rating)),
          comment: review.comment.trim(),
          verified: review.verified ?? false,
          helpful: review.helpful ?? 0,
          source: (review.source || "manual") as any,
          sourceUrl: review.sourceUrl,
          originalCreateTime: review.originalCreateTime,
          reply: review.reply,
          createdAt: review.originalCreateTime ? 
            new Date(review.originalCreateTime).getTime() : 
            Date.now(),
          syncedAt: Date.now(),
        });
        
        results.newReviewsAdded++;
        
        // Log progress
        if (results.newReviewsAdded % 100 === 0) {
          console.log(`✅ Progress: ${results.newReviewsAdded} reviews added`);
        }
        
      } catch (error: any) {
        results.errors++;
        const errorMsg = `Error with review ${review.reviewId}: ${error.message}`;
        console.error(errorMsg);
        
        if (results.errorMessages.length < 10) {
          results.errorMessages.push(errorMsg);
        }
      }
    }
    
    // Update aliases for compatibility
    results.created = results.newReviewsAdded;
    results.duplicates = results.existingReviewsSkipped;
    results.failed = results.businessNotFound + results.errors;
    
    // Update business review stats for all affected businesses
    if (results.newReviewsAdded > 0) {
      console.log(`\n📊 Updating business review stats...`);
      const affectedBusinessIds = new Set<any>();
      
      // Collect unique business IDs from processed reviews
      for (const review of args.reviews) {
        if (review.businessId) {
          affectedBusinessIds.add(review.businessId);
        } else {
          const placeId = review.place_id || review.businessPlaceId;
          if (placeId && businessMap.has(placeId)) {
            const business = businessMap.get(placeId)!;
            affectedBusinessIds.add(business._id);
          }
        }
      }
      
      // Update stats for each affected business
      for (const businessId of affectedBusinessIds) {
        await updateBusinessReviewStats(ctx, businessId);
      }
      
      console.log(`✅ Updated stats for ${affectedBusinessIds.size} businesses`);
    }
    
    // Summary
    console.log(`\n✅ IMPORT COMPLETE:`);
    console.log(`   - New reviews added: ${results.newReviewsAdded}`);
    console.log(`   - Duplicates skipped: ${results.existingReviewsSkipped}`);
    console.log(`   - Business not found: ${results.businessNotFound}`);
    console.log(`   - Errors: ${results.errors}`);
    
    return results;
  },
});

// Get import statistics
export const getImportStats = query({
  handler: async (ctx) => {
    const allBusinesses = await ctx.db.query("businesses").collect();
    const totalBusinesses = allBusinesses.length;
    
    const allReviews = await ctx.db.query("reviews").collect();
    const totalReviews = allReviews.length;
    
    // Get a sample to check for review distribution
    const businessSample = await ctx.db
      .query("businesses")
      .take(100);
    
    let businessesWithReviews = 0;
    let totalReviewsInSample = 0;
    
    for (const business of businessSample) {
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", q => q.eq("businessId", business._id))
        .collect();
      
      const reviewCount = reviews.length;
      
      if (reviewCount > 0) {
        businessesWithReviews++;
        totalReviewsInSample += reviewCount;
      }
    }
    
    return {
      totalBusinesses,
      totalReviews,
      averageReviewsPerBusiness: totalBusinesses > 0 ? Math.round(totalReviews / totalBusinesses * 10) / 10 : 0,
      sampleStats: {
        businessesChecked: businessSample.length,
        businessesWithReviews,
        percentageWithReviews: businessSample.length > 0 ? 
          Math.round(businessesWithReviews / businessSample.length * 100) : 0,
      },
      limits: {
        maxReadsPerFunction: "~400,000 documents" as const,
        recommendedBatchSize: "500-1000 reviews per import" as const,
        maxFunctionDuration: "1 minute" as const,
      },
    };
  },
});

// Helper function to update business review statistics
async function updateBusinessReviewStats(ctx: any, businessId: any): Promise<void> {
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

// Clear all reviews (for testing)
export const clearAllReviews = mutation({
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").collect();
    let deleted = 0;
    
    for (const review of reviews) {
      await ctx.db.delete(review._id);
      deleted++;
      
      if (deleted % 100 === 0) {
        console.log(`Deleted ${deleted} reviews...`);
      }
    }
    
    return { deleted };
  },
});

// Clear reviews for specific businesses
export const clearReviewsForBusinesses = mutation({
  args: {
    businessIds: v.array(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    let deleted = 0;
    
    for (const businessId of args.businessIds) {
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", q => q.eq("businessId", businessId))
        .collect();
      
      for (const review of reviews) {
        await ctx.db.delete(review._id);
        deleted++;
      }
      
      // Update business stats
      await ctx.db.patch(businessId, {
        reviewCount: 0,
        rating: 0,
        updatedAt: Date.now(),
      });
    }
    
    console.log(`✅ Deleted ${deleted} reviews from ${args.businessIds.length} businesses`);
    return { deleted, businessCount: args.businessIds.length };
  },
});