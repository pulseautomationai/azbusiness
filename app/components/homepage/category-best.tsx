import { useState } from "react";
import { Link } from "react-router";
import { Star, Trophy, TrendingUp, Award, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

const popularCategories = [
  { value: "heating-and-air-conditioning", label: "HVAC", icon: "🔥" },
  { value: "plumbing", label: "Plumbing", icon: "💧" },
  { value: "landscaping", label: "Landscaping", icon: "🌵" },
  { value: "house-cleaning", label: "Cleaning", icon: "✨" },
  { value: "electrical", label: "Electrical", icon: "⚡" },
  { value: "handyman", label: "Handyman", icon: "🔧" },
];

const tierColors = {
  power: "bg-purple-100 text-purple-800 border-purple-300",
  pro: "bg-blue-100 text-blue-800 border-blue-300",
  starter: "bg-green-100 text-green-800 border-green-300",
  free: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function CategoryBest() {
  const [selectedCategory, setSelectedCategory] = useState("heating-and-air-conditioning");
  
  // Fetch top businesses for selected category
  const categoryRankings = useQuery(api.rankings.calculateRankings.getTopRankedBusinesses, {
    category: selectedCategory,
    limit: 5,
  });

  // Loading state
  if (categoryRankings === undefined) {
    return (
      <section className="category-best py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
              Best by Category
            </h2>
            <p className="text-lg text-ironwood-charcoal/70">
              Loading top-ranked businesses...
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentCategory = popularCategories.find(c => c.value === selectedCategory);

  return (
    <section className="category-best py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cholla-green/10 px-4 py-2 rounded-full mb-4">
            <Award className="h-5 w-5 text-cholla-green" />
            <span className="text-sm font-medium text-cholla-green">Category Leaders</span>
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
            Best {currentCategory?.label} Services in Arizona
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Top-ranked businesses based on quality scores and customer satisfaction
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
            {popularCategories.map(category => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="flex items-center gap-1 text-xs md:text-sm"
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden md:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {popularCategories.map(category => (
            <TabsContent key={category.value} value={category.value} className="space-y-4">
              {/* Top 5 Rankings */}
              {categoryRankings && categoryRankings.length > 0 ? (
                <div className="space-y-4">
                  {categoryRankings.map((ranking, index) => {
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
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
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
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-semibold text-xl text-ironwood-charcoal hover:text-ocotillo-red transition-colors">
                                      <Link to={business.slug}>
                                        {business.name}
                                      </Link>
                                    </h3>
                                    
                                    {/* Plan Tier Badge */}
                                    <Badge variant="outline" className={`${tierColors[(business.planTier || 'free') as keyof typeof tierColors]} text-xs`}>
                                      {business.planTier || 'free'}
                                    </Badge>
                                    
                                    {/* Movement Indicator */}
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
                                  
                                  <p className="text-sm text-gray-600 mb-2">
                                    {business.city || ranking.city} • {business.totalReviews || 0} reviews
                                  </p>
                                </div>
                              </div>

                              {/* Metrics Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Quality Score</p>
                                  <div className="flex items-center gap-2">
                                    <div className="text-lg font-bold text-ocotillo-red">
                                      {ranking.overallScore.toFixed(1)}
                                    </div>
                                    <span className="text-xs text-gray-500">/100</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Excellence</p>
                                  <div className="text-lg font-bold text-cholla-green">
                                    {ranking.categoryScores?.serviceExcellence || 0}
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Satisfaction</p>
                                  <div className="text-lg font-bold text-blue-600">
                                    {ranking.categoryScores?.customerExperience || 0}
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Rating</p>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="text-lg font-bold">{business.avgRating || '4.5'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bars */}
                              <div className="space-y-2">
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Service Quality</span>
                                    <span>{Math.round((ranking.categoryScores?.serviceExcellence || 0) * 2.5)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-gradient-to-r from-cholla-green to-ocotillo-red h-1.5 rounded-full"
                                      style={{ width: `${(ranking.categoryScores?.serviceExcellence || 0) * 2.5}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="ml-4">
                              <Button 
                                asChild
                                variant="outline"
                                className="border-ocotillo-red/20 text-ocotillo-red hover:bg-ocotillo-red hover:text-white"
                              >
                                <Link to={business.slug}>
                                  View
                                  <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-600">No rankings available for this category yet.</p>
                  </CardContent>
                </Card>
              )}

              {/* View All CTA */}
              <div className="text-center mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-ironwood-charcoal text-white hover:bg-ironwood-charcoal/90"
                >
                  <Link to={`/${category.value}`}>
                    View All {category.label} Rankings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}