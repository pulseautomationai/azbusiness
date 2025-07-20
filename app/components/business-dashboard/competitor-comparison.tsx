/**
 * Competitor Comparison - Phase 4.1/4.3
 * Compare performance against local competitors
 */

// import { useQuery } from "convex/react";
// import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award, 
  Star, 
  Eye, 
  ArrowUp, 
  ArrowDown,
  Minus,
  Crown,
  Trophy
} from "lucide-react";
import { useState } from "react";

interface CompetitorComparisonProps {
  business: any;
  planTier: string;
}

// Mock competitor data - in production this would come from real ranking data
const generateMockCompetitors = (userBusiness: any) => {
  return [
    {
      _id: "comp-1",
      name: "Premier Home Services",
      rating: 4.8,
      reviewCount: 124,
      speedScore: 8.5,
      valueScore: 7.2,
      qualityScore: 9.1,
      reliabilityScore: 8.8,
      rank: 1,
      planTier: "power",
      profileViews: 891,
      badge: "Top Performer"
    },
    {
      _id: "comp-2", 
      name: userBusiness.name,
      rating: userBusiness.rating || 4.5,
      reviewCount: userBusiness.reviewCount || 67,
      speedScore: 7.8,
      valueScore: 8.1,
      qualityScore: 7.5,
      reliabilityScore: 8.2,
      rank: 3,
      planTier: userBusiness.planTier,
      profileViews: 423,
      badge: "Growing Fast",
      isCurrentUser: true
    },
    {
      _id: "comp-3",
      name: "Reliable Solutions LLC",
      rating: 4.6,
      reviewCount: 89,
      speedScore: 7.1,
      valueScore: 8.8,
      qualityScore: 7.9,
      reliabilityScore: 8.5,
      rank: 2,
      planTier: "pro",
      profileViews: 567,
      badge: "Great Value"
    },
    {
      _id: "comp-4",
      name: "Arizona Elite Services",
      rating: 4.4,
      reviewCount: 203,
      speedScore: 6.8,
      valueScore: 7.5,
      qualityScore: 8.7,
      reliabilityScore: 7.2,
      rank: 4,
      planTier: "starter",
      profileViews: 334,
      badge: null
    },
    {
      _id: "comp-5",
      name: "Quick Fix Pros",
      rating: 4.2,
      reviewCount: 156,
      speedScore: 9.2,
      valueScore: 6.5,
      qualityScore: 7.1,
      reliabilityScore: 7.8,
      rank: 5,
      planTier: "pro",
      profileViews: 278,
      badge: "Speed Champion"
    }
  ];
};

