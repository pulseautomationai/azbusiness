// Feature configuration for plan-based visibility
export type PlanTier = "free" | "starter" | "pro" | "power";

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
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power to upload custom images",
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

  // AI Features available from Free tier
  aiSummaryBasic: {
    id: "aiSummaryBasic",
    name: "Basic AI Insights",
    description: "Simple positive customer feedback summary",
    availableIn: ["free", "starter", "pro", "power"],
    upgradeMessage: "Available in all plans",
  },

  // Free tier features
  basicListing: {
    id: "basicListing",
    name: "Basic Business Listing",
    description: "Name, address, phone, hours (editable)",
    availableIn: ["free", "starter", "pro", "power"],
    upgradeMessage: "Available in all plans",
  },

  verifiedBadgeFree: {
    id: "verifiedBadgeFree",
    name: "Verified Business Badge",
    description: "Verified by Business Owner badge",
    availableIn: ["free", "starter", "pro", "power"],
    upgradeMessage: "Available for all claimed businesses",
  },

  reviewDisplayBasic: {
    id: "reviewDisplayBasic",
    name: "Google Reviews Display (3)",
    description: "Display up to 3 Google reviews",
    availableIn: ["free", "starter"],
    upgradeMessage: "Available in Free and Starter plans",
  },

  mobileOptimized: {
    id: "mobileOptimized",
    name: "Mobile-Optimized Profile",
    description: "Responsive design for all devices",
    availableIn: ["free", "starter", "pro", "power"],
    upgradeMessage: "Available in all plans",
  },

  appearsInRankings: {
    id: "appearsInRankings",
    name: "Appears in AI Rankings",
    description: "Competes in performance rankings",
    availableIn: ["free", "starter", "pro", "power"],
    upgradeMessage: "Available in all plans",
  },

  verifiedBadgeStarter: {
    id: "verifiedBadgeStarter", 
    name: "Starter Professional Badge",
    description: "Enhanced verification badge for Starter plan",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter for professional badge",
  },

  seoBacklink: {
    id: "seoBacklink",
    name: "SEO Backlink",
    description: "Direct SEO backlink to your website",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter for SEO backlink",
  },
  
  // Service Features
  serviceCards: {
    id: "serviceCards",
    name: "Enhanced Service Cards",
    description: "Display services with icons and descriptions",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro for enhanced service display",
  },

  serviceListBasic: {
    id: "serviceListBasic",
    name: "Basic Service List",
    description: "Simple bullet-point service presentation",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter for service listing",
  },

  performanceDashboard: {
    id: "performanceDashboard",
    name: "Performance Dashboard",
    description: "See ranking position and trends",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter to see your ranking position",
  },

  enhancedAIInsights: {
    id: "enhancedAIInsights",
    name: "Enhanced AI Insights",
    description: "Detailed customer feedback analysis",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter for enhanced AI insights",
  },

  advancedBusinessEditing: {
    id: "advancedBusinessEditing",
    name: "Advanced Business Editing",
    description: "Add services, specialties, certifications",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter for advanced editing",
  },

  reviewDisplayStarter: {
    id: "reviewDisplayStarter",
    name: "Google Reviews Display (8)",
    description: "Display up to 8 Google reviews",
    availableIn: ["starter"],
    upgradeMessage: "Available in Starter plan",
  },

  reviewDisplayPro: {
    id: "reviewDisplayPro",
    name: "Google Reviews Display (15)",
    description: "Display up to 15 Google reviews",
    availableIn: ["pro"],
    upgradeMessage: "Upgrade to Pro for more reviews",
  },

  featuredCategoryListing: {
    id: "featuredCategoryListing",
    name: "Featured Category Listing",
    description: "Priority placement in service category",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro for featured placement",
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
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power to enable contact form",
  },
  
  leadNotifications: {
    id: "leadNotifications",
    name: "Lead Notifications",
    description: "Get notified of new leads",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for lead notifications",
  },

  unlimitedLeads: {
    id: "unlimitedLeads",
    name: "Unlimited Leads",
    description: "Receive unlimited customer inquiries",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for unlimited leads",
  },
  
  // Professional Overview Features
  professionalOverview: {
    id: "professionalOverview",
    name: "Professional Overview",
    description: "AI-generated business overview",
    availableIn: ["free", "starter", "pro", "power"],
    upgradeMessage: "Available in all plans",
  },

  professionalOverviewEdit: {
    id: "professionalOverviewEdit",
    name: "Edit Professional Overview",
    description: "Customize your business overview",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro to edit your overview",
  },

  professionalOverviewAI: {
    id: "professionalOverviewAI",
    name: "AI-Enhanced Overview",
    description: "AI content generation with style options",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for AI-enhanced content",
  },

  // AI Features
  aiBusinessSummary: {
    id: "aiBusinessSummary",
    name: "AI Business Summary",
    description: "AI-generated business summary with key metrics",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter for AI business summary",
  },
  
  competitiveIntelligence: {
    id: "competitiveIntelligence",
    name: "Competitive Intelligence",
    description: "AI-powered competitive analysis and market positioning",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for competitive intelligence",
  },
  
  reviewIntelligence: {
    id: "reviewIntelligence",
    name: "Review Intelligence",
    description: "AI-powered review sentiment and keyword analysis",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for review intelligence",
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
  
  // Claiming Features
  claimRequired: {
    id: "claimRequired",
    name: "Business Claiming Required",
    description: "Must claim business to access this feature",
    availableIn: [], // Special feature - requires claiming first
    upgradeMessage: "Claim your business to unlock this feature",
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

  // Dashboard Features
  logoUpload: {
    id: "logoUpload",
    name: "Logo Upload",
    description: "Upload custom business logo",
    availableIn: ["starter", "pro", "power"],
    upgradeMessage: "Upgrade to Starter to upload your logo",
  },

  imageGallery: {
    id: "imageGallery",
    name: "Image Gallery",
    description: "Upload and showcase up to 10 business images",
    availableIn: ["power"],
    upgradeMessage: "Upgrade to Power for image gallery",
  },

  leadTracking: {
    id: "leadTracking",
    name: "Lead Tracking",
    description: "Track and manage customer leads",
    availableIn: ["pro", "power"],
    upgradeMessage: "Upgrade to Pro for lead tracking",
  },

  billingManagement: {
    id: "billingManagement",
    name: "Billing Management",
    description: "Manage subscription and payment methods",
    availableIn: ["pro", "power"],
    upgradeMessage: "Available with paid plans",
  },
};

// Helper function to check if a feature is available for a plan
export function isFeatureAvailable(featureId: string, planTier: PlanTier): boolean {
  const feature = features[featureId];
  if (!feature) return false;
  return feature.availableIn.includes(planTier);
}

// Helper function to check if a feature is available for a claimed business
export function isFeatureAvailableForBusiness(
  featureId: string, 
  planTier: PlanTier, 
  isClaimed: boolean = false
): boolean {
  const feature = features[featureId];
  if (!feature) return false;
  
  // Some features require claiming regardless of plan
  const claimRequiredFeatures = [
    'editProfile',
    'contactForm', 
    'verifiedBadge',
    'leadNotifications',
    'basicAnalytics'
  ];
  
  if (claimRequiredFeatures.includes(featureId) && !isClaimed) {
    return false;
  }
  
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
      "Basic business listing & contact info",
      "Verified business badge",
      "Basic AI insights",
      "Appears in AI rankings",
      "Google reviews display (3)",
      "Mobile-optimized profile",
    ],
  },
  starter: {
    name: "Starter",
    price: 9,
    features: getFeaturesForPlan("starter"),
    highlights: [
      "Professional logo upload",
      "Performance dashboard",
      "Enhanced AI insights",
      "Advanced business editing",
      "Editable AI summary",
      "SEO backlink to website",
      "Google reviews display (8)",
      "Starter Professional badge",
    ],
  },
  pro: {
    name: "Pro",
    price: 29,
    features: getFeaturesForPlan("pro"),
    highlights: [
      "Everything in Starter",
      "Multiple featured placements",
      "Enhanced service cards",
      "Google reviews display (15)",
      "Review response capability",
      "Active badge system",
      "Content editing control",
      "Basic competitive analysis",
      "Monthly performance reports",
      "Pro-Verified status",
    ],
  },
  power: {
    name: "Power",
    price: 97,
    features: getFeaturesForPlan("power"),
    highlights: [
      "Everything in Pro",
      "Unlimited exclusive lead capture",
      "Homepage featured placement",
      "Professional image gallery",
      "Google reviews display (unlimited)",
      "Advanced AI review analysis",
      "Real-time performance updates",
      "Advanced competitive intelligence",
      "Priority customer support",
      "Power-Tier Verified status",
      "Local market leader positioning",
    ],
  },
};