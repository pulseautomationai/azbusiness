import { useState } from "react";
import { Link } from "react-router";
import { Star, MapPin, ChevronRight, Trophy, Crown, TrendingUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

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

const championTitles = {
  1: "City Champion",
  2: "Excellence Award",
  3: "Top Performer",
};

const rankBadges = {
  1: { icon: "👑", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  2: { icon: "🥈", color: "bg-gray-100 text-gray-800 border-gray-300" },
  3: { icon: "🥉", color: "bg-orange-100 text-orange-800 border-orange-300" },
};

export default function CityChampionsRanked() {
  const [selectedCity, setSelectedCity] = useState("phoenix");
  
  // Fetch available cities
  const citiesData = useQuery(api.cities.getCities);
  
  // Fetch top ranked businesses for selected city (across all categories)
  const cityRankings = useQuery(api.rankings.calculateRankings.getTopRankedBusinesses, {
    city: selectedCity,
    limit: 8, // Get top 8 to show 2 rows of 4
  });

  // Get top cities for dropdown
  const topCities = citiesData?.slice(0, 10).map(city => ({
    value: city.slug,
    label: city.name,
  })) || [
    { value: "phoenix", label: "Phoenix" },
    { value: "scottsdale", label: "Scottsdale" },
    { value: "tempe", label: "Tempe" },
    { value: "mesa", label: "Mesa" },
  ];

  // Loading state
  if (cityRankings === undefined) {
    return (
      <section className="city-champions py-16 bg-gradient-to-b from-agave-cream to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
              🏆 City Champions
            </h2>
            <p className="text-lg text-ironwood-charcoal/70">
              Loading top-ranked businesses...
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const selectedCityName = topCities.find(c => c.value === selectedCity)?.label || "Phoenix";

  // Group rankings by category and sort by score
  const championsByCategory = new Map<string, typeof cityRankings>();
  cityRankings?.forEach(ranking => {
    if (!championsByCategory.has(ranking.category)) {
      championsByCategory.set(ranking.category, []);
    }
    championsByCategory.get(ranking.category)?.push(ranking);
  });

  // Get top business from each category
  const categoryChampions = Array.from(championsByCategory.entries())
    .map(([category, rankings]) => ({
      category,
      champion: rankings[0], // Top ranked in this category
    }))
    .sort((a, b) => b.champion.overallScore - a.champion.overallScore)
    .slice(0, 8);

  return (
    <section className="city-champions py-16 bg-gradient-to-b from-agave-cream to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-prickly-pear-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-ocotillo-red/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <div className="inline-flex items-center gap-2 bg-ocotillo-red/10 px-4 py-2 rounded-full mb-4">
              <Crown className="h-5 w-5 text-ocotillo-red" />
              <span className="text-sm font-medium text-ocotillo-red">Local Champions</span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
              {selectedCityName}'s Top Ranked Businesses
            </h2>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl">
              The highest-quality service providers in each category, ranked by customer satisfaction
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-ironwood-charcoal/60">Select City:</span>
            <select 
              className="border border-ocotillo-red/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocotillo-red focus:border-transparent bg-white"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {topCities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}, AZ
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Champions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categoryChampions.map(({ category, champion }, index) => {
            const rankPosition = index + 1;
            const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const emoji = categoryEmojis[category] || "⭐";
            
            // Use real business data from the champion ranking
            const business = champion.business;
            if (!business) return null;

            return (
              <div 
                key={`${category}-${champion.businessId}`}
                className="bg-white border-2 border-gray-100 rounded-xl p-5 hover:shadow-xl hover:border-ocotillo-red/20 transition-all duration-300 relative group"
              >
                {/* Rank Badge for top 3 */}
                {rankPosition <= 3 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className={`${rankBadges[rankPosition as keyof typeof rankBadges].color} border font-bold`}>
                      {rankBadges[rankPosition as keyof typeof rankBadges].icon} #{rankPosition}
                    </Badge>
                  </div>
                )}

                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <h4 className="text-sm font-medium text-gray-600">{categoryName}</h4>
                  </div>
                  {champion.previousPosition && champion.previousPosition > champion.rankingPosition && (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>

                {/* Business Name */}
                <h3 className="font-semibold text-lg text-ironwood-charcoal mb-2 group-hover:text-ocotillo-red transition-colors">
                  <Link to={business.slug}>
                    {business.name}
                  </Link>
                </h3>

                {/* Champion Title */}
                <Badge variant="outline" className="mb-3 bg-gradient-to-r from-ocotillo-red/10 to-prickly-pear-pink/10">
                  <Trophy className="h-3 w-3 mr-1" />
                  {championTitles[Math.min(rankPosition, 3) as keyof typeof championTitles]}
                </Badge>

                {/* Quality Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Quality Score</span>
                    <span className="font-bold text-ocotillo-red">{champion.overallScore.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cholla-green to-ocotillo-red h-2 rounded-full transition-all duration-500"
                      style={{ width: `${champion.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Reviews */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-3 w-3 fill-current" 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({business.totalReviews || 0} reviews)
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Excellence</span>
                    <span className="font-medium">{champion.categoryScores?.serviceExcellence || 0}/40</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Satisfaction</span>
                    <span className="font-medium">{champion.categoryScores?.customerExperience || 0}/30</span>
                  </div>
                </div>

                {/* View Profile Button */}
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                >
                  <Link to={business.slug}>
                    View Profile
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* City-wide Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-ocotillo-red mb-1">
                {categoryChampions.length}
              </div>
              <p className="text-sm text-gray-600">Top Categories</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-cholla-green mb-1">
                {(categoryChampions.reduce((acc, c) => acc + c.champion.overallScore, 0) / categoryChampions.length).toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Average Quality Score</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-ironwood-charcoal mb-1">
                {cityRankings?.filter(r => r.overallScore >= 80).length || 0}
              </div>
              <p className="text-sm text-gray-600">Elite Businesses (80+)</p>
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link to={`/${selectedCity}`}>
            <Button size="lg" variant="outline" className="border-ocotillo-red text-ocotillo-red hover:bg-ocotillo-red hover:text-white">
              View All {selectedCityName} Rankings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}