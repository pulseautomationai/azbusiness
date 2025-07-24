import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { allAchievements, AchievementDefinition, TierRequirement } from "./achievementDefinitions";

// Detect achievements for a business based on their AI analysis tags
export const detectBusinessAchievements = internalMutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args): Promise<Id<"achievements">[]> => {
    // Get business details
    const business = await ctx.db.get(args.businessId);
    if (!business) throw new Error("Business not found");

    // Get all AI analysis tags for the business
    const analysisTags = await ctx.db
      .query("aiAnalysisTags")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.gte(q.field("confidenceScore"), 60)) // Min confidence
      .collect();

    if (analysisTags.length === 0) {
      console.log(`No analysis tags found for business ${args.businessId}`);
      return [];
    }

    // Get business ranking for competitive achievements
    const ranking = await ctx.db
      .query("businessRankings")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .first();

    // Detect achievements for each category
    const detectedAchievements = [];

    for (const achievementDef of allAchievements) {
      const qualifications = await checkAchievementQualification(
        achievementDef,
        analysisTags,
        business.planTier,
        ranking
      );

      for (const qualification of qualifications) {
        // Check if achievement already exists
        const existingAchievement = await ctx.db
          .query("achievements")
          .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
          .filter((q) => 
            q.and(
              q.eq(q.field("achievementType"), achievementDef.type),
              q.eq(q.field("tierLevel"), qualification.tierLevel)
            )
          )
          .first();

        if (!existingAchievement) {
          // Award new achievement
          const achievementId: Id<"achievements"> = await ctx.runMutation(
            internal.achievements.awardAchievement.awardAchievementToBusinessInternal,
            {
              businessId: args.businessId,
              achievementType: achievementDef.type,
              category: achievementDef.category,
              tierLevel: qualification.tierLevel,
              tierRequirement: qualification.tierRequirement,
              displayName: qualification.displayText,
              description: achievementDef.description,
              badgeIcon: qualification.badgeIcon,
              qualifyingData: qualification.qualifyingData,
              scoreRequirements: qualification.scoreRequirements,
              displayPriority: qualification.displayPriority,
            }
          );

          detectedAchievements.push(achievementId);
        }
      }
    }

    // Update achievement progress for unearned achievements
    await updateAchievementProgress(ctx, args.businessId, analysisTags, business.planTier, ranking);

    return detectedAchievements;
  },
});

// Check if a business qualifies for an achievement
async function checkAchievementQualification(
  achievementDef: AchievementDefinition,
  analysisTags: Doc<"aiAnalysisTags">[],
  businessTier: string,
  ranking: Doc<"businessRankings"> | null
): Promise<any[]> {
  const qualifications = [];

  // Check each tier level
  for (const [tierLevel, tierReq] of Object.entries(achievementDef.tiers)) {
    if (!tierReq) continue;

    // Check if business has access to this tier
    if (!hasTierAccess(businessTier, tierReq.tierAccess)) continue;

    // Calculate metrics based on achievement type
    const metrics = calculateAchievementMetrics(achievementDef.type, analysisTags, ranking);
    
    // Check if requirements are met
    const qualifies = checkRequirements(tierReq.requirements, metrics);

    if (qualifies) {
      qualifications.push({
        tierLevel,
        tierRequirement: tierReq.tierAccess,
        displayText: tierReq.displayText,
        badgeIcon: tierReq.badgeIcon,
        displayPriority: tierReq.displayPriority,
        qualifyingData: metrics,
        scoreRequirements: getScoreRequirements(tierReq.requirements, metrics),
      });
    }
  }

  return qualifications;
}

