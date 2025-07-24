import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Ultra-simple review import with clear result communication
export const ultraSimpleImport = mutation({
  args: {
    reviews: v.array(v.object({
      reviewId: v.string(),
      rating: v.number(),
      comment: v.string(),
      userName: v.string(),
      businessName: v.string(),
      place_id: v.optional(v.string()),
      businessPlaceId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    console.log(`\n🚀 STARTING IMPORT: ${args.reviews.length} reviews`);
    console.log(`📍 Using ReviewID for duplicate detection`);
    console.log(`🏢 Using PlaceID for business matching`);
    
    // Single source of truth for results
    const results = {
      totalProcessed: args.reviews.length,
      newReviewsAdded: 0,
      existingReviewsSkipped: 0,
      businessNotFound: 0,
      errors: 0,
      // Clear summary messages
      messages: [] as string[],
    };
    
    // Get all businesses once for efficient PlaceID matching
    const businesses = await ctx.db.query("businesses").collect();
    const businessByPlaceId = new Map(
      businesses
        .filter(b => b.placeId)
        .map(b => [b.placeId, b])
    );
    console.log(`📊 Found ${businessByPlaceId.size} businesses with PlaceIDs`);
    
    // Process each review
    for (const review of args.reviews) {
      const placeId = review.place_id || review.businessPlaceId;
      
      // Step 1: Find business
      if (!placeId || !businessByPlaceId.has(placeId)) {
        results.businessNotFound++;
        continue;
      }
      
      const business = businessByPlaceId.get(placeId)!;
      
      // Step 2: Check if review already exists by ReviewID
      try {
        const existingReview = await ctx.db
          .query("reviews")
          .withIndex("by_review_id", q => q.eq("reviewId", review.reviewId))
          .first();
          
        if (existingReview) {
          results.existingReviewsSkipped++;
          // Only log first few duplicates to avoid spam
          if (results.existingReviewsSkipped <= 5) {
            console.log(`ℹ️ Duplicate: Review ${review.reviewId} already exists for ${business.name}`);
          }
          continue;
        }
        
        // Step 3: Insert new review
        await ctx.db.insert("reviews", {
          businessId: business._id,
          reviewId: review.reviewId,
          userName: review.userName,
          rating: Math.max(1, Math.min(5, review.rating)),
          comment: review.comment.trim(),
          verified: false,
          helpful: 0,
          source: "manual",
          createdAt: Date.now(),
        });
        
        results.newReviewsAdded++;
        
        // Log progress every 100 reviews
        if (results.newReviewsAdded % 100 === 0) {
          console.log(`✅ Progress: ${results.newReviewsAdded} new reviews added`);
        }
        
      } catch (error: any) {
        console.error(`Error processing review ${review.reviewId}:`, error);
        console.error(`Review details - Business: ${business?.name}, User: ${review.userName}`);
        console.error(`Error message:`, error.message || error);
        results.errors++;
        
        // Add specific error to messages if it's the first few
        if (results.errors <= 5) {
          results.messages.push(`❌ Error: ${error.message || error}`);
        }
      }
    }
    
    // Generate clear summary messages
    if (results.newReviewsAdded > 0) {
      results.messages.push(`✅ Successfully added ${results.newReviewsAdded} new reviews`);
    }
    
    if (results.existingReviewsSkipped > 0) {
      results.messages.push(`ℹ️ Skipped ${results.existingReviewsSkipped} reviews (already exist)`);
    }
    
    if (results.businessNotFound > 0) {
      results.messages.push(`⚠️ ${results.businessNotFound} reviews couldn't find matching businesses`);
    }
    
    if (results.errors > 0) {
      results.messages.push(`❌ ${results.errors} reviews failed due to errors`);
    }
    
    // Clear console summary
    console.log("\n📊 IMPORT COMPLETE:");
    console.log(`✅ New Reviews Added: ${results.newReviewsAdded}`);
    console.log(`ℹ️ Duplicates Skipped (Already Exist): ${results.existingReviewsSkipped}`);
    console.log(`⚠️ Reviews Without Matching Business: ${results.businessNotFound}`);
    console.log(`❌ Import Errors: ${results.errors}`);
    console.log(`📋 Total Processed: ${results.totalProcessed}`);
    console.log(`\n📝 Summary: ${results.newReviewsAdded} new, ${results.existingReviewsSkipped} duplicates, ${results.businessNotFound + results.errors} skipped`);
    
    return results;
  },
});