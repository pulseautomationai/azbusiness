import { useState } from "react";
import { Check, X, Star, TrendingUp, ArrowRight, Phone, Mail, Globe, BarChart3, Lightbulb, MessageCircle, Tag, Building, Image, Settings, Crown, Zap, Shield, MapPin, Target, Brain, DollarSign, Award } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import FAQSection from "~/components/ui/faq-section";
import FeatureComparisonTable from "~/components/pricing/feature-comparison-table";
import { StarterCheckoutButton, ProCheckoutButton, PowerCheckoutButton } from "~/components/payments/PolarCheckoutButton";

interface PricingSectionProps {
  isSignedIn: boolean;
}

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    description: "Get Started",
    tagline: "Get verified and take control of your online presence",
    icon: "🆓",
    features: [
      "Basic business listing & contact info",
      "Verified by Business Owner badge",
      "Basic AI insights (customer feedback summary)",
      "Appears in AI rankings (competes but can't see position)",
      "Google reviews display (3)",
      "Mobile-optimized profile",
    ],
    limitations: [
      "No lead generation (contact form disabled)",
      "No performance tracking (can't see ranking position)",
      "No logo upload",
      "No advanced business info",
      "No AI insights detail (can't see detailed analysis)",
      "No AI summary editing (AI-generated content only)",
      "No SEO backlink to website",
      "Standard placement only",
    ],
    cta: "Claim Your Business",
    popular: false,
    bestValue: false,
    color: "gray",
  },
  {
    id: "starter",
    name: "Starter",
    price: 9,
    yearlyPrice: 7,
    description: "See Your Ranking",
    tagline: "Professional credibility with performance insights - see where you rank",
    icon: "🚀",
    features: [
      "Everything in Free PLUS:",
      "Professional logo upload",
      "Performance dashboard (see ranking position - are you #3 or #15?)",
      "Enhanced AI insights (detailed customer feedback analysis)",
      "Advanced business editing",
      "Editable AI summary (control your business description)",
      "SEO backlink to your website",
      "Google reviews display (8)",
      "Starter Professional status",
    ],
    limitations: [
      "No lead generation (contact form disabled)",
      "Standard placement (no featured positioning)",
      "Basic service presentation",
      "No review response",
      "No competitive analysis",
    ],
    cta: "Start Professional Plan",
    popular: false,
    bestValue: false,
    color: "blue",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    yearlyPrice: 22,
    description: "Stand Out",
    tagline: "Enhanced visibility and control - stand out before you capture leads",
    icon: "🌟",
    features: [
      "Everything in Starter PLUS:",
      "Multiple featured placements (above standard listings)",
      "Enhanced service cards (professional presentation vs bullet points)",
      "Google reviews display (15)",
      "Review response capability",
      "Active badge system",
      "Content editing control",
      "Professional AI intelligence (displayed to consumers)",
      "Competitive analysis (see how you compare to area average)",
      "Monthly performance reports",
      "Pro-Verified status",
    ],
    limitations: [
      "No lead generation (Ready to capture customers? Upgrade to Power)",
      "No image gallery (can't showcase work photos)",
      "No homepage featuring (not eligible for homepage spotlight)",
    ],
    cta: "Get Featured Now",
    popular: true,
    bestValue: false,
    color: "yellow",
  },
  {
    id: "power",
    name: "Power",
    price: 97,
    yearlyPrice: 73,
    description: "Complete Solution",
    tagline: "Premium directory listing with unlimited exclusive lead capture",
    icon: "⚡",
    features: [
      "Everything in Pro PLUS:",
      "Unlimited exclusive lead capture",
      "Homepage featured placement",
      "Professional image gallery",
      "Google reviews display (unlimited)",
      "Advanced AI business intelligence (real-time insights)",
      "Premium AI presentation (maximum consumer-facing insights)",
      "Real-time performance updates (live ranking monitoring)",
      "Advanced competitive intelligence",
      "Priority customer support",
      "Power-Tier Verified status",
      "Local market leader positioning",
    ],
    limitations: [],
    cta: "Start Generating Leads",
    popular: false,
    bestValue: true,
    color: "green",
  },
];

