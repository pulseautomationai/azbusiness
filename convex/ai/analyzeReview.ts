import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

// Main action to analyze a review using Gemini or mock analyzer
export const analyzeReviewWithAI = action({
  args: {
    reviewId: v.id("reviews"),
    businessId: v.id("businesses"),
    reviewText: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Check if Gemini API key is configured
      const useGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here";
      
      let tags;
      let confidenceScore;
      let modelVersion;
      
      if (useGemini) {
        console.log("Using Gemini for AI analysis");
        try {
          // Get business details for category-specific analysis
          const business = await ctx.runQuery(internal.businesses.getBusinessInternal, {
            businessId: args.businessId,
          });
          
          const category = (business as any)?.category?.name || "general service";
          const result = await analyzeWithGemini(args.reviewText, args.rating, category);
          
          if (result) {
            tags = result;
            confidenceScore = result.confidence || calculateConfidenceScore(args.reviewText, result);
            modelVersion = "gemini-1.5-flash";
            console.log("✅ Gemini analysis successful");
          } else {
            throw new Error("Gemini returned empty result");
          }
        } catch (error) {
          console.error("Gemini API error:", error);
          console.log("Falling back to mock analyzer");
          tags = generateMockAnalysisTags(args.reviewText, args.rating);
          confidenceScore = calculateConfidenceScore(args.reviewText, tags);
          modelVersion = "mock-v1";
        }
      } else {
        console.log("Using enhanced mock analysis");
        tags = generateMockAnalysisTags(args.reviewText, args.rating);
        confidenceScore = calculateConfidenceScore(args.reviewText, tags);
        modelVersion = "mock-v1";
      }

      // Get business details for category-specific analysis
      const business = await ctx.runQuery(internal.businesses.getBusinessInternal, {
        businessId: args.businessId,
      });
      
      if (!business) throw new Error("Business not found");
      
      // Store the analysis results
      await ctx.runMutation(internal.ai.analyzeReview.storeAnalysisTags, {
        businessId: args.businessId,
        reviewId: args.reviewId,
        tags: {
          ...tags,
          analysisDate: Date.now(),
          modelVersion,
          confidenceScore,
        },
      });

      return {
        success: true,
        tags,
        confidenceScore,
      };
    } catch (error: any) {
      console.error("Error analyzing review:", error);
      throw new Error(`Failed to analyze review: ${error.message}`);
    }
  },
});

