import React from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { Star, MapPin, Phone, Clock, Shield, Zap, Trophy } from 'lucide-react';

interface HeaderProps {
  business: BusinessWithTier;
  tierConfig: TierConfig;
  showPerformanceData: boolean;
}

// Tier Badge Component with unified styling
const TierBadge: React.FC<{ tierConfig: TierConfig }> = ({ tierConfig }) => {
  const getBadgeClasses = () => {
    const baseClasses = "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200";
    
    switch (tierConfig.badge.style) {
      case 'premium':
        return `${baseClasses} bg-white text-ironwood-charcoal border border-gray-200 shadow-sm`;
      case 'featured':
        return `${baseClasses} bg-white text-ironwood-charcoal border border-gray-200 shadow-sm`;
      case 'enhanced':
        return `${baseClasses} bg-white text-ironwood-charcoal border border-gray-200 shadow-sm`;
      default:
        // Clean style for free tier
        return `${baseClasses} bg-white text-ironwood-charcoal border border-gray-200 shadow-sm`;
    }
  };
  
  return (
    <div className={getBadgeClasses()}>
      <span className="text-sm">{tierConfig.badge.icon}</span>
      <span>{tierConfig.badge.text}</span>
    </div>
  );
};

// Unified Header for all tiers - Clean, consistent design
const UnifiedHeader: React.FC<HeaderProps & { verifiedText?: string }> = ({ business, tierConfig, showPerformanceData, verifiedText }) => {
  return (
    <div className="business-header bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex gap-4">
            {business.logo && (
              <img 
                src={business.logo} 
                alt={`${business.name} logo`}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-medium text-ocotillo-red font-['Playfair_Display']">{business.name}</h1>
                <Shield className="w-5 h-5 text-turquoise-sky" />
              </div>
              <div className="flex items-center gap-2 text-ironwood-charcoal text-base mb-3 font-['Inter']">
                <span>{business.category?.name} in {business.city}, {business.state}</span>
                {/* Badge next to location */}
                {(business as any).verified && verifiedText && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-turquoise-sky text-white">
                    <Star className="w-3.5 h-3.5" />
                    <span>{verifiedText}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(business.rating) 
                            ? 'fill-desert-marigold text-desert-marigold' 
                            : 'fill-transparent text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-ironwood-charcoal">{business.rating}</span>
                  <span className="text-gray-500 text-sm">({business.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{business.city}, Arizona</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Basic Header (Free Tier) - Uses unified design
export const BasicHeader: React.FC<HeaderProps> = ({ business, tierConfig }) => {
  return <UnifiedHeader business={business} tierConfig={tierConfig} showPerformanceData={false} verifiedText="Verified Business" />;
};

// Professional Header (Starter Tier) - Uses unified design
export const ProfessionalHeader: React.FC<HeaderProps> = ({ business, tierConfig, showPerformanceData }) => {
  return <UnifiedHeader business={business} tierConfig={tierConfig} showPerformanceData={showPerformanceData} verifiedText="Verified Business" />;
};

// Featured Header (Pro Tier) - Uses unified design
export const FeaturedHeader: React.FC<HeaderProps> = ({ business, tierConfig, showPerformanceData }) => {
  return <UnifiedHeader business={business} tierConfig={tierConfig} showPerformanceData={showPerformanceData} verifiedText="Pro-Verified Business" />;
};

// Premium Header (Power Tier) - Uses unified design
export const PremiumHeader: React.FC<HeaderProps> = ({ business, tierConfig, showPerformanceData }) => {
  return <UnifiedHeader business={business} tierConfig={tierConfig} showPerformanceData={showPerformanceData} verifiedText="Power-Verified Business" />;
};