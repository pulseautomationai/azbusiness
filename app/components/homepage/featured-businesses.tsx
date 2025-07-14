import { Star, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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
}

export default function FeaturedBusinesses() {
  const businesses = useQuery(api.businesses.getFeaturedBusinesses, {}) || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(businesses.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleBusinesses = businesses.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const planBadgeVariant = (tier: string) => {
    switch (tier) {
      case "power":
        return "default";
      case "pro":
        return "secondary";
      default:
        return "outline";
    }
  };

  const planBadgeText = (tier: string) => {
    switch (tier) {
      case "power":
        return "⚡ Power";
      case "pro":
        return "✨ Pro";
      default:
        return "Free";
    }
  };

  // Show loading state when no businesses are provided
  if (!businesses || businesses.length === 0) {
    return (
      <section className="py-16 bg-agave-cream">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal">
              Featured Businesses
            </h2>
            <p className="mt-4 text-lg text-ironwood-charcoal/70">
              Top-rated service providers ready to help
            </p>
          </div>
          <ComponentLoading text="Loading featured businesses..." />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-agave-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal">
            Featured Businesses
          </h2>
          <p className="mt-4 text-lg text-ironwood-charcoal/70">
            Top-rated service providers ready to help
          </p>
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

          {/* Business Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleBusinesses.map((business) => (
              <div key={business._id} className="relative overflow-hidden bg-white border border-prickly-pear-pink rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 card-hover-lift">
                {/* Plan Badge - Top Left with Proper Padding */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge 
                    className={cn(
                      "text-xs font-semibold shadow-sm",
                      business.planTier === "power" && "bg-gradient-to-r from-ocotillo-red to-ocotillo-red/90 text-white border-0 shadow-lg shadow-ocotillo-red/25",
                      business.planTier === "pro" && "bg-gradient-to-r from-desert-sky-blue to-desert-sky-blue/90 text-white border-0", 
                      business.planTier === "free" && "bg-white border-2 border-prickly-pear-pink text-ironwood-charcoal"
                    )}
                  >
                    {planBadgeText(business.planTier)}
                  </Badge>
                </div>
                
                <div className="p-6 pt-14">
                  {/* Category Icon */}
                  {business.category && business.category.icon && (
                    <div className="mb-3">
                      <span className="text-2xl opacity-60">{business.category.icon}</span>
                    </div>
                  )}
                  
                  {/* Business Name - Allow Two Lines */}
                  <h3 className="text-lg font-semibold text-ironwood-charcoal mb-1 leading-tight">
                    <Link 
                      to={business.category 
                        ? SlugGenerator.generateURLPath(business.name, business.city, business.category.name)
                        : `/business/${business.slug}`}
                      className="hover:text-ocotillo-red transition-colors block"
                      title={business.name}
                    >
                      <span className="line-clamp-2">{business.name}</span>
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-ironwood-charcoal/70 line-clamp-2 mb-4">
                    {business.shortDescription}
                  </p>
                
                  <div className="space-y-3">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(business.rating)
                                ? "fill-desert-sky-blue text-desert-sky-blue"
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

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-ironwood-charcoal/70">
                      <MapPin className="h-4 w-4 text-cholla-green" />
                      <span>{business.city}, AZ</span>
                    </div>

                    {/* Enhanced Services Tags */}
                    <div className="flex flex-wrap gap-2">
                      {business.services.slice(0, 3).map((service, index) => {
                        const colors = [
                          "bg-cholla-green/10 text-cholla-green border-cholla-green/20 hover:bg-cholla-green/20",
                          "bg-desert-sky-blue/10 text-desert-sky-blue border-desert-sky-blue/20 hover:bg-desert-sky-blue/20", 
                          "bg-prickly-pear-pink/15 text-ironwood-charcoal border-prickly-pear-pink/30 hover:bg-prickly-pear-pink/25"
                        ];
                        return (
                          <Badge 
                            key={index} 
                            className={cn(
                              "text-xs font-medium border transition-all duration-200 cursor-default",
                              colors[index % colors.length]
                            )}
                          >
                            {service}
                          </Badge>
                        );
                      })}
                      {business.services.length > 3 && (
                        <Badge className="text-xs font-medium bg-ironwood-charcoal/5 text-ironwood-charcoal/60 border-ironwood-charcoal/10 hover:bg-ironwood-charcoal/10 transition-all duration-200 cursor-default">
                          +{business.services.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Enhanced CTA Section with Better Spacing */}
                    <div className="pt-6 border-t border-prickly-pear-pink/20">
                      <div className="flex items-center gap-3">
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
                          className="border-cholla-green/30 text-cholla-green hover:bg-cholla-green/10 hover:border-cholla-green transition-all duration-200"
                          title="Call business"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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