// Calculate metrics for a specific achievement type
function calculateAchievementMetrics(
  achievementType: string,
  analysisTags: Doc<"aiAnalysisTags">[],
  ranking: Doc<"businessRankings"> | null
): Record<string, any> {
  const metrics: Record<string, any> = {};
  const totalReviews = analysisTags.length;

  switch (achievementType) {
    case "perfection_performer":
      metrics.excellence_intensity = calculateAverage(
        analysisTags.map(tag => tag.qualityIndicators?.excellence?.intensity || 0)
      );
      metrics.exceeded_expectations = calculatePercentage(
        analysisTags.filter(tag => tag.qualityIndicators?.excellence?.exceeded_expectations).length,
        totalReviews
      );
      metrics.minimum_reviews = totalReviews;
      break;

    case "first_time_champion":
      metrics.precision_work = analysisTags.some(tag => 
        tag.qualityIndicators?.firstTimeSuccess?.precision_work
      );
      metrics.success_rate_indicator = calculateAverage(
        analysisTags.map(tag => {
          const fts = tag.qualityIndicators?.firstTimeSuccess;
          if (!fts) return 0;
          let score = 0;
          if (fts.got_it_right_first) score += 2.5;
          if (fts.single_visit_complete) score += 2.5;
          if (fts.no_return_visits) score += 2.5;
          if (fts.precision_work) score += 2.5;
          return score;
        })
      );
      metrics.got_it_right_first = calculatePercentage(
        analysisTags.filter(tag => tag.qualityIndicators?.firstTimeSuccess?.got_it_right_first).length,
        totalReviews
      );
      metrics.no_return_visits = calculatePercentage(
        analysisTags.filter(tag => tag.qualityIndicators?.firstTimeSuccess?.no_return_visits).length,
        totalReviews
      );
      metrics.single_visit_complete = calculatePercentage(
        analysisTags.filter(tag => tag.qualityIndicators?.firstTimeSuccess?.single_visit_complete).length,
        totalReviews
      );
      break;

    case "problem_solver":
      metrics.fixed_others_couldnt = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.problemResolution?.fixed_others_couldnt).length,
        totalReviews
      );
      metrics.diagnostic_skill = analysisTags.some(tag => 
        tag.businessPerformance?.problemResolution?.difficulty_level >= 6
      );
      metrics.complex_issue_resolved = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.problemResolution?.complex_issue_resolved).length,
        totalReviews
      );
      metrics.creative_solution = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.problemResolution?.creative_solution).length,
        totalReviews
      );
      metrics.difficulty_level = calculateAverage(
        analysisTags.map(tag => tag.businessPerformance?.problemResolution?.difficulty_level || 0)
      );
      break;

    case "expert_craftsman":
      metrics.expert_referenced = calculatePercentage(
        analysisTags.filter(tag => tag.serviceExcellence?.expertise?.expert_referenced).length,
        totalReviews
      );
      metrics.technical_competency = calculateAverage(
        analysisTags.map(tag => tag.serviceExcellence?.expertise?.technical_competency || 0)
      );
      metrics.knowledge_praised = analysisTags.some(tag => 
        tag.serviceExcellence?.professionalism?.knowledgeable
      );
      metrics.specialist_noted = calculatePercentage(
        analysisTags.filter(tag => tag.serviceExcellence?.expertise?.specialist_noted).length,
        totalReviews
      );
      metrics.master_craftsman = calculatePercentage(
        analysisTags.filter(tag => tag.serviceExcellence?.expertise?.master_craftsman).length,
        totalReviews
      );
      break;

    case "life_changer":
      metrics.stress_relief = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.emotionalImpact?.stress_relief).length,
        totalReviews
      );
      metrics.saved_money = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.businessImpact?.saved_money).length,
        totalReviews
      );
      metrics.peace_of_mind = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.emotionalImpact?.peace_of_mind).length,
        totalReviews
      );
      metrics.improved_efficiency = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.businessImpact?.improved_efficiency).length,
        totalReviews
      );
      metrics.life_changing = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.emotionalImpact?.life_changing).length,
        totalReviews
      );
      metrics.prevented_disaster = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.businessImpact?.prevented_disaster).length,
        totalReviews
      );
      metrics.emotional_intensity = calculateAverage(
        analysisTags.map(tag => tag.customerExperience?.emotionalImpact?.emotional_intensity || 0)
      );
      metrics.business_value_score = calculateAverage(
        analysisTags.map(tag => tag.customerExperience?.businessImpact?.business_value_score || 0)
      );
      break;

    case "trust_builder":
      metrics.trust_established = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.relationshipBuilding?.trust_established).length,
        totalReviews
      );
      metrics.tell_everyone = calculatePercentage(
        analysisTags.filter(tag => tag.recommendationStrength?.tell_everyone).length,
        totalReviews
      );
      metrics.personal_connection = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.relationshipBuilding?.personal_connection).length,
        totalReviews
      );
      metrics.already_recommended = calculatePercentage(
        analysisTags.filter(tag => tag.recommendationStrength?.already_recommended).length,
        totalReviews
      );
      metrics.loyalty_indicated = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.relationshipBuilding?.loyalty_indicated).length,
        totalReviews
      );
      metrics.only_company_use = calculatePercentage(
        analysisTags.filter(tag => tag.recommendationStrength?.only_company_use).length,
        totalReviews
      );
      metrics.future_service_planned = calculatePercentage(
        analysisTags.filter(tag => tag.customerExperience?.relationshipBuilding?.future_service_planned).length,
        totalReviews
      );
      metrics.relationship_score = calculateAverage(
        analysisTags.map(tag => tag.customerExperience?.relationshipBuilding?.relationship_score || 0)
      );
      metrics.advocacy_score = calculateAverage(
        analysisTags.map(tag => tag.recommendationStrength?.advocacy_score || 0)
      );
      break;

    case "market_dominator":
      metrics.better_than_others = calculatePercentage(
        analysisTags.filter(tag => tag.competitiveMarkers?.comparisonMentions?.better_than_others).length,
        totalReviews
      );
      metrics.best_in_area = calculatePercentage(
        analysisTags.filter(tag => tag.competitiveMarkers?.comparisonMentions?.best_in_area).length,
        totalReviews
      );
      metrics.local_favorite = analysisTags.some(tag => 
        tag.competitiveMarkers?.marketPosition?.local_favorite
      );
      metrics.industry_leader = analysisTags.some(tag => 
        tag.competitiveMarkers?.marketPosition?.industry_leader
      );
      metrics.innovation_mentioned = calculatePercentage(
        analysisTags.filter(tag => tag.competitiveMarkers?.differentiation?.innovation_mentioned).length,
        totalReviews
      );
      metrics.competitive_advantage = ranking?.categoryScores?.competitiveAdvantage || 0;
      metrics.ranking_position = ranking?.rankingPosition || 999;
      break;

    case "response_champion":
      metrics.quick_response_mentioned = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.responseQuality?.quick_response_mentioned).length,
        totalReviews
      );
      metrics.response_speed_score = calculateAverage(
        analysisTags.map(tag => tag.businessPerformance?.responseQuality?.response_speed_score || 0)
      );
      metrics.same_day_service = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.responseQuality?.same_day_service).length,
        totalReviews
      );
      metrics.emergency_available = analysisTags.some(tag => 
        tag.businessPerformance?.responseQuality?.emergency_available
      );
      break;

    case "value_champion":
      metrics.fair_pricing = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.valueDelivery?.fair_pricing).length,
        totalReviews
      );
      metrics.worth_the_cost = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.valueDelivery?.worth_the_cost).length,
        totalReviews
      );
      metrics.transparent_costs = calculatePercentage(
        analysisTags.filter(tag => tag.businessPerformance?.valueDelivery?.transparent_costs).length,
        totalReviews
      );
      metrics.value_score = calculateAverage(
        analysisTags.map(tag => tag.businessPerformance?.valueDelivery?.value_score || 0)
      );
      metrics.no_hidden_fees = 1 - calculatePercentage(
        analysisTags.filter(tag => !tag.businessPerformance?.valueDelivery?.transparent_costs).length,
        totalReviews
      );
      metrics.business_value_score = calculateAverage(
        analysisTags.map(tag => tag.customerExperience?.businessImpact?.business_value_score || 0)
      );
      break;
  }

  return metrics;
}

