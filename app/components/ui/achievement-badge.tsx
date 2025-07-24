import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~/lib/utils"

// Tier-based achievement badge variants
const achievementBadgeVariants = cva(
  "relative inline-flex items-center gap-2 font-weight-600 text-shadow-sm transition-all duration-300 cursor-pointer select-none",
  {
    variants: {
      tier: {
        bronze: [
          "px-3 py-1.5 rounded-full",
          "bg-gradient-to-br from-orange-400 to-orange-600",
          "border-2 border-orange-200",
          "text-white text-xs",
          "shadow-md shadow-orange-200/50",
          "hover:shadow-lg hover:shadow-orange-200/60",
          "hover:-translate-y-0.5",
        ],
        silver: [
          "px-4 py-2 rounded-xl",
          "bg-gradient-to-br from-gray-300 to-gray-500",
          "border-2 border-gray-200",
          "text-gray-800 text-sm font-bold",
          "shadow-lg shadow-gray-200/60",
          "hover:shadow-xl hover:shadow-gray-200/70",
          "hover:-translate-y-0.5",
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-45 before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] before:hover:translate-x-[100%] before:transition-transform before:duration-700",
        ],
        gold: [
          "px-5 py-2.5 rounded-2xl",
          "bg-gradient-to-br from-yellow-300 to-yellow-600",
          "border-3 border-yellow-100",
          "text-yellow-900 text-sm font-extrabold",
          "shadow-xl shadow-yellow-200/70",
          "hover:shadow-2xl hover:shadow-yellow-200/80",
          "hover:-translate-y-1",
          "animate-pulse-gold",
        ],
        platinum: [
          "px-6 py-3 rounded-3xl",
          "bg-gradient-to-br from-purple-200 to-purple-400",
          "border-3 border-purple-100",
          "text-purple-900 text-base font-black",
          "shadow-2xl shadow-purple-200/80",
          "hover:shadow-3xl hover:shadow-purple-200/90",
          "hover:-translate-y-1 hover:scale-105",
          "animate-pulse-platinum",
        ],
        diamond: [
          "px-7 py-3.5 rounded-full",
          "bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300",
          "border-4 border-cyan-100",
          "text-blue-900 text-lg font-black",
          "shadow-3xl shadow-cyan-200/90",
          "hover:shadow-4xl hover:shadow-cyan-200/95",
          "hover:-translate-y-1.5 hover:scale-110",
          "animate-rainbow-shimmer",
        ],
      },
      size: {
        small: "text-xs px-2 py-1", // 24px equivalent
        medium: "text-sm px-3 py-1.5", // 32px equivalent  
        large: "text-base px-4 py-2", // 48px equivalent
        hero: "text-lg px-6 py-3", // 64px equivalent
      },
      context: {
        profile: "", // Full display with text
        listing: "", // Medium display
        search: "px-2 py-1 text-xs", // Compact display
        card: "", // Standard card display
      }
    },
    compoundVariants: [
      // Small size overrides for compact displays
      {
        size: "small",
        class: "gap-1 [&>span]:hidden", // Hide text on small badges
      },
      // Search context - ultra compact
      {
        context: "search",
        class: "px-1.5 py-0.5 gap-1 [&>span]:sr-only", // Screen reader only text
      },
    ],
    defaultVariants: {
      tier: "bronze",
      size: "medium",
      context: "profile",
    },
  }
)

const tierIcons = {
  bronze: "🥉",
  silver: "🥈", 
  gold: "🥇",
  platinum: "👑",
  diamond: "💎",
};

const tierEmojis = {
  // Alternative emoji sets for different achievement types
  excellence: {
    bronze: "⭐",
    silver: "🌟", 
    gold: "✨",
    platinum: "💫",
    diamond: "🌠",
  },
  mastery: {
    bronze: "🔧",
    silver: "⚙️",
    gold: "🛠️", 
    platinum: "🔬",
    diamond: "🧬",
  },
  customer: {
    bronze: "❤️",
    silver: "💖",
    gold: "💝",
    platinum: "💎",
    diamond: "👑",
  },
  performance: {
    bronze: "⚡",
    silver: "🚀",
    gold: "💨",
    platinum: "⭐",
    diamond: "🌟",
  },
};

export interface AchievementBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof achievementBadgeVariants> {
  achievementName: string;
  category?: keyof typeof tierEmojis;
  showText?: boolean;
  iconOnly?: boolean;
}

const AchievementBadge = React.forwardRef<HTMLDivElement, AchievementBadgeProps>(
  ({ 
    achievementName, 
    tier = "bronze", 
    size = "medium", 
    context = "profile",
    category = "excellence",
    showText = true, 
    iconOnly = false,
    className, 
    ...props 
  }, ref) => {
    
    const icon = tierEmojis[category]?.[tier] || tierIcons[tier];
    const shouldShowText = showText && !iconOnly && (size !== "small" && context !== "search");
    
    return (
      <div
        ref={ref}
        className={cn(achievementBadgeVariants({ tier, size, context }), className)}
        {...props}
      >
        <span className="text-lg leading-none" role="img" aria-label={`${tier} achievement`}>
          {icon}
        </span>
        {shouldShowText && (
          <span className="truncate font-semibold leading-tight">
            {achievementName}
          </span>
        )}
      </div>
    )
  }
)

AchievementBadge.displayName = "AchievementBadge"

// Badge container for multiple achievements
export interface AchievementShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  achievements: Array<{
    name: string;
    tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
    category?: keyof typeof tierEmojis;
  }>;
  maxDisplay?: number;
  size?: "small" | "medium" | "large" | "hero";
  context?: "profile" | "listing" | "search" | "card";
}

export function AchievementShowcase({ 
  achievements, 
  maxDisplay = 4, 
  size = "medium",
  context = "profile",
  className,
  ...props 
}: AchievementShowcaseProps) {
  const displayedAchievements = achievements.slice(0, maxDisplay);
  const remainingCount = achievements.length - maxDisplay;
  
  return (
    <div 
      className={cn(
        "flex flex-wrap gap-2 items-center",
        context === "search" && "gap-1",
        className
      )}
      {...props}
    >
      {displayedAchievements.map((achievement, index) => (
        <AchievementBadge
          key={`${achievement.name}-${index}`}
          achievementName={achievement.name}
          tier={achievement.tier}
          category={achievement.category}
          size={size}
          context={context}
        />
      ))}
      
      {remainingCount > 0 && (
        <div className={cn(
          "inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium",
          size === "small" && "text-xs px-2 py-1",
          size === "medium" && "text-sm px-3 py-1.5", 
          size === "large" && "text-base px-4 py-2",
          size === "hero" && "text-lg px-6 py-3"
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export { AchievementBadge, achievementBadgeVariants }