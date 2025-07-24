import { useState } from "react";
import { Link, useParams } from "react-router";
import { Star, Trophy, TrendingUp, Award, MapPin, Filter, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";

const categoryEmojis: Record<string, string> = {
  "heating-and-air-conditioning": "🔥",
  "plumbing": "💧",
  "landscaping": "🌵",
  "house-cleaning": "✨",
  "electrical": "⚡",
  "handyman": "🔧",
  "pool-and-spa-services": "🏊",
  "roofing": "🏠",
  "pest-control": "🐛",
  "garage-door-repair": "🚪",
};

const tierColors = {
  power: "bg-purple-100 text-purple-800 border-purple-300",
  pro: "bg-blue-100 text-blue-800 border-blue-300",
  starter: "bg-green-100 text-green-800 border-green-300",
  free: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function CityRankingsPage() {
  const { city } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "movement" | "recent">("score");
  
  // Fetch city data
  const cityData = useQuery(api.cities.getBySlug, { slug: city });
  
  // Fetch all rankings for the city
  const cityRankings = useQuery(
    api.rankings.calculateRankings.getCityRankings,
    cityData ? { city: cityData.slug } : "skip"
  );
  
  // Get unique categories from rankings
  const categories = cityRankings 
    ? Array.from(new Set(cityRankings.map((r: any) => r.category))).sort()
    : [];
  
  // Filter and sort rankings
  const filteredRankings = cityRankings?.filter((ranking: any) => 
    selectedCategory === "all" || ranking.category === selectedCategory
  ).sort((a: any, b: any) => {
    switch (sortBy) {
      case "score":
        return b.overallScore - a.overallScore;
      case "movement":
        const aMovement = a.previousPosition ? a.previousPosition - a.rankingPosition : 0;
        const bMovement = b.previousPosition ? b.previousPosition - b.rankingPosition : 0;
        return bMovement - aMovement;
      case "recent":
        return b.lastCalculated - a.lastCalculated;
      default:
        return 0;
    }
  });

  if (!cityData || !cityRankings) {
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
            <div className="inline-flex items-center gap-2 bg-ocotillo-red/10 px-4 py-2 rounded-full mb-4">
              <Trophy className="h-5 w-5 text-ocotillo-red" />
              <span className="text-sm font-medium text-ocotillo-red">City Rankings</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl text-ironwood-charcoal mb-4">
              {cityData.name} Business Rankings
            </h1>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              AI-powered quality rankings for {cityData.name}'s top service providers, 
              updated hourly based on customer satisfaction and service excellence
            </p>
          </div>

          {/* City Stats */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-ocotillo-red mb-1">
                  {filteredRankings?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Ranked Businesses</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-cholla-green mb-1">
                  {categories.length}
                </div>
                <p className="text-sm text-gray-600">Service Categories</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-ironwood-charcoal mb-1">
                  {filteredRankings?.filter((r: any) => r.overallScore >= 80).length || 0}
                </div>
                <p className="text-sm text-gray-600">Elite Businesses (80+)</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {(
                    (filteredRankings?.reduce((acc: number, r: any) => acc + r.overallScore, 0) || 0) / 
                    (filteredRankings?.length || 1)
                  ).toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Avg Quality Score</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters and Rankings */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {categoryEmojis[category] || "⭐"} {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Quality Score</SelectItem>
                  <SelectItem value="movement">Trending Up</SelectItem>
                  <SelectItem value="recent">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rankings List */}
          <div className="space-y-6">
            {filteredRankings?.map((ranking: any, index: number) => {
              const position = index + 1;
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
                    <div className="flex items-start gap-6">
                      {/* Ranking Position */}
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl ${
                        position === 1 ? 'bg-yellow-100 text-yellow-800' :
                        position === 2 ? 'bg-gray-100 text-gray-800' :
                        position === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {position === 1 && <Trophy className="h-8 w-8" />}
                        {position > 1 && `#${position}`}
                      </div>

                      {/* Business Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-serif text-2xl text-ironwood-charcoal hover:text-ocotillo-red transition-colors">
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

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            {categoryEmojis[ranking.category] || "⭐"} {ranking.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            {business.avgRating || '4.5'} ({business.totalReviews || 0} reviews)
                          </span>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Quality Score</p>
                            <div className="text-2xl font-bold text-ocotillo-red">
                              {ranking.overallScore.toFixed(1)}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Excellence</p>
                            <div className="text-lg font-semibold text-cholla-green">
                              {(ranking.categoryScores?.serviceExcellence || 0).toFixed(1)}/40
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Satisfaction</p>
                            <div className="text-lg font-semibold text-blue-600">
                              {(ranking.categoryScores?.customerExperience || 0).toFixed(1)}/30
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Trust</p>
                            <div className="text-lg font-semibold text-purple-600">
                              {(ranking.categoryScores?.trustworthiness || 0).toFixed(1)}/10
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Value</p>
                            <div className="text-lg font-semibold text-green-600">
                              {(ranking.categoryScores?.valueForMoney || 0).toFixed(1)}/10
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
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
            })}
          </div>

          {/* No Results */}
          {filteredRankings?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No rankings found for the selected criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}