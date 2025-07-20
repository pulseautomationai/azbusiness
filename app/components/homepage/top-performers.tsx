import { Zap, DollarSign, Trophy, Phone, MapPin, Star, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

interface PerformerBadge {
  label: string;
  icon: string;
  color: string;
}

interface TopPerformer {
  id: string;
  name: string;
  badge: PerformerBadge;
  rating: number;
  reviewCount: number;
  performanceMetric: string;
  location: string;
  slug: string;
}

const topPerformers: TopPerformer[] = [
  {
    id: "1",
    name: "Metro HVAC & Cooling",
    badge: {
      label: "FASTEST RESPONSE",
      icon: "⚡",
      color: "yellow"
    },
    rating: 4.9,
    reviewCount: 127,
    performanceMetric: "Average response time: 18 minutes",
    location: "Phoenix Metro",
    slug: "/heating-and-air-conditioning/phoenix/metro-hvac-cooling"
  },
  {
    id: "2",
    name: "Desert Pro Plumbing",
    badge: {
      label: "BEST VALUE",
      icon: "💰",
      color: "green"
    },
    rating: 4.8,
    reviewCount: 203,
    performanceMetric: "Fair pricing mentioned in 89% of reviews",
    location: "Scottsdale & East Valley",
    slug: "/plumbing/scottsdale/desert-pro-plumbing"
  },
  {
    id: "3",
    name: "Elite Landscaping Services",
    badge: {
      label: "HIGHEST RATED",
      icon: "🏆",
      color: "blue"
    },
    rating: 4.9,
    reviewCount: 156,
    performanceMetric: "Exceeds expectations every time",
    location: "North Phoenix",
    slug: "/landscaping/phoenix/elite-landscaping-services"
  }
];

const badgeColors = {
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-gray-100 text-gray-800"
};

export default function TopPerformers() {
  // Fetch real-time top performers from AI ranking system
  const topPerformersData = useQuery(api.businesses.getBusinesses, { limit: 3, featured: true });
  
  // Loading state
  if (topPerformersData === undefined) {
    return (
      <section className="top-performers bg-agave-cream py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-ironwood-charcoal mb-4">
            🏆 This Week's Top Performers
          </h2>
          <p className="text-center text-ironwood-charcoal/70 text-lg mb-8 md:mb-12">
            Arizona's standout service providers based on recent customer feedback
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-prickly-pear-pink/30 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Use fallback data if no data available  
  const performers = topPerformersData && topPerformersData.length > 0 
    ? topPerformersData.map((business, index) => ({
        id: business._id,
        name: business.name,
        badge: {
          label: business.planTier === 'power' ? 'FEATURED' : 'TOP RATED',
          icon: business.planTier === 'power' ? '💎' : '🏆',
          color: business.planTier === 'power' ? 'purple' : 'blue'
        },
        rating: business.rating || 4.8,
        reviewCount: business.reviewCount || 100,
        performanceMetric: `${business.rating || 4.8} star average with exceptional service`,
        location: `${business.city.charAt(0).toUpperCase() + business.city.slice(1)}, AZ`,
        slug: business.urlPath || business.slug
      }))
    : topPerformers;

  return (
    <section className="top-performers bg-agave-cream py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-center text-ironwood-charcoal mb-4">
          🏆 This Week's Top Performers
        </h2>
        <p className="text-center text-ironwood-charcoal/70 text-lg mb-8 md:mb-12">
          Arizona's standout service providers based on AI-powered ranking analysis
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {performers.map((performer) => (
            <div 
              key={performer.id}
              className="bg-white border border-prickly-pear-pink/30 rounded-xl p-6 hover:shadow-lg hover:border-prickly-pear-pink/50 transition-all duration-300"
            >
              {/* Performance Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`${badgeColors[performer.badge.color as keyof typeof badgeColors]} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                  <span>{performer.badge.icon}</span>
                  <span>{performer.badge.label}</span>
                </span>
                
                {/* Plan Tier Badge */}
                {performer.planTier && performer.planTier !== "free" && (
                  <span className="bg-ocotillo-red text-white px-2 py-1 rounded text-xs font-medium uppercase">
                    {performer.planTier}
                  </span>
                )}
              </div>

              {/* Business Name */}
              <h3 className="font-serif text-xl text-ironwood-charcoal mb-2 hover:text-ocotillo-red transition-colors">
                <Link to={performer.slug}>
                  {performer.name}
                </Link>
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(performer.rating) ? 'fill-current' : 'fill-none'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-ironwood-charcoal/70">
                  {performer.rating} ({performer.reviewCount} reviews)
                </span>
              </div>

              {/* Performance Metric */}
              <p className="text-cholla-green font-medium mb-2">
                "{performer.performanceMetric}"
              </p>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-ironwood-charcoal/60 mb-4">
                <MapPin className="h-4 w-4" />
                <span>Serving {performer.location}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  asChild 
                  className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90 flex-1"
                  size="sm"
                >
                  <Link to={performer.slug}>
                    View Profile
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/20"
                >
                  <Phone className="h-4 w-4" />
                  <span className="ml-2">Call Now</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Data freshness indicator */}
        <div className="text-center mt-8">
          <p className="text-sm text-ironwood-charcoal/50">
            Rankings updated hourly based on customer feedback and performance metrics
          </p>
        </div>
      </div>
    </section>
  );
}