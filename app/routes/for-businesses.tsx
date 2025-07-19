import { Header } from "~/components/homepage/header";
import BusinessOwnerHeader from "~/components/homepage/business-owner-header";
import ComparisonTable from "~/components/homepage/comparison-table";
import AIShowcase from "~/components/homepage/ai-showcase";
import CTACards from "~/components/homepage/cta-cards";
import Footer from "~/components/homepage/footer";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { SEOGenerator } from "~/utils/seo";
import { generateMetaTags } from "~/components/seo/seo-meta";
import type { Route } from "./+types/for-businesses";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { CheckCircle, Trophy, Zap, Users, BarChart3, ArrowRight } from "lucide-react";
import FAQSection from "~/components/ui/faq-section";

export function meta({}: Route.MetaArgs) {
  const seo = {
    title: "For Business Owners - AZ Business Services | Grow Your Arizona Business",
    description: "Join Arizona's premier business directory. Get verified, get visible, get customers with our exclusive lead generation and AI-powered business tools.",
    keywords: "Arizona business directory, business listings, lead generation, professional presence, SEO marketing",
    canonicalUrl: "https://azbusinessservices.com/for-businesses"
  };
  
  const { metaTags, links } = generateMetaTags(seo);
  
  return [
    ...metaTags,
    ...links,
    { name: "author", content: "AZ Business Services" },
  ];
}

const valueProps = [
  {
    icon: Trophy,
    title: "Exclusive Leads",
    description: "Not shared with 3-5 competitors like Thumbtack/Angi"
  },
  {
    icon: Zap,
    title: "Professional Presence",
    description: "AI-enhanced listings that convert visitors to customers"
  },
  {
    icon: BarChart3,
    title: "AI-Powered Tools",
    description: "Content generation, SEO optimization, and competitor analysis"
  }
];

const successStories = [
  {
    name: "Desert Air Solutions",
    category: "HVAC",
    growth: "300% increase in leads",
    timeframe: "First 3 months",
    quote: "The exclusive leads alone paid for our annual subscription in the first month."
  },
  {
    name: "AZ Plumbing Pros", 
    category: "Plumbing",
    growth: "Booked solid for 2 months",
    timeframe: "Within 6 weeks",
    quote: "No more bidding wars or shared leads. Every inquiry is a real opportunity."
  },
  {
    name: "Bright Spark Electric",
    category: "Electrical",
    growth: "5x ROI on subscription",
    timeframe: "First quarter",
    quote: "The AI tools helped us create professional content we could never afford."
  }
];

const gettingStartedSteps = [
  {
    number: "1",
    title: "Claim",
    description: "Find your business and claim it",
    detail: "Search our directory and claim your existing listing or create a new one"
  },
  {
    number: "2",
    title: "Verify",
    description: "Complete verification process",
    detail: "Submit documents and get verified to build instant credibility"
  },
  {
    number: "3",
    title: "Optimize",
    description: "Use AI tools to enhance your listing",
    detail: "Leverage our AI content generator and SEO tools for maximum visibility"
  },
  {
    number: "4",
    title: "Grow",
    description: "Start receiving qualified leads",
    detail: "Watch as exclusive, high-quality leads start flowing to your business"
  }
];

export default function ForBusinesses() {
  return (
    <>
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-agave-cream py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav className="text-sm text-ironwood-charcoal/60">
            <Link to="/" className="hover:text-ironwood-charcoal">Home</Link>
            <span className="mx-2">&gt;</span>
            <span>For Business Owners</span>
          </nav>
        </div>
      </div>

      {/* Business Hero Section */}
      <section className="relative bg-agave-cream pt-20 pb-16 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ironwood-charcoal mb-6">
              Join Arizona's Premier <span className="text-ocotillo-red">Business Directory</span>
            </h1>
            <p className="text-xl text-ironwood-charcoal/80 mb-8">
              Get verified. Get visible. Get customers.
            </p>

            {/* Value props */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-ironwood-charcoal/70 mb-10">
              {valueProps.map((prop, index) => {
                const Icon = prop.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-cholla-green" />
                    <span>{prop.title}</span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90">
                <Link to="/claim-business">
                  Claim Your Listing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/add-business">Add New Business</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <ComponentErrorBoundary componentName="Plan Cards">
        <CTACards />
      </ComponentErrorBoundary>

      {/* Value Proposition Section */}
      <ComponentErrorBoundary componentName="Comparison Table">
        <ComparisonTable />
      </ComponentErrorBoundary>

      {/* AI Features Section */}
      <ComponentErrorBoundary componentName="AI Showcase">
        <AIShowcase />
      </ComponentErrorBoundary>

      {/* Success Stories Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
              Arizona Businesses Growing with Us
            </h2>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              Real results from real businesses using our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-agave-cream/50 rounded-xl p-6 border border-prickly-pear-pink/20 hover:bg-agave-cream hover:border-prickly-pear-pink/40 transition-all duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-ironwood-charcoal mb-1">
                    {story.name}
                  </h3>
                  <div className="text-sm text-ironwood-charcoal/60">
                    {story.category} • {story.timeframe}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-ocotillo-red mb-1">
                    {story.growth}
                  </div>
                </div>
                
                <blockquote className="text-sm text-ironwood-charcoal italic">
                  "{story.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-16 bg-agave-cream">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
              How to Get Started
            </h2>
            <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
              Four simple steps to transform your business presence
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {gettingStartedSteps.map((step, index) => {
              const isLastStep = index === gettingStartedSteps.length - 1;
              
              return (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  {!isLastStep && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-prickly-pear-pink/30 to-transparent z-0"></div>
                  )}
                  
                  <div className="relative bg-white rounded-xl p-6 border border-prickly-pear-pink/20 text-center">
                    {/* Step Number */}
                    <div className="flex justify-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-ocotillo-red text-white font-semibold flex items-center justify-center text-lg">
                        {step.number}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-ironwood-charcoal mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm font-medium text-ironwood-charcoal/80 mb-3">
                      {step.description}
                    </p>
                    <p className="text-xs text-ironwood-charcoal/60 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business FAQs */}
      <ComponentErrorBoundary componentName="Business FAQ Section">
        <FAQSection className="bg-agave-cream" />
      </ComponentErrorBoundary>

      {/* CTA Footer Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            Ready to Transform Your Business Presence?
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 mb-8">
            Join hundreds of Arizona businesses already growing with our platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90">
              <Link to="/claim-business">Get Started Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Schedule Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}