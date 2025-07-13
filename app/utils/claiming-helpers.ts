/**
 * Helper functions for business claiming state and user experience
 */

export interface Business {
  _id: string;
  name: string;
  planTier: "free" | "pro" | "power";
  claimed: boolean;
  verified?: boolean;
  ownerId?: string;
  reviewCount?: number;
  rating?: number;
}

export interface User {
  _id: string;
  tokenIdentifier: string;
}

/**
 * Determines if a business is claimed
 */
export function isBusinessClaimed(business: Business): boolean {
  return business.claimed === true && !!business.ownerId;
}

/**
 * Determines if a business is unclaimed and should show claiming prompts
 */
export function shouldShowClaimingPrompts(business: Business): boolean {
  return !business.claimed && !business.ownerId;
}

/**
 * Determines if a user owns a specific business
 */
export function isBusinessOwner(business: Business, user: User | null): boolean {
  if (!user || !business.ownerId) return false;
  return business.ownerId === user._id || business.ownerId === user.tokenIdentifier;
}

/**
 * Gets the appropriate message for claiming state
 */
export function getClaimingMessage(business: Business): string {
  if (business.claimed) {
    return `${business.name} is claimed and managed by its owner.`;
  }
  return `${business.name} is available to claim. Are you the owner?`;
}

/**
 * Gets the business state display information
 */
export function getBusinessStateInfo(business: Business) {
  const state = business.claimed ? 'claimed' : 'unclaimed';
  const tierDisplay = business.planTier === 'free' ? 'Free' : 
                     business.planTier === 'pro' ? 'Pro' : 'Power';
  
  return {
    state,
    tierDisplay,
    isUnclaimed: !business.claimed,
    isClaimed: business.claimed,
    isVerified: business.verified || false,
    canClaim: !business.claimed,
    planTier: business.planTier
  };
}

/**
 * Determines which features should be locked for unclaimed businesses
 */
export function getLockedFeatures(business: Business): string[] {
  if (business.claimed) return [];
  
  // Unclaimed businesses have most features locked
  return [
    'contactForm',
    'analytics',
    'leadManagement',
    'verifiedBadge',
    'editProfile',
    'customSummary',
    'serviceCards',
    'insightsTab',
    'reviewManagement',
    'seoTools',
    'aiTools'
  ];
}

/**
 * Gets the appropriate call-to-action for the business state
 */
export function getBusinessCTA(business: Business, isOwner: boolean) {
  if (isOwner && business.claimed) {
    return {
      text: 'Manage Listing',
      link: `/dashboard/business/${business._id}`,
      variant: 'default' as const,
      icon: 'edit'
    };
  }
  
  if (!business.claimed) {
    return {
      text: 'Claim This Listing - Free',
      link: `/claim-business?businessId=${business._id}`,
      variant: 'default' as const,
      icon: 'crown'
    };
  }
  
  // For non-owners viewing claimed businesses
  return {
    text: 'Contact Business',
    link: '#contact',
    variant: 'outline' as const,
    icon: 'message'
  };
}

/**
 * Determines if a feature should be prominently promoted for unclaimed businesses
 */
export function shouldPromoteFeature(business: Business, featureId: string): boolean {
  if (business.claimed) return false;
  
  // Features that should be prominently promoted to encourage claiming
  const promotedFeatures = [
    'contactForm',
    'analytics',
    'verifiedBadge',
    'leadManagement',
    'customSummary'
  ];
  
  return promotedFeatures.includes(featureId);
}

/**
 * Gets the claiming urgency level based on business characteristics
 */
export function getClaimingUrgency(business: Business): 'low' | 'medium' | 'high' {
  if (business.claimed) return 'low';
  
  // High urgency for businesses with lots of reviews or high ratings
  if ((business.reviewCount || 0) > 50 || (business.rating || 0) > 4.5) {
    return 'high';
  }
  
  // Medium urgency for businesses with some activity
  if ((business.reviewCount || 0) > 10 || (business.rating || 0) > 4.0) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Gets the claiming benefit messages based on business tier potential
 */
export function getClaimingBenefits(business: Business): string[] {
  const baseBenefits = [
    'Respond to customer messages',
    'Update business information',
    'Add photos and descriptions',
    'Get verified badge'
  ];
  
  // Add advanced benefits for businesses that could benefit from higher tiers
  if ((business.reviewCount || 0) > 25 || (business.rating || 0) > 4.0) {
    baseBenefits.push(
      'Track performance with analytics',
      'Manage reviews and ratings',
      'Generate leads from your listing'
    );
  }
  
  return baseBenefits;
}