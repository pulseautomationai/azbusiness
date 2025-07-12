import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Loader2, 
  MapPin, 
  Star,
  FileText,
  Building,
  Code,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface LocalSEOOptimizerProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface GMBOptimization {
  recommendation: string;
  priority: "High" | "Medium" | "Low";
  implementation: string;
  impact: string;
}

interface LocalKeyword {
  keyword: string;
  searchVolume: "High" | "Medium" | "Low";
  competition: "High" | "Medium" | "Low";
  usage: string;
}

interface CitationOpportunity {
  platform: string;
  importance: "High" | "Medium" | "Low";
  instructions: string;
}

interface ContentSuggestion {
  contentType: string;
  topic: string;
  keywords: string[];
  purpose: string;
}

interface SchemaMarkup {
  type: string;
  benefit: string;
  implementation: string;
}

interface LocalSEOData {
  gmbOptimization: GMBOptimization[];
  localKeywords: LocalKeyword[];
  citationOpportunities: CitationOpportunity[];
  contentSuggestions: ContentSuggestion[];
  schemaMarkup: SchemaMarkup[];
}

export function LocalSEOOptimizer({ businessId, planTier }: LocalSEOOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationData, setOptimizationData] = useState<LocalSEOData | null>(null);
  const [activeTab, setActiveTab] = useState("gmb");
  
  const generateLocalSEO = useMutation(api.seoAudit.generateLocalSEORecommendations);

  const handleGenerateOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await generateLocalSEO({
        businessId
      });
      
      if (result.success) {
        setOptimizationData(result.recommendations);
        toast.success(`Local SEO recommendations generated using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate local SEO recommendations");
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Medium":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
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

  return (
    <FeatureGate
      featureId="localSeoOptimization"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Local SEO Optimization
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Optimize your business for local Arizona search results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
              <MapPin className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Local SEO Optimization
              </h3>
              <p className="text-green-700 mb-4">
                Dominate local Arizona search results with targeted optimization strategies
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
        {/* Main Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Local SEO Optimization
              <Badge variant="secondary">Power Feature</Badge>
            </CardTitle>
            <CardDescription>
              Get comprehensive local SEO recommendations tailored for Arizona businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!optimizationData ? (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Optimize Your Local SEO?</h3>
                <p className="text-muted-foreground mb-6">
                  Get personalized recommendations for Google My Business, local keywords, citations, and more.
                </p>
                <Button 
                  onClick={handleGenerateOptimization}
                  disabled={isOptimizing}
                  size="lg"
                >
                  {isOptimizing ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <MapPin className="h-5 w-5 mr-2" />
                  )}
                  {isOptimizing ? "Generating Recommendations..." : "Generate Local SEO Plan"}
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button 
                  onClick={handleGenerateOptimization}
                  disabled={isOptimizing}
                  variant="outline"
                >
                  {isOptimizing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  Refresh Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optimization Results */}
        {optimizationData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="gmb">Google My Business</TabsTrigger>
              <TabsTrigger value="keywords">Local Keywords</TabsTrigger>
              <TabsTrigger value="citations">Citations</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
            </TabsList>

            {/* GMB Optimization Tab */}
            <TabsContent value="gmb" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Google My Business Optimization
                  </CardTitle>
                  <CardDescription>
                    Maximize your Google My Business profile for local search visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationData.gmbOptimization.map((item, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{item.recommendation}</h3>
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(item.priority)}
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority} Priority
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-700">How to implement:</span>
                              <p className="text-blue-600 mt-1">{item.implementation}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Expected impact:</span>
                              <p className="text-green-600 mt-1">{item.impact}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Local Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Local Keyword Opportunities
                  </CardTitle>
                  <CardDescription>
                    Target these Arizona-specific keywords to improve local search rankings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {optimizationData.localKeywords.map((keyword, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{keyword.keyword}</h3>
                            <div className="flex gap-2">
                              <Badge className={getVolumeColor(keyword.searchVolume)}>
                                {keyword.searchVolume} Volume
                              </Badge>
                              <Badge className={getVolumeColor(keyword.competition)}>
                                {keyword.competition} Competition
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium text-purple-700">How to use:</span>
                            <p className="text-purple-600 mt-1">{keyword.usage}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Citations Tab */}
            <TabsContent value="citations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Citation Opportunities
                  </CardTitle>
                  <CardDescription>
                    Build local authority by getting listed on these Arizona business directories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationData.citationOpportunities.map((citation, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              {citation.platform}
                            </h3>
                            <Badge className={getPriorityColor(citation.importance)}>
                              {citation.importance} Impact
                            </Badge>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium text-indigo-700">Getting listed:</span>
                            <p className="text-indigo-600 mt-1">{citation.instructions}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Local Content Suggestions
                  </CardTitle>
                  <CardDescription>
                    Create content that resonates with your local Arizona audience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationData.contentSuggestions.map((content, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{content.topic}</h3>
                            <Badge variant="outline">{content.contentType}</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Target Keywords:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {content.keywords.map((keyword, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">SEO Purpose:</span>
                              <p className="text-green-600 mt-1">{content.purpose}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schema Markup Tab */}
            <TabsContent value="schema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Schema Markup Recommendations
                  </CardTitle>
                  <CardDescription>
                    Help search engines understand your business with structured data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationData.schemaMarkup.map((schema, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            {schema.type}
                          </h3>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-700">SEO Benefit:</span>
                              <p className="text-blue-600 mt-1">{schema.benefit}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Implementation:</span>
                              <p className="text-gray-600 mt-1">{schema.implementation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Help Section */}
        {!optimizationData && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-emerald-800 mb-1">Local SEO Benefits</div>
                  <div className="text-emerald-700 space-y-1">
                    <div>• Improve visibility in "near me" searches</div>
                    <div>• Optimize Google My Business profile</div>
                    <div>• Build local citations and authority</div>
                    <div>• Target Arizona-specific keywords</div>
                    <div>• Create location-based content strategies</div>
                    <div>• Implement local business schema markup</div>
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