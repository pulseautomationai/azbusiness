import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  ArrowRight, 
  Crown, 
  Zap, 
  Star, 
  TrendingUp,
  Shield,
  Calendar,
  BarChart3
} from "lucide-react";
import { Link } from "react-router";
import type { PlanTier } from "~/config/features";

interface UpgradeCTAProps {
  currentPlan: PlanTier;
  businessName?: string;
  className?: string;
}

export function UpgradeCTA({ currentPlan, businessName, className = "" }: UpgradeCTAProps) {
  const getUpgradeContent = () => {
    switch (currentPlan) {
      case "free":
        return {
          title: "Claim Your Business",
          subtitle: "Get started with Pro features",
          description: "Take control of your listing and start getting more customers",
          targetPlan: "pro" as PlanTier,
          price: "$29/month",
          features: [
            { icon: Shield, text: "Verified business badge" },
            { icon: TrendingUp, text: "Edit your business profile" },
            { icon: BarChart3, text: "View analytics & leads" },
            { icon: Star, text: "Respond to customer inquiries" },
          ],
          buttonText: "Claim & Upgrade",
          buttonVariant: "default" as const,
        };
      case "pro":
        return {
          title: "Unlock AI-Powered Growth",
          subtitle: "Upgrade to Power plan",
          description: "Get AI-enhanced content and advanced features to dominate your market",
          targetPlan: "power" as PlanTier,
          price: "$97/month",
          features: [
            { icon: Zap, text: "AI-generated content" },
            { icon: BarChart3, text: "Advanced analytics & insights" },
            { icon: Crown, text: "Priority placement" },
            { icon: Calendar, text: "Booking calendar integration" },
          ],
          buttonText: "Upgrade to Power",
          buttonVariant: "default" as const,
        };
      default:
        return null;
    }
  };

  const content = getUpgradeContent();
  if (!content) return null;

  return (
    <Card className={`border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {content.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {content.targetPlan.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-700">{content.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <p className="text-2xl font-bold text-gray-900">{content.price}</p>
            <p className="text-sm text-gray-600">
              {businessName ? `for ${businessName}` : "per business"}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" size="sm">
              Learn More
            </Button>
            <Link to="/pricing">
              <Button variant={content.buttonVariant} size="sm">
                {content.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ClaimBusinessCTAProps {
  businessName: string;
  className?: string;
}

export function ClaimBusinessCTA({ businessName, className = "" }: ClaimBusinessCTAProps) {
  return (
    <div className={`bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Is this your business?
          </h3>
          <p className="text-green-100 mb-4">
            Claim "{businessName}" to edit your listing, respond to customers, and get more leads.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              ✓ Edit your info
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              ✓ Add photos
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              ✓ Get customer messages
            </Badge>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link to="/claim-business">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              Claim Business
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface PowerFeatureTeaseProps {
  className?: string;
}

export function PowerFeatureTease({ className = "" }: PowerFeatureTeaseProps) {
  return (
    <Card className={`border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Power Plan Features</h3>
            <p className="text-sm text-gray-600">AI-powered business growth</p>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm">AI writes your business description</span>
          </div>
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Advanced analytics & insights</span>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Priority search placement</span>
          </div>
        </div>
        
        <Link to="/pricing">
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            Upgrade to Power
            <Crown className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}