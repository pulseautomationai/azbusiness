import { useUser } from "@clerk/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  IconTrophy,
  IconCrown,
  IconStar,
  IconTrendingUp,
  IconLock,
  IconChevronRight
} from "@tabler/icons-react";
import { AchievementCard } from "~/components/dashboard/achievements/AchievementCard";
import { AchievementProgress } from "~/components/dashboard/achievements/AchievementProgress";
import { RankingDisplay } from "~/components/dashboard/achievements/RankingDisplay";
import { AchievementAnalytics } from "~/components/dashboard/achievements/AchievementAnalytics";
import { AchievementSharing } from "~/components/dashboard/achievements/AchievementSharing";
import { TierComparison } from "~/components/dashboard/achievements/TierComparison";
import { UpgradeCTA } from "~/components/UpgradeCTA";

export default function AchievementsPage() {
  const { user } = useUser();
  const planFeatures = usePlanFeatures();

  // Get user's businesses
  const userBusinesses = useQuery(
    api.businesses.getUserBusinesses,
    user?.id ? { userId: user.id } : "skip"
  );

  // For now, we'll focus on the first business if they have multiple
  const selectedBusiness = userBusinesses?.[0];

  // Get achievements for the selected business
  const achievements = useQuery(
    api.achievements.awardAchievement.getBusinessAchievements,
    selectedBusiness ? { businessId: selectedBusiness._id } : "skip"
  );

  // Get achievement progress
  const progress = useQuery(
    api.achievements.cronJobs.getBusinessAchievementProgressPublic,
    selectedBusiness ? { businessId: selectedBusiness._id } : "skip"
  );

  // Get business ranking
  const ranking = useQuery(
    api.rankings.calculateRankings.getTopRankedBusinesses,
    selectedBusiness ? {
      category: selectedBusiness.category?.slug,
      city: selectedBusiness.city,
      limit: 10
    } : "skip"
  );

  // Find our business in the rankings
  const businessRanking = ranking?.find(r => r.businessId === selectedBusiness?._id);

  // Group achievements by category
  const achievementsByCategory = achievements?.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  // Count achievements by tier
  const achievementStats = {
    total: achievements?.length || 0,
    bronze: achievements?.filter(a => a.tierLevel === "bronze").length || 0,
    silver: achievements?.filter(a => a.tierLevel === "silver").length || 0,
    gold: achievements?.filter(a => a.tierLevel === "gold").length || 0,
    platinum: achievements?.filter(a => a.tierLevel === "platinum").length || 0,
    diamond: achievements?.filter(a => a.tierLevel === "diamond").length || 0,
  };

  if (!selectedBusiness) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle>No Business Selected</CardTitle>
              <CardDescription>
                You need to claim or add a business to view achievements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/claim-business">
                <button className="btn btn-primary">Claim a Business</button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Achievements & Rankings</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <IconTrophy className="w-3 h-3" />
              {achievementStats.total} Earned
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Track your business performance and unlock achievements to stand out from competitors.
          </p>
        </div>

        {/* Business Selector (if multiple businesses) */}
        {userBusinesses && userBusinesses.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selected Business</CardTitle>
            </CardHeader>
            <CardContent>
              <select 
                className="w-full p-2 border rounded"
                value={selectedBusiness._id}
                disabled // For now, just show the first business
              >
                {userBusinesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name} ({business.planTier})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Ranking</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessRanking ? `#${businessRanking.rankingPosition}` : '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                in {selectedBusiness.city}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <IconStar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessRanking?.overallScore ? businessRanking.overallScore.toFixed(1) : '--'}/100
              </div>
              <Progress 
                value={businessRanking?.overallScore || 0} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <IconTrophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievementStats.total}</div>
              <div className="flex gap-1 mt-2">
                {achievementStats.bronze > 0 && (
                  <Badge variant="outline" className="text-xs">
                    🥉 {achievementStats.bronze}
                  </Badge>
                )}
                {achievementStats.silver > 0 && (
                  <Badge variant="outline" className="text-xs">
                    🥈 {achievementStats.silver}
                  </Badge>
                )}
                {achievementStats.gold > 0 && (
                  <Badge variant="outline" className="text-xs">
                    🥇 {achievementStats.gold}
                  </Badge>
                )}
                {achievementStats.platinum > 0 && (
                  <Badge variant="outline" className="text-xs">
                    👑 {achievementStats.platinum}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Achievement</CardTitle>
              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {progress?.[0]?.achievementType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'None'}
              </div>
              <Progress 
                value={progress?.[0]?.currentProgress || 0} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 min-w-[600px] md:min-w-0">
              <TabsTrigger value="achievements" className="text-xs md:text-sm">Achievements</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="ranking" className="text-xs md:text-sm">Rankings</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs md:text-sm">Progress</TabsTrigger>
              <TabsTrigger value="sharing" className="text-xs md:text-sm">Share</TabsTrigger>
              <TabsTrigger value="tiers" className="text-xs md:text-sm">Plans</TabsTrigger>
            </TabsList>
          </div>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            {/* Tier Gate Message */}
            {planFeatures.planTier === 'free' && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconLock className="h-5 w-5" />
                    Unlock More Achievements
                  </CardTitle>
                  <CardDescription>
                    Free tier businesses can only earn Bronze achievements. Upgrade to unlock Silver, Gold, and Platinum achievements!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpgradeCTA 
                    feature="achievement-tiers"
                    currentPlan={planFeatures.planTier}
                    message="Upgrade to Starter plan to unlock Silver achievements"
                  />
                </CardContent>
              </Card>
            )}

            {/* Achievement Categories */}
            {Object.entries(achievementsByCategory || {}).map(([category, categoryAchievements]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {category.replace(/_/g, ' ')} Achievements
                  </CardTitle>
                  <CardDescription>
                    {categoryAchievements?.length || 0} achievements earned in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryAchievements?.map((achievement) => (
                      <AchievementCard 
                        key={achievement._id} 
                        achievement={achievement}
                        businessTier={selectedBusiness.planTier}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {(!achievements || achievements.length === 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>No Achievements Yet</CardTitle>
                  <CardDescription>
                    Start earning achievements by improving your service quality and customer satisfaction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Achievements are automatically awarded based on your customer reviews and business performance.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AchievementAnalytics 
              business={selectedBusiness}
              achievements={achievements || []}
              ranking={businessRanking}
            />
          </TabsContent>

          {/* Ranking Details Tab */}
          <TabsContent value="ranking">
            <RankingDisplay 
              ranking={businessRanking}
              business={selectedBusiness}
              competitors={ranking || []}
            />
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-4">
            {progress && progress.length > 0 ? (
              progress.map((progressItem) => (
                <AchievementProgress 
                  key={progressItem._id}
                  progress={progressItem}
                  businessTier={selectedBusiness.planTier}
                />
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Achievements in Progress</CardTitle>
                  <CardDescription>
                    All available achievements for your tier have been earned!
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing">
            <AchievementSharing 
              business={selectedBusiness}
              achievements={achievements || []}
            />
          </TabsContent>

          {/* Tier Comparison Tab */}
          <TabsContent value="tiers">
            <TierComparison 
              currentTier={selectedBusiness.planTier}
              achievements={achievements || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}