// Internal mutation to store analysis tags
export const storeAnalysisTags = internalMutation({
  args: {
    businessId: v.id("businesses"),
    reviewId: v.id("reviews"),
    tags: v.any(),
  },
  handler: async (ctx, args) => {
    const existingAnalysis = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .first();

    const analysisData = {
      businessId: args.businessId,
      reviewId: args.reviewId,
      analysisDate: args.tags.analysisDate,
      modelVersion: args.tags.modelVersion,
      confidenceScore: args.tags.confidenceScore,
      qualityIndicators: args.tags.qualityIndicators,
      serviceExcellence: args.tags.serviceExcellence,
      customerExperience: args.tags.customerExperience,
      competitiveMarkers: args.tags.competitiveMarkers,
      businessPerformance: args.tags.businessPerformance,
      recommendationStrength: args.tags.recommendationStrength,
      industrySpecific: args.tags.industrySpecific || null,
      sentiment: args.tags.sentiment,
      keywords: args.tags.keywords,
      topics: args.tags.topics,
      // Customer-focused analysis fields
      customerVoiceAnalysis: args.tags.customerVoiceAnalysis || null,
      communicationExcellence: args.tags.communicationExcellence || null,
      valueTransparency: args.tags.valueTransparency || null,
      trustReliability: args.tags.trustReliability || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (existingAnalysis) {
      // Update existing analysis
      await ctx.db.patch(existingAnalysis._id, {
        ...analysisData,
        updatedAt: Date.now(),
      });
    } else {
      // Create new analysis
      await ctx.db.insert("aiAnalysisTags", analysisData);
    }
  },
});

// Generate mock analysis tags for testing with enhanced structure
function generateMockAnalysisTags(reviewText: string, rating: number): any {
  const text = reviewText.toLowerCase();
  const isPositive = rating >= 4;
  const isExcellent = rating >= 4.5;
  
  // Calculate intensity based on review content and rating
  const calculateIntensity = (base: number): number => {
    let intensity = base;
    if (text.includes("amazing") || text.includes("incredible")) intensity += 1;
    if (text.includes("best") || text.includes("outstanding")) intensity += 1;
    if (text.includes("exceeded")) intensity += 1;
    return Math.min(10, intensity);
  };
  
  // Extract customer voice data for Power tier insights
  const customerQuotes = extractCustomerQuotes(text);
  const commonPhrases = extractCommonPhrases(text);
  
  return {
    qualityIndicators: {
      excellence: {
        mentioned: isPositive && (text.includes("excellent") || text.includes("amazing") || text.includes("outstanding")),
        intensity: calculateIntensity(isPositive ? rating * 1.8 : rating),
        exceeded_expectations: isPositive && (text.includes("exceeded") || text.includes("beyond")),
        specific_examples: extractExamples(text),
      },
      firstTimeSuccess: {
        mentioned: text.includes("first") || text.includes("one visit") || text.includes("right away"),
        precision_work: text.includes("precise") || text.includes("accurate") || text.includes("perfect"),
        got_it_right_first: (text.includes("right") && text.includes("first")) || text.includes("fixed immediately"),
        no_return_visits: text.includes("no return") || text.includes("one visit") || text.includes("single trip"),
        single_visit_complete: text.includes("single visit") || text.includes("one time") || text.includes("completed same day"),
      },
      attentionToDetail: {
        mentioned: text.includes("detail") || text.includes("thorough") || text.includes("meticulous"),
        thoroughness: isPositive ? (isExcellent ? 8 : 7) : 3,
        cleanliness: text.includes("clean") || text.includes("tidy") || text.includes("spotless"),
        careful_work: text.includes("careful") || text.includes("meticulous") || text.includes("precise"),
      },
    },
    serviceExcellence: {
      professionalism: {
        score: isPositive ? 8 : 4,
        punctual: text.includes("time") || text.includes("punctual"),
        courteous: text.includes("courteous") || text.includes("polite"),
        knowledgeable: text.includes("knowledge") || text.includes("expert"),
      },
      communication: {
        score: isPositive ? 7 : 4,
        clear_explanation: text.includes("explain"),
        responsive: text.includes("responsive") || text.includes("quick"),
        kept_informed: text.includes("informed") || text.includes("update"),
      },
      expertise: {
        expert_referenced: text.includes("expert") || text.includes("professional"),
        technical_competency: isPositive ? 8 : 5,
        specialist_noted: text.includes("specialist"),
        master_craftsman: text.includes("master") || text.includes("craftsman"),
      },
    },
    customerExperience: {
      emotionalImpact: {
        stress_relief: text.includes("stress") || text.includes("relief"),
        peace_of_mind: text.includes("peace") || text.includes("worry"),
        life_changing: text.includes("life") && text.includes("chang"),
        emotional_intensity: isPositive ? 7 : 3,
      },
      businessImpact: {
        saved_money: text.includes("save") && text.includes("money"),
        improved_efficiency: text.includes("efficien"),
        prevented_disaster: text.includes("prevent") || text.includes("disaster"),
        business_value_score: isPositive ? 7 : 4,
      },
      relationshipBuilding: {
        trust_established: text.includes("trust"),
        personal_connection: text.includes("personal"),
        loyalty_indicated: text.includes("always") || text.includes("loyal"),
        future_service_planned: text.includes("future") || text.includes("again"),
        relationship_score: isPositive ? 7 : 4,
      },
    },
    competitiveMarkers: {
      comparisonMentions: {
        better_than_others: text.includes("better than") || text.includes("best"),
        best_in_area: text.includes("best") && (text.includes("area") || text.includes("town")),
        tried_others_first: text.includes("tried others"),
        comparison_count: 0,
      },
      marketPosition: {
        local_favorite: text.includes("favorite"),
        industry_leader: text.includes("leader"),
        go_to_provider: text.includes("go to") || text.includes("goto"),
      },
      differentiation: {
        unique_approach: text.includes("unique"),
        special_equipment: text.includes("special") && text.includes("equipment"),
        innovation_mentioned: text.includes("innovat"),
      },
    },
    businessPerformance: {
      responseQuality: {
        quick_response_mentioned: text.includes("quick") || text.includes("fast"),
        same_day_service: text.includes("same day"),
        emergency_available: text.includes("emergency"),
        response_speed_score: isPositive ? 7 : 4,
      },
      valueDelivery: {
        fair_pricing: text.includes("fair") && text.includes("price"),
        worth_the_cost: text.includes("worth"),
        transparent_costs: text.includes("transparent") || text.includes("upfront"),
        value_score: isPositive ? 7 : 4,
      },
      problemResolution: {
        fixed_others_couldnt: text.includes("others couldn't") || text.includes("finally fixed"),
        complex_issue_resolved: text.includes("complex") || text.includes("difficult"),
        creative_solution: text.includes("creative") || text.includes("innovative"),
        difficulty_level: isPositive ? 6 : 3,
      },
    },
    recommendationStrength: {
      would_recommend: isPositive,
      already_recommended: text.includes("told") || text.includes("recommended") || text.includes("referred"),
      tell_everyone: text.includes("everyone") || text.includes("anybody") || text.includes("all my friends"),
      only_company_use: text.includes("only") && (text.includes("use") || text.includes("call")) || text.includes("go-to"),
      advocacy_score: analyzeRecommendationStrength(text, rating),
    },
    sentiment: {
      overall: isPositive ? (isExcellent ? 0.9 : 0.7) : rating === 3 ? 0 : -0.5,
      magnitude: Math.min(1, text.length / 500), // Longer reviews have higher magnitude
      classification: isPositive ? "positive" : rating === 3 ? "neutral" : "negative" as any,
    },
    keywords: extractKeywords(text),
    topics: extractTopics(text),
    industrySpecific: generateMockIndustrySpecific(text, isPositive),
    
    // Customer Voice Analysis for Power tier
    customerVoiceAnalysis: {
      topQuotes: customerQuotes,
      commonPhrases: commonPhrases,
      sentimentClusters: analyzeSentimentClusters(text, isPositive),
    },
    
    // Communication Excellence for Power tier
    communicationExcellence: {
      explainsClarly: {
        mentioned: text.includes("explain") || text.includes("clear") || text.includes("understand"),
        frequency: countOccurrences(text, ["explain", "clear", "understand", "communication"]),
      },
      proactiveUpdates: {
        mentioned: text.includes("update") || text.includes("inform") || text.includes("kept me"),
        examples: extractCommunicationExamples(text),
      },
      responsiveness: {
        avgResponseTime: extractResponseTime(text),
        consistency: isPositive ? 8 : 4,
      },
    },
    
    // Value Transparency for Power tier
    valueTransparency: {
      fairPricing: {
        mentioned: (text.includes("fair") && text.includes("price")) || text.includes("reasonable"),
        frequency: countOccurrences(text, ["fair price", "reasonable", "good value"]),
      },
      noSurpriseCharges: {
        mentioned: text.includes("no surprise") || text.includes("upfront") || text.includes("transparent"),
        frequency: countOccurrences(text, ["no surprise", "hidden", "unexpected", "transparent"]),
      },
      priceComplaintRate: text.includes("expensive") || text.includes("overpriced") ? 1 : 0,
      valueForMoney: {
        score: isPositive ? 8 : 4,
        examples: extractValueExamples(text),
      },
    },
    
    // Trust & Reliability Metrics for Power tier
    trustReliability: {
      customerRetention: {
        callThemBack: text.includes("again") || text.includes("return") || text.includes("back"),
        loyaltyIndicators: extractLoyaltyIndicators(text),
      },
      consistentPerformance: {
        ratingStability: isPositive ? 8 : 4,
        timespan: "N/A", // Would be calculated from review history
      },
      reliabilityMentions: {
        frequency: countOccurrences(text, ["reliable", "dependable", "count on", "trust"]),
        examples: extractReliabilityExamples(text),
      },
    },
  };
}

// Helper function to extract keywords from review text
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'it', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any', 'few', 'more', 'most', 'other', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once']);
  
  // Extract meaningful words
  const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Get top keywords by frequency
  Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([word]) => keywords.push(word));
  
  return keywords;
}

