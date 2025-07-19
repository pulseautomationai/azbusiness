import { useState } from "react";
import { Star, MapPin, Phone, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface PerformanceBadge {
  icon: string;
  label: string;
  color: "green" | "blue" | "purple" | "yellow";
}

interface Business {
  id: string;
  rank: number;
  name: string;
  experience: string;
  coverage: string;
  rating: number;
  reviewCount: number;
  tier: "POWER" | "PRO" | "STARTER";
  performanceBadges: PerformanceBadge[];
  slug: string;
}

const cities = [
  "Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler", "Glendale", "Peoria", "Tucson"
];

const categories = [
  "HVAC & Air Conditioning",
  "Plumbing & Water Heaters", 
  "Landscaping & Lawn Care",
  "Home Cleaning Services",
  "Electrical Services",
  "Roofing & Gutters",
  "Handyman Services",
  "Pool Services"
];

// Mock data for different city/category combinations
const mockBusinessData: Record<string, Business[]> = {
  "scottsdale-hvac": [
    {
      id: "1",
      rank: 1,
      name: "Scottsdale Air Pros",
      experience: "25+ years experience • Licensed & Insured",
      coverage: "📍 Serving Scottsdale, Paradise Valley, North Phoenix",
      rating: 4.9,
      reviewCount: 234,
      tier: "POWER",
      performanceBadges: [
        { icon: "⚡", label: "12 min avg response", color: "green" },
        { icon: "🏆", label: "98% satisfaction rate", color: "purple" }
      ],
      slug: "/heating-and-air-conditioning/scottsdale/scottsdale-air-pros"
    },
    {
      id: "2", 
      rank: 2,
      name: "Desert Climate Control",
      experience: "15+ years experience • Emergency Service Specialist",
      coverage: "📍 Serving East Valley, Scottsdale, Tempe",
      rating: 4.8,
      reviewCount: 189,
      tier: "PRO",
      performanceBadges: [
        { icon: "💰", label: "20% below avg cost", color: "blue" },
        { icon: "⚡", label: "Same-day service 90% of time", color: "green" }
      ],
      slug: "/heating-and-air-conditioning/scottsdale/desert-climate-control"
    },
    {
      id: "3",
      rank: 3,
      name: "Valley AC Specialists",
      experience: "10+ years experience • Family Owned & Operated",
      coverage: "📍 Serving Scottsdale, Phoenix Metro",
      rating: 4.7,
      reviewCount: 156,
      tier: "STARTER",
      performanceBadges: [
        { icon: "🏆", label: "Exceeds expectations 92% of time", color: "purple" },
        { icon: "🏠", label: "Residential specialists", color: "yellow" }
      ],
      slug: "/heating-and-air-conditioning/scottsdale/valley-ac-specialists"
    },
    {
      id: "4",
      rank: 4,
      name: "Elite HVAC Services",
      experience: "20+ years experience • Commercial & Residential",
      coverage: "📍 Serving Greater Phoenix Area",
      rating: 4.6,
      reviewCount: 198,
      tier: "PRO",
      performanceBadges: [
        { icon: "🏆", label: "Zero callbacks in 6 months", color: "purple" },
        { icon: "⚡", label: "24/7 emergency available", color: "green" }
      ],
      slug: "/heating-and-air-conditioning/scottsdale/elite-hvac-services"
    },
    {
      id: "5",
      rank: 5,
      name: "Arizona Cool Experts",
      experience: "12+ years experience • Certified Technicians",
      coverage: "📍 Serving North Valley, Scottsdale",
      rating: 4.5,
      reviewCount: 143,
      tier: "POWER",
      performanceBadges: [
        { icon: "🏆", label: "On-time 95% of cases", color: "purple" },
        { icon: "⚡", label: "15 min avg response", color: "green" }
      ],
      slug: "/heating-and-air-conditioning/scottsdale/arizona-cool-experts"
    }
  ]
};

const badgeColors = {
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200", 
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  yellow: "bg-amber-100 text-amber-800 border-amber-200"
};

const tierStyles = {
  POWER: "bg-gradient-to-r from-ocotillo-red to-red-600 text-white font-semibold shadow-sm",
  PRO: "bg-prickly-pear-pink text-ironwood-charcoal font-semibold",
  STARTER: "bg-gray-100 text-gray-600 font-medium text-xs"
};

export default function BusinessRankingsTable() {
  const [selectedCity, setSelectedCity] = useState("Scottsdale");
  const [selectedCategory, setSelectedCategory] = useState("HVAC & Air Conditioning");
  const [isLoading, setIsLoading] = useState(false);

  // Generate data key for mock data lookup
  const dataKey = `${selectedCity.toLowerCase()}-${selectedCategory.toLowerCase().includes('hvac') ? 'hvac' : 'plumbing'}`;
  const businesses = mockBusinessData[dataKey] || mockBusinessData["scottsdale-hvac"];

  const handleUpdateRankings = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const getRankBadgeClass = (rank: number) => {
    return rank === 1 
      ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 font-bold shadow-md border border-yellow-300"
      : "bg-gray-200 text-gray-700 font-semibold";
  };

  const getRowClass = (rank: number) => {
    return rank === 1
      ? "border-b border-prickly-pear-pink/10 hover:bg-yellow-50/30 transition-all duration-300 bg-yellow-50/20 border-l-4 border-l-yellow-400"
      : "border-b border-gray-200/60 hover:bg-agave-cream/50 hover:shadow-sm transition-all duration-300";
  };

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            Arizona's Best by Category
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Find top-performing professionals ranked by real customer feedback
          </p>
        </div>

        {/* Interactive Filter Controls */}
        <div className="bg-white border border-prickly-pear-pink/30 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            {/* City Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-ironwood-charcoal mb-2">
                Select City
              </label>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full border border-prickly-pear-pink/30 rounded-lg px-3 py-2 text-ironwood-charcoal focus:outline-none focus:ring-2 focus:ring-ocotillo-red focus:border-transparent"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-ironwood-charcoal mb-2">
                Select Category
              </label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-prickly-pear-pink/30 rounded-lg px-3 py-2 text-ironwood-charcoal focus:outline-none focus:ring-2 focus:ring-ocotillo-red focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Update Button */}
            <div className="lg:flex-none">
              <Button 
                onClick={handleUpdateRankings}
                disabled={isLoading}
                className="w-full lg:w-auto bg-ocotillo-red hover:bg-ocotillo-red/90 text-white font-medium px-8 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Rankings"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-ironwood-charcoal mb-1">
              Top {selectedCategory} in {selectedCity}
            </h3>
            <p className="text-sm text-ironwood-charcoal/60">
              Ranked by AI analysis of {businesses.reduce((sum, b) => sum + b.reviewCount, 0).toLocaleString()} customer reviews
            </p>
          </div>
          <div className="mt-2 lg:mt-0">
            <p className="text-xs text-ironwood-charcoal/50">
              Updated: 2 hours ago
            </p>
          </div>
        </div>

        {/* Main Rankings Table */}
        <div className="bg-white border border-prickly-pear-pink/30 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-ocotillo-red" />
              <span className="ml-3 text-ironwood-charcoal">Loading rankings...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-ironwood-charcoal tracking-wide uppercase">Rank</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-ironwood-charcoal tracking-wide uppercase">Business</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-ironwood-charcoal tracking-wide uppercase">Rating</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-ironwood-charcoal tracking-wide uppercase">Performance</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-ironwood-charcoal tracking-wide uppercase">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((business, index) => (
                      <tr 
                        key={business.id} 
                        className={cn(
                          getRowClass(business.rank),
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        )}
                      >
                        {/* Rank Column */}
                        <td className="px-6 py-6">
                          <div className="flex flex-col items-start gap-2">
                            <span className={cn(
                              "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm",
                              getRankBadgeClass(business.rank)
                            )}>
                              #{business.rank}
                            </span>
                            {business.tier !== 'STARTER' && (
                              <Badge className={cn("text-xs", tierStyles[business.tier])}>
                                {business.tier}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Business Column */}
                        <td className="px-6 py-6">
                          <div>
                            <h4 className={cn(
                              "font-semibold text-ironwood-charcoal mb-1 transition-colors",
                              business.rank === 1 ? "text-xl" : "text-lg"
                            )}>
                              <Link to={business.slug} className="hover:text-ocotillo-red transition-colors">
                                {business.name}
                              </Link>
                            </h4>
                            <p className="text-sm text-ironwood-charcoal/70 mb-1">{business.experience}</p>
                            <p className="text-sm text-ironwood-charcoal/60">{business.coverage}</p>
                          </div>
                        </td>

                        {/* Rating Column */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-1 mb-1">
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
                          <p className="text-sm text-ironwood-charcoal font-medium">
                            {business.rating.toFixed(1)} ({business.reviewCount})
                          </p>
                        </td>

                        {/* Top Performance Column */}
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            {business.performanceBadges.slice(0, 2).map((badge, badgeIndex) => (
                              <div 
                                key={badgeIndex}
                                className={cn(
                                  "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border shadow-sm",
                                  badgeColors[badge.color],
                                  "min-h-[28px]"
                                )}
                                style={{ fontSize: '12px', minWidth: 'fit-content' }}
                              >
                                <span className="text-sm">{badge.icon}</span>
                                <span className="whitespace-nowrap">{badge.label}</span>
                              </div>
                            ))}
                            {business.performanceBadges.length > 2 && (
                              <div className="text-xs text-ironwood-charcoal/50">
                                +{business.performanceBadges.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Contact Column */}
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <Button size="sm" className="w-full bg-ocotillo-red hover:bg-ocotillo-red/90 text-white font-medium">
                              <Phone className="mr-2 h-3 w-3" />
                              Get Quote
                            </Button>
                            <Button asChild size="sm" variant="ghost" className="w-full text-ocotillo-red hover:text-ocotillo-red/80 text-xs">
                              <Link to={business.slug}>
                                <ExternalLink className="mr-1 h-3 w-3" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {businesses.map((business) => (
                  <div 
                    key={business.id} 
                    className={cn(
                      "p-6",
                      getRowClass(business.rank)
                    )}
                  >
                    {/* Mobile card layout */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm",
                          getRankBadgeClass(business.rank)
                        )}>
                          #{business.rank}
                        </span>
                        {business.tier !== 'STARTER' && (
                          <Badge className={cn("text-xs", tierStyles[business.tier])}>
                            {business.tier}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3 w-3",
                              i < Math.floor(business.rating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            )} 
                          />
                        ))}
                        <span className="ml-1 text-xs text-ironwood-charcoal">
                          {business.rating.toFixed(1)} ({business.reviewCount})
                        </span>
                      </div>
                    </div>

                    <h4 className={cn(
                      "font-semibold text-ironwood-charcoal mb-1 transition-colors",
                      business.rank === 1 ? "text-xl" : "text-lg"
                    )}>
                      <Link to={business.slug} className="hover:text-ocotillo-red transition-colors">
                        {business.name}
                      </Link>
                    </h4>
                    <p className="text-sm text-ironwood-charcoal/70 mb-1">{business.experience}</p>
                    <p className="text-sm text-ironwood-charcoal/60 mb-3">{business.coverage}</p>

                    {/* Mobile: Show primary badge + indicator */}
                    <div className="mb-4">
                      {business.performanceBadges.slice(0, 1).map((badge, badgeIndex) => (
                        <div 
                          key={badgeIndex}
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border shadow-sm mr-2",
                            badgeColors[badge.color],
                            "min-h-[28px]"
                          )}
                        >
                          <span className="text-sm">{badge.icon}</span>
                          <span>{badge.label}</span>
                        </div>
                      ))}
                      {business.performanceBadges.length > 1 && (
                        <span className="text-xs text-ironwood-charcoal/50 bg-gray-100 px-2 py-1 rounded-full">
                          +{business.performanceBadges.length - 1}
                        </span>
                      )}
                    </div>

                    {/* Mobile: Primary action only */}
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-ocotillo-red hover:bg-ocotillo-red/90 text-white font-medium">
                        <Phone className="mr-2 h-3 w-3" />
                        Get Quote
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="w-full text-ocotillo-red hover:text-ocotillo-red/80 text-xs">
                        <Link to={business.slug} className="flex items-center justify-center">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Soft Business CTA */}
        <div className="text-center mt-8">
          <p className="text-ironwood-charcoal/70 mb-4">
            Want to see your business in these rankings?
          </p>
          <Button asChild variant="outline" className="border-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/20">
            <Link to="/for-businesses">
              Learn About Business Listings
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}