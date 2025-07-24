import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconMinus,
  IconCrown,
  IconStar,
  IconChartBar
} from "@tabler/icons-react";
import type { Doc } from "~/convex/_generated/dataModel";

interface RankingDisplayProps {
  ranking?: any; // The business's ranking data
  business: Doc<"businesses">;
  competitors: any[]; // Other businesses in the same category/city
}

export function RankingDisplay({ ranking, business, competitors }: RankingDisplayProps) {
  if (!ranking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Ranking Data Available</CardTitle>
          <CardDescription>
            Rankings are calculated based on customer reviews and service quality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start earning positive reviews to appear in rankings!
          </p>
        </CardContent>
      </Card>
    );
  }

  const movementIcon = ranking.previousPosition ? (
    ranking.previousPosition > ranking.rankingPosition ? (
      <IconTrendingUp className="h-4 w-4 text-green-500" />
    ) : ranking.previousPosition < ranking.rankingPosition ? (
      <IconTrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <IconMinus className="h-4 w-4 text-gray-400" />
    )
  ) : null;

  const movement = ranking.previousPosition ? 
    Math.abs(ranking.previousPosition - ranking.rankingPosition) : 0;

  // Score breakdown using actual category scores
  const categoryScores = ranking.categoryScores || {};
  const scoreBreakdown = [
    { 
      label: "Quality Indicators", 
      score: Math.round((categoryScores.qualityIndicators || 0) * 2.5), 
      max: 25,
      description: "Excellence, first-time success, attention to detail"
    },
    { 
      label: "Service Excellence", 
      score: Math.round((categoryScores.serviceExcellence || 0) * 2), 
      max: 20,
      description: "Professionalism, communication, expertise"
    },
    { 
      label: "Customer Experience", 
      score: Math.round((categoryScores.customerExperience || 0) * 2), 
      max: 20,
      description: "Emotional impact, business value, relationships"
    },
    { 
      label: "Business Performance", 
      score: Math.round((categoryScores.businessPerformance || 0) * 1.5), 
      max: 15,
      description: "Response speed, value delivery, problem resolution"
    },
    { 
      label: "Competitive Advantage", 
      score: Math.round((categoryScores.competitiveMarkers || 0)), 
      max: 10,
      description: "Market position, differentiation"
    },
    { 
      label: "Industry Specific", 
      score: Math.round((categoryScores.industrySpecific || 0)), 
      max: 10,
      description: "Category-specific expertise"
    },
  ];

  return (
    <div className="space-y-4">
      {/* Current Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Ranking</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">#{ranking.rankingPosition}</span>
              {movementIcon}
              {movement > 0 && (
                <Badge variant="outline" className="text-xs">
                  {ranking.previousPosition > ranking.rankingPosition ? '+' : '-'}{movement}
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            In {ranking.category} • {ranking.city}, AZ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Quality Score</span>
                <span className="text-2xl font-bold">{ranking.overallScore.toFixed(1)}/100</span>
              </div>
              <Progress value={ranking.overallScore} className="h-3" />
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Score Breakdown</p>
              {scoreBreakdown.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="font-medium ml-2">{item.score}/{item.max}</span>
                  </div>
                  <Progress 
                    value={(item.score / item.max) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>

            {/* Confidence Multiplier */}
            {ranking.reviewsAnalyzed && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Reviews Analyzed</span>
                  <span className="font-medium">{ranking.reviewsAnalyzed}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Confidence Score</span>
                  <span className="font-medium">{ranking.confidenceScore}%</span>
                </div>
              </div>
            )}

            {/* Tier Bonus */}
            {ranking.tierMultiplier && ranking.tierMultiplier > 1 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Plan Tier Bonus</span>
                <Badge variant="secondary">+{((ranking.tierMultiplier - 1) * 100).toFixed(0)}%</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Competitors</CardTitle>
          <CardDescription>
            Other businesses in {business.category?.name} • {business.city}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitors.slice(0, 5).map((competitor, index) => {
              const isCurrentBusiness = competitor.businessId === business._id;
              return (
                <div 
                  key={competitor.businessId} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentBusiness ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">
                      #{competitor.rankingPosition}
                    </div>
                    <div>
                      <p className="font-medium">
                        {isCurrentBusiness ? business.name : `Competitor ${index + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {competitor.overallScore.toFixed(1)}/100
                      </p>
                    </div>
                  </div>
                  {competitor.rankingPosition === 1 && (
                    <IconCrown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5" />
            Ranking Improvement Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryScores.qualityIndicators < 7 && (
              <div className="flex items-start gap-2">
                <IconStar className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Focus on Service Excellence</p>
                  <p className="text-xs text-muted-foreground">
                    Exceed expectations and ensure first-time success to boost quality scores
                  </p>
                </div>
              </div>
            )}
            {categoryScores.customerExperience < 7 && (
              <div className="flex items-start gap-2">
                <IconTrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Enhance Customer Experience</p>
                  <p className="text-xs text-muted-foreground">
                    Build stronger relationships and create lasting positive impacts
                  </p>
                </div>
              </div>
            )}
            {categoryScores.businessPerformance < 6 && (
              <div className="flex items-start gap-2">
                <IconChartBar className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Improve Response Times</p>
                  <p className="text-xs text-muted-foreground">
                    Offer same-day service and transparent pricing for better performance scores
                  </p>
                </div>
              </div>
            )}
            {ranking.reviewsAnalyzed < 20 && (
              <div className="flex items-start gap-2">
                <IconCrown className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Gather More Reviews</p>
                  <p className="text-xs text-muted-foreground">
                    More reviews increase confidence in your ranking (currently {ranking.reviewsAnalyzed} reviews)
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}