export default function PricingSection({ isSignedIn }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="py-16" style={{ backgroundColor: '#FDF8F3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ironwood-charcoal mb-6">
              Choose Your <span className="text-ocotillo-red">Professional Plan</span>
            </h1>
            <p className="text-lg lg:text-xl text-ironwood-charcoal/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              Join Arizona's fastest-growing business directory with AI-powered insights and performance-based rankings.
              Unlike Thumbtack and Angi that charge $80-100 per shared lead, we offer predictable monthly pricing with exclusive leads and professional AI enhancement.
            </p>
            
            
            {/* Monthly/Yearly Toggle */}
            <div className="flex items-center justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-full flex items-center">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    billingPeriod === "monthly" 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pay Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    billingPeriod === "yearly" 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pay Yearly
                </button>
              </div>
              {billingPeriod === "yearly" && (
                <div className="ml-4 flex items-center">
                  <span className="text-sm font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full animate-pulse">
                    Save 25%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full relative ${
                  plan.popular ? 'border-2 border-yellow-500 scale-105 hover:scale-110 shadow-2xl ring-2 ring-yellow-200' : 'hover:scale-105'
                } ${
                  plan.bestValue ? 'border-2 border-emerald-500 scale-105 hover:scale-110 shadow-2xl ring-2 ring-emerald-200' : ''
                } ${
                  plan.id === 'free' ? 'border border-gray-200' : ''
                } ${
                  plan.id === 'power' ? 'bg-gradient-to-br from-white to-green-50' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {/* Best Value Badge */}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg">
                      Best Value
                    </span>
                  </div>
                )}
                
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-6">
                      <div className="text-3xl mb-2">{plan.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium mb-4">
                        {plan.tagline}
                      </p>
                    </div>
                    
                    <div className="text-center mb-8">
                      <p className="text-4xl font-bold text-gray-900 mb-1">
                        {plan.id === "free" ? "Free" : `$${billingPeriod === "yearly" ? plan.yearlyPrice : plan.price}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {plan.id === "free" ? 
                          "No credit card required" :
                          billingPeriod === "yearly" ? 
                          `Billed annually ($${plan.yearlyPrice * 12}/year)` : 
                          "Billed monthly"
                        }
                      </p>
                    </div>
                    
                    {/* Value Proposition */}
                    {plan.id === "free" && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Why claim for free?</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Take control of your online presence</li>
                          <li>• Get verified business badge</li>
                          <li>• Compete in AI rankings</li>
                          <li>• Start building credibility</li>
                        </ul>
                      </div>
                    )}
                    
                    {plan.id === "starter" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Why choose Starter?</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• See your exact ranking position (are you #3 or #15 in Phoenix HVAC?)</li>
                          <li>• Edit your AI-generated summary to match your voice</li>
                          <li>• Detailed AI insights with specific customer feedback analysis</li>
                          <li>• Professional logo upload and advanced business editing</li>
                        </ul>
                      </div>
                    )}
                    
                    {plan.id === "pro" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Why choose Pro?</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Stand out with featured placement above standard listings</li>
                          <li>• Professional AI presentation for consumers viewing your profile</li>
                          <li>• Respond to customer reviews and build relationships</li>
                          <li>• See how you compare to other businesses in your area</li>
                          <li>• Enhanced service presentation with professional cards vs bullet points</li>
                        </ul>
                        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                          <strong>Ready to capture customers?</strong> Upgrade to Power anytime to start receiving leads
                        </div>
                      </div>
                    )}
                    
                    {plan.id === "power" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-3">Why choose Power?</p>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">💰</span>
                            <span><strong>Stop paying $80-100 per shared lead</strong></span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">🎯</span>
                            <span><strong>Unlimited exclusive leads for flat monthly rate</strong></span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">📸</span>
                            <span><strong>Complete professional showcase with image gallery</strong></span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">🤖</span>
                            <span><strong>Advanced AI business intelligence</strong></span>
                          </li>
                        </ul>
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                          <div className="text-sm font-bold text-green-800 mb-2">ROI Calculator:</div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-xs text-green-700">
                              <span className="flex-shrink-0">💰</span>
                              <div>
                                <strong>Thumbtack/Angi:</strong><br />
                                $80-100 per shared lead
                              </div>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-green-700">
                              <span className="flex-shrink-0">💰</span>
                              <div>
                                <strong>AZ Business Power:</strong><br />
                                $97/month unlimited exclusive leads
                              </div>
                            </div>
                            <div className="border-t border-green-300 pt-2 mt-2">
                              <div className="flex items-start gap-2 text-xs font-semibold text-green-800">
                                <span className="flex-shrink-0">💰</span>
                                <div>
                                  Break even: Just 1-2 leads per month to save money
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-green-700 mt-1">
                                <span className="flex-shrink-0">💰</span>
                                <div>
                                  Typical ROI: 500-1000% return on investment
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-900">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-gray-900">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start">
                              <X className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8">
                    {plan.id === 'free' && (
                      <Link to="/claim-business">
                        <Button className="w-full py-3 text-sm font-semibold transition-all duration-200 bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg">
                          {plan.cta}
                        </Button>
                      </Link>
                    )}
                    {plan.id === 'starter' && (
                      <StarterCheckoutButton
                        billingPeriod={billingPeriod}
                        className="w-full py-3 text-sm font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                      >
                        {plan.cta}
                      </StarterCheckoutButton>
                    )}
                    {plan.id === 'pro' && (
                      <ProCheckoutButton
                        billingPeriod={billingPeriod}
                        className="w-full py-3 text-sm font-semibold transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg"
                      >
                        {plan.cta}
                      </ProCheckoutButton>
                    )}
                    {plan.id === 'power' && (
                      <PowerCheckoutButton
                        billingPeriod={billingPeriod}
                        className="w-full py-3 text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        {plan.cta}
                      </PowerCheckoutButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Success Metrics & Trust Signals */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Join Arizona's Fastest-Growing Business Directory
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl font-bold text-green-600 mb-3">20,000+</div>
                <div className="text-base text-gray-600">Arizona Businesses Growing</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl font-bold text-green-600 mb-3">95%</div>
                <div className="text-base text-gray-600">Power Customers Recommend Us</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl font-bold text-green-600 mb-3">10x</div>
                <div className="text-base text-gray-600">Average ROI for Power Users</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureComparisonTable />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection className="bg-muted/30" />

      {/* Contact CTA */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Plans?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is here to help you choose the right plan for your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
              <a href="tel:+1-555-123-4567">
                <Phone className="mr-2 h-4 w-4" />
                Call (555) 123-4567
              </a>
            </Button>
            <Button asChild size="lg">
              <a href="mailto:hello@azbusiness.services">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}