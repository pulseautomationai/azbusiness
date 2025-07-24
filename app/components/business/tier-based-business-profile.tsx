import React, { useState } from 'react';
import { Link } from "react-router";
import { 
  Star, Phone, Mail, Globe, MapPin, Clock, Shield, 
  ExternalLink, Facebook, Instagram, Twitter, 
  Linkedin, ChevronRight, Navigation
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import ContactForm from "./contact-form";
import BusinessCard from "../category/business-card";
import { ClaimBanner } from "./claim-banner";
import { generateBusinessStructuredData } from "~/utils/structuredData";

// Import tier system components
import { BusinessWithTier, TierLevel, TIER_CONFIGURATIONS } from '~/types/tiers';
import { getTierConfig } from '~/utils/tierValidation';
import { ComponentFactory } from '~/factories/ComponentFactory';
import { TierAwareComponent, TierSafeComponent } from './TierAwareComponent';
import { ReviewsSection } from './ReviewsSection';
import { BusinessDetails } from './BusinessDetails';
import { PerformanceIndicators } from './PerformanceIndicators';
import { CompetitiveAnalysisSection } from './CompetitiveAnalysisSection';
import { ImageGallery } from './ImageGallery';
import { LeadCaptureForm } from './LeadCaptureForm';

interface BusinessProfileProps {
  business: BusinessWithTier & {
    category?: { name: string; icon?: string; slug: string } | null;
    services: string[];
    hours?: Record<string, string> | null;
    featured: boolean;
    priority: number;
    ownerId?: string;
    verified: boolean;
    active: boolean;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
    address: string;
    state: string;
    zip: string;
    createdAt: number;
    updatedAt: number;
  };
  relatedBusinesses: any[];
  reviews: any[];
  isOwner: boolean;
  viewMode?: 'consumer' | 'owner';
}

export default function TierBasedBusinessProfile({ 
  business, 
  relatedBusinesses, 
  reviews,
  isOwner,
  viewMode = 'consumer'
}: BusinessProfileProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Ensure business has a valid planTier
  const businessWithTier = {
    ...business,
    planTier: (business.planTier || 'free') as TierLevel
  };
  
  // Get tier configuration
  const tierConfig = getTierConfig(businessWithTier.planTier);
  
  // Dynamic component selection based on tier
  const HeaderComponent = ComponentFactory.getHeaderComponent(businessWithTier.planTier);
  const AIInsightsComponent = ComponentFactory.getAIInsightsComponent(businessWithTier.planTier);
  const ServiceComponent = ComponentFactory.getServiceComponent(businessWithTier.planTier);

  // Helper functions
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  const getTodayHours = () => {
    const hours = business.hours?.[today as keyof typeof business.hours];
    return hours || "Closed";
  };

  const isCurrentlyOpen = () => {
    const hours = getTodayHours();
    if (hours === "Closed") return false;
    return true;
  };

  const getMapEmbedUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return `https://www.google.com/maps/embed/v1/place?key=demo&q=${encodeURIComponent(address)}`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`;
  };

  const getDirectionsUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  // Generate structured data for SEO
  const structuredData = generateBusinessStructuredData(business, null);

  return (
    <TierSafeComponent business={businessWithTier}>
      <div className={`business-profile tier-${businessWithTier.planTier} min-h-screen bg-agave-cream relative`}>
        {/* Local Business Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Claim Banner for Unverified Businesses */}
        {!business.verified && (
          <section className="pt-28 pb-4 bg-agave-cream border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <ClaimBanner business={business} />
            </div>
          </section>
        )}

        {/* Dynamic Header Based on Tier */}
        <div className={business.verified ? "pt-24" : ""}>
          <HeaderComponent 
            business={businessWithTier}
            tierConfig={tierConfig}
            showPerformanceData={tierConfig.features.showPerformanceData}
          />
        </div>
        
        {/* Main Content */}
        <section className="py-4 lg:py-6">
          <div className="mx-auto max-w-7xl px-4 lg:px-6 xl:px-8">
            {/* Free Tier: Responsive Desktop + Mobile Layout */}
            {businessWithTier.planTier === 'free' ? (
              <>
                {/* Mobile: Single Column */}
                <div className="lg:hidden space-y-4">
                  <AIInsightsComponent 
                    business={businessWithTier}
                    tierConfig={tierConfig}
                    maxInsights={tierConfig.limits.maxAIInsights}
                  />
                  
                  <ReviewsSection 
                    business={businessWithTier}
                    tierConfig={tierConfig}
                    reviews={reviews}
                    maxReviews={tierConfig.limits.maxReviews}
                    showResponses={tierConfig.features.showReviewResponses}
                  />
                  
                  <BusinessDetails 
                    business={businessWithTier} 
                    tierConfig={tierConfig}
                    hours={business.hours}
                    socialLinks={business.socialLinks}
                  />

                  {/* Map Section - Mobile Enhanced */}
                  <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white">
                    <CardHeader className="bg-white border-b border-gray-200 p-4">
                      <CardTitle className="flex items-center justify-between text-ironwood-charcoal">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-ocotillo-red" />
                          </div>
                          <span className="font-medium text-base font-['Playfair_Display']">Find Us Here</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-gray-200 text-ironwood-charcoal hover:border-turquoise-sky hover:text-turquoise-sky hover:bg-agave-cream font-medium transition-colors"
                          onClick={() => window.open(getDirectionsUrl(), '_blank')}
                        >
                          <Navigation className="w-4 h-4" />
                          Directions
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative h-48 lg:h-64 w-full">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={getMapEmbedUrl()}
                          allowFullScreen
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Desktop: Two-Column Layout */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                  {/* Main Content - Left Column (2/3 width) */}
                  <div className="lg:col-span-2 space-y-4">
                    <AIInsightsComponent 
                      business={businessWithTier}
                      tierConfig={tierConfig}
                      maxInsights={tierConfig.limits.maxAIInsights}
                    />
                    
                    <ReviewsSection 
                      business={businessWithTier}
                      tierConfig={tierConfig}
                      reviews={reviews}
                      maxReviews={tierConfig.limits.maxReviews}
                      showResponses={tierConfig.features.showReviewResponses}
                    />
                  </div>
                  
                  {/* Sidebar - Right Column (1/3 width) */}
                  <div className="lg:col-span-1 space-y-4">
                    <BusinessDetails 
                      business={businessWithTier} 
                      tierConfig={tierConfig}
                      hours={business.hours}
                      socialLinks={business.socialLinks}
                    />
                    
                    {/* Map Section */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white">
                      <CardHeader className="bg-white border-b border-gray-200 p-4">
                        <CardTitle className="flex items-center justify-between text-ironwood-charcoal">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-ocotillo-red" />
                            </div>
                            <span className="font-medium text-lg font-['Playfair_Display']">Visit Our Location</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 text-ironwood-charcoal hover:border-turquoise-sky hover:text-turquoise-sky hover:bg-agave-cream font-medium transition-colors"
                            onClick={() => window.open(getDirectionsUrl(), '_blank')}
                          >
                            <Navigation className="w-4 h-4" />
                            Directions
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative h-64 w-full">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={getMapEmbedUrl()}
                            allowFullScreen
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              /* Standard 2-Column Layout for Paid Tiers */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                
                {/* Dynamic AI Insights Section */}
                <AIInsightsComponent 
                  business={businessWithTier}
                  tierConfig={tierConfig}
                  maxInsights={tierConfig.limits.maxAIInsights}
                />
                
                {/* Dynamic Services Section */}
                {ServiceComponent && (
                  <ServiceComponent 
                    business={businessWithTier}
                    tierConfig={tierConfig}
                    maxServices={tierConfig.limits.maxServices}
                  />
                )}
                
                {/* Conditional Image Gallery */}
                <TierAwareComponent 
                  business={businessWithTier} 
                  requiredTier={['power']}
                >
                  <ImageGallery business={businessWithTier} />
                </TierAwareComponent>
                
                {/* Dynamic Reviews Section */}
                <ReviewsSection 
                  business={businessWithTier}
                  tierConfig={tierConfig}
                  reviews={reviews}
                  maxReviews={tierConfig.limits.maxReviews}
                  showResponses={tierConfig.features.showReviewResponses}
                />
              </div>
              
              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
                {/* Business Details - Moved to Top */}
                <BusinessDetails 
                  business={businessWithTier} 
                  tierConfig={tierConfig}
                  hours={business.hours}
                  socialLinks={business.socialLinks}
                />

                {/* Map Section - Second Position */}
                <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="bg-white border-b border-gray-200 p-4">
                    <CardTitle className="flex items-center justify-between text-ironwood-charcoal">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-ocotillo-red" />
                        </div>
                        <span className="font-medium text-lg font-['Playfair_Display']">Visit Our Location</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-gray-200 text-ironwood-charcoal hover:border-turquoise-sky hover:text-turquoise-sky hover:bg-agave-cream font-medium transition-colors"
                        onClick={() => window.open(getDirectionsUrl(), '_blank')}
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative h-64 w-full">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={getMapEmbedUrl()}
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Get Exclusive Service for Power Tier - Moved to Bottom */}
                <TierAwareComponent 
                  business={businessWithTier} 
                  requiredTier={['power']}
                >
                  <Card className="p-6 bg-white border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-ironwood-charcoal font-['Playfair_Display']">Get Exclusive Service</h3>
                    <LeadCaptureForm businessId={businessWithTier._id} />
                  </Card>
                </TierAwareComponent>
              </div>
            </div>
            )}
            
            {/* Related Businesses Section */}
            {relatedBusinesses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Similar Businesses in {business.city}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedBusinesses.slice(0, 6).map((relatedBusiness) => (
                    <BusinessCard key={relatedBusiness._id} business={relatedBusiness} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </TierSafeComponent>
  );
}