import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    location: "Phoenix, AZ",
    service: "HVAC Repair",
    rating: 5,
    text: "Found an amazing HVAC company through AZ Business Services. They responded within an hour and fixed our AC the same day. No runaround, just professional service.",
    business: "Desert Air Solutions"
  },
  {
    name: "Mike R.",
    location: "Scottsdale, AZ", 
    service: "Plumbing",
    rating: 5,
    text: "The plumber I found was honest about pricing upfront and completed the work perfectly. Much better experience than the big lead generation sites.",
    business: "AZ Plumbing Pros"
  },
  {
    name: "Jennifer L.",
    location: "Tucson, AZ",
    service: "Landscaping",
    rating: 5,
    text: "These landscapers transformed our backyard into an oasis. Professional, reliable, and they actually showed up when promised. Highly recommend!",
    business: "Desert Landscape Design"
  },
  {
    name: "David K.",
    location: "Mesa, AZ",
    service: "Electrical Work",
    rating: 5,
    text: "Quick response for an electrical emergency. The electrician was knowledgeable and explained everything clearly. Fair pricing and quality work.",
    business: "Bright Spark Electric"
  }
];

const stats = [
  { number: "50,000+", label: "Satisfied Customers" },
  { number: "500+", label: "Verified Professionals" },
  { number: "15,000+", label: "5-Star Reviews" },
  { number: "24/7", label: "Service Availability" }
];

export default function SocialProof() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            Trusted by Arizona Homeowners
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Real stories from real customers who found their perfect service professionals
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-ocotillo-red mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-ironwood-charcoal/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative bg-agave-cream/50 rounded-xl p-6 border border-prickly-pear-pink/20 hover:bg-agave-cream hover:border-prickly-pear-pink/40 transition-all duration-300">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4">
                <Quote className="h-6 w-6 text-prickly-pear-pink/40" />
              </div>
              
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                ))}
              </div>
              
              {/* Testimonial Text */}
              <p className="text-ironwood-charcoal mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              {/* Customer Info */}
              <div className="border-t border-prickly-pear-pink/20 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-ironwood-charcoal">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-ironwood-charcoal/60">
                      {testimonial.location} • {testimonial.service}
                    </div>
                  </div>
                  <div className="text-xs text-ironwood-charcoal/50 text-right">
                    Service by<br />
                    <span className="text-prickly-pear-pink font-medium">{testimonial.business}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-lg font-semibold text-ironwood-charcoal">
            <span>Join</span>
            <span className="text-ocotillo-red">50,000+</span>
            <span>satisfied customers</span>
          </div>
        </div>
      </div>
    </section>
  );
}