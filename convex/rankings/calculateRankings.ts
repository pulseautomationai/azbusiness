import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

// Weight configuration for quality-focused ranking (matches algorithm document)
const RANKING_WEIGHTS = {
  qualityIndicators: 0.25,      // 25% - Excellence, first-time success, attention to detail
  serviceExcellence: 0.20,      // 20% - Professionalism, communication, expertise
  customerExperience: 0.20,     // 20% - Emotional impact, business value, relationships
  technicalMastery: 0.15,       // 15% - Problem solving, technical expertise
  competitiveAdvantage: 0.10,   // 10% - Market comparison, differentiation
  operationalExcellence: 0.10,  // 10% - Speed, value, reliability
};

// Minimum thresholds for ranking
const MIN_REVIEWS_FOR_RANKING = 5;  // Minimum for statistical confidence
const MIN_CONFIDENCE_SCORE = 60;    // Minimum confidence in analysis

// Confidence multiplier configuration
const CONFIDENCE_CONFIG = {
  MINIMUM_RELIABLE: 5,    // Below this, 60-80% of score
  OPTIMAL_SAMPLE: 20,     // 100% of score
  MAXIMUM_BENEFIT: 35,    // Up to 110% of score
  MIN_MULTIPLIER: 0.6,    // 60% minimum
  MAX_MULTIPLIER: 1.1,    // 110% maximum
};

// Recency weight configuration (days)
const RECENCY_WEIGHTS = [
  { days: 30, weight: 1.0 },    // Last 30 days: 100%
  { days: 60, weight: 0.8 },    // 31-60 days: 80%
  { days: 90, weight: 0.6 },    // 61-90 days: 60%
  { days: 180, weight: 0.4 },   // 91-180 days: 40%
  { days: Infinity, weight: 0.2 }, // Older: 20%
];

// Calculate rankings for a specific business
export const calculateBusinessRanking = internalMutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    // Get business details
    const business = await ctx.db.get(args.businessId);
    if (!business) throw new Error("Business not found");

    // Get category details
    const category = await ctx.db.get(business.categoryId);
    if (!category) throw new Error("Category not found");

    // Get all analyzed reviews for this business
    const analyzedTags = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.gte(q.field("confidenceScore"), MIN_CONFIDENCE_SCORE))
      .collect();

    if (analyzedTags.length < MIN_REVIEWS_FOR_RANKING) {
      console.log(`Business ${args.businessId} has insufficient reviews for ranking`);
      return null;
    }

    // Calculate category scores
    const categoryScores = calculateCategoryScores(analyzedTags);
    
    // Calculate performance breakdown
    const performanceBreakdown = calculatePerformanceBreakdown(analyzedTags);
    
    // Calculate overall score (weighted average with confidence multiplier)
    const overallScore = calculateOverallScore(categoryScores, analyzedTags.length);

    // Get total businesses in category/city for context
    const totalBusinessesInCategory = await ctx.db
      .query("businesses")
      .filter((q) => 
        q.and(
          q.eq(q.field("categoryId"), business.categoryId),
          q.eq(q.field("city"), business.city),
          q.eq(q.field("active"), true)
        )
      )
      .collect()
      .then(businesses => businesses.length);

    // Check if ranking already exists
    const existingRanking = await ctx.db
      .query("businessRankings")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();

    const rankingData = {
      businessId: args.businessId,
      overallScore,
      rankingPosition: 0, // Will be updated in batch ranking
      previousPosition: existingRanking?.rankingPosition,
      categoryScores,
      performanceBreakdown,
      category: category.slug,
      city: business.city,
      totalBusinessesInCategory,
      lastCalculated: Date.now(),
      reviewsAnalyzed: analyzedTags.length,
      confidenceScore: calculateAverageConfidence(analyzedTags),
      createdAt: existingRanking?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (existingRanking) {
      await ctx.db.patch(existingRanking._id, rankingData);
      return existingRanking._id;
    } else {
      return await ctx.db.insert("businessRankings", rankingData);
    }
  },
});

