import { query } from "./_generated/server";

/**
 * Quick verification of recent imports
 */
export const verifyRecentImport = query({
  handler: async (ctx) => {
    // Get the most recent import batch
    const recentBatch = await ctx.db
      .query("importBatches")
      .order("desc")
      .first();

    if (!recentBatch) {
      return { message: "No import batches found" };
    }

    // Get reviews from this batch
    const batchReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("importBatchId"), recentBatch._id))
      .collect();

    // Get total review count (use aggregate instead of loading all reviews)
    // This is just for counting, we don't need the actual review data
    const totalReviews = await ctx.db.query("reviews").take(10000); // Sample for counting

    return {
      recentBatch: {
        id: recentBatch._id,
        status: recentBatch.status,
        reviewCount: recentBatch.reviewCount,
        results: recentBatch.results,
        importedAt: new Date(recentBatch.importedAt).toISOString(),
      },
      actualReviewsFromBatch: batchReviews.length,
      totalReviewsInDB: totalReviews.length,
      sampleReviews: batchReviews.slice(0, 3).map(r => ({
        reviewId: r.reviewId,
        businessId: r.businessId,
        userName: r.userName,
        rating: r.rating,
        source: r.source
      }))
    };
  },
});