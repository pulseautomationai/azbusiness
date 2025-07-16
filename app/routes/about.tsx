import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, CheckCircle, Heart, Shield, Handshake, Users, ExternalLink, User, MapPin, Building2, Target, Star, TrendingUp, Sun } from "lucide-react";
import { Link } from "react-router";
import { SEOGenerator } from "~/utils/seo";
import { generateMetaTags } from "~/components/seo/seo-meta";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  const title = "Why Choose Us - AZ Business Services";
  const description = "Meet John Schulenburg, founder of AZ Business Services. Learn why he built this platform to help Arizona businesses grow and connect with local customers.";

  // Create custom SEO for about page
  const seo = {
    title,
    description,
    keywords: "AZ Business Services, Arizona business directory, John Schulenburg, local businesses, about us, founder",
    canonical: "https://azbusiness.services/about",
    openGraph: {
      title,
      description,
      type: "website" as const,
      url: "https://azbusiness.services/about",
      image: "/logo.png",
      siteName: "AZ Business Services",
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
      image: "/logo.png",
      site: "@azbusiness",
    },
  };

  const { metaTags } = generateMetaTags(seo);
  return metaTags;
}

// Temporarily disabled for SPA mode
// export async function loader() {
//   return {
//     isSignedIn: false, // Simplified for about page
//     hasActiveSubscription: false,
//   };
// }