// Helper function to extract topics from review text
function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const textLower = text.toLowerCase();
  
  // Service-related topics
  if (textLower.includes('install') || textLower.includes('installation')) topics.push('installation');
  if (textLower.includes('repair') || textLower.includes('fix')) topics.push('repair');
  if (textLower.includes('maintenance') || textLower.includes('service')) topics.push('maintenance');
  if (textLower.includes('emergency')) topics.push('emergency service');
  
  // Quality topics
  if (textLower.includes('quality') || textLower.includes('excellent')) topics.push('service quality');
  if (textLower.includes('professional') || textLower.includes('expert')) topics.push('professionalism');
  if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('value')) topics.push('pricing');
  
  // Customer experience topics
  if (textLower.includes('friendly') || textLower.includes('helpful')) topics.push('customer service');
  if (textLower.includes('time') || textLower.includes('quick') || textLower.includes('fast')) topics.push('timeliness');
  if (textLower.includes('clean') || textLower.includes('tidy')) topics.push('cleanliness');
  
  return topics.length > 0 ? topics : ['general service'];
}

// Generate mock industry-specific data
function generateMockIndustrySpecific(text: string, isPositive: boolean): any {
  const textLower = text.toLowerCase();
  
  // Default structure that can work for any service
  return {
    serviceQuality: {
      expertise_demonstrated: isPositive && (textLower.includes('expert') || textLower.includes('knowledg')),
      problem_solving: textLower.includes('solved') || textLower.includes('fixed'),
      attention_to_detail: textLower.includes('detail') || textLower.includes('thorough'),
      quality_score: isPositive ? 7 : 4,
    },
    customerService: {
      communication: textLower.includes('explain') || textLower.includes('communic'),
      reliability: textLower.includes('reliable') || textLower.includes('depend'),
      professionalism: textLower.includes('professional'),
      followup: textLower.includes('follow') || textLower.includes('check'),
    },
    valueProposition: {
      competitive_pricing: textLower.includes('fair') || textLower.includes('reasonable'),
      warranty_offered: textLower.includes('warrant') || textLower.includes('guarantee'),
      exceeded_expectations: textLower.includes('exceeded') || textLower.includes('beyond'),
      repeat_customer: textLower.includes('again') || textLower.includes('return'),
    },
  };
}

