import { useState } from "react";
import { Check, X, Star, TrendingUp, ArrowRight, Phone, Mail, Globe, BarChart3, Lightbulb, MessageCircle, Tag, Building, Image, Settings } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import FAQSection from "~/components/ui/faq-section";

interface PricingSectionProps {
  isSignedIn: boolean;
}

const pricingPlans = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    description: "Perfect for getting started with basic visibility",
    icon: "📝",
    features: [
      "1 category listing",
      "Contact info shown", 
      "Reviews enabled",
      "Visible in city + category pages",
      "Editable profile",
      "Basic business hours",
      "Phone number display",
    ],
    limitations: [
      "No homepage spotlight",
      "No priority placement",
      "Limited to 1 category",
      "No analytics",
      "No lead management",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 29,
    description: "Stand out from the competition with enhanced features",
    icon: "✨",
    features: [
      "Everything in Free Plan",
      "Homepage spotlight",
      "Top-of-category priority",
      "Multi-category listings",
      "Social media + image gallery",
      "Priority support",
      "Basic analytics dashboard",
      "Business verification badge",
    ],
    limitations: [
      "No SEO copywriting",
      "No automated follow-up",
      "No blog posts",
      "Limited analytics",
    ],
    cta: "Start Pro Plan",
    popular: true,
  },
  {
    id: "power",
    name: "Power Plan", 
    price: 97,
    description: "Complete marketing solution for serious growth",
    icon: "⚡",
    features: [
      "Everything in Pro Plan",
      "Lead-gen strategy call",
      "SEO copywriting for profile",
      "Automated follow-up forms",
      "Google Review Booster",
      "2 blogs/month",
      "VIP badge + top-tier visibility",
      "Advanced analytics & reporting",
      "Dedicated account manager",
      "Priority phone support",
    ],
    limitations: [],
    cta: "Go Power",
    popular: false,
  },
];

export default function PricingSection({ isSignedIn }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-background pt-24">


      {/* Pricing Cards Section */}
      <section className="py-16" style={{ backgroundColor: '#FDF8F3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ironwood-charcoal mb-6">
              Built for <span className="text-ocotillo-red">Arizona Businesses</span> — No Bidding, No Spam, Just Results
            </h1>
            <p className="text-lg lg:text-xl text-ironwood-charcoal/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Claim your listing, stand out from competitors, and get leads straight to your inbox.
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
                    Save 20%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 space-y-8 md:space-y-0 max-w-6xl mx-auto">
            {/* Free Plan Card */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Start Here: Free Local Listing
                    </h3>
                    <span className="inline-block mt-1 mb-2 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Start here
                    </span>
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      Perfect for new or unclaimed listings who want to build visibility
                    </p>
                  </div>
                  
                  <div className="text-center mb-8">
                    <p className="text-4xl font-bold text-gray-900 mb-1">$0</p>
                    <p className="text-sm text-gray-500">Forever free</p>
                  </div>
                  
                  {/* Claim Benefits - Moved to Top */}
                  <div className="border border-green-200 rounded-md shadow-sm p-4 bg-green-50 mb-6">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Claim your listing and unlock:</p>
                    <ul className="text-sm text-gray-700 space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>A free SEO backlink to your website</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Image className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Add your logo to boost credibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Globe className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Increased visibility in local searches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Settings className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>A simple checklist to optimize your listing</span>
                      </li>
                    </ul>
                    <Button 
                      asChild 
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                    >
                      <Link to="/claim-business">Claim Your Free Listing</Link>
                    </Button>
                  </div>

                  {/* Feature List */}
                  <div className="mt-6 space-y-6 text-left">
                    {/* Core Presence */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Core Presence</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Public Business Listing
                            <span className="block text-xs text-gray-500 mt-0.5">Show up in local search results</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>Google Reviews</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Tabs (Overview, Services, Reviews)
                            <span className="block text-xs text-gray-500 mt-0.5">Showcase services, reviews, and more in one place</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Lead Generation */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lead Generation</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Similar Businesses Carousel
                            <span className="block text-xs text-gray-500 mt-0.5">Priority placement</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Leads from Your Listing </span>
                        </li>
                      </ul>
                    </div>

                    {/* Branding & Trust */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Branding & Trust</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Verified Badge </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Business Summary </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Service Display </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Badge System </span>
                        </li>
                      </ul>
                    </div>

                    {/* SEO & Analytics */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">SEO & Analytics</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">SEO Backlink </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Review Insights </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Category Boost </span>
                        </li>
                      </ul>
                    </div>

                    {/* Premium Services */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Premium Services</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">VIP Support </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Monthly Blog Posts </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
                
              </div>
            </div>

            {/* Power Plan Card - Emphasized Center */}
            <div className="bg-white border-2 border-[#D9B07A] shadow-xl rounded-xl scale-105 hover:scale-110 transition-all duration-300 relative z-10 flex flex-col h-full">
              {/* Recommended Badge */}
              <div className="absolute -top-3 sm:top-[-20px] left-1/2 transform -translate-x-1/2">
                <span className="bg-[#D9B07A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Recommended
                </span>
              </div>
              
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Get Leads on Autopilot
                    </h3>
                    <span className="inline-block mt-1 mb-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[#D9B07A]/10 text-[#D9B07A]">
                      Best for growth
                    </span>
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      For established businesses who want premium placement, AI-powered tools, and concierge-level support
                    </p>
                  </div>
                  
                  <div className="text-center mb-8">
                    <p className="text-4xl font-bold text-gray-900 mb-1">
                      ${billingPeriod === "yearly" ? "78" : "97"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {billingPeriod === "yearly" ? "Billed annually ($936/year)" : "Billed monthly"}
                    </p>
                  </div>
                  
                  {/* Power Plan Benefits */}
                  <div className="border border-[#D9B07A] bg-[#fdf9f3] rounded-md px-4 py-4 mb-6">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Why choose Power?</p>
                    <ul className="text-sm leading-6 text-gray-700 space-y-2">
                      <li className="flex gap-2">
                        <MessageCircle className="w-5 h-5 text-[#D9B07A] mt-0.5 flex-shrink-0" />
                        <span>Leads sent directly to your inbox — no chasing, no bidding</span>
                      </li>
                      <li className="flex gap-2">
                        <Lightbulb className="w-5 h-5 text-[#D9B07A] mt-0.5 flex-shrink-0" />
                        <span>1 SEO blog post written for you every month<br/><span className="text-xs text-gray-500">We write SEO-optimized content for you</span></span>
                      </li>
                      <li className="flex gap-2">
                        <Star className="w-5 h-5 text-[#D9B07A] mt-0.5 flex-shrink-0" />
                        <span>Featured placement on homepage for extra visibility</span>
                      </li>
                      <li className="flex gap-2">
                        <Lightbulb className="w-5 h-5 text-[#D9B07A] mt-0.5 flex-shrink-0" />
                        <span>AI-enhanced listings with advanced style and formatting<br/><span className="text-xs text-gray-500">Stand out with automatically polished formatting</span></span>
                      </li>
                      <li className="flex gap-2">
                        <Phone className="w-5 h-5 text-[#D9B07A] mt-0.5 flex-shrink-0" />
                        <span>Dedicated VIP support and concierge-level service</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="w-5 h-5 text-[#D9B07A] mt-0.5 flex-shrink-0" />
                        <span>Everything in Pro</span>
                      </li>
                    </ul>
                  </div>

                  {/* Feature List */}
                  <div className="mt-6 space-y-6 text-left">
                    {/* Core Presence */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Core Presence</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Public Business Listing
                            <span className="block text-xs text-gray-500 mt-0.5">Show up in local search results</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>Google Reviews</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Tabs (Overview, Services, Reviews)
                            <span className="block text-xs text-gray-500 mt-0.5">Showcase services, reviews, and more in one place</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Lead Generation */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lead Generation</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Similar Businesses Carousel
                            <span className="block text-xs text-gray-500 mt-0.5">Priority placement</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Leads from Your Listing
                            <span className="block text-xs text-gray-500 mt-0.5">Auto-Matched + Alerts</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Branding & Trust */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Branding & Trust</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Verified Badge
                            <span className="block text-xs text-gray-500 mt-0.5">Prove you're a trusted provider</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Lightbulb className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Business Summary
                            <span className="block text-xs text-gray-500 mt-0.5">AI-enhanced + Style Options</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Tag className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Service Display
                            <span className="block text-xs text-gray-500 mt-0.5">Enhanced AI Cards with Pricing</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Badge System
                            <span className="block text-xs text-gray-500 mt-0.5">All + Bonus Badges</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* SEO & Analytics */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">SEO & Analytics</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Globe className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>SEO Backlink</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <BarChart3 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Review Insights
                            <span className="block text-xs text-gray-500 mt-0.5">AI Sentiment & Keyword Analysis</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Category Boost
                            <span className="block text-xs text-gray-500 mt-0.5">+ Homepage Featured Placement</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Premium Services */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Premium Services</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            VIP Support
                            <span className="block text-xs text-gray-500 mt-0.5">Dedicated Concierge Access</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Lightbulb className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Monthly Blog Posts
                            <span className="block text-sm text-gray-600 mt-0.5">1/mo AI-powered Blog Post</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button 
                    asChild 
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Link to="/sign-up">Get Started Now</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full" style={{ backgroundColor: '#F9F6F3' }}>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Stand Out: Build Trust & Credibility
                    </h3>
                    <span className="inline-block mt-1 mb-2 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      Most popular
                    </span>
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      Designed for growing businesses that want more visibility and reputation tools
                    </p>
                  </div>
                  
                  <div className="text-center mb-8">
                    <p className="text-4xl font-bold text-gray-900 mb-1">
                      ${billingPeriod === "yearly" ? "23" : "29"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {billingPeriod === "yearly" ? "Billed annually ($276/year)" : "Billed monthly"}
                    </p>
                  </div>
                  
                  {/* Pro Plan Benefits */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-4 mb-6">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Why choose Pro?</p>
                    <ul className="text-sm leading-6 text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Verified badge and business summary for trust</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Tag className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Professional service display with cards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Review insights and SEO backlink included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Everything in Free</span>
                      </li>
                    </ul>
                  </div>

                  {/* Feature List */}
                  <div className="mt-6 space-y-6 text-left">
                    {/* Core Presence */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Core Presence</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Public Business Listing
                            <span className="block text-xs text-gray-500 mt-0.5">Show up in local search results</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>Google Reviews</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Tabs (Overview, Services, Reviews)
                            <span className="block text-xs text-gray-500 mt-0.5">Showcase services, reviews, and more in one place</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Lead Generation */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lead Generation</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Building className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Similar Businesses Carousel
                            <span className="block text-xs text-gray-500 mt-0.5">Priority placement</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Leads from Your Listing</span>
                        </li>
                      </ul>
                    </div>

                    {/* Branding & Trust */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Branding & Trust</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Verified Badge
                            <span className="block text-xs text-gray-500 mt-0.5">Prove you're a trusted provider</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Lightbulb className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Business Summary
                            <span className="block text-xs text-gray-500 mt-0.5">Full view</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Tag className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Service Display
                            <span className="block text-xs text-gray-500 mt-0.5">Service cards</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <Star className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Badge System
                            <span className="block text-xs text-gray-500 mt-0.5">Standard</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* SEO & Analytics */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">SEO & Analytics</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start">
                          <Globe className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>SEO Backlink</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <BarChart3 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Review Insights
                            <span className="block text-xs text-gray-500 mt-0.5">Basic</span>
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>
                            Category Boost
                            <span className="block text-xs text-gray-500 mt-0.5">Get featured at the top of your category</span>
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Premium Services */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Premium Services</h4>
                      <ul className="text-sm leading-5 text-gray-800 space-y-2">
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">VIP Support </span>
                        </li>
                        <li className="flex gap-2 items-start text-gray-400">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          <span className="line-through">Monthly Blog Posts </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button 
                    asChild 
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Link to="/sign-up">Get Started Now</Link>
                  </Button>
                </div>
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