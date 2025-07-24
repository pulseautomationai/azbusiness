import { Star, MapPin, Trophy, TrendingUp, Award, Zap } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

// Achievement type to badge configuration
const achievementBadges = {
  // Service Excellence
  service_excellence: { icon: "⭐", label: "Service Excellence", color: "yellow" },
  fast_response: { icon: "⚡", label: "Lightning Fast", color: "blue" },
  goes_above_beyond: { icon: "🚀", label: "Above & Beyond", color: "purple" },
  
  // Customer Experience
  customer_favorite: { icon: "❤️", label: "Customer Favorite", color: "red" },
  highly_recommended: { icon: "👍", label: "Highly Recommended", color: "green" },
  locally_loved: { icon: "🏠", label: "Locally Loved", color: "orange" },
  
  // Technical Excellence
  expert_technician: { icon: "🔧", label: "Expert Technician", color: "gray" },
  problem_solver: { icon: "💡", label: "Problem Solver", color: "yellow" },
  quality_workmanship: { icon: "🏗️", label: "Quality Work", color: "blue" },
  
  // Value & Trust
  fair_pricing: { icon: "💰", label: "Fair Pricing", color: "green" },
  trusted_professional: { icon: "🛡️", label: "Trusted Pro", color: "blue" },
  honest_transparent: { icon: "🤝", label: "Honest & Clear", color: "purple" },
};

const badgeColorClasses = {
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  green: "bg-green-100 text-green-800 border-green-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  red: "bg-red-100 text-red-800 border-red-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
  gray: "bg-gray-100 text-gray-800 border-gray-300",
};

const rankingPositionBadges = {
  1: { icon: "🥇", label: "#1 Ranked", highlight: true },
  2: { icon: "🥈", label: "#2 Ranked", highlight: true },
  3: { icon: "🥉", label: "#3 Ranked", highlight: true },
};

export default function TopPerformersRanked() {
  // Fetch top 3 ranked businesses across all categories
  const topRankings = useQuery(api.rankings.calculateRankings.getTopRankedBusinesses, { 
    limit: 3 
  });

  // Loading state
  if (topRankings === undefined) {
    return (
      <section className="top-performers bg-gradient-to-b from-white to-agave-cream py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
              🏆 Top Ranked Businesses
            </h2>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              Arizona's highest-quality service providers based on AI-powered analysis of customer satisfaction
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!topRankings || topRankings.length === 0) {
    return null;
  }

  return (
    <section className="top-performers bg-gradient-to-b from-white to-agave-cream py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-prickly-pear-pink/5 to-ocotillo-red/5 pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-ocotillo-red/10 px-4 py-2 rounded-full mb-4">
            <Trophy className="h-5 w-5 text-ocotillo-red" />
            <span className="text-sm font-medium text-ocotillo-red">AI-Powered Rankings</span>
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
            Arizona's Top Ranked Businesses
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Quality-focused rankings updated hourly based on customer satisfaction, service excellence, and proven results
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {topRankings.map((ranking, index) => {
            const position = ranking.position || (index + 1);
            const positionBadge = rankingPositionBadges[position as keyof typeof rankingPositionBadges];
            
            // Use real business data from the ranking
            const business = ranking.business;
            if (!business) return null;
            
            // Get primary achievement from the achievements array
            const primaryAchievement = ranking.achievements && ranking.achievements.length > 0
              ? achievementBadges[ranking.achievements[0].achievementType as keyof typeof achievementBadges] || achievementBadges.service_excellence
              : achievementBadges.service_excellence;
            
            return (
              <div 
                key={ranking.businessId}
                className={`bg-white border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 relative ${
                  positionBadge?.highlight 
                    ? 'border-ocotillo-red/30 hover:border-ocotillo-red/50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Ranking Position Badge */}
                {positionBadge && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-white rounded-full shadow-lg p-3 border-2 border-ocotillo-red/20">
                      <span className="text-2xl">{positionBadge.icon}</span>
                    </div>
                  </div>
                )}

                {/* Quality Score Display */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-ocotillo-red to-prickly-pear-pink text-white px-3 py-1 rounded-full text-sm font-bold">
                      {ranking.overallScore.toFixed(1)}/100
                    </div>
                    <span className="text-xs text-gray-500">Quality Score</span>
                  </div>
                  
                  {/* Achievement Badge */}
                  <Badge 
                    variant="outline" 
                    className={`${badgeColorClasses[primaryAchievement.color as keyof typeof badgeColorClasses]} border`}
                  >
                    <span className="mr-1">{primaryAchievement.icon}</span>
                    <span className="text-xs">{primaryAchievement.label}</span>
                  </Badge>
                </div>

                {/* Business Name */}
                <h3 className="font-serif text-xl text-ironwood-charcoal mb-2 hover:text-ocotillo-red transition-colors">
                  <Link to={business.slug}>
                    {business.name}
                  </Link>
                </h3>

                {/* Category & Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Award className="h-4 w-4" />
                  <span className="capitalize">
                    {business.category?.name?.replace(/-/g, ' ') || ranking.category.replace(/-/g, ' ')}
                  </span>
                  <span className="text-gray-400">•</span>
                  <MapPin className="h-4 w-4" />
                  <span className="capitalize">{business.city || ranking.city}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(business.avgRating || 4.5) ? 'fill-current' : 'fill-none'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {business.avgRating || '4.5'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({business.totalReviews || 0} reviews)
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Service Excellence</span>
                    <div className="flex items-center gap-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cholla-green to-ocotillo-red h-2 rounded-full"
                          style={{ width: `${(ranking.categoryScores?.serviceExcellence || 0) * 2.5}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{ranking.categoryScores?.serviceExcellence || 0}/40</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cholla-green to-ocotillo-red h-2 rounded-full"
                          style={{ width: `${(ranking.categoryScores?.customerExperience || 0) * 3.33}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{ranking.categoryScores?.customerExperience || 0}/30</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    asChild 
                    size="sm"
                    className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90 flex-1"
                  >
                    <Link to={business.slug}>
                      View Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-ocotillo-red/20 text-ocotillo-red hover:bg-ocotillo-red/10"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>

                {/* Ranking Movement Indicator */}
                {ranking.previousPosition && ranking.previousPosition !== ranking.rankingPosition && (
                  <div className="mt-3 flex items-center justify-center">
                    {ranking.previousPosition > ranking.rankingPosition ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        <span>Moved up {ranking.previousPosition - ranking.rankingPosition} spots</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <span>Previously #{ranking.previousPosition}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All Rankings CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600">
              Rankings updated hourly • Quality over quantity approach
            </p>
            <Button
              asChild
              size="lg"
              className="bg-ironwood-charcoal text-white hover:bg-ironwood-charcoal/90"
            >
              <Link to="/rankings">
                View All Rankings
                <TrendingUp className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}