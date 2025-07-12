import { Shield, Award, Clock, Users, Star, Crown, MapPin, Phone, Globe, Zap, MessageSquare, Flag } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { FeatureGate } from "~/components/FeatureGate";
import { BadgeCalculator } from "~/utils/badge-calculator";
import type { PlanTier } from "~/config/features";

interface BusinessBadgesProps {
  business: {
    planTier: string;
    rating: number;
    reviewCount: number;
    phone: string;
    website?: string;
    verified?: boolean;
    isLocal?: boolean;
    fastResponse?: boolean;
    experienceYears?: number;
  };
  className?: string;
}

export function BusinessBadges({ business, className }: BusinessBadgesProps) {
  // Calculate badges using the new badge calculator
  const availableBadges = BadgeCalculator.getBadgesForPlan(business);
  const allPossibleBadges = BadgeCalculator.calculateBadges(business);
  const upgradeSuggestions = BadgeCalculator.getUpgradeSuggestions(business);

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      shield: Shield,
      star: Star,
      award: Award,
      clock: Clock,
      users: Users,
      crown: Crown,
      'map-pin': MapPin,
      phone: Phone,
      globe: Globe,
      zap: Zap,
      'message-square': MessageSquare,
      flag: Flag
    };
    return icons[iconName] || Award;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-medium text-sm">Business Badges</h4>
      
      <div className="flex flex-wrap gap-2">
        {availableBadges.map((badge) => {
          const IconComponent = getIcon(badge.icon);
          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`${badge.color} hover:scale-105 transition-transform cursor-help`}
                  >
                    <IconComponent className="h-3 w-3 mr-1" />
                    {badge.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center max-w-48">
                    <p className="text-sm font-medium mb-1">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        
        {/* Show locked badges for Free tier users */}
        {business.planTier === "free" && upgradeSuggestions.length > 0 && (
          upgradeSuggestions.slice(0, 2).map((suggestion) => {
            const IconComponent = getIcon(suggestion.badge.icon);
            return (
              <TooltipProvider key={suggestion.badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="opacity-40 cursor-help"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {suggestion.badge.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center max-w-48">
                      <p className="text-sm font-medium mb-1">Badge Locked</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.suggestion}
                      </p>
                      <Button size="sm" className="text-xs">
                        Upgrade to {suggestion.badge.tier === "pro" ? "Pro" : "Power"}
                      </Button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        )}
      </div>

      {/* No badges message for Free tier */}
      <FeatureGate
        featureId="badges"
        planTier={business.planTier as PlanTier}
        fallback={
          availableBadges.length === 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No badges available yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Build your reputation to earn badges
                  </p>
                  <Button size="sm" variant="outline" className="text-xs">
                    Learn About Badges
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        }
      >
        {availableBadges.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Keep providing excellent service to earn more badges!
          </p>
        )}
      </FeatureGate>
    </div>
  );
}