// Calculate category scores from analyzed tags with recency weighting
function calculateCategoryScores(tags: Doc<"aiAnalysisTags">[]): any {
  const weightedScores = {
    qualityIndicators: 0,
    serviceExcellence: 0,
    customerExperience: 0,
    technicalMastery: 0,
    competitiveAdvantage: 0,
    operationalExcellence: 0,
  };
  
  let totalWeight = 0;

  for (const tag of tags) {
    // Calculate recency weight
    const recencyWeight = calculateRecencyWeight(tag.createdAt);
    totalWeight += recencyWeight;
    
    // Quality Indicators Score
    weightedScores.qualityIndicators += calculateQualityScore(tag) * recencyWeight;
    
    // Service Excellence Score
    weightedScores.serviceExcellence += calculateServiceScore(tag) * recencyWeight;
    
    // Customer Experience Score
    weightedScores.customerExperience += calculateCustomerScore(tag) * recencyWeight;
    
    // Technical Mastery Score (problem solving, expertise)
    weightedScores.technicalMastery += calculateTechnicalScore(tag) * recencyWeight;
    
    // Competitive Advantage Score
    weightedScores.competitiveAdvantage += calculateCompetitiveScore(tag) * recencyWeight;
    
    // Operational Excellence Score (speed, value, reliability)
    weightedScores.operationalExcellence += calculateOperationalScore(tag) * recencyWeight;
  }

  // Calculate weighted averages
  return {
    qualityIndicators: Math.round((weightedScores.qualityIndicators / totalWeight) * 10) / 10,
    serviceExcellence: Math.round((weightedScores.serviceExcellence / totalWeight) * 10) / 10,
    customerExperience: Math.round((weightedScores.customerExperience / totalWeight) * 10) / 10,
    technicalMastery: Math.round((weightedScores.technicalMastery / totalWeight) * 10) / 10,
    competitiveAdvantage: Math.round((weightedScores.competitiveAdvantage / totalWeight) * 10) / 10,
    operationalExcellence: Math.round((weightedScores.operationalExcellence / totalWeight) * 10) / 10,
  };
}

// Calculate recency weight based on review age
function calculateRecencyWeight(createdAt: number): number {
  const ageInDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
  
  for (const { days, weight } of RECENCY_WEIGHTS) {
    if (ageInDays <= days) {
      return weight;
    }
  }
  
  return RECENCY_WEIGHTS[RECENCY_WEIGHTS.length - 1].weight;
}

// Calculate performance breakdown
function calculatePerformanceBreakdown(tags: Doc<"aiAnalysisTags">[]): any {
  const breakdown = {
    speedScore: 0,
    valueScore: 0,
    qualityScore: 0,
    reliabilityScore: 0,
    expertiseScore: 0,
    customerImpactScore: 0,
  };

  for (const tag of tags) {
    breakdown.speedScore += tag.businessPerformance?.responseQuality?.response_speed_score || 0;
    breakdown.valueScore += tag.businessPerformance?.valueDelivery?.value_score || 0;
    breakdown.qualityScore += tag.qualityIndicators?.excellence?.intensity || 0;
    breakdown.reliabilityScore += calculateReliabilityFromTag(tag);
    breakdown.expertiseScore += tag.serviceExcellence?.expertise?.technical_competency || 0;
    breakdown.customerImpactScore += tag.customerExperience?.businessImpact?.business_value_score || 0;
  }

  // Average the scores
  const reviewCount = tags.length;
  return {
    speedScore: Math.round((breakdown.speedScore / reviewCount) * 10) / 10,
    valueScore: Math.round((breakdown.valueScore / reviewCount) * 10) / 10,
    qualityScore: Math.round((breakdown.qualityScore / reviewCount) * 10) / 10,
    reliabilityScore: Math.round((breakdown.reliabilityScore / reviewCount) * 10) / 10,
    expertiseScore: Math.round((breakdown.expertiseScore / reviewCount) * 10) / 10,
    customerImpactScore: Math.round((breakdown.customerImpactScore / reviewCount) * 10) / 10,
  };
}

