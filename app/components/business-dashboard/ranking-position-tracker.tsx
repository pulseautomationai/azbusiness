/**
 * Ranking Position Tracker - Phase 4.1
 * Track ranking positions over time with trend analysis
 */

// import { useQuery } from "convex/react";
// import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useState } from "react";

interface RankingPositionTrackerProps {
  business: any;
  planTier: string;
}

// Mock historical data - in production this would come from database
const generateMockRankingHistory = (currentRank: number) => {
  const history: Array<{date: string, rank: number, change: number}> = [];
  let rank = currentRank;
  
  for (let i = 30; i >= 0; i--) {
    // Add some realistic variance
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    rank = Math.max(1, Math.min(20, rank + change));
    
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      rank: rank,
      change: i === 30 ? 0 : rank - history[history.length - 1]?.rank || 0
    });
  }
  
  return history;
};

export default function RankingPositionTracker({ 
  business, 
  planTier 
}: RankingPositionTrackerProps) {
  const [timeRange, setTimeRange] = useState("30d");
  
  // Fetch current ranking data
  // const rankingData = useQuery(api.rankingAlgorithm.getBusinessRanking, {
  //   businessId: business._id,
  //   city: business.city,
  //   category: business.category?.slug || "",
  // });

  // Fetch performance scores for detailed breakdown
  // const performanceMetrics = useQuery(api.performanceScoring.getBusinessPerformanceScores, {
  //   businessId: business._id,
  // });

  const currentRank = 15;
  const totalBusinesses = 50;
  const rankingHistory = generateMockRankingHistory(currentRank);
  
  // Calculate trends
  const lastWeekRank = rankingHistory[rankingHistory.length - 7]?.rank || currentRank;
  const rankChange = lastWeekRank - currentRank; // Positive means improved (lower rank number)
  
  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Current Ranking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocotillo-red">#{currentRank}</div>
            <div className="text-sm text-muted-foreground">
              out of {totalBusinesses} in {business.city}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold flex items-center gap-2 ${getTrendColor(rankChange)}`}>
              {getTrendIcon(rankChange)}
              {Math.abs(rankChange) || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              {rankChange > 0 ? "Positions up" : rankChange < 0 ? "Positions down" : "No change"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Percentile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((1 - currentRank / totalBusinesses) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {currentRank <= 3 ? "Top performer" : currentRank <= 10 ? "Strong position" : "Room to grow"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Trends Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ranking Trends
            </CardTitle>
            <CardDescription>
              Your position over time in {business.category?.name} category
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {planTier === "starter" ? (
            <div className="space-y-4">
              {/* Simple trend visualization for Starter */}
              <div className="flex items-center justify-between py-4 border rounded-lg px-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">#{currentRank}</div>
                  <div>
                    <div className="font-medium">Current Position</div>
                    <div className="text-sm text-muted-foreground">
                      {rankChange > 0 && `↗ Up ${rankChange} positions`}
                      {rankChange < 0 && `↘ Down ${Math.abs(rankChange)} positions`}
                      {rankChange === 0 && "→ No change"}
                    </div>
                  </div>
                </div>
                <Badge variant={currentRank <= 5 ? "default" : "secondary"}>
                  {currentRank <= 3 ? "🏆 Top 3" : currentRank <= 10 ? "Strong" : "Growing"}
                </Badge>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed ranking charts available with Pro plan
                </p>
                <Button size="sm" className="bg-ocotillo-red hover:bg-ocotillo-red/90">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Detailed chart for Pro+ tiers */}
              <div className="h-64 flex items-end justify-between gap-1 px-4">
                {rankingHistory.slice(-14).map((day, index) => (
                  <div key={day.date} className="flex flex-col items-center gap-1">
                    <div
                      className="bg-ocotillo-red rounded-t"
                      style={{
                        height: `${Math.max(10, (1 - day.rank / totalBusinesses) * 200)}px`,
                        width: "12px"
                      }}
                    />
                    <div className="text-xs text-muted-foreground transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-ocotillo-red rounded"></div>
                  Ranking Position (lower is better)
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Factors
          </CardTitle>
          <CardDescription>
            How different factors contribute to your ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {planTier === "starter" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Overall Rating</span>
                <div className="flex items-center gap-2">
                  <span>{business.rating?.toFixed(1) || "N/A"}</span>
                  <Badge variant="secondary">Basic</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Review Count</span>
                <div className="flex items-center gap-2">
                  <span>{business.reviewCount || 0}</span>
                  <Badge variant="secondary">Basic</Badge>
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">
                  Get detailed AI-powered performance analysis
                </p>
                <Button size="sm" variant="outline" className="border-blue-200">
                  Upgrade for Details
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries({speed: 7.8, value: 8.1, quality: 7.5, reliability: 8.2}).map(([factor, score]) => (
                <div key={factor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-medium">{factor}</span>
                    <span className="text-sm text-muted-foreground">{score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-ocotillo-red h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(score / 10) * 100}%` }}
                    ></div>
                  </div>
                  {score >= 8 && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      Strength
                    </Badge>
                  )}
                  {score < 6 && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                      Opportunity
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {planTier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking Improvement Tips
            </CardTitle>
            <CardDescription>
              Actions to help improve your position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-blue-900">Encourage Recent Reviews</div>
                  <div className="text-sm text-blue-700">
                    Recent reviews have higher impact on rankings
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-green-900">Improve Response Time</div>
                  <div className="text-sm text-green-700">
                    Fast responses boost your speed ranking
                  </div>
                </div>
              </div>

              {planTier === "power" && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-purple-900">AI Insight</div>
                    <div className="text-sm text-purple-700">
                      Your value perception could improve with transparent pricing
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}