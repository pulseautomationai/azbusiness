import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { IconLock, IconTrophy, IconCrown, IconStar } from "@tabler/icons-react";
import { AchievementBadge } from "~/components/ui/achievement-badge";
import type { Doc } from "~/convex/_generated/dataModel";

interface AchievementCardProps {
  achievement: Doc<"achievements">;
  businessTier: string;
}

const tierIcons = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "👑",
  diamond: "💎",
};

const tierColors = {
  bronze: "border-orange-300 bg-orange-50",
  silver: "border-gray-300 bg-gray-50",
  gold: "border-yellow-300 bg-yellow-50",
  platinum: "border-purple-300 bg-purple-50",
  diamond: "border-blue-300 bg-blue-50",
};

export function AchievementCard({ achievement, businessTier }: AchievementCardProps) {
  const isLocked = achievement.tierRequirement !== "free" && 
    (achievement.tierRequirement === "power" && businessTier !== "power") ||
    (achievement.tierRequirement === "pro" && businessTier === "free") ||
    (achievement.tierRequirement === "starter" && businessTier === "free");

  return (
    <Card className={`relative overflow-hidden ${tierColors[achievement.tierLevel]}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <IconLock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Requires {achievement.tierRequirement} plan
            </p>
          </div>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <AchievementBadge
              achievementName={achievement.displayName}
              tier={achievement.tierLevel as "bronze" | "silver" | "gold" | "platinum" | "diamond"}
              size="large"
              context="card"
              category="excellence"
            />
            <div>
              <CardTitle className="text-lg">{achievement.displayName}</CardTitle>
              <Badge variant="outline" className="mt-1 capitalize">
                {achievement.tierLevel} Level
              </Badge>
            </div>
          </div>
          <span className="text-3xl opacity-80">{achievement.badgeIcon}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-3">
          {achievement.description}
        </CardDescription>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Earned</span>
            <span className="font-medium">
              {new Date(achievement.earnedDate).toLocaleDateString()}
            </span>
          </div>
          
          {achievement.scoreRequirements && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Requirements Met:</span>
              <div className="text-xs space-y-1">
                {Object.entries(achievement.scoreRequirements).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}