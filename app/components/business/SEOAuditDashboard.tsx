import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Globe,
  Smartphone,
  Zap,
  MapPin,
  FileText,
  Settings,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface SEOAuditDashboardProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface SEORecommendation {
  category: "Meta Tags" | "Content" | "Technical" | "Local SEO" | "Performance" | "Mobile";
  priority: "Critical" | "High" | "Medium" | "Low";
  issue: string;
  solution: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
}

interface KeywordAnalysis {
  primaryKeywords: Array<{
    keyword: string;
    frequency: number;
    density: number;
    competition: "Low" | "Medium" | "High";
    searchVolume: "Low" | "Medium" | "High";
  }>;
  opportunities: Array<{
    keyword: string;
    reason: string;
    potential: "High" | "Medium" | "Low";
  }>;
  missingKeywords: string[];
}

interface SEOAuditResult {
  overallScore: number;
  metaScore: number;
  performanceScore: number;
  mobileScore: number;
  localSeoScore: number;
  contentScore: number;
  technicalScore: number;
  recommendations: SEORecommendation[];
  keywordAnalysis: KeywordAnalysis;
  lastAuditDate: number;
}

export function SEOAuditDashboard({ businessId, planTier }: SEOAuditDashboardProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const performAudit = useMutation(api.seoAudit.performSEOAudit);
  const generateLocalSEO = useMutation(api.seoAudit.generateLocalSEORecommendations);
  const analyzeCompetitors = useMutation(api.seoAudit.analyzeCompetitorSEO);
  const auditHistory = useQuery(api.seoAudit.getSEOAuditHistory, { businessId });

  const handlePerformAudit = async (forceRefresh = false) => {
    setIsAuditing(true);
    try {
      const result = await performAudit({
        businessId,
        websiteUrl: websiteUrl.trim() || undefined,
        forceRefresh
      });
      
      if (result.success) {
        setAuditResult(result.audit);
        if (result.cached) {
          toast.success("Loaded existing SEO audit");
        } else {
          toast.success(`SEO audit complete using ${result.tokensUsed} tokens`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to perform SEO audit");
    } finally {
      setIsAuditing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 75) return "bg-yellow-50 border-yellow-200";
    if (score >= 60) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "High":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "Medium":
        return <Target className="h-4 w-4 text-yellow-500" />;
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Meta Tags":
        return <FileText className="h-4 w-4" />;
      case "Content":
        return <FileText className="h-4 w-4" />;
      case "Technical":
        return <Settings className="h-4 w-4" />;
      case "Local SEO":
        return <MapPin className="h-4 w-4" />;
      case "Performance":
        return <Zap className="h-4 w-4" />;
      case "Mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <FeatureGate
      featureId="seoAudit"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-500" />
              SEO Audit & Analysis
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive SEO audit with actionable recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6 text-center">
              <Search className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                SEO Audit & Analysis
              </h3>
              <p className="text-green-700 mb-4">
                Get comprehensive SEO analysis with competitor insights and local optimization
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Upgrade to Power Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Audit Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-500" />
              SEO Audit Dashboard
              <Badge variant="secondary">Power Feature</Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive SEO analysis with actionable recommendations for local Arizona businesses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Website URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL (Optional)</label>
              <div className="flex gap-2">
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1"
                />
                <Button 
                  onClick={() => handlePerformAudit(false)}
                  disabled={isAuditing}
                >
                  {isAuditing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Audit History */}
            {auditHistory && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Last audit: </span>
                  {new Date(auditHistory.lastAudit).toLocaleDateString()}
                  {auditHistory.hasRecentAudit && (
                    <Badge variant="secondary" className="ml-2">Recent</Badge>
                  )}
                </div>
                <Button
                  onClick={() => handlePerformAudit(true)}
                  variant="outline"
                  size="sm"
                  disabled={isAuditing}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Results */}
        {auditResult && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Overall Score */}
              <Card className={getScoreBackground(auditResult.overallScore)}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      <span className={getScoreColor(auditResult.overallScore)}>
                        {auditResult.overallScore}
                      </span>
                    </div>
                    <div className="text-lg font-medium mb-2">Overall SEO Score</div>
                    <Progress 
                      value={auditResult.overallScore} 
                      className="w-full max-w-sm mx-auto h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Meta Tags", score: auditResult.metaScore, icon: <FileText className="h-5 w-5" /> },
                  { label: "Performance", score: auditResult.performanceScore, icon: <Zap className="h-5 w-5" /> },
                  { label: "Mobile", score: auditResult.mobileScore, icon: <Smartphone className="h-5 w-5" /> },
                  { label: "Local SEO", score: auditResult.localSeoScore, icon: <MapPin className="h-5 w-5" /> },
                  { label: "Content", score: auditResult.contentScore, icon: <FileText className="h-5 w-5" /> },
                  { label: "Technical", score: auditResult.technicalScore, icon: <Settings className="h-5 w-5" /> },
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                          {item.score}
                        </span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">SEO Recommendations</h3>
                {auditResult.recommendations.map((rec, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(rec.category)}
                          <span className="font-medium">{rec.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(rec.priority)}
                          <Badge variant="outline">{rec.priority}</Badge>
                        </div>
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
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Difficulty: {rec.difficulty}</span>
                          <span>Time: {rec.estimatedTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4">
              {/* Primary Keywords */}
              {auditResult.keywordAnalysis.primaryKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditResult.keywordAnalysis.primaryKeywords.map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{keyword.keyword}</div>
                            <div className="text-xs text-muted-foreground">
                              Density: {keyword.density}% | Frequency: {keyword.frequency}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{keyword.competition} Competition</Badge>
                            <Badge variant="outline">{keyword.searchVolume} Volume</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keyword Opportunities */}
              {auditResult.keywordAnalysis.opportunities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditResult.keywordAnalysis.opportunities.map((opp, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <div className="font-medium text-green-800">{opp.keyword}</div>
                            <div className="text-sm text-green-700">{opp.reason}</div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">{opp.potential} Potential</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Missing Keywords */}
              {auditResult.keywordAnalysis.missingKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Missing Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {auditResult.keywordAnalysis.missingKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical SEO Analysis</CardTitle>
                  <CardDescription>
                    Detailed technical performance and optimization metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Page Speed</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={auditResult.performanceScore} className="flex-1" />
                          <span className="text-sm font-medium">{auditResult.performanceScore}/100</span>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Mobile Optimization</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={auditResult.mobileScore} className="flex-1" />
                          <span className="text-sm font-medium">{auditResult.mobileScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div>• Review and implement high-priority recommendations</div>
                        <div>• Monitor keyword performance weekly</div>
                        <div>• Re-audit in 30 days to track improvements</div>
                        <div>• Focus on local SEO optimization for Arizona market</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </FeatureGate>
  );
}