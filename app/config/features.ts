// Feature configuration for plan-based visibility
export type PlanTier = "free" | "pro" | "power";

export interface Feature {
  id: string;
  name: string;
  description: string;
  availableIn: PlanTier[];
  upgradeMessage?: string;
}

// Define all features and their availability by plan
export const features: Record<string, Feature> = {
  // Profile Features
  heroImageUpload: {
    id: "heroImageUpload",
    name: "Custom Hero Image",
    description: "Upload a custom hero banner image",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro to upload custom images",
  },
  
  editProfile: {
    id: "editProfile",
    name: "Edit Business Profile",
    description: "Edit your business information",
    availableIn: ["pro", "power"],
    upgradeMessage: "Claim and upgrade to edit your listing",
  },
  
  customSummary: {
    id: "customSummary",
    name: "Custom Business Summary",
    description: "Write your own business description",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro to customize your summary",
  },
  
  // Service Features
  serviceCards: {
    id: "serviceCards",
    name: "Enhanced Service Cards",
    description: "Display services with icons and descriptions",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro for enhanced service display",
  },
  
  aiServiceDescriptions: {
    id: "aiServiceDescriptions",
    name: "AI Service Descriptions",
    description: "AI-generated service descriptions",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI-enhanced content",
  },
  
  // Analytics Features
  basicAnalytics: {
    id: "basicAnalytics",
    name: "Basic Analytics",
    description: "View page views and contact clicks",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro to see your analytics",
  },
  
  advancedAnalytics: {
    id: "advancedAnalytics",
    name: "Advanced Analytics",
    description: "Detailed analytics with trends and insights",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for advanced analytics",
  },
  
  insightsTab: {
    id: "insightsTab",
    name: "Insights Tab",
    description: "Access business insights and trends",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro to unlock insights",
  },
  
  // Lead Management
  contactForm: {
    id: "contactForm",
    name: "Contact Form",
    description: "Receive customer inquiries",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro to enable contact form",
  },
  
  leadNotifications: {
    id: "leadNotifications",
    name: "Lead Notifications",
    description: "Get notified of new leads",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro for lead notifications",
  },
  
  // AI Features
  aiSummary: {
    id: "aiSummary",
    name: "AI Business Summary",
    description: "AI-generated business summary",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI content",
  },
  
  reviewAnalysis: {
    id: "reviewAnalysis",
    name: "Review Analysis",
    description: "AI-powered review sentiment analysis",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for review insights",
  },
  
  seoAudit: {
    id: "seoAudit",
    name: "SEO Audit",
    description: "Website and SEO performance audit",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for SEO analysis",
  },
  
  
  // Badges
  verifiedBadge: {
    id: "verifiedBadge",
    name: "Verified Badge",
    description: "Show verified business badge",
    availableIn: ["pro", "power"],
    upgradeMessage: "Claim your business to get verified",
  },
  
  premiumBadges: {
    id: "premiumBadges",
    name: "Premium Badges",
    description: "Unlock premium achievement badges",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for premium badges",
  },
  
  // Other Features
  
  priorityPlacement: {
    id: "priorityPlacement",
    name: "Priority Placement",
    description: "Boost visibility in search results",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade for better visibility",
  },
  
  homepageFeature: {
    id: "homepageFeature",
    name: "Homepage Feature",
    description: "Featured placement on homepage",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for homepage featuring",
  },
  
  vipSupport: {
    id: "vipSupport",
    name: "VIP Support",
    description: "Priority customer support",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for VIP support",
  },

  // Phase 4 AI Content Features
  aiContentGeneration: {
    id: "aiContentGeneration",
    name: "AI Content Generation",
    description: "AI-powered business summary with tone controls",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI content generation",
  },

  aiServiceEnhancement: {
    id: "aiServiceEnhancement", 
    name: "AI Service Enhancement",
    description: "AI-enhanced service descriptions and pricing",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI service enhancement",
  },

  aiPricingSuggestions: {
    id: "aiPricingSuggestions",
    name: "AI Pricing Intelligence", 
    description: "Market-based pricing suggestions with AI",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI pricing intelligence",
  },

  aiContentOptimization: {
    id: "aiContentOptimization",
    name: "AI Content Optimization",
    description: "Automated content optimization recommendations",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI content optimization",
  },

  aiSocialGeneration: {
    id: "aiSocialGeneration",
    name: "AI Social Media Generator",
    description: "AI-powered social media content creation",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI social media content",
  },

  // Phase 4 SEO & Marketing Features
  keywordTracking: {
    id: "keywordTracking",
    name: "Keyword Tracking",
    description: "Track keyword performance and optimization",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for keyword tracking",
  },

  competitorSeoAnalysis: {
    id: "competitorSeoAnalysis",
    name: "Competitor SEO Analysis",
    description: "Analyze competitor SEO strategies and gaps",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for competitor analysis",
  },

  localSeoOptimization: {
    id: "localSeoOptimization",
    name: "Local SEO Optimization",
    description: "Arizona-specific local SEO recommendations",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for local SEO optimization",
  },

  socialMediaHealth: {
    id: "socialMediaHealth",
    name: "Social Media Health Analysis",
    description: "Comprehensive social media optimization",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for social media analysis",
  },
};

// Helper function to check if a feature is available for a plan
export function isFeatureAvailable(featureId: string, planTier: PlanTier): boolean {
  const feature = features[featureId];
  if (!feature) return false;
  return feature.availableIn.includes(planTier);
}

// Get all features available for a plan
export function getFeaturesForPlan(planTier: PlanTier): Feature[] {
  return Object.values(features).filter(feature => 
    feature.availableIn.includes(planTier)
  );
}

// Get upgrade message for a feature
export function getUpgradeMessage(featureId: string): string {
  const feature = features[featureId];
  return feature?.upgradeMessage || "Upgrade your plan to access this feature";
}

// Plan comparison data
export const planComparison = {
  free: {
    name: "Free",
    price: 0,
    features: getFeaturesForPlan("free"),
    highlights: [
      "Basic listing with GMB data",
      "Customer reviews display",
      "Map and directions",
      "Basic contact info",
    ],
  },
  pro: {
    name: "Pro",
    price: 29,
    features: getFeaturesForPlan("pro"),
    highlights: [
      "Everything in Free",
      "Edit business profile",
      "Upload custom images",
      "Contact form with leads",
      "Basic analytics",
      "Verified badge",
      "Priority placement",
    ],
  },
  power: {
    name: "Power",
    price: 97,
    features: getFeaturesForPlan("power"),
    highlights: [
      "Everything in Pro",
      "AI-powered content",
      "Advanced analytics",
      "Review insights",
      "SEO audit tools",
      "Homepage featuring",
      "VIP support",
    ],
  },
};