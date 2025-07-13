import { useState } from "react";
import { 
  Star, Phone, Mail, Globe, MapPin, Clock, Shield, Award, 
  ChevronRight, ExternalLink, Facebook, Instagram, Twitter, 
  Linkedin, Edit, MessageSquare, BarChart3, TrendingUp, Crown,
  Lock, HelpCircle
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import ContactForm from "./contact-form";
import BusinessCard from "../category/business-card";
import { InsightsTab } from "./tabs/InsightsTab";
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

export default function PowerTierProfile({ 
  business, 
  relatedBusinesses, 
  reviews,
  isOwner 
}: BusinessProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);

  // Power-tier-first visibility logic
  const isVisible = (feature: string) => {
    switch (feature) {
      case "fullSummary":
        return business.planTier === "pro" || business.planTier === "power";
      case "enhancedServices":
        return business.planTier === "power";
      case "insights":
        return business.planTier === "pro" || business.planTier === "power";
      case "aiReviewSentiment":
        return business.planTier === "power";
      case "contactForm":
        return business.claimed && (business.planTier === "pro" || business.planTier === "power");
      case "verifiedBadge":
        return business.claimed && (business.planTier === "pro" || business.planTier === "power");
      case "websiteLink":
        return business.planTier === "pro" || business.planTier === "power";
      case "vipBadge":
        return business.planTier === "power";
      default:
        return true;
    }
  };

  // Badge system with grayed-out states for Free tier
  const getBadges = () => {
    const badges = [];
    
    // Plan tier badge
    if (business.planTier === "power") {
      badges.push(
        <Badge key="power" variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          ⚡ Power Listing
        </Badge>
      );
    } else if (business.planTier === "pro") {
      badges.push(
        <Badge key="pro" variant="secondary" className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          ✨ Pro Listing
        </Badge>
      );
    }

    // VIP Badge for Power tier
    if (isVisible("vipBadge")) {
      badges.push(
        <Badge key="vip" variant="secondary" className="bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    }

    // Verified Badge
    if (isVisible("verifiedBadge") && business.verified) {
      badges.push(
        <Badge key="verified" variant="secondary" className="bg-green-100 text-green-800">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (business.planTier === "free") {
      // Show grayed-out verified badge with tooltip for Free tier
      badges.push(
        <div key="verified-locked" className="relative group">
          <Badge variant="secondary" className="bg-gray-100 text-gray-400 opacity-50">
            <Shield className="w-3 h-3 mr-1" />
            Verified
            <Lock className="w-3 h-3 ml-1" />
          </Badge>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Unlock by upgrading to Pro
          </div>
        </div>
      );
    }

    // Additional badges based on performance (mock data)
    if (business.rating >= 4.5) {
      if (business.planTier !== "free") {
        badges.push(
          <Badge key="highly-rated" variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Star className="w-3 h-3 mr-1" />
            Highly Rated
          </Badge>
        );
      } else {
        badges.push(
          <div key="highly-rated-locked" className="relative group">
            <Badge variant="secondary" className="bg-gray-100 text-gray-400 opacity-50">
              <Star className="w-3 h-3 mr-1" />
              Highly Rated
              <Lock className="w-3 h-3 ml-1" />
            </Badge>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Unlock by upgrading
            </div>
          </div>
        );
      }
    }

    return badges;
  };

  // AI Business Summary with tier-based visibility
  const getBusinessSummary = () => {
    const fullSummary = business.description || "Professional service provider in Arizona offering quality solutions for your needs. Our experienced team is dedicated to delivering excellent customer service and results you can trust. With years of experience and commitment to excellence, we ensure every project meets the highest standards.";
    
    if (isVisible("fullSummary")) {
      return (
        <div>
          <p className="text-lg text-muted-foreground">{fullSummary}</p>
          {business.planTier === "power" && (
            <div className="mt-4 p-3 border-l-4 border-primary bg-muted/50 rounded-r">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                AI-enhanced summary with tone optimization enabled
              </p>
            </div>
          )}
        </div>
      );
    } else {
      // Show blurred preview for Free tier
      const sentences = fullSummary.split('. ');
      const firstSentence = sentences[0] + '.';
      const remainingSentences = sentences.slice(1).join('. ');
      
      return (
        <div>
          <p className="text-lg text-muted-foreground">
            {firstSentence}
            <span className="relative inline-block">
              <span className="blur-sm text-muted-foreground/70">{remainingSentences}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-background"></div>
            </span>
          </p>
          <div className="mt-4 p-4 border rounded-lg bg-muted/50 text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Full AI Summary Locked</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upgrade to Pro to see the complete AI-generated business summary
            </p>
            <Button size="sm">Upgrade to Pro</Button>
          </div>
        </div>
      );
    }
  };

  // Service display with three different modes
  const getServiceDisplay = () => {
    if (business.planTier === "power") {
      // Enhanced AI cards with pricing (Power tier)
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {business.services.slice(0, 6).map((service, index) => (
            <Card key={index} className="p-4 border-l-4 border-primary">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{service}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Professional {service.toLowerCase()} services with AI-optimized descriptions and quality guarantee. Expert technicians ensure top-tier results.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      Starting at ${Math.floor(Math.random() * 200) + 100}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      AI-Enhanced
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    } else if (business.planTier === "pro") {
      // Service cards with icons and descriptions (Pro tier)
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {business.services.slice(0, 6).map((service, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{service}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Professional {service.toLowerCase()} services
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    } else {
      // Bullet list for Free tier
      return (
        <div>
          <ul className="space-y-2 mb-4">
            {business.services.slice(0, 4).map((service, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{service}</span>
              </li>
            ))}
          </ul>
          {business.services.length > 4 && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 text-center">
              <h4 className="font-semibold mb-2">Enhanced Service Cards</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upgrade to Pro for enhanced service cards with descriptions and AI-powered content
              </p>
              <Button size="sm">Upgrade to Pro</Button>
            </div>
          )}
        </div>
      );
    }
  };

  // Contact form with plan gating
  const getContactSection = () => {
    if (isVisible("contactForm")) {
      return (
        <Button 
          className="w-full" 
          onClick={() => setShowContactForm(true)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Get Quote
        </Button>
      );
    } else {
      return (
        <div className="relative">
          <Button className="w-full opacity-50" disabled>
            <Lock className="mr-2 h-4 w-4" />
            Contact Form Locked
          </Button>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              {business.claimed 
                ? "Upgrade to Pro to enable contact forms"
                : "Claim this business to enable contact forms"
              }
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8">
        
        {/* Claim Banner for Unclaimed Businesses */}
        <ClaimBanner business={business} className="mb-8" />
        
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    {getBadges()}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{business.category?.name}</span>
                    <span>•</span>
                    <span>{business.city}, {business.state}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-foreground">{business.rating}</span>
                      <span>({business.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Business Summary */}
              <div className="prose max-w-none">
                {getBusinessSummary()}
              </div>
            </div>
            
            {business.heroImage && (
              <div className="lg:w-80">
                <img 
                  src={business.heroImage} 
                  alt={business.name}
                  className="w-full h-48 lg:h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className={cn(
                    "relative",
                    !isVisible("insights") && "opacity-50"
                  )}
                >
                  Insights
                  {!isVisible("insights") && (
                    <Lock className="w-3 h-3 ml-1" />
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Business</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getBusinessSummary()}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {business.hours ? Object.entries(business.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize font-medium">{day}</span>
                            <span className="text-muted-foreground">{hours || "Closed"}</span>
                          </div>
                        )) : (
                          <div className="text-muted-foreground">Hours not available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Our Services</CardTitle>
                    <CardDescription>
                      {business.planTier === "power" 
                        ? "AI-enhanced service descriptions with competitive pricing"
                        : business.planTier === "pro"
                        ? "Professional service offerings"
                        : "Available services"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getServiceDisplay()}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    {business.planTier === "power" && (
                      <CardDescription className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        AI sentiment analysis available
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isVisible("aiReviewSentiment") ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Sentiment Analysis</h4>
                          <div className="text-sm text-green-700">
                            85% Positive • 12% Neutral • 3% Negative
                          </div>
                        </div>
                        <p className="text-muted-foreground">Reviews and analysis will be displayed here</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Reviews will be displayed here</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="insights" className="mt-6">
                <InsightsTab 
                  business={business}
                  businessContent={null}
                  isOwner={isOwner}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a 
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 text-sm hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{business.phone}</span>
                </a>
                
                {business.email && (
                  <a 
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{business.email}</span>
                  </a>
                )}
                
                {business.website && isVisible("websiteLink") && (
                  <a 
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-primary"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Visit Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{business.address}</p>
                    <p>{business.city}, {business.state} {business.zip}</p>
                  </div>
                </div>
                
                <Separator />
                
                {getContactSection()}
              </CardContent>
            </Card>
            
            {/* Related Businesses */}
            {relatedBusinesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Businesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedBusinesses.slice(0, 3).map((relatedBusiness) => (
                    <BusinessCard
                      key={relatedBusiness._id}
                      business={relatedBusiness}
                      variant="compact"
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
            <ContactForm business={business} onClose={() => setShowContactForm(false)} />
          </div>
        </div>
      )}

      {/* Sticky CTA for Free/Unclaimed businesses */}
      {(!business.claimed || business.planTier === "free") && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {!business.claimed ? "Is this your business?" : "Unlock all features"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {!business.claimed 
                    ? "Claim this listing to manage customer inquiries and showcase your business" 
                    : "Upgrade to Pro for enhanced features, analytics, and lead management"
                  }
                </p>
              </div>
              <Button asChild>
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