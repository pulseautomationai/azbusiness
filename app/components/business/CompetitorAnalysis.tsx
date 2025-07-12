import { TrendingUp, TrendingDown, Star, Users, Phone, Globe, MessageSquare, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { FeatureGate } from "~/components/FeatureGate";
import type { PlanTier } from "~/config/features";

interface Competitor {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  estimatedViews: number;
  estimatedLeads: number;
  priceRange: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
}

interface CompetitorAnalysisProps {
  businessId: string;
  planTier: PlanTier;
  business: {
    name: string;
    rating: number;
    reviewCount: number;
    category: string;
    city: string;
    priceRange?: string;
  };
  competitors: Competitor[];
  marketInsights: {
    totalBusinesses: number;
    averageRating: number;
    averageReviews: number;
    marketGrowth: number;
    topKeywords: string[];
    seasonalTrends: Array<{
      month: string;
      demand: number;
    }>;
  };
  yourRanking: {
    position: number;
    percentile: number;
    category: string;
  };
}

export function CompetitorAnalysis({ 
  businessId, 
  planTier, 
  business, 
  competitors, 
  marketInsights, 
  yourRanking 
}: CompetitorAnalysisProps) {
  const getCompetitiveAdvantages = () => {
    const advantages = [];
    
    // Rating advantage
    if (business.rating > marketInsights.averageRating) {
      advantages.push({
        type: "rating",
        title: "Higher Rating",
        description: `Your rating is ${(business.rating - marketInsights.averageRating).toFixed(1)} points above average`,
        impact: "High"
      });
    }
    
    // Review count advantage
    if (business.reviewCount > marketInsights.averageReviews) {
      advantages.push({
        type: "reviews",
        title: "More Reviews",
        description: `You have ${business.reviewCount - marketInsights.averageReviews} more reviews than average`,
        impact: "Medium"
      });
    }
    
    // Market position
    if (yourRanking.percentile > 75) {
      advantages.push({
        type: "position",
        title: "Strong Market Position",
        description: `You're in the top ${100 - yourRanking.percentile}% of businesses in your category`,
        impact: "High"
      });
    }
    
    return advantages;
  };

  const getCompetitiveGaps = () => {
    const gaps = [];
    
    // Rating gap
    if (business.rating < marketInsights.averageRating) {
      gaps.push({
        type: "rating",
        title: "Rating Below Average",
        description: `Your rating is ${(marketInsights.averageRating - business.rating).toFixed(1)} points below average`,
        priority: "High",
        solution: "Focus on improving customer satisfaction and encourage positive reviews"
      });
    }
    
    // Review count gap
    if (business.reviewCount < marketInsights.averageReviews) {
      gaps.push({
        type: "reviews",
        title: "Fewer Reviews",
        description: `You have ${marketInsights.averageReviews - business.reviewCount} fewer reviews than average`,
        priority: "Medium",
        solution: "Implement a review generation strategy to build social proof"
      });
    }
    
    // Market position gap
    if (yourRanking.percentile < 50) {
      gaps.push({
        type: "position",
        title: "Market Position Opportunity",
        description: `You're in the bottom ${yourRanking.percentile}% of businesses in your category`,
        priority: "High",
        solution: "Optimize your profile and improve key performance metrics"
      });
    }
    
    return gaps;
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    // Analyze top competitors
    const topCompetitors = competitors.slice(0, 3);
    
    topCompetitors.forEach(competitor => {
      if (competitor.rating > business.rating) {
        recommendations.push({
          title: "Improve Service Quality",
          description: `${competitor.name} has a ${competitor.rating} rating vs your ${business.rating}. Study their approach to customer service.`,
          action: "Analyze their reviews for improvement opportunities",
          priority: "High"
        });
      }
      
      if (competitor.reviewCount > business.reviewCount * 2) {
        recommendations.push({
          title: "Increase Review Generation",
          description: `${competitor.name} has ${competitor.reviewCount} reviews vs your ${business.reviewCount}. More reviews build trust and improve ranking.`,
          action: "Implement automated review requests",
          priority: "Medium"
        });
      }
    });
    
    // Market-based recommendations
    if (marketInsights.marketGrowth > 10) {
      recommendations.push({
        title: "Capitalize on Market Growth",
        description: `Your market is growing ${marketInsights.marketGrowth}% annually. This is a great time to expand your presence.`,
        action: "Consider increasing marketing budget or expanding services",
        priority: "Medium"
      });
    }
    
    return recommendations;
  };

  const advantages = getCompetitiveAdvantages();
  const gaps = getCompetitiveGaps();
  const recommendations = getRecommendations();

  const getRankingColor = (percentile: number) => {
    if (percentile >= 75) return "text-green-600";
    if (percentile >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceComparison = (yourValue: number, competitorValue: number) => {
    if (yourValue > competitorValue) return { icon: TrendingUp, color: "text-green-600" };
    if (yourValue < competitorValue) return { icon: TrendingDown, color: "text-red-600" };
    return { icon: TrendingUp, color: "text-gray-600" };
  };

  return (
    <FeatureGate featureId="competitor_analysis" planTier={planTier}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Competitor Analysis</h2>
            <p className="text-muted-foreground">
              Understand your competitive position and discover opportunities
            </p>
          </div>
          <Badge variant="outline">Updated Weekly</Badge>
        </div>

        {/* Market Position Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Your Market Position</span>
            </CardTitle>
            <CardDescription>
              How you rank against competitors in {business.category} in {business.city}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getRankingColor(yourRanking.percentile)}`}>
                  #{yourRanking.position}
                </div>
                <div className="text-sm text-muted-foreground">Overall Ranking</div>
                <div className="text-xs text-muted-foreground">
                  out of {marketInsights.totalBusinesses} businesses
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${getRankingColor(yourRanking.percentile)}`}>
                  {yourRanking.percentile}%
                </div>
                <div className="text-sm text-muted-foreground">Percentile</div>
                <div className="text-xs text-muted-foreground">
                  performing better than
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {marketInsights.marketGrowth}%
                </div>
                <div className="text-sm text-muted-foreground">Market Growth</div>
                <div className="text-xs text-muted-foreground">
                  annual growth rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">Top Competitors</TabsTrigger>
            <TabsTrigger value="strengths">Strengths & Gaps</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            {planTier === "power" && <TabsTrigger value="insights">Market Insights</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance vs Market Average</CardTitle>
                  <CardDescription>
                    How your key metrics compare to the market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rating</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{business.rating}</span>
                        <span className="text-sm text-muted-foreground">vs {marketInsights.averageRating}</span>
                        <Badge variant={business.rating > marketInsights.averageRating ? "default" : "secondary"}>
                          {business.rating > marketInsights.averageRating ? "Above" : "Below"} Average
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Reviews</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{business.reviewCount}</span>
                        <span className="text-sm text-muted-foreground">vs {marketInsights.averageReviews}</span>
                        <Badge variant={business.reviewCount > marketInsights.averageReviews ? "default" : "secondary"}>
                          {business.reviewCount > marketInsights.averageReviews ? "Above" : "Below"} Average
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Market Position</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Top {100 - yourRanking.percentile}%</span>
                        <Badge variant={yourRanking.percentile > 50 ? "default" : "secondary"}>
                          {yourRanking.percentile > 50 ? "Strong" : "Opportunity"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Wins</CardTitle>
                  <CardDescription>
                    Immediate opportunities to improve your position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Competitors</CardTitle>
                <CardDescription>
                  Businesses in your category and location that you compete with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.slice(0, 5).map((competitor, index) => (
                    <Card key={competitor.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">#{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium">{competitor.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                                    <span>{competitor.rating}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{competitor.reviewCount} reviews</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3" />
                                    <span>{competitor.estimatedViews} views</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium text-green-600">Strengths</h5>
                                <ul className="text-muted-foreground text-xs space-y-1">
                                  {competitor.strengths.slice(0, 2).map((strength, i) => (
                                    <li key={i}>• {strength}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-red-600">Weaknesses</h5>
                                <ul className="text-muted-foreground text-xs space-y-1">
                                  {competitor.weaknesses.slice(0, 2).map((weakness, i) => (
                                    <li key={i}>• {weakness}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{competitor.priceRange}</div>
                            <div className="text-xs text-muted-foreground">Price Range</div>
                            <div className="mt-2">
                              <Progress value={competitor.marketShare} className="w-20 h-2" />
                              <div className="text-xs text-muted-foreground mt-1">
                                {competitor.marketShare}% market share
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Your Competitive Advantages</CardTitle>
                  <CardDescription>
                    Areas where you outperform the competition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {advantages.length > 0 ? (
                      advantages.map((advantage, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{advantage.title}</h4>
                            <p className="text-xs text-muted-foreground">{advantage.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {advantage.impact}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No clear advantages identified yet. Focus on improving key metrics.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Competitive Gaps</CardTitle>
                  <CardDescription>
                    Areas where you can improve to compete better
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gaps.length > 0 ? (
                      gaps.map((gap, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{gap.title}</h4>
                            <p className="text-xs text-muted-foreground mb-1">{gap.description}</p>
                            <p className="text-xs text-blue-600">{gap.solution}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {gap.priority}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Great! You're performing well across all key metrics.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>
                  Action items to improve your competitive position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{rec.title}</h4>
                              <Badge variant="outline">{rec.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            <div className="flex items-center space-x-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-blue-600" />
                              <span className="text-blue-600">{rec.action}</span>
                            </div>
                          </div>
                          <Button size="sm">Take Action</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {planTier === "power" && (
            <TabsContent value="insights" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Trends</CardTitle>
                    <CardDescription>
                      Seasonal patterns and market dynamics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {marketInsights.marketGrowth}%
                          </div>
                          <div className="text-sm text-muted-foreground">Annual Growth</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {marketInsights.totalBusinesses}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Businesses</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Top Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {marketInsights.topKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Seasonal Demand</CardTitle>
                    <CardDescription>
                      When customers need your services most
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketInsights.seasonalTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{trend.month}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={trend.demand} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{trend.demand}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </FeatureGate>
  );
}