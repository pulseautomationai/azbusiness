import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// GEOscraper API configuration
const GEOSCRAPER_API_URL = "https://api.geoscraper.net/google/map/review";

// Get token from environment variable
const getGeoScraperToken = () => {
  const token = process.env.GEOSCRAPER_API_TOKEN;
  if (!token) {
    throw new Error("GEOSCRAPER_API_TOKEN environment variable is not set");
  }
  return token;
};

// Helper function for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

// Make API request with retry logic
async function makeGeoScraperRequest(placeId: string, retryCount = 0, ctx?: any, nextPageToken?: string): Promise<any> {
  const startTime = Date.now();
  
  // Minimal logging to prevent overflow
  if (!nextPageToken) {
    console.log(`\n🔍 GEOSCRAPER REQUEST - PlaceId: ${placeId} (first page)`);
  }
  
  try {
    // Record API request metric
    if (ctx) {
      await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
        type: "api_request",
        value: 1,
        metadata: { placeId },
      });
    }
    
    const requestBody: any = {
      data_id: placeId,
      sort_by: "newest",
      hl: "en",
    };
    
    // Add next page token if we're paginating
    if (nextPageToken) {
      requestBody.token = nextPageToken;
    }
    
    const response = await fetch(GEOSCRAPER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Berserker-Token": getGeoScraperToken(),
      },
      body: JSON.stringify(requestBody),
    });

    // Handle specific error codes
    if (!response.ok) {
      const errorText = await response.text();
      const error: any = new Error(`API request failed: ${response.status} - ${errorText}`);
      error.status = response.status;
      error.responseText = errorText;
      throw error;
    }

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response:", responseText);
      throw new Error("Invalid JSON response from API");
    }
    
    // Log the response structure for debugging
    console.log(`📋 Response type: ${typeof data}, Is Array: ${Array.isArray(data)}`);
    if (!Array.isArray(data) && data && typeof data === 'object') {
      console.log(`📋 Response keys: ${Object.keys(data).join(', ')}`);
    }
    
    // Log response details for pagination analysis
    if (Array.isArray(data)) {
      console.log(`📋 Array length: ${data.length}`);
      // Check if last item might be a token (not a review)
      const lastItem = data[data.length - 1];
      if (lastItem && typeof lastItem === 'string') {
        console.log(`📋 Last item might be pagination token: ${lastItem.substring(0, 50)}...`);
      } else if (lastItem && typeof lastItem === 'object' && lastItem.rating) {
        console.log(`📋 Last item is a review (rating: ${lastItem.rating})`);
      }
    }
    
    // Record success and response time metrics
    if (ctx) {
      const responseTime = Date.now() - startTime;
      await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
        type: "api_success",
        value: 1,
        metadata: { placeId, responseTime },
      });
      
      await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
        type: "processing_time",
        value: responseTime,
        metadata: { placeId },
      });
    }
    
    return data;
  } catch (error: any) {
    // Check if we should retry
    if (retryCount < MAX_RETRIES) {
      // Determine retry strategy based on error type
      let shouldRetry = false;
      let delay = BASE_DELAY * Math.pow(2, retryCount); // Exponential backoff

      if (error.status === 429) {
        // Rate limit - wait longer
        shouldRetry = true;
        delay = delay * 2; // Double the delay for rate limits
        console.log(`⚠️ Rate limit hit, waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES}`);
      } else if (error.status >= 500) {
        // Server error - retry with normal backoff
        shouldRetry = true;
        console.log(`⚠️ Server error (${error.status}), waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES}`);
      } else if (error.message?.includes('fetch failed') || error.message?.includes('network')) {
        // Network error - retry immediately
        shouldRetry = true;
        delay = 1000; // Fixed 1 second for network errors
        console.log(`⚠️ Network error, waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES}`);
      } else if (error.status === 404) {
        // Invalid Place ID - don't retry
        console.log(`❌ Invalid Place ID: ${placeId}`);
        throw error;
      }

      if (shouldRetry) {
        await sleep(delay);
        return makeGeoScraperRequest(placeId, retryCount + 1, ctx);
      }
    }

    // Record error metric
    if (ctx) {
      await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
        type: "api_error",
        value: 1,
        metadata: { 
          placeId, 
          errorCode: error.status || "unknown",
          errorMessage: error.message,
          retryCount 
        },
      });
    }

    // Max retries exceeded or non-retryable error
    console.error(`❌ Failed after ${retryCount} retries:`, error.message);
    throw error;
  }
}

