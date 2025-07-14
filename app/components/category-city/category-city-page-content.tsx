import { Link } from "react-router";
import { MapPin, Star, Users, ArrowRight, Building, Phone, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import BusinessCard from "~/components/category/business-card";
import { FeatureGate } from "~/components/FeatureGate";
import { UpgradeCTA } from "~/components/UpgradeCTA";
import type { Doc } from "convex/_generated/dataModel";

interface CategoryCityPageContentProps {
  category: Doc<"categories">;
  city: Doc<"cities">;
  businesses: (Doc<"businesses"> & { category: Doc<"categories"> | null })[];
  categorySlug: string;
  citySlug: string;
}

export default function CategoryCityPageContent({ 
  category, 
  city, 
  businesses, 
  categorySlug, 
  citySlug 
}: CategoryCityPageContentProps) {
  const businessCount = businesses.length;
  const averageRating = businessCount > 0 
    ? (businesses.reduce((sum, b) => sum + b.rating, 0) / businessCount).toFixed(1)
    : "0.0";

  // Sort businesses by plan tier (Power > Pro > Free) and then by rating
  const sortedBusinesses = [...businesses].sort((a, b) => {
    const tierPriority: { [key: string]: number } = { power: 3, pro: 2, free: 1 };
    const aTier = tierPriority[a.planTier] || 0;
    const bTier = tierPriority[b.planTier] || 0;
    
    if (aTier !== bTier) return bTier - aTier;
    return b.rating - a.rating;
  });

  // Get featured businesses (Power tier)
  const featuredBusinesses = sortedBusinesses.filter(b => b.planTier === "power");
  const otherBusinesses = sortedBusinesses.filter(b => b.planTier !== "power");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-agave-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ironwood-charcoal mb-6">
              {category.name} in <span className="text-ocotillo-red">{city.name}</span>
            </h1>
            <p className="text-lg md:text-xl text-ironwood-charcoal/80 mb-8 max-w-3xl mx-auto">
              Find trusted {category.name.toLowerCase()} professionals in {city.name}, Arizona. 
              Compare top-rated local service providers and connect directly with verified businesses.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-ironwood-charcoal">
                <Building className="w-5 h-5 text-cholla-green" />
                <span className="font-semibold">{businessCount}</span>
                <span>Local Businesses</span>
              </div>
              <div className="flex items-center gap-2 text-ironwood-charcoal">
                <Star className="w-5 h-5 text-cholla-green" />
                <span className="font-semibold">{averageRating}</span>
                <span>Average Rating</span>
              </div>
              <div className="flex items-center gap-2 text-ironwood-charcoal">
                <MapPin className="w-5 h-5 text-cholla-green" />
                <span className="font-semibold">{city.name}</span>
                <span>Arizona</span>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg"
                className="px-8 py-3 bg-ocotillo-red text-white hover:bg-ocotillo-red/90 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link to="/claim-business">
                  List Your {category.name} Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="px-8 py-3 border-2 border-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/10 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link to="/categories">
                  Browse All Categories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {businessCount === 0 ? (
            /* No Businesses Found */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Building className="w-16 h-16 text-ironwood-charcoal/40 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-ironwood-charcoal mb-4">
                  No {category.name} businesses found in {city.name}
                </h2>
                <p className="text-ironwood-charcoal/70 mb-8">
                  Be the first to list your {category.name.toLowerCase()} business in {city.name}!
                </p>
                <Button 
                  asChild 
                  size="lg"
                  className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                >
                  <Link to="/claim-business">
                    List Your Business Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Businesses */}
              {featuredBusinesses.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-serif text-2xl md:text-3xl font-medium text-ironwood-charcoal">
                      Featured {category.name} Businesses
                    </h2>
                    <Badge className="bg-ocotillo-red text-white">
                      Premium
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredBusinesses.map((business) => (
                      <BusinessCard key={business._id} business={business as any} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Businesses */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium text-ironwood-charcoal">
                    All {category.name} Businesses in {city.name}
                  </h2>
                  <div className="text-sm text-ironwood-charcoal/70">
                    {businessCount} businesses found
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherBusinesses.map((business) => (
                    <BusinessCard key={business._id} business={business as any} />
                  ))}
                </div>
              </div>

              {/* Upgrade CTA for Business Owners */}
              <div className="bg-agave-cream rounded-xl p-8 text-center">
                <h3 className="font-serif text-2xl font-medium text-ironwood-charcoal mb-4">
                  Own a {category.name} Business in {city.name}?
                </h3>
                <p className="text-ironwood-charcoal/70 mb-6 max-w-2xl mx-auto">
                  Get featured at the top of search results, access AI-powered tools, and connect with more customers. 
                  Upgrade to Power tier for maximum visibility.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                  >
                    <Link to="/claim-business">
                      Claim Your Business
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/10"
                  >
                    <Link to="/pricing">
                      View Pricing Plans
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Related Links */}
      <section className="py-16 bg-agave-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Related Categories */}
            <div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-6">
                Other Services in {city.name}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link 
                      to={`/hvac-services/${citySlug}`}
                      className="block hover:text-ocotillo-red transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">HVAC Services</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link 
                      to={`/plumbing/${citySlug}`}
                      className="block hover:text-ocotillo-red transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Plumbing</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link 
                      to={`/electrical/${citySlug}`}
                      className="block hover:text-ocotillo-red transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Electrical</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Related Cities */}
            <div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-6">
                {category.name} in Other Cities
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link 
                      to={`/${categorySlug}/phoenix`}
                      className="block hover:text-ocotillo-red transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Phoenix</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link 
                      to={`/${categorySlug}/scottsdale`}
                      className="block hover:text-ocotillo-red transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Scottsdale</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Link 
                      to={`/${categorySlug}/mesa`}
                      className="block hover:text-ocotillo-red transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Mesa</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}