import React from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { Phone, Mail, Globe, MapPin, Clock, MessageSquare, Shield, Zap, Navigation } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';

interface ContactProps {
  business: BusinessWithTier;
  tierConfig: TierConfig;
  showLeadCapture: boolean;
}

// Minimal Contact (Free Tier) - Clean and compact design
export const MinimalContact: React.FC<ContactProps> = ({ business, tierConfig }) => {
  const getDirectionsUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <>
      {/* Mobile Contact Section - Compact Design */}
      <Card className="lg:hidden bg-white border-gray-200">
        {/* Availability Status Bar */}
        <div className="bg-gray-50 text-turquoise-sky px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-turquoise-sky rounded-full"></div>
            <span className="text-sm font-medium">Open Now</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Phone Contact - Primary Button */}
          <a 
            href={`tel:${business.phone}`}
            className="block w-full bg-ocotillo-red text-white font-medium py-3 px-4 rounded-lg hover:bg-ocotillo-red/90 transition-colors flex items-center justify-center gap-2"
            aria-label={`Call ${business.name} at ${business.phone}`}
          >
            <Phone className="w-4 h-4" />
            <span>{business.phone}</span>
          </a>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Directions</span>
            </a>
          </div>
        </div>
      </Card>

      {/* Desktop Contact Sidebar - Compact Design */}
      <Card className="hidden lg:block bg-white border-gray-200">
        <div className="p-4 space-y-3">
          {/* Phone - Primary Action */}
          <div>
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 bg-ocotillo-red text-white font-medium px-4 py-2.5 rounded-lg hover:bg-ocotillo-red/90 transition-colors w-full"
            >
              <Phone className="w-4 h-4" />
              <span>{business.phone}</span>
            </a>
          </div>

          {/* Website & Directions */}
          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-5 h-5 text-turquoise-sky mx-auto mb-1" />
                <span className="text-xs font-medium text-ironwood-charcoal">Visit Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-3 bg-white rounded-lg border border-gray-200/30 hover:border-gray-200/50 hover:shadow-sm transition-all"
            >
              <Navigation className="w-5 h-5 text-turquoise-sky mx-auto mb-1" />
              <span className="text-xs font-medium text-ironwood-charcoal">Get Directions</span>
            </a>
          </div>

          {/* Business Hours */}
          <div>
            <div className="bg-gray-50 rounded p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ironwood-charcoal">Today</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-turquoise-sky rounded-full"></div>
                  <span className="text-sm font-medium text-turquoise-sky">Open Now</span>
                </div>
              </div>
              <div className="text-center">
                <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <span className="text-sm text-ironwood-charcoal">8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-ironwood-charcoal">{business.address}</p>
                  <p className="text-xs text-gray-500">{business.city}, {business.state} {business.zip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="pt-4 border-t border-gray-200/10">
            <div className="bg-agave-cream p-3 rounded-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-turquoise-sky" />
              <div>
                <span className="font-medium text-sm text-ironwood-charcoal block">Verified Business</span>
                <span className="text-xs text-ironwood-charcoal/60">Trusted Arizona Service Provider</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

// Enhanced Contact (Starter Tier) - Clean and compact design
export const EnhancedContact: React.FC<ContactProps> = ({ business, tierConfig }) => {
  const getDirectionsUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <>
      {/* Mobile Contact Section */}
      <Card className="lg:hidden bg-white border-gray-200">
        <div className="bg-gray-50 text-turquoise-sky px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-turquoise-sky rounded-full"></div>
            <span className="text-sm font-medium">Available Now</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <a 
            href={`tel:${business.phone}`}
            className="block w-full bg-ocotillo-red text-white font-medium py-3 px-4 rounded-lg hover:bg-ocotillo-red/90 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>{business.phone}</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Directions</span>
            </a>
          </div>
        </div>
      </Card>

      {/* Desktop Contact Sidebar */}
      <Card className="hidden lg:block bg-white border-gray-200">
        <div className="p-4 space-y-3">
          <div>
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 bg-ocotillo-red text-white font-medium px-4 py-2.5 rounded-lg hover:bg-ocotillo-red/90 transition-colors w-full"
            >
              <Phone className="w-4 h-4" />
              <span>{business.phone}</span>
            </a>
          </div>

          {business.email && (
            <div>
              <a 
                href={`mailto:${business.email}`}
                className="flex items-center justify-center gap-2 bg-white text-ironwood-charcoal font-medium px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Send Email</span>
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-turquoise-sky mx-auto mb-1" />
                <span className="text-xs font-medium text-ironwood-charcoal">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4 text-turquoise-sky mx-auto mb-1" />
              <span className="text-xs font-medium text-ironwood-charcoal">Directions</span>
            </a>
          </div>

          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ironwood-charcoal">Today</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-turquoise-sky rounded-full"></div>
                <span className="text-sm font-medium text-turquoise-sky">Available Now</span>
              </div>
            </div>
            <div className="text-center">
              <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <span className="text-sm text-ironwood-charcoal">8:00 AM - 6:00 PM</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-ironwood-charcoal">{business.address}</p>
                <p className="text-xs text-gray-500">{business.city}, {business.state} {business.zip}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200/10">
            <div className="bg-agave-cream p-3 rounded-lg flex items-center gap-2">
              <Shield className="w-4 h-4 text-turquoise-sky" />
              <div>
                <span className="font-medium text-sm text-ironwood-charcoal block">Professional Service</span>
                <span className="text-xs text-ironwood-charcoal/60">Quick response guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

// Professional Contact (Pro Tier) - Clean and compact design
export const ProfessionalContact: React.FC<ContactProps> = ({ business, tierConfig }) => {
  const getDirectionsUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <>
      {/* Mobile Contact Section */}
      <Card className="lg:hidden bg-white border-gray-200">
        <div className="bg-gray-50 text-turquoise-sky px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-turquoise-sky rounded-full"></div>
            <span className="text-sm font-medium">Priority Response</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <a 
            href={`tel:${business.phone}`}
            className="block w-full bg-ocotillo-red text-white font-medium py-3 px-4 rounded-lg hover:bg-ocotillo-red/90 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Priority Line</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Directions</span>
            </a>
          </div>
        </div>
      </Card>

      {/* Desktop Contact Sidebar */}
      <Card className="hidden lg:block bg-white border-gray-200">
        <div className="p-4 space-y-3">
          <div>
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 bg-ocotillo-red text-white font-medium px-4 py-2.5 rounded-lg hover:bg-ocotillo-red/90 transition-colors w-full"
            >
              <Phone className="w-4 h-4" />
              <span>Priority Call Line</span>
            </a>
          </div>

          <div>
            <a 
              className="flex items-center justify-center gap-2 bg-white text-ironwood-charcoal font-medium px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Send Message</span>
            </a>
          </div>

          {business.email && (
            <div>
              <a 
                href={`mailto:${business.email}`}
                className="flex items-center justify-center gap-2 bg-white text-ironwood-charcoal font-medium px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Professional Inquiry</span>
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-turquoise-sky mx-auto mb-1" />
                <span className="text-xs font-medium text-ironwood-charcoal">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4 text-turquoise-sky mx-auto mb-1" />
              <span className="text-xs font-medium text-ironwood-charcoal">Directions</span>
            </a>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Response Time</span>
              <span className="font-medium text-turquoise-sky">Under 30 min</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Availability</span>
              <span className="font-medium text-turquoise-sky">Available Now</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-ironwood-charcoal">{business.address}</p>
                <p className="text-xs text-gray-500">{business.city}, {business.state} {business.zip}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200/10">
            <div className="bg-agave-cream p-3 rounded-lg flex items-center gap-2">
              <Shield className="w-4 h-4 text-turquoise-sky" />
              <div>
                <span className="font-medium text-sm text-ironwood-charcoal block">Pro-Verified Business</span>
                <span className="text-xs text-ironwood-charcoal/60">Priority support guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

// Lead Focused Contact (Power Tier) - Clean premium design
export const LeadFocusedContact: React.FC<ContactProps> = ({ business, tierConfig, showLeadCapture }) => {
  const getDirectionsUrl = () => {
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <>
      {/* Mobile Contact Section */}
      <Card className="lg:hidden bg-white border-gray-200">
        <div className="bg-gray-50 text-turquoise-sky px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-turquoise-sky rounded-full"></div>
            <span className="text-sm font-medium">VIP Priority Line</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <a 
            href={`tel:${business.phone}`}
            className="block w-full bg-ocotillo-red text-white font-medium py-3 px-4 rounded-lg hover:bg-ocotillo-red/90 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>VIP Priority Line</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-white text-ironwood-charcoal font-medium py-2 px-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Directions</span>
            </a>
          </div>
        </div>
      </Card>

      {/* Desktop Contact Sidebar */}
      <Card className="hidden lg:block bg-white border-gray-200">
        <div className="p-4 space-y-4">
          {showLeadCapture ? (
            <form className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-turquoise-sky focus:border-transparent text-sm"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-turquoise-sky focus:border-transparent text-sm"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Needed</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-turquoise-sky focus:border-transparent text-sm"
                  rows={2}
                  placeholder="What do you need help with?"
                />
              </div>
              
              <button className="w-full bg-ocotillo-red text-white font-medium py-2.5 px-4 rounded-lg hover:bg-ocotillo-red/90 transition-colors flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Get VIP Quote</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <a 
                href={`tel:${business.phone}`}
                className="flex items-center justify-center gap-2 bg-ocotillo-red text-white font-medium px-4 py-2.5 rounded-lg hover:bg-ocotillo-red/90 transition-colors w-full"
              >
                <Zap className="w-4 h-4" />
                <span>VIP Priority Line</span>
              </a>
              
              <a 
                className="flex items-center justify-center gap-2 bg-white text-ironwood-charcoal font-medium px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Instant Message</span>
              </a>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-turquoise-sky mx-auto mb-1" />
                <span className="text-xs font-medium text-ironwood-charcoal">Website</span>
              </a>
            )}
            
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4 text-turquoise-sky mx-auto mb-1" />
              <span className="text-xs font-medium text-ironwood-charcoal">Directions</span>
            </a>
          </div>

          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ironwood-charcoal">VIP Benefits</span>
              <Zap className="w-4 h-4 text-turquoise-sky" />
            </div>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-turquoise-sky rounded-full"></div>
                Instant response guarantee
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-turquoise-sky rounded-full"></div>
                Priority scheduling
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-turquoise-sky rounded-full"></div>
                Exclusive discounts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-turquoise-sky rounded-full"></div>
                24/7 emergency support
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-ironwood-charcoal">{business.address}</p>
                <p className="text-xs text-gray-500">{business.city}, {business.state} {business.zip}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200/10">
            <div className="bg-agave-cream p-3 rounded-lg flex items-center gap-2">
              <div className="flex gap-1">
                <Shield className="w-4 h-4 text-turquoise-sky" />
                <Zap className="w-4 h-4 text-ocotillo-red" />
              </div>
              <div>
                <span className="font-medium text-sm text-ironwood-charcoal block">Power-Tier Verified</span>
                <span className="text-xs text-ironwood-charcoal/60">Unlimited exclusive leads • VIP support</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};