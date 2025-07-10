import { useState, useEffect } from "react";
import { MapPin, Star, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import BusinessCard from "./business-card";

interface CategoryPageContentProps {
  category: {
    name: string;
    slug: string;
    description: string;
    icon?: string;
  };
  businesses: any[];
  cities: any[];
}

// HVAC-specific intro text
const categoryIntros: Record<string, string> = {
  "hvac-services": "Find reliable HVAC specialists in Arizona for repair, installation, and maintenance. Compare top-rated local pros for all your heating and cooling needs. From emergency AC repairs to complete system replacements, our verified contractors provide quality service at competitive prices.",
};

export default function CategoryPageContent({ 
  category, 
  businesses, 
  cities 
}: CategoryPageContentProps) {
  // SSR-safe search params hook usage
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Initialize search params only on client-side
  useEffect(() => {
    const params = useSearchParams();
    setSearchParams(params[0]);
    setSelectedCity(params[0].get("city") || "all");
    setSelectedRating(params[0].get("rating") || "all");
  }, []);

  // Filter businesses
  let filteredBusinesses = [...businesses];

  // City filter
  if (selectedCity !== "all") {
    const cityName = cities.find(c => c.slug === selectedCity)?.name;
    if (cityName) {
      filteredBusinesses = filteredBusinesses.filter(b => b.city === cityName);
    }
  }

  // Rating filter
  if (selectedRating !== "all") {
    const minRating = parseInt(selectedRating);
    filteredBusinesses = filteredBusinesses.filter(b => b.rating >= minRating);
  }

  // Sort businesses
  filteredBusinesses.sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "name":
        return a.name.localeCompare(b.name);
      default: // featured
        if (b.priority !== a.priority) return b.priority - a.priority;
        return b.rating - a.rating;
    }
  });

  const handleCityChange = (city: string) => {
    if (!searchParams) return;
    const newParams = new URLSearchParams(searchParams);
    if (city === "all") {
      newParams.delete("city");
    } else {
      newParams.set("city", city);
    }
    setSearchParams(newParams);
  };

  const handleRatingChange = (rating: string) => {
    if (!searchParams) return;
    const newParams = new URLSearchParams(searchParams);
    if (rating === "all") {
      newParams.delete("rating");
    } else {
      newParams.set("rating", rating);
    }
    setSearchParams(newParams);
  };

  const topCities = cities
    .filter(city => city.businessCount > 0)
    .sort((a, b) => b.businessCount - a.businessCount)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {category.name} in Arizona
            </h1>
          </div>
          <p className="max-w-3xl text-lg text-muted-foreground">
            {categoryIntros[category.slug] || category.description}
          </p>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "Business" : "Businesses"} Found
              </span>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* City Filter */}
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <Separator className="my-1" />
                  {topCities.map((city) => (
                    <SelectItem key={city.slug} value={city.slug}>
                      {city.name} ({city.businessCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={selectedRating} onValueChange={handleRatingChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Star className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Business Grid */}
          {filteredBusinesses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business._id} business={business} />
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <CardContent>
                <p className="text-lg text-muted-foreground">
                  No businesses found matching your filters.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    if (searchParams) {
                      setSearchParams(new URLSearchParams());
                    }
                    setSelectedCity("all");
                    setSelectedRating("all");
                    setSortBy("featured");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {filteredBusinesses.length > 9 && (
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Load More Businesses
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="prose prose-lg mx-auto max-w-3xl dark:prose-invert">
            <h2>Why Choose Local {category.name} Professionals?</h2>
            <p>
              When it comes to {category.name.toLowerCase()}, working with local Arizona professionals ensures you get service from people who understand our unique climate and regional needs. Our verified contractors are licensed, insured, and committed to quality workmanship.
            </p>
            <h3>What to Look for in a {category.name} Provider</h3>
            <ul>
              <li>Valid Arizona contractor's license</li>
              <li>Liability insurance and bonding</li>
              <li>Positive customer reviews and ratings</li>
              <li>Clear pricing and written estimates</li>
              <li>Warranty on parts and labor</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}