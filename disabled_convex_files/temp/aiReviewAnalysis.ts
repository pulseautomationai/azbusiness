/**
 * AI Review Analysis Engine
 * Part of AI Ranking System - Phase 1.3
 * Implements OpenAI-powered analysis for sentiment, performance indicators, and ranking factors
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * OpenAI Analysis Configuration
 */
const AI_CONFIG = {
  model: "gpt-4o-mini", // Cost-effective model for analysis
  maxTokens: 800,
  temperature: 0.1, // Low temperature for consistent analysis
  batchSize: 10, // Process reviews in batches
};

/**
 * Analysis prompt templates for different aspects
 */
const ANALYSIS_PROMPTS = {
  sentiment: `Analyze the sentiment of this business review. Return a JSON object with:
{
  "score": number (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive),
  "magnitude": number (0 to 1, strength of sentiment),
  "classification": "positive" | "neutral" | "negative"
}

Review: "{review_text}"`,

  speedMentions: `Analyze this business review for mentions of speed, response time, or urgency. Return a JSON object with:
{
  "hasSpeedMention": boolean,
  "responseTime": string | null (e.g., "12 minutes", "same day", "immediate"),
  "urgencyLevel": "low" | "medium" | "high"
}

Look for mentions of: response time, how fast, how quickly, emergency service, same day, within minutes/hours, prompt, immediate, urgent.

Review: "{review_text}"`,

  valueMentions: `Analyze this business review for mentions of value, pricing, and cost perception. Return a JSON object with:
{
  "hasValueMention": boolean,
  "pricePerception": "expensive" | "fair" | "cheap" | null,
  "valueScore": number (0-10, where 10 is excellent value)
}

Look for mentions of: price, cost, expensive, cheap, affordable, value, worth it, overpriced, reasonable, budget.

Review: "{review_text}"`,

  qualityMentions: `Analyze this business review for mentions of work quality and craftsmanship. Return a JSON object with:
{
  "hasQualityMention": boolean,
  "workmanshipScore": number (0-10, where 10 is excellent quality),
  "detailOriented": boolean
}

Look for mentions of: quality, workmanship, craftsmanship, professional, thorough, attention to detail, excellent work, poor quality, sloppy.

Review: "{review_text}"`,

  reliabilityMentions: `Analyze this business review for mentions of reliability and consistency. Return a JSON object with:
{
  "hasReliabilityMention": boolean,
  "consistencyScore": number (0-10, where 10 is very reliable),
  "followThrough": boolean
}

Look for mentions of: reliable, dependable, consistent, trustworthy, follows through, keeps promises, on time, punctual, unreliable.

Review: "{review_text}"`,
};

/**
 * Call OpenAI API for analysis
 */
async function callOpenAI(prompt: string): Promise<any> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: "You are an expert business review analyzer. Always return valid JSON objects as requested. Be precise and consistent in your analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error(`Invalid JSON response from OpenAI: ${error}`);
  }
}

/**
 * Analyze a single review for all performance aspects
 */
