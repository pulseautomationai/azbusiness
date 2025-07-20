import { useState } from "react";
import { Link } from "react-router";
import { Star, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

interface Champion {
  category: string;
  emoji: string;
  businessName: string;
  championTitle: string;
  communityDetail: string;
  rating: number;
  reviewCount: number;
  slug: string;
}

interface CityData {
  city: string;
  champions: Champion[];
}

const cityChampions: Record<string, CityData> = {
  scottsdale: {
    city: "Scottsdale",
    champions: [
      {
        category: "HVAC",
        emoji: "🔥",
        businessName: "Scottsdale Air Pros",
        championTitle: "Scottsdale's Speed Champion",
        communityDetail: "Serving Scottsdale for 15+ years",
        rating: 4.9,
        reviewCount: 89,
        slug: "/heating-and-air-conditioning/scottsdale/scottsdale-air-pros"
      },
      {
        category: "Plumbing",
        emoji: "💧",
        businessName: "Valley Plumbing Elite",
        championTitle: "Scottsdale's Most Trusted",
        communityDetail: "Scottsdale Chamber Member",
        rating: 4.8,
        reviewCount: 156,
        slug: "/plumbing/scottsdale/valley-plumbing-elite"
      },
      {
        category: "Landscaping",
        emoji: "🌵",
        businessName: "Desert Dreams Landscaping",
        championTitle: "Scottsdale's Customer Favorite",
        communityDetail: "Helped 500+ families this year",
        rating: 5.0,
        reviewCount: 134,
        slug: "/landscaping/scottsdale/desert-dreams-landscaping"
      },
      {
        category: "Cleaning",
        emoji: "✨",
        businessName: "Spotless Scottsdale",
        championTitle: "Scottsdale's Detail Master",
        communityDetail: "Local family business",
        rating: 4.9,
        reviewCount: 212,
        slug: "/house-cleaning/scottsdale/spotless-scottsdale"
      }
    ]
  },
  phoenix: {
    city: "Phoenix",
    champions: [
      {
        category: "HVAC",
        emoji: "🔥",
        businessName: "Metro HVAC & Cooling",
        championTitle: "Phoenix's Speed Champion",
        communityDetail: "Serving Phoenix Metro for 20+ years",
        rating: 4.9,
        reviewCount: 127,
        slug: "/heating-and-air-conditioning/phoenix/metro-hvac-cooling"
      },
      {
        category: "Plumbing",
        emoji: "💧",
        businessName: "Phoenix Pro Plumbers",
        championTitle: "Phoenix's Emergency Expert",
        communityDetail: "24/7 service, local dispatch",
        rating: 4.8,
        reviewCount: 189,
        slug: "/plumbing/phoenix/phoenix-pro-plumbers"
      },
      {
        category: "Landscaping",
        emoji: "🌵",
        businessName: "Elite Landscaping Services",
        championTitle: "Phoenix's Customer Favorite",
        communityDetail: "Valley Pride Award Winner",
        rating: 4.9,
        reviewCount: 156,
        slug: "/landscaping/phoenix/elite-landscaping-services"
      },
      {
        category: "Cleaning",
        emoji: "✨",
        businessName: "Crystal Clean Phoenix",
        championTitle: "Phoenix's Trust Champion",
        communityDetail: "Bonded & insured locally",
        rating: 4.8,
        reviewCount: 198,
        slug: "/house-cleaning/phoenix/crystal-clean-phoenix"
      }
    ]
  },
  tempe: {
    city: "Tempe",
    champions: [
      {
        category: "HVAC",
        emoji: "🔥",
        businessName: "Tempe Climate Control",
        championTitle: "Tempe's Value Champion",
        communityDetail: "Supporting ASU families since 2010",
        rating: 4.8,
        reviewCount: 76,
        slug: "/heating-and-air-conditioning/tempe/tempe-climate-control"
      },
      {
        category: "Plumbing",
        emoji: "💧",
        businessName: "University Plumbing",
        championTitle: "Tempe's Student Choice",
        communityDetail: "ASU area specialists",
        rating: 4.7,
        reviewCount: 123,
        slug: "/plumbing/tempe/university-plumbing"
      },
      {
        category: "Landscaping",
        emoji: "🌵",
        businessName: "Tempe Green Thumb",
        championTitle: "Tempe's Eco Champion",
        communityDetail: "Water-wise desert experts",
        rating: 4.9,
        reviewCount: 98,
        slug: "/landscaping/tempe/tempe-green-thumb"
      },
      {
        category: "Cleaning",
        emoji: "✨",
        businessName: "ASU Area Cleaners",
        championTitle: "Tempe's Student Favorite",
        communityDetail: "Move-in/out specialists",
        rating: 4.7,
        reviewCount: 167,
        slug: "/house-cleaning/tempe/asu-area-cleaners"
      }
    ]
  },
  mesa: {
    city: "Mesa",
    champions: [
      {
        category: "HVAC",
        emoji: "🔥",
        businessName: "Mesa Cooling Masters",
        championTitle: "Mesa's Family Champion",
        communityDetail: "Third generation Mesa business",
        rating: 4.9,
        reviewCount: 143,
        slug: "/heating-and-air-conditioning/mesa/mesa-cooling-masters"
      },
      {
        category: "Plumbing",
        emoji: "💧",
        businessName: "East Valley Plumbing",
        championTitle: "Mesa's Warranty Champion",
        communityDetail: "10-year parts & labor guarantee",
        rating: 4.8,
        reviewCount: 201,
        slug: "/plumbing/mesa/east-valley-plumbing"
      },
      {
        category: "Landscaping",
        emoji: "🌵",
        businessName: "Mesa Desert Scapes",
        championTitle: "Mesa's Water Champion",
        communityDetail: "City conservation partner",
        rating: 4.8,
        reviewCount: 117,
        slug: "/landscaping/mesa/mesa-desert-scapes"
      },
      {
        category: "Cleaning",
        emoji: "✨",
        businessName: "Mesa Maid Service",
        championTitle: "Mesa's Home Champion",
        communityDetail: "Large home specialists",
        rating: 4.9,
        reviewCount: 178,
        slug: "/house-cleaning/mesa/mesa-maid-service"
      }
    ]
  }
};

const cities = ["Scottsdale", "Phoenix", "Tempe", "Mesa"];

export default function CityChampions() {
  const [selectedCity, setSelectedCity] = useState("Scottsdale");
  
  // Fetch real data
  const citiesData = useQuery(api.cities.getCities);
  const cityChampionsData = useQuery(api.businesses.getBusinesses, {
    citySlug: selectedCity.toLowerCase(),
    limit: 4,
  });

  // Get top cities for dropdown
  const topCities = citiesData?.slice(0, 8) || [];
  
  // Format champions data with fallback
  const champions = cityChampionsData?.map((business, index) => {
    const categoryEmojis: Record<string, string> = {
      "HVAC Services": "🔥",
      "Plumbing": "💧", 
      "Landscaping": "🌵",
      "Cleaning Services": "✨",
      "Electrical": "⚡",
      "Handyman": "🔧",
      "Pool & Spa Services": "🏊",
      "Roofing & Gutters": "🏠",
    };

    const championTitles = [
      `${selectedCity}'s Speed Champion`,
      `${selectedCity}'s Most Trusted`,
      `${selectedCity}'s Customer Favorite`,
      `${selectedCity}'s Detail Master`,
    ];

    return {
      category: business.category?.name || "Services",
      emoji: categoryEmojis[business.category?.name || ""] || "⭐",
      businessName: business.name,
      championTitle: championTitles[index] || `${selectedCity}'s Professional`,
      communityDetail: `Serving ${selectedCity} • ${business.reviewCount} reviews`,
      rating: business.rating,
      reviewCount: business.reviewCount,
      slug: business.slug,
    };
  }) || [];

  // Use fallback data if no champions available
  const fallbackData = cityChampions[selectedCity.toLowerCase()];
  const currentCityData = {
    city: selectedCity,
    champions: champions.length > 0 ? champions : (fallbackData?.champions || []),
  };

  return (
    <section className="city-champions py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="font-serif text-3xl md:text-4xl text-ironwood-charcoal mb-4">
              🏆 {currentCityData.city}'s Champions This Month
            </h2>
            <p className="text-lg text-ironwood-charcoal/70">
              This month's standout local pros in your community
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ironwood-charcoal/60">Location:</span>
            <select 
              className="border border-prickly-pear-pink/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocotillo-red focus:border-transparent"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {topCities.map((city) => (
                <option key={city.slug} value={city.name}>
                  {city.name}, AZ
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        {cityChampionsData === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ocotillo-red" />
            <span className="ml-3 text-ironwood-charcoal">Loading champions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto lg:overflow-visible mb-8">
            <div className="flex gap-4 lg:grid lg:grid-cols-4 lg:gap-6 min-w-max lg:min-w-0">
              {currentCityData.champions.map((champion, index) => (
              <div 
                key={index}
                className="bg-white border border-prickly-pear-pink/15 rounded-lg p-4 text-center hover:shadow-md hover:border-prickly-pear-pink/30 transition-all duration-300 min-w-[240px] lg:min-w-0 flex-shrink-0"
              >
                {/* Emoji Icon */}
                <div className="text-2xl mb-2">{champion.emoji}</div>
                
                {/* Category */}
                <h4 className="text-sm font-medium text-ironwood-charcoal/80 mb-1">
                  {champion.category}
                </h4>
                
                {/* Business Name */}
                <h5 className="font-semibold text-ironwood-charcoal mb-2 text-sm">
                  <Link 
                    to={champion.slug}
                    className="hover:text-ocotillo-red transition-colors"
                  >
                    {champion.businessName}
                  </Link>
                </h5>
                
                {/* Champion Title - The Star */}
                <p className="text-ocotillo-red text-base font-semibold mb-1">
                  {champion.championTitle}
                </p>
                
                {/* Community Detail */}
                <p className="text-xs text-ironwood-charcoal/60 mb-3">
                  {champion.communityDetail}
                </p>
                
                {/* Rating - Smaller and more subtle */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < Math.floor(champion.rating) ? 'fill-current' : 'fill-none'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-ironwood-charcoal/50 ml-1">
                    {champion.rating} ({champion.reviewCount})
                  </span>
                </div>
                
                {/* View Profile Link - Less prominent */}
                <Link
                  to={champion.slug}
                  className="text-ocotillo-red/80 text-xs font-medium hover:text-ocotillo-red transition-colors"
                >
                  View Profile
                </Link>
              </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            to={`/?city=${currentCityData.city}&category=All`}
            className="inline-flex items-center text-ocotillo-red font-medium hover:text-ocotillo-red/80 transition-colors text-sm"
          >
            Explore More {currentCityData.city} Champions
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}