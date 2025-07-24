import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { 
  IconTrendingUp, 
  IconTrendingDown,
  IconMinus,
  IconCalendar,
  IconUsers,
  IconEye,
  IconShare
} from "@tabler/icons-react";
import { AchievementBadge } from "~/components/ui/achievement-badge";
import type { Doc } from "~/convex/_generated/dataModel";

interface AchievementAnalyticsProps {
  business: Doc<"businesses">;
  achievements: Doc<"achievements">[];
  ranking?: {
    overallScore: number;
    rankingPosition: number;
    previousPosition?: number;
    categoryScores: any;
  };
}

export function AchievementAnalytics({ business, achievements, ranking }: AchievementAnalyticsProps) {
  // Calculate achievement impact metrics
  const achievementStats = {
    totalValue: achievements.length * 150, // $150 estimated value per achievement
    recentGrowth: 12, // Mock data - would come from analytics
    visibilityBoost: achievements.length * 5, // 5% boost per achievement
    competitorAdvantage: achievements.length > 5 ? 'High' : achievements.length > 2 ? 'Medium' : 'Low'
  };

  const rankingTrend = ranking?.previousPosition ? 
    ranking.rankingPosition < ranking.previousPosition ? 'up' : 
    ranking.rankingPosition > ranking.previousPosition ? 'down' : 'stable'
    : 'stable';

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <IconTrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <IconTrendingDown className="w-4 h-4 text-red-600" />;
      default: return <IconMinus className="w-4 h-4 text-gray-600" />;
    }
  };

  const topAchievements = achievements
    .filter(a => ['gold', 'platinum', 'diamond'].includes(a.tierLevel))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="w-5 h-5" />
            Achievement Impact Analysis
          </CardTitle>
          <CardDescription>
            Quantified benefits of your achievements on business performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estimated Marketing Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${achievementStats.totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                vs paid advertising equivalent
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Visibility Boost</p>
              <p className="text-2xl font-bold text-blue-600">
                +{achievementStats.visibilityBoost}%
              </p>
              <p className="text-xs text-muted-foreground">
                increased search prominence
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ranking Trend</p>
              <div className="flex items-center gap-2">
                {getTrendIcon(rankingTrend)}
                <span className="text-2xl font-bold">
                  #{ranking?.rankingPosition || '--'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                in {business.city}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitive Edge</p>
              <Badge 
                variant={achievementStats.competitorAdvantage === 'High' ? 'success' : 
                       achievementStats.competitorAdvantage === 'Medium' ? 'warning' : 'outline'}
              >
                {achievementStats.competitorAdvantage}
              </Badge>
              <p className="text-xs text-muted-foreground">
                vs local competitors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Achievements Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Achievement Showcase</CardTitle>
          <CardDescription>
            Your highest-tier achievements that differentiate your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topAchievements.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {topAchievements.map((achievement) => (
                  <div key={achievement._id} className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50">
                    <AchievementBadge
                      achievementName={achievement.displayName}
                      tier={achievement.tierLevel as any}
                      size="large"
                      context="card"
                      category="excellence"
                    />
                    <div>
                      <p className="font-semibold">{achievement.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" className="flex items-center gap-2">
                  <IconShare className="w-4 h-4" />
                  Share Achievements
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <IconEye className="w-4 h-4" />
                  Preview Public Display
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconTrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Earn Gold, Platinum, or Diamond achievements to showcase here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="w-5 h-5" />
            Achievement Progress Timeline
          </CardTitle>
          <CardDescription>
            Track your achievement growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-2xl font-bold text-green-600">+3</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-600">{achievements.length}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <p className="text-2xl font-bold text-orange-600">5</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Achievement Goal Progress</span>
                <span className="font-medium">{Math.min(achievements.length, 10)}/10</span>
              </div>
              <Progress value={(achievements.length / 10) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Complete 10 achievements to unlock maximum visibility benefits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}