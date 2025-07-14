import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import BusinessCard from "~/components/category/business-card";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Search, MapPin, Filter, SortAsc } from "lucide-react";
import type { Route } from "./+types/search";

export function meta({ params }: Route.MetaArgs) {
  const title = "Search Results - AZ Business Services";
  const description = "Find trusted service providers in Arizona. Browse verified local businesses and get matched with the right professionals for your needs.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service") || "";
  const zipcode = searchParams.get("zipcode") || "";
  const radiusParam = searchParams.get("radius");
  
  const [radius, setRadius] = useState(radiusParam ? parseInt(radiusParam) : 25);
  const [sortBy, setSortBy] = useState("relevance");

  // Search results from Convex
  const searchResults = useQuery(
    service ? api.businesses.searchBusinessesByZipcode : "skip",
    {
      service,
      zipcode: zipcode || undefined,
      radius,
      limit: 50,
    }
  );

  const isLoading = searchResults === undefined;
  const hasResults = searchResults && searchResults.length > 0;

  // Sort results based on selected option
  const sortedResults = searchResults ? [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return (a.distance || 0) - (b.distance || 0);
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0; // Keep original order (relevance/plan tier)
    }
  }) : [];

  const handleRadiusChange = (newRadius: string) => {
    setRadius(parseInt(newRadius));
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set("radius", newRadius);
    window.history.replaceState({}, "", `?${newParams.toString()}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Search className="h-4 w-4" />
              <span>Search Results</span>
              {zipcode && (
                <>
                  <span>•</span>
                  <MapPin className="h-4 w-4" />
                  <span>{zipcode}</span>
                </>
              )}
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight">
              {service} Services
              {zipcode && ` near ${zipcode}`}
            </h1>
            
            {!isLoading && (
              <p className="text-muted-foreground mt-2">
                {hasResults ? (
                  <>Found {searchResults.length} service provider{searchResults.length !== 1 ? 's' : ''}</>
                ) : (
                  "No results found"
                )}
                {zipcode && radius && ` within ${radius} miles`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Distance Filter */}
                  {zipcode && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Distance
                      </label>
                      <Select value={radius.toString()} onValueChange={handleRadiusChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Within 5 miles</SelectItem>
                          <SelectItem value="10">Within 10 miles</SelectItem>
                          <SelectItem value="25">Within 25 miles</SelectItem>
                          <SelectItem value="50">Within 50 miles</SelectItem>
                          <SelectItem value="100">Within 100 miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sort Options */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sort by
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        {zipcode && <SelectItem value="distance">Distance</SelectItem>}
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Search Tips */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Search Tips</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Try different service keywords</li>
                      <li>• Expand your search radius</li>
                      <li>• Check similar service categories</li>
                      <li>• Look for verified providers</li>
                    </ul>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Sorted by {sortBy}
                  </span>
                  {zipcode && sortBy === "relevance" && (
                    <Badge variant="outline" className="text-xs">
                      Power & Pro listings prioritized
                    </Badge>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && hasResults && (
                <div className="grid gap-6 md:grid-cols-2">
                  {sortedResults.map((business) => (
                    <div key={business._id} className="relative">
                      <BusinessCard business={business} />
                      {zipcode && business.distance !== undefined && (
                        <div className={`absolute ${business.featured ? 'top-12' : 'top-3'} right-3`}>
                          <Badge variant="secondary" className="text-xs">
                            {business.distance.toFixed(1)} mi
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && !hasResults && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-6">
                      We couldn't find any {service.toLowerCase()} services
                      {zipcode && ` near ${zipcode}`}. Try:
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Expanding your search radius</p>
                      <p>• Using different keywords (e.g., "plumber" instead of "plumbing")</p>
                      <p>• Checking nearby ZIP codes</p>
                      <p>• Browsing our service categories</p>
                    </div>
                    <div className="mt-6 space-x-4">
                      <Button asChild>
                        <a href="/categories">Browse Categories</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/">New Search</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}