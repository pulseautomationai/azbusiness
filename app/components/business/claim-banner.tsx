import { Crown, ArrowRight, Shield, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface ClaimBannerProps {
  business: {
    _id: string;
    name: string;
    claimed?: boolean;
    verified?: boolean;
  };
  className?: string;
}

export function ClaimBanner({ business, className }: ClaimBannerProps) {
  // Only show for unverified businesses
  if (business.verified) {
    return null;
  }

  return (
    <Card className={cn(
      "bg-agave-cream border-gray-200 shadow-md",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-desert-marigold rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Is this your business?
              </h2>
              <p className="text-gray-700 mb-3">
                Claim <strong>{business.name}</strong> to unlock powerful tools and start managing your online presence.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-turquoise-sky" />
                  <span>Connect with customers</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-turquoise-sky" />
                  <span>Track performance</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-turquoise-sky" />
                  <span>Get verified badge</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              size="lg" 
              className="bg-ocotillo-red hover:bg-ocotillo-red/90 text-white font-semibold shadow-lg"
              asChild
            >
              <Link to={`/claim-business?businessId=${business._id}`}>
                <Crown className="h-4 w-4 mr-2" />
                Claim Your Listing - Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 hover:bg-gray-50"
            >
              Learn More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}