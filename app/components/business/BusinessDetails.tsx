import React from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { Clock, MapPin, Phone, Mail, Globe, Facebook, Instagram, Twitter, Linkedin, Calendar, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

interface BusinessDetailsProps {
  business: BusinessWithTier & {
    address: string;
    state: string;
    zip: string;
    email?: string;
    website?: string;
    phone: string;
  };
  tierConfig: TierConfig;
  hours?: Record<string, string> | null;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  business,
  tierConfig,
  hours,
  socialLinks,
}) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const isOpen = (hoursString?: string) => {
    if (!hoursString || hoursString === 'Closed') return false;
    // Simplified logic - in production, you'd parse actual hours
    return true;
  };

  const getTodayHours = () => {
    return hours?.[today as keyof typeof hours] || 'Closed';
  };

  const isCurrentlyOpen = isOpen(getTodayHours());

  return (
    <Card className="business-details bg-white border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-ironwood-charcoal" />
            <span className="font-medium text-ironwood-charcoal font-['Playfair_Display']">Business Information</span>
          </div>
          {isCurrentlyOpen ? (
            <Badge className="bg-turquoise-sky text-white text-xs font-medium px-2.5 py-1">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Open Now
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              Closed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Contact Information - Moved to Top */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-sm text-ironwood-charcoal">
            <Phone className="w-4 h-4 text-gray-500" />
            Contact Information
          </h4>
          
          <div className="bg-agave-cream rounded p-3 border border-gray-200 space-y-2">
            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-turquoise-sky" />
              <a href={`tel:${business.phone}`} className="text-turquoise-sky hover:text-turquoise-sky/80 font-medium text-sm">
                {business.phone}
              </a>
            </div>
            
            {/* Website */}
            {business.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ironwood-charcoal hover:text-gray-600 text-sm"
                >
                  Visit Website
                </a>
              </div>
            )}
            
            {/* Address - Now in Same Container */}
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-sm flex-1">
                <p className="font-medium text-ironwood-charcoal">{business.address}</p>
                <p className="text-gray-500">
                  {business.city}, {business.state} {business.zip}
                </p>
              </div>
            </div>
            
            {/* Email - if applicable */}
            {business.email && tierConfig.features.showPerformanceData && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href={`mailto:${business.email}`} className="text-ironwood-charcoal hover:text-gray-600 text-sm">
                  {business.email}
                </a>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Business Hours */}
        {hours && (
          <>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm text-ironwood-charcoal">
                <Clock className="w-4 h-4 text-gray-500" />
                Business Hours
              </h4>
              <div className="bg-agave-cream rounded p-3 border border-gray-200">
                <div className="space-y-1">
                  {daysOfWeek.map((day) => {
                    const dayHours = hours[day as keyof typeof hours] || 'Closed';
                    const isToday = day === today;
                    
                    return (
                      <div
                        key={day}
                        className={`flex justify-between text-xs py-1 px-2 rounded ${
                          isToday ? 'bg-agave-cream font-medium' : ''
                        }`}
                      >
                        <span className={`${
                          isToday ? 'text-ironwood-charcoal' : 'text-gray-600'
                        }`}>
                          {formatDay(day)}
                        </span>
                        <span className={`${
                          isToday ? 'text-ocotillo-red' : 'text-gray-600'
                        } ${
                          dayHours === 'Closed' ? 'text-gray-400' : ''
                        }`}>
                          {dayHours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Separator className="bg-gray-200" />
          </>
        )}

        {/* Social Links (Starter+ tiers) */}
        {socialLinks && tierConfig.features.showPerformanceData && (
          <>
            <Separator className="bg-gray-200" />
            <div className="space-y-3">
              <h4 className="font-medium">Connect With Us</h4>
              <div className="flex gap-2">
                {socialLinks.facebook && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={() => window.open(socialLinks.facebook, '_blank')}
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                )}
                {socialLinks.instagram && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={() => window.open(socialLinks.instagram, '_blank')}
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                )}
                {socialLinks.twitter && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={() => window.open(socialLinks.twitter, '_blank')}
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                )}
                {socialLinks.linkedin && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9"
                    onClick={() => window.open(socialLinks.linkedin, '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Service Area (Pro+ tiers) */}
        {tierConfig.features.showAdvancedAI && (
          <>
            <Separator className="bg-gray-200" />
            <div className="space-y-2">
              <h4 className="font-medium">Service Area</h4>
              <p className="text-sm text-gray-600">
                Serving {business.city} and surrounding areas within 25 miles
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};