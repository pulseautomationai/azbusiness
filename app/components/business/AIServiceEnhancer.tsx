import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Loader2, Wand2, Plus, X, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface AIServiceEnhancerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
  currentServices?: string[];
}

interface EnhancedService {
  name: string;
  description: string;
  icon: string;
  pricingTier: string;
}

const TONE_OPTIONS = {
  professional: "Professional",
  friendly: "Friendly", 
  confident: "Confident",
  local: "Local Community",
  premium: "Premium"
} as const;

type ToneType = keyof typeof TONE_OPTIONS;

export function AIServiceEnhancer({ businessId, planTier, currentServices = [] }: AIServiceEnhancerProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(currentServices.slice(0, 3));
  const [customService, setCustomService] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedServices, setEnhancedServices] = useState<EnhancedService[]>([]);
  
  const enhanceServices = useMutation(api.aiContent.enhanceServiceDescriptions);
  const getPricingSuggestions = useMutation(api.aiContent.generatePricingSuggestions);

  const addCustomService = () => {
    if (customService.trim() && !selectedServices.includes(customService.trim())) {
      setSelectedServices([...selectedServices, customService.trim()]);
      setCustomService("");
    }
  };

  const removeService = (service: string) => {
    setSelectedServices(selectedServices.filter(s => s !== service));
  };

  const toggleService = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      removeService(service);
    }
  };

  const handleEnhanceServices = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service to enhance");
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhanceServices({
        businessId,
        services: selectedServices,
        tone: selectedTone
      });
      
      if (result.success) {
        setEnhancedServices(result.services);
        toast.success(`Enhanced ${result.services.length} services using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enhance services");
    } finally {
      setIsEnhancing(false);
    }
  };

  const getPricingForService = async (serviceType: string) => {
    try {
      const result = await getPricingSuggestions({
        businessId,
        serviceType
      });
      
      if (result.success) {
        toast.success("Pricing suggestions generated");
        // You could show pricing in a modal or expand the service card
        console.log("Pricing suggestions:", result.pricing);
      }
    } catch (error) {
      toast.error("Failed to get pricing suggestions");
    }
  };

  return (
    <FeatureGate
      featureId="aiServiceEnhancement"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-blue-500" />
              AI Service Enhancement
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Generate enhanced service descriptions with AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
              <Wand2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                AI Service Enhancement
              </h3>
              <p className="text-blue-700 mb-4">
                Transform basic service lists into compelling descriptions with pricing suggestions
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
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
            <Wand2 className="h-5 w-5 text-blue-500" />
            AI Service Enhancement
            <Badge variant="secondary">Power Feature</Badge>
          </CardTitle>
          <CardDescription>
            Transform your service listings into compelling descriptions with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Services Selection */}
          {currentServices.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Available Services</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={selectedServices.includes(service)}
                      onCheckedChange={(checked) => toggleService(service, checked as boolean)}
                    />
                    <label htmlFor={service} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {service}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Service */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Custom Service</label>
            <div className="flex gap-2">
              <Input
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Enter service name..."
                onKeyPress={(e) => e.key === "Enter" && addCustomService()}
              />
              <Button onClick={addCustomService} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Services ({selectedServices.length})</label>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1">
                    {service}
                    <button onClick={() => removeService(service)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enhancement Tone</label>
            <Select value={selectedTone} onValueChange={(value: ToneType) => setSelectedTone(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose tone style" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TONE_OPTIONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enhance Button */}
          <Button 
            onClick={handleEnhanceServices}
            disabled={isEnhancing || selectedServices.length === 0}
            className="w-full"
          >
            {isEnhancing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            {isEnhancing ? "Enhancing Services..." : `Enhance ${selectedServices.length} Services`}
          </Button>

          {/* Enhanced Services Display */}
          {enhancedServices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enhanced Services</label>
                <Button variant="outline" size="sm">
                  Save All Services
                </Button>
              </div>
              
              <div className="grid gap-4">
                {enhancedServices.map((service, index) => (
                  <Card key={index} className="border border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{service.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {service.pricingTier}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => getPricingForService(service.name)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={service.description}
                        onChange={(e) => {
                          const updated = [...enhancedServices];
                          updated[index].description = e.target.value;
                          setEnhancedServices(updated);
                        }}
                        className="min-h-[80px] text-sm"
                      />
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Icon: {service.icon}</span>
                        <span>Pricing: {service.pricingTier}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Feature Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Wand2 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-purple-800 mb-1">AI Service Enhancement</div>
                <div className="text-purple-700 space-y-1">
                  <div>• Generate compelling service descriptions</div>
                  <div>• Suggest appropriate pricing tiers</div>
                  <div>• Include relevant icons for visual appeal</div>
                  <div>• Optimize for local Arizona market</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>
  );
}