export const analyzeReviewAI = internalMutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (!review.comment || review.comment.trim().length < 10) {
      // Skip analysis for very short reviews
      return { skipped: true, reason: "Review too short for meaningful analysis" };
    }

    try {
      // Perform all analyses in parallel
      const [sentimentResult, speedResult, valueResult, qualityResult, reliabilityResult] = await Promise.all([
        callOpenAI(ANALYSIS_PROMPTS.sentiment.replace("{review_text}", review.comment)),
        callOpenAI(ANALYSIS_PROMPTS.speedMentions.replace("{review_text}", review.comment)),
        callOpenAI(ANALYSIS_PROMPTS.valueMentions.replace("{review_text}", review.comment)),
        callOpenAI(ANALYSIS_PROMPTS.qualityMentions.replace("{review_text}", review.comment)),
        callOpenAI(ANALYSIS_PROMPTS.reliabilityMentions.replace("{review_text}", review.comment)),
      ]);

      // Calculate display priority based on analysis results
      const displayPriority = calculateDisplayPriority(review, {
        sentiment: sentimentResult,
        speed: speedResult,
        value: valueResult,
        quality: qualityResult,
        reliability: reliabilityResult,
      });

      // Extract keywords for searchability
      const keywords = extractAnalysisKeywords(review.comment, {
        sentiment: sentimentResult,
        speed: speedResult,
        value: valueResult,
        quality: qualityResult,
        reliability: reliabilityResult,
      });

      // Update the review with analysis results
      await ctx.db.patch(args.reviewId, {
        sentiment: {
          score: sentimentResult.score,
          magnitude: sentimentResult.magnitude,
          classification: sentimentResult.classification,
        },
        speedMentions: speedResult.hasSpeedMention ? {
          hasSpeedMention: true,
          responseTime: speedResult.responseTime,
          urgencyLevel: speedResult.urgencyLevel,
        } : undefined,
        valueMentions: valueResult.hasValueMention ? {
          hasValueMention: true,
          pricePerception: valueResult.pricePerception,
          valueScore: valueResult.valueScore,
        } : undefined,
        qualityMentions: qualityResult.hasQualityMention ? {
          hasQualityMention: true,
          workmanshipScore: qualityResult.workmanshipScore,
          detailOriented: qualityResult.detailOriented,
        } : undefined,
        reliabilityMentions: reliabilityResult.hasReliabilityMention ? {
          hasReliabilityMention: true,
          consistencyScore: reliabilityResult.consistencyScore,
          followThrough: reliabilityResult.followThrough,
        } : undefined,
        displayPriority,
        keywords: [...(review.keywords || []), ...keywords],
      });

      return {
        analyzed: true,
        displayPriority,
        hasPerformanceMentions: {
          speed: speedResult.hasSpeedMention,
          value: valueResult.hasValueMention,
          quality: qualityResult.hasQualityMention,
          reliability: reliabilityResult.hasReliabilityMention,
        },
        sentiment: sentimentResult.classification,
      };

    } catch (error) {
      console.error(`AI analysis failed for review ${args.reviewId}:`, error);
      
      // Mark the review with failed analysis
      await ctx.db.patch(args.reviewId, {
        keywords: [...(review.keywords || []), "ai_analysis_failed"],
        displayPriority: 0, // Default priority
      });

      throw error;
    }
  },
});

/**
 * Calculate display priority based on analysis results
 */
function calculateDisplayPriority(review: any, analysis: any): number {
  let priority = 0;
  
  // Base priority on rating (5-star reviews get higher priority)
  priority += review.rating * 2;
  
  // Boost for positive sentiment
  if (analysis.sentiment.classification === "positive") {
    priority += 5;
  } else if (analysis.sentiment.classification === "negative") {
    priority += 3; // Negative reviews still important for business insight
  }
  
  // Boost for performance mentions
  if (analysis.speed.hasSpeedMention) priority += 3;
  if (analysis.value.hasValueMention) priority += 3;
  if (analysis.quality.hasQualityMention) priority += 4;
  if (analysis.reliability.hasReliabilityMention) priority += 4;
  
  // Boost for detailed reviews (longer content)
  if (review.comment.length > 200) priority += 2;
  if (review.comment.length > 500) priority += 2;
  
  // Boost for verified reviews
  if (review.verified) priority += 2;
  
  // Boost for recent reviews
  const daysSinceReview = (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceReview < 30) priority += 3;
  if (daysSinceReview < 7) priority += 2;
  
  return Math.round(priority);
}

/**
 * Extract keywords from analysis results
 */
function extractAnalysisKeywords(reviewText: string, analysis: any): string[] {
  const keywords: string[] = [];
  
  // Sentiment keywords
  keywords.push(`sentiment_${analysis.sentiment.classification}`);
  if (analysis.sentiment.magnitude > 0.7) {
    keywords.push("high_sentiment");
  }
  
  // Performance keywords
  if (analysis.speed.hasSpeedMention) {
    keywords.push("mentions_speed");
    if (analysis.speed.urgencyLevel === "high") {
      keywords.push("emergency_service");
    }
  }
  
  if (analysis.value.hasValueMention) {
    keywords.push("mentions_value");
    keywords.push(`price_${analysis.value.pricePerception}`);
  }
  
  if (analysis.quality.hasQualityMention) {
    keywords.push("mentions_quality");
    if (analysis.quality.detailOriented) {
      keywords.push("detail_oriented");
    }
  }
  
  if (analysis.reliability.hasReliabilityMention) {
    keywords.push("mentions_reliability");
    if (analysis.reliability.followThrough) {
      keywords.push("follows_through");
    }
  }
  
  // Content-based keywords
  if (reviewText.length > 500) {
    keywords.push("detailed_review");
  }
  
  return keywords;
}