// Test single place review fetch
export const testGeoScraperConnection = action({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🚀 Testing GEOscraper API with Place ID: ${args.placeId}`);
    
    try {
      const data = await makeGeoScraperRequest(args.placeId, 0, ctx);
      
      console.log(`✅ Successfully fetched data for ${args.placeId}`);
      
      // Check if response is an array or object with reviews
      let reviews = [];
      
      if (Array.isArray(data)) {
        reviews = data;
      } else if (data && typeof data === 'object') {
        // Check various possible response structures
        if (data.reviews && Array.isArray(data.reviews)) {
          reviews = data.reviews;
        } else if (data.data && Array.isArray(data.data)) {
          reviews = data.data;
        } else if (data.result && Array.isArray(data.result)) {
          reviews = data.result;
        }
      }
      
      console.log(`📊 Response structure:`, {
        isArray: Array.isArray(data),
        totalReviews: reviews.length,
        reviewsPerPage: reviews.length, // This will help us understand pagination
        responseKeys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : null,
        firstReview: reviews[0] ? {
          rating: reviews[0].rating,
          date: reviews[0].date,
          hasText: !!reviews[0].text,
          hasOwnerResponse: !!reviews[0].owner_answer,
        } : null,
      });
      
      // Test transformation on first review
      if (data[0]) {
        console.log(`\n🧪 Testing transformation on first review:`);
        const transformed = transformGeoScraperReview(data[0], "test_business_id");
        console.log(`📝 Transformation result:`, {
          userName: transformed.userName,
          comment: transformed.comment?.substring(0, 50),
          createdAt: transformed.createdAt,
          createdAtDate: transformed.createdAt ? new Date(transformed.createdAt).toISOString() : 'N/A',
        });
      }

      // Log the raw response to understand the structure
      console.log(`\n🔍 RAW RESPONSE INSPECTION:`);
      console.log(`Type: ${typeof data}`);
      console.log(`Is Array: ${Array.isArray(data)}`);
      
      if (Array.isArray(data)) {
        console.log(`Array length: ${data.length}`);
        // Check if the array itself has a token property
        console.log(`Token on array: ${(data as any).token || 'none'}`);
        // Log all properties of the array object
        const arrayProps = Object.getOwnPropertyNames(data).filter(prop => isNaN(Number(prop)));
        if (arrayProps.length > 0) {
          console.log(`Non-numeric array properties: ${arrayProps.join(', ')}`);
        }
      } else if (data && typeof data === 'object') {
        console.log(`Keys: ${Object.keys(data).join(', ')}`);
      }
      
      console.log(`Sample (first 500 chars): ${JSON.stringify(data).substring(0, 500)}`);
      
      return {
        success: true,
        placeId: args.placeId,
        reviewCount: reviews.length,
        reviews: reviews,
        rawResponse: data,
      };
    } catch (error: any) {
      console.error(`❌ Error fetching reviews for ${args.placeId}:`, error);
      return {
        success: false,
        placeId: args.placeId,
        error: error.message,
      };
    }
  },
});

// Test multiple places with concurrent connections
export const testMultiplePlaces = action({
  args: {
    placeIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`🚀 Testing GEOscraper API with ${args.placeIds.length} Place IDs`);
    console.log(`⚡ Using 3 concurrent connections`);
    
    const results = [];
    const maxConcurrent = 3;
    
    // Process in batches of 3 concurrent requests
    for (let i = 0; i < args.placeIds.length; i += maxConcurrent) {
      const batch = args.placeIds.slice(i, i + maxConcurrent);
      console.log(`\n📦 Processing batch ${Math.floor(i / maxConcurrent) + 1}:`, batch);
      
      const batchPromises = batch.map(async (placeId) => {
        try {
          const data = await makeGeoScraperRequest(placeId);
          return {
            success: true,
            placeId,
            reviewCount: Array.isArray(data) ? data.length : 0,
            sampleReview: data[0] || null,
          };
        } catch (error: any) {
          return {
            success: false,
            placeId,
            error: error.message,
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to be respectful
      if (i + maxConcurrent < args.placeIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalReviews = results
      .filter(r => r.success)
      .reduce((sum, r: any) => sum + (r.reviewCount || 0), 0);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Successful: ${successful}/${args.placeIds.length}`);
    console.log(`❌ Failed: ${failed}/${args.placeIds.length}`);
    console.log(`📝 Total reviews found: ${totalReviews}`);
    
    return {
      summary: {
        total: args.placeIds.length,
        successful,
        failed,
        totalReviews,
      },
      results,
    };
  },
});

