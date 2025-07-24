import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Diagnostic import to test with sample data
 */
export const testImportDiagnostic = mutation({
  args: {
    sampleReviews: v.array(v.object({
      reviewId: v.string(),
      businessName: v.string(),
      userName: v.string(),
      comment: v.string(),
      rating: v.number(),
      placeId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    console.log(`\n🔬 DIAGNOSTIC IMPORT TEST`);
    console.log(`📝 Testing ${args.sampleReviews.length} sample reviews`);
    
    // Get all businesses for matching
    const allBusinesses = await ctx.db.query("businesses").collect();
    console.log(`📊 Total businesses in database: ${allBusinesses.length}`);
    console.log(`📊 Businesses with place_id: ${allBusinesses.filter(b => b.placeId).length}`);
    
    const results = {
      totalReviews: args.sampleReviews.length,
      businessMatches: 0,
      businessMatchFailures: 0,
      duplicateIds: 0,
      duplicateContent: 0,
      readyToImport: 0,
      details: [] as any[]
    };
    
    for (const review of args.sampleReviews) {
      console.log(`\n🔍 Testing review: ${review.reviewId}`);
      console.log(`🏢 Business: ${review.businessName}`);
      console.log(`📍 Place ID: ${review.placeId || 'None'}`);
      
      const detail = {
        reviewId: review.reviewId,
        businessName: review.businessName,
        placeId: review.placeId,
        businessMatch: null as any,
        duplicateCheck: null as any,
        status: "unknown"
      };
      
      // Test business matching
      let businessMatch = null;
      
      if (review.placeId) {
        businessMatch = allBusinesses.find(b => b.placeId === review.placeId);
        if (businessMatch) {
          console.log(`✅ PLACE_ID MATCH: ${businessMatch.name} (${businessMatch._id})`);
          detail.businessMatch = {
            type: "place_id",
            businessId: businessMatch._id,
            businessName: businessMatch.name
          };
          results.businessMatches++;
        } else {
          console.log(`❌ No place_id match found`);
          console.log(`📋 Available place_ids: ${allBusinesses.filter(b => b.placeId).map(b => b.placeId).slice(0, 3).join(', ')}...`);
        }
      }
      
      // Try name matching if no place_id match
      if (!businessMatch) {
        const normalizeBusinessName = (name: string) => {
          return name
            .toLowerCase()
            .replace(/\b(llc|inc|corp|co|ltd|company|business|services?|group|enterprises?)\b/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };
        
        const calculateStringSimilarity = (str1: string, str2: string): number => {
          const longer = str1.length > str2.length ? str1 : str2;
          const shorter = str1.length > str2.length ? str2 : str1;
          if (longer.length === 0) return 1.0;
          
          // Simple similarity check
          const normalizedSearch = normalizeBusinessName(str1);
          const normalizedBusiness = normalizeBusinessName(str2);
          
          if (normalizedSearch === normalizedBusiness) return 1.0;
          if (normalizedBusiness.includes(normalizedSearch) || normalizedSearch.includes(normalizedBusiness)) return 0.9;
          
          return 0.5; // Simplified for diagnostic
        };
        
        const fuzzyMatches = allBusinesses
          .map(business => ({
            business,
            similarity: calculateStringSimilarity(review.businessName, business.name)
          }))
          .filter(match => match.similarity > 0.85)
          .sort((a, b) => b.similarity - a.similarity);
          
        if (fuzzyMatches.length > 0) {
          businessMatch = fuzzyMatches[0].business;
          console.log(`✅ NAME MATCH: ${businessMatch.name} (similarity: ${fuzzyMatches[0].similarity})`);
          detail.businessMatch = {
            type: "name_fuzzy",
            businessId: businessMatch._id,
            businessName: businessMatch.name,
            similarity: fuzzyMatches[0].similarity
          };
          results.businessMatches++;
        } else {
          console.log(`❌ No business match found`);
          results.businessMatchFailures++;
          detail.status = "no_business_match";
          detail.businessMatch = { type: "none" };
        }
      }
      
      if (businessMatch) {
        // Test duplicate detection
        console.log(`🔍 Testing duplicate detection...`);
        
        // Check exact review ID
        const existingById = await ctx.db
          .query("reviews")
          .withIndex("by_review_id", (q) => q.eq("reviewId", review.reviewId))
          .first();
          
        if (existingById) {
          console.log(`❌ DUPLICATE ID: ${review.reviewId} already exists`);
          results.duplicateIds++;
          detail.duplicateCheck = { type: "exact_id", existingId: existingById._id };
          detail.status = "duplicate_id";
        } else {
          console.log(`✅ Unique review ID`);
          
          // Check content similarity
          const businessReviews = await ctx.db
            .query("reviews")
            .withIndex("by_business", (q) => q.eq("businessId", businessMatch._id))
            .collect();
            
          const similarReview = businessReviews.find(r => 
            r.userName.toLowerCase() === review.userName.toLowerCase() &&
            r.comment.toLowerCase() === review.comment.toLowerCase()
          );
          
          if (similarReview) {
            console.log(`❌ DUPLICATE CONTENT: Similar review from ${review.userName}`);
            results.duplicateContent++;
            detail.duplicateCheck = { type: "similar_content", existingId: similarReview._id };
            detail.status = "duplicate_content";
          } else {
            console.log(`✅ READY TO IMPORT`);
            results.readyToImport++;
            detail.duplicateCheck = { type: "unique" };
            detail.status = "ready";
          }
        }
      }
      
      results.details.push(detail);
    }
    
    console.log(`\n📊 DIAGNOSTIC RESULTS:`);
    console.log(`✅ Business matches: ${results.businessMatches}`);
    console.log(`❌ Business match failures: ${results.businessMatchFailures}`);
    console.log(`🔄 Duplicate IDs: ${results.duplicateIds}`);
    console.log(`🔄 Duplicate content: ${results.duplicateContent}`);
    console.log(`🎯 Ready to import: ${results.readyToImport}`);
    
    return results;
  },
});

/**
 * Quick test with hardcoded sample data
 */
export const quickDiagnosticTest = mutation({
  handler: async (ctx): Promise<any> => {
    return await ctx.runMutation(api.diagnosticImport.testImportDiagnostic, {
      sampleReviews: [
        {
          reviewId: "test_review_1",
          businessName: "Test Business HVAC",
          userName: "John Smith",
          comment: "Great service, very professional!",
          rating: 5,
          placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
        },
        {
          reviewId: "test_review_2", 
          businessName: "Another Test Business",
          userName: "Jane Doe",
          comment: "Good work but expensive",
          rating: 4
        }
      ]
    });
  },
});