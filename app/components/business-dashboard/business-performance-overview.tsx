/**
 * Business Performance Overview - Phase 4.1
 * Main dashboard overview showing key performance metrics
 */

// import { useQuery } from "convex/react";
// import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Star, 
  Award, 
  Target, 
  Users, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  AlertTriangle
} from "lucide-react";

interface BusinessPerformanceOverviewProps {
  business: any;
  planTier: string;
}

export default function BusinessPerformanceOverview({ 
  business, 
  planTier 
}: BusinessPerformanceOverviewProps) {
  
  // Fetch performance metrics for this business
  // const performanceMetrics = useQuery(api.performanceScoring.getBusinessPerformanceScores, {
  //   businessId: business._id,
  // });

  // Fetch ranking position
  // const rankingData = useQuery(api.rankingAlgorithm.getBusinessRanking, {
  //   businessId: business._id,
  //   city: business.city,
  //   category: business.category?.slug || "",
  // });

  // Mock data for demonstration (would be real data in production)
  const overviewStats = {
    profileViews: 247,
    profileViewsChange: 12,
    leadGenerated: planTier === "power" ? 8 : 0,
    leadsChange: 3,
    avgRating: business.rating || 0,
    ratingChange: 0.1,
    totalReviews: business.reviewCount || 0,
    reviewsChange: 2,
  };

  const performanceScores = {
    speed: 7.8,
    value: 8.1,
    quality: 7.5,
    reliability: 8.2,
  };

  const currentRank = 3;
  const totalBusinesses = 15;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.profileViews}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{overviewStats.profileViewsChange}% from last month
            </div>
          </CardContent>
        </Card>

        {/* Lead Generation - Power tier only */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {planTier === "power" ? "Leads Generated" : "Leads (Upgrade)"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {planTier === "power" ? (
              <>
                <div className="text-2xl font-bold">{overviewStats.leadGenerated}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +{overviewStats.leadsChange} this month
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">--</div>
                <div className="text-xs text-muted-foreground">
                  Available with Power plan
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.avgRating.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{overviewStats.ratingChange.toFixed(1)} from last month
            </div>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalReviews}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{overviewStats.reviewsChange} this month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Scores
            </CardTitle>
            <CardDescription>
              {planTier === "free" 
                ? "Basic performance overview" 
                : "AI-analyzed performance across key areas"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(performanceScores).map(([metric, score]) => (
              <div key={metric} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{metric}</span>
                  <span className="text-muted-foreground">
                    {score > 0 ? `${score.toFixed(1)}/10` : "Analyzing..."}
                  </span>
                </div>
                <Progress 
                  value={score * 10} 
                  className="h-2"
                />
                {score > 8 && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    Excellent
                  </Badge>
                )}
              </div>
            ))}
            
            {planTier === "free" && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Upgrade to get detailed performance insights
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ranking Position */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Market Position
            </CardTitle>
            <CardDescription>
              Your ranking in {business.city} {business.category?.name || "your category"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentRank ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-ocotillo-red">
                    #{currentRank}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    out of {totalBusinesses} businesses
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Market Position</span>
                    <span>{currentRank <= 3 ? "Top Performer" : currentRank <= 10 ? "Strong" : "Growing"}</span>
                  </div>
                  <Progress 
                    value={Math.max(10, 100 - (currentRank / totalBusinesses) * 100)} 
                    className="h-2"
                  />
                </div>

                {currentRank <= 3 && (
                  <Badge className="w-full justify-center bg-green-100 text-green-800">
                    🏆 Top 3 in your area!
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">
                  Calculating your ranking...
                </div>
                <div className="text-sm text-muted-foreground">
                  Rankings update hourly based on customer feedback
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Improve your business performance and rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Public Profile
            </Button>
            
            {planTier !== "power" && (
              <Button className="flex items-center gap-2 bg-ocotillo-red hover:bg-ocotillo-red/90">
                <TrendingUp className="h-4 w-4" />
                Upgrade Plan
              </Button>
            )}
            
            {["pro", "power"].includes(planTier) && (
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Respond to Reviews
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}