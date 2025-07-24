// Tier-based system types and configurations for business listings

export type TierLevel = 'free' | 'starter' | 'pro' | 'power';

export interface BadgeConfig {
  text: string;
  icon: string;
  color: 'gray' | 'blue' | 'orange' | 'green';
  style: 'basic' | 'enhanced' | 'featured' | 'premium';
}

export interface FeatureSet {
  showLogo: boolean;
  showPerformanceData: boolean;
  showAdvancedAI: boolean;
  showImageGallery: boolean;
  showLeadCapture: boolean;
  showReviewResponses: boolean;
  showCompetitiveAnalysis: boolean;
}

export interface UIConfiguration {
  headerStyle: 'basic' | 'professional' | 'featured' | 'premium';
  contactStyle: 'minimal' | 'enhanced' | 'professional' | 'lead-focused';
  serviceStyle: 'bullets' | 'enhanced-bullets' | 'cards' | 'premium-cards';
  reviewStyle: 'basic' | 'enhanced' | 'interactive' | 'advanced';
  aiSectionCount: number;
}

export interface ContentConfiguration {
  aiInsightType: 'basic' | 'enhanced' | 'professional' | 'premium';
  reviewCount: number;
  serviceDescriptionLevel: 'minimal' | 'detailed' | 'comprehensive' | 'premium';
  performanceIndicators: string[];
}

export interface LimitConfiguration {
  maxReviews: number;
  maxServices: number;
  maxAIInsights: number;
}

export type TierConfig = {
  id: TierLevel;
  name: string;
  badge: BadgeConfig;
  features: FeatureSet;
  ui: UIConfiguration;
  content: ContentConfiguration;
  limits: LimitConfiguration;
};

export interface PerformanceData {
  ranking?: number;
  responseTime?: string;
  competitivePosition?: string;
  satisfaction?: number;
  areaAverage?: number;
}

export interface AIInsightsData {
  basic?: string[];
  enhanced?: string[];
  professional?: string[];
  premium?: string[];
}

export interface BusinessWithTier {
  id: string;
  planTier: TierLevel;
  name: string;
  rating: number;
  reviewCount: number;
  city: string;
  category?: { name: string; icon?: string; slug: string } | null;
  logo?: string;
  images?: string[];
  performanceData?: PerformanceData;
  aiInsights?: AIInsightsData;
  services?: any[];
  reviews?: any[];
}

// Central tier configuration system
export const TIER_CONFIGURATIONS: Record<TierLevel, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    badge: {
      text: 'Verified by Business Owner',
      icon: '✅',
      color: 'gray',
      style: 'basic'
    },
    features: {
      showLogo: false,
      showPerformanceData: false,
      showAdvancedAI: false,
      showImageGallery: false,
      showLeadCapture: false,
      showReviewResponses: false,
      showCompetitiveAnalysis: false
    },
    ui: {
      headerStyle: 'basic',
      contactStyle: 'minimal',
      serviceStyle: 'bullets',
      reviewStyle: 'basic',
      aiSectionCount: 1
    },
    content: {
      aiInsightType: 'basic',
      reviewCount: 3,
      serviceDescriptionLevel: 'minimal',
      performanceIndicators: []
    },
    limits: {
      maxReviews: 3,
      maxServices: 6,
      maxAIInsights: 4
    }
  },
  
  starter: {
    id: 'starter',
    name: 'Starter Professional',
    badge: {
      text: 'Starter Professional',
      icon: '✅',
      color: 'blue',
      style: 'enhanced'
    },
    features: {
      showLogo: true,
      showPerformanceData: true,
      showAdvancedAI: false,
      showImageGallery: false,
      showLeadCapture: false,
      showReviewResponses: false,
      showCompetitiveAnalysis: false
    },
    ui: {
      headerStyle: 'professional',
      contactStyle: 'enhanced',
      serviceStyle: 'enhanced-bullets',
      reviewStyle: 'enhanced',
      aiSectionCount: 1
    },
    content: {
      aiInsightType: 'enhanced',
      reviewCount: 8,
      serviceDescriptionLevel: 'detailed',
      performanceIndicators: ['ranking', 'responseTime', 'satisfaction']
    },
    limits: {
      maxReviews: 8,
      maxServices: 12,
      maxAIInsights: 8
    }
  },
  
  pro: {
    id: 'pro',
    name: 'Pro-Verified Business',
    badge: {
      text: 'Pro-Verified Business',
      icon: '🌟',
      color: 'orange',
      style: 'featured'
    },
    features: {
      showLogo: true,
      showPerformanceData: true,
      showAdvancedAI: true,
      showImageGallery: false,
      showLeadCapture: false,
      showReviewResponses: true,
      showCompetitiveAnalysis: true
    },
    ui: {
      headerStyle: 'featured',
      contactStyle: 'professional',
      serviceStyle: 'cards',
      reviewStyle: 'interactive',
      aiSectionCount: 2
    },
    content: {
      aiInsightType: 'professional',
      reviewCount: 15,
      serviceDescriptionLevel: 'comprehensive',
      performanceIndicators: ['ranking', 'responseTime', 'satisfaction', 'marketPosition', 'competitiveAdvantage']
    },
    limits: {
      maxReviews: 15,
      maxServices: 20,
      maxAIInsights: 12
    }
  },
  
  power: {
    id: 'power',
    name: 'Power-Tier Verified',
    badge: {
      text: 'Power-Tier Verified Business',
      icon: '⚡',
      color: 'green',
      style: 'premium'
    },
    features: {
      showLogo: true,
      showPerformanceData: true,
      showAdvancedAI: true,
      showImageGallery: true,
      showLeadCapture: true,
      showReviewResponses: true,
      showCompetitiveAnalysis: true
    },
    ui: {
      headerStyle: 'premium',
      contactStyle: 'lead-focused',
      serviceStyle: 'premium-cards',
      reviewStyle: 'advanced',
      aiSectionCount: 3
    },
    content: {
      aiInsightType: 'premium',
      reviewCount: -1, // unlimited
      serviceDescriptionLevel: 'premium',
      performanceIndicators: ['ranking', 'responseTime', 'satisfaction', 'marketPosition', 'competitiveAdvantage', 'realTimeMetrics']
    },
    limits: {
      maxReviews: -1, // unlimited
      maxServices: -1, // unlimited
      maxAIInsights: 20
    }
  }
};

// Alias export for backward compatibility
export const tierConfig = TIER_CONFIGURATIONS;