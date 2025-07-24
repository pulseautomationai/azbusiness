import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { 
  IconLock, 
  IconCheck, 
  IconCrown,
  IconTrophy,
  IconStar,
  IconChevronRight,
  IconTrendingUp
} from "@tabler/icons-react";
import { AchievementBadge } from "~/components/ui/achievement-badge";

interface TierComparisonProps {
  currentTier: string;
  achievements: Array<{
    _id: string;
    displayName: string;
    tierLevel: string;
    tierRequirement: string;
    category: string;
  }>;
}

export function TierComparison({ currentTier, achievements }: TierComparisonProps) {
  const tierInfo = {
    free: {
      name: 'Free',
      price: '$0',
      achievements: ['Bronze'],
      maxAchievements: 5,
      features: ['Basic listing', 'Bronze achievements only', 'Limited visibility'],
      color: 'gray'
    },
    starter: {
      name: 'Starter',
      price: '$9',
      achievements: ['Bronze', 'Silver'],
      maxAchievements: 12,
      features: ['Professional listing', 'AI summary', 'Silver achievements', 'Verification badge'],
      color: 'blue'
    },
    pro: {
      name: 'Pro',
      price: '$29',
      achievements: ['Bronze', 'Silver', 'Gold'],
      maxAchievements: 20,
      features: ['Featured placement', 'Gold achievements', 'Enhanced analytics', 'Content editing'],
      color: 'yellow'
    },
    power: {
      name: 'Power',
      price: '$97',
      achievements: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      maxAchievements: 30,
      features: ['All achievements', 'Lead generation', 'Homepage featuring', 'Advanced AI tools'],
      color: 'purple'
    }
  };

  const getCurrentTierInfo = () => tierInfo[currentTier as keyof typeof tierInfo] || tierInfo.free;
  const currentInfo = getCurrentTierInfo();

  const getAchievementsByTier = () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    return tiers.map(tier => ({
      tier,
      total: achievements.filter(a => a.tierLevel === tier).length,
      available: achievements.filter(a => a.tierLevel === tier && a.tierRequirement <= currentTier).length,
      locked: achievements.filter(a => a.tierLevel === tier && a.tierRequirement > currentTier).length
    }));
  };

  const tierProgress = getAchievementsByTier();
  const totalEarned = achievements.length;
  const totalPossible = currentInfo.maxAchievements;

  const getUpgradeRecommendation = () => {
    const lockedAchievements = achievements.filter(a => a.tierRequirement > currentTier);
    if (lockedAchievements.length === 0) return null;

    const nextTier = currentTier === 'free' ? 'starter' : 
                    currentTier === 'starter' ? 'pro' : 
                    currentTier === 'pro' ? 'power' : null;
    
    if (!nextTier) return null;

    const nextTierInfo = tierInfo[nextTier as keyof typeof tierInfo];
    const unlockedCount = lockedAchievements.filter(a => a.tierRequirement <= nextTier).length;

    return {
      tier: nextTier,
      info: nextTierInfo,
      unlockedCount
    };
  };

  const upgradeRec = getUpgradeRecommendation();

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="w-5 h-5" />
            Your Current Plan: {currentInfo.name}
          </CardTitle>
          <CardDescription>
            Achievement progress and unlocked tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Achievement Progress</span>
              <span className="text-sm text-muted-foreground">{totalEarned}/{totalPossible}</span>
            </div>
            <Progress value={(totalEarned / totalPossible) * 100} className="h-3" />
            
            {/* Tier Breakdown */}
            <div className="grid gap-3 md:grid-cols-5">
              {tierProgress.map(({ tier, total, available, locked }) => (
                <div key={tier} className="text-center p-3 rounded-lg border">
                  <AchievementBadge
                    achievementName=""
                    tier={tier as any}
                    size="small"
                    context="card"
                    iconOnly
                  />
                  <p className="text-xs font-medium mt-2 capitalize">{tier}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-sm font-bold">{available}</span>
                    {locked > 0 && (
                      <span className="text-xs text-muted-foreground">
                        (+{locked} <IconLock className="w-3 h-3 inline" />)
                      </span>
                    )}
                  </div>
                </div>
              ))}\n            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Recommendation */}
      {upgradeRec && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="w-5 h-5 text-orange-600" />
              Unlock More Achievements
            </CardTitle>
            <CardDescription>
              Upgrade to {upgradeRec.info.name} and unlock {upgradeRec.unlockedCount} more achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{upgradeRec.info.name} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {upgradeRec.info.price}/month • Unlock {upgradeRec.info.achievements.join(', ')} tiers
                  </p>
                </div>
                <Button className="flex items-center gap-2">
                  <IconCrown className="w-4 h-4" />
                  Upgrade Now
                  <IconChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid gap-2 md:grid-cols-2">
                {upgradeRec.info.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Tier Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            See what achievements and features each plan unlocks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Feature</th>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <th key={key} className="text-center p-3 min-w-[120px]">
                      <div className="space-y-1">
                        <p className="font-semibold">{info.name}</p>
                        <Badge 
                          variant={key === currentTier ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {info.price}/mo
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Achievement Tiers</td>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <td key={key} className="text-center p-3">
                      <div className="flex justify-center gap-1">
                        {info.achievements.map((tier) => (
                          <AchievementBadge
                            key={tier}
                            achievementName=""
                            tier={tier.toLowerCase() as any}
                            size="small"
                            context="card"
                            iconOnly
                          />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b">
                  <td className="p-3 font-medium">Max Achievements</td>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <td key={key} className="text-center p-3 font-semibold">
                      {info.maxAchievements}
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b">
                  <td className="p-3 font-medium">Lead Generation</td>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <td key={key} className="text-center p-3">
                      {key === 'power' ? (
                        <IconCheck className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <IconLock className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b">
                  <td className="p-3 font-medium">Homepage Featuring</td>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <td key={key} className="text-center p-3">
                      {['pro', 'power'].includes(key) ? (
                        <IconCheck className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <IconLock className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr>
                  <td className="p-3 font-medium">AI Enhancement</td>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <td key={key} className="text-center p-3">
                      {key === 'power' ? (
                        <Badge variant="success" className="text-xs">Full</Badge>
                      ) : key === 'pro' ? (
                        <Badge variant="warning" className="text-xs">Basic</Badge>
                      ) : key === 'starter' ? (
                        <Badge variant="outline" className="text-xs">Limited</Badge>
                      ) : (
                        <IconLock className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Impact Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconStar className="w-5 h-5" />
            Achievement Value Calculator
          </CardTitle>
          <CardDescription>
            Estimated marketing value of your unlocked achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Current Value</h4>
              <div className="space-y-2">
                {tierProgress.map(({ tier, available }) => (
                  available > 0 && (
                    <div key={tier} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <AchievementBadge
                          achievementName=""
                          tier={tier as any}
                          size="small"
                          context="search"
                          iconOnly
                        />
                        <span className="capitalize">{tier}</span>
                      </span>
                      <span className="font-medium">
                        {available} × ${tier === 'bronze' ? '50' : tier === 'silver' ? '100' : tier === 'gold' ? '200' : tier === 'platinum' ? '400' : '800'} = 
                        ${available * (tier === 'bronze' ? 50 : tier === 'silver' ? 100 : tier === 'gold' ? 200 : tier === 'platinum' ? 400 : 800)}
                      </span>
                    </div>
                  )
                ))}
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Current Value</span>
                    <span className="text-green-600">
                      ${tierProgress.reduce((sum, { tier, available }) => 
                        sum + available * (tier === 'bronze' ? 50 : tier === 'silver' ? 100 : tier === 'gold' ? 200 : tier === 'platinum' ? 400 : 800), 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Potential with Upgrade</h4>
              {upgradeRec && (
                <div className="p-3 rounded-lg border bg-green-50">
                  <p className="text-sm font-medium text-green-800">
                    Unlock ${upgradeRec.unlockedCount * 150} additional value
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ROI: {Math.round((upgradeRec.unlockedCount * 150) / (parseInt(upgradeRec.info.price.replace('$', '')) * 12) * 100)}% annually
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}