// Calculate confidence score based on review quality
function calculateConfidenceScore(reviewText: string, tags: any): number {
  let score = 50; // Base score
  
  // Add points for review length (more detailed reviews are more reliable)
  const wordCount = reviewText.split(/\s+/).length;
  if (wordCount > 100) score += 20;
  else if (wordCount > 50) score += 10;
  else if (wordCount < 20) score -= 10;
  
  // Add points for specific examples mentioned
  if (tags.qualityIndicators?.excellence?.specific_examples?.length > 0) score += 10;
  
  // Add points for multiple aspects covered
  let aspectsCovered = 0;
  if (tags.qualityIndicators?.excellence?.mentioned) aspectsCovered++;
  if (tags.serviceExcellence?.professionalism?.score > 0) aspectsCovered++;
  if (tags.customerExperience?.emotionalImpact?.emotional_intensity > 0) aspectsCovered++;
  if (tags.businessPerformance?.responseQuality?.response_speed_score > 0) aspectsCovered++;
  
  score += aspectsCovered * 5;
  
  // Cap at 100
  return Math.min(100, Math.max(0, score));
}

// Batch process multiple reviews
export const batchAnalyzeReviews = action({
  args: {
    businessId: v.id("businesses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get unanalyzed reviews for the business
    const reviews: any = await ctx.runQuery(internal.ai.analyzeReview.getUnanalyzedReviews, {
      businessId: args.businessId,
      limit: args.limit || 10,
    });

    const results = [];
    for (const review of reviews) {
      try {
        const result: any = await ctx.runAction("ai/analyzeReview:analyzeReviewWithAI" as any, {
          reviewId: review._id,
          businessId: args.businessId,
          reviewText: review.comment,
          rating: review.rating,
        });
        results.push({ reviewId: review._id, success: true, result });
      } catch (error) {
        console.error(`Failed to analyze review ${review._id}:`, error);
        results.push({ reviewId: review._id, success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  },
});

// Query to get unanalyzed reviews
export const getUnanalyzedReviews = internalQuery({
  args: {
    businessId: v.id("businesses"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all reviews for the business
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .take(100);

    // Get analyzed review IDs
    const analyzedTags = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();
    
    const analyzedReviewIds = new Set(analyzedTags.map(tag => tag.reviewId));
    
    // Filter for unanalyzed reviews
    const unanalyzedReviews = allReviews
      .filter(review => !analyzedReviewIds.has(review._id))
      .slice(0, args.limit);

    return unanalyzedReviews;
  },
});

// Helper function to extract specific examples from text
function extractExamples(text: string): string[] {
  const examples: string[] = [];
  
  // Look for specific service mentions
  const servicePatterns = [
    /fixed (?:the |our |my )?(\w+(?:\s+\w+)?)/g,
    /repaired (?:the |our |my )?(\w+(?:\s+\w+)?)/g,
    /installed (?:a |the |our |new )?(\w+(?:\s+\w+)?)/g,
    /replaced (?:the |our |my |old )?(\w+(?:\s+\w+)?)/g,
  ];
  
  servicePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 2) {
        examples.push(match[0]);
      }
    }
  });
  
  // Extract quoted phrases
  const quotedPhrases = text.match(/"([^"]+)"/g);
  if (quotedPhrases) {
    examples.push(...quotedPhrases.map(q => q.replace(/"/g, '')));
  }
  
  return examples.slice(0, 3); // Limit to 3 examples
}

// Helper function to analyze recommendation language strength
function analyzeRecommendationStrength(text: string, rating: number): number {
  let strength = rating >= 4 ? 6 : 3;
  
  // Strong positive indicators
  if (text.includes("highly recommend")) strength += 2;
  if (text.includes("definitely recommend")) strength += 2;
  if (text.includes("absolutely recommend")) strength += 2;
  if (text.includes("best") && text.includes("ever")) strength += 1;
  if (text.includes("go-to") || text.includes("goto")) strength += 1;
  
  // Negative indicators
  if (text.includes("would not recommend")) strength = 2;
  if (text.includes("never again")) strength = 1;
  if (text.includes("disappointed")) strength = Math.max(1, strength - 2);
  
  return Math.min(10, Math.max(0, strength));
}

// HELPER FUNCTIONS FOR CUSTOMER-FOCUSED ANALYSIS

// Extract meaningful quotes from customer reviews
function extractCustomerQuotes(text: string): string[] {
  const quotes: string[] = [];
  
  // Look for quoted text
  const quotedMatches = text.match(/"([^"]+)"/g);
  if (quotedMatches) {
    quotes.push(...quotedMatches.map(q => q.replace(/"/g, '')));
  }
  
  // Look for key phrases that are often quotable
  const keyPhrases = [
    /they (?:said|told me) "?(.+?)"?[,\.]/gi,
    /(?:arrived|came|showed up) (.+?) (?:and|which)/gi,
    /(?:fixed|repaired|solved) (.+?) (?:quickly|immediately|right away)/gi,
  ];
  
  keyPhrases.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 10 && match[1].length < 100) {
        quotes.push(match[1].trim());
      }
    }
  });
  
  return quotes.slice(0, 5); // Top 5 quotes
}

// Extract common phrases and their frequency
function extractCommonPhrases(text: string): Array<{ phrase: string, frequency: number }> {
  const phrases: Record<string, number> = {};
  const textLower = text.toLowerCase();
  
  // Common positive service phrases
  const servicePhrases = [
    "on time", "right the first time", "no surprises", "fair pricing",
    "excellent service", "highly recommend", "very professional",
    "great communication", "quick response", "same day", "emergency",
    "clean work", "attention to detail", "went above and beyond",
    "honest pricing", "transparent", "reliable service", "trust",
  ];
  
  servicePhrases.forEach(phrase => {
    const count = (textLower.match(new RegExp(phrase, 'g')) || []).length;
    if (count > 0) {
      phrases[phrase] = count;
    }
  });
  
  // Convert to array and sort by frequency
  return Object.entries(phrases)
    .map(([phrase, frequency]) => ({ phrase, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

// Analyze sentiment clusters around specific topics
function analyzeSentimentClusters(text: string, isPositive: boolean): Array<{ topic: string, sentiment: number, count: number }> {
  const clusters = [
    { topic: "pricing", keywords: ["price", "cost", "charge", "fee", "expensive", "affordable", "value"], sentiment: 0, count: 0 },
    { topic: "quality", keywords: ["quality", "excellent", "poor", "great", "terrible", "amazing"], sentiment: 0, count: 0 },
    { topic: "speed", keywords: ["quick", "fast", "slow", "immediate", "wait", "delay", "prompt"], sentiment: 0, count: 0 },
    { topic: "communication", keywords: ["explain", "communicate", "inform", "update", "responsive"], sentiment: 0, count: 0 },
    { topic: "trust", keywords: ["trust", "honest", "reliable", "dependable", "confidence"], sentiment: 0, count: 0 },
  ];
  
  const textLower = text.toLowerCase();
  
  clusters.forEach(cluster => {
    cluster.keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        cluster.count++;
        // Simple sentiment based on context
        cluster.sentiment = isPositive ? 0.8 : -0.5;
      }
    });
  });
  
  return clusters.filter(c => c.count > 0);
}

// Count occurrences of specific terms
function countOccurrences(text: string, terms: string[]): number {
  const textLower = text.toLowerCase();
  let count = 0;
  
  terms.forEach(term => {
    const regex = new RegExp(term.toLowerCase(), 'g');
    const matches = textLower.match(regex);
    count += matches ? matches.length : 0;
  });
  
  return count;
}

// Extract communication examples
function extractCommunicationExamples(text: string): string[] {
  const examples: string[] = [];
  const patterns = [
    /(?:explained|told me|informed me) (.+?)(?:\.|,|and)/gi,
    /kept (?:me|us) (.+?)(?:\.|,|and)/gi,
    /(?:called|texted|emailed) (.+?)(?:\.|,|and)/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 5) {
        examples.push(match[0].trim());
      }
    }
  });
  
  return examples.slice(0, 3);
}

