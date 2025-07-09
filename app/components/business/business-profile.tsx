import { useState } from "react";
import { 
  Star, Phone, Mail, Globe, MapPin, Clock, Shield, Award, 
  ChevronRight, ExternalLink, Facebook, Instagram, Twitter, 
  Linkedin, Edit, MessageSquare 
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import ContactForm from "./contact-form";
import ReviewSection from "./review-section";
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
    email: string;
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

export default function BusinessProfile({ 
  business, 
  relatedBusinesses, 
  reviews,
  isOwner 
}: BusinessProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);

  const planBadgeText = (tier: string) => {
    switch (tier) {
      case "power":
        return "⚡ Power Listing";
      case "pro":
        return "✨ Pro Listing";
      default:
        return "";
    }
  };

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="relative bg-muted/30">
        {business.heroImage && (
          <div className="absolute inset-0 h-64 overflow-hidden">
            <img 
              src={business.heroImage} 
              alt={business.name}
              className="h-full w-full object-cover opacity-20"
            />
          </div>
        )}
        
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Business Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {business.logo && (
                  <img 
                    src={business.logo} 
                    alt={`${business.name} logo`}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    {business.verified && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                    {business.planTier !== "free" && (
                      <Badge variant="default">
                        {planBadgeText(business.planTier)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {business.category && (
                      <Link 
                        to={`/category/${business.category.slug}`}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        {business.category.icon && <span className="text-lg">{business.category.icon}</span>}
                        <span>{business.category.name}</span>
                      </Link>
                    )}
                    <span>•</span>
                    <Link 
                      to={`/city/${business.city.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{business.city}, {business.state}</span>
                    </Link>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < Math.floor(business.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-lg">
                        {business.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                {business.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 lg:ml-8">
              {isOwner ? (
                <>
                  <Button asChild>
                    <Link to={`/dashboard/business/${business.slug}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Listing
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg"
                    onClick={() => setShowContactForm(true)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Get Quote
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.location.href = `tel:${business.phone}`}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </>
              )}
              
              {!business.claimed && !isOwner && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sign-up">
                    <Award className="mr-2 h-4 w-4" />
                    Claim this listing
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Services List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {business.services.map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-primary" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About {business.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {business.description}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Services Offered</CardTitle>
                      <CardDescription>
                        Comprehensive list of our professional services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {business.services.map((service, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <div className="flex-1">
                              <h4 className="font-medium">{service}</h4>
                              <p className="text-sm text-muted-foreground">
                                Professional {service.toLowerCase()} services with quality guarantee
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <ReviewSection 
                    businessId={business._id}
                    reviews={reviews}
                    rating={business.rating}
                    reviewCount={business.reviewCount}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Contact & Hours */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <a 
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 text-sm hover:text-primary"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{business.phone}</span>
                    </a>
                    
                    <a 
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 text-sm hover:text-primary"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="break-all">{business.email}</span>
                    </a>
                    
                    {business.website && (
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm hover:text-primary"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">Visit Website</span>
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
                  </div>

                  <Separator />

                  <Button 
                    className="w-full" 
                    onClick={() => setShowContactForm(true)}
                  >
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {daysOfWeek.map((day) => {
                      const hours = business.hours[day];
                      const isToday = day === today;
                      
                      return (
                        <div 
                          key={day} 
                          className={cn(
                            "flex items-center justify-between text-sm",
                            isToday && "font-medium text-primary"
                          )}
                        >
                          <span className="capitalize">{day}</span>
                          <span>{hours || "Closed"}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              {business.socialLinks && Object.keys(business.socialLinks).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Connect With Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {business.socialLinks.facebook && (
                        <a 
                          href={business.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialLinks.instagram && (
                        <a 
                          href={business.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialLinks.twitter && (
                        <a 
                          href={business.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialLinks.linkedin && (
                        <a 
                          href={business.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Claim Listing Section */}
          {!business.claimed && !isOwner && (
            <div className="mt-12">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="py-8 px-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Is this your business?
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    Claim your listing to update information and respond to reviews.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                    asChild
                  >
                    <Link to="/sign-up">
                      Claim This Listing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Related Businesses */}
          {relatedBusinesses.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                Similar Businesses in {business.city}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedBusinesses.map((relatedBusiness) => (
                  <BusinessCard key={relatedBusiness._id} business={relatedBusiness} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm 
          business={business}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
}