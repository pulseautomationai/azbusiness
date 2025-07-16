import { useState } from "react";
import { Check, X, Star, TrendingUp, ArrowRight, Phone, Mail, Globe, BarChart3, Lightbulb, MessageCircle, Tag, Building, Image, Settings, Crown, Zap, Shield, MapPin, Target, Brain, DollarSign, Award } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import FAQSection from "~/components/ui/faq-section";
import { StarterCheckoutButton, ProCheckoutButton, PowerCheckoutButton } from "~/components/payments/PolarCheckoutButton";

interface PricingSectionProps {
  isSignedIn: boolean;
}

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    yearlyPrice: 7,
    description: "Start Professional From Day One",
    tagline: "Perfect for new businesses wanting immediate professional credibility",
    icon: "🚀",
    features: [
      "Professional business listing",
      "AI-generated summary",
      "Verification badge",
      "SEO backlink to your website",
      "Google reviews display (3)",
      "Basic service list",
      "Complete contact info",
      "Mobile-optimized profile",
    ],
    limitations: [
      "No lead generation",
      "Cannot edit AI summary",
      "Standard placement only",
      "Basic service presentation",
    ],
    cta: "Start Professional",
    popular: false,
    color: "blue",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    yearlyPrice: 22,
    description: "Build Professional Presence",
    tagline: "Perfect for growing your visibility before lead generation",
    icon: "⭐",
    features: [
      "Everything in Starter",
      "Editable AI business summary",
      "Featured category listing",
      "Enhanced service cards",
      "Google reviews display (10)",
      "Active badge system",
      "Content editing control",
      "Priority placement",
    ],
    limitations: [
      "No lead generation",
      "No image gallery",
      "No homepage featuring",
    ],
    cta: "Build Presence",
    popular: false,
    color: "yellow",
  },
  {
    id: "power",
    name: "Power",
    price: 97,
    yearlyPrice: 73,
    description: "Complete Professional Directory Presence",
    tagline: "Premium directory listing with exclusive lead capture",
    icon: "⚡",
    features: [
      "Premium Directory Listing: Enhanced visibility in Arizona's premier business directory",
      "Exclusive Lead Capture: Direct customer inquiries from your professional listing",
      "AI-Enhanced Presentation: Stand out with intelligent business summaries and insights",
      "Professional Image Gallery: Showcase your work and build customer trust",
      "Enhanced Visibility: Homepage featuring and priority category placement",
      "Predictable Investment: Unlimited leads for $97 vs $80-100 per shared lead elsewhere",
      "AI review analysis and unlimited Google reviews",
      "Priority customer support",
    ],
    limitations: [],
    cta: "Start Growing Now",
    popular: true,
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
              Professional Listings, <span className="text-ocotillo-red">Predictable Pricing</span>
            </h1>
            <p className="text-lg lg:text-xl text-ironwood-charcoal/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              Unlike Thumbtack and Angi that charge $80-100 per shared lead, we provide exclusive leads
              through Arizona's most professional business directory for one flat monthly rate.
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full relative ${
                  plan.popular ? 'border-2 border-green-500 scale-105 hover:scale-110 shadow-2xl ring-2 ring-green-200' : 'hover:scale-105'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg">
                      Most Popular
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
                        ${billingPeriod === "yearly" ? plan.yearlyPrice : plan.price}
                      </p>
                      <p className="text-sm text-gray-500">
                        {billingPeriod === "yearly" ? 
                          `Billed annually ($${plan.yearlyPrice * 12}/year)` : 
                          "Billed monthly"
                        }
                      </p>
                    </div>
                    
                    {/* Value Proposition */}
                    {plan.id === "starter" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Why choose Starter?</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Professional credibility from day one</li>
                          <li>• Cost effective (less than $2.50 per week)</li>
                          <li>• Immediate trust signals</li>
                          <li>• Search engine benefits</li>
                        </ul>
                      </div>
                    )}
                    
                    {plan.id === "pro" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Why choose Pro?</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Control over your messaging</li>
                          <li>• Enhanced visibility over competitors</li>
                          <li>• Professional service presentation</li>
                          <li>• More social proof (10 vs 3 reviews)</li>
                        </ul>
                        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                          <strong>Ready for leads?</strong> Upgrade to Power anytime to start receiving customer inquiries
                        </div>
                      </div>
                    )}
                    
                    {plan.id === "power" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-800 mb-3">Why choose Power?</p>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">🏆</span>
                            <span><strong>Premium Directory Presence:</strong> Stand out in Arizona's fastest-growing business directory</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">📞</span>
                            <span><strong>Unlimited Exclusive Leads:</strong> Stop paying $80-100 per shared lead</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">🤖</span>
                            <span><strong>AI-Enhanced Listing:</strong> Professional presentation that builds customer trust</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">📸</span>
                            <span><strong>Professional Showcase:</strong> Image gallery proves your work quality</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">🎯</span>
                            <span><strong>Local Market Leader:</strong> Dominate your category in Arizona's premier directory</span>
                          </li>
                        </ul>
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                          <div className="text-sm font-bold text-green-800 mb-1">ROI Calculator:</div>
                          <div className="text-xs text-green-700">
                            <div className="grid grid-cols-2 gap-2">
                              <div><strong>Thumbtack/Angi:</strong> $80-100 per lead</div>
                              <div><strong>Power:</strong> $97/month unlimited</div>
                            </div>
                            <div className="mt-2 text-center font-semibold">
                              ✅ Break even with just 1-2 leads per month
                            </div>
                            <div className="mt-1 text-center text-xs">
                              Typical ROI: 500-1000% return on investment
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
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Arizona Businesses Growing</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-sm text-gray-600">Power Customers Recommend Us</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">10x</div>
                <div className="text-sm text-gray-600">Average ROI for Power Users</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection className="bg-background" />

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