// Calculate individual category scores
function calculateQualityScore(tag: Doc<"aiAnalysisTags">): number {
  let score = 0;
  const qi = tag.qualityIndicators;
  
  // Excellence (40% of quality score)
  if (qi?.excellence?.mentioned) {
    score += (qi.excellence.intensity || 0) * 0.4;
  }
  
  // First-time success (40% of quality score)
  if (qi?.firstTimeSuccess?.mentioned) {
    let firstTimeScore = 0;
    if (qi.firstTimeSuccess.got_it_right_first) firstTimeScore += 2.5;
    if (qi.firstTimeSuccess.single_visit_complete) firstTimeScore += 2.5;
    if (qi.firstTimeSuccess.no_return_visits) firstTimeScore += 2.5;
    if (qi.firstTimeSuccess.precision_work) firstTimeScore += 2.5;
    score += firstTimeScore * 0.4;
  }
  
  // Attention to detail (20% of quality score)
  if (qi?.attentionToDetail?.mentioned) {
    score += (qi.attentionToDetail.thoroughness || 0) * 0.2;
  }
  
  return Math.min(10, score);
}

function calculateServiceScore(tag: Doc<"aiAnalysisTags">): number {
  const se = tag.serviceExcellence;
  if (!se) return 0;
  
  let score = 0;
  score += (se.professionalism?.score || 0) * 0.33;
  score += (se.communication?.score || 0) * 0.33;
  score += (se.expertise?.technical_competency || 0) * 0.34;
  
  return Math.min(10, score);
}

function calculateCustomerScore(tag: Doc<"aiAnalysisTags">): number {
  const ce = tag.customerExperience;
  if (!ce) return 0;
  
  let score = 0;
  score += (ce.emotionalImpact?.emotional_intensity || 0) * 0.33;
  score += (ce.businessImpact?.business_value_score || 0) * 0.33;
  score += (ce.relationshipBuilding?.relationship_score || 0) * 0.34;
  
  return Math.min(10, score);
}

function calculateTechnicalScore(tag: Doc<"aiAnalysisTags">): number {
  const bp = tag.businessPerformance;
  const se = tag.serviceExcellence;
  
  let score = 0;
  
  // Problem resolution ability
  if (bp?.problemResolution?.fixed_others_couldnt) score += 2;
  if (bp?.problemResolution?.complex_issue_resolved) score += 2;
  if (bp?.problemResolution?.creative_solution) score += 1;
  score += (bp?.problemResolution?.difficulty_level || 0) * 0.5;
  
  // Technical expertise
  if (se?.expertise?.expert_referenced) score += 1;
  if (se?.expertise?.master_craftsman) score += 2;
  
  return Math.min(10, score);
}

function calculateCompetitiveScore(tag: Doc<"aiAnalysisTags">): number {
  const cm = tag.competitiveMarkers;
  if (!cm) return 0;
  
  let score = 0;
  
  // Comparison mentions
  if (cm.comparisonMentions?.better_than_others) score += 3;
  if (cm.comparisonMentions?.best_in_area) score += 4;
  
  // Market position
  if (cm.marketPosition?.local_favorite) score += 1;
  if (cm.marketPosition?.industry_leader) score += 2;
  
  return Math.min(10, score);
}

function calculateOperationalScore(tag: Doc<"aiAnalysisTags">): number {
  const bp = tag.businessPerformance;
  if (!bp) return 0;
  
  let score = 0;
  
  // Response Quality (33%)
  if (bp.responseQuality) {
    let responseScore = 0;
    responseScore += (bp.responseQuality.response_speed_score || 0);
    if (bp.responseQuality.same_day_service) responseScore = Math.min(10, responseScore + 2);
    if (bp.responseQuality.emergency_available) responseScore = Math.min(10, responseScore + 1);
    score += responseScore * 0.33;
  }
  
  // Value Delivery (33%)
  if (bp.valueDelivery) {
    let valueScore = 0;
    valueScore += (bp.valueDelivery.value_score || 0);
    if (bp.valueDelivery.fair_pricing) valueScore = Math.min(10, valueScore + 1);
    if (bp.valueDelivery.transparent_costs) valueScore = Math.min(10, valueScore + 1);
    score += valueScore * 0.33;
  }
  
  // Problem Resolution (34%)
  if (bp.problemResolution) {
    score += (bp.problemResolution.difficulty_level || 0) * 0.34;
  }
  
  return Math.min(10, score);
}

