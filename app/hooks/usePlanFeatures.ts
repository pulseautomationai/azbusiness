import { useState, useEffect } from "react";
import { isFeatureAvailable, getUpgradeMessage, type PlanTier } from "~/config/features";

interface UsePlanFeaturesProps {
  planTier: PlanTier;
}

interface UsePlanFeaturesReturn {
  canAccess: (featureId: string) => boolean;
  getUpgradeMessage: (featureId: string) => string;
  isLoading: boolean;
  planTier: PlanTier;
}

export function usePlanFeatures({ planTier }: UsePlanFeaturesProps): UsePlanFeaturesReturn {
  const [isLoading, setIsLoading] = useState(false);

  // Check if user can access a specific feature
  const canAccess = (featureId: string): boolean => {
    return isFeatureAvailable(featureId, planTier);
  };

  return {
    canAccess,
    getUpgradeMessage,
    isLoading,
    planTier,
  };
}