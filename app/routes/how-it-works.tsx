import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";
import { Search, ArrowRight, CheckCircle2, FileText, Settings, TrendingUp, Zap, Heart, Shield, DollarSign, Award, Users, Star, Quote, Target, Home, Building, Handshake } from "lucide-react";
import type { Route } from "./+types/how-it-works";

export function meta({}: Route.MetaArgs) {
  const title = "How AZ Business Services Helps You Succeed | Arizona's Local Business Directory";
  const description = "Discover how AZ Business Services connects homeowners with trusted local businesses and helps Arizona businesses grow. Simple, transparent, and spam-free.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      
      <main>
        {/* === HERO SECTION === */}
        <section className="relative bg-agave-cream pt-36 pb-16 overflow-hidden">
          {/* Subtle Topographic Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg
              className="absolute top-10 left-10 w-32 h-32 text-prickly-pear-pink"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Topographic Lines */}
              <path d="M20 30 Q40 25 60 30 Q80 35 100 30" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M15 40 Q35 35 55 40 Q75 45 95 40" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10 50 Q30 45 50 50 Q70 55 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M5 60 Q25 55 45 60 Q65 65 85 60" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            
            <svg
              className="absolute top-20 right-20 w-24 h-24 text-cholla-green"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Desert Elevation Contours */}
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>

            <svg
              className="absolute bottom-10 left-1/4 w-20 h-20 text-desert-sky-blue"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Terrain Mapping Lines */}
              <path d="M10 20 Q30 15 50 20 Q70 25 90 20" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M10 40 Q30 35 50 40 Q70 45 90 40" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M10 60 Q30 55 50 60 Q70 65 90 60" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M10 80 Q30 75 50 80 Q70 85 90 80" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Gradient Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-agave-cream via-transparent to-agave-cream/50"></div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ironwood-charcoal mb-6 relative">
                How AZ Business Services Helps You <span className="text-ocotillo-red">Succeed</span>
              </h1>
              <p className="text-lg lg:text-xl text-ironwood-charcoal/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Two simple paths to success in Arizona's local marketplace — designed for homeowners and businesses alike.
              </p>
              
              {/* Hero CTAs */}
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
          </div>
        </section>

        {/* === HOMEOWNERS SECTION === */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl lg:text-5xl font-medium text-ironwood-charcoal mb-6">
                Homeowners: Find Trusted Pros Fast
              </h2>
              <p className="text-lg text-ironwood-charcoal/80 max-w-3xl mx-auto">
                Skip the spam calls and bidding wars. Connect directly with verified Arizona professionals who understand your local needs.
              </p>
            </div>
            
            {/* Three Column Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Card 1 - Search */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <Search className="w-5 h-5 text-cholla-green" />
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Search by Service & City
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Browse by service type and your Arizona city. Find exactly what you need with our local-first approach.
                </CardContent>
              </Card>

              {/* Card 2 - Browse */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <Star className="w-5 h-5 text-cholla-green" />
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Browse Verified Pros
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Read genuine reviews and compare professionals who understand Arizona's unique climate and needs.
                </CardContent>
              </Card>

              {/* Card 3 - Contact */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <Target className="w-5 h-5 text-cholla-green" />
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Contact Directly
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Call or message businesses directly. No middleman, no spam calls, no bidding wars — just honest connections.
                </CardContent>
              </Card>
            </div>
            
            {/* Testimonial */}
            <div className="bg-agave-cream rounded-xl p-6 border border-prickly-pear-pink shadow-sm max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <Quote className="w-6 h-6 flex-shrink-0 mt-1 text-cholla-green" />
                <div>
                  <p className="text-ironwood-charcoal/80 leading-relaxed mb-3 italic">
                    "Finally found a reliable AC repair company without getting bombarded by sales calls. The whole process was so straightforward, and the technician understood exactly what we needed for our Scottsdale home."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cholla-green flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-ironwood-charcoal">Maria Rodriguez</p>
                      <p className="text-sm text-ironwood-charcoal/60">Scottsdale homeowner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mt-12 text-center">
              <Button 
                asChild 
                size="lg"
                className="px-12 py-4 font-semibold tracking-wide rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-ocotillo-red text-white"
              >
                <Link to="/categories">
                  Find Trusted Pros
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* === BUSINESS OWNERS SECTION === */}
        <section className="py-24 bg-agave-cream">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl lg:text-5xl font-medium text-ironwood-charcoal mb-6">
                Business Owners: Get Seen. Get Hired.
              </h2>
              <p className="text-lg text-ironwood-charcoal/80 max-w-3xl mx-auto">
                Ready to grow your Arizona business? Here's your path to more customers, higher visibility, and sustainable growth.
              </p>
            </div>
            
            {/* Four Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {/* Step 1 - Claim */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-desert-sky-blue flex items-center justify-center">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Claim Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Start with a free business profile that gets you found in local Arizona searches immediately.
                </CardContent>
              </Card>
              
              {/* Step 2 - Customize */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-cholla-green flex items-center justify-center">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Customize & Enhance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Add services, photos, hours, and Arizona-specific expertise to build trust with local customers.
                </CardContent>
              </Card>
              
              {/* Step 3 - Get Found */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-prickly-pear-pink flex items-center justify-center">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Get Found Online
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Appear in category searches and get featured in our local business carousel for maximum exposure.
                </CardContent>
              </Card>
              
              {/* Step 4 - Unlock Growth */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-ocotillo-red flex items-center justify-center">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-lg">
                    Unlock Growth Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-ironwood-charcoal/70">
                  Upgrade to Pro or Power for AI tools, lead management, and premium placement to accelerate growth.
                </CardContent>
              </Card>
            </div>
            
            {/* Business Testimonial */}
            <div className="bg-white rounded-xl p-6 border border-prickly-pear-pink shadow-sm max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <Quote className="w-6 h-6 flex-shrink-0 mt-1 text-ocotillo-red" />
                <div>
                  <p className="text-ironwood-charcoal/80 leading-relaxed mb-3 italic">
                    "Since joining AZ Business Services, we've seen a 40% increase in local leads. The platform understands Arizona's seasonal business patterns and helps us stay visible year-round. The AI tools are a game-changer for our marketing."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ocotillo-red flex items-center justify-center text-white font-bold">
                      J
                    </div>
                    <div>
                      <p className="font-semibold text-ironwood-charcoal">James Martinez</p>
                      <p className="text-sm text-ironwood-charcoal/60">Martinez Pool & Spa Services, Phoenix</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mt-12 text-center">
              <Button 
                asChild 
                size="lg"
                className="px-12 py-4 font-semibold tracking-wide rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-ocotillo-red text-white"
              >
                <Link to="/claim-business">
                  List Your Business Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* === WHY WE'RE DIFFERENT === */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-lg font-medium mb-4 text-cholla-green">
                Here's what makes us unlike any other directory
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl font-medium text-ironwood-charcoal">
                What Makes AZ Business Services Special
              </h2>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* No Spam Promise */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <Shield className="w-6 h-6 text-cholla-green" />
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-xl">
                    No Spam Promise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cholla-green flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">No spam or bidding wars</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cholla-green flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">Direct contact with businesses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cholla-green flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">Verified local professionals</span>
                  </div>
                </CardContent>
              </Card>

              {/* Transparent Business Model */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-desert-sky-blue" />
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-xl">
                    Transparent & Fair
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-desert-sky-blue flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">No lead reselling or sharing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-desert-sky-blue flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">Transparent, upfront pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-desert-sky-blue flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">AI-powered profile optimization</span>
                  </div>
                </CardContent>
              </Card>

              {/* Arizona Roots */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <Heart className="w-6 h-6 text-prickly-pear-pink" />
                  </div>
                  <CardTitle className="text-ironwood-charcoal font-bold text-xl">
                    Arizona Roots
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-prickly-pear-pink flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">Born and built in Arizona</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-prickly-pear-pink flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">Understands desert business needs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-prickly-pear-pink flex-shrink-0" />
                    <span className="text-sm text-ironwood-charcoal/70">Local community focused</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Platform Stats */}
            <div className="mt-16 text-center">
              <p className="text-lg mb-8 max-w-3xl mx-auto text-ironwood-charcoal/80">
                We're not just another directory — we're Arizona's trusted partner for connecting local talent with those who need it most.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-ocotillo-red" />
                  <span className="font-semibold text-ironwood-charcoal">500+ businesses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-cholla-green" />
                  <span className="font-semibold text-ironwood-charcoal">1000+ reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-desert-sky-blue" />
                  <span className="font-semibold text-ironwood-charcoal">Arizona-born</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === CTA FOOTER === */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-desert-sky-blue to-ocotillo-red">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="font-serif text-4xl lg:text-6xl font-medium mb-8 text-white">
              Whether You're Looking or Listing —<br />
              We're Here to Help Arizona Thrive
            </h2>
            <p className="text-xl lg:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of Arizona homeowners and businesses who've found success through our local-first platform.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <Button 
                asChild 
                size="lg"
                className="w-full md:w-auto px-12 py-5 font-semibold tracking-wide rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white text-ocotillo-red"
              >
                <Link to="/categories">
                  Browse Local Pros
                  <Search className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="w-full md:w-auto px-12 py-5 font-semibold tracking-wide border-2 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-white text-white bg-transparent"
              >
                <Link to="/claim-business">
                  List Your Business
                  <Building className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}