function calculateIndustrySpecificScore(tag: Doc<"aiAnalysisTags">): number {
  const industryData = tag.industrySpecific;
  if (!industryData) return 5; // Default middle score if no industry-specific data
  
  let score = 0;
  let factors = 0;
  
  // For HVAC-specific
  if (industryData.technicalCompetency) {
    score += (industryData.technicalCompetency.system_knowledge || 0);
    factors++;
  }
  
  // For general service quality
  if (industryData.serviceQuality) {
    score += (industryData.serviceQuality.quality_score || 0);
    factors++;
  }
  
  // For any numeric scores in the industry-specific data
  const extractNumericScores = (obj: any): number[] => {
    const scores: number[] = [];
    for (const key in obj) {
      if (typeof obj[key] === 'number' && key.includes('score')) {
        scores.push(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        scores.push(...extractNumericScores(obj[key]));
      }
    }
    return scores;
  };
  
  const numericScores = extractNumericScores(industryData);
  if (numericScores.length > 0) {
    const avgScore = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
    return Math.min(10, avgScore);
  }
  
  return factors > 0 ? Math.min(10, score / factors) : 5;
}

function calculateReliabilityFromTag(tag: Doc<"aiAnalysisTags">): number {
  let score = 0;
  
  // Service excellence indicators
  if (tag.serviceExcellence?.professionalism?.punctual) score += 2;
  if (tag.serviceExcellence?.communication?.responsive) score += 2;
  
  // Quality indicators
  if (tag.qualityIndicators?.firstTimeSuccess?.got_it_right_first) score += 3;
  
  // Relationship building
  if (tag.customerExperience?.relationshipBuilding?.trust_established) score += 3;
  
  return Math.min(10, score);
}

// Calculate overall score from category scores with confidence multiplier
function calculateOverallScore(categoryScores: any, reviewCount: number): number {
  let score = 0;
  
  // Apply category weights
  score += categoryScores.qualityIndicators * RANKING_WEIGHTS.qualityIndicators;
  score += categoryScores.serviceExcellence * RANKING_WEIGHTS.serviceExcellence;
  score += categoryScores.customerExperience * RANKING_WEIGHTS.customerExperience;
  score += categoryScores.technicalMastery * RANKING_WEIGHTS.technicalMastery;
  score += categoryScores.competitiveAdvantage * RANKING_WEIGHTS.competitiveAdvantage;
  score += categoryScores.operationalExcellence * RANKING_WEIGHTS.operationalExcellence;
  
  // Apply confidence multiplier based on review count
  const confidenceMultiplier = calculateConfidenceMultiplier(reviewCount);
  score = score * confidenceMultiplier;
  
  // Convert to 0-100 scale with one decimal precision
  return Math.round(score * 100) / 10;
}

// Calculate confidence multiplier based on review count (from algorithm document)
function calculateConfidenceMultiplier(reviewCount: number): number {
  const { MINIMUM_RELIABLE, OPTIMAL_SAMPLE, MAXIMUM_BENEFIT, MIN_MULTIPLIER, MAX_MULTIPLIER } = CONFIDENCE_CONFIG;
  
  if (reviewCount < MINIMUM_RELIABLE) {
    // 60%-80% of score for very few reviews
    return MIN_MULTIPLIER + (reviewCount / MINIMUM_RELIABLE) * 0.2;
  } else if (reviewCount < OPTIMAL_SAMPLE) {
    // 80%-100% of score as reviews increase
    return 0.8 + ((reviewCount - MINIMUM_RELIABLE) / (OPTIMAL_SAMPLE - MINIMUM_RELIABLE)) * 0.2;
  } else if (reviewCount <= MAXIMUM_BENEFIT) {
    // 100%-110% for optimal review counts
    return 1.0 + ((reviewCount - OPTIMAL_SAMPLE) / (MAXIMUM_BENEFIT - OPTIMAL_SAMPLE)) * 0.1;
  } else {
    // Cap at 110% for businesses with many reviews
    return MAX_MULTIPLIER;
  }
}

// Calculate average confidence score
function calculateAverageConfidence(tags: Doc<"aiAnalysisTags">[]): number {
  const total = tags.reduce((sum, tag) => sum + (tag.confidenceScore || 0), 0);
  return Math.round((total / tags.length) * 10) / 10;
}

// Update ranking positions for a category/city
export const updateRankingPositions = internalMutation({
  args: {
    category: v.string(),
    city: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all rankings for this category/city
    const rankings = await ctx.db
      .query("businessRankings")
      .withIndex("by_category_city", (q) => 
        q.eq("category", args.category).eq("city", args.city)
      )
      .collect();

    // Sort by overall score (descending)
    rankings.sort((a, b) => b.overallScore - a.overallScore);

    // Update positions
    for (let i = 0; i < rankings.length; i++) {
      const newPosition = i + 1;
      if (rankings[i].rankingPosition !== newPosition) {
        await ctx.db.patch(rankings[i]._id, {
          previousPosition: rankings[i].rankingPosition,
          rankingPosition: newPosition,
          updatedAt: Date.now(),
        });
      }
    }

    return rankings.length;
  },
});

// Get top ranked businesses for a category/city (public query for dashboard)
export const getTopRankedBusinesses = query({
  args: {
    category: v.optional(v.string()),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let rankings;
    
    // Apply filters if provided
    if (args.category && args.city) {
      rankings = await ctx.db
        .query("businessRankings")
        .withIndex("by_category_city", (q) => 
          q.eq("category", args.category!).eq("city", args.city!)
        )
        .filter((q) => q.gt(q.field("overallScore"), 0))
        .collect();
    } else {
      rankings = await ctx.db
        .query("businessRankings")
        .filter((q) => q.gt(q.field("overallScore"), 0))
        .collect();
    }
    
    // Sort by overall score
    rankings.sort((a, b) => b.overallScore - a.overallScore);
    
    // Apply limit
    const limit = args.limit || 10;
    const topRankings = rankings.slice(0, limit);
    
    // Enrich with business details and achievements
    const enrichedRankings = await Promise.all(
      topRankings.map(async (ranking) => {
        // Get business details
        const business = await ctx.db.get(ranking.businessId);
        if (!business) return null;
        
        // Get category details
        const category = business.categoryId ? await ctx.db.get(business.categoryId) : null;
        
        // Get achievements for this business
        const achievements = await ctx.db
          .query("achievements")
          .withIndex("by_business", (q) => q.eq("businessId", ranking.businessId))
          .filter((q) => q.eq(q.field("achievementStatus"), "active"))
          .collect();
        
        // Get review stats
        const reviewsQuery = ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", ranking.businessId))
          .filter((q) => q.gt(q.field("rating"), 0));
          
        const reviews = await reviewsQuery.collect();
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;
        
        return {
          ...ranking,
          business: {
            ...business,
            category,
            slug: business.urlPath || `/business/${business.slug}`,
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10,
          },
          achievements: achievements.slice(0, 3), // Top 3 achievements
          position: topRankings.indexOf(ranking) + 1,
        };
      })
    );
    
    return enrichedRankings.filter(Boolean);
  },
});

// Public mutation to trigger ranking calculation for a business
export const triggerRankingCalculation = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    // Check if business exists
    const business = await ctx.db.get(args.businessId);
    if (!business) throw new Error("Business not found");

    // Calculate ranking
    await ctx.scheduler.runAfter(0, internal.rankings.calculateRankings.calculateBusinessRanking, {
      businessId: args.businessId,
    });

    return { success: true, message: "Ranking calculation scheduled" };
  },
});