export default function CompetitorComparison({ business, planTier }: CompetitorComparisonProps) {
  const [compareMetric, setCompareMetric] = useState("overall");
  
  const competitors = generateMockCompetitors(business);
  const currentBusiness = competitors.find(c => c.isCurrentUser);
  const otherCompetitors = competitors.filter(c => !c.isCurrentUser);

  const getOverallScore = (competitor: any) => {
    return ((competitor.speedScore + competitor.valueScore + competitor.qualityScore + competitor.reliabilityScore) / 4).toFixed(1);
  };

  const getComparisonIcon = (userValue: number, competitorValue: number, isRankMetric = false) => {
    // For rank, lower is better, so logic is reversed
    const comparison = isRankMetric 
      ? competitorValue - userValue 
      : userValue - competitorValue;
    
    if (comparison > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (comparison < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getComparisonColor = (userValue: number, competitorValue: number, isRankMetric = false) => {
    const comparison = isRankMetric 
      ? competitorValue - userValue 
      : userValue - competitorValue;
    
    if (comparison > 0) return "text-green-600";
    if (comparison < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Competitor Analysis</h3>
          <p className="text-sm text-muted-foreground">
            See how you stack up against local competitors in {business.city}
          </p>
        </div>
        
        <Select value={compareMetric} onValueChange={setCompareMetric}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall Performance</SelectItem>
            <SelectItem value="speed">Speed Scores</SelectItem>
            <SelectItem value="value">Value Scores</SelectItem>
            <SelectItem value="quality">Quality Scores</SelectItem>
            <SelectItem value="reliability">Reliability Scores</SelectItem>
            <SelectItem value="rating">Customer Rating</SelectItem>
            <SelectItem value="reviews">Review Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Your Position Summary */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" />
            Your Market Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">#{currentBusiness?.rank}</div>
              <div className="text-sm text-gray-600">Overall Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getOverallScore(currentBusiness!)}</div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentBusiness?.rating}</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentBusiness?.reviewCount}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
          </div>
          
          {currentBusiness?.badge && (
            <div className="mt-4 text-center">
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                🏆 {currentBusiness.badge}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competitor Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detailed Comparison
          </CardTitle>
          <CardDescription>
            Performance comparison with top competitors in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          {planTier === "free" || planTier === "starter" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Detailed Competitor Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Available with Pro plan and higher
              </p>
              <Button className="bg-ocotillo-red hover:bg-ocotillo-red/90">
                Upgrade to Pro
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div>Business</div>
                <div>Rank</div>
                <div>Rating</div>
                <div>Reviews</div>
                <div>Performance</div>
                <div>Advantage</div>
              </div>

              {/* Competitor Rows */}
              {competitors.map((competitor) => (
                <div
                  key={competitor._id}
                  className={`grid grid-cols-6 gap-4 items-center py-3 border-b last:border-b-0 ${
                    competitor.isCurrentUser ? 'bg-blue-50 border-blue-200 rounded-lg px-3' : ''
                  }`}
                >
                  {/* Business Name */}
                  <div className="flex items-center gap-2">
                    {competitor.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    <div>
                      <div className="font-medium">
                        {competitor.isCurrentUser ? "Your Business" : competitor.name}
                      </div>
                      {competitor.badge && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {competitor.badge}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="flex items-center gap-1">
                    <span className="font-medium">#{competitor.rank}</span>
                    {competitor.isCurrentUser && (
                      getComparisonIcon(competitor.rank, otherCompetitors[0]?.rank || competitor.rank, true)
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{competitor.rating}</span>
                  </div>

                  {/* Reviews */}
                  <div>{competitor.reviewCount}</div>

                  {/* Performance Score */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getOverallScore(competitor)}/10</span>
                    <Progress value={parseFloat(getOverallScore(competitor)) * 10} className="h-2 flex-1" />
                  </div>

                  {/* Advantage */}
                  <div>
                    {competitor.isCurrentUser ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        You
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1 text-sm">
                        {competitor.rank < currentBusiness!.rank ? (
                          <span className="text-red-600">#{competitor.rank - currentBusiness!.rank}</span>
                        ) : competitor.rank > currentBusiness!.rank ? (
                          <span className="text-green-600">+{competitor.rank - currentBusiness!.rank}</span>
                        ) : (
                          <span className="text-gray-600">Same</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      {(planTier === "pro" || planTier === "power") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Breakdown
            </CardTitle>
            <CardDescription>
              Detailed performance metrics comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {['speed', 'value', 'quality', 'reliability'].map((metric) => (
                <div key={metric} className="space-y-3">
                  <h4 className="font-medium capitalize">{metric} Performance</h4>
                  <div className="space-y-2">
                    {competitors.slice(0, 3).map((competitor) => (
                      <div key={competitor._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            competitor.isCurrentUser ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <span className={`text-sm ${competitor.isCurrentUser ? 'font-medium' : ''}`}>
                            {competitor.isCurrentUser ? 'Your Business' : competitor.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={competitor[`${metric}Score` as keyof typeof competitor] as number * 10} 
                            className="h-2 w-20" 
                          />
                          <span className="text-sm font-medium w-8">
                            {(competitor[`${metric}Score` as keyof typeof competitor] as number).toFixed(1)}
                          </span>
                          {competitor.isCurrentUser && (
                            <div className="w-5 flex justify-center">
                              {getComparisonIcon(
                                competitor[`${metric}Score` as keyof typeof competitor] as number,
                                Math.max(...otherCompetitors.map(c => c[`${metric}Score` as keyof typeof c] as number))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Insights */}
      {planTier === "power" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Competitive Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your competitive position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium text-green-900">Strength: Quality Leadership</div>
                    <div className="text-sm text-green-700">
                      Your quality score (7.5) outperforms 60% of competitors. Leverage this in marketing.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium text-blue-900">Opportunity: Speed Improvement</div>
                    <div className="text-sm text-blue-700">
                      Quick Fix Pros leads in speed (9.2). Focus on faster response times to compete.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium text-amber-900">Market Gap: Premium Services</div>
                    <div className="text-sm text-amber-700">
                      No competitor dominates premium value. Consider premium service tier.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}