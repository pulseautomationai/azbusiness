import { useState, useEffect } from "react";
import { isFeatureAvailable, isFeatureAvailableForBusiness, getUpgradeMessage, type PlanTier } from "~/config/features";

interface UsePlanFeaturesProps {
  planTier?: PlanTier;
  isClaimed?: boolean;
}

interface UsePlanFeaturesReturn {
  canAccess: (featureId: string) => boolean;
  getUpgradeMessage: (featureId: string) => string;
  isLoading: boolean;
  planTier: PlanTier;
  isClaimed: boolean;
  // Convenience feature flags
  logoUpload: boolean;
  imageGallery: boolean;
  leadTracking: boolean;
  aiContentGeneration: boolean;
  billingManagement: boolean;
}

export function usePlanFeatures({ planTier = "free", isClaimed = false }: UsePlanFeaturesProps = {}): UsePlanFeaturesReturn {
  const [isLoading, setIsLoading] = useState(false);

  // Check if user can access a specific feature
  const canAccess = (featureId: string): boolean => {
    return isFeatureAvailableForBusiness(featureId, planTier, isClaimed);
  };

  // Convenience feature flags for common features
  const logoUpload = canAccess("logoUpload");
  const imageGallery = canAccess("imageGallery");
  const leadTracking = canAccess("leadTracking");
  const aiContentGeneration = canAccess("aiContentGeneration");
  const billingManagement = canAccess("billingManagement");

  return {
    canAccess,
    getUpgradeMessage,
    isLoading,
    planTier,
    isClaimed,
    logoUpload,
    imageGallery,
    leadTracking,
    aiContentGeneration,
    billingManagement,
  };
}