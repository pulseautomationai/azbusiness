import { Link } from "react-router";
import { Trophy, MapPin, Award, TrendingUp, Star, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { generateMetaForRoute } from "~/utils/seo-middleware";

const popularCategories = [
  { slug: "heating-and-air-conditioning", name: "HVAC", emoji: "🔥" },
  { slug: "plumbing", name: "Plumbing", emoji: "💧" },
  { slug: "landscaping", name: "Landscaping", emoji: "🌵" },
  { slug: "house-cleaning", name: "House Cleaning", emoji: "✨" },
  { slug: "electrical", name: "Electrical", emoji: "⚡" },
  { slug: "handyman", name: "Handyman", emoji: "🔧" },
];

export function meta() {
  return generateMetaForRoute("rankings");
}

export default function RankingsPage() {
  // Fetch top cities
  const cities = useQuery(api.cities.getCitiesWithCount);
  const topCities = cities?.slice(0, 6) || [];
  
  // Fetch overall top businesses
  const topBusinesses = useQuery(api.rankings.calculateRankings.getTopRankedBusinesses, {
    limit: 5
  });
  
  // Calculate platform stats
  const platformStats = {
    totalRankedBusinesses: topBusinesses?.length || 0,
    averageQualityScore: parseFloat((
      (topBusinesses?.reduce((acc: number, r: any) => acc + r.overallScore, 0) || 0) / 
      (topBusinesses?.length || 1)
    ).toFixed(1)),
    eliteBusinesses: topBusinesses?.filter((r: any) => r.overallScore >= 80).length || 0,
  };

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-agave-cream py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-ocotillo-red/10 px-4 py-2 rounded-full mb-4">
              <Trophy className="h-5 w-5 text-ocotillo-red" />
              <span className="text-sm font-medium text-ocotillo-red">Quality Rankings</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl text-ironwood-charcoal mb-4">
              Arizona Business Rankings
            </h1>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              AI-powered quality rankings for Arizona's service providers. 
              Updated hourly based on customer satisfaction and service excellence.
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-ocotillo-red mb-1">
                  {platformStats.totalRankedBusinesses}
                </div>
                <p className="text-sm text-gray-600">Ranked Businesses</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-cholla-green mb-1">
                  {platformStats.averageQualityScore}
                </div>
                <p className="text-sm text-gray-600">Average Quality Score</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-ironwood-charcoal mb-1">
                  {platformStats.eliteBusinesses}
                </div>
                <p className="text-sm text-gray-600">Elite Providers (80+)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-ironwood-charcoal mb-3">
              Browse Rankings by Category
            </h2>
            <p className="text-gray-600">
              Find top-rated businesses in your service category
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {popularCategories.map((category: any) => (
              <Card 
                key={category.slug}
                className="hover:shadow-lg transition-all duration-300 hover:border-cholla-green/20"
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-3">{category.emoji}</div>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    View top-ranked {category.name.toLowerCase()} providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-cholla-green/20 text-cholla-green hover:bg-cholla-green hover:text-white"
                  >
                    <Link to={`/${category.slug}`}>
                      View Rankings
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/categories"
              className="text-ocotillo-red hover:text-ocotillo-red/80 font-medium"
            >
              View all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by City */}
      <section className="py-12 bg-agave-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-ironwood-charcoal mb-3">
              Browse Rankings by City
            </h2>
            <p className="text-gray-600">
              Discover top service providers in your area
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {topCities.map((city: any) => (
              <Card 
                key={city.slug}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-ironwood-charcoal">
                        {city.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {city.businessCount} businesses
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-ocotillo-red" />
                  </div>
                  
                  <Button 
                    asChild
                    size="sm"
                    className="w-full bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                  >
                    <Link to={`/${city.slug}`}>
                      View City Rankings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/cities"
              className="text-ocotillo-red hover:text-ocotillo-red/80 font-medium"
            >
              View all cities →
            </Link>
          </div>
        </div>
      </section>

      {/* Top Overall Businesses */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-ironwood-charcoal mb-3">
              Top 5 Overall Rankings
            </h2>
            <p className="text-gray-600">
              Arizona's highest-quality service providers across all categories
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {topBusinesses?.map((ranking: any, index: number) => {
              const position = index + 1;
              
              // Mock business data (in real implementation, fetch business details)
              const business = {
                name: `Elite Business ${position}`,
                slug: `/${ranking.category}/${ranking.city}/business-${ranking.businessId}`,
                category: ranking.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                city: ranking.city.charAt(0).toUpperCase() + ranking.city.slice(1),
              };
              
              return (
                <Card 
                  key={ranking.businessId}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                          position === 1 ? 'bg-yellow-100 text-yellow-800' :
                          position === 2 ? 'bg-gray-100 text-gray-800' :
                          position === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {position === 1 && <Trophy className="h-6 w-6" />}
                          {position > 1 && `#${position}`}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-xl text-ironwood-charcoal hover:text-ocotillo-red transition-colors">
                            <Link to={business.slug}>
                              {business.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600">
                            {business.category} • {business.city}
                          </p>
                        </div>
                      </div>
                      
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
                          variant="outline"
                          className="border-ocotillo-red/20 text-ocotillo-red hover:bg-ocotillo-red hover:text-white"
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
        </div>
      </section>

      {/* How Rankings Work */}
      <section className="py-12 bg-gradient-to-b from-agave-cream to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl text-ironwood-charcoal mb-8 text-center">
              How Our Rankings Work
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-ocotillo-red/10 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-ocotillo-red" />
                    </div>
                    <CardTitle>AI-Powered Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our AI analyzes thousands of customer reviews to identify quality indicators 
                    like service excellence, expertise, and customer satisfaction.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-cholla-green/10 p-2 rounded-lg">
                      <Award className="h-5 w-5 text-cholla-green" />
                    </div>
                    <CardTitle>Quality Over Quantity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We focus on the quality of reviews, not just the quantity. Businesses with 
                    genuine excellence rank higher than those with many mediocre reviews.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>6 Quality Categories</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We evaluate businesses across service excellence, customer experience, 
                    technical mastery, value, trust, and operational excellence.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Trophy className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle>Updated Hourly</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Rankings are recalculated every hour to reflect the latest customer feedback 
                    and ensure businesses are recognized for continuous improvement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ironwood-charcoal text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-3xl mb-4">
            Want to Improve Your Ranking?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join Arizona's quality-focused business directory and showcase your excellence 
            with our AI-powered professional profiles.
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