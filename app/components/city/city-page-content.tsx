import { useState } from "react";
import { MapPin, Users, Building2, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import BusinessCard from "../category/business-card";

interface CityPageContentProps {
  city: {
    name: string;
    slug: string;
    region: string;
    description?: string;
    population?: number;
  };
  businesses: any[];
  categories: any[];
}

// Mesa-specific intro text
const cityIntros: Record<string, { intro: string; highlights: string[] }> = {
  mesa: {
    intro: "Mesa is one of Arizona's fastest-growing cities with high demand for home service professionals. As the third-largest city in Arizona, Mesa combines suburban comfort with urban amenities, creating diverse needs for quality service providers.",
    highlights: [
      "Population of over 500,000 residents",
      "Rapidly growing business community",
      "Mix of residential and commercial properties",
      "Year-round service demand due to extreme weather",
    ],
  },
};

export default function CityPageContent({ 
  city, 
  businesses, 
  categories 
}: CityPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "category">("category");

  // Filter businesses by category if selected
  const filteredBusinesses = selectedCategory === "all" 
    ? businesses 
    : businesses.filter(b => b.category?.slug === selectedCategory);

  // Group businesses by category for category view
  const businessesByCategory = categories.map(category => ({
    category,
    businesses: businesses.filter(b => b.categoryId === category._id),
  })).filter(group => group.businesses.length > 0);

  const cityInfo = cityIntros[city.slug] || {
    intro: city.description || `${city.name} is a thriving community in ${city.region} with a growing demand for quality home and business services.`,
    highlights: [],
  };

  return (
    <div className="min-h-screen bg-background pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{city.region}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                {city.name}, Arizona Business Directory
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {cityInfo.intro}
              </p>
              
              {cityInfo.highlights.length > 0 && (
                <ul className="space-y-2">
                  {cityInfo.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stats Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Local Business Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Total Businesses</span>
                    </div>
                    <span className="font-semibold">{businesses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Service Categories</span>
                    </div>
                    <span className="font-semibold">{categories.length}</span>
                  </div>
                  {city.population && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Population</span>
                      </div>
                      <span className="font-semibold">{city.population.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Business Listings */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Service Providers in {city.name}
            </h2>
            
            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "category")}>
              <TabsList>
                <TabsTrigger value="category">By Category</TabsTrigger>
                <TabsTrigger value="grid">All Businesses</TabsTrigger>
              </TabsList>

              <TabsContent value="category" className="mt-6">
                {businessesByCategory.map(({ category, businesses }) => (
                  <div key={category._id} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <Link 
                        to={`/${category.slug}?city=${city.slug}`}
                        className="group flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="text-xl font-semibold">{category.name}</h3>
                        <Badge variant="secondary">{businesses.length}</Badge>
                        <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {businesses.slice(0, 3).map((business) => (
                        <BusinessCard key={business._id} business={business} />
                      ))}
                    </div>
                    
                    {businesses.length > 3 && (
                      <div className="mt-4 text-center">
                        <Button asChild variant="outline">
                          <Link to={`/${category.slug}?city=${city.slug}`}>
                            View All {category.name} ({businesses.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="grid" className="mt-6">
                {/* Category Filter for Grid View */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category._id}
                      variant={selectedCategory === category.slug ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.icon} {category.name} ({category.cityBusinessCount})
                    </Button>
                  ))}
                </div>

                {/* Business Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBusinesses.map((business) => (
                    <BusinessCard key={business._id} business={business} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="prose prose-lg mx-auto max-w-3xl dark:prose-invert">
            <h2>Finding Quality Service Providers in {city.name}</h2>
            <p>
              Whether you're a homeowner or business owner in {city.name}, finding reliable service providers 
              is essential. Our directory connects you with licensed, insured professionals who understand 
              the unique needs of {city.region} residents.
            </p>
            
            <h3>Popular Services in {city.name}</h3>
            <p>
              The most in-demand services in {city.name} include:
            </p>
            <ul>
              {categories.slice(0, 5).map((category) => (
                <li key={category._id}>
                  <Link to={`/${category.slug}?city=${city.slug}`} className="text-primary hover:underline">
                    {category.name}
                  </Link> - {category.cityBusinessCount} local providers
                </li>
              ))}
            </ul>
            
            <h3>Why Choose Local {city.name} Businesses?</h3>
            <ul>
              <li>Faster response times for emergency services</li>
              <li>Knowledge of local building codes and regulations</li>
              <li>Understanding of Arizona's climate challenges</li>
              <li>Investment in the local community</li>
              <li>Established reputation with local customers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Are You a {city.name} Business Owner?
              </h2>
              <p className="mb-6 text-lg opacity-90">
                Get your business listed and reach thousands of local customers
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to="/add-business">
                  Add Your Business
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}