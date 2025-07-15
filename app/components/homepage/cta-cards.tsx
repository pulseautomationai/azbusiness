import { ArrowRight, Rocket, Store, Badge, Crown, Zap } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function CTACards() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Add Your Business Card */}
          <div className="relative overflow-hidden rounded-xl bg-white border border-prickly-pear-pink shadow-lg card-hover-lift transition-all duration-300">
            {/* Left Accent Bar */}
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-prickly-pear-pink to-prickly-pear-pink/80"></div>
            
            <div className="p-4 sm:p-6 lg:p-8 relative">
              {/* Badge - Absolute Positioning */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-ironwood-charcoal badge-free-bg shadow-sm"
                      style={{ borderColor: '#B8D0FF' }}>
                  <Badge className="h-3 w-3" />
                  Free
                </span>
              </div>

              {/* Compact Icon + Title + Price Group */}
              <div className="mb-5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-prickly-pear-pink/10 border border-prickly-pear-pink/20">
                    <Store className="h-5 w-5 sm:h-6 sm:w-6 text-prickly-pear-pink" />
                  </div>
                  
                  {/* Title Block */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ironwood-charcoal leading-tight">
                      Get Listed Free — Forever
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-ironwood-charcoal/60">
                      $0 Forever · No credit card required
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="mt-3 text-ironwood-charcoal/70 text-sm sm:text-base leading-relaxed max-w-md">
                  No cost. No catch. Just more visibility for your local business.
                </p>
              </div>
              
              <ul className="mb-6 space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-ironwood-charcoal max-w-md">
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Show up in local search results</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Add your logo & collect customer reviews</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Boost credibility with a verified AZ listing</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Get a free SEO backlink for your website</span>
                </li>
              </ul>

              {/* CTA with reduced top spacing */}
              <div className="pt-4 sm:pt-6 lg:pt-8">
                <Button asChild className="w-full bg-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/80 hover:shadow-lg hover:text-ironwood-charcoal animate-glow-hover animate-button-press transition-all font-semibold border-2 border-ironwood-charcoal/25 hover:border-ironwood-charcoal/40">
                  <Link to="/add-business">
                    Claim My Free Listing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Features Card */}
          <div className="relative overflow-hidden rounded-xl bg-white border border-ocotillo-red shadow-lg card-hover-lift transition-all duration-300">
            {/* Left Accent Bar */}
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-ocotillo-red to-ocotillo-red/80"></div>
            
            <div className="p-4 sm:p-6 lg:p-8 relative">
              {/* Recommended Badge Only */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-ocotillo-red shadow-md">
                  <Crown className="h-3 w-3" />
                  Best
                </span>
              </div>

              {/* Compact Icon + Title + Price Group */}
              <div className="mb-5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-ocotillo-red/10 border border-ocotillo-red/20">
                    <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-ocotillo-red" />
                  </div>
                  
                  {/* Title Block */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ironwood-charcoal leading-tight">
                      Grow Your Business Faster
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-ironwood-charcoal/60">
                      From $29/month · Cancel anytime
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="mt-3 text-ironwood-charcoal/70 text-sm sm:text-base leading-relaxed max-w-md">
                  Unlock premium tools to boost visibility, trust, and lead generation.
                </p>
              </div>
              
              <ul className="mb-6 space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-ironwood-charcoal max-w-md">
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Get featured at the top of category & city pages</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Show up first in search results</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Receive leads directly to your inbox</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">1 blog post written for your business monthly</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Listings enhanced with AI styling for more clicks</span>
                </li>
              </ul>

              {/* CTA with reduced top spacing */}
              <div className="pt-4 sm:pt-6 lg:pt-8">
                <Button asChild className="w-full bg-ocotillo-red text-white hover:bg-ocotillo-red/90 hover:shadow-lg animate-glow-hover animate-button-press transition-all font-semibold">
                  <Link to="/pricing">
                    See All Premium Benefits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}