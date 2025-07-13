import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface AIPricingSuggestionsProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface PricingOption {
  tier: string;
  price: string;
  description: string;
}

interface MarketInsights {
  averageMarketPrice: string;
  recommendedPosition: string;
  pricingStrategy: string;
}

interface PricingSuggestion {
  serviceType: string;
  pricingOptions: PricingOption[];
  marketInsights: MarketInsights;
}

export function AIPricingSuggestions({ businessId, planTier }: AIPricingSuggestionsProps) {
  const [serviceType, setServiceType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pricingSuggestion, setPricingSuggestion] = useState<PricingSuggestion | null>(null);
  
  const generatePricing = useMutation(api.aiContent.generatePricingSuggestions);

  const handleGeneratePricing = async () => {
    if (!serviceType.trim()) {
      toast.error("Please enter a service type");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePricing({
        businessId,
        serviceType: serviceType.trim()
      });
      
      if (result.success) {
        setPricingSuggestion(result.pricing);
        toast.success(`Generated pricing suggestions using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate pricing");
    } finally {
      setIsGenerating(false);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case "budget":
        return "bg-green-100 text-green-800 border-green-200";
      case "competitive":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <FeatureGate
      featureId="aiPricingSuggestions"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              AI Pricing Intelligence
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Get AI-powered pricing suggestions based on local market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                AI Pricing Intelligence
              </h3>
              <p className="text-green-700 mb-4">
                Optimize your pricing strategy with AI-powered market analysis and competitive intelligence
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Upgrade to Power Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            AI Pricing Intelligence
            <Badge variant="secondary">Power Feature</Badge>
          </CardTitle>
          <CardDescription>
            Get intelligent pricing suggestions based on Arizona market data and your business positioning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Type</label>
            <div className="flex gap-2">
              <Input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g., HVAC Installation, Legal Consultation, Home Cleaning..."
                onKeyPress={(e) => e.key === "Enter" && handleGeneratePricing()}
              />
              <Button 
                onClick={handleGeneratePricing}
                disabled={isGenerating || !serviceType.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Pricing Suggestions Display */}
          {pricingSuggestion && (
            <div className="space-y-6">
              {/* Market Insights */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Market Insights for {pricingSuggestion.serviceType}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-green-600 font-medium mb-1">Market Average</div>
                      <div className="text-lg font-semibold text-green-800">
                        {pricingSuggestion.marketInsights.averageMarketPrice}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-green-600 font-medium mb-1">Recommended Position</div>
                      <Badge className={getPositionColor(pricingSuggestion.marketInsights.recommendedPosition)}>
                        {pricingSuggestion.marketInsights.recommendedPosition}
                      </Badge>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200 md:col-span-1">
                      <div className="text-xs text-green-600 font-medium mb-1">Strategy</div>
                      <div className="text-sm text-green-800">
                        {pricingSuggestion.marketInsights.pricingStrategy}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Recommended Pricing Tiers</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {pricingSuggestion.pricingOptions.map((option, index) => (
                    <Card 
                      key={index} 
                      className={`${
                        option.tier === "Standard" 
                          ? "border-blue-300 bg-blue-50" 
                          : "border-gray-200"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{option.tier}</CardTitle>
                          {option.tier === "Standard" && (
                            <Badge variant="secondary">Recommended</Badge>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {option.price}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  Generate Another Service
                </Button>
                <Button className="flex-1">
                  Apply to Business Profile
                </Button>
              </div>
            </div>
          )}

          {/* Example Services */}
          {!pricingSuggestion && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Example Services</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "HVAC Repair",
                  "Legal Consultation", 
                  "Home Cleaning",
                  "Landscaping",
                  "Plumbing Service",
                  "Web Design"
                ].map((example) => (
                  <Button
                    key={example}
                    variant="ghost"
                    size="sm"
                    onClick={() => setServiceType(example)}
                    className="h-8 text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Feature Info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-emerald-800 mb-1">AI Pricing Features</div>
                <div className="text-emerald-700 space-y-1">
                  <div>• Market-based pricing analysis for Arizona</div>
                  <div>• Competitive positioning recommendations</div>
                  <div>• Three-tier pricing structure suggestions</div>
                  <div>• Industry-specific pricing insights</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>
  );
}