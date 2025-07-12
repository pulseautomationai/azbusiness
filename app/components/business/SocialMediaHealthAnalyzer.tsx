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
  Share2, 
  TrendingUp,
  Users,
  Hash,
  MapPin,
  Settings,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface SocialMediaHealthAnalyzerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface PlatformScore {
  score: number;
  status: "Active" | "Inactive" | "Needs Improvement";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ContentRecommendation {
  category: string;
  priority: "High" | "Medium" | "Low";
  action: string;
  expectedImpact: string;
}

interface SocialOpportunity {
  opportunity: string;
  platform: string;
  strategy: string;
  timeline: string;
}

interface SocialHealthData {
  overallHealthScore: number;
  platformScores: Record<string, PlatformScore>;
  contentStrategy: {
    postingFrequency: string;
    contentQuality: string;
    engagementRate: string;
    brandConsistency: string;
    recommendations: ContentRecommendation[];
  };
  competitiveAnalysis: {
    industryBenchmarks: {
      averagePostsPerWeek: number;
      averageEngagementRate: string;
      topPerformingContentTypes: string[];
    };
    opportunities: SocialOpportunity[];
  };
  localOptimization: {
    geotagging: string;
    localHashtags: string[];
    communityEngagement: string;
    recommendations: string[];
  };
  technicalOptimization: {
    profileCompleteness: number;
    linkOptimization: string;
    seoIntegration: string;
    recommendations: string[];
  };
}

export function SocialMediaHealthAnalyzer({ businessId, planTier }: SocialMediaHealthAnalyzerProps) {
  const [socialProfiles, setSocialProfiles] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    yelp: "",
    website: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthData, setHealthData] = useState<SocialHealthData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const generateHealth = useMutation(api.seoAudit.generateSocialMediaHealth);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateHealth({
        businessId,
        socialProfiles: Object.fromEntries(
          Object.entries(socialProfiles).filter(([_, url]) => url.trim())
        )
      });
      
      if (result.success) {
        setHealthData(result.socialHealth);
        toast.success(`Social media health analysis complete using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze social media health");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Needs Improvement":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
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

  const platformIcons: Record<string, string> = {
    facebook: "📘",
    instagram: "📷",
    linkedin: "💼",
    twitter: "🐦",
    yelp: "⭐",
    website: "🌐",
  };

  return (
    <FeatureGate
      featureId="socialMediaHealth"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-pink-500" />
              Social Media Health Analysis
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Analyze and optimize your social media presence across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 text-center">
              <Share2 className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-pink-800 mb-2">
                Social Media Health Analysis
              </h3>
              <p className="text-pink-700 mb-4">
                Get comprehensive analysis and optimization recommendations for all your social platforms
              </p>
              <Button className="bg-pink-600 hover:bg-pink-700">
                Upgrade to Power Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Social Profiles Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-pink-500" />
              Social Media Health Analysis
              <Badge variant="secondary">Power Feature</Badge>
            </CardTitle>
            <CardDescription>
              Analyze your social media presence and get optimization recommendations for Arizona local business success
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Profile Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(socialProfiles).map(([platform, url]) => (
                <div key={platform} className="space-y-2">
                  <label className="text-sm font-medium capitalize flex items-center gap-2">
                    <span>{platformIcons[platform]}</span>
                    {platform}
                  </label>
                  <Input
                    value={url}
                    onChange={(e) => setSocialProfiles({
                      ...socialProfiles,
                      [platform]: e.target.value
                    })}
                    placeholder={`Enter ${platform} URL...`}
                  />
                </div>
              ))}
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Share2 className="h-5 w-5 mr-2" />
              )}
              {isAnalyzing ? "Analyzing Social Media Health..." : "Analyze Social Media Health"}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {healthData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="content">Content Strategy</TabsTrigger>
              <TabsTrigger value="local">Local Optimization</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Overall Score */}
              <Card className={getScoreBackground(healthData.overallHealthScore)}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      <span className={getScoreColor(healthData.overallHealthScore)}>
                        {healthData.overallHealthScore}
                      </span>
                    </div>
                    <div className="text-lg font-medium mb-2">Social Media Health Score</div>
                    <Progress 
                      value={healthData.overallHealthScore} 
                      className="w-full max-w-sm mx-auto h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Platform Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(healthData.platformScores).map(([platform, data]) => (
                  <Card key={platform}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{platformIcons[platform]}</span>
                          <span className="font-medium capitalize">{platform}</span>
                        </div>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                          {data.score}/100
                        </div>
                        <Badge variant="outline" className="mt-1">{data.status}</Badge>
                      </div>
                      <Progress value={data.score} className="mt-2 h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Industry Benchmarks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Industry Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {healthData.competitiveAnalysis.industryBenchmarks.averagePostsPerWeek}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts per Week</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {healthData.competitiveAnalysis.industryBenchmarks.averageEngagementRate}
                      </div>
                      <div className="text-sm text-muted-foreground">Engagement Rate</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm font-medium mb-1">Top Content Types</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {healthData.competitiveAnalysis.industryBenchmarks.topPerformingContentTypes.map((type, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="space-y-4">
              <div className="space-y-4">
                {Object.entries(healthData.platformScores).map(([platform, data]) => (
                  <Card key={platform}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{platformIcons[platform]}</span>
                          <span className="capitalize">{platform}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                            {data.score}/100
                          </div>
                          <Badge variant="outline">{data.status}</Badge>
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
                          {data.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {data.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-sm text-red-600">• {weakness}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {data.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-blue-600">• {rec}</li>
                          ))}
                        </ul>
                      </div>

                      <Progress value={data.score} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Content Strategy Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Strategy Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Posting Frequency</h4>
                      <p className="text-sm text-muted-foreground">{healthData.contentStrategy.postingFrequency}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Content Quality</h4>
                      <p className="text-sm text-muted-foreground">{healthData.contentStrategy.contentQuality}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Engagement Rate</h4>
                      <p className="text-sm text-muted-foreground">{healthData.contentStrategy.engagementRate}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Brand Consistency</h4>
                      <p className="text-sm text-muted-foreground">{healthData.contentStrategy.brandConsistency}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Content Strategy Recommendations</h4>
                    {healthData.contentStrategy.recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rec.category}</span>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority} Priority
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div><span className="font-medium">Action:</span> {rec.action}</div>
                            <div><span className="font-medium">Expected Impact:</span> {rec.expectedImpact}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthData.competitiveAnalysis.opportunities.map((opp, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">{opp.opportunity}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div><span className="font-medium">Platform:</span> {opp.platform}</div>
                            <div><span className="font-medium">Timeline:</span> {opp.timeline}</div>
                            <div className="md:col-span-3"><span className="font-medium">Strategy:</span> {opp.strategy}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Local Optimization Tab */}
            <TabsContent value="local" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Arizona Local Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Geotagging Analysis</h4>
                      <p className="text-sm text-muted-foreground">{healthData.localOptimization.geotagging}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Community Engagement</h4>
                      <p className="text-sm text-muted-foreground">{healthData.localOptimization.communityEngagement}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Recommended Local Hashtags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {healthData.localOptimization.localHashtags.map((hashtag, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Local Optimization Recommendations</h4>
                    <ul className="space-y-1">
                      {healthData.localOptimization.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Technical Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Profile Completeness</span>
                      <span className={`text-lg font-bold ${getScoreColor(healthData.technicalOptimization.profileCompleteness)}`}>
                        {healthData.technicalOptimization.profileCompleteness}%
                      </span>
                    </div>
                    <Progress value={healthData.technicalOptimization.profileCompleteness} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">Link Optimization</h4>
                      <p className="text-sm text-muted-foreground">{healthData.technicalOptimization.linkOptimization}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">SEO Integration</h4>
                      <p className="text-sm text-muted-foreground">{healthData.technicalOptimization.seoIntegration}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Technical Recommendations</h4>
                    <ul className="space-y-1">
                      {healthData.technicalOptimization.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Help Section */}
        {!healthData && (
          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-rose-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-rose-800 mb-1">Social Media Health Benefits</div>
                  <div className="text-rose-700 space-y-1">
                    <div>• Comprehensive multi-platform analysis</div>
                    <div>• Industry benchmark comparisons</div>
                    <div>• Local Arizona market optimization</div>
                    <div>• Content strategy recommendations</div>
                    <div>• Technical optimization guidance</div>
                    <div>• Competitive opportunity identification</div>
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