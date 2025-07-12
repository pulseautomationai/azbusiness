import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Loader2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  ExternalLink,
  Target,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface CompetitorSEOAnalyzerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface Competitor {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  keywordTargets: string[];
  contentStrategy: string;
  localSeoScore: number;
}

interface GapAnalysis {
  opportunity: string;
  competitorAdvantage: string;
  recommendation: string;
  priority: "High" | "Medium" | "Low";
}

interface ActionableInsight {
  insight: string;
  action: string;
  timeframe: string;
}

interface CompetitorAnalysisData {
  competitorAnalysis: Competitor[];
  gapAnalysis: GapAnalysis[];
  actionableInsights: ActionableInsight[];
}

export function CompetitorSEOAnalyzer({ businessId, planTier }: CompetitorSEOAnalyzerProps) {
  const [competitorUrls, setCompetitorUrls] = useState<string[]>([]);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<CompetitorAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState("competitors");
  
  const analyzeCompetitors = useMutation(api.seoAudit.analyzeCompetitorSEO);

  const addCompetitor = () => {
    if (newCompetitorUrl.trim() && !competitorUrls.includes(newCompetitorUrl.trim())) {
      // Simple URL validation
      const url = newCompetitorUrl.trim();
      if (url.includes('.') && (url.startsWith('http') || !url.includes('://'))) {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
        setCompetitorUrls([...competitorUrls, cleanUrl]);
        setNewCompetitorUrl("");
      } else {
        toast.error("Please enter a valid website URL");
      }
    }
  };

  const removeCompetitor = (url: string) => {
    setCompetitorUrls(competitorUrls.filter(u => u !== url));
  };

  const handleAnalyzeCompetitors = async () => {
    if (competitorUrls.length === 0) {
      toast.error("Please add at least one competitor website");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeCompetitors({
        businessId,
        competitorUrls
      });
      
      if (result.success) {
        setAnalysisData(result.analysis);
        toast.success(`Competitor analysis complete using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze competitors");
    } finally {
      setIsAnalyzing(false);
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <FeatureGate
      featureId="competitorSeoAnalysis"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Competitor SEO Analysis
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Analyze competitor SEO strategies and identify opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 text-center">
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Competitor SEO Analysis
              </h3>
              <p className="text-purple-700 mb-4">
                Discover what your competitors are doing right and find gaps to exploit
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Upgrade to Power Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Competitor Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Competitor SEO Analysis
              <Badge variant="secondary">Power Feature</Badge>
            </CardTitle>
            <CardDescription>
              Analyze competitor SEO strategies to identify opportunities and gaps in your local Arizona market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Competitors */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Competitor Websites</label>
              <div className="flex gap-2">
                <Input
                  value={newCompetitorUrl}
                  onChange={(e) => setNewCompetitorUrl(e.target.value)}
                  placeholder="Enter competitor website URL..."
                  onKeyPress={(e) => e.key === "Enter" && addCompetitor()}
                  className="flex-1"
                />
                <Button onClick={addCompetitor} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter competitor websites (e.g., competitor.com or https://competitor.com)
              </p>
            </div>

            {/* Selected Competitors */}
            {competitorUrls.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Competitors ({competitorUrls.length})</label>
                <div className="space-y-2">
                  {competitorUrls.map((url) => (
                    <div key={url} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{url}</span>
                      </div>
                      <Button 
                        onClick={() => removeCompetitor(url)} 
                        size="sm" 
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyzeCompetitors}
              disabled={isAnalyzing || competitorUrls.length === 0}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Users className="h-5 w-5 mr-2" />
              )}
              {isAnalyzing ? "Analyzing Competitors..." : `Analyze ${competitorUrls.length} Competitors`}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
              <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
              <TabsTrigger value="insights">Action Plan</TabsTrigger>
            </TabsList>

            {/* Competitors Tab */}
            <TabsContent value="competitors" className="space-y-4">
              <div className="grid gap-4">
                {analysisData.competitorAnalysis.map((competitor, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5" />
                          {competitor.competitor}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(competitor.localSeoScore)}`}>
                            {competitor.localSeoScore}/100
                          </div>
                          <div className="text-xs text-muted-foreground">Local SEO Score</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {competitor.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-1">
                          {competitor.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-sm text-red-600">• {weakness}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Target Keywords */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Target Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {competitor.keywordTargets.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Content Strategy */}
                      <div>
                        <h4 className="font-medium mb-2">Content Strategy</h4>
                        <p className="text-sm text-muted-foreground">{competitor.contentStrategy}</p>
                      </div>

                      <Progress value={competitor.localSeoScore} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Gap Analysis Tab */}
            <TabsContent value="gaps" className="space-y-4">
              <div className="space-y-4">
                {analysisData.gapAnalysis.map((gap, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{gap.opportunity}</h3>
                        <Badge className={getPriorityColor(gap.priority)}>
                          {gap.priority} Priority
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-orange-700">Competitor Advantage:</span>
                          <p className="text-orange-600 mt-1">{gap.competitorAdvantage}</p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Our Opportunity:</span>
                          <p className="text-blue-600 mt-1">{gap.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Action Plan Tab */}
            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-4">
                {analysisData.actionableInsights.map((insight, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium">{insight.insight}</h3>
                          <div className="text-sm">
                            <span className="font-medium text-green-700">Action:</span>
                            <p className="text-green-600 mt-1">{insight.action}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            Timeframe: {insight.timeframe}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Help Text */}
        {!analysisData && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-purple-800 mb-1">Competitor Analysis Benefits</div>
                  <div className="text-purple-700 space-y-1">
                    <div>• Identify SEO strategies that work in your industry</div>
                    <div>• Discover content gaps you can fill</div>
                    <div>• Find keyword opportunities competitors are missing</div>
                    <div>• Learn from competitor strengths and weaknesses</div>
                    <div>• Get actionable recommendations for improvement</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FeatureGate>
  );
}