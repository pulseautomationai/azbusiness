import { ArrowRight, Rocket, Store, Badge, Crown, Zap } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function CTACards() {
  return (
    <section className="py-16 bg-agave-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            Choose Your Professional Plan
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Start with professional credibility or go all-in with exclusive lead generation
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
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
                  Starter
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
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ironwood-charcoal leading-tight">
                      Start Professional From Day One
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-ironwood-charcoal/60">
                      $9/month · Professional credibility instantly
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="mt-3 text-ironwood-charcoal/70 text-sm sm:text-base leading-relaxed max-w-md">
                  AI-generated summary, verification badge, and SEO backlink. Professional credibility for less than $2.50 per week.
                </p>
              </div>
              
              <ul className="mb-6 space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-ironwood-charcoal max-w-md">
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Professional AI-generated business summary</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Verification badge for instant credibility</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Direct SEO backlink to your website</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Google reviews display (3) + contact info</span>
                </li>
              </ul>

              {/* CTA with reduced top spacing */}
              <div className="pt-4 sm:pt-6 lg:pt-8">
                <Button asChild className="w-full bg-prickly-pear-pink text-ironwood-charcoal hover:bg-prickly-pear-pink/80 hover:shadow-lg hover:text-ironwood-charcoal animate-glow-hover animate-button-press transition-all font-semibold border-2 border-ironwood-charcoal/25 hover:border-ironwood-charcoal/40">
                  <Link to="/sign-up">
                    Start Professional
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
                  Power
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
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ironwood-charcoal leading-tight">
                      Turn Your Presence Into Revenue
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-ironwood-charcoal/60">
                      $97/month · Unlimited exclusive leads
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="mt-3 text-ironwood-charcoal/70 text-sm sm:text-base leading-relaxed max-w-md">
                  Exclusive leads sent directly to your inbox. No bidding, no sharing. Just 1-2 leads per month vs $80-100 per lead on Thumbtack.
                </p>
              </div>
              
              <ul className="mb-6 space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-ironwood-charcoal max-w-md">
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Unlimited exclusive leads (not shared)</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Homepage featured placement</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Professional image gallery</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">AI review analysis & insights</span>
                </li>
                <li className="flex gap-2.5 sm:gap-3 items-start">
                  <span className="text-cholla-green mt-0.5 font-semibold">✓</span>
                  <span className="leading-relaxed">Everything in Starter + Pro plans</span>
                </li>
              </ul>

              {/* CTA with reduced top spacing */}
              <div className="pt-4 sm:pt-6 lg:pt-8">
                <Button asChild className="w-full bg-ocotillo-red text-white hover:bg-ocotillo-red/90 hover:shadow-lg animate-glow-hover animate-button-press transition-all font-semibold">
                  <Link to="/sign-up">
                    Get Power
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