// Check if requirements are met
function checkRequirements(requirements: Record<string, any>, metrics: Record<string, any>): boolean {
  for (const [key, requiredValue] of Object.entries(requirements)) {
    const actualValue = metrics[key];

    if (actualValue === undefined) return false;

    // Handle different requirement types
    if (typeof requiredValue === "boolean") {
      if (actualValue !== requiredValue) return false;
    } else if (typeof requiredValue === "number") {
      if (actualValue < requiredValue) return false;
    }
  }

  return true;
}

// Get score requirements for display
function getScoreRequirements(requirements: Record<string, any>, metrics: Record<string, any>): any {
  const mainMetric = Object.keys(requirements)[0];
  const requiredValue = requirements[mainMetric];
  const actualValue = metrics[mainMetric];

  return {
    metricName: mainMetric,
    requiredValue: typeof requiredValue === "number" ? requiredValue : (requiredValue ? 1 : 0),
    actualValue: typeof actualValue === "number" ? actualValue : (actualValue ? 1 : 0),
    percentage: typeof actualValue === "number" && typeof requiredValue === "number" 
      ? Math.round((actualValue / requiredValue) * 100) 
      : undefined,
  };
}

// Check if business tier has access to achievement tier
function hasTierAccess(businessTier: string, requiredTier: string): boolean {
  const tierHierarchy: Record<string, number> = {
    free: 1,
    starter: 2,
    pro: 3,
    power: 4,
  };

  return tierHierarchy[businessTier] >= tierHierarchy[requiredTier];
}

