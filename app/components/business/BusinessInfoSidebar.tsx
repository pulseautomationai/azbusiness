import { 
  Phone, Mail, Globe, MapPin, Clock, 
  Facebook, Instagram, Twitter, Linkedin,
  ExternalLink, Copy, Check, MessageSquare,
  Star, BarChart3, Shield, Award, Crown
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { FeatureGate } from "~/components/FeatureGate";
import { cn } from "~/lib/utils";
import { BusinessBadges } from "./business-badges";

interface BusinessInfoSidebarProps {
  business: any;
  businessContent: any;
  isOwner: boolean;
  onContactClick?: () => void;
}

export function BusinessInfoSidebar({ 
  business, 
  businessContent, 
  isOwner, 
  onContactClick 
}: BusinessInfoSidebarProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Contact Information
            {business.verified && (
              <FeatureGate
                featureId="verifiedBadge"
                planTier={business.planTier}
                showUpgrade={false}
              >
                <Shield className="h-4 w-4 text-turquoise-sky" />
              </FeatureGate>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Phone */}
            <div className="group">
              <div className="flex items-center justify-between">
                <a 
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 text-sm hover:text-primary flex-1"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatPhoneNumber(business.phone)}</span>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(business.phone, 'phone')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  {copiedField === 'phone' ? (
                    <Check className="h-3 w-3 text-turquoise-sky" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => window.location.href = `tel:${business.phone}`}>
                  Call Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.location.href = `sms:${business.phone}`}>
                  Text
                </Button>
              </div>
            </div>
            
            {/* Email */}
            <div className="group">
              <div className="flex items-center justify-between">
                <a 
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 text-sm hover:text-primary flex-1"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="break-all">{business.email}</span>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(business.email, 'email')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  {copiedField === 'email' ? (
                    <Check className="h-3 w-3 text-turquoise-sky" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Website */}
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
            
            {/* Address */}
            <div className="group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 text-sm flex-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{business.address}</p>
                    <p>{business.city}, {business.state} {business.zip}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`${business.address}, ${business.city}, ${business.state} ${business.zip}`, 'address')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  {copiedField === 'address' ? (
                    <Check className="h-3 w-3 text-turquoise-sky" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  const address = encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zip}`);
                  window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </div>

          <Separator />

          {/* Contact Form Button */}
          <FeatureGate
            featureId="contactForm"
            planTier={business.planTier}
            fallback={
              <div className="relative">
                <Button 
                  className="w-full" 
                  disabled
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <div className="absolute inset-0 bg-muted/50 rounded flex items-center justify-center">
                  <span className="text-xs font-medium">Pro Plan Required</span>
                </div>
              </div>
            }
          >
            <Button 
              className="w-full" 
              onClick={onContactClick}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
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
                    "flex items-center justify-between text-sm py-1",
                    isToday && "font-medium text-primary bg-primary/5 px-2 rounded"
                  )}
                >
                  <span className="capitalize">{day}</span>
                  <span className={hours ? "text-turquoise-sky" : "text-ocotillo-red"}>
                    {hours || "Closed"}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Current Status */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-turquoise-sky rounded-full animate-pulse" />
              <span className="text-sm font-medium text-turquoise-sky">Open Now</span>
              <span className="text-xs text-muted-foreground">• Closes at 6:00 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Business Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Verified Badge */}
            <FeatureGate
              featureId="verifiedBadge"
              planTier={business.planTier}
              fallback={
                <div className="flex items-center gap-2 p-2 border rounded-lg opacity-50">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Verified Business</span>
                  <Badge variant="outline" className="text-xs ml-auto">Pro+</Badge>
                </div>
              }
            >
              {business.verified && (
                <div className="flex items-center gap-2 p-2 bg-agave-cream border border-gray-200 rounded-lg">
                  <Shield className="h-4 w-4 text-turquoise-sky" />
                  <span className="text-sm font-medium text-ironwood-charcoal">Verified Business</span>
                </div>
              )}
            </FeatureGate>

            {/* Business Badges */}
            <BusinessBadges business={business} />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
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
                  className="rounded-lg bg-agave-cream p-3 hover:bg-gray-50 transition-colors border border-gray-200"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5 text-turquoise-sky" />
                </a>
              )}
              {business.socialLinks?.instagram && (
                <a 
                  href={business.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-agave-cream p-3 hover:bg-gray-50 transition-colors border border-gray-200"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5 text-desert-marigold" />
                </a>
              )}
              {business.socialLinks?.twitter && (
                <a 
                  href={business.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-agave-cream p-3 hover:bg-gray-50 transition-colors border border-gray-200"
                  title="Twitter"
                >
                  <Twitter className="h-5 w-5 text-turquoise-sky" />
                </a>
              )}
              {business.socialLinks?.linkedin && (
                <a 
                  href={business.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-agave-cream p-3 hover:bg-gray-50 transition-colors border border-gray-200"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-turquoise-sky" />
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
                    className="rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
                    title="TikTok"
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
              {isOwner && (
                <Badge variant="secondary" className="text-xs">
                  Owner View
                </Badge>
              )}
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
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                View Full Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </FeatureGate>
    </div>
  );
}