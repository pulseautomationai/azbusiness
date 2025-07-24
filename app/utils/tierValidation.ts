// Tier validation utilities

import { TierLevel, TierConfig, TIER_CONFIGURATIONS } from '~/types/tiers';

export const validateTierConfiguration = (tier: TierLevel): boolean => {
  const config = TIER_CONFIGURATIONS[tier];
  
  // Check required fields
  if (!config || !config.id || !config.features) {
    console.error(`Invalid tier configuration for ${tier}`);
    return false;
  }
  
  // Validate tier progression rules
  const tierHierarchy: TierLevel[] = ['free', 'starter', 'pro', 'power'];
  const tierIndex = tierHierarchy.indexOf(tier);
  
  if (tierIndex === -1) {
    console.error(`Unknown tier: ${tier}`);
    return false;
  }
  
  return true;
};

export const getTierConfig = (tier: TierLevel): TierConfig => {
  if (!validateTierConfiguration(tier)) {
    console.warn(`Invalid tier ${tier}, falling back to free tier`);
    return TIER_CONFIGURATIONS.free;
  }
  return TIER_CONFIGURATIONS[tier];
};

export const getNextTierForFeature = (feature: string, currentTier: TierLevel): TierLevel => {
  const tierHierarchy: TierLevel[] = ['free', 'starter', 'pro', 'power'];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  
  // Feature to minimum tier mapping
  const featureTierRequirements: Record<string, TierLevel> = {
    'logo': 'starter',
    'performance-tracking': 'starter',
    'competitive-analysis': 'pro',
    'advanced-ai': 'pro',
    'image-gallery': 'power',
    'lead-capture': 'power'
  };
  
  const requiredTier = featureTierRequirements[feature] || 'power';
  const requiredIndex = tierHierarchy.indexOf(requiredTier);
  
  if (currentIndex >= requiredIndex) {
    // Already has access
    return currentTier;
  }
  
  return requiredTier;
};

export const hasFeatureAccess = (tier: TierLevel, feature: keyof TierConfig['features']): boolean => {
  const config = getTierConfig(tier);
  return config.features[feature] || false;
};

export const getTierHierarchyLevel = (tier: TierLevel): number => {
  const tierHierarchy: TierLevel[] = ['free', 'starter', 'pro', 'power'];
  return tierHierarchy.indexOf(tier);
};

export const isTierAtLeast = (currentTier: TierLevel, requiredTier: TierLevel): boolean => {
  return getTierHierarchyLevel(currentTier) >= getTierHierarchyLevel(requiredTier);
};