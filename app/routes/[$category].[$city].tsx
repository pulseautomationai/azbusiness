import { useState } from "react";
import { Link, useParams } from "react-router";
import { Star, Trophy, TrendingUp, Award, MapPin, Filter, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { generateMetaForRoute } from "~/utils/seo-middleware";

const categoryInfo: Record<string, { emoji: string; description: string }> = {
  "heating-and-air-conditioning": {
    emoji: "🔥",
    description: "HVAC contractors for cooling and heating services"
  },
  "plumbing": {
    emoji: "💧",
    description: "Professional plumbers for repairs, installations, and emergencies"
  },
  "landscaping": {
    emoji: "🌵",
    description: "Desert landscaping experts creating beautiful outdoor spaces"
  },
  "house-cleaning": {
    emoji: "✨",
    description: "Trusted cleaning services for homes and businesses"
  },
  "electrical": {
    emoji: "⚡",
    description: "Licensed electricians for residential and commercial work"
  },
  "handyman": {
    emoji: "🔧",
    description: "Skilled handymen for home repairs and improvements"
  },
  "pool-and-spa-services": {
    emoji: "🏊",
    description: "Pool and spa maintenance, repair, and installation"
  },
  "roofing": {
    emoji: "🏠",
    description: "Roofing contractors for repairs and replacements"
  },
  "pest-control": {
    emoji: "🐛",
    description: "Pest control services keeping homes pest-free"
  },
  "garage-door-repair": {
    emoji: "🚪",
    description: "Garage door installation and maintenance"
  },
};

const tierColors = {
  power: "bg-purple-100 text-purple-800 border-purple-300",
  pro: "bg-blue-100 text-blue-800 border-blue-300",
  starter: "bg-green-100 text-green-800 border-green-300",
  free: "bg-gray-100 text-gray-800 border-gray-300",
};

// Achievement badges configuration
const achievementBadges = {
  service_excellence: { icon: "⭐", label: "Service Excellence", color: "yellow" },
  fast_response: { icon: "⚡", label: "Lightning Fast", color: "blue" },
  goes_above_beyond: { icon: "🚀", label: "Above & Beyond", color: "purple" },
  customer_favorite: { icon: "❤️", label: "Customer Favorite", color: "red" },
  highly_recommended: { icon: "👍", label: "Highly Recommended", color: "green" },
  locally_loved: { icon: "🏠", label: "Locally Loved", color: "orange" },
  expert_technician: { icon: "🔧", label: "Expert Technician", color: "gray" },
  problem_solver: { icon: "💡", label: "Problem Solver", color: "yellow" },
  quality_workmanship: { icon: "🏗️", label: "Quality Work", color: "blue" },
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

export function meta({ params }: { params: Record<string, string | undefined> }) {
  const { category, city } = params;
  return generateMetaForRoute("category-city-rankings", { category, city });
}

export default function CategoryCityRankingsPage() {
  const { category, city } = useParams();
  const [activeTab, setActiveTab] = useState<"rankings" | "overview">("rankings");
  
  // Fetch city data
  const cityData = useQuery(api.cities.getBySlug, { slug: city || "" });
  
  // Fetch category data
  const categoryData = useQuery(api.categories.getCategoryBySlug, { slug: category || "" });
  
  // Fetch rankings for this category+city combination
  const rankings = useQuery(
    api.rankings.calculateRankings.getTopRankedBusinesses,
    cityData && categoryData ? { 
      category: category,
      city: city,
      limit: 50 
    } : "skip"
  );
  
  // Get category info
  const catInfo = categoryInfo[category || ""] || { 
    emoji: "⭐", 
    description: "Top-rated service providers" 
  };
  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Category";
  const cityName = cityData?.name || city?.charAt(0).toUpperCase() + city?.slice(1);
  
  // Calculate insights
  const insights = {
    totalBusinesses: rankings?.length || 0,
    averageScore: Math.round(
      (rankings?.reduce((acc: number, r: any) => acc + r.overallScore, 0) || 0) / 
      (rankings?.length || 1)
    ),
    eliteBusinesses: rankings?.filter((r: any) => r.overallScore >= 80).length || 0,
    topPerformer: rankings?.[0],
  };

  if (!cityData || !categoryData || !rankings) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-agave-cream py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h1 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
                Loading Rankings...
              </h1>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-agave-cream py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cholla-green/10 px-4 py-2 rounded-full mb-4">
              <span className="text-2xl">{catInfo.emoji}</span>
              <span className="text-sm font-medium text-cholla-green">{cityName} Rankings</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl text-ironwood-charcoal mb-4">
              Best {categoryName} in {cityName}
            </h1>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              {catInfo.description} in {cityName}, ranked by quality and customer satisfaction
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-ocotillo-red mb-1">
                  {insights.totalBusinesses}
                </div>
                <p className="text-sm text-gray-600">Ranked Businesses</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-cholla-green mb-1">
                  {insights.averageScore}
                </div>
                <p className="text-sm text-gray-600">Average Score</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-ironwood-charcoal mb-1">
                  {insights.eliteBusinesses}
                </div>
                <p className="text-sm text-gray-600">Elite Providers (80+)</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  #{rankings?.findIndex((r: any) => r.overallScore >= 80) + 1 || 1}
                </div>
                <p className="text-sm text-gray-600">Top Rank</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-8">
              <TabsTrigger value="rankings">
                <Trophy className="h-4 w-4 mr-2" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
            </TabsList>

            {/* Rankings Tab */}
            <TabsContent value="rankings" className="space-y-4">
              {rankings && rankings.length > 0 ? (
                rankings.map((ranking: any, index: number) => {
                  const position = ranking.position || (index + 1);
                  const isTopThree = position <= 3;
                  
                  // Use real business data from the ranking
                  const business = ranking.business;
                  if (!business) return null;

                  return (
                    <Card 
                      key={ranking.businessId}
                      className={`hover:shadow-lg transition-all duration-300 ${
                        isTopThree ? 'border-2 border-ocotillo-red/20' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Ranking Position */}
                            <div className={`flex items-center justify-center w-14 h-14 rounded-full font-bold text-xl ${
                              position === 1 ? 'bg-yellow-100 text-yellow-800' :
                              position === 2 ? 'bg-gray-100 text-gray-800' :
                              position === 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {position === 1 && <Trophy className="h-7 w-7" />}
                              {position > 1 && `#${position}`}
                            </div>

                            {/* Business Info */}
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-xl text-ironwood-charcoal hover:text-ocotillo-red transition-colors">
                                  <Link to={business.slug}>
                                    {business.name}
                                  </Link>
                                </h3>
                                
                                <Badge variant="outline" className={`${tierColors[(business.planTier || 'free') as keyof typeof tierColors]}`}>
                                  {business.planTier || 'free'}
                                </Badge>
                                
                                {ranking.previousPosition && ranking.previousPosition !== ranking.rankingPosition && (
                                  <div className="flex items-center gap-1">
                                    {ranking.previousPosition > ranking.rankingPosition ? (
                                      <TrendingUp className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                                    )}
                                    <span className="text-xs text-gray-600">
                                      {Math.abs(ranking.previousPosition - ranking.rankingPosition)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                    {business.avgRating || '4.5'} ({business.totalReviews || 0} reviews)
                                  </span>
                                </div>
                                
                                {/* Achievement Badges */}
                                {ranking.achievements && ranking.achievements.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {ranking.achievements.slice(0, 2).map((achievement: any) => {
                                      const badgeInfo = achievementBadges[achievement.achievementType as keyof typeof achievementBadges];
                                      if (!badgeInfo) return null;
                                      return (
                                        <Badge 
                                          key={achievement._id}
                                          variant="outline" 
                                          className={`${badgeColorClasses[badgeInfo.color as keyof typeof badgeColorClasses]} border text-xs`}
                                        >
                                          <span className="mr-1">{badgeInfo.icon}</span>
                                          <span>{badgeInfo.label}</span>
                                        </Badge>
                                      );
                                    })}
                                    {ranking.achievements.length > 2 && (
                                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                                        +{ranking.achievements.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Metrics and Action */}
                          <div className="flex items-center gap-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-xs text-gray-600">Quality</p>
                                <p className="text-lg font-bold text-ocotillo-red">
                                  {ranking.overallScore.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Excellence</p>
                                <p className="text-lg font-semibold text-cholla-green">
                                  {(ranking.categoryScores?.serviceExcellence || 0).toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Trust</p>
                                <p className="text-lg font-semibold text-blue-600">
                                  {(ranking.categoryScores?.trustworthiness || 0).toFixed(1)}
                                </p>
                              </div>
                            </div>
                            
                            <Button 
                              asChild
                              className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                            >
                              <Link to={business.slug}>
                                View Profile
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-600">No {categoryName} businesses found in {cityName} yet.</p>
                    <Button asChild className="mt-4">
                      <Link to="/add-business">Add Your Business</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Top Performer Spotlight */}
              {insights.topPerformer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top {categoryName} in {cityName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Business Name</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Quality Score: {insights.topPerformer.overallScore.toFixed(1)}/100</span>
                          <span>•</span>
                          <span>Service Excellence: {(insights.topPerformer.categoryScores?.serviceExcellence || 0).toFixed(1)}/40</span>
                        </div>
                      </div>
                      <Button asChild>
                        <Link to={`/${category}/${city}/business-${insights.topPerformer.businessId}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quality Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>
                    How {categoryName} businesses in {cityName} score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { range: "90-100", label: "Elite", color: "bg-purple-500" },
                      { range: "80-89", label: "Excellent", color: "bg-green-500" },
                      { range: "70-79", label: "Good", color: "bg-blue-500" },
                      { range: "60-69", label: "Average", color: "bg-yellow-500" },
                      { range: "Below 60", label: "Needs Improvement", color: "bg-gray-400" },
                    ].map(tier => {
                      const count = rankings?.filter((r: any) => {
                        const score = r.overallScore;
                        if (tier.range === "90-100") return score >= 90;
                        if (tier.range === "80-89") return score >= 80 && score < 90;
                        if (tier.range === "70-79") return score >= 70 && score < 80;
                        if (tier.range === "60-69") return score >= 60 && score < 70;
                        return score < 60;
                      }).length || 0;
                      
                      const percentage = (count / (rankings?.length || 1)) * 100;
                      
                      return (
                        <div key={tier.range}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">{tier.label} ({tier.range})</span>
                            <span>{count} businesses</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${tier.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Finding the Right {categoryName} in {cityName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-ocotillo-red mt-0.5" />
                      <div>
                        <p className="font-medium">Look for Quality Score 80+</p>
                        <p className="text-sm text-gray-600">
                          These businesses consistently deliver excellent service
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Check Ranking Movement</p>
                        <p className="text-sm text-gray-600">
                          Rising businesses show continuous improvement
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Read Recent Reviews</p>
                        <p className="text-sm text-gray-600">
                          Look for consistent positive feedback over time
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation Links */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to={`/${category}`}>
                View All {categoryName} in Arizona
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/${city}`}>
                View All Businesses in {cityName}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-agave-cream">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-ironwood-charcoal mb-4">
            Are You a {categoryName} Professional in {cityName}?
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 mb-6 max-w-2xl mx-auto">
            Join Arizona's quality-focused business directory and get ranked based on customer satisfaction
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
          >
            <Link to="/claim-business">
              Claim Your Business
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}