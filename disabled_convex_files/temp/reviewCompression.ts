/**
 * Review Data Compression for Storage Efficiency
 * Part of AI Ranking System - Phase 1.2
 * Optimizes storage of review content while maintaining searchability
 */

import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Simple text compression utilities
 */

/**
 * Compress review text by removing redundancy and normalizing
 */
function compressReviewText(text: string): {
  compressed: string;
  originalLength: number;
  compressedLength: number;
  compressionRatio: number;
} {
  const originalLength = text.length;
  
  if (originalLength === 0) {
    return {
      compressed: "",
      originalLength: 0,
      compressedLength: 0,
      compressionRatio: 0,
    };
  }
  
  // Basic compression strategies:
  let compressed = text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Remove excessive punctuation
    .replace(/\.{2,}/g, '...')
    .replace(/!{2,}/g, '!!')
    .replace(/\?{2,}/g, '??')
    // Remove some common redundant phrases (if exact matches)
    .replace(/\b(very very|really really|so so)\b/gi, (match) => match.split(' ')[0])
    // Normalize common contractions for consistency
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bisn't\b/gi, 'is not')
    .replace(/\baren't\b/gi, 'are not')
    .replace(/\bwasn't\b/gi, 'was not')
    .replace(/\bweren't\b/gi, 'were not')
    .replace(/\bhasn't\b/gi, 'has not')
    .replace(/\bhaven't\b/gi, 'have not')
    .replace(/\bhadn't\b/gi, 'had not')
    .replace(/\bwouldn't\b/gi, 'would not')
    .replace(/\bshouldn't\b/gi, 'should not')
    .replace(/\bcouldn't\b/gi, 'could not');
  
  const compressedLength = compressed.length;
  const compressionRatio = originalLength > 0 ? (originalLength - compressedLength) / originalLength : 0;
  
  return {
    compressed,
    originalLength,
    compressedLength,
    compressionRatio: Math.round(compressionRatio * 1000) / 1000, // Round to 3 decimal places
  };
}

/**
 * Extract key phrases from review text for indexing
 */
function extractKeyPhrases(text: string, maxPhrases: number = 10): string[] {
  // Simple key phrase extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'this', 'that', 'these',
    'those', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'did', 'does',
    'do', 'are', 'is', 'am', 'be', 'being'
  ]);
  
  // Filter meaningful words
  const meaningfulWords = words.filter(word => 
    !stopWords.has(word) && 
    word.length > 2 && 
    !/^\d+$/.test(word) // Exclude pure numbers
  );
  
  // Count word frequency
  const wordCounts: Record<string, number> = {};
  meaningfulWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and return top phrases
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([word]) => word);
}

/**
 * Compress a batch of reviews for storage efficiency
 */
export const compressReviewBatch = internalMutation({
  args: {
    batchId: v.id("importBatches"),
  },
  handler: async (ctx, args) => {
    // Get all reviews for this batch
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_import_batch", (q) => q.eq("importBatchId", args.batchId))
      .collect();
    
    if (reviews.length === 0) {
      return { processed: 0, totalSavings: 0 };
    }
    
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let processed = 0;
    
    for (const review of reviews) {
      try {
        const compressionResult = compressReviewText(review.comment);
        const keyPhrases = extractKeyPhrases(review.comment);
        
        // Update the review with compressed content and key phrases
        await ctx.db.patch(review._id, {
          comment: compressionResult.compressed,
          keywords: [...(review.keywords || []), ...keyPhrases],
        });
        
        totalOriginalSize += compressionResult.originalLength;
        totalCompressedSize += compressionResult.compressedLength;
        processed++;
        
      } catch (error) {
        console.error(`Failed to compress review ${review._id}:`, error);
      }
    }
    
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const overallRatio = totalOriginalSize > 0 ? totalSavings / totalOriginalSize : 0;
    
    // Update the batch with compression statistics
    const batch = await ctx.db.get(args.batchId);
    if (batch && batch.sourceMetadata) {
      await ctx.db.patch(args.batchId, {
        sourceMetadata: {
          ...batch.sourceMetadata,
          compressionStats: {
            originalSize: totalOriginalSize,
            compressedSize: totalCompressedSize,
            savings: totalSavings,
            ratio: Math.round(overallRatio * 1000) / 1000,
            processedReviews: processed,
          },
        },
      });
    }
    
    return {
      processed,
      totalOriginalSize,
      totalCompressedSize,
      totalSavings,
      compressionRatio: Math.round(overallRatio * 1000) / 1000,
    };
  },
});

/**
 * Get compression statistics for analysis
 */
export const getCompressionStats = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    timeframe: v.optional(v.string()), // "7d", "30d", "all"
  },
  handler: async (ctx, args) => {
    let batches;
    
    if (args.businessId) {
      batches = await ctx.db
        .query("importBatches")
        .filter((q) => q.eq(q.field("sourceMetadata.businessId"), args.businessId))
        .collect();
    } else {
      const timeframeDays = {
        "7d": 7,
        "30d": 30,
      }[args.timeframe || "30d"];
      
      if (timeframeDays) {
        const cutoff = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);
        batches = await ctx.db
          .query("importBatches")
          .filter((q) => q.gt(q.field("createdAt"), cutoff))
          .collect();
      } else {
        batches = await ctx.db.query("importBatches").collect();
      }
    }
    
    // Aggregate compression statistics
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let totalBatches = 0;
    let totalReviews = 0;
    
    const compressionBySource: Record<string, {
      originalSize: number;
      compressedSize: number;
      reviews: number;
    }> = {};
    
    for (const batch of batches) {
      const compressionStats = batch.sourceMetadata?.compressionStats;
      if (compressionStats) {
        totalOriginalSize += compressionStats.originalSize;
        totalCompressedSize += compressionStats.compressedSize;
        totalReviews += compressionStats.processedReviews;
        totalBatches++;
        
        const source = batch.source;
        if (!compressionBySource[source]) {
          compressionBySource[source] = {
            originalSize: 0,
            compressedSize: 0,
            reviews: 0,
          };
        }
        
        compressionBySource[source].originalSize += compressionStats.originalSize;
        compressionBySource[source].compressedSize += compressionStats.compressedSize;
        compressionBySource[source].reviews += compressionStats.processedReviews;
      }
    }
    
    const overallSavings = totalOriginalSize - totalCompressedSize;
    const overallRatio = totalOriginalSize > 0 ? overallSavings / totalOriginalSize : 0;
    
    // Calculate per-source statistics
    const sourceStats = Object.entries(compressionBySource).map(([source, stats]) => {
      const savings = stats.originalSize - stats.compressedSize;
      const ratio = stats.originalSize > 0 ? savings / stats.originalSize : 0;
      
      return {
        source,
        originalSize: stats.originalSize,
        compressedSize: stats.compressedSize,
        savings,
        ratio: Math.round(ratio * 1000) / 1000,
        reviews: stats.reviews,
        avgOriginalSize: stats.reviews > 0 ? Math.round(stats.originalSize / stats.reviews) : 0,
        avgCompressedSize: stats.reviews > 0 ? Math.round(stats.compressedSize / stats.reviews) : 0,
      };
    });
    
    return {
      overall: {
        totalOriginalSize,
        totalCompressedSize,
        totalSavings: overallSavings,
        compressionRatio: Math.round(overallRatio * 1000) / 1000,
        totalReviews,
        totalBatches,
        avgOriginalSize: totalReviews > 0 ? Math.round(totalOriginalSize / totalReviews) : 0,
        avgCompressedSize: totalReviews > 0 ? Math.round(totalCompressedSize / totalReviews) : 0,
      },
      bySource: sourceStats,
      efficiency: {
        storageReduced: `${Math.round(overallRatio * 100)}%`,
        bytesPerReview: totalReviews > 0 ? Math.round(totalCompressedSize / totalReviews) : 0,
        estimatedMonthlySavings: Math.round(overallSavings * 30 / (timeframeDays || 30)), // Extrapolate to monthly
      },
    };
  },
});

/**
 * Retroactively compress existing reviews
 */
export const compressExistingReviews = internalMutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    limit: v.optional(v.number()), // Limit for batch processing
  },
  handler: async (ctx, args) => {
    let reviews;
    
    if (args.businessId) {
      reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .filter((q) => q.gt(q.field("createdAt"), 0)) // Get all reviews
        .take(args.limit || 100);
    } else {
      reviews = await ctx.db
        .query("reviews")
        .filter((q) => q.gt(q.field("createdAt"), 0))
        .take(args.limit || 50); // Smaller batch for system-wide compression
    }
    
    let processed = 0;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let errors = 0;
    
    for (const review of reviews) {
      try {
        // Skip if already has keywords (likely already processed)
        if (review.keywords && review.keywords.length > 5) {
          continue;
        }
        
        const compressionResult = compressReviewText(review.comment);
        const keyPhrases = extractKeyPhrases(review.comment);
        
        // Only update if there's actual compression benefit
        if (compressionResult.compressionRatio > 0.1) { // At least 10% savings
          await ctx.db.patch(review._id, {
            comment: compressionResult.compressed,
            keywords: [...(review.keywords || []), ...keyPhrases],
          });
        }
        
        totalOriginalSize += compressionResult.originalLength;
        totalCompressedSize += compressionResult.compressedLength;
        processed++;
        
      } catch (error) {
        console.error(`Failed to compress existing review ${review._id}:`, error);
        errors++;
      }
    }
    
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const overallRatio = totalOriginalSize > 0 ? totalSavings / totalOriginalSize : 0;
    
    return {
      processed,
      errors,
      totalOriginalSize,
      totalCompressedSize,
      totalSavings,
      compressionRatio: Math.round(overallRatio * 1000) / 1000,
      hasMore: reviews.length === (args.limit || 100),
    };
  },
});