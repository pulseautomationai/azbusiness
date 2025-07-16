import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../convex/_generated/api";
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

export function usePlanFeatures({ planTier: overridePlanTier, isClaimed = false }: UsePlanFeaturesProps = {}): UsePlanFeaturesReturn {
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real subscription data
  const subscription = useQuery(api.subscriptions.fetchUserSubscription);
  const subscriptionStatus = useQuery(api.subscriptions.checkUserSubscriptionStatus, {});
  
  // Determine actual plan tier from subscription data
  let actualPlanTier: PlanTier;
  if (overridePlanTier) {
    actualPlanTier = overridePlanTier;
  } else if (subscription?.status === 'active' && subscription.amount) {
    // Map subscription amount to plan tier
    if (subscription.amount >= 97) {
      actualPlanTier = 'power';
    } else if (subscription.amount >= 29) {
      actualPlanTier = 'pro';
    } else if (subscription.amount >= 9) {
      actualPlanTier = 'starter';
    } else {
      actualPlanTier = 'free';
    }
  } else {
    actualPlanTier = 'free';
  }

  // Update loading state
  useEffect(() => {
    if (isSignedIn && (subscription !== undefined || subscriptionStatus !== undefined)) {
      setIsLoading(false);
    } else if (!isSignedIn) {
      setIsLoading(false);
    }
  }, [isSignedIn, subscription, subscriptionStatus]);

  // Check if user can access a specific feature
  const canAccess = (featureId: string): boolean => {
    return isFeatureAvailableForBusiness(featureId, actualPlanTier, isClaimed);
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
    planTier: actualPlanTier,
    isClaimed,
    logoUpload,
    imageGallery,
    leadTracking,
    aiContentGeneration,
    billingManagement,
  };
}