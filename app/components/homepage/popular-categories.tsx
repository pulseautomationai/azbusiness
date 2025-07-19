import { 
  Wrench, 
  Droplets, 
  Trees, 
  Sparkles, 
  Zap, 
  Home, 
  Settings, 
  Waves,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router";

const categories = [
  {
    name: "HVAC & Air Conditioning",
    href: "/heating-and-air-conditioning",
    icon: Settings,
    emoji: "🔥",
    description: "AC repair, heating, and HVAC services",
    performanceTitle: "Phoenix's Fastest AC Repair",
    topListLabel: "See Top 10 Fastest"
  },
  {
    name: "Plumbing & Water Heaters",
    href: "/plumbing",
    icon: Droplets,
    emoji: "💧",
    description: "Emergency plumbing and water heater repair",
    performanceTitle: "Most Reliable Emergency Service",
    topListLabel: "See Top 10 Most Reliable"
  },
  {
    name: "Landscaping & Lawn Care",
    href: "/landscaping",
    icon: Trees,
    emoji: "🌵",
    description: "Lawn maintenance and landscaping design",
    performanceTitle: "Highest Rated Landscapers",
    topListLabel: "See Top 10 Highest Rated"
  },
  {
    name: "Home Cleaning Services",
    href: "/house-cleaning",
    icon: Sparkles,
    emoji: "✨",
    description: "Residential and commercial cleaning",
    performanceTitle: "Most Thorough Cleaners",
    topListLabel: "See Top 10 Most Thorough"
  },
  {
    name: "Electrical Services",
    href: "/electricians",
    icon: Zap,
    emoji: "⚡",
    description: "Electrical repair and installation",
    performanceTitle: "Safest & Most Certified",
    topListLabel: "See Top 10 Safest"
  },
  {
    name: "Roofing & Gutters",
    href: "/roofing",
    icon: Home,
    emoji: "🏠",
    description: "Roof repair, replacement, and gutters",
    performanceTitle: "Best Warranty Coverage",
    topListLabel: "See Top 10 Best Warranties"
  },
  {
    name: "Handyman Services",
    href: "/handyman",
    icon: Wrench,
    emoji: "🔧",
    description: "General repairs and home maintenance",
    performanceTitle: "Most Versatile Pros",
    topListLabel: "See Top 10 Most Versatile"
  },
  {
    name: "Pool Services",
    href: "/pool-services",
    icon: Waves,
    emoji: "🏊",
    description: "Pool cleaning, repair, and maintenance",
    performanceTitle: "Cleanest Pool Results",
    topListLabel: "See Top 10 Cleanest"
  }
];

export default function PopularCategories() {
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-white border border-prickly-pear-pink/20 p-6 hover:border-prickly-pear-pink/40 transition-all duration-300 hover:shadow-lg"
              >
                {/* Emoji Icon */}
                <div className="text-4xl mb-4">{category.emoji}</div>
                
                {/* Category Name */}
                <h3 className="text-lg font-semibold text-ironwood-charcoal mb-2 leading-tight">
                  {category.name}
                </h3>
                
                {/* Performance Title */}
                <p className="text-cholla-green font-medium mb-4">
                  "{category.performanceTitle}"
                </p>
                
                {/* Top List Link */}
                <Link
                  to={category.href}
                  className="inline-flex items-center text-ocotillo-red font-medium hover:text-desert-sky-blue transition-colors group"
                  prefetch="viewport"
                >
                  <span className="mr-1">→</span>
                  <span>{category.topListLabel}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}