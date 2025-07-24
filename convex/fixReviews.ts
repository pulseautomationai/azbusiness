import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// GEOscraper API configuration
const GEOSCRAPER_API_URL = "https://api.geoscraper.net/google/map/review";
const GEOSCRAPER_TOKEN = "gescrp_21e7bb38351f88784acefdd1d9cef20f";

// Fix reviews for a specific business
export const fixBusinessReviews = action({
  args: {
    businessId: v.id("businesses"),
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🔧 Fixing reviews for business ${args.businessId}`);
    
    try {
      // Fetch fresh reviews from GEOscraper
      const response = await fetch(GEOSCRAPER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Berserker-Token": GEOSCRAPER_TOKEN,
        },
        body: JSON.stringify({
          data_id: args.placeId,
          sort_by: "newest",
          hl: "en",
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const geoReviews = await response.json();
      
      if (!Array.isArray(geoReviews) || geoReviews.length === 0) {
        return { message: "No reviews found" };
      }

      console.log(`📥 Found ${geoReviews.length} reviews from GEOscraper`);
      
      // Get existing reviews from database
      const existingReviews = await ctx.runQuery(api.businesses.getBusinessReviews, {
        businessId: args.businessId,
      });
      
      console.log(`📊 Found ${existingReviews.length} existing reviews in database`);
      
      // Create a map of review IDs to existing reviews
      const existingReviewMap = new Map(
        existingReviews.map((r: any) => [r.reviewId, r])
      );
      
      let updated = 0;
      let created = 0;
      
      // Process each GEOscraper review
      for (const geoReview of geoReviews) {
        const reviewId = geoReview.review_id;
        const existingReview = existingReviewMap.get(reviewId);
        
        // Parse the date properly
        let createdAt: number;
        if (geoReview.publishedAtDate_timestamp) {
          // GEOscraper timestamps are in microseconds, convert to milliseconds
          createdAt = Math.floor(geoReview.publishedAtDate_timestamp / 1000);
        } else {
          // Fallback to current time for relative dates
          createdAt = Date.now();
        }
        
        const reviewData = {
          userName: geoReview.user?.name || "Anonymous",
          rating: geoReview.rating || 0,
          comment: geoReview.snippet || "",
          authorPhotoUrl: geoReview.user?.thumbnail,
          createdAt,
          originalCreateTime: geoReview.publishedAtDate || geoReview.date,
          sourceUrl: geoReview.user?.link,
          reply: geoReview.owner_response?.owner_response_text ? {
            text: geoReview.owner_response.owner_response_text,
            createdAt: geoReview.owner_response.owner_response_date_timestamp 
              ? Math.floor(geoReview.owner_response.owner_response_date_timestamp / 1000)
              : Date.now(),
            authorName: "Business Owner",
          } : undefined,
        };
        
        if (existingReview) {
          // Update existing review
          await ctx.runMutation(api.fixReviews.updateReview, {
            reviewId: (existingReview as any)._id,
            ...reviewData,
          });
          updated++;
          console.log(`✅ Updated review from ${(existingReview as any).userName} to ${reviewData.userName}`);
        } else {
          // Create new review
          await ctx.runMutation(api.fixReviews.createReview, {
            businessId: args.businessId,
            reviewId,
            ...reviewData,
            verified: true,
            helpful: 0,
            source: "gmb_api",
            syncedAt: Date.now(),
          });
          created++;
          console.log(`🆕 Created new review from ${reviewData.userName}`);
        }
      }
      
      console.log(`\n✅ Fix complete: Updated ${updated}, Created ${created}`);
      
      return {
        success: true,
        updated,
        created,
        total: geoReviews.length,
      };
    } catch (error: any) {
      console.error(`❌ Error fixing reviews:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Mutation to update an existing review
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    authorPhotoUrl: v.optional(v.string()),
    createdAt: v.number(),
    originalCreateTime: v.string(),
    sourceUrl: v.optional(v.string()),
    reply: v.optional(v.object({
      text: v.string(),
      createdAt: v.number(),
      authorName: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { reviewId, ...updateData } = args;
    await ctx.db.patch(reviewId, updateData);
  },
});

// Mutation to create a new review
export const createReview = mutation({
  args: {
    businessId: v.id("businesses"),
    reviewId: v.string(),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    authorPhotoUrl: v.optional(v.string()),
    createdAt: v.number(),
    originalCreateTime: v.string(),
    sourceUrl: v.optional(v.string()),
    reply: v.optional(v.object({
      text: v.string(),
      createdAt: v.number(),
      authorName: v.string(),
    })),
    verified: v.boolean(),
    helpful: v.number(),
    source: v.string(),
    syncedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reviews", args as any);
  },
});

// Fix all businesses with reviews
export const fixAllBusinessReviews = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log(`🔧 Starting to fix all business reviews...`);
    
    // Get all businesses with reviews
    const businesses: any[] = await ctx.runQuery(api.businesses.getBusinesses, {});
    const businessesWithReviews: any[] = businesses.filter((b: any) => b.reviewCount > 0 && b.placeId);
    
    console.log(`📊 Found ${businessesWithReviews.length} businesses with reviews`);
    
    const results = [];
    
    // Process businesses in batches to avoid overloading
    for (let i = 0; i < businessesWithReviews.length; i++) {
      const business = businessesWithReviews[i];
      console.log(`\n🏢 Processing ${i + 1}/${businessesWithReviews.length}: ${business.name}`);
      
      try {
        const result: any = await ctx.runAction(api.fixReviews.fixBusinessReviews, {
          businessId: business._id,
          placeId: business.placeId,
        });
        
        results.push({
          businessName: business.name,
          ...result,
        });
        
        // Small delay between businesses
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`❌ Error fixing ${business.name}:`, error.message);
        results.push({
          businessName: business.name,
          success: false,
          error: error.message,
        });
      }
    }
    
    // Summary
    const successful = results.filter((r: any) => r.success).length;
    const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
    const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Successfully processed: ${successful}/${businessesWithReviews.length} businesses`);
    console.log(`📝 Total reviews updated: ${totalUpdated}`);
    console.log(`🆕 Total reviews created: ${totalCreated}`);
    
    return {
      totalBusinesses: businessesWithReviews.length,
      successful,
      totalUpdated,
      totalCreated,
      results,
    };
  },
});