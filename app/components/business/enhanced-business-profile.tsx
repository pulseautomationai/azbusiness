import { useState } from "react";
import { useQuery } from "convex/react";
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

// Feature gating components
import { FeatureGate, FeatureBadge } from "~/components/FeatureGate";
import { UpgradeCTA, ClaimBusinessCTA } from "~/components/UpgradeCTA";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";

// Tab components
import { OverviewTab } from "./tabs/OverviewTab";
import { ServicesTab } from "./tabs/ServicesTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { InsightsTab } from "./tabs/InsightsTab";

// Other components
import ContactForm from "./contact-form";
import { DisabledContactForm } from "./disabled-contact-form";
import { ClaimListingCTA } from "./claim-listing-cta";
import BusinessCard from "../category/business-card";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

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

function EnhancedBusinessProfile({ 
  business, 
  relatedBusinesses, 
  reviews,
  isOwner 
}: BusinessProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);
  
  const { canAccess } = usePlanFeatures({ planTier: business.planTier });
  
  // Get business content for enhanced features
  const businessContent = useQuery(api.businessContent.getBusinessContent, {
    businessId: business._id as Id<"businesses">,
  });
  
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
      {/* Enhanced Hero Section */}
      <section className="relative bg-muted/30">
        <FeatureGate
          featureId="heroImageUpload"
          planTier={business.planTier}
          fallback={
            business.heroImage && (
              <div className="absolute inset-0 h-80 overflow-hidden">
                <img 
                  src={business.heroImage} 
                  alt={business.name}
                  className="h-full w-full object-cover opacity-30"
                />
              </div>
            )
          }
        >
          {(businessContent?.heroImageUrl || business.heroImage) && (
            <div className="absolute inset-0 h-80 overflow-hidden">
              <img 
                src={businessContent?.heroImageUrl || business.heroImage} 
                alt={business.name}
                className="h-full w-full object-cover opacity-30"
              />
            </div>
          )}
        </FeatureGate>
        
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
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    
                    {/* Verified Badge */}
                    <FeatureGate
                      featureId="verifiedBadge"
                      planTier={business.planTier}
                      showUpgrade={false}
                    >
                      {business.verified && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                          <Shield className="h-5 w-5" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      )}
                    </FeatureGate>
                    
                    {/* Plan Badge */}
                    {business.planTier !== "free" && (
                      <Badge variant="default">
                        {planBadgeText(business.planTier)}
                      </Badge>
                    )}
                    
                    {/* VIP Badge for Power users */}
                    <FeatureGate
                      featureId="vipSupport"
                      planTier={business.planTier}
                      showUpgrade={false}
                    >
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </Badge>
                    </FeatureGate>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {business.category && (
                      <Link 
                        to={`/${business.category.slug}`}
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
              
              {/* Enhanced Description */}
              <div className="mt-4">
                <FeatureGate
                  featureId="customSummary"
                  planTier={business.planTier}
                  fallback={
                    <p className="text-lg text-muted-foreground max-w-3xl">
                      {business.description}
                    </p>
                  }
                >
                  <p className="text-lg text-muted-foreground max-w-3xl">
                    {businessContent?.customSummary || business.description}
                  </p>
                </FeatureGate>
              </div>
            </div>

            {/* Enhanced Actions */}
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
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <FeatureGate
                    featureId="contactForm"
                    planTier={business.planTier}
                    fallback={
                      <div className="relative">
                        <Button 
                          size="lg"
                          disabled
                          className="w-full"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Get Quote
                        </Button>
                        <FeatureBadge
                          featureId="contactForm"
                          planTier={business.planTier}
                          requiredPlan="pro"
                          className="absolute -top-2 -right-2"
                        />
                      </div>
                    }
                  >
                    <Button 
                      size="lg"
                      onClick={() => setShowContactForm(true)}
                      className="w-full"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Get Quote
                    </Button>
                  </FeatureGate>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.location.href = `tel:${business.phone}`}
                    className="w-full"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </>
              )}
              
              {!business.claimed && !isOwner && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/claim-business">
                    <Award className="mr-2 h-4 w-4" />
                    Claim this listing
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Main Content with Tabs */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Enhanced Tabs */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="insights" className="relative">
                    Insights
                    <FeatureBadge
                      featureId="insightsTab"
                      planTier={business.planTier}
                      requiredPlan="pro"
                      className="absolute -top-1 -right-1 scale-75"
                    />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <OverviewTab
                    business={business}
                    businessContent={businessContent}
                    isOwner={isOwner}
                  />
                </TabsContent>

                <TabsContent value="services">
                  <ServicesTab
                    business={business}
                    businessContent={businessContent}
                    isOwner={isOwner}
                  />
                </TabsContent>

                <TabsContent value="reviews">
                  <ReviewsTab
                    business={business}
                    businessContent={businessContent}
                    reviews={reviews}
                    isOwner={isOwner}
                  />
                </TabsContent>

                <TabsContent value="insights">
                  <FeatureGate
                    featureId="insightsTab"
                    planTier={business.planTier}
                    fallback={
                      <div className="text-center py-12">
                        <UpgradeCTA
                          currentPlan={business.planTier}
                          businessName={business.name}
                        />
                      </div>
                    }
                  >
                    <InsightsTab
                      business={business}
                      businessContent={businessContent}
                      isOwner={isOwner}
                    />
                  </FeatureGate>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Enhanced Sidebar */}
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

                  <FeatureGate
                    featureId="contactForm"
                    planTier={business.planTier}
                    fallback={
                      <Button 
                        className="w-full" 
                        disabled
                      >
                        Send Message
                      </Button>
                    }
                  >
                    <Button 
                      className="w-full" 
                      onClick={() => setShowContactForm(true)}
                    >
                      Send Message
                    </Button>
                  </FeatureGate>
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

              {/* Enhanced Social Links */}
              {(business.socialLinks || businessContent?.additionalSocialLinks) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Connect With Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {business.socialLinks?.facebook && (
                        <a 
                          href={business.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialLinks?.instagram && (
                        <a 
                          href={business.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialLinks?.twitter && (
                        <a 
                          href={business.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialLinks?.linkedin && (
                        <a 
                          href={business.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      
                      {/* Additional social links for Pro+ */}
                      <FeatureGate
                        featureId="editProfile"
                        planTier={business.planTier}
                        showUpgrade={false}
                      >
                        {businessContent?.additionalSocialLinks?.tiktok && (
                          <a 
                            href={businessContent.additionalSocialLinks.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                          >
                            <span className="text-sm font-bold">TT</span>
                          </a>
                        )}
                      </FeatureGate>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analytics Preview for Pro+ */}
              <FeatureGate
                featureId="basicAnalytics"
                planTier={business.planTier}
                showUpgrade={false}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Page Views</span>
                        <span className="font-medium">142</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Phone Clicks</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Leads</span>
                        <span className="font-medium">8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FeatureGate>
            </div>
          </div>

          {/* Claim Business CTA */}
          {!business.claimed && !isOwner && (
            <div className="mt-12">
              <ClaimBusinessCTA businessName={business.name} />
            </div>
          )}

          {/* Upgrade CTA */}
          {business.planTier !== "power" && (
            <div className="mt-8">
              <UpgradeCTA
                currentPlan={business.planTier}
                businessName={business.name}
              />
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

      {/* Enhanced Contact Form Modal */}
      {showContactForm && (
        <FeatureGate
          featureId="contactForm"
          planTier={business.planTier}
          fallback={
            <DisabledContactForm
              business={business}
              onClose={() => setShowContactForm(false)}
            />
          }
        >
          <ContactForm 
            business={business}
            onClose={() => setShowContactForm(false)}
          />
        </FeatureGate>
      )}

      {/* Claim Listing CTA for Free Tier */}
      <ClaimListingCTA business={business} />
    </div>
  );
}

export default EnhancedBusinessProfile;