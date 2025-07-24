import React from 'react';
import { TierLevel, BusinessWithTier } from '~/types/tiers';
import { isTierAtLeast, getTierConfig } from '~/utils/tierValidation';

interface TierAwareComponentProps {
  business: BusinessWithTier;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  requiredTier?: TierLevel[];
  minTier?: TierLevel;
}

export const TierAwareComponent: React.FC<TierAwareComponentProps> = ({
  business,
  children,
  fallback,
  requiredTier,
  minTier,
}) => {
  const hasAccess = (() => {
    if (!requiredTier && !minTier) return true;
    
    if (minTier) {
      return isTierAtLeast(business.planTier, minTier);
    }
    
    if (requiredTier) {
      return requiredTier.includes(business.planTier);
    }
    
    return false;
  })();
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Utility component for wrapping tier-specific content with error handling
export const TierSafeComponent: React.FC<{
  business: BusinessWithTier;
  children: React.ReactNode;
}> = ({ business, children }) => {
  try {
    const tierConfig = getTierConfig(business.planTier);
    return <div className={`tier-${business.planTier}`}>{children}</div>;
  } catch (error) {
    console.error('Tier configuration error:', error);
    // Fallback to free tier if configuration fails
    return <div className="tier-free">{children}</div>;
  }
};