// Helper functions
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function calculatePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100) / 100;
}

// Update achievement progress for unearned achievements
async function updateAchievementProgress(
  ctx: any,
  businessId: Id<"businesses">,
  analysisTags: Doc<"aiAnalysisTags">[],
  businessTier: string,
  ranking: Doc<"businessRankings"> | null
): Promise<void> {
  // Get existing achievements
  const existingAchievements = await ctx.db
    .query("achievements")
    .withIndex("by_business", (q: any) => q.eq("businessId", businessId))
    .collect();

  const existingTypes = new Set(existingAchievements.map((a: any) => a.achievementType));

  // Check progress for unearned achievements
  for (const achievementDef of allAchievements) {
    if (existingTypes.has(achievementDef.type)) continue;

    const metrics = calculateAchievementMetrics(achievementDef.type, analysisTags, ranking);
    
    // Find the next achievable tier
    let nextTier = null;
    let nextTierReq = null;

    for (const [tierLevel, tierReq] of Object.entries(achievementDef.tiers)) {
      if (!tierReq || !hasTierAccess(businessTier, tierReq.tierAccess)) continue;
      
      if (!checkRequirements(tierReq.requirements, metrics)) {
        nextTier = tierLevel;
        nextTierReq = tierReq;
        break;
      }
    }

    if (nextTier && nextTierReq) {
      // Calculate progress
      const mainMetric = Object.keys(nextTierReq.requirements)[0];
      const rawValue = metrics[mainMetric] || 0;
      // Convert boolean to number (true = 1, false = 0)
      const currentValue = typeof rawValue === "boolean" ? (rawValue ? 1 : 0) : (rawValue || 0);
      const targetValue = nextTierReq.requirements[mainMetric];
      const numericTarget = typeof targetValue === "boolean" ? 1 : (targetValue || 1);
      const progress = typeof numericTarget === "number" 
        ? Math.min(100, Math.round((currentValue / numericTarget) * 100))
        : 0;

      // Update or create progress tracking
      const existingProgress = await ctx.db
        .query("achievementProgress")
        .withIndex("by_business_achievement", (q: any) => 
          q.eq("businessId", businessId).eq("achievementType", achievementDef.type)
        )
        .first();

      const progressData = {
        businessId,
        achievementType: achievementDef.type,
        currentProgress: progress,
        currentValue,
        targetValue: numericTarget,
        progressDetails: {
          metricName: mainMetric,
          unit: mainMetric.includes("score") ? "score" : mainMetric.includes("_") ? "percentage" : "count",
          trend: "stable" as const,
          daysToTarget: undefined,
        },
        progressHistory: existingProgress?.progressHistory || [],
        nextTier: {
          tierLevel: nextTier,
          tierRequirement: nextTierReq.tierAccess,
          lockedByPlan: !hasTierAccess(businessTier, nextTierReq.tierAccess),
          qualifiesForTier: checkRequirements(nextTierReq.requirements, metrics),
        },
        recommendations: getAchievementRecommendations(achievementDef.type),
        focusAreas: getFocusAreas(achievementDef.type, metrics),
        lastCalculated: Date.now(),
        notificationsEnabled: true,
        lastNotified: existingProgress?.lastNotified,
        createdAt: existingProgress?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      if (existingProgress) {
        await ctx.db.patch(existingProgress._id, progressData);
      } else {
        await ctx.db.insert("achievementProgress", progressData);
      }
    }
  }
}

// Get achievements for a business
export const getBusinessAchievements = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .filter((q) => q.eq(q.field("achievementStatus"), "active"))
      .collect();
    
    return achievements;
  },
});

// Get recommendations for earning an achievement
function getAchievementRecommendations(achievementType: string): string[] {
  const recommendations: Record<string, string[]> = {
    perfection_performer: [
      "Ask satisfied customers to mention specific ways you exceeded expectations",
      "Focus on going above and beyond in every service",
      "Document and share success stories with customers",
    ],
    first_time_champion: [
      "Emphasize your first-time fix rate in customer communications",
      "Ask customers to mention if issues were resolved in one visit",
      "Focus on thorough diagnostics to ensure complete solutions",
    ],
    problem_solver: [
      "Take on complex challenges that others have failed to solve",
      "Document your problem-solving process for customers",
      "Ask customers to mention if you fixed what others couldn't",
    ],
    expert_craftsman: [
      "Share your expertise and certifications with customers",
      "Explain technical details to demonstrate your knowledge",
      "Encourage customers to mention your expertise in reviews",
    ],
    life_changer: [
      "Focus on the emotional and business impact of your service",
      "Ask customers to share how your service improved their situation",
      "Document cost savings and efficiency improvements",
    ],
    trust_builder: [
      "Build personal connections with every customer",
      "Follow up after service to ensure satisfaction",
      "Encourage customers to recommend you to others",
    ],
    market_dominator: [
      "Ask customers to mention why they chose you over competitors",
      "Highlight your unique advantages and innovations",
      "Build a reputation as the go-to provider in your area",
    ],
    response_champion: [
      "Maintain fast response times for all inquiries",
      "Offer same-day service when possible",
      "Ensure emergency availability for urgent needs",
    ],
    value_champion: [
      "Be transparent about pricing and avoid hidden fees",
      "Ensure customers feel they received great value",
      "Ask customers to mention fair pricing in reviews",
    ],
  };

  return recommendations[achievementType] || [];
}

// Get focus areas based on current metrics
function getFocusAreas(achievementType: string, metrics: Record<string, any>): string[] {
  const areas = [];

  // Analyze metrics to identify weak areas
  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === "number" && value < 5) {
      areas.push(`Improve ${key.replace(/_/g, " ")}`);
    }
  }

  return areas.slice(0, 3); // Return top 3 focus areas
}

// Public batch achievement detection for multiple businesses
export const batchDetectAchievements = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get active businesses with reviews for achievement detection
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .take(args.limit || 50);
    
    let processed = 0;
    let totalAchievements = 0;
    
    for (const business of businesses) {
      try {
        // Only process businesses with some reviews
        const reviewCount = await ctx.db
          .query("reviews")
          .withIndex("by_business", (q) => q.eq("businessId", business._id))
          .take(1)
          .then(reviews => reviews.length);
        
        if (reviewCount > 0) {
          const newAchievements = await ctx.runMutation(
            internal.achievements.detectAchievements.detectBusinessAchievements,
            { businessId: business._id }
          );
          totalAchievements += newAchievements.length;
          processed++;
        }
      } catch (error) {
        console.error(`Error processing achievements for business ${business._id}:`, error);
      }
    }
    
    return { processed, totalAchievements };
  },
});