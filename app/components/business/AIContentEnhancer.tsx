import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Loader2, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface AIContentEnhancerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
  currentSummary?: string;
}

const TONE_OPTIONS = {
  professional: {
    label: "Professional",
    description: "Authoritative and expert tone"
  },
  friendly: {
    label: "Friendly", 
    description: "Warm and approachable tone"
  },
  confident: {
    label: "Confident",
    description: "Bold and assertive tone"
  },
  local: {
    label: "Local Community",
    description: "Community-focused and neighborly"
  },
  premium: {
    label: "Premium",
    description: "Luxury and high-end positioning"
  }
} as const;

type ToneType = keyof typeof TONE_OPTIONS;

export function AIContentEnhancer({ businessId, planTier, currentSummary }: AIContentEnhancerProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  
  const generateSummary = useMutation(api.aiContent.generateBusinessSummary);

  const handleGenerateSummary = async (regenerate = false) => {
    setIsGenerating(true);
    try {
      const result = await generateSummary({
        businessId,
        tone: selectedTone,
        regenerate
      });
      
      if (result.success) {
        setGeneratedSummary(result.summary);
        if (result.cached) {
          toast.success("Loaded existing AI summary");
        } else {
          toast.success(`Generated new ${selectedTone} summary using ${result.tokensUsed} tokens`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSummary);
      setIsCopied(true);
      toast.success("Summary copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <FeatureGate
      featureId="aiContentGeneration"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Content Enhancement
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Generate compelling business summaries with AI-powered tone controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                AI Content Generation
              </h3>
              <p className="text-yellow-700 mb-4">
                Unlock AI-powered business summaries, service descriptions, and content optimization with Power tier
              </p>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
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
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Business Summary Generator
            <Badge variant="secondary">Power Feature</Badge>
          </CardTitle>
          <CardDescription>
            Generate compelling business summaries with different tone options using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Tone</label>
            <Select value={selectedTone} onValueChange={(value: ToneType) => setSelectedTone(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose tone style" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TONE_OPTIONS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Summary Preview */}
          {currentSummary && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Summary</label>
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                {currentSummary}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button 
              onClick={() => handleGenerateSummary(false)}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate AI Summary"}
            </Button>
            
            {generatedSummary && (
              <Button 
                onClick={() => handleGenerateSummary(true)}
                disabled={isGenerating}
                variant="outline"
                size="icon"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Generated Summary Display */}
          {generatedSummary && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Generated Summary ({selectedTone})</label>
                <Button
                  onClick={copyToClipboard}
                  variant="ghost" 
                  size="sm"
                  className="h-8"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Textarea
                value={generatedSummary}
                onChange={(e) => setGeneratedSummary(e.target.value)}
                className="min-h-[120px]"
                placeholder="Generated summary will appear here..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button size="sm">
                  Save Summary
                </Button>
              </div>
            </div>
          )}

          {/* Usage Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-800 mb-1">AI Content Features</div>
                <div className="text-blue-700 space-y-1">
                  <div>• Generate summaries with 5 different tone options</div>
                  <div>• Customize and edit AI-generated content</div>
                  <div>• Automatic optimization for local Arizona market</div>
                  <div>• Enhanced with your business reviews and ratings</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>
  );
}