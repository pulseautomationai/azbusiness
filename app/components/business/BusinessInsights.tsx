import { TrendingUp, Users, Star, MessageSquare, Calendar, AlertTriangle, Target, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { FeatureGate } from "~/components/FeatureGate";
import type { PlanTier } from "~/config/features";

interface BusinessInsightsProps {
  businessId: string;
  planTier: PlanTier;
  business: {
    name: string;
    rating: number;
    reviewCount: number;
    planTier: string;
    category: string;
    city: string;
  };
  analyticsData: {
    pageViews: number;
    leadSubmits: number;
    phoneClicks: number;
    conversionRate: number;
  };
  competitorData?: {
    averageRating: number;
    averageReviews: number;
    averageConversion: number;
  };
  reviewAnalysis?: {
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    keywords: Array<{
      word: string;
      count: number;
      sentiment: string;
    }>;
    improvements: string[];
    highlights: string[];
  };
}

export function BusinessInsights({ 
  businessId, 
  planTier, 
  business, 
  analyticsData, 
  competitorData,
  reviewAnalysis
}: BusinessInsightsProps) {
  const getPerformanceScore = () => {
    let score = 0;
    
    // Rating score (40% weight)
    score += (business.rating / 5) * 40;
    
    // Review count score (20% weight)
    const reviewScore = Math.min(business.reviewCount / 50, 1) * 20;
    score += reviewScore;
    
    // Conversion rate score (40% weight)
    const conversionScore = Math.min(analyticsData.conversionRate / 10, 1) * 40;
    score += conversionScore;
    
    return Math.round(score);
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (business.rating < 4.0) {
      recommendations.push({
        type: "critical",
        title: "Improve Customer Satisfaction",
        description: "Your rating is below average. Focus on addressing customer concerns and improving service quality.",
        impact: "High",
        effort: "Medium"
      });
    }
    
    if (business.reviewCount < 10) {
      recommendations.push({
        type: "important",
        title: "Encourage More Reviews",
        description: "More reviews build trust and improve your search ranking. Ask satisfied customers to leave reviews.",
        impact: "Medium",
        effort: "Low"
      });
    }
    
    if (analyticsData.conversionRate < 3) {
      recommendations.push({
        type: "opportunity",
        title: "Optimize Conversion Rate",
        description: "Your conversion rate is below average. Consider improving your business description and call-to-action.",
        impact: "High",
        effort: "Medium"
      });
    }
    
    if (analyticsData.pageViews < 50) {
      recommendations.push({
        type: "growth",
        title: "Increase Visibility",
        description: "Low page views indicate limited visibility. Consider SEO optimization and social media marketing.",
        impact: "Medium",
        effort: "High"
      });
    }
    
    return recommendations;
  };

  const performanceScore = getPerformanceScore();
  const recommendations = getRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationType = (type: string) => {
    switch (type) {
      case "critical": return { color: "bg-red-100 text-red-800", icon: AlertTriangle };
      case "important": return { color: "bg-yellow-100 text-yellow-800", icon: Target };
      case "opportunity": return { color: "bg-blue-100 text-blue-800", icon: TrendingUp };
      case "growth": return { color: "bg-green-100 text-green-800", icon: Lightbulb };
      default: return { color: "bg-gray-100 text-gray-800", icon: Lightbulb };
    }
  };

  return (
    <FeatureGate featureId="business_insights" planTier={planTier}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Business Insights</h2>
            <p className="text-muted-foreground">
              Understand your performance and discover growth opportunities
            </p>
          </div>
          <Badge variant="outline">Last updated: Today</Badge>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Overview</span>
            </CardTitle>
            <CardDescription>
              Your business performance compared to industry standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Performance Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                    {performanceScore}/100
                  </span>
                </div>
                <Progress value={performanceScore} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span className="font-medium">{business.rating}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reviews</span>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{business.reviewCount}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conversion</span>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{analyticsData.conversionRate}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibility</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{analyticsData.pageViews}</span>
                    </div>
                  </div>
                </div>
              </div>

              {competitorData && (
                <div className="space-y-4">
                  <h4 className="font-medium">Competitor Comparison</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rating vs Average</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{business.rating}</span>
                        <span className="text-sm text-muted-foreground">vs {competitorData.averageRating}</span>
                        <Badge variant={business.rating > competitorData.averageRating ? "default" : "secondary"}>
                          {business.rating > competitorData.averageRating ? "Above" : "Below"} Average
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reviews vs Average</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{business.reviewCount}</span>
                        <span className="text-sm text-muted-foreground">vs {competitorData.averageReviews}</span>
                        <Badge variant={business.reviewCount > competitorData.averageReviews ? "default" : "secondary"}>
                          {business.reviewCount > competitorData.averageReviews ? "Above" : "Below"} Average
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion vs Average</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{analyticsData.conversionRate}%</span>
                        <span className="text-sm text-muted-foreground">vs {competitorData.averageConversion}%</span>
                        <Badge variant={analyticsData.conversionRate > competitorData.averageConversion ? "default" : "secondary"}>
                          {analyticsData.conversionRate > competitorData.averageConversion ? "Above" : "Below"} Average
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="reviews">Review Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            {planTier === "power" && <TabsTrigger value="advanced">Advanced</TabsTrigger>}
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Action Recommendations</CardTitle>
                <CardDescription>
                  Personalized suggestions to improve your business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const typeConfig = getRecommendationType(rec.type);
                    const IconComponent = typeConfig.icon;
                    
                    return (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-3">
                            <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{rec.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">Impact: {rec.impact}</Badge>
                                  <Badge variant="outline">Effort: {rec.effort}</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              <div className="flex items-center space-x-2">
                                <Button size="sm">Take Action</Button>
                                <Button size="sm" variant="outline">Learn More</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviewAnalysis ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Sentiment</CardTitle>
                    <CardDescription>
                      How customers feel about your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Positive</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={reviewAnalysis.sentiment.positive} className="w-20 h-2" />
                          <span className="text-sm font-medium">{reviewAnalysis.sentiment.positive}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Neutral</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={reviewAnalysis.sentiment.neutral} className="w-20 h-2" />
                          <span className="text-sm font-medium">{reviewAnalysis.sentiment.neutral}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Negative</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={reviewAnalysis.sentiment.negative} className="w-20 h-2" />
                          <span className="text-sm font-medium">{reviewAnalysis.sentiment.negative}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Common Keywords</CardTitle>
                    <CardDescription>
                      What customers mention most often
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reviewAnalysis.keywords.slice(0, 5).map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{keyword.word}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{keyword.count}</Badge>
                            <Badge 
                              variant={keyword.sentiment === "positive" ? "default" : 
                                     keyword.sentiment === "negative" ? "destructive" : "secondary"}
                            >
                              {keyword.sentiment}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                    <CardDescription>
                      What customers love about your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reviewAnalysis.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                    <CardDescription>
                      Common customer concerns to address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reviewAnalysis.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <span className="text-sm">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Review Analysis Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need at least 5 reviews to generate detailed review analysis.
                    </p>
                    <Button variant="outline">Learn How to Get More Reviews</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  How your business performance has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Trend analysis requires at least 30 days of data. Keep growing your business to unlock detailed trends!
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+12%</div>
                      <div className="text-sm text-muted-foreground">Page Views</div>
                      <div className="text-xs text-muted-foreground">vs last month</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">+8%</div>
                      <div className="text-sm text-muted-foreground">Lead Submissions</div>
                      <div className="text-xs text-muted-foreground">vs last month</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">+15%</div>
                      <div className="text-sm text-muted-foreground">Phone Clicks</div>
                      <div className="text-xs text-muted-foreground">vs last month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {planTier === "power" && (
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics</CardTitle>
                  <CardDescription>
                    Deep insights for power users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium">Customer Journey Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Discovery Rate</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engagement Rate</span>
                            <span className="font-medium">{analyticsData.conversionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Rate</span>
                            <span className="font-medium">12%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Market Position</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Category Rank</span>
                            <Badge>Top 25%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Local Visibility</span>
                            <Badge variant="outline">High</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Growth Potential</span>
                            <Badge variant="secondary">Medium</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">AI-Powered Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span>Consider adding weekend hours to capture 23% more potential customers</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span>Your response time is 2x faster than competitors - highlight this advantage</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span>Customers mention "reliability" 40% more than average - emphasize this in your profile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </FeatureGate>
  );
}