// Helper to transform GEOscraper review to our format
function transformGeoScraperReview(geoReview: any, businessId: any): any {
  // Handle both API format (nested) and Excel export format (flat)
  const userName = geoReview.user_name || geoReview.user?.name || "Anonymous";
  const userPhoto = geoReview.user_thumbnail || geoReview.user?.thumbnail;
  const userLink = geoReview.user_link || geoReview.user?.link;
  // GeoScraper may have the review text in different fields
  const reviewText = geoReview.snippet || geoReview.text || geoReview.translated_snippet || "";
  const ownerResponseText = geoReview.owner_response_text || geoReview.owner_response?.text;
  const ownerResponseDate = geoReview.owner_response_date || geoReview.owner_response?.date;
  
  // Generate a unique review ID
  const reviewId = geoReview.review_id || 
    `geo_${businessId}_${userName.replace(/\s+/g, '_')}_${Date.now()}`;
  
  // Parse the date - GEOscraper may provide timestamps or date strings
  let createdAt: number;
  if (geoReview.publishedAtDate_timestamp) {
    // GEOscraper timestamps might be in microseconds, check the magnitude
    const timestamp = Number(geoReview.publishedAtDate_timestamp);
    // If it's too large to be milliseconds (year 2050+), assume microseconds
    createdAt = timestamp > 2000000000000 ? Math.floor(timestamp / 1000) : timestamp;
  } else if (geoReview.publishedAtDate) {
    // Try to parse the date string
    const parsedDate = new Date(geoReview.publishedAtDate);
    if (!isNaN(parsedDate.getTime())) {
      createdAt = parsedDate.getTime();
    } else {
      // Fallback if date parsing fails
      createdAt = Date.now();
    }
  } else {
    // Fallback to current time for relative dates
    createdAt = Date.now();
  }
  
  return {
    businessId,
    reviewId,
    userName,
    rating: geoReview.rating || 0,
    comment: reviewText,
    authorPhotoUrl: userPhoto,
    verified: true, // GEOscraper reviews are from Google
    helpful: 0,
    source: "gmb_api",
    sourceUrl: userLink,
    originalCreateTime: geoReview.publishedAtDate || geoReview.date,
    reply: ownerResponseText ? {
      text: ownerResponseText,
      createdAt: ownerResponseDate ? 
        new Date(ownerResponseDate).getTime() : 
        Date.now(),
      authorName: "Business Owner",
    } : undefined,
  };
}

