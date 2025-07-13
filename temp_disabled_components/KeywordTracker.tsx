import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  Loader2, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  Calendar,
  BarChart3,
  MapPin,
  Clock,
  Star,
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface KeywordTrackerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface KeywordPerformance {
  keyword: string;
  currentRanking: number;
  searchVolume: "High" | "Medium" | "Low";
  competition: "High" | "Medium" | "Low";
  difficulty: number;
  opportunity: "High" | "Medium" | "Low";
  trend: "Rising" | "Stable" | "Declining";
  localIntent: boolean;
}

interface OptimizationRecommendation {
  action: string;
  priority: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  expectedImpact: string;
  timeframe: string;
}

interface OptimizationSuggestion {
  keyword: string;
  currentIssues: string[];
  recommendations: OptimizationRecommendation[];
}

interface ContentGap {
  topic: string;
  targetKeywords: string[];
  contentType: string;
  priority: "High" | "Medium" | "Low";
  rationale: string;
}

interface KeywordTrackingData {
  keywordPerformance: KeywordPerformance[];
  optimizationSuggestions: OptimizationSuggestion[];
  contentGaps: ContentGap[];
  seasonalOpportunities: any[];
  localSeoKeywords: any[];
}

export function KeywordTracker({ businessId, planTier }: KeywordTrackerProps) {
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<KeywordTrackingData | null>(null);
  const [activeTab, setActiveTab] = useState("performance");
  const [calendarTimeframe, setCalendarTimeframe] = useState<"month" | "quarter" | "year">("month");
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
  const [contentCalendar, setContentCalendar] = useState<any>(null);
  
  const generateTracking = useMutation(api.seoAudit.generateKeywordTracking);
  const generateCalendar = useMutation(api.seoAudit.generateKeywordContentCalendar);

  const addKeyword = () => {
    if (newKeyword.trim() && !targetKeywords.includes(newKeyword.trim())) {
      setTargetKeywords([...targetKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setTargetKeywords(targetKeywords.filter(k => k !== keyword));
  };

  const handleGenerateTracking = async () => {
    setIsTracking(true);
    try {
      const result = await generateTracking({
        businessId,
        targetKeywords: targetKeywords.length > 0 ? targetKeywords : undefined
      });
      
      if (result.success) {
        setTrackingData(result.keywordTracking);
        toast.success(`Keyword tracking analysis complete using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate keyword tracking");
    } finally {
      setIsTracking(false);
    }
  };

  const handleGenerateCalendar = async () => {
    setIsGeneratingCalendar(true);
    try {
      const result = await generateCalendar({
        businessId,
        timeframe: calendarTimeframe
      });
      
      if (result.success) {
        setContentCalendar(result.contentCalendar);
        toast.success(`Content calendar generated using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate content calendar");
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Rising":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "Declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case "High":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "High":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRankingColor = (ranking: number) => {
    if (ranking <= 3) return "text-green-600";
    if (ranking <= 10) return "text-blue-600";
    if (ranking <= 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <FeatureGate
      featureId="keywordTracking"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Keyword Tracking & Optimization
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Track keyword performance and get AI-powered optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Keyword Tracking & Optimization
              </h3>
              <p className="text-blue-700 mb-4">
                Monitor keyword rankings, track performance trends, and get optimization strategies
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upgrade to Power Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Keyword Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Keyword Tracking & Optimization
              <Badge variant="secondary">Power Feature</Badge>
            </CardTitle>
            <CardDescription>
              Monitor keyword performance and get AI-powered optimization strategies for Arizona local search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Keywords</label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword to track..."
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  className="flex-1"
                />
                <Button onClick={addKeyword} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected Keywords */}
            {targetKeywords.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Keywords ({targetKeywords.length})</label>
                <div className="flex flex-wrap gap-2">
                  {targetKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateTracking}
              disabled={isTracking}
              className="w-full"
              size="lg"
            >
              {isTracking ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              {isTracking ? "Analyzing Keywords..." : "Generate Keyword Analysis"}
            </Button>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="content">Content Gaps</TabsTrigger>
              <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
            </TabsList>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4">
                {trackingData.keywordPerformance.map((keyword, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{keyword.keyword}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {keyword.localIntent && (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                Local
                              </Badge>
                            )}
                            {getTrendIcon(keyword.trend)}
                            <span className="text-xs text-muted-foreground">{keyword.trend}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getRankingColor(keyword.currentRanking)}`}>
                            #{keyword.currentRanking}
                          </div>
                          <div className="text-xs text-muted-foreground">Current Rank</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Search Volume</div>
                          <Badge className={getVolumeColor(keyword.searchVolume)}>
                            {keyword.searchVolume}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Competition</div>
                          <Badge className={getVolumeColor(keyword.competition)}>
                            {keyword.competition}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Difficulty</div>
                          <div className="font-medium">{keyword.difficulty}/100</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Opportunity</div>
                          <Badge className={getOpportunityColor(keyword.opportunity)}>
                            {keyword.opportunity}
                          </Badge>
                        </div>
                      </div>
                      
                      <Progress value={100 - keyword.difficulty} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Optimization Tab */}
            <TabsContent value="optimization" className="space-y-4">
              <div className="space-y-4">
                {trackingData.optimizationSuggestions.map((suggestion, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{suggestion.keyword}</CardTitle>
                      {suggestion.currentIssues.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-red-700">Current Issues:</div>
                          <ul className="text-sm text-red-600 space-y-1">
                            {suggestion.currentIssues.map((issue, i) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium">Optimization Recommendations</h4>
                        {suggestion.recommendations.map((rec, i) => (
                          <div key={i} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{rec.action}</div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{rec.priority} Priority</Badge>
                                <Badge variant="secondary">{rec.effort} Effort</Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Impact:</span> {rec.expectedImpact}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {rec.timeframe}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Content Gaps Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="grid gap-4">
                {trackingData.contentGaps.map((gap, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{gap.topic}</h3>
                        <Badge className={
                          gap.priority === "High" ? "bg-red-100 text-red-800" :
                          gap.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }>
                          {gap.priority} Priority
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Content Type:</span> {gap.contentType}
                        </div>
                        <div>
                          <span className="font-medium">Target Keywords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gap.targetKeywords.map((keyword, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Rationale:</span> {gap.rationale}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Content Calendar Tab */}
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Keyword-Focused Content Calendar
                  </CardTitle>
                  <CardDescription>
                    Generate a strategic content calendar based on keyword opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <Select value={calendarTimeframe} onValueChange={(value: "month" | "quarter" | "year") => setCalendarTimeframe(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">1 Month</SelectItem>
                        <SelectItem value="quarter">3 Months</SelectItem>
                        <SelectItem value="year">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleGenerateCalendar}
                      disabled={isGeneratingCalendar}
                    >
                      {isGeneratingCalendar ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Calendar className="h-4 w-4 mr-2" />
                      )}
                      Generate Calendar
                    </Button>
                  </div>

                  {contentCalendar && (
                    <div className="space-y-4">
                      {contentCalendar.contentCalendar.map((week: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Week {week.week}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {week.contentPieces.map((content: any, i: number) => (
                                <div key={i} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{content.title}</h4>
                                    <Badge variant="outline">{content.type}</Badge>
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <div><span className="font-medium">Primary Keyword:</span> {content.primaryKeyword}</div>
                                    <div><span className="font-medium">Outline:</span> {content.contentOutline}</div>
                                    <div><span className="font-medium">CTA:</span> {content.callToAction}</div>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="secondary">{content.estimatedTraffic} Traffic</Badge>
                                      <Badge variant="outline">{content.difficulty} Difficulty</Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </FeatureGate>
  );
}