// Analyze review with Gemini API
async function analyzeWithGemini(text: string, rating: number, category: string): Promise<any> {
  try {
    const prompt = buildGeminiPrompt(text, rating, category);
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          candidateCount: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content in Gemini response");
    }

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Build analysis prompt for Gemini
function buildGeminiPrompt(reviewText: string, rating: number, businessCategory: string): string {
  return `Analyze this ${rating}-star review for a ${businessCategory} business and extract structured tags for our quality-focused ranking system.

Review Text: "${reviewText}"

Return ONLY valid JSON with these exact fields:

{
  "qualityIndicators": {
    "excellence": {
      "mentioned": boolean,
      "intensity": number (0-10),
      "exceeded_expectations": boolean,
      "specific_examples": []
    },
    "firstTimeSuccess": {
      "mentioned": boolean,
      "precision_work": boolean,
      "got_it_right_first": boolean,
      "no_return_visits": boolean,
      "single_visit_complete": boolean
    },
    "attentionToDetail": {
      "mentioned": boolean,
      "thoroughness": number (0-10),
      "cleanliness": boolean,
      "careful_work": boolean
    }
  },
  "serviceExcellence": {
    "professionalism": {
      "score": number (0-10),
      "punctual": boolean,
      "courteous": boolean,
      "knowledgeable": boolean
    },
    "communication": {
      "score": number (0-10),
      "clear_explanation": boolean,
      "responsive": boolean,
      "kept_informed": boolean
    },
    "expertise": {
      "expert_referenced": boolean,
      "technical_competency": number (0-10),
      "specialist_noted": boolean,
      "master_craftsman": boolean
    }
  },
  "customerExperience": {
    "emotionalImpact": {
      "stress_relief": boolean,
      "peace_of_mind": boolean,
      "life_changing": boolean,
      "emotional_intensity": number (0-10)
    },
    "businessImpact": {
      "saved_money": boolean,
      "improved_efficiency": boolean,
      "prevented_disaster": boolean,
      "business_value_score": number (0-10)
    },
    "relationshipBuilding": {
      "trust_established": boolean,
      "personal_connection": boolean,
      "loyalty_indicated": boolean,
      "future_service_planned": boolean,
      "relationship_score": number (0-10)
    }
  },
  "competitiveMarkers": {
    "comparisonMentions": {
      "better_than_others": boolean,
      "best_in_area": boolean,
      "tried_others_first": boolean,
      "comparison_count": number
    },
    "marketPosition": {
      "local_favorite": boolean,
      "industry_leader": boolean,
      "go_to_provider": boolean
    },
    "differentiation": {
      "unique_approach": boolean,
      "special_equipment": boolean,
      "innovation_mentioned": boolean
    }
  },
  "businessPerformance": {
    "responseQuality": {
      "quick_response_mentioned": boolean,
      "same_day_service": boolean,
      "emergency_available": boolean,
      "response_speed_score": number (0-10)
    },
    "valueDelivery": {
      "fair_pricing": boolean,
      "worth_the_cost": boolean,
      "transparent_costs": boolean,
      "value_score": number (0-10)
    },
    "problemResolution": {
      "fixed_others_couldnt": boolean,
      "complex_issue_resolved": boolean,
      "creative_solution": boolean,
      "difficulty_level": number (0-10)
    }
  },
  "recommendationStrength": {
    "would_recommend": boolean,
    "already_recommended": boolean,
    "tell_everyone": boolean,
    "only_company_use": boolean,
    "advocacy_score": number (0-10)
  },
  "sentiment": {
    "overall": number (-1 to 1),
    "magnitude": number (0 to 1),
    "classification": "positive" | "neutral" | "negative"
  },
  "keywords": string[],
  "topics": string[],
  "confidence": number (0-100)
}

Be conservative with scoring - only mark true if explicitly mentioned. Use 0 for unmentioned numeric fields.`;
}

// Extract response time mentions
function extractResponseTime(text: string): string {
  const timePatterns = [
    /responded? (?:in|within) (\d+\s*(?:minute|hour|day)s?)/i,
    /(?:arrived|showed up) (?:in|within) (\d+\s*(?:minute|hour|day)s?)/i,
    /(\d+\s*(?:minute|hour|day)s?) (?:response|to respond)/i,
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return "Not specified";
}

// Extract value/pricing examples
function extractValueExamples(text: string): string[] {
  const examples: string[] = [];
  const patterns = [
    /(?:price|pricing|cost|charge) (?:was|were) (.+?)(?:\.|,|and)/gi,
    /(?:fair|reasonable|good) (?:price|pricing|value) (.+?)(?:\.|,|and)/gi,
    /no (?:hidden|surprise|unexpected) (.+?)(?:\.|,|and)/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        examples.push(match[0].trim());
      }
    }
  });
  
  return examples.slice(0, 3);
}

// Analyze review with Gemini API (duplicate 2)
async function analyzeWithGemini2(text: string, rating: number, category: string): Promise<any> {
  try {
    const prompt = buildGeminiPrompt2(text, rating, category);
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          candidateCount: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content in Gemini response");
    }

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Build analysis prompt for Gemini
function buildGeminiPrompt2(reviewText: string, rating: number, businessCategory: string): string {
  return `Analyze this ${rating}-star review for a ${businessCategory} business and extract structured tags for our quality-focused ranking system.

Review Text: "${reviewText}"

Return ONLY valid JSON with these exact fields:

{
  "qualityIndicators": {
    "excellence": {
      "mentioned": boolean,
      "intensity": number (0-10),
      "exceeded_expectations": boolean,
      "specific_examples": []
    },
    "firstTimeSuccess": {
      "mentioned": boolean,
      "precision_work": boolean,
      "got_it_right_first": boolean,
      "no_return_visits": boolean,
      "single_visit_complete": boolean
    },
    "attentionToDetail": {
      "mentioned": boolean,
      "thoroughness": number (0-10),
      "cleanliness": boolean,
      "careful_work": boolean
    }
  },
  "serviceExcellence": {
    "professionalism": {
      "score": number (0-10),
      "punctual": boolean,
      "courteous": boolean,
      "knowledgeable": boolean
    },
    "communication": {
      "score": number (0-10),
      "clear_explanation": boolean,
      "responsive": boolean,
      "kept_informed": boolean
    },
    "expertise": {
      "expert_referenced": boolean,
      "technical_competency": number (0-10),
      "specialist_noted": boolean,
      "master_craftsman": boolean
    }
  },
  "customerExperience": {
    "emotionalImpact": {
      "stress_relief": boolean,
      "peace_of_mind": boolean,
      "life_changing": boolean,
      "emotional_intensity": number (0-10)
    },
    "businessImpact": {
      "saved_money": boolean,
      "improved_efficiency": boolean,
      "prevented_disaster": boolean,
      "business_value_score": number (0-10)
    },
    "relationshipBuilding": {
      "trust_established": boolean,
      "personal_connection": boolean,
      "loyalty_indicated": boolean,
      "future_service_planned": boolean,
      "relationship_score": number (0-10)
    }
  },
  "competitiveMarkers": {
    "comparisonMentions": {
      "better_than_others": boolean,
      "best_in_area": boolean,
      "tried_others_first": boolean,
      "comparison_count": number
    },
    "marketPosition": {
      "local_favorite": boolean,
      "industry_leader": boolean,
      "go_to_provider": boolean
    },
    "differentiation": {
      "unique_approach": boolean,
      "special_equipment": boolean,
      "innovation_mentioned": boolean
    }
  },
  "businessPerformance": {
    "responseQuality": {
      "quick_response_mentioned": boolean,
      "same_day_service": boolean,
      "emergency_available": boolean,
      "response_speed_score": number (0-10)
    },
    "valueDelivery": {
      "fair_pricing": boolean,
      "worth_the_cost": boolean,
      "transparent_costs": boolean,
      "value_score": number (0-10)
    },
    "problemResolution": {
      "fixed_others_couldnt": boolean,
      "complex_issue_resolved": boolean,
      "creative_solution": boolean,
      "difficulty_level": number (0-10)
    }
  },
  "recommendationStrength": {
    "would_recommend": boolean,
    "already_recommended": boolean,
    "tell_everyone": boolean,
    "only_company_use": boolean,
    "advocacy_score": number (0-10)
  },
  "sentiment": {
    "overall": number (-1 to 1),
    "magnitude": number (0 to 1),
    "classification": "positive" | "neutral" | "negative"
  },
  "keywords": string[],
  "topics": string[],
  "confidence": number (0-100)
}

Be conservative with scoring - only mark true if explicitly mentioned. Use 0 for unmentioned numeric fields.`;
}

// Extract loyalty indicators
function extractLoyaltyIndicators(text: string): string[] {
  const indicators: string[] = [];
  const loyaltyPhrases = [
    "will use again", "definitely coming back", "my go-to",
    "only company I trust", "always call them", "loyal customer",
    "been using for years", "wouldn't go anywhere else",
  ];
  
  const textLower = text.toLowerCase();
  loyaltyPhrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      indicators.push(phrase);
    }
  });
  
  return indicators;
}

// Extract reliability examples
function extractReliabilityExamples(text: string): string[] {
  const examples: string[] = [];
  const patterns = [
    /(?:reliable|dependable|count on|trust) (.+?)(?:\.|,|and)/gi,
    /always (?:on time|professional|deliver) (.+?)(?:\.|,|and)/gi,
    /never (?:late|disappointed|let me down) (.+?)(?:\.|,|and)/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        examples.push(match[0].trim());
      }
    }
  });
  
  return examples.slice(0, 3);
}

// Analyze review with Gemini API (duplicate 3)
async function analyzeWithGemini3(text: string, rating: number, category: string): Promise<any> {
  try {
    const prompt = buildGeminiPrompt3(text, rating, category);
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          candidateCount: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content in Gemini response");
    }

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Build analysis prompt for Gemini
function buildGeminiPrompt3(reviewText: string, rating: number, businessCategory: string): string {
  return `Analyze this ${rating}-star review for a ${businessCategory} business and extract structured tags for our quality-focused ranking system.

Review Text: "${reviewText}"

Return ONLY valid JSON with these exact fields:

{
  "qualityIndicators": {
    "excellence": {
      "mentioned": boolean,
      "intensity": number (0-10),
      "exceeded_expectations": boolean,
      "specific_examples": []
    },
    "firstTimeSuccess": {
      "mentioned": boolean,
      "precision_work": boolean,
      "got_it_right_first": boolean,
      "no_return_visits": boolean,
      "single_visit_complete": boolean
    },
    "attentionToDetail": {
      "mentioned": boolean,
      "thoroughness": number (0-10),
      "cleanliness": boolean,
      "careful_work": boolean
    }
  },
  "serviceExcellence": {
    "professionalism": {
      "score": number (0-10),
      "punctual": boolean,
      "courteous": boolean,
      "knowledgeable": boolean
    },
    "communication": {
      "score": number (0-10),
      "clear_explanation": boolean,
      "responsive": boolean,
      "kept_informed": boolean
    },
    "expertise": {
      "expert_referenced": boolean,
      "technical_competency": number (0-10),
      "specialist_noted": boolean,
      "master_craftsman": boolean
    }
  },
  "customerExperience": {
    "emotionalImpact": {
      "stress_relief": boolean,
      "peace_of_mind": boolean,
      "life_changing": boolean,
      "emotional_intensity": number (0-10)
    },
    "businessImpact": {
      "saved_money": boolean,
      "improved_efficiency": boolean,
      "prevented_disaster": boolean,
      "business_value_score": number (0-10)
    },
    "relationshipBuilding": {
      "trust_established": boolean,
      "personal_connection": boolean,
      "loyalty_indicated": boolean,
      "future_service_planned": boolean,
      "relationship_score": number (0-10)
    }
  },
  "competitiveMarkers": {
    "comparisonMentions": {
      "better_than_others": boolean,
      "best_in_area": boolean,
      "tried_others_first": boolean,
      "comparison_count": number
    },
    "marketPosition": {
      "local_favorite": boolean,
      "industry_leader": boolean,
      "go_to_provider": boolean
    },
    "differentiation": {
      "unique_approach": boolean,
      "special_equipment": boolean,
      "innovation_mentioned": boolean
    }
  },
  "businessPerformance": {
    "responseQuality": {
      "quick_response_mentioned": boolean,
      "same_day_service": boolean,
      "emergency_available": boolean,
      "response_speed_score": number (0-10)
    },
    "valueDelivery": {
      "fair_pricing": boolean,
      "worth_the_cost": boolean,
      "transparent_costs": boolean,
      "value_score": number (0-10)
    },
    "problemResolution": {
      "fixed_others_couldnt": boolean,
      "complex_issue_resolved": boolean,
      "creative_solution": boolean,
      "difficulty_level": number (0-10)
    }
  },
  "recommendationStrength": {
    "would_recommend": boolean,
    "already_recommended": boolean,
    "tell_everyone": boolean,
    "only_company_use": boolean,
    "advocacy_score": number (0-10)
  },
  "sentiment": {
    "overall": number (-1 to 1),
    "magnitude": number (0 to 1),
    "classification": "positive" | "neutral" | "negative"
  },
  "keywords": string[],
  "topics": string[],
  "confidence": number (0-100)
}

Be conservative with scoring - only mark true if explicitly mentioned. Use 0 for unmentioned numeric fields.`;
}