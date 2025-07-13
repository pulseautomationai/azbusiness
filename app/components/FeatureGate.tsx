import React, { type ReactNode } from "react";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { PlanTier } from "~/config/features";

interface FeatureGateProps {
  featureId: string;
  planTier?: PlanTier;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  className?: string;
}

export function FeatureGate({
  featureId,
  planTier,
  children,
  fallback,
  showUpgrade = true,
  className = "",
}: FeatureGateProps) {
  const { canAccess, getUpgradeMessage } = usePlanFeatures({ planTier });

  // If user has access, render the feature
  if (canAccess(featureId)) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked feature display
  if (showUpgrade) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-50 bg-opacity-90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
              <CardTitle className="text-lg">Feature Locked</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                {getUpgradeMessage(featureId)}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link to="/pricing">
                  <Button className="w-full sm:w-auto">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // Don't render anything if showUpgrade is false
  return null;
}

interface FeatureBadgeProps {
  featureId: string;
  planTier: PlanTier;
  requiredPlan: PlanTier;
  className?: string;
}

export function FeatureBadge({
  featureId,
  planTier,
  requiredPlan,
  className = "",
}: FeatureBadgeProps) {
  const { canAccess, getUpgradeMessage } = usePlanFeatures({ planTier });
  
  if (canAccess(featureId)) {
    return null; // Don't show badge if user has access
  }

  const getPlanColor = (plan: PlanTier) => {
    switch (plan) {
      case "pro":
        return "bg-blue-100 text-blue-800";
      case "power":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge
      variant="secondary"
      className={`${getPlanColor(requiredPlan)} ${className}`}
      title={getUpgradeMessage(featureId)}
    >
      <Lock className="w-3 h-3 mr-1" />
      {requiredPlan.toUpperCase()}
    </Badge>
  );
}

interface UpgradePromptProps {
  featureId: string;
  planTier: PlanTier;
  title?: string;
  description?: string;
  className?: string;
}

export function UpgradePrompt({
  featureId,
  planTier,
  title = "Unlock This Feature",
  description,
  className = "",
}: UpgradePromptProps) {
  const { canAccess, getUpgradeMessage } = usePlanFeatures({ planTier });
  
  if (canAccess(featureId)) {
    return null; // Don't show prompt if user has access
  }

  return (
    <Card className={`border-dashed border-2 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">
          {description || getUpgradeMessage(featureId)}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/pricing">
            <Button size="sm" className="w-full sm:w-auto">
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface StickyUpgradeCTAProps {
  featureId: string;
  planTier: PlanTier;
  message?: string;
  buttonText?: string;
  className?: string;
}

export function StickyUpgradeCTA({
  featureId,
  planTier,
  message,
  buttonText = "Upgrade Now",
  className = "",
}: StickyUpgradeCTAProps) {
  const { canAccess, getUpgradeMessage } = usePlanFeatures({ planTier });
  
  if (canAccess(featureId)) {
    return null; // Don't show CTA if user has access
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {message || getUpgradeMessage(featureId)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Not Now
            </Button>
            <Link to="/pricing">
              <Button size="sm">
                {buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}