// Get all rankings for a specific city
export const getCityRankings = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    const rankings = await ctx.db
      .query("businessRankings")
      .filter((q) => q.eq(q.field("city"), args.city))
      .collect();
    
    // Sort by overall score
    rankings.sort((a, b) => b.overallScore - a.overallScore);
    
    // Enrich with business details
    const enrichedRankings = await Promise.all(
      rankings.map(async (ranking) => {
        // Get business details
        const business = await ctx.db.get(ranking.businessId);
        if (!business) return null;
        
        // Get category details
        const category = business.categoryId ? await ctx.db.get(business.categoryId) : null;
        
        // Get review stats
        const reviewsQuery = ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", ranking.businessId))
          .filter((q) => q.gt(q.field("rating"), 0));
          
        const reviews = await reviewsQuery.collect();
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;
        
        return {
          ...ranking,
          business: {
            ...business,
            category,
            slug: business.urlPath || `/business/${business.slug}`,
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10,
          },
          position: rankings.indexOf(ranking) + 1,
        };
      })
    );
    
    return enrichedRankings.filter(Boolean);
  },
});

// Get all rankings for a specific category
export const getCategoryRankings = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const rankings = await ctx.db
      .query("businessRankings")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
    
    // Sort by overall score
    rankings.sort((a, b) => b.overallScore - a.overallScore);
    
    // Enrich with business details
    const enrichedRankings = await Promise.all(
      rankings.map(async (ranking) => {
        // Get business details
        const business = await ctx.db.get(ranking.businessId);
        if (!business) return null;
        
        // Get category details
        const category = business.categoryId ? await ctx.db.get(business.categoryId) : null;
        
        // Get review stats
        const reviewsQuery = ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", ranking.businessId))
          .filter((q) => q.gt(q.field("rating"), 0));
          
        const reviews = await reviewsQuery.collect();
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;
        
        return {
          ...ranking,
          business: {
            ...business,
            category,
            slug: business.urlPath || `/business/${business.slug}`,
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10,
          },
          position: rankings.indexOf(ranking) + 1,
        };
      })
    );
    
    return enrichedRankings.filter(Boolean);
  },
});

