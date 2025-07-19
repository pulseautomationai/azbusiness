import { Star, Phone, MapPin, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ComponentLoading } from "~/components/loading-spinner";
import { cn } from "~/lib/utils";
import { SlugGenerator } from "~/utils/slug-generator";
import { api } from "../../../convex/_generated/api";

interface Business {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  city: string;
  rating: number;
  reviewCount: number;
  planTier: "free" | "pro" | "power";
  category?: {
    name: string;
    icon?: string;
  } | null;
  services: string[];
  performanceBadge?: {
    label: string;
    icon: string;
    color: string;
  };
  performanceMetric?: string;
}

const filterTabs = [
  { id: "all", label: "All Categories" },
  { id: "popular", label: "Most Popular" },
  { id: "fastest", label: "Fastest Response" },
  { id: "value", label: "Best Value" }
];

// Mock performance data - in production this would come from API
const mockPerformanceData: Record<string, any> = {
  "advanced-air-solutions": {
    badge: { label: "#1 Fastest AC Repair in Phoenix", icon: "🏅", color: "yellow" },
    metric: "15-minute average response time"
  },
  "desert-pro-plumbing": {
    badge: { label: "Best Value Emergency Service", icon: "💰", color: "green" },
    metric: "Fair pricing mentioned in 89% of reviews"
  },
  "elite-landscaping": {
    badge: { label: "Highest Customer Satisfaction", icon: "🏆", color: "blue" },
    metric: "100% 5-star reviews this month"
  }
};

export default function SmartRecommendations() {
  const businesses = useQuery(api.businesses.getFeaturedBusinesses, {}) || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const itemsPerPage = 3;
  
  // Enhance businesses with performance data
  const enhancedBusinesses = businesses.map(business => ({
    ...business,
    ...mockPerformanceData[business.slug] || {}
  }));
  
  const totalPages = Math.ceil(enhancedBusinesses.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleBusinesses = enhancedBusinesses.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const planBadgeStyles = {
    power: "bg-gradient-to-r from-ocotillo-red to-ocotillo-red/90 text-white border-0 shadow-lg shadow-ocotillo-red/25",
    pro: "bg-gradient-to-r from-desert-sky-blue to-desert-sky-blue/90 text-white border-0",
    free: "bg-white border-2 border-prickly-pear-pink text-ironwood-charcoal"
  };

  const planBadgeText = {
    power: "⚡ POWER",
    pro: "✨ PRO",
    free: "STARTER"
  };

  // Show loading state when no businesses are provided
  if (!businesses || businesses.length === 0) {
    return (
      <section className="py-16 bg-agave-cream">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal">
              🎯 Perfect Matches for You
            </h2>
            <p className="mt-4 text-lg text-ironwood-charcoal/70">
              Based on your area and most popular services
            </p>
          </div>
          <ComponentLoading text="Finding perfect matches..." />
        </div>
      </section>
    );
  }

  return (
    <section className="smart-recommendations py-16 bg-agave-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            🎯 Perfect Matches for You
          </h2>
          <p className="text-lg text-ironwood-charcoal/70">
            Based on your area and most popular services
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-prickly-pear-pink/30 rounded-lg p-1 flex gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeFilter === tab.id
                    ? "bg-ocotillo-red text-white"
                    : "text-ironwood-charcoal/60 hover:text-ironwood-charcoal"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {businesses.length > itemsPerPage && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg bg-agave-cream border-prickly-pear-pink/30 text-ironwood-charcoal hover:bg-white hover:border-ocotillo-red/50 hover:text-ocotillo-red hover:shadow-xl hover:-translate-x-1 transition-all duration-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg bg-agave-cream border-prickly-pear-pink/30 text-ironwood-charcoal hover:bg-white hover:border-ocotillo-red/50 hover:text-ocotillo-red hover:shadow-xl hover:translate-x-1 transition-all duration-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Enhanced Business Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleBusinesses.map((business) => (
              <div key={business._id} className="relative overflow-hidden bg-white border border-prickly-pear-pink/30 rounded-xl shadow-sm hover:shadow-lg hover:border-prickly-pear-pink/50 hover:scale-[1.02] transition-all duration-300">
                {/* Plan Badge - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    className={cn(
                      "text-xs font-semibold shadow-sm",
                      planBadgeStyles[business.planTier]
                    )}
                  >
                    {planBadgeText[business.planTier]}
                  </Badge>
                </div>
                
                <div className="p-6">
                  {/* Business Name */}
                  <h3 className="text-xl font-semibold text-ironwood-charcoal mb-2 pr-16">
                    <Link 
                      to={business.category 
                        ? SlugGenerator.generateURLPath(business.name, business.city, business.category.name)
                        : `/business/${business.slug}`}
                      className="hover:text-ocotillo-red transition-colors"
                    >
                      {business.name}
                    </Link>
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(business.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-ironwood-charcoal">
                      {business.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-ironwood-charcoal/60">
                      ({business.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Performance Badge */}
                  {business.badge && (
                    <div className="mb-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                        business.badge.color === "yellow" && "bg-yellow-100 text-yellow-800",
                        business.badge.color === "green" && "bg-green-100 text-green-800",
                        business.badge.color === "blue" && "bg-blue-100 text-blue-800"
                      )}>
                        <span>{business.badge.icon}</span>
                        <span>{business.badge.label}</span>
                      </span>
                    </div>
                  )}

                  {/* Performance Metric */}
                  {business.metric && (
                    <p className="text-cholla-green text-sm font-medium mb-3 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      "{business.metric}"
                    </p>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-ironwood-charcoal/70 mb-4">
                    <MapPin className="h-4 w-4 text-cholla-green" />
                    <span>{business.city}, AZ</span>
                  </div>

                  {/* Service Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {business.services.slice(0, 3).map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                    {business.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{business.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-prickly-pear-pink/20">
                    <Button asChild size="sm" className="flex-1 bg-ocotillo-red hover:bg-ocotillo-red/90 text-white">
                      <Link to={business.category 
                        ? SlugGenerator.generateURLPath(business.name, business.city, business.category.name)
                        : `/business/${business.slug}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/20"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="ml-2">Call Now</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === currentIndex
                      ? "w-8 bg-desert-sky-blue"
                      : "bg-muted-foreground/30 hover:bg-ocotillo-red/50"
                  )}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/categories">
              Browse All Categories
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}