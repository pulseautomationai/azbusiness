import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, CheckCircle, Heart, Shield, Handshake, Users, ExternalLink, User, MapPin, Building2, Target, Star, TrendingUp, Sun } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  const title = "About John Schulenburg & AZ Business Services - Proudly Built in Arizona";
  const description = "Meet John Schulenburg, founder of AZ Business Services. Learn why he built this platform to help Arizona businesses grow and connect with local customers.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
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
      
      {/* Hero Section: Arizona Roots, Local Commitment */}
      <section className="pt-32 pb-20 relative overflow-hidden bg-agave-cream">
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
            A Better Way to Find — and <span className="text-ocotillo-red">Be Found</span> — in Arizona
          </h1>
          <p className="text-lg lg:text-xl text-ironwood-charcoal/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            We make it easy for homeowners to find trusted local pros — and for Arizona businesses to get seen without jumping through hoops. Start free, upgrade anytime. No bidding. No lead selling. Just tools that work when you're ready to grow.
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
                List Your Business Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why I Built AZ Business Services (Founder Section) */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal">
              A Message from John, Our Founder
            </h2>
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
                A Better Directory for Arizona — Simple, Honest, Effective
              </h3>
              
              <div className="space-y-6 text-base lg:text-lg leading-relaxed text-ironwood-charcoal">
                <p>
                  The problem with platforms like Angi and Thumbtack is that they make things complicated — for both homeowners and businesses. Paywalls, lead reselling, aggressive upsells, and confusing listings have turned local service discovery into a mess.
                </p>
                <p>
                  AZ Business Services was created to fix that.
                </p>
                <p>
                  We've built a directory that's easy to understand, free to get started, and actually helpful — whether you're trying to find a trusted pro or get found as one.
                </p>
                <p>
                  No middlemen. No commissions. No spam. Just verified local professionals, clear listings, and real connections.
                </p>
              </div>
              
              <p className="mt-8 text-sm font-medium text-ironwood-charcoal/70">
                — John Schulenburg, Founder of AZ Business Services
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* We're Not Like the Big Directories */}
      <section className="py-24 bg-agave-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-6">
              We're Not Like the Big Directories
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Big Directories */}
            <Card className="bg-white border-gray-200 shadow-sm p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-ironwood-charcoal mb-8">
                  Big Directories
                </h3>
                <div className="space-y-4 text-sm text-ironwood-charcoal/70">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Pay-to-play listings</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Leads get sold</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Hidden fees & gatekeeping</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>National model</span>
                    <span className="text-red-500">❌</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cold algorithms</span>
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
                    <span>Free to list, fair to grow</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>You connect directly with homeowners</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Transparent, local, human</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-prickly-pear-pink/20 pb-2">
                    <span>Arizona-only, community-first</span>
                    <span className="text-green-500">✅</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Personal care, verified profiles</span>
                    <span className="text-green-500">✅</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Let's Grow Together (Pulse Automation CTA) */}
      <section className="py-24 bg-agave-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ironwood-charcoal mb-8">
            Ready to Go Even Further?
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6 text-base lg:text-lg leading-relaxed text-ironwood-charcoal mb-8">
            <p>
              This directory is just the beginning. If you're a service business looking to automate follow-up, save hours each week, and close more leads — I'd love to help.
            </p>
            <p>
              I run Pulse Automation, where I help service businesses implement simple AI tools that actually work. No gimmicks, just results.
            </p>
          </div>
          
          <Button asChild variant="outline" className="border-prickly-pear-pink text-prickly-pear-pink hover:bg-prickly-pear-pink hover:text-white px-8 py-3">
            <Link to="#" className="inline-flex items-center">
              Explore Pulse Automation
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Call-to-Action Footer Banner */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-r from-desert-sky-blue to-ocotillo-red">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-20 bg-white"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-20 bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-10 bg-white"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-serif text-4xl lg:text-5xl font-medium mb-6 text-white">
            Whether You're Looking or Listing — We're Here to Help Arizona Thrive
          </h2>
          <p className="text-xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join thousands of Arizona homeowners and businesses who've found success through our local-first platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto px-8 py-3 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white text-ocotillo-red border-2 border-white hover:bg-ocotillo-red hover:text-white" 
            >
              <Link to="/categories">
                Browse Local Pros
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 font-semibold border-2 border-white text-white rounded-full hover:bg-white hover:text-ironwood-charcoal transition-all duration-300 hover:scale-105" 
            >
              <Link to="/add-business">
                List Your Business
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}