import { TrendingUp, Building2, BarChart3, ThumbsUp, Zap, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export default function AIShowcase() {
  return (
    <section className="py-16 bg-agave-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-ironwood-charcoal mb-4">
            The Professional Difference: AI-Enhanced Business Listings
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 mb-2">
            Real examples from Power tier customers
          </p>
          
          {/* Comparison Demo Section */}
          <div className="mt-8 mb-12 text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-ironwood-charcoal mb-3">
              Power vs Starter: See the Difference
            </h3>
            <p className="text-base text-ironwood-charcoal/70 mb-6">
              Compare how the same business type looks with different plan tiers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-ocotillo-red hover:bg-ocotillo-red/90 text-white font-semibold shadow-md"
              >
                <Link to="/hvac-services/phoenix/reliance-heating-and-air-conditioning">
                  View Power Example
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-ironwood-charcoal/60 text-ironwood-charcoal hover:bg-ironwood-charcoal hover:text-white font-semibold shadow-md transition-all"
              >
                <Link to="/hvac-services/phoenix/one-stop-heating-and-cooling-master-mechanical">
                  View Starter Example
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Row 1: Professional Overview (Image Left, Text Right) */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Left */}
            <div className="order-2 lg:order-1">
              <img 
                src="/professional-overview.png" 
                alt="Professional Overview AI Example"
                className="w-full rounded-xl"
              />
            </div>
            
            {/* Text Right */}
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-ironwood-charcoal mb-4">
                Professional Business Analysis
              </h3>
              <p className="text-lg text-ironwood-charcoal/80 mb-6 leading-relaxed">
                Our AI instantly creates professional business summaries with key metrics, customer ratings, and strategic insights. Get the professional presentation that builds customer trust and showcases your expertise - no manual writing required.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Professional credibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Key metrics highlighted</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Instant trust building</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Competitive Intelligence (Image Right, Text Left) */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Left */}
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-ironwood-charcoal mb-4">
                Strategic Market Positioning
              </h3>
              <p className="text-lg text-ironwood-charcoal/80 mb-6 leading-relaxed">
                Advanced AI analyzes your business profile and identifies unique competitive advantages. Understand exactly what sets you apart and how to position yourself in the Arizona market for maximum impact.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Competitive advantages identified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Strategic positioning</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Market differentiation</span>
                </div>
              </div>
            </div>
            
            {/* Image Right */}
            <div>
              <img 
                src="/competitive-intelligence.png" 
                alt="Competitive Intelligence AI Example"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Review Intelligence (Image Left, Text Right) */}
        <div className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Left */}
            <div className="order-2 lg:order-1">
              <img 
                src="/review-intelligence.png" 
                alt="Review Intelligence AI Example"
                className="w-full rounded-xl"
              />
            </div>
            
            {/* Text Right */}
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-ironwood-charcoal mb-4">
                Customer Sentiment Analysis
              </h3>
              <p className="text-lg text-ironwood-charcoal/80 mb-6 leading-relaxed">
                AI analyzes hundreds of customer reviews to extract actionable insights about your strengths, customer sentiment, and key differentiators. Know exactly what customers love about your business.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Sentiment analysis (92% positive)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Top strengths identified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-ironwood-charcoal">Key differentiators revealed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}