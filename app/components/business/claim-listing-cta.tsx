import { Crown, X, Shield, Star, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface ClaimListingCTAProps {
  business: {
    _id: string;
    name: string;
    planTier: string;
    claimed?: boolean;
  };
  className?: string;
}

export function ClaimListingCTA({ business, className }: ClaimListingCTAProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already claimed or not a free tier
  if (business.claimed || business.planTier !== "free" || isDismissed) {
    return null;
  }

  const benefits = [
    "Respond to customer messages",
    "Update business information",
    "Add photos and descriptions",
    "View analytics and insights",
    "Manage reviews and ratings"
  ];

  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <span className="font-medium text-sm">Claim Listing</span>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setIsMinimized(false)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl rounded-t-lg rounded-b-none">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Is this your business?</h3>
                <p className="text-white/90 text-sm">
                  Claim <strong>{business.name}</strong> to start managing your listing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowRight className="h-4 w-4 rotate-90" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsDismissed(true)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                What you'll get:
              </h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3 text-green-300" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Star className="h-3 w-3 mr-1" />
                    Free to claim
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified only
                  </Badge>
                </div>
                <p className="text-white/90 text-xs">
                  Verification required to prevent fraud
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  size="lg" 
                  className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Claim This Listing - Free
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="w-full text-white/80 hover:text-white hover:bg-white/10"
                >
                  Learn More About Business Listings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}