/**
 * Process a batch of reviews for AI analysis
 */
export const processReviewBatchForAI = internalMutation({
  args: {
    businessId: v.id("businesses"),
    batchId: v.optional(v.id("importBatches")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let reviews;
    
    if (args.batchId) {
      // Process specific import batch
      reviews = await ctx.db
        .query("reviews")
        .withIndex("by_import_batch", (q) => q.eq("importBatchId", args.batchId))
        .take(args.limit || AI_CONFIG.batchSize);
    } else {
      // Process unanalyzed reviews for business
      reviews = await ctx.db
        .query("reviews")
        .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
        .filter((q) => q.eq(q.field("sentiment"), undefined)) // Not yet analyzed
        .take(args.limit || AI_CONFIG.batchSize);
    }

    if (reviews.length === 0) {
      return { processed: 0, message: "No reviews to analyze" };
    }

    let analyzed = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process reviews sequentially to avoid rate limits
    for (const review of reviews) {
      try {
        const result = await ctx.runMutation(internal.analyzeReviewAI, {
          reviewId: review._id,
        });
        
        if (result.skipped) {
          skipped++;
        } else {
          analyzed++;
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        errors.push(`Review ${review._id}: ${error}`);
      }
    }

    return {
      processed: analyzed + skipped + failed,
      analyzed,
      skipped,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

/**
 * Get AI analysis statistics for a business
 */
export const getAnalysisStats = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    if (reviews.length === 0) {
      return {
        total: 0,
        analyzed: 0,
        pending: 0,
        failed: 0,
        performanceMentions: { speed: 0, value: 0, quality: 0, reliability: 0 },
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      };
    }

    let analyzed = 0;
    let pending = 0;
    let failed = 0;
    const performanceMentions = { speed: 0, value: 0, quality: 0, reliability: 0 };
    const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };

    for (const review of reviews) {
      if (review.sentiment) {
        analyzed++;
        sentimentDistribution[review.sentiment.classification]++;
        
        if (review.speedMentions?.hasSpeedMention) performanceMentions.speed++;
        if (review.valueMentions?.hasValueMention) performanceMentions.value++;
        if (review.qualityMentions?.hasQualityMention) performanceMentions.quality++;
        if (review.reliabilityMentions?.hasReliabilityMention) performanceMentions.reliability++;
      } else if (review.keywords?.includes("ai_analysis_failed")) {
        failed++;
      } else {
        pending++;
      }
    }

    const analysisScore = reviews.length > 0 ? Math.round((analyzed / reviews.length) * 100) : 0;

    return {
      total: reviews.length,
      analyzed,
      pending,
      failed,
      analysisScore,
      performanceMentions,
      sentimentDistribution,
      performanceCoverage: {
        speed: analyzed > 0 ? Math.round((performanceMentions.speed / analyzed) * 100) : 0,
        value: analyzed > 0 ? Math.round((performanceMentions.value / analyzed) * 100) : 0,
        quality: analyzed > 0 ? Math.round((performanceMentions.quality / analyzed) * 100) : 0,
        reliability: analyzed > 0 ? Math.round((performanceMentions.reliability / analyzed) * 100) : 0,
      },
    };
  },
});

/**
 * Trigger AI analysis for a specific business
 */
export const triggerBusinessAnalysis = mutation({
  args: {
    businessId: v.id("businesses"),
    forceReanalyze: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Schedule batch processing
    await ctx.scheduler.runAfter(0, internal.processReviewBatchForAI, {
      businessId: args.businessId,
      limit: 50, // Process up to 50 reviews at once
    });

    return { 
      status: "analysis_scheduled",
      businessId: args.businessId,
      message: "AI analysis has been scheduled for this business's reviews"
    };
  },
});