import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Simple review import with no limits or validation
export const simpleImportReviews = mutation({
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
      place_id: v.optional(v.string()),
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
    source: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🚀 SIMPLE IMPORT: Starting import of ${args.reviews.length} reviews`);
    
    // Get all businesses for matching
    const allBusinesses = await ctx.db.query("businesses").collect();
    
    let successful = 0;
    let failed = 0;
    let duplicates = 0;
    const errorSummary: Record<string, number> = {};
    const failureDetails: string[] = [];
    
    for (const reviewData of args.reviews) {
      try {
        // Find business by Place_ID
        const placeId = reviewData.place_id || reviewData.businessPlaceId;
        let business = null;
        
        if (placeId) {
          business = allBusinesses.find(b => b.placeId === placeId);
          
          if (!business) {
            // Enhanced logging for Place_ID failures
            const errorMsg = `No business found for Place_ID: ${placeId} (Business: ${reviewData.businessName})`;
            console.log(`❌ ${errorMsg}`);
            failureDetails.push(errorMsg);
            errorSummary['place_id_not_found'] = (errorSummary['place_id_not_found'] || 0) + 1;
            failed++;
            continue;
          } else {
            // Only log successful matches occasionally to avoid spam
            if (successful % 100 === 0 || failed % 100 === 0) {
              console.log(`✅ Place_ID match: ${placeId} → ${business.name}`);
            }
          }
        } else {
          const errorMsg = `No Place_ID provided for business: ${reviewData.businessName}`;
          console.log(`❌ ${errorMsg}`);
          failureDetails.push(errorMsg);
          errorSummary['missing_place_id'] = (errorSummary['missing_place_id'] || 0) + 1;
          failed++;
          continue;
        }
        
        // Check for duplicates - Step 1: Exact review ID match
        const existingById = await ctx.db
          .query("reviews")
          .withIndex("by_review_id", (q) => q.eq("reviewId", reviewData.reviewId))
          .first();
        
        if (existingById) {
          console.log(`🔄 DUPLICATE ID: ${reviewData.reviewId} already exists`);
          errorSummary['duplicate_id'] = (errorSummary['duplicate_id'] || 0) + 1;
          duplicates++;
          continue;
        }
        
        // Check for duplicates - Step 2: Same user + same business + similar content
        const businessReviews = await ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", business._id))
          .collect();
        
        const similarReview = businessReviews.find(r => 
          r.userName.toLowerCase() === reviewData.userName.toLowerCase() &&
          r.comment.toLowerCase().trim() === reviewData.comment.toLowerCase().trim()
        );
        
        if (similarReview) {
          console.log(`🔄 DUPLICATE CONTENT: Similar review from ${reviewData.userName} in ${reviewData.businessName}`);
          errorSummary['duplicate_content'] = (errorSummary['duplicate_content'] || 0) + 1;
          duplicates++;
          continue;
        }
        
        // Insert review - no duplicates found
        await ctx.db.insert("reviews", {
          businessId: business._id,
          reviewId: reviewData.reviewId,
          userName: reviewData.userName,
          rating: Math.max(1, Math.min(5, reviewData.rating)),
          comment: reviewData.comment.trim(),
          verified: false,
          helpful: 0, // Required field
          source: "manual", // Fixed: use a valid source type instead of args.source
          createdAt: Date.now(),
        });
        
        successful++;
        if (successful % 100 === 0) {
          console.log(`✅ Imported ${successful} reviews so far...`);
        }
        
      } catch (error) {
        const errorMsg = `Database insertion error for ${reviewData.businessName}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        failureDetails.push(errorMsg);
        errorSummary['database_error'] = (errorSummary['database_error'] || 0) + 1;
        failed++;
      }
    }
    
    // Enhanced final summary with error breakdown
    console.log(`🎉 SIMPLE IMPORT COMPLETE: ${successful} successful, ${failed} failed, ${duplicates} duplicates`);
    console.log(`📊 ERROR BREAKDOWN:`, JSON.stringify(errorSummary, null, 2));
    
    // Log first 10 failure details for debugging
    if (failureDetails.length > 0) {
      console.log(`🔍 SAMPLE FAILURES (first 10):`);
      failureDetails.slice(0, 10).forEach((detail, index) => {
        console.log(`${index + 1}. ${detail}`);
      });
      if (failureDetails.length > 10) {
        console.log(`... and ${failureDetails.length - 10} more failures`);
      }
    }
    
    // Also log to ensure it's visible
    console.error(`🚨 IMPORT SUMMARY - Success: ${successful}, Failed: ${failed}, Duplicates: ${duplicates}`);
    console.error(`🚨 ERROR CATEGORIES:`, errorSummary);
    
    // Create a simple result object
    const result = {
      successful,
      failed,
      skipped: 0,
      duplicates,
    };
    
    console.log(`📊 Final import result:`, result);
    return result;
  },
});