// Batch calculate rankings for all businesses in a category
export const batchCalculateRankings = internalMutation({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get businesses to rank with pagination support
    let businessQuery = ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true));
    
    if (args.category) {
      const categoryDoc = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.category!))
        .first();
      
      if (categoryDoc) {
        businessQuery = businessQuery.filter((q) => q.eq(q.field("categoryId"), categoryDoc._id));
      }
    }
    
    // Use pagination to handle large datasets
    const paginatedQuery = args.cursor 
      ? businessQuery.paginate({ cursor: args.cursor, numItems: args.limit || 100 })
      : businessQuery.paginate({ cursor: null, numItems: args.limit || 100 });
      
    const result = await paginatedQuery;
    let processed = 0;
    
    // Calculate rankings for each business with better spacing
    for (let i = 0; i < result.page.length; i++) {
      const business = result.page[i];
      try {
        // Space out scheduling to avoid overwhelming the system
        // Use exponential backoff: 0ms, 100ms, 200ms, 400ms, etc.
        const delay = Math.min(i * 100, 5000); // Cap at 5 seconds
        
        await ctx.scheduler.runAfter(delay, internal.rankings.calculateRankings.calculateBusinessRanking, {
          businessId: business._id,
        });
        processed++;
      } catch (error) {
        console.error(`Failed to schedule ranking for business ${business._id}:`, error);
      }
    }
    
    return { 
      scheduled: processed, 
      total: result.page.length,
      nextCursor: result.continueCursor,
      hasMore: result.continueCursor !== null
    };
  },
});

// Public wrapper for batch ranking calculation
export const batchCalculateRankingsPublic = mutation({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ 
    scheduled: number; 
    total: number; 
    nextCursor?: string | null;
    hasMore?: boolean;
  }> => {
    return await ctx.runMutation(internal.rankings.calculateRankings.batchCalculateRankings, args);
  },
});

// Get business ranking details
export const getBusinessRanking = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const ranking = await ctx.db
      .query("businessRankings")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();
    
    return ranking;
  },
});