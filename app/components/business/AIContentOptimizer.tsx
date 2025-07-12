import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Loader2, Brain, CheckCircle, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface AIContentOptimizerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface ContentRecommendation {
  category: string;
  priority: "High" | "Medium" | "Low";
  issue: string;
  solution: string;
  impact: string;
}

interface ContentOptimization {
  overallScore: number;
  recommendations: ContentRecommendation[];
  keywordOpportunities: string[];
  contentGaps: string[];
  competitiveAdvantages: string[];
}

export function AIContentOptimizer({ businessId, planTier }: AIContentOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimization, setOptimization] = useState<ContentOptimization | null>(null);
  
  const generateOptimization = useMutation(api.aiContent.generateContentOptimization);

  const handleAnalyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateOptimization({
        businessId
      });
      
      if (result.success) {
        setOptimization(result.optimization);
        toast.success(`Content analysis complete using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze content");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Medium":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <FeatureGate
      featureId="aiContentOptimization"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Content Optimization
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Get AI-powered recommendations to optimize your business content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 text-center">
              <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                AI Content Optimization
              </h3>
              <p className="text-purple-700 mb-4">
                Unlock intelligent content analysis and optimization recommendations
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
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
            <Brain className="h-5 w-5 text-purple-500" />
            AI Content Optimization
            <Badge variant="secondary">Power Feature</Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your business content with actionable optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Button */}
          {!optimization && (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Optimize Your Content?</h3>
              <p className="text-muted-foreground mb-6">
                Our AI will analyze your business profile, services, and content to provide personalized optimization recommendations.
              </p>
              <Button 
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing}
                size="lg"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Brain className="h-5 w-5 mr-2" />
                )}
                {isAnalyzing ? "Analyzing Content..." : "Analyze Content"}
              </Button>
            </div>
          )}

          {/* Optimization Results */}
          {optimization && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      <span className={getScoreColor(optimization.overallScore)}>
                        {optimization.overallScore}/100
                      </span>
                    </div>
                    <div className="text-lg font-medium text-purple-800 mb-2">
                      Content Optimization Score
                    </div>
                    <Progress 
                      value={optimization.overallScore} 
                      className="w-full max-w-sm mx-auto h-3"
                    />
                    <p className="text-sm text-purple-700 mt-2">
                      {optimization.overallScore >= 90 ? "Excellent content quality!" :
                       optimization.overallScore >= 75 ? "Good content with room for improvement" :
                       optimization.overallScore >= 60 ? "Content needs optimization" :
                       "Content requires significant improvement"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {optimization.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
                  <div className="space-y-3">
                    {optimization.recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(rec.priority)}
                              <span className="font-medium">{rec.category}</span>
                            </div>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority} Priority
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-red-700">Issue: </span>
                              {rec.issue}
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">Solution: </span>
                              {rec.solution}
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Impact: </span>
                              {rec.impact}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Opportunities */}
              {optimization.keywordOpportunities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Keyword Opportunities</h3>
                  <div className="flex flex-wrap gap-2">
                    {optimization.keywordOpportunities.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These keywords could help improve your local search visibility when incorporated naturally into your content.
                  </p>
                </div>
              )}

              {/* Content Gaps */}
              {optimization.contentGaps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Content Gaps</h3>
                  <div className="grid gap-2">
                    {optimization.contentGaps.map((gap, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-800">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive Advantages */}
              {optimization.competitiveAdvantages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Competitive Advantages to Highlight</h3>
                  <div className="grid gap-2">
                    {optimization.competitiveAdvantages.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-800">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleAnalyzeContent}
                  variant="outline" 
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Re-analyze Content
                </Button>
                <Button className="flex-1">
                  Apply Recommendations
                </Button>
              </div>
            </div>
          )}

          {/* Feature Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-indigo-800 mb-1">AI Content Analysis</div>
                <div className="text-indigo-700 space-y-1">
                  <div>• Comprehensive content quality scoring</div>
                  <div>• Actionable optimization recommendations</div>
                  <div>• Keyword opportunity identification</div>
                  <div>• Competitive advantage highlighting</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>
  );
}