import { useState } from "react";
import { Link, useParams } from "react-router";
import { Star, Trophy, TrendingUp, Award, MapPin, Filter, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";

const categoryInfo: Record<string, { emoji: string; description: string }> = {
  "heating-and-air-conditioning": {
    emoji: "🔥",
    description: "Arizona's top-rated HVAC contractors for cooling and heating services"
  },
  "plumbing": {
    emoji: "💧",
    description: "Professional plumbers specializing in repairs, installations, and emergencies"
  },
  "landscaping": {
    emoji: "🌵",
    description: "Desert landscaping experts creating beautiful, water-efficient outdoor spaces"
  },
  "house-cleaning": {
    emoji: "✨",
    description: "Trusted cleaning services for homes and businesses across Arizona"
  },
  "electrical": {
    emoji: "⚡",
    description: "Licensed electricians for residential and commercial electrical work"
  },
  "handyman": {
    emoji: "🔧",
    description: "Skilled handymen for home repairs, maintenance, and improvements"
  },
  "pool-and-spa-services": {
    emoji: "🏊",
    description: "Pool and spa maintenance, repair, and installation specialists"
  },
  "roofing": {
    emoji: "🏠",
    description: "Roofing contractors for repairs, replacements, and storm damage"
  },
  "pest-control": {
    emoji: "🐛",
    description: "Pest control services keeping Arizona homes and businesses pest-free"
  },
  "garage-door-repair": {
    emoji: "🚪",
    description: "Garage door installation, repair, and maintenance professionals"
  },
};

const tierColors = {
  power: "bg-purple-100 text-purple-800 border-purple-300",
  pro: "bg-blue-100 text-blue-800 border-blue-300",
  starter: "bg-green-100 text-green-800 border-green-300",
  free: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function CategoryRankingsPage() {
  const { category } = useParams();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"rankings" | "insights">("rankings");
  
  // Fetch category rankings
  const categoryRankings = useQuery(
    api.rankings.calculateRankings.getCategoryRankings,
    category ? { category } : "skip"
  );
  
  // Fetch available cities
  const cities = useQuery(api.cities.getCities);
  
  // Get category info
  const catInfo = categoryInfo[category || ""] || { 
    emoji: "⭐", 
    description: "Top-rated service providers in this category" 
  };
  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Category";
  
  // Filter rankings by city
  const filteredRankings = categoryRankings?.filter((ranking: any) => 
    selectedCity === "all" || ranking.city === selectedCity
  );
  
  // Calculate category insights
  const insights = {
    totalBusinesses: filteredRankings?.length || 0,
    averageScore: parseFloat((
      (filteredRankings?.reduce((acc: number, r: any) => acc + r.overallScore, 0) || 0) / 
      (filteredRankings?.length || 1)
    ).toFixed(1)),
    eliteBusinesses: filteredRankings?.filter((r: any) => r.overallScore >= 80).length || 0,
    topCities: cities?.slice(0, 5).map((city: any) => ({
      name: city.name,
      count: categoryRankings?.filter((r: any) => r.city === city.slug).length || 0,
      avgScore: parseFloat((
        (categoryRankings?.filter((r: any) => r.city === city.slug)
          .reduce((acc: number, r: any) => acc + r.overallScore, 0) || 0) / 
        (categoryRankings?.filter((r: any) => r.city === city.slug).length || 1)
      ).toFixed(1))
    })) || []
  };

  if (!categoryRankings) {
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
              <span className="text-sm font-medium text-cholla-green">Category Rankings</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl text-ironwood-charcoal mb-4">
              Best {categoryName} Services in Arizona
            </h1>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              {catInfo.description}
            </p>
          </div>

          {/* Category Stats */}
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
                  {cities?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Cities Served</p>
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
              <TabsTrigger value="insights">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Rankings Tab */}
            <TabsContent value="rankings" className="space-y-6">
              {/* City Filter */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Filter by City:
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities?.map((city: any) => (
                      <SelectItem key={city.slug} value={city.slug}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rankings List */}
              <div className="space-y-4">
                {filteredRankings?.map((ranking: any, index: number) => {
                  const position = index + 1;
                  const isTopThree = position <= 3;
                  
                  // Mock business data (in real implementation, fetch business details)
                  const business = {
                    name: `${categoryName} Pro ${ranking.businessId}`,
                    slug: `/${category}/${ranking.city}/business-${ranking.businessId}`,
                    rating: 4.5 + (0.1 * Math.random()),
                    reviewCount: 100 + Math.floor(Math.random() * 200),
                    planTier: position <= 5 ? "power" : position <= 10 ? "pro" : "starter",
                  };

                  return (
                    <Card 
                      key={ranking.businessId}
                      className={`hover:shadow-lg transition-all duration-300 ${
                        isTopThree ? 'border-2 border-cholla-green/20' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Ranking Position */}
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                              position === 1 ? 'bg-yellow-100 text-yellow-800' :
                              position === 2 ? 'bg-gray-100 text-gray-800' :
                              position === 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {position === 1 && <Trophy className="h-6 w-6" />}
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
                                
                                <Badge variant="outline" className={`${tierColors[business.planTier as keyof typeof tierColors]}`}>
                                  {business.planTier}
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

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {ranking.city.charAt(0).toUpperCase() + ranking.city.slice(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  {business.rating} ({business.reviewCount} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Metrics and Action */}
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-gray-600 mb-1">Quality Score</p>
                              <div className="text-2xl font-bold text-ocotillo-red">
                                {ranking.overallScore.toFixed(1)}
                              </div>
                            </div>
                            
                            <Button 
                              asChild
                              size="sm"
                              className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                            >
                              <Link to={business.slug}>
                                View
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* No Results */}
              {filteredRankings?.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-600">No {categoryName} businesses found in the selected city.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Top Cities by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Cities for {categoryName}</CardTitle>
                  <CardDescription>
                    Cities with the highest concentration of quality {categoryName.toLowerCase()} providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.topCities.map((city: any, index: number) => (
                      <div key={city.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{city.name}</p>
                            <p className="text-sm text-gray-600">{city.count} businesses</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Avg Score</p>
                          <p className="font-bold text-lg">{city.avgScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of businesses by quality score ranges
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
                      const count = categoryRankings?.filter((r: any) => {
                        const score = r.overallScore;
                        if (tier.range === "90-100") return score >= 90;
                        if (tier.range === "80-89") return score >= 80 && score < 90;
                        if (tier.range === "70-79") return score >= 70 && score < 80;
                        if (tier.range === "60-69") return score >= 60 && score < 70;
                        return score < 60;
                      }).length || 0;
                      
                      const percentage = (count / (categoryRankings?.length || 1)) * 100;
                      
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

              {/* Category Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Choosing a {categoryName} Provider</CardTitle>
                  <CardDescription>
                    What to look for when selecting a service provider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-ocotillo-red mt-0.5" />
                      <div>
                        <p className="font-medium">Quality Score Above 80</p>
                        <p className="text-sm text-gray-600">
                          Businesses with scores above 80 consistently deliver excellent service
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Check Recent Reviews</p>
                        <p className="text-sm text-gray-600">
                          Look for businesses with consistent positive feedback over time
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Rising Rankings</p>
                        <p className="text-sm text-gray-600">
                          Businesses moving up in rankings show continuous improvement
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-agave-cream">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-ironwood-charcoal mb-4">
            Are You a {categoryName} Professional?
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 mb-6 max-w-2xl mx-auto">
            Join Arizona's quality-focused business directory and showcase your excellence
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