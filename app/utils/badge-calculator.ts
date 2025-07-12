import type { Doc } from "../../convex/_generated/dataModel";

export interface BadgeRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: "free" | "pro" | "power";
  category: "verification" | "performance" | "experience" | "premium";
  condition: (business: any, analytics?: any) => boolean;
  priority: number; // Higher priority badges show first
}

export const badgeRules: BadgeRule[] = [
  // Verification Badges
  {
    id: "verified_business",
    name: "Verified Business",
    description: "Business has been verified by our team",
    icon: "shield",
    color: "bg-green-100 text-green-800 border-green-200",
    tier: "pro",
    category: "verification",
    condition: (business) => business.verified === true,
    priority: 100
  },
  {
    id: "phone_verified",
    name: "Phone Verified",
    description: "Phone number has been verified",
    icon: "phone",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    tier: "pro",
    category: "verification",
    condition: (business) => business.phone && business.phone.length >= 10,
    priority: 90
  },
  {
    id: "website_verified",
    name: "Website Active",
    description: "Business has an active, verified website",
    icon: "globe",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    tier: "pro",
    category: "verification",
    condition: (business) => business.website && business.website.startsWith("http"),
    priority: 85
  },

  // Performance Badges
  {
    id: "top_rated",
    name: "Top Rated",
    description: "Consistently receives 4.5+ star ratings",
    icon: "star",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    tier: "free",
    category: "performance",
    condition: (business) => business.rating >= 4.5 && business.reviewCount >= 10,
    priority: 95
  },
  {
    id: "highly_reviewed",
    name: "Highly Reviewed",
    description: "Has 25+ customer reviews",
    icon: "message-square",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    tier: "pro",
    category: "performance",
    condition: (business) => business.reviewCount >= 25,
    priority: 80
  },
  {
    id: "local_favorite",
    name: "Local Favorite",
    description: "Popular choice among local customers",
    icon: "map-pin",
    color: "bg-red-100 text-red-800 border-red-200",
    tier: "pro",
    category: "performance",
    condition: (business) => business.reviewCount >= 50 && business.rating >= 4.3,
    priority: 88
  },
  {
    id: "quick_response",
    name: "Quick Response",
    description: "Responds to inquiries within 1 hour",
    icon: "clock",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    tier: "pro",
    category: "performance",
    condition: (business, analytics) => {
      // This would be calculated based on actual response time data
      // For now, we'll use a placeholder condition
      return business.planTier !== "free" && business.rating >= 4.0;
    },
    priority: 75
  },

  // Experience Badges
  {
    id: "established_business",
    name: "Established Business",
    description: "Operating for 5+ years",
    icon: "award",
    color: "bg-brown-100 text-brown-800 border-brown-200",
    tier: "pro",
    category: "experience",
    condition: (business) => {
      if (!business.createdAt) return false;
      const yearsInBusiness = (Date.now() - business.createdAt) / (1000 * 60 * 60 * 24 * 365);
      return yearsInBusiness >= 5;
    },
    priority: 70
  },
  {
    id: "veteran_owned",
    name: "Veteran Owned",
    description: "Owned and operated by military veterans",
    icon: "flag",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    tier: "pro",
    category: "experience",
    condition: (business) => {
      // This would be set manually or from business profile data
      return business.fromTheBusiness?.includes("veteran") || 
             business.description?.toLowerCase().includes("veteran");
    },
    priority: 65
  },
  {
    id: "family_business",
    name: "Family Business",
    description: "Family-owned and operated",
    icon: "users",
    color: "bg-green-100 text-green-800 border-green-200",
    tier: "pro",
    category: "experience",
    condition: (business) => {
      return business.fromTheBusiness?.includes("family") || 
             business.description?.toLowerCase().includes("family");
    },
    priority: 60
  },

  // Premium Badges
  {
    id: "power_listing",
    name: "Power Listing",
    description: "Premium business listing with enhanced features",
    icon: "crown",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300",
    tier: "power",
    category: "premium",
    condition: (business) => business.planTier === "power",
    priority: 110
  },
  {
    id: "pro_listing",
    name: "Pro Listing",
    description: "Professional business listing",
    icon: "zap",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    tier: "pro",
    category: "premium",
    condition: (business) => business.planTier === "pro",
    priority: 105
  },
  {
    id: "featured_business",
    name: "Featured Business",
    description: "Featured on homepage and category pages",
    icon: "star",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    tier: "power",
    category: "premium",
    condition: (business) => business.featured === true,
    priority: 108
  }
];

