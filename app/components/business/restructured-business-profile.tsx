import { useState } from "react";
import { 
  Star, Phone, Mail, Globe, MapPin, Clock, Shield, Award, 
  ExternalLink, Facebook, Instagram, Twitter, 
  Linkedin, Edit, MessageSquare, BarChart3, TrendingUp, Crown,
  Navigation, ChevronRight, Users, Calendar, Zap, Timer,
  CheckCircle, Building2
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import ContactForm from "./contact-form";
import BusinessCard from "../category/business-card";
import { ClaimBanner } from "./claim-banner";

interface BusinessProfileProps {
  business: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    heroImage?: string;
    description: string;
    shortDescription: string;
    phone: string;
    email?: string;
    website?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates?: { lat: number; lng: number };
    category?: { name: string; icon?: string; slug: string } | null;
    services: string[];
    hours?: Record<string, string> | { monday?: string; tuesday?: string; wednesday?: string; thursday?: string; friday?: string; saturday?: string; sunday?: string; } | null;
    planTier: string;
    featured: boolean;
    priority: number;
    ownerId?: string;
    claimed: boolean;
    verified: boolean;
    active: boolean;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
    rating: number;
    reviewCount: number;
    createdAt: number;
    updatedAt: number;
  };
  relatedBusinesses: any[];
  reviews: any[];
  isOwner: boolean;
}

