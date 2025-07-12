import { useState } from "react";
import { 
  Star, Phone, Mail, Globe, MapPin, Clock, Shield, Award, 
  ChevronRight, ExternalLink, Facebook, Instagram, Twitter, 
  Linkedin, Edit, MessageSquare, BarChart3, TrendingUp, Crown
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
    hours: Record<string, string>;
    planTier: "free" | "pro" | "power";
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

function SimpleEnhancedProfile({ 
  business, 
  relatedBusinesses, 
  reviews,
  isOwner 
}: BusinessProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);

  // Helper functions for plan-based features
  const canAccess = (feature: string) => {
    switch (feature) {
      case "fullSummary":
        return business.planTier === "pro" || business.planTier === "power";
      case "contactForm":
        return business.claimed && (business.planTier === "pro" || business.planTier === "power");
      case "insights":
        return business.planTier === "pro" || business.planTier === "power";
      case "aiTools":
        return business.planTier === "power";
      default:
        return true;
    }
  };

  const getPlanBadge = () => {
    switch (business.planTier) {
      case "power":
        return <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">⚡ Power Listing</Badge>;
      case "pro":
        return <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-green-500 text-white">✨ Pro Listing</Badge>;
      default:
        return null;
    }
  };

  // Demo AI Summary with blur effect for Free tier
  const getAISummary = () => {
    const fullSummary = business.description || "Professional service provider in Arizona offering quality solutions for your needs. Our experienced team is dedicated to delivering excellent customer service and results you can trust.";
    
    if (canAccess("fullSummary")) {
      return fullSummary;
    } else {
      // Show first line, blur the rest
      const sentences = fullSummary.split('. ');
      const firstSentence = sentences[0] + '.';
      const remainingSentences = sentences.slice(1).join('. ');
      
      return (
        <div>
          <span>{firstSentence}</span>
          <span className="relative">
            <span className="blur-sm text-muted-foreground">{remainingSentences}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background"></div>
          </span>
          <div className="mt-2 p-3 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              🔒 <strong>Upgrade to Pro</strong> to see the full AI-generated business summary
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Upgrade Now
            </Button>
          </div>
        </div>
      );
    }
  };

  // Enhanced service cards for Pro+, basic list for Free
  const getServiceDisplay = () => {
    if (canAccess("fullSummary")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {business.services.slice(0, 6).map((service, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{service}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Professional {service.toLowerCase()} services with quality guarantee
                  </p>
                  <div className="mt-2 text-sm font-medium text-primary">
                    Starting at $150
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    } else {
      return (
        <div>
          <ul className="space-y-2">
            {business.services.slice(0, 4).map((service, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{service}</span>
              </li>
            ))}
          </ul>
          {business.services.length > 4 && (
            <div className="mt-4 p-3 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                💎 <strong>Upgrade to Pro</strong> to see enhanced service cards with pricing and detailed descriptions
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                See {business.services.length - 4} More Services
              </Button>
            </div>
          )}
        </div>
      );
    }
  };

  // Contact form with plan gating
  const getContactForm = () => {
    if (canAccess("contactForm")) {
      return <ContactForm business={business} onClose={() => setShowContactForm(false)} />;
    } else {
      return (
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            <ContactForm business={business} onClose={() => {}} />
          </div>
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Card className="p-6 text-center max-w-sm">
              <h3 className="font-semibold mb-2">Contact Form Locked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {business.claimed 
                  ? "Upgrade to Pro to enable customer contact forms"
                  : "Claim this business to enable contact forms"
                }
              </p>
              <Button>
                {business.claimed ? "Upgrade to Pro" : "Claim This Business"}
              </Button>
            </Card>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    {getPlanBadge()}
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
                {business.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {/* AI Summary */}
              <div className="prose max-w-none">
                {getAISummary()}
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
                  className={!canAccess("insights") ? "opacity-50" : ""}
                >
                  Insights {!canAccess("insights") && "🔒"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Business</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getAISummary()}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(business.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize font-medium">{day}</span>
                            <span className="text-muted-foreground">{hours || "Closed"}</span>
                          </div>
                        ))}
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
                      {canAccess("fullSummary") 
                        ? "Explore our comprehensive service offerings"
                        : "Professional services available"
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
                    <CardDescription>
                      See what our customers are saying
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Reviews will be displayed here</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="insights" className="mt-6">
                {canAccess("insights") ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Insights</CardTitle>
                      <CardDescription>
                        Analytics and performance data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">1,234</div>
                          <div className="text-sm text-muted-foreground">Page Views</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">56</div>
                          <div className="text-sm text-muted-foreground">Leads Generated</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">4.8</div>
                          <div className="text-sm text-muted-foreground">Average Rating</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Business Insights</h3>
                      <p className="text-muted-foreground mb-4">
                        Get detailed analytics about your business performance, customer engagement, and growth opportunities.
                      </p>
                      <Button>
                        Upgrade to Pro to Unlock Insights
                      </Button>
                    </CardContent>
                  </Card>
                )}
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
                
                {business.website && (
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
                
                <Button 
                  className="w-full" 
                  onClick={() => setShowContactForm(true)}
                  disabled={!canAccess("contactForm")}
                >
                  {canAccess("contactForm") ? "Get Quote" : "🔒 Contact (Upgrade Required)"}
                </Button>
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
            {getContactForm()}
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
                  {!business.claimed ? "Is this your business?" : "Upgrade your listing"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {!business.claimed 
                    ? "Claim this listing to manage customer inquiries and showcase your business" 
                    : "Unlock advanced features like AI content generation and detailed analytics"
                  }
                </p>
              </div>
              <Button>
                {!business.claimed ? "Claim This Business" : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleEnhancedProfile;