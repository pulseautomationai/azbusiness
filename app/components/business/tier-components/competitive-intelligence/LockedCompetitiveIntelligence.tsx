import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { Crown, BarChart3 } from "lucide-react";

export function LockedCompetitiveIntelligence() {
  return (
    <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg relative">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-ocotillo-red rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Competitive Intelligence
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Get AI-powered business insights including competitive advantages, market positioning, and strategic recommendations.
          </p>
          <Button asChild size="sm" className="bg-ocotillo-red hover:bg-ocotillo-red/90 text-white">
            <Link to="/pricing">
              Upgrade to Power
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Blurred content behind overlay */}
      <div className="opacity-30 blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-ocotillo-red rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Competitive Intelligence
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-ironwood-charcoal mb-2">Business Profile</h4>
            <div className="space-y-1">
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-ironwood-charcoal mb-2">Competitive Advantages</h4>
            <div className="space-y-1">
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}