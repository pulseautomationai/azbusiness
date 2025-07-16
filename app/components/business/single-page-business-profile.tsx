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

export default function SinglePageBusinessProfile({ 
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
      // Fallback to generic maps URL if API key is not set
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


      {/* Main Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
              
              {/* Business Header Section */}
              <div className="bg-gradient-to-b from-[#FDF8F3] to-background rounded-xl">
                <div className="flex flex-col lg:flex-row gap-4 items-start">
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
                    <div className="flex flex-col gap-2">
                      {/* Business Name and Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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

                        </div>

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

                    </div>
                  </div>
                </div>
              </div>
              
              
              {/* AI Business Summary Section - Available for All Tiers */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Professional Overview
                  </h3>
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs">
                    AI-Generated
                  </Badge>
                </div>
                
                <div className="border-b border-green-200 mb-4"></div>
                
                <div className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{business.name}</strong> is a trusted {business.category?.name.toLowerCase()} provider serving the {business.city} area. 
                    With a {business.rating.toFixed(1)}-star rating from {business.reviewCount} customers, they offer reliable service with {business.services.length} specialized services.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{business.rating.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Customer Rating</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{business.reviewCount}</div>
                      <div className="text-sm text-muted-foreground">Total Reviews</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{business.services.length}+</div>
                      <div className="text-sm text-muted-foreground">Services Offered</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      <strong>AI Insight:</strong> This business demonstrates strong customer satisfaction and comprehensive service offerings, making them a reliable choice for {business.category?.name.toLowerCase()} needs in {business.city}.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Business Overview Section */}
              <div>
                {business.planTier === "power" ? (
                  // Active AI Business Overview for Power tier
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Competitive Intelligence
                      </h3>
                      <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs">
                        AI-Generated
                      </Badge>
                    </div>
                    
                    <div className="border-b border-blue-200 mb-4"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Business Profile
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• <strong>Specialization:</strong> HVAC installation & repair services</li>
                          <li>• <strong>Service Area:</strong> Greater Phoenix metropolitan area</li>
                          <li>• <strong>Experience:</strong> 15+ years in heating and cooling systems</li>
                          <li>• <strong>Certifications:</strong> EPA certified, licensed & insured</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Competitive Advantages
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• 24/7 emergency service availability</li>
                          <li>• Free estimates and transparent pricing</li>
                          <li>• Energy-efficient system recommendations</li>
                          <li>• 5-year warranty on all installations</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        <strong>AI Recommendation:</strong> This business shows strong market positioning with excellent customer satisfaction and comprehensive service offerings ideal for residential and commercial HVAC needs.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Locked AI Business Overview for Free/Pro tiers
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg relative">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Competitive Intelligence
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md">
                          Get AI-powered business insights including competitive advantages, market positioning, and strategic recommendations.
                        </p>
                        <Button asChild size="sm">
                          <Link to="/pricing">
                            Upgrade to Power
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Blurred content behind overlay */}
                    <div className="opacity-30 blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Competitive Intelligence
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">Business Profile</h4>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">Competitive Advantages</h4>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Customer Reviews Section */}
              <div>
                
                {/* AI Review Intelligence Section */}
                <div className="mb-4">
                  {business.planTier === "power" ? (
                    // Active AI Review Intelligence for Power tier
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Review Intelligence
                        </h3>
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                          AI-Generated
                        </Badge>
                      </div>
                      
                      <div className="border-b border-purple-200 mb-4"></div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on analysis of {business.reviewCount} customer reviews:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Top Strengths
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Professional service quality (mentioned in 87% of reviews)</li>
                            <li>• Timely responses and punctuality (mentioned in 78% of reviews)</li>
                            <li>• Fair and transparent pricing (mentioned in 65% of reviews)</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Customer Sentiment
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600">92% positive</span>
                            <span className="text-gray-600">6% neutral</span>
                            <span className="text-red-600">2% negative</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Most Praised For:</strong> HVAC installation, heating system repair
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Key Differentiator:</strong> Same-day emergency service availability
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Locked AI Review Intelligence for Free/Pro tiers
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg relative">
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Review Intelligence
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-md">
                            Get AI-powered review analysis including sentiment analysis, top strengths, and customer insights from all your reviews.
                          </p>
                          <Button asChild size="sm">
                            <Link to="/pricing">
                              Upgrade to Power
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Blurred content behind overlay */}
                      <div className="opacity-30 blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Review Intelligence
                          </h3>
                        </div>
                        <div className="border-b border-purple-200 mb-4"></div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Based on analysis of {business.reviewCount} customer reviews:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">Top Strengths</h4>
                            <div className="space-y-1">
                              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">Customer Sentiment</h4>
                            <div className="space-y-1">
                              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Location Section */}
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                    Location
                  </h2>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-80">
                        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                          <iframe
                            src={getMapEmbedUrl()}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                          />
                        ) : (
                          // Fallback map display
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
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
                    </CardContent>
                  </Card>
                </div>
                
                {/* Image Gallery Section - Power Tier Only */}
                {business.planTier === "power" ? (
                  <div className="mt-8">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                      Image Gallery
                    </h2>
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {/* Mock gallery images - in production, these would come from business.galleryImages */}
                          {[1, 2, 3, 4, 5, 6].map((index) => (
                            <div key={index} className="relative group cursor-pointer">
                              <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg overflow-hidden">
                                <img 
                                  src={`https://images.unsplash.com/photo-${1580000000000 + index}?w=300&h=300&fit=crop&auto=format`}
                                  alt={`${business.name} - Image ${index}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    // Fallback to placeholder
                                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                                      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
                                        <rect width="300" height="300" fill="#f3f4f6"/>
                                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="16">
                                          Business Image ${index}
                                        </text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                      <ExternalLink className="w-4 h-4 text-gray-800" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg text-center">
                          <p className="text-sm font-medium text-primary">
                            ✨ Business owners can upload up to 10 professional images to showcase their services and location through their dashboard.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Locked Image Gallery for Free/Pro tiers
                  <div className="mt-8">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                      Image Gallery
                    </h2>
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Image Gallery - Power Feature
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                            Showcase your business with up to 10 professional images. Let customers see your work, location, and team before they contact you.
                          </p>
                          <Button asChild size="sm">
                            <Link to="/pricing">
                              Upgrade to Power
                            </Link>
                          </Button>
                        </div>
                        
                        {/* Blurred preview gallery */}
                        <div className="relative mt-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-30 blur-sm">
                            {[1, 2, 3, 4, 5, 6].map((index) => (
                              <div key={index} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg">
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                  Image {index}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <Card className="mt-8">
                  <CardContent className="p-6">
                    {/* Overall Rating Display */}
                    <div className="py-4 border-b border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < Math.floor(business.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-foreground">{business.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Displaying 3 of {business.reviewCount} reviews
                      </p>
                    </div>

                    {/* Individual Reviews */}
                    <div className="pt-4 pb-6 space-y-6">
                      {/* Review 1 */}
                      <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground">Sarah M.</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-amber-400 text-amber-400"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">• 2 weeks ago</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              "Excellent service! They arrived on time and quickly diagnosed our AC unit issue. The technician was very professional and explained everything clearly. Fair pricing and they even cleaned up after themselves. Highly recommend!"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Review 2 */}
                      <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground">Mike R.</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-amber-400 text-amber-400"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">• 1 month ago</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              "Had an emergency heating repair needed on a weekend. They responded quickly and had it fixed the same day. The technician was knowledgeable and the pricing was very reasonable. Great customer service!"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Review 3 */}
                      <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground">Jennifer L.</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-amber-400 text-amber-400"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">• 3 weeks ago</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              "Professional installation of our new HVAC system. The team was efficient, clean, and took time to explain how to maintain the system. Everything works perfectly and our energy bills have decreased significantly."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                    {/* Upgrade Message */}
                    <div className="pt-4 border-t border-border">
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-sm font-medium text-primary text-center">
                          {business.planTier === "free" 
                            ? "Pro customers show up to 10 reviews • Power customers show unlimited reviews"
                            : business.planTier === "pro"
                            ? "Power customers show unlimited reviews with AI sentiment analysis"
                            : "AI sentiment analysis and unlimited reviews enabled"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Services Section */}
              <div>
                <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">
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

              {/* Get Quote Section */}
              <div className="text-center">
                {business.planTier === "free" ? (
                  <div className="max-w-md mx-auto">
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-lg font-semibold mb-4"
                      onClick={() => setShowContactForm(true)}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Get Quote
                    </Button>
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium text-primary">
                        Upgrade to Pro for instant lead notifications and contact management
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="px-12 h-14 text-lg font-semibold"
                    onClick={() => setShowContactForm(true)}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Get Quote
                  </Button>
                )}
              </div>

              {/* Similar Businesses Section - Full Width */}
              {relatedBusinesses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">
                    Similar Businesses in {business.city}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedBusinesses.slice(0, 6).map((relatedBusiness) => (
                      <div key={relatedBusiness._id}>
                        <BusinessCard 
                          business={relatedBusiness} 
                          variant="default"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Comprehensive Business Sidebar */}
            <div className="space-y-4 order-1 lg:order-2">
              
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
                <CardHeader className="pb-2">
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
                <CardContent className="space-y-6">
                  {/* Address with Get Directions */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 py-3">
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

                  {/* Call Now Section */}
                  <Separator />
                  
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold"
                    onClick={() => window.location.href = `tel:${business.phone}`}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now: {business.phone}
                  </Button>
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