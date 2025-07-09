import { Star, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ComponentLoading } from "~/components/loading-spinner";
import { cn } from "~/lib/utils";
import { SlugGenerator } from "~/utils/slug-generator";

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

export default function FeaturedBusinesses({ businesses }: { businesses: Business[] }) {
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
      <section className="py-16 bg-clay-beige/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-desert-night">
              Featured Businesses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Top-rated service providers ready to help
            </p>
          </div>
          <ComponentLoading text="Loading featured businesses..." />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-clay-beige/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-desert-night">
            Featured Businesses
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
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
                className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Business Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleBusinesses.map((business) => (
              <Card key={business._id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {business.category && business.category.icon && (
                          <span className="text-2xl">{business.category.icon}</span>
                        )}
                        <Badge variant={planBadgeVariant(business.planTier)}>
                          {planBadgeText(business.planTier)}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1">
                        <Link 
                          to={business.category 
                            ? SlugGenerator.generateURLPath(business.name, business.city, business.category.name)
                            : `/business/${business.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {business.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {business.shortDescription}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                                ? "fill-sun-gold text-sun-gold"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {business.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-agave-green" />
                      <span>{business.city}, AZ</span>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-1">
                      {business.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {business.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{business.services.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link to={business.category 
                          ? SlugGenerator.generateURLPath(business.name, business.city, business.category.name)
                          : `/business/${business.slug}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 text-agave-green" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      ? "w-8 bg-saguaro-teal"
                      : "bg-muted-foreground/30 hover:bg-mesa-terracotta/50"
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