// Fetch and import reviews for a single business
export const fetchAndImportReviews = action({
  args: {
    businessId: v.id("businesses"),
    placeId: v.string(),
    maxReviews: v.optional(v.number()), // Optional limit on reviews to fetch
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      console.log(`🔄 Starting review fetch for business ${args.businessId}`);
      
      let allReviews: any[] = [];
      let pageCount = 0;
      let nextPageToken: string | null = null;
      let hasMorePages = true;
      const reviewLimit = args.maxReviews || 200; // Default to 200 reviews
      const MAX_PAGES = Math.ceil(reviewLimit / 10); // Estimate 10 reviews per page
      const MAX_REVIEWS = reviewLimit; // Use the provided limit
      
      // Fetch all pages of reviews
      while (hasMorePages && pageCount < MAX_PAGES) {
        pageCount++;
        
        // Fetch from GEOscraper with retry logic
        const response = await makeGeoScraperRequest(args.placeId, 0, ctx, nextPageToken || undefined);
        
        // Extract reviews and pagination token from response
        let reviews: any[] = [];
        nextPageToken = null;
        
        if (Array.isArray(response)) {
          if (response.length > 0) {
            const lastItem = response[response.length - 1];
            
            // Check multiple possible token formats
            let isToken = false;
            
            // Format 1: Last item is a string token
            if (typeof lastItem === 'string' && lastItem.length > 10) {
              nextPageToken = lastItem;
              isToken = true;
            }
            // Format 2: Last item is an object but doesn't have review properties
            else if (typeof lastItem === 'object' && lastItem && !lastItem.rating && !lastItem.user_name && !lastItem.snippet) {
              // Check if it has token-like properties
              if (lastItem.token || lastItem.next_page_token || lastItem.nextToken) {
                nextPageToken = lastItem.token || lastItem.next_page_token || lastItem.nextToken;
                isToken = true;
              }
            }
            // Format 3: Last item might be the token even if it looks like an object
            else if (typeof lastItem === 'object' && response.length >= 10) {
              // If we have exactly 10+ items and last item looks different, it might be a token
              const secondToLast = response[response.length - 2];
              if (secondToLast && typeof secondToLast === 'object' && secondToLast.rating) {
                // Previous item is clearly a review, this might be a token
                nextPageToken = JSON.stringify(lastItem);
                isToken = true;
              }
            }
            
            if (isToken) {
              reviews = response.slice(0, -1); // All items except the last one are reviews
            } else {
              reviews = response; // All items are reviews
              hasMorePages = false;
            }
          }
        } else if (response && typeof response === 'object') {
          // Handle other possible response structures
          if (response.data && Array.isArray(response.data)) {
            reviews = response.data;
          } else if (response.reviews && Array.isArray(response.reviews)) {
            reviews = response.reviews;
          }
          hasMorePages = false; // If not an array, assume no pagination
        }
        
        if (reviews.length > 0) {
          allReviews = allReviews.concat(reviews);
          // Show progress every 10 pages or at the end
          if (pageCount % 10 === 0 || !nextPageToken) {
            console.log(`📄 Page ${pageCount}: ${allReviews.length} total reviews`);
          }
        } else {
          console.log(`📊 No reviews found on page ${pageCount}, stopping`);
          hasMorePages = false;
        }
        
        // If no token was found, we've reached the end
        if (!nextPageToken) {
          hasMorePages = false;
        }
        
        // Safety checks
        if (allReviews.length >= MAX_REVIEWS) {
          console.log(`✅ Reached review limit of ${MAX_REVIEWS} reviews. Stopping pagination.`);
          hasMorePages = false;
          break;
        }
        
        // Add a small delay between pages to be respectful
        if (hasMorePages && pageCount < MAX_PAGES) {
          await sleep(500); // 500ms delay between pages
        }
      }
      
      if (pageCount >= MAX_PAGES && nextPageToken) {
        console.log(`⚠️ Reached maximum page limit of ${MAX_PAGES}. There may be more reviews available.`);
      }
      
      if (allReviews.length === 0) {
        console.log(`No reviews found for Place ID: ${args.placeId}`);
        return {
          success: true,
          imported: 0,
          message: "No reviews found",
        };
      }

      console.log(`📥 Fetched ${allReviews.length} reviews across ${pageCount} pages`);
      
      // Transform reviews to our format and filter out empty comments
      const transformedReviews = allReviews
        .map((review, index) => {
          const transformed = transformGeoScraperReview(review, args.businessId);
          
          // Skip reviews with empty comments
          if (!transformed.comment || transformed.comment.trim() === "") {
            return null;
          }
          
          return {
            ...transformed,
            businessName: "", // Will be filled by import function
            place_id: args.placeId,
            // Pass the timestamp as a parseable date string for the import function
            originalCreateTime: transformed.createdAt ? 
              new Date(transformed.createdAt).toISOString() : 
              new Date().toISOString(),
          };
        })
        .filter(review => review !== null); // Remove null entries
      
      const skippedCount = allReviews.length - transformedReviews.length;
      console.log(`📊 Importing ${transformedReviews.length} reviews (${skippedCount} skipped)`);

      // Import reviews in batches to avoid timeouts with large datasets
      const IMPORT_BATCH_SIZE = 100;
      let totalImported = 0;
      let totalDuplicates = 0;
      let totalFailed = 0;
      
      for (let i = 0; i < transformedReviews.length; i += IMPORT_BATCH_SIZE) {
        const batch = transformedReviews.slice(i, i + IMPORT_BATCH_SIZE);
        const batchNumber = Math.floor(i / IMPORT_BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(transformedReviews.length / IMPORT_BATCH_SIZE);
        
        // Only log first, middle, and last batches
        if (batchNumber === 1 || batchNumber === totalBatches || (totalBatches > 5 && batchNumber === Math.ceil(totalBatches / 2))) {
          console.log(`📤 Batch ${batchNumber}/${totalBatches}`);
        }
        
        const batchResult = await ctx.runMutation(api.reviewImportOptimized.importReviewBatch, {
          reviews: batch,
          skipDuplicateCheck: false, // Check for duplicates
        });
        
        totalImported += batchResult.created;
        totalDuplicates += batchResult.duplicates;
        totalFailed += batchResult.failed;
        
        // Add a small delay between batches to avoid overwhelming the system
        if (i + IMPORT_BATCH_SIZE < transformedReviews.length) {
          await sleep(100); // 100ms delay between batches
        }
      }
      
      const importResult = {
        created: totalImported,
        duplicates: totalDuplicates,
        failed: totalFailed,
      };

      console.log(`✅ Import complete: ${importResult.created} imported, ${importResult.duplicates} duplicates`);
      
      // Record metrics for reviews fetched and imported
      await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
        type: "reviews_fetched",
        value: allReviews.length,
        metadata: { businessId: args.businessId, placeId: args.placeId },
      });
      
      await ctx.runMutation(api.geoScraperMetrics.recordMetric, {
        type: "reviews_imported",
        value: importResult.created,
        metadata: { businessId: args.businessId, placeId: args.placeId },
      });
      
      return {
        success: true,
        fetched: allReviews.length,
        filtered: transformedReviews.length,
        skipped: skippedCount,
        imported: importResult.created,
        duplicates: importResult.duplicates,
        failed: importResult.failed,
        pages: pageCount,
      };
    } catch (error: any) {
      console.error(`❌ Error in fetchAndImportReviews:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Debug function to test transformation and import
export const debugTransformAndImport = action({
  args: {
    businessId: v.id("businesses"),
    placeId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      console.log(`🔍 Debug: Fetching single page of reviews for testing`);
      
      // Fetch just one review with retry logic
      const geoReviews = await makeGeoScraperRequest(args.placeId, 0, ctx);
      
      if (!Array.isArray(geoReviews) || geoReviews.length === 0) {
        return { error: "No reviews found" };
      }

      // Take just the first review
      const firstReview = geoReviews[0];
      console.log(`📋 Raw review data:`, JSON.stringify(firstReview, null, 2));
      
      // Transform it
      const transformed = transformGeoScraperReview(firstReview, args.businessId);
      console.log(`🔄 Transformed data:`, JSON.stringify(transformed, null, 2));
      
      // Prepare for import
      const importReview = {
        ...transformed,
        businessName: "",
        place_id: args.placeId,
        originalCreateTime: transformed.createdAt ? 
          new Date(transformed.createdAt).toISOString() : 
          new Date().toISOString(),
      };
      
      console.log(`📦 Import-ready data:`, JSON.stringify(importReview, null, 2));
      
      // Try to import just this one review
      const importResult = await ctx.runMutation(api.reviewImportOptimized.importReviewBatch, {
        reviews: [importReview],
        skipDuplicateCheck: false,
      });
      
      console.log(`✅ Import result:`, importResult);
      
      // Fetch the review from the database to see what was actually saved
      const savedReviews = await ctx.runQuery(api.businesses.getBusinessReviews, {
        businessId: args.businessId,
      });
      
      const latestReview = savedReviews[0];
      console.log(`💾 Latest saved review:`, JSON.stringify(latestReview, null, 2));
      
      return {
        raw: firstReview,
        transformed: transformed,
        importReady: importReview,
        importResult: importResult,
        savedReview: latestReview,
      };
    } catch (error: any) {
      console.error(`❌ Debug error:`, error);
      return { error: error.message };
    }
  },
});

// Bulk fetch reviews for multiple businesses
export const bulkFetchReviews = action({
  args: {
    businesses: v.array(v.object({
      businessId: v.id("businesses"),
      placeId: v.string(),
    })),
    maxConcurrent: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    const maxConcurrent = args.maxConcurrent || 3;
    const results = [];
    
    console.log(`🚀 Starting bulk review fetch for ${args.businesses.length} businesses`);
    
    // Process in batches respecting concurrent connection limit
    for (let i = 0; i < args.businesses.length; i += maxConcurrent) {
      const batch = args.businesses.slice(i, i + maxConcurrent);
      console.log(`\n📦 Processing batch ${Math.floor(i / maxConcurrent) + 1} (${batch.length} businesses)`);
      
      const batchPromises = batch.map(business => 
        ctx.runAction(api.geoScraperAPI.fetchAndImportReviews, {
          businessId: business.businessId,
          placeId: business.placeId,
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.map((result: any, index: number) => ({
        ...result,
        businessId: batch[index].businessId,
        placeId: batch[index].placeId,
      })));
      
      // Small delay between batches
      if (i + maxConcurrent < args.businesses.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const totalFetched = results.reduce((sum, r) => sum + (r.fetched || 0), 0);
    const totalFiltered = results.reduce((sum, r) => sum + (r.filtered || 0), 0);
    const totalSkipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0);
    const totalImported = results.reduce((sum, r) => sum + (r.imported || 0), 0);
    const totalDuplicates = results.reduce((sum, r) => sum + (r.duplicates || 0), 0);
    
    return {
      summary: {
        totalBusinesses: args.businesses.length,
        successful,
        failed: args.businesses.length - successful,
        totalFetched,
        totalFiltered,
        totalSkipped,
        totalImported,
        totalDuplicates,
      },
      details: results,
    };
  },
});