export class BadgeCalculator {
  /**
   * Calculate which badges a business qualifies for
   */
  static calculateBadges(business: any, analytics?: any): BadgeRule[] {
    return badgeRules
      .filter(rule => rule.condition(business, analytics))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get badges filtered by plan tier
   */
  static getBadgesForPlan(business: any, analytics?: any, planTier?: string): BadgeRule[] {
    const userPlanTier = planTier || business.planTier || "free";
    const availableBadges = this.calculateBadges(business, analytics);
    
    return availableBadges.filter(badge => {
      switch (userPlanTier) {
        case "power":
          return true; // Power users see all badges
        case "pro":
          return badge.tier === "free" || badge.tier === "pro";
        case "free":
        default:
          return badge.tier === "free";
      }
    });
  }

  /**
   * Get badges grouped by category
   */
  static getBadgesByCategory(business: any, analytics?: any): Record<string, BadgeRule[]> {
    const badges = this.calculateBadges(business, analytics);
    
    return badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, BadgeRule[]>);
  }

  /**
   * Get the count of badges by tier
   */
  static getBadgeCountByTier(business: any, analytics?: any): Record<string, number> {
    const badges = this.calculateBadges(business, analytics);
    
    return badges.reduce((acc, badge) => {
      acc[badge.tier] = (acc[badge.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Check if business qualifies for a specific badge
   */
  static qualifiesForBadge(business: any, badgeId: string, analytics?: any): boolean {
    const rule = badgeRules.find(r => r.id === badgeId);
    if (!rule) return false;
    
    return rule.condition(business, analytics);
  }

  /**
   * Get upgrade suggestions based on badges business could earn
   */
  static getUpgradeSuggestions(business: any, analytics?: any): {
    badge: BadgeRule;
    suggestion: string;
  }[] {
    const currentBadges = this.calculateBadges(business, analytics);
    const currentBadgeIds = new Set(currentBadges.map(b => b.id));
    
    return badgeRules
      .filter(rule => {
        // Don't suggest badges they already have
        if (currentBadgeIds.has(rule.id)) return false;
        
        // Only suggest badges they could potentially earn with upgrade
        return rule.tier === "pro" || rule.tier === "power";
      })
      .slice(0, 3) // Limit to top 3 suggestions
      .map(badge => ({
        badge,
        suggestion: this.getUpgradeSuggestionText(badge, business)
      }));
  }

  private static getUpgradeSuggestionText(badge: BadgeRule, business: any): string {
    switch (badge.id) {
      case "verified_business":
        return "Upgrade to Pro to get your business verified and build customer trust";
      case "phone_verified":
        return "Upgrade to Pro to verify your phone number and show customers you're legitimate";
      case "website_verified":
        return "Add and verify your website with Pro to showcase your online presence";
      case "quick_response":
        return "Upgrade to Pro to enable quick response features and improve customer service";
      default:
        return `Upgrade to ${badge.tier === "pro" ? "Pro" : "Power"} to unlock the ${badge.name} badge`;
    }
  }

  /**
   * Get badge display priority
   */
  static getBadgeDisplayOrder(badges: BadgeRule[]): BadgeRule[] {
    return badges.sort((a, b) => {
      // First sort by category priority
      const categoryPriority = {
        premium: 4,
        verification: 3,
        performance: 2,
        experience: 1
      };
      
      const aCategoryPriority = categoryPriority[a.category as keyof typeof categoryPriority] || 0;
      const bCategoryPriority = categoryPriority[b.category as keyof typeof categoryPriority] || 0;
      
      if (aCategoryPriority !== bCategoryPriority) {
        return bCategoryPriority - aCategoryPriority;
      }
      
      // Then sort by individual badge priority
      return b.priority - a.priority;
    });
  }
}