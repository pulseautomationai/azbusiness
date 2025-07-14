import { Star, Phone, MapPin, Clock, Shield, Award } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { SlugGenerator } from "~/utils/slug-generator";

interface BusinessCardProps {
  business: {
    _id: string;
    name: string;
    slug: string;
    shortDescription: string;
    phone: string;
    city: string;
    rating: number;
    reviewCount: number;
    planTier: "free" | "pro" | "power";
    verified: boolean;
    featured: boolean;
    services: string[];
    distance?: number; // Distance in miles (for search results)
    category?: {
      name: string;
      icon: string;
    };
  };
  variant?: "default" | "compact";
}

export default function BusinessCard({ business, variant = "default" }: BusinessCardProps) {

  // Generate new URL format: /[category]/[city]/[businessName]
  const businessUrl = business.category 
    ? SlugGenerator.generateURLPath(business.name, business.city, business.category.name)
    : `/business/${business.slug}`; // Fallback to old format if no category

  return (
    <Card className={cn(
      "relative overflow-hidden hover:shadow-lg transition-all duration-200",
      business.featured && "ring-2 ring-primary/20"
    )}>
      {/* Featured ribbon */}
      {business.featured && (
        <div className="absolute right-0 top-0 bg-cholla-green px-3 py-1 text-xs font-semibold text-white">
          Featured
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-1 text-xl">
              <Link 
                to={businessUrl}
                className="hover:text-primary transition-colors"
              >
                {business.name}
              </Link>
            </CardTitle>
            {business.verified && (
              <div className="mt-1 flex items-center gap-1 text-green-600 dark:text-green-500">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Verified</span>
              </div>
            )}
          </div>
        </div>
        <CardDescription className="mt-2 line-clamp-2">
          {business.shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(business.rating)
                    ? "fill-yellow-400 text-yellow-400"
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
          <MapPin className="h-4 w-4" />
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
            <Link to={businessUrl}>
              View Details
            </Link>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = `tel:${business.phone}`}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}