export default function RestructuredBusinessProfile({ 
  business, 
  relatedBusinesses, 
  reviews,
  isOwner 
}: BusinessProfileProps) {
  const [showContactForm, setShowContactForm] = useState(false);

  // Plan tier helper functions
  const isVisible = (feature: string) => {
    switch (feature) {
      case "fullSummary":
        return business.planTier === "pro" || business.planTier === "power";
      case "enhancedServices":
        return business.planTier === "power";
      case "contactForm":
        return business.claimed && (business.planTier === "pro" || business.planTier === "power");
      case "verifiedBadge":
        return business.claimed && (business.planTier === "pro" || business.planTier === "power");
      case "websiteLink":
        return business.planTier === "pro" || business.planTier === "power";
      case "vipBadge":
        return business.planTier === "power";
      case "responseTime":
        return business.planTier === "pro" || business.planTier === "power";
      default:
        return true;
    }
  };

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  // Get current day's hours
  const getTodayHours = () => {
    const hours = business.hours?.[today as keyof typeof business.hours];
    return hours || "Closed";
  };

  // Check if currently open (simplified logic)
  const isCurrentlyOpen = () => {
    const hours = getTodayHours();
    if (hours === "Closed") return false;
    // This is simplified - in production you'd parse hours and check current time
    return true;
  };

  // Get plan tier display name
  const getPlanTierDisplay = () => {
    switch (business.planTier) {
      case "power":
        return "Power";
      case "pro":
        return "Pro";
      case "free":
      default:
        return "Starter";
    }
  };

  // Generate Google Maps embed URL
  const getMapEmbedUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return `https://www.google.com/maps/embed/v1/place?key=demo&q=${encodeURIComponent(address)}`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`;
  };

  // Get directions URL
  const getDirectionsUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  // Service icons mapping
  const getServiceIcon = (service: string) => {
    const lowerService = service.toLowerCase();
    if (lowerService.includes('plumbing')) return '🔧';
    if (lowerService.includes('electrical')) return '⚡';
    if (lowerService.includes('hvac') || lowerService.includes('heating') || lowerService.includes('cooling')) return '🌡️';
    if (lowerService.includes('cleaning')) return '🧹';
    if (lowerService.includes('landscaping') || lowerService.includes('lawn')) return '🌱';
    if (lowerService.includes('roofing')) return '🏠';
    if (lowerService.includes('painting')) return '🎨';
    if (lowerService.includes('construction')) return '🏗️';
    if (lowerService.includes('automotive') || lowerService.includes('repair')) return '🚗';
    if (lowerService.includes('dental') || lowerService.includes('medical')) return '🏥';
    if (lowerService.includes('legal')) return '⚖️';
    if (lowerService.includes('accounting')) return '💼';
    if (lowerService.includes('insurance')) return '🛡️';
    if (lowerService.includes('real estate')) return '🏡';
    if (lowerService.includes('restaurant') || lowerService.includes('food')) return '🍽️';
    return '🔧'; // Default service icon
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Claim Banner for Unclaimed Businesses */}
      {!business.claimed && (
        <section className="py-4 bg-amber-50 border-b border-amber-200">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <ClaimBanner business={business} />
          </div>
        </section>
      )}

      {/* Business Header Section */}
      <section className="py-8 bg-gradient-to-b from-[#FDF8F3] to-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column - Business Logo and Info */}
            <div className="lg:col-span-2 flex flex-col lg:flex-row gap-8 items-start">
              {/* Business Logo */}
              {business.logo && (
                <div className="flex-shrink-0">
                  <img 
                    src={business.logo} 
                    alt={`${business.name} logo`}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover shadow-md"
                  />
                </div>
              )}

              {/* Business Information */}
              <div className="flex-1">
                <div className="flex flex-col gap-4">
                {/* Business Name and Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
                      {business.name}
                    </h1>
                    
                    {/* Verification Badge */}
                    {isVisible("verifiedBadge") && business.verified && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}

                    {/* Plan Tier Badge */}
                    {business.planTier !== "free" && (
                      <Badge 
                        className={cn(
                          "font-medium",
                          business.planTier === "power" 
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white power-badge-glow"
                            : "bg-gradient-to-r from-blue-600 to-green-600 text-white"
                        )}
                      >
                        {business.planTier === "power" ? (
                          <>
                            <Zap className="w-3 h-3 mr-1" />
                            Power
                          </>
                        ) : (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </>
                        )}
                      </Badge>
                    )}
                  </div>

                  <Badge 
                    variant="outline" 
                    className="text-sm font-medium border-primary/20 text-primary bg-primary/5"
                  >
                    {getPlanTierDisplay()} Listing
                  </Badge>
                </div>

                {/* Category and Location Breadcrumb */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  {business.category && (
                    <>
                      <Link 
                        to={`/${business.category.slug}`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        {business.category.icon && <span className="text-lg">{business.category.icon}</span>}
                        <span className="font-medium">{business.category.name}</span>
                      </Link>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                  <Link 
                    to={`/city/${business.city.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{business.city}, {business.state}</span>
                  </Link>
                </div>

                {/* Rating Display */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i < Math.floor(business.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-xl text-foreground">
                      {business.rating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({business.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* AI-Generated Business Summary */}
                <div className="max-w-4xl">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {business.description}
                  </p>
                  {business.planTier !== "free" && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium text-primary">
                        Want to customize this message? {getPlanTierDisplay()} customers can edit their professional description.
                      </p>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>

            {/* Right Column - Map at Top */}
            <div className="hidden lg:block">
              <div className="relative h-80 rounded-lg overflow-hidden shadow-lg border border-border">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    src={getMapEmbedUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  />
                ) : (
                  // Fallback map display
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {business.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {business.address}<br />
                        {business.city}, {business.state} {business.zip}
                      </p>
                      <Button size="sm" asChild>
                        <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content and Sidebar */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12 order-2 lg:order-1">
              
              {/* Top Right Map Section - Mobile Only */}
              <div className="lg:hidden mb-8">
                <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                  Location
                </h2>
                <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                    <iframe
                      src={getMapEmbedUrl()}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-xl"
                    />
                  ) : (
                    // Fallback map display
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {business.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {business.address}<br />
                          {business.city}, {business.state} {business.zip}
                        </p>
                        <Button size="sm" asChild>
                          <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                            <Navigation className="w-4 h-4 mr-2" />
                            Get Directions
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Services Section */}
              <div>
                <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                  Our Services
                </h2>
                
                {business.planTier === "power" ? (
                  // Enhanced service cards with pricing for Power tier
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.services.slice(0, 8).map((service, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
                              {getServiceIcon(service)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{service}</h3>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                Professional {service.toLowerCase()} services with AI-optimized descriptions, quality guarantee, and expert technicians ensuring top-tier results.
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-primary">
                                  Starting at ${Math.floor(Math.random() * 200) + 100}
                                </div>
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  AI-Enhanced
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : business.planTier === "pro" ? (
                  // Service cards for Pro tier
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.services.slice(0, 8).map((service, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">
                              {getServiceIcon(service)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{service}</h3>
                              <p className="text-sm text-muted-foreground">
                                Professional {service.toLowerCase()} services
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Visual service cards for Free tier (upgrade from bullet points)
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {business.services.slice(0, 6).map((service, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">
                                {getServiceIcon(service)}
                              </div>
                              <span className="font-medium">{service}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg text-center">
                      <h3 className="font-semibold text-lg mb-2 text-primary">Enhanced Service Cards</h3>
                      <p className="text-muted-foreground mb-4">
                        Pro customers get enhanced service cards with detailed descriptions and pricing • Power customers show unlimited reviews
                      </p>
                      <Button asChild>
                        <Link to="/pricing">
                          Upgrade to Pro
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Reviews Section - MOVED UP */}
              <div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-6 h-6",
                                  i < Math.floor(business.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{business.rating.toFixed(1)}</p>
                            <p className="text-sm text-muted-foreground">
                              Based on {business.reviewCount} reviews
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mock Review Display */}
                      <div className="space-y-4">
                        {[1, 2, 3].map((_, index) => (
                          <div key={index} className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-amber-400 text-amber-400"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">2 weeks ago</span>
                            </div>
                            <p className="text-muted-foreground">
                              Excellent service! They arrived on time and fixed our AC unit quickly. Very professional and fair pricing.
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-sm font-medium text-primary text-center">
                          {business.planTier === "free" 
                            ? "Displaying 3 of " + business.reviewCount + " reviews • Pro customers show up to 10 reviews • Power customers show unlimited reviews"
                            : business.planTier === "pro"
                            ? "Showing up to 10 reviews • Power customers show unlimited reviews with AI sentiment analysis"
                            : "All " + business.reviewCount + " reviews displayed with AI sentiment analysis"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Right Column - Sidebar (RESTRUCTURED) */}
            <div className="space-y-6 order-1 lg:order-2">
              
              {/* Mobile-only Quick Contact Banner */}
              <div className="lg:hidden bg-primary text-primary-foreground p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold text-lg">{business.phone}</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.location.href = `tel:${business.phone}`}
                  >
                    Call
                  </Button>
                </div>
              </div>
              
              {/* 1. Contact Information Section - TOP PRIORITY */}
              <Card className="shadow-lg border-2 border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif">Contact Information</CardTitle>
                  {isCurrentlyOpen() ? (
                    <Badge className="w-fit bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Open Now
                    </Badge>
                  ) : (
                    <Badge className="w-fit bg-red-50 text-red-700 border-red-200">
                      Closed
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Large Call Now Button */}
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold"
                    onClick={() => window.location.href = `tel:${business.phone}`}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now: {business.phone}
                  </Button>

                  {/* Address with Get Directions */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{business.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {business.city}, {business.state} {business.zip}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  </div>

                  {/* Visit Website Button */}
                  {business.website && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}

                  {/* Business Hours */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Business Hours
                      </h4>
                      <span className="text-sm font-medium text-primary">
                        Today: {getTodayHours()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {daysOfWeek.map((day) => {
                        const hours = business.hours?.[day as keyof typeof business.hours];
                        const isToday = day === today;
                        
                        return (
                          <div 
                            key={day} 
                            className={cn(
                              "flex items-center justify-between text-sm py-1.5 px-2 rounded",
                              isToday && "bg-primary/10 font-medium"
                            )}
                          >
                            <span className="capitalize">{day}</span>
                            <span className={isToday ? "text-primary" : "text-muted-foreground"}>
                              {hours || "Closed"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Response Time Indicator */}
                  {isVisible("responseTime") && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Timer className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-medium text-green-700">
                        Usually responds within 2 hours
                      </span>
                    </div>
                  )}

                  {/* Get Quote Section */}
                  <Separator />
                  
                  {business.planTier === "free" ? (
                    <div>
                      <Button 
                        variant="secondary"
                        className="w-full"
                        onClick={() => setShowContactForm(true)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <div className="mt-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-xs font-medium text-primary text-center">
                          Upgrade to Pro for instant lead notifications
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="secondary"
                      className="w-full"
                      onClick={() => setShowContactForm(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* 2. Business Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Established</span>
                    <span className="font-medium">
                      {new Date(business.createdAt).getFullYear()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Years in Business</span>
                    <span className="font-medium">
                      {new Date().getFullYear() - new Date(business.createdAt).getFullYear()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Service Area</span>
                    <span className="font-medium">{business.city} Area</span>
                  </div>
                  
                  {business.verified && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Licenses</span>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Similar Businesses Section - MOVED DOWN */}
              {relatedBusinesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif">
                      Similar Businesses
                    </CardTitle>
                    <CardDescription>
                      Other {business.category?.name} providers in {business.city}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedBusinesses.slice(0, 3).map((relatedBusiness) => (
                      <div key={relatedBusiness._id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <BusinessCard 
                          business={relatedBusiness} 
                          variant="compact"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-xl p-6 max-w-md w-full shadow-xl">
            <ContactForm 
              business={business} 
              onClose={() => setShowContactForm(false)} 
            />
          </div>
        </div>
      )}

      {/* Sticky CTA for Free/Unclaimed businesses */}
      {(!business.claimed || business.planTier === "free") && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-40">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-lg">
                  {!business.claimed ? "Is this your business?" : "Unlock all features"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {!business.claimed 
                    ? "Claim this listing to manage customer inquiries and showcase your business" 
                    : "Upgrade to Pro for enhanced features, analytics, and lead management"
                  }
                </p>
              </div>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={!business.claimed 
                  ? `/claim-business?businessId=${business._id}` 
                  : "/pricing"
                }>
                  {!business.claimed ? "Claim This Business" : "Upgrade to Pro"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}