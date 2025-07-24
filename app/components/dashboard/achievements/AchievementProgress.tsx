import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { IconTrendingUp, IconLock } from "@tabler/icons-react";
import type { Doc } from "~/convex/_generated/dataModel";

interface AchievementProgressProps {
  progress: Doc<"achievementProgress">;
  businessTier: string;
}

const tierIcons = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "👑",
  diamond: "💎",
};

export function AchievementProgress({ progress, businessTier }: AchievementProgressProps) {
  const achievementName = progress.achievementType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  const tierLevel = progress.tierLevel || "bronze";
  const tierRequirement = progress.tierRequirement || "free";
  
  const isLocked = tierRequirement !== "free" && 
    (tierRequirement === "power" && businessTier !== "power") ||
    (tierRequirement === "pro" && businessTier === "free") ||
    (tierRequirement === "starter" && businessTier === "free");

  const progressPercentage = Math.min(100, Math.max(0, progress.currentProgress));
  const isNearCompletion = progressPercentage >= 80;

  return (
    <Card className={`relative ${isNearCompletion ? 'ring-2 ring-green-400' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <IconLock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Upgrade to {tierRequirement} plan to unlock
            </p>
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tierIcons[tierLevel]}</span>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {achievementName}
                {isNearCompletion && (
                  <Badge variant="default" className="bg-green-500">
                    Almost There!
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {progress.category} Achievement • {tierLevel}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Progress value={progressPercentage} className="h-3 mb-4" />
        
        {progress.milestones && progress.milestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Milestones:</p>
            <div className="space-y-1">
              {progress.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                    {milestone.description}
                  </span>
                  <Badge variant={milestone.completed ? 'default' : 'outline'}>
                    {milestone.completed ? '✓' : milestone.progress + '%'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          Last updated: {new Date(progress.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}