import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface SuccessStory {
  id: string;
  customerName: string;
  customerInitials: string;
  location: string;
  rating: 5;
  review: string;
  service: string;
  responseTime: string;
  businessName: string;
  businessSlug: string;
}

const successStories: SuccessStory[] = [
  {
    id: "1",
    customerName: "Sarah M.",
    customerInitials: "SM",
    location: "Phoenix",
    rating: 5,
    review: "Metro HVAC fixed our AC in 20 minutes! Same-day service and very fair pricing.",
    service: "Emergency AC Repair",
    responseTime: "Same day",
    businessName: "Metro HVAC & Cooling",
    businessSlug: "/heating-and-air-conditioning/phoenix/metro-hvac-cooling"
  },
  {
    id: "2",
    customerName: "Mike R.",
    customerInitials: "MR",
    location: "Scottsdale",
    rating: 5,
    review: "Desert Pro Plumbing saved us from a major leak. Professional, quick, and honest about costs.",
    service: "Emergency Plumbing",
    responseTime: "Within 1 hour",
    businessName: "Desert Pro Plumbing",
    businessSlug: "/plumbing/scottsdale/desert-pro-plumbing"
  },
  {
    id: "3",
    customerName: "Jennifer L.",
    customerInitials: "JL",
    location: "Tempe",
    rating: 5,
    review: "Elite Landscaping transformed our backyard into an oasis. They exceeded all expectations!",
    service: "Landscape Design",
    responseTime: "Next day consultation",
    businessName: "Elite Landscaping Services",
    businessSlug: "/landscaping/tempe/elite-landscaping-services"
  }
];

export default function SuccessStories() {
  return (
    <section className="success-stories py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            💫 Recent Success Stories
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Real experiences from Arizona homeowners
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {successStories.map((story) => (
            <div 
              key={story.id}
              className="bg-white border border-prickly-pear-pink/20 rounded-xl p-6 hover:shadow-lg hover:border-prickly-pear-pink/40 transition-all duration-300"
            >
              {/* Customer Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-ocotillo-red to-prickly-pear-pink rounded-full flex items-center justify-center text-white font-medium">
                  {story.customerInitials}
                </div>
                <div>
                  <h4 className="font-medium text-ironwood-charcoal">{story.customerName}</h4>
                  <p className="text-sm text-ironwood-charcoal/60">{story.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex text-yellow-400 mb-3">
                {[...Array(story.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-ironwood-charcoal mb-4 leading-relaxed">
                "{story.review}"
              </p>

              {/* Service Details */}
              <div className="space-y-1 text-sm text-ironwood-charcoal/60 mb-4">
                <p>
                  <strong className="text-ironwood-charcoal">Service:</strong> {story.service}
                </p>
                <p>
                  <strong className="text-ironwood-charcoal">Response:</strong> {story.responseTime}
                </p>
              </div>

              {/* Business Link */}
              <Link
                to={story.businessSlug}
                className="inline-flex items-center text-ocotillo-red text-sm font-medium hover:text-desert-sky-blue transition-colors group"
              >
                View {story.businessName}
                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-ironwood-charcoal mb-4">
            Ready to find your perfect service provider?
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-3 bg-ocotillo-red text-white rounded-lg hover:bg-ocotillo-red/90 transition-colors font-medium"
          >
            Browse All Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}