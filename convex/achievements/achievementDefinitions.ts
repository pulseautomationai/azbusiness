// Achievement definitions based on ULTIMATE_RANKING_ACHIEVEMENT_AWARD_SCHEMA.md

export interface AchievementDefinition {
  type: string;
  category: string;
  name: string;
  description: string;
  tiers: {
    bronze?: TierRequirement;
    silver?: TierRequirement;
    gold?: TierRequirement;
    platinum?: TierRequirement;
    diamond?: TierRequirement;
  };
}

export interface TierRequirement {
  requirements: Record<string, any>;
  displayText: string;
  badgeIcon: string;
  tierAccess: "free" | "starter" | "pro" | "power";
  displayPriority: number;
}

// 1. EXCELLENCE AWARDS
export const excellenceAwards: AchievementDefinition[] = [
  {
    type: "perfection_performer",
    category: "service_excellence",
    name: "Perfection Performer",
    description: "Consistently exceeds customer expectations",
    tiers: {
      bronze: {
        requirements: {
          excellence_intensity: 7,
          exceeded_expectations: 0.60,
          minimum_reviews: 5,
        },
        displayText: "Exceeds Expectations",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 7,
      },
      silver: {
        requirements: {
          excellence_intensity: 8,
          exceeded_expectations: 0.75,
          minimum_reviews: 8,
        },
        displayText: "Excellence Professional",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 8,
      },
      gold: {
        requirements: {
          excellence_intensity: 8.5,
          exceeded_expectations: 0.80,
          minimum_reviews: 12,
        },
        displayText: "Excellence Champion",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 9,
      },
      platinum: {
        requirements: {
          excellence_intensity: 9,
          exceeded_expectations: 0.85,
          minimum_reviews: 15,
        },
        displayText: "Perfection Master",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 10,
      },
    },
  },
  {
    type: "first_time_champion",
    category: "service_excellence",
    name: "First-Time Fix Champion",
    description: "Masters precision service delivery",
    tiers: {
      bronze: {
        requirements: {
          precision_work: true,
          success_rate_indicator: 7,
          got_it_right_first: 0.70,
        },
        displayText: "Precision Professional",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 6,
      },
      silver: {
        requirements: {
          success_rate_indicator: 7.5,
          got_it_right_first: 0.75,
          no_return_visits: 0.70,
        },
        displayText: "First-Time Fix Pro",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 7,
      },
      gold: {
        requirements: {
          success_rate_indicator: 8,
          got_it_right_first: 0.80,
          single_visit_complete: 0.75,
        },
        displayText: "First-Time Fix Expert",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 8,
      },
      platinum: {
        requirements: {
          success_rate_indicator: 9,
          got_it_right_first: 0.90,
          single_visit_complete: 0.85,
        },
        displayText: "One-Shot Master",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 9,
      },
    },
  },
];

// 2. MASTERY AWARDS
export const masteryAwards: AchievementDefinition[] = [
  {
    type: "problem_solver",
    category: "technical_mastery",
    name: "Problem Solver",
    description: "Tackles complex challenges others can't handle",
    tiers: {
      bronze: {
        requirements: {
          fixed_others_couldnt: 0.30,
          diagnostic_skill: true,
          difficulty_level: 6,
        },
        displayText: "Solution Finder",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 6,
      },
      silver: {
        requirements: {
          fixed_others_couldnt: 0.40,
          complex_issue_resolved: 0.30,
          difficulty_level: 6.5,
        },
        displayText: "Problem Specialist",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 7,
      },
      gold: {
        requirements: {
          fixed_others_couldnt: 0.50,
          complex_issue_resolved: 0.40,
          difficulty_level: 7,
        },
        displayText: "Complex Problem Expert",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 8,
      },
      platinum: {
        requirements: {
          fixed_others_couldnt: 0.70,
          creative_solution: 0.30,
          difficulty_level: 8,
        },
        displayText: "Master Problem Solver",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 9,
      },
    },
  },
  {
    type: "expert_craftsman",
    category: "technical_mastery",
    name: "Expert Craftsman",
    description: "Recognized for superior technical expertise",
    tiers: {
      bronze: {
        requirements: {
          expert_referenced: 0.40,
          technical_competency: 7,
          knowledge_praised: true,
        },
        displayText: "Skilled Professional",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 5,
      },
      silver: {
        requirements: {
          expert_referenced: 0.50,
          technical_competency: 7.5,
          specialist_noted: 0.20,
        },
        displayText: "Technical Expert",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 6,
      },
      gold: {
        requirements: {
          master_craftsman: 0.30,
          technical_competency: 8,
          specialist_noted: 0.25,
        },
        displayText: "Master Craftsman",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 7,
      },
      platinum: {
        requirements: {
          master_craftsman: 0.50,
          technical_competency: 9,
          specialist_noted: 0.40,
        },
        displayText: "Industry Expert",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 8,
      },
    },
  },
];

// 3. CUSTOMER IMPACT AWARDS
export const customerImpactAwards: AchievementDefinition[] = [
  {
    type: "life_changer",
    category: "customer_impact",
    name: "Life Changer",
    description: "Creates significant positive impact for customers",
    tiers: {
      bronze: {
        requirements: {
          stress_relief: 0.40,
          saved_money: 0.30,
          emotional_intensity: 7,
        },
        displayText: "Impact Creator",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 6,
      },
      silver: {
        requirements: {
          peace_of_mind: 0.40,
          improved_efficiency: 0.25,
          emotional_intensity: 7.5,
        },
        displayText: "Customer Advocate",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 7,
      },
      gold: {
        requirements: {
          life_changing: 0.20,
          prevented_disaster: 0.25,
          emotional_intensity: 8,
        },
        displayText: "Customer Champion",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 8,
      },
      platinum: {
        requirements: {
          life_changing: 0.40,
          business_value_score: 9,
          emotional_intensity: 9,
        },
        displayText: "Life Transformation Expert",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 9,
      },
    },
  },
  {
    type: "trust_builder",
    category: "customer_impact",
    name: "Trust Builder",
    description: "Builds lasting customer relationships",
    tiers: {
      bronze: {
        requirements: {
          trust_established: 0.60,
          tell_everyone: 0.40,
          relationship_score: 7,
        },
        displayText: "Trusted Professional",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 5,
      },
      silver: {
        requirements: {
          personal_connection: 0.40,
          already_recommended: 0.30,
          relationship_score: 7.5,
        },
        displayText: "Relationship Builder",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 6,
      },
      gold: {
        requirements: {
          loyalty_indicated: 0.50,
          only_company_use: 0.30,
          advocacy_score: 8,
        },
        displayText: "Customer Loyalty Leader",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 7,
      },
      platinum: {
        requirements: {
          future_service_planned: 0.60,
          advocacy_score: 9,
          relationship_score: 9,
        },
        displayText: "Lifetime Partnership Builder",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 8,
      },
    },
  },
];

// 4. COMPETITIVE EXCELLENCE AWARDS
export const competitiveAwards: AchievementDefinition[] = [
  {
    type: "market_dominator",
    category: "market_leadership",
    name: "Market Dominator",
    description: "Consistently outperforms competition",
    tiers: {
      silver: {
        requirements: {
          better_than_others: 0.40,
          competitive_advantage: 6.5,
          local_favorite: true,
        },
        displayText: "Local Leader",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 7,
      },
      gold: {
        requirements: {
          better_than_others: 0.50,
          competitive_advantage: 7,
          local_favorite: true,
        },
        displayText: "Competition Leader",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 8,
      },
      platinum: {
        requirements: {
          best_in_area: 0.40,
          industry_leader: true,
          competitive_advantage: 8,
        },
        displayText: "Market Dominator",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 9,
      },
      diamond: {
        requirements: {
          industry_leader: true,
          innovation_mentioned: 0.25,
          competitive_advantage: 9,
          ranking_position: 3, // Top 3
        },
        displayText: "Industry Authority",
        badgeIcon: "💎",
        tierAccess: "power",
        displayPriority: 10,
      },
    },
  },
];

// 5. OPERATIONAL EXCELLENCE AWARDS
export const operationalAwards: AchievementDefinition[] = [
  {
    type: "response_champion",
    category: "operational_excellence",
    name: "Response Champion",
    description: "Lightning-fast service response",
    tiers: {
      bronze: {
        requirements: {
          quick_response_mentioned: 0.60,
          response_speed_score: 7,
          same_day_service: 0.40,
        },
        displayText: "Quick Response Pro",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 6,
      },
      silver: {
        requirements: {
          quick_response_mentioned: 0.70,
          response_speed_score: 7.5,
          same_day_service: 0.50,
        },
        displayText: "Fast Response Specialist",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 7,
      },
      gold: {
        requirements: {
          emergency_available: true,
          response_speed_score: 8,
          same_day_service: 0.60,
        },
        displayText: "Emergency Response Expert",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 8,
      },
      platinum: {
        requirements: {
          response_speed_score: 9,
          same_day_service: 0.80,
          emergency_available: true,
        },
        displayText: "Lightning Response Master",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 9,
      },
    },
  },
  {
    type: "value_champion",
    category: "operational_excellence",
    name: "Value Champion",
    description: "Delivers exceptional value for investment",
    tiers: {
      bronze: {
        requirements: {
          fair_pricing: 0.70,
          worth_the_cost: 0.60,
          value_score: 7,
        },
        displayText: "Fair Value Provider",
        badgeIcon: "🥉",
        tierAccess: "free",
        displayPriority: 5,
      },
      silver: {
        requirements: {
          fair_pricing: 0.75,
          worth_the_cost: 0.70,
          value_score: 7.5,
        },
        displayText: "Value Professional",
        badgeIcon: "🥈",
        tierAccess: "starter",
        displayPriority: 6,
      },
      gold: {
        requirements: {
          transparent_costs: 0.80,
          value_score: 8,
          no_hidden_fees: 0.90,
        },
        displayText: "Transparent Value Leader",
        badgeIcon: "🥇",
        tierAccess: "pro",
        displayPriority: 7,
      },
      platinum: {
        requirements: {
          value_score: 9,
          worth_the_cost: 0.85,
          business_value_score: 8,
        },
        displayText: "Ultimate Value Master",
        badgeIcon: "👑",
        tierAccess: "power",
        displayPriority: 8,
      },
    },
  },
];

// Combine all awards
export const allAchievements: AchievementDefinition[] = [
  ...excellenceAwards,
  ...masteryAwards,
  ...customerImpactAwards,
  ...competitiveAwards,
  ...operationalAwards,
];

// Helper to get achievement by type
export function getAchievementDefinition(type: string): AchievementDefinition | undefined {
  return allAchievements.find(achievement => achievement.type === type);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
  return allAchievements.filter(achievement => achievement.category === category);
}