export default function AboutPage() {
  return (
    <>
      <Header />
      
      {/* Hero Section: Professional Presentation Focus */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-agave-cream">
        {/* Subtle topographic pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="absolute top-10 left-10 fill-prickly-pear-pink">
            <path d="M30 0C13.4 0 0 13.4 0 30s13.4 30 30 30 30-13.4 30-30S46.6 0 30 0zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
          </svg>
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="absolute top-32 right-20 fill-prickly-pear-pink">
            <path d="M20 0L24 12L36 8L32 20L40 24L28 28L32 40L20 36L16 48L12 36L0 40L4 28L-8 24L4 20L0 8L12 12L16 0L20 0z"/>
          </svg>
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-20 left-1/4 fill-prickly-pear-pink">
            <path d="M25 0L30 15L45 10L40 25L50 30L35 35L40 50L25 45L20 60L15 45L0 50L5 35L-10 30L5 25L0 10L15 15L20 0L25 0z"/>
          </svg>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ironwood-charcoal mb-6">
            Build the Professional Presence That <span className="text-ocotillo-red">Converts Every Visitor</span> Into a Customer
          </h1>
          <p className="text-lg lg:text-xl text-ironwood-charcoal/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join Arizona business owners who chose professional presentation and predictable costs over expensive shared leads and bidding wars.
          </p>
          <p className="text-base lg:text-lg text-ironwood-charcoal/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            We make it easy for Arizona businesses to build credibility and capture every inquiry exclusively. No sharing leads with competitors. No paying $80-100 per inquiry. Just professional presentation that works when customers find you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto px-8 py-3 font-semibold tracking-wide rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-ocotillo-red text-white"
            >
              <Link to="/categories">
                Browse Local Pros
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 font-semibold tracking-wide border-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-prickly-pear-pink text-ironwood-charcoal bg-transparent"
            >
              <Link to="/claim-business">
                Build Your Professional Presence
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Founder Message - Building Arizona's Business Directory Together */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal">
              A Message from John, Our Founder
            </h2>
            <p className="text-lg text-ironwood-charcoal/70 mt-4">
              Building Arizona's Business Directory — Together
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
            {/* John's Profile Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-lg">
                <img 
                  src="/john-schulenburg-profile.jpeg" 
                  alt="John Schulenburg, Founder of AZ Business Services" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-serif text-xl lg:text-2xl font-medium text-ironwood-charcoal mb-6">
                My Background in Home Services
              </h3>
              
              <div className="space-y-6 text-base lg:text-lg leading-relaxed text-ironwood-charcoal">
                <p>
                  I've spent years helping home service businesses grow through my automation company, <a href="https://pulseautomation.ai" target="_blank" rel="noopener noreferrer" className="text-ocotillo-red hover:text-ocotillo-red/80 underline">Pulse Automation</a>. Working with contractors across Arizona, I kept seeing the same frustration: expensive, shared leads from Thumbtack and Angi that created bidding wars and unpredictable costs.
                </p>
                
                <h4 className="font-serif text-lg lg:text-xl font-medium text-ironwood-charcoal mt-8 mb-4">
                  The Problem with Lead Generation Platforms
                </h4>
                
                <p>
                  After watching too many contractors struggle with $80-100 leads shared with 3-5 competitors, I realized the real problem wasn't just cost — it was the entire approach. These platforms create a race to the bottom that hurts quality businesses.
                </p>
                
                <h4 className="font-serif text-lg lg:text-xl font-medium text-ironwood-charcoal mt-8 mb-4">
                  A Better Philosophy
                </h4>
                
                <p>
                  I built AZ Business Services with a simple belief: invest in professional presentation that converts visitors into exclusive inquiries, instead of buying expensive shared leads.
                </p>
                
                <div className="bg-agave-cream p-6 rounded-lg my-8">
                  <h5 className="font-semibold text-ironwood-charcoal mb-4">Our approach:</h5>
                  <ul className="space-y-2 text-ironwood-charcoal/80">
                    <li>• Professional presence that builds immediate trust</li>
                    <li>• Exclusive inquiries (never shared with competitors)</li>
                    <li>• Predictable monthly investment</li>
                    <li>• AI-enhanced listings that showcase your expertise</li>
                  </ul>
                </div>
                
                <h4 className="font-serif text-lg lg:text-xl font-medium text-ironwood-charcoal mt-8 mb-4">
                  The Real Difference
                </h4>
                
                <p>
                  When customers find you through our directory, they see a professional, verified profile that builds confidence. They contact you directly — not you plus 4 competitors.
                </p>
                <p>
                  No bidding wars. No shared leads. No surprise costs. Just professional presentation that works.
                </p>
                <p>
                  As Arizona's directory grows, every business benefits from increased visibility while paying the same predictable rate.
                </p>
              </div>
              
              <p className="mt-8 text-sm font-medium text-ironwood-charcoal/70">
                — John Schulenburg, Founder of AZ Business Services & <a href="https://pulseautomation.ai" target="_blank" rel="noopener noreferrer" className="text-ocotillo-red hover:text-ocotillo-red/80 underline">Pulse Automation</a>
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Why Arizona Businesses Choose Professional Presentation */}
      <section className="py-24 bg-agave-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-6">
              Why Arizona Businesses Choose AZ Business Services Over Lead Generation Platforms
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Lead Generation Platforms */}
            <Card className="bg-white border-gray-200 shadow-sm p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-ironwood-charcoal mb-8">
                  Lead Generation Platforms
                </h3>
                <div className="space-y-4 text-sm text-ironwood-charcoal/70">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>$80-100 per shared lead</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>3-5 contractors compete for every lead</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Pay for bad leads too</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Basic contractor profile only</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Unpredictable monthly costs</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Comparison shopping focus</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Hope to bid lowest</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>No lasting business presence</span>
                    <span className="text-red-500">❌</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AZ Business Services */}
            <Card className="bg-white border-prickly-pear-pink shadow-sm p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-ironwood-charcoal mb-8">
                  AZ Business Services
                </h3>
                <div className="space-y-4 text-sm text-ironwood-charcoal/70">
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>$9-97/month predictable pricing</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Exclusive leads (Power tier only)</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Professional AI-enhanced listings</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Featured category placement (Pro+)</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Homepage featuring (Power)</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>AI business intelligence (Power)</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Professional image galleries (Power)</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lasting directory presence</span>
                    <span className="text-green-500">✅</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Cost Comparison Callout */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white border-2 border-ocotillo-red rounded-lg p-8 text-center">
              <div className="text-2xl mb-4">💰 <span className="font-semibold text-ironwood-charcoal">The Math is Simple</span></div>
              <div className="space-y-3 text-ironwood-charcoal/80">
                <div className="flex justify-between items-center">
                  <span>Thumbtack: Just 2 shared leads</span>
                  <span className="font-semibold text-red-600">$160-200/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>AZ Business Power: Unlimited exclusive contact</span>
                  <span className="font-semibold text-green-600">$97/month</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-ironwood-charcoal/70 italic">
                    Every inquiry comes directly to you — no competitors involved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Growth Philosophy */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-6">
              Our Growth Philosophy
            </h2>
            <p className="text-lg text-ironwood-charcoal/70">
              Building Arizona's Premier Business Directory — Together
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Starting Strong */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Starting Strong
              </h3>
              <p className="text-ironwood-charcoal/70 leading-relaxed">
                Every business gets professional presentation from day one. Even with limited traffic initially, you're positioned to convert every visitor who finds you.
              </p>
            </div>

            {/* Growing Together */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Growing Together
              </h3>
              <p className="text-ironwood-charcoal/70 leading-relaxed">
                As more Arizona residents discover our directory, your business benefits from increased visibility while paying the same predictable rate. No traffic = no additional costs.
              </p>
            </div>

            {/* Quality Over Quantity */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Quality Over Quantity
              </h3>
              <p className="text-ironwood-charcoal/70 leading-relaxed">
                Better to convert 3 exclusive inquiries than compete for 10 shared leads. Professional presentation builds trust before customers even contact you.
              </p>
            </div>

            {/* Future Ready */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Future Ready
              </h3>
              <p className="text-ironwood-charcoal/70 leading-relaxed">
                When you're ready to scale beyond directory listings, Pulse Automation provides the tools to manage and grow your business systematically.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <p className="text-xl text-ironwood-charcoal/80 italic">
              "We're not just building a directory — we're building Arizona's business community."
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-agave-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-6">
              What Our Arizona Customers Say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sarah Martinez */}
            <Card className="bg-white border-prickly-pear-pink/20 shadow-sm p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-agave-cream rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="font-semibold text-ironwood-charcoal mb-2">Sarah Martinez</h3>
                <p className="text-sm text-ironwood-charcoal/60 mb-4">Phoenix HVAC</p>
                <p className="text-ironwood-charcoal/70 leading-relaxed text-sm">
                  "The professional presentation makes a huge difference. Customers see my verification badge and detailed profile before contacting me. No more competing with 4 other contractors for the same customer."
                </p>
              </div>
            </Card>

            {/* Mike Rodriguez */}
            <Card className="bg-white border-prickly-pear-pink/20 shadow-sm p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-agave-cream rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚰</span>
                </div>
                <h3 className="font-semibold text-ironwood-charcoal mb-2">Mike Rodriguez</h3>
                <p className="text-sm text-ironwood-charcoal/60 mb-4">Scottsdale Plumber</p>
                <p className="text-ironwood-charcoal/70 leading-relaxed text-sm">
                  "I was spending $300-400/month on Thumbtack for shared leads. Now I pay $97 and every inquiry comes directly to me. Much better quality conversations."
                </p>
              </div>
            </Card>

            {/* Jennifer Chen */}
            <Card className="bg-white border-prickly-pear-pink/20 shadow-sm p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-agave-cream rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-ironwood-charcoal mb-2">Jennifer Chen</h3>
                <p className="text-sm text-ironwood-charcoal/60 mb-4">Mesa Electrical</p>
                <p className="text-ironwood-charcoal/70 leading-relaxed text-sm">
                  "The AI-enhanced profile and professional images give customers confidence before they even call. I close deals faster because they already trust me from my listing."
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Arizona Community Focus */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-6">
              Proudly Arizona-Based, Arizona-Focused
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Local Understanding */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">🌵</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Local Understanding
              </h3>
              <ul className="text-ironwood-charcoal/70 leading-relaxed text-sm space-y-2">
                <li>• Built by Arizona residents for Arizona businesses</li>
                <li>• Understanding of seasonal patterns and local market dynamics</li>
                <li>• Connected to Arizona business communities statewide</li>
              </ul>
            </div>

            {/* Community Growth */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Community Growth
              </h3>
              <ul className="text-ironwood-charcoal/70 leading-relaxed text-sm space-y-2">
                <li>• Supporting local business ownership and success</li>
                <li>• Building lasting professional relationships</li>
                <li>• Keeping marketing investments in Arizona communities</li>
              </ul>
            </div>

            {/* Statewide Coverage */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-agave-cream rounded-full flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4">
                Statewide Coverage
              </h3>
              <ul className="text-ironwood-charcoal/70 leading-relaxed text-sm space-y-2">
                <li>• Phoenix, Tucson, Flagstaff, Scottsdale, Mesa, and beyond</li>
                <li>• 50+ Arizona cities represented</li>
                <li>• Growing network of verified local professionals</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <p className="text-xl text-ironwood-charcoal/80 italic">
              "When Arizona businesses succeed, our communities thrive."
            </p>
          </div>
        </div>
      </section>

      {/* Ready for What's Next? (Pulse Automation CTA) */}
      <section className="py-24 bg-agave-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-8">
            Ready for What's Next?
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6 text-base lg:text-lg leading-relaxed text-ironwood-charcoal mb-8">
            <p>
              Building a professional directory presence is just the beginning. For established businesses ready to scale their operations, Pulse Automation provides complete business automation systems.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
              <div>
                <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4 flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  When You're Ready to Scale
                </h3>
                <ul className="text-ironwood-charcoal/70 space-y-2 text-sm">
                  <li>• Automated customer follow-up and management</li>
                  <li>• Custom AI workflows for your industry</li>
                  <li>• Complete business automation and optimization</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-medium text-ironwood-charcoal mb-4 flex items-center">
                  <span className="text-2xl mr-3">📈</span>
                  Natural Progression
                </h3>
                <div className="text-ironwood-charcoal/70 space-y-2 text-sm">
                  <p>Many of our successful directory customers add automation when they want to:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Handle more inquiries without adding staff</li>
                    <li>• Automate repetitive business processes</li>
                    <li>• Scale operations systematically</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-ironwood-charcoal/80">
              This creates a complete pathway from professional presentation to business transformation — but only when you're ready.
            </p>
          </div>
          
          <Button asChild variant="outline" className="border-ocotillo-red text-ocotillo-red hover:bg-ocotillo-red hover:text-white px-8 py-3 font-semibold">
            <a href="https://pulseautomation.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
              Learn About Business Automation
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>


      {/* Start Building Your Professional Presence Today */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-r from-desert-sky-blue to-ocotillo-red">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-20 bg-white"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-20 bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-10 bg-white"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-serif text-4xl lg:text-5xl font-medium mb-6 text-white">
            Start Building Your Professional Presence Today
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join Arizona business owners who chose sustainable growth over expensive lead buying.
          </p>
          
          <div className="text-center mb-12">
            <h3 className="font-serif text-2xl font-medium text-white mb-8">Choose Your Growth Level:</h3>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Start Professional */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2">🚀</div>
                <h4 className="font-semibold text-white text-lg mb-2">Start Professional</h4>
                <p className="text-white/80 text-sm mb-4">$9/month</p>
                <div className="text-white/70 text-sm space-y-1">
                  <p>→ AI-enhanced business profile</p>
                  <p>→ Verification and trust signals</p>
                  <p>→ Professional foundation</p>
                </div>
              </div>
              
              {/* Build Visibility */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2">📈</div>
                <h4 className="font-semibold text-white text-lg mb-2">Build Visibility</h4>
                <p className="text-white/80 text-sm mb-4">$29/month</p>
                <div className="text-white/70 text-sm space-y-1">
                  <p>→ Featured category placement</p>
                  <p>→ Enhanced service presentation</p>
                  <p>→ Stand out from competitors</p>
                </div>
              </div>
              
              {/* Complete Package */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2">💪</div>
                <h4 className="font-semibold text-white text-lg mb-2">Complete Package</h4>
                <p className="text-white/80 text-sm mb-4">$97/month</p>
                <div className="text-white/70 text-sm space-y-1">
                  <p>→ Homepage featuring and maximum visibility</p>
                  <p>→ Professional image gallery</p>
                  <p>→ Direct contact form (exclusive inquiries)</p>
                  <p className="text-white/50 italic">Less than one Thumbtack lead per month</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto px-8 py-3 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white text-ocotillo-red border-2 border-white hover:bg-ocotillo-red hover:text-white" 
            >
              <Link to="/claim-business">
                Build Your Professional Presence
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 font-semibold border-2 border-white text-white rounded-full hover:bg-white hover:text-ironwood-charcoal transition-all duration-300 hover:scale-105" 
            >
              <Link to="/pricing">
                See All Features and Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}