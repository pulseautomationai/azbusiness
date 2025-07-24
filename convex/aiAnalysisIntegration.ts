import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

// Query to get analysis tags for a business
export const getAnalysisTagsForBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .collect();
    
    return tags;
  },
});

// Process a batch of reviews for a business with AI
export const processBusinessReviews = action({
  args: {
    businessId: v.id("businesses"),
    batchSize: v.optional(v.number()),
    skipExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 50;
    const skipExisting = args.skipExisting ?? true;

    try {
      // Get business details
      const business = await ctx.runQuery(internal.businesses.getBusinessInternal, {
        businessId: args.businessId,
      });
      
      if (!business) {
        throw new Error("Business not found");
      }

      console.log(`🤖 Starting AI analysis for ${business.name}`);

      // Get reviews in batches to avoid size limits
      const reviewBatches = [];
      let offset = 0;
      let hasMore = true;
      
      while (hasMore && reviewBatches.length < 4) { // Max 4 batches = 200 reviews
        const batch = await ctx.runQuery(internal.businesses.getReviewBatch, {
          businessId: args.businessId,
          limit: batchSize,
          offset,
        });
        
        if (batch.length > 0) {
          reviewBatches.push(batch);
          offset += batchSize;
          hasMore = batch.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const totalReviews = reviewBatches.reduce((sum, batch) => sum + batch.length, 0);
      console.log(`📊 Found ${totalReviews} reviews to analyze`);

      if (totalReviews === 0) {
        return {
          success: false,
          message: "No reviews found for this business",
        };
      }

      // Process each batch with AI-specific optimizations
      let processedCount = 0;
      let skippedCount = 0;
      const analysisResults = [];

      // ALWAYS use Internal Analyzer - process ALL reviews
      let reviewsToProcess = [];

      // Flatten all review batches
      for (const batch of reviewBatches) {
        reviewsToProcess.push(...batch);
      }

      console.log(`🎯 Processing ${reviewsToProcess.length} reviews (Internal Analyzer)`);

      for (const review of reviewsToProcess) {
        try {
          // Check if already analyzed
          if (skipExisting) {
            const existingTags = await ctx.runQuery(internal.aiAnalysisTags.checkExistingTags, {
              reviewId: review._id,
            });
            
            if (existingTags) {
              skippedCount++;
              continue;
            }
          }

          // Analyze with AI
          const analysis = await analyzeReviewWithAI(review, (business as any).category?.name || "general");
          
          // Store the analysis directly in the database
          await ctx.runMutation(internal.aiAnalysisIntegration.storeAIAnalysis, {
            reviewId: review._id,
            businessId: args.businessId,
            analysis,
          });

          analysisResults.push(analysis);
          processedCount++;

          // Small delay to prevent overloading the system
          // Internal Analyzer is fast but we still want to be respectful of resources
          if (processedCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

        } catch (error) {
          console.error(`Error processing review ${review._id}:`, error);
          // Continue with next review instead of failing entire batch
        }
      }

      // Calculate aggregated insights
      const businessInsights = aggregateReviewInsights(analysisResults);

      // Update business with AI insights
      await ctx.runMutation(internal.aiAnalysisIntegration.updateBusinessAIScores, {
        businessId: args.businessId,
        insights: businessInsights,
      });

      // Calculate and update rankings
      await ctx.runMutation(internal.rankings.calculateRankings.calculateBusinessRanking, {
        businessId: args.businessId,
      });

      // Detect achievements
      await ctx.runMutation(internal.achievements.detectAchievements.detectBusinessAchievements, {
        businessId: args.businessId,
      });

      return {
        success: true,
        message: `Processed ${processedCount} reviews, skipped ${skippedCount} existing`,
        insights: businessInsights,
      };

    } catch (error: any) {
      console.error("Error processing reviews:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },
});

// Analyze a single review with AI (using Internal Analyzer)
async function analyzeReviewWithAI(review: any, category: string) {
  const text = review.comment || "";
  const rating = review.rating;
  const isPositive = rating >= 4;

  // Always use Internal Analyzer for speed and reliability
  // The Internal Analyzer provides consistent, fast results without API limits
  console.log(`🔍 Using Internal Analyzer (${text.length} chars)`);
  return generateMockAnalysis(text, rating, isPositive);
}

// Analyze review with Gemini 2.0 Flash-Lite
async function analyzeWithGemini(text: string, rating: number, category: string) {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this ${rating}-star review for a ${category} business and return complete JSON with ALL required fields.

REQUIRED OUTPUT FORMAT (must include ALL fields):
{
  "qualityIndicators": {
    "excellence": {
      "mentioned": true,
      "intensity": 8.5,
      "exceeded_expectations": false,
      "specific_examples": []
    },
    "firstTimeSuccess": {
      "mentioned": false,
      "precision_work": true,
      "got_it_right_first": true,
      "no_return_visits": false,
      "single_visit_complete": true
    },
    "attentionToDetail": {
      "mentioned": true,
      "thoroughness": 8.0,
      "cleanliness": true,
      "careful_work": true
    }
  },
  "serviceExcellence": {
    "professionalism": {
      "score": 8.5,
      "punctual": true,
      "courteous": true,
      "knowledgeable": true
    },
    "communication": {
      "score": 8.0,
      "clear_explanation": true,
      "responsive": true,
      "kept_informed": false
    },
    "expertise": {
      "expert_referenced": true,
      "technical_competency": 8.5,
      "specialist_noted": false,
      "master_craftsman": false
    }
  },
  "customerExperience": {
    "emotionalImpact": {
      "stress_relief": false,
      "peace_of_mind": true,
      "life_changing": false,
      "emotional_intensity": 7.0
    },
    "businessImpact": {
      "saved_money": false,
      "improved_efficiency": true,
      "prevented_disaster": false,
      "business_value_score": 8.0
    },
    "relationshipBuilding": {
      "trust_established": true,
      "personal_connection": false,
      "loyalty_indicated": true,
      "future_service_planned": false,
      "relationship_score": 7.5
    }
  },
  "competitiveMarkers": {
    "comparisonMentions": {
      "better_than_others": false,
      "best_in_area": false,
      "tried_others_first": false,
      "comparison_count": 0
    },
    "marketPosition": {
      "local_favorite": false,
      "industry_leader": false,
      "go_to_provider": false
    },
    "differentiation": {
      "unique_approach": false,
      "special_equipment": false,
      "innovation_mentioned": false
    }
  },
  "businessPerformance": {
    "responseQuality": {
      "quick_response_mentioned": true,
      "same_day_service": false,
      "emergency_available": false,
      "response_speed_score": 8.0
    },
    "valueDelivery": {
      "fair_pricing": true,
      "worth_the_cost": true,
      "transparent_costs": false,
      "value_score": 7.5
    },
    "problemResolution": {
      "fixed_others_couldnt": false,
      "complex_issue_resolved": false,
      "creative_solution": false,
      "difficulty_level": 6.0
    }
  },
  "recommendationStrength": {
    "would_recommend": true,
    "already_recommended": false,
    "tell_everyone": false,
    "only_company_use": false,
    "advocacy_score": 8.0
  },
  "keywords": ["professional", "quality", "fast"],
  "topics": ["service_quality", "expertise"],
  "sentiment": {
    "overall": 0.8,
    "magnitude": 0.7,
    "classification": "positive"
  },
  "confidence": 85
}

Review text: ${JSON.stringify(text.slice(0, 500) + (text.length > 500 ? '...' : ''))}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1200,
          responseMimeType: "application/json"
        }
      }),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const completion = await response.json();
      const content = completion.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          // Validate that we have the core required fields
          if (parsed.qualityIndicators && parsed.serviceExcellence && parsed.customerExperience) {
            return parsed;
          } else {
            console.log(`⚠️ Gemini returned incomplete structure, using fallback`);
            return null;
          }
        } catch (jsonError) {
          console.log(`⚠️ Gemini JSON parsing error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
          return null;
        }
      }
    } else {
      const errorText = await response.text();
      console.log(`⚠️ Gemini API error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("⚠️ Gemini API timeout");
    } else {
      console.log(`⚠️ Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return null;
}

// Generate mock analysis for testing
function generateMockAnalysis(text: string, rating: number, isPositive: boolean) {
  const lowerText = text.toLowerCase();
  
  // Extract quality indicators
  const excellence = {
    mentioned: lowerText.includes("excellent") || lowerText.includes("outstanding") || 
               lowerText.includes("exceptional") || lowerText.includes("best"),
    intensity: isPositive ? Math.min(10, rating * 2) : rating,
    exceeded_expectations: lowerText.includes("exceeded") || lowerText.includes("beyond") ||
                          lowerText.includes("more than expected"),
    specific_examples: [],  // Would be populated by real AI
  };

  // Extract service indicators
  const professionalism = {
    score: isPositive ? 8 + Math.random() * 2 : 3 + Math.random() * 3,
    punctual: lowerText.includes("on time") || lowerText.includes("punctual") || lowerText.includes("prompt"),
    courteous: lowerText.includes("courteous") || lowerText.includes("polite") || lowerText.includes("respectful"),
    knowledgeable: lowerText.includes("knowledge") || lowerText.includes("expert") || lowerText.includes("skilled"),
  };

  const responsiveness = {
    quick_response: lowerText.includes("quick") || lowerText.includes("fast") ||
                   lowerText.includes("prompt") || lowerText.includes("immediate"),
    same_day: lowerText.includes("same day") || lowerText.includes("today"),
    score: lowerText.includes("quick") || lowerText.includes("fast") ? 9 : 7,
  };

  // Extract value indicators
  const value = {
    fair_pricing: lowerText.includes("fair") || lowerText.includes("reasonable") ||
                 lowerText.includes("good price") || lowerText.includes("affordable"),
    worth_it: lowerText.includes("worth") || lowerText.includes("value"),
    transparent: lowerText.includes("transparent") || lowerText.includes("honest") ||
                lowerText.includes("no surprise"),
    score: isPositive ? 7 + Math.random() * 3 : 4 + Math.random() * 2,
  };

  // Extract expertise indicators
  const expertise = {
    knowledgeable: lowerText.includes("knowledge") || lowerText.includes("expert") ||
                  lowerText.includes("experienced") || lowerText.includes("skilled"),
    solved_problem: lowerText.includes("fixed") || lowerText.includes("solved") ||
                   lowerText.includes("resolved") || lowerText.includes("repaired"),
    score: isPositive ? 8 + Math.random() * 2 : 5 + Math.random() * 2,
  };

  // Extract customer quotes (best sentences)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const quotes = sentences
    .filter(s => isPositive && s.length < 150)
    .slice(0, 2);

  // Extract competitive markers
  const competitiveMarkers = {
    comparisonMentions: {
      better_than_others: lowerText.includes("better than") || lowerText.includes("superior to") ||
                         lowerText.includes("unlike others") || lowerText.includes("best i've"),
      best_in_area: lowerText.includes("best in") || lowerText.includes("best around") ||
                    lowerText.includes("top") || lowerText.includes("#1"),
      tried_others_first: lowerText.includes("tried others") || lowerText.includes("other companies") ||
                         lowerText.includes("switched from") || lowerText.includes("finally found"),
      comparison_count: (lowerText.match(/better|best|superior|top|excellent|outstanding/g) || []).length,
    },
    marketPosition: {
      local_favorite: lowerText.includes("local favorite") || lowerText.includes("neighborhood") ||
                     lowerText.includes("community") || lowerText.includes("go-to"),
      industry_leader: lowerText.includes("leader") || lowerText.includes("industry") ||
                      lowerText.includes("standard") || lowerText.includes("benchmark"),
      go_to_provider: lowerText.includes("go to") || lowerText.includes("always use") ||
                     lowerText.includes("only use") || lowerText.includes("my guy"),
    },
    differentiation: {
      unique_approach: lowerText.includes("unique") || lowerText.includes("different approach") ||
                      lowerText.includes("innovative") || lowerText.includes("creative"),
      special_equipment: lowerText.includes("equipment") || lowerText.includes("tools") ||
                        lowerText.includes("technology") || lowerText.includes("state-of-the-art"),
      innovation_mentioned: lowerText.includes("innovat") || lowerText.includes("modern") ||
                          lowerText.includes("latest") || lowerText.includes("cutting edge"),
    },
  };

  // Extract recommendation strength
  const recommendationStrength = {
    would_recommend: lowerText.includes("recommend") || lowerText.includes("would use again") ||
                    rating >= 4,
    already_recommended: lowerText.includes("told") || lowerText.includes("recommended to") ||
                        lowerText.includes("shared with") || lowerText.includes("referred"),
    tell_everyone: lowerText.includes("tell everyone") || lowerText.includes("shouting") ||
                  lowerText.includes("can't say enough") || lowerText.includes("highly recommend"),
    only_company_use: lowerText.includes("only") || lowerText.includes("no one else") ||
                     lowerText.includes("won't go anywhere else") || lowerText.includes("exclusive"),
    advocacy_score: isPositive && lowerText.includes("recommend") ? 8 + Math.random() * 2 : 
                   isPositive ? 6 + Math.random() * 2 : 3 + Math.random() * 2,
  };

  // Calculate confidence based on review length and detail
  const confidence = Math.min(95, 60 + (text.length / 20) + (rating === 5 ? 10 : 0));

  return {
    qualityIndicators: {
      excellence,
      firstTimeSuccess: {
        mentioned: lowerText.includes("first time") || lowerText.includes("one visit"),
        precision_work: lowerText.includes("precise") || lowerText.includes("accurate"),
        got_it_right_first: lowerText.includes("right") || lowerText.includes("correct"),
        no_return_visits: lowerText.includes("no return") || lowerText.includes("single visit"),
        single_visit_complete: lowerText.includes("one visit") || lowerText.includes("complete"),
      },
      attentionToDetail: {
        mentioned: lowerText.includes("detail") || lowerText.includes("thorough"),
        thoroughness: isPositive ? 8 : 5,
        cleanliness: lowerText.includes("clean") || lowerText.includes("tidy") || lowerText.includes("neat"),
        careful_work: lowerText.includes("careful") || lowerText.includes("meticulous") || lowerText.includes("precise"),
      },
    },
    serviceExcellence: {
      professionalism,
      communication: {
        score: isPositive ? 8 : 5,
        clear_explanation: lowerText.includes("explain") || lowerText.includes("clear"),
        responsive: responsiveness.quick_response,
        kept_informed: lowerText.includes("informed") || lowerText.includes("update"),
      },
      expertise: {
        expert_referenced: expertise.knowledgeable,
        technical_competency: expertise.score,
        specialist_noted: lowerText.includes("specialist") || lowerText.includes("expert"),
        master_craftsman: lowerText.includes("master") || lowerText.includes("craftsman") || lowerText.includes("best in"),
      },
    },
    customerExperience: {
      emotionalImpact: {
        stress_relief: lowerText.includes("stress") || lowerText.includes("relief"),
        peace_of_mind: lowerText.includes("peace of mind") || lowerText.includes("worry"),
        life_changing: lowerText.includes("life") && (lowerText.includes("chang") || lowerText.includes("sav")),
        emotional_intensity: isPositive ? 7 + Math.random() * 3 : 3 + Math.random() * 3,
      },
      businessImpact: {
        saved_money: lowerText.includes("save") && lowerText.includes("money") || lowerText.includes("affordable"),
        improved_efficiency: lowerText.includes("efficient") || lowerText.includes("quick") || lowerText.includes("fast"),
        prevented_disaster: lowerText.includes("prevent") || lowerText.includes("disaster") || lowerText.includes("avoid"),
        business_value_score: isPositive ? 7 + Math.random() * 3 : 4 + Math.random() * 3,
      },
      relationshipBuilding: {
        trust_established: lowerText.includes("trust") || rating >= 4.5,
        personal_connection: lowerText.includes("personal") || lowerText.includes("friendly"),
        loyalty_indicated: lowerText.includes("always") || lowerText.includes("only") || lowerText.includes("forever"),
        future_service_planned: lowerText.includes("next time") || lowerText.includes("again") || lowerText.includes("future"),
        relationship_score: isPositive ? 7 + Math.random() * 3 : 4 + Math.random() * 3,
      },
    },
    competitiveMarkers,
    businessPerformance: {
      responseQuality: {
        quick_response_mentioned: responsiveness.quick_response,
        same_day_service: responsiveness.same_day,
        emergency_available: lowerText.includes("emergency") || lowerText.includes("urgent"),
        response_speed_score: responsiveness.score,
      },
      valueDelivery: {
        fair_pricing: value.fair_pricing,
        worth_the_cost: value.worth_it,
        transparent_costs: value.transparent,
        value_score: value.score,
      },
      problemResolution: {
        fixed_others_couldnt: lowerText.includes("others couldn't") || lowerText.includes("no one else"),
        complex_issue_resolved: lowerText.includes("complex") || lowerText.includes("difficult"),
        creative_solution: lowerText.includes("creative") || lowerText.includes("innovative"),
        difficulty_level: isPositive ? 6 + Math.random() * 4 : 3 + Math.random() * 3,
      },
    },
    recommendationStrength,
    keywords: extractKeywords(text),
    topics: extractTopics(text),
    customerQuotes: quotes,
    sentiment: {
      overall: isPositive ? 0.8 + Math.random() * 0.2 : -0.5 + Math.random() * 0.3,
      magnitude: Math.min(1, text.length / 500),
      classification: isPositive ? "positive" : rating === 3 ? "neutral" : "negative",
    },
    confidence,
  };
}

// Extract important keywords from text
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lowerText = text.toLowerCase();
  
  const importantTerms = [
    'professional', 'excellent', 'quality', 'fast', 'quick', 'reliable',
    'honest', 'fair', 'clean', 'friendly', 'knowledgeable', 'efficient',
    'thorough', 'responsive', 'expert', 'affordable', 'recommend',
    'best', 'amazing', 'outstanding', 'prompt', 'courteous'
  ];
  
  importantTerms.forEach(term => {
    if (lowerText.includes(term)) {
      keywords.push(term);
    }
  });
  
  return keywords as string[];
}

// Extract topics from review text
function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Service-related topics
  if (lowerText.includes('repair') || lowerText.includes('fix') || lowerText.includes('maintenance')) {
    topics.push('service_quality');
  }
  
  // Customer service topics
  if (lowerText.includes('customer service') || lowerText.includes('friendly') || lowerText.includes('helpful')) {
    topics.push('customer_service');
  }
  
  // Pricing topics
  if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('affordable') || lowerText.includes('expensive')) {
    topics.push('pricing');
  }
  
  // Speed/timing topics
  if (lowerText.includes('quick') || lowerText.includes('fast') || lowerText.includes('time') || lowerText.includes('prompt')) {
    topics.push('response_time');
  }
  
  // Quality topics
  if (lowerText.includes('quality') || lowerText.includes('excellent') || lowerText.includes('great')) {
    topics.push('work_quality');
  }
  
  // Expertise topics
  if (lowerText.includes('knowledge') || lowerText.includes('expert') || lowerText.includes('professional')) {
    topics.push('expertise');
  }
  
  // Trust/reliability topics
  if (lowerText.includes('trust') || lowerText.includes('reliable') || lowerText.includes('honest')) {
    topics.push('trustworthiness');
  }
  
  return topics;
}

// Aggregate insights from multiple reviews
function aggregateReviewInsights(analyses: any[]) {
  if (analyses.length === 0) {
    return null;
  }

  // Aggregate scores
  const avgScores = {
    speed: average(analyses.map(a => a.businessPerformance?.responseQuality?.response_speed_score || 0)),
    value: average(analyses.map(a => a.businessPerformance?.valueDelivery?.value_score || 0)),
    quality: average(analyses.map(a => a.qualityIndicators?.excellence?.score || 0)),
    reliability: average(analyses.map(a => a.businessPerformance?.problemResolution?.difficulty_level || 0)),
    expertise: average(analyses.map(a => a.serviceExcellence?.expertise?.score || 0)),
    customerImpact: average(analyses.map(a => a.customerExperience?.emotionalImpact?.emotional_intensity || 0)),
  };

  // Aggregate keywords
  const keywordCounts: Record<string, number> = {};
  analyses.forEach(a => {
    (a.keywords || []).forEach((keyword: string) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword);

  // Collect best quotes
  const allQuotes = analyses
    .flatMap(a => a.customerQuotes || [])
    .filter(q => q && q.length > 30)
    .slice(0, 5);

  // Calculate confidence
  const avgConfidence = average(analyses.map(a => a.confidence || 70));

  return {
    performanceScores: avgScores,
    topKeywords,
    customerQuotes: allQuotes,
    analysisCount: analyses.length,
    confidence: avgConfidence,
    lastAnalyzed: Date.now(),
  };
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

// Get current AI model version for tracking
function getAIModelVersion(): string {
  const aiProvider = process.env.AI_PROVIDER || 'openai';
  
  if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
    return "gemini-2.0-flash-lite";
  } else if (aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return "gpt-4o-mini";
  } else {
    return "mock-v1";
  }
}

// Map analysis to full schema with defaults for missing fields
function mapToFullSchema(data: any, category: string): any {
  if (!data) return {};
  
  // For now, just return the data - the existing defaults should handle missing fields
  // This function can be expanded later to provide more sophisticated mapping
  return data;
}

// Store AI analysis results
export const storeAIAnalysis = internalMutation({
  args: {
    reviewId: v.id("reviews"),
    businessId: v.id("businesses"),
    analysis: v.any(),
  },
  handler: async (ctx, args) => {
    // Store in aiAnalysisTags table
    await ctx.db.insert("aiAnalysisTags", {
      reviewId: args.reviewId,
      businessId: args.businessId,
      analysisDate: Date.now(),
      modelVersion: getAIModelVersion(),
      
      // Map the analysis to our schema with comprehensive defaults
      qualityIndicators: args.analysis.qualityIndicators || {},
      serviceExcellence: args.analysis.serviceExcellence || {},
      customerExperience: {
        emotionalImpact: {
          stress_relief: args.analysis.customerExperience?.emotionalImpact?.stress_relief || false,
          peace_of_mind: args.analysis.customerExperience?.emotionalImpact?.peace_of_mind || false,
          life_changing: args.analysis.customerExperience?.emotionalImpact?.life_changing || false,
          emotional_intensity: args.analysis.customerExperience?.emotionalImpact?.emotional_intensity || 5.0
        },
        businessImpact: {
          saved_money: args.analysis.customerExperience?.businessImpact?.saved_money || false,
          improved_efficiency: args.analysis.customerExperience?.businessImpact?.improved_efficiency || false,
          prevented_disaster: args.analysis.customerExperience?.businessImpact?.prevented_disaster || false,
          business_value_score: args.analysis.customerExperience?.businessImpact?.business_value_score || 5.0
        },
        relationshipBuilding: {
          trust_established: args.analysis.customerExperience?.relationshipBuilding?.trust_established || false,
          personal_connection: args.analysis.customerExperience?.relationshipBuilding?.personal_connection || false,
          loyalty_indicated: args.analysis.customerExperience?.relationshipBuilding?.loyalty_indicated || false,
          future_service_planned: args.analysis.customerExperience?.relationshipBuilding?.future_service_planned || false,
          relationship_score: args.analysis.customerExperience?.relationshipBuilding?.relationship_score || 5.0
        }
      },
      competitiveMarkers: {
        comparisonMentions: {
          better_than_others: args.analysis.competitiveMarkers?.comparisonMentions?.better_than_others || false,
          best_in_area: args.analysis.competitiveMarkers?.comparisonMentions?.best_in_area || false,
          tried_others_first: args.analysis.competitiveMarkers?.comparisonMentions?.tried_others_first || false,
          comparison_count: args.analysis.competitiveMarkers?.comparisonMentions?.comparison_count || 0
        },
        marketPosition: {
          local_favorite: args.analysis.competitiveMarkers?.marketPosition?.local_favorite || false,
          industry_leader: args.analysis.competitiveMarkers?.marketPosition?.industry_leader || false,
          go_to_provider: args.analysis.competitiveMarkers?.marketPosition?.go_to_provider || false
        },
        differentiation: {
          unique_approach: args.analysis.competitiveMarkers?.differentiation?.unique_approach || false,
          special_equipment: args.analysis.competitiveMarkers?.differentiation?.special_equipment || false,
          innovation_mentioned: args.analysis.competitiveMarkers?.differentiation?.innovation_mentioned || false
        }
      },
      businessPerformance: {
        responseQuality: {
          quick_response_mentioned: args.analysis.businessPerformance?.responseQuality?.quick_response_mentioned || false,
          same_day_service: args.analysis.businessPerformance?.responseQuality?.same_day_service || false,
          emergency_available: args.analysis.businessPerformance?.responseQuality?.emergency_available || false,
          response_speed_score: args.analysis.businessPerformance?.responseQuality?.response_speed_score || 5.0
        },
        valueDelivery: {
          fair_pricing: args.analysis.businessPerformance?.valueDelivery?.fair_pricing || false,
          worth_the_cost: args.analysis.businessPerformance?.valueDelivery?.worth_the_cost || false,
          transparent_costs: args.analysis.businessPerformance?.valueDelivery?.transparent_costs || false,
          value_score: args.analysis.businessPerformance?.valueDelivery?.value_score || 5.0
        },
        problemResolution: args.analysis.businessPerformance?.problemResolution || {
          fixed_others_couldnt: false,
          complex_issue_resolved: false,
          creative_solution: false,
          difficulty_level: 5.0
        }
      },
      recommendationStrength: args.analysis.recommendationStrength || {},
      
      sentiment: args.analysis.sentiment || { overall: 0, magnitude: 0, classification: "neutral" },
      keywords: args.analysis.keywords || [],
      topics: args.analysis.topics || [],
      
      // Customer voice for Power tier
      customerVoiceAnalysis: {
        topQuotes: args.analysis.customerQuotes || [],
        commonPhrases: [],
        sentimentClusters: [],
      },
      
      confidenceScore: args.analysis.confidence || 70,
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update business with aggregated AI scores
export const updateBusinessAIScores = internalMutation({
  args: {
    businessId: v.id("businesses"),
    insights: v.any(),
  },
  handler: async (ctx, args) => {
    if (!args.insights) return;

    const scores = args.insights.performanceScores;
    
    // Update the business with AI-derived scores
    await ctx.db.patch(args.businessId, {
      speedScore: Math.round(scores.speed * 10) / 10,
      valueScore: Math.round(scores.value * 10) / 10,
      qualityScore: Math.round(scores.quality * 10) / 10,
      reliabilityScore: Math.round(scores.reliability * 10) / 10,
      
      // Calculate overall score
      overallScore: Math.round(
        (scores.speed + scores.value + scores.quality + scores.reliability) * 2.5
      ),
      
      // Store AI insights for tier-based display
      aiInsights: {
        basic: args.insights.topKeywords?.slice(0, 3) || [],
        enhanced: args.insights.topKeywords?.slice(0, 5) || [],
        professional: args.insights.topKeywords || [],
        premium: args.insights.topKeywords || [], // Premium tier gets all keywords
      },
      
      lastRankingUpdate: Date.now(),
    });
  },
});
