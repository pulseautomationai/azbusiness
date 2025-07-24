import React from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { CheckCircle, Star, Wrench, Clock, DollarSign, Award, Sparkles, Zap } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

interface ServiceProps {
  business: BusinessWithTier;
  tierConfig: TierConfig;
  maxServices: number;
}

// Service Bullets (Free Tier)
export const ServiceBullets: React.FC<ServiceProps> = ({ business, tierConfig, maxServices }) => {
  const services = business.services?.slice(0, maxServices) || [
    'General repair services',
    'Installation services',
    'Maintenance programs',
    'Emergency services',
    'Free estimates',
    'Licensed and insured'
  ];
  
  return (
    <div className="services services--bullets">
      <h3 className="text-xl font-semibold mb-4">Services Offered</h3>
      <div className="bg-agave-cream rounded-lg p-6 border border-gray-200">
        <ul className="space-y-2">
          {services.map((service, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{service}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Enhanced Service Bullets (Starter Tier)
export const EnhancedServiceBullets: React.FC<ServiceProps> = ({ business, tierConfig, maxServices }) => {
  const services = business.services?.slice(0, maxServices) || [
    'Residential HVAC installation and repair',
    'Commercial heating and cooling systems',
    'Air quality improvement solutions',
    '24/7 emergency repair services',
    'Preventive maintenance programs',
    'Energy efficiency consultations',
    'Smart thermostat installation',
    'Duct cleaning and repair',
    'Free in-home estimates',
    'Financing options available',
    'Senior and military discounts',
    'Licensed, bonded, and insured'
  ];
  
  return (
    <div className="services services--enhanced-bullets">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Our Professional Services</h3>
        <Badge variant="secondary" className="bg-agave-cream text-ironwood-charcoal border border-gray-200">
          <Star className="w-3 h-3 mr-1" />
          Starter Business
        </Badge>
      </div>
      
      <Card className="p-8 border-gray-200">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-1 bg-agave-cream rounded-full">
                <CheckCircle className="w-5 h-5 text-turquoise-sky" />
              </div>
              <div>
                <p className="font-medium text-ironwood-charcoal">{service}</p>
                {index < 4 && (
                  <p className="text-sm text-ironwood-charcoal/70 mt-1">Professional quality guaranteed</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-agave-cream rounded-lg border border-gray-200">
          <p className="text-sm text-ironwood-charcoal text-center font-medium">
            All services performed by certified professionals with satisfaction guarantee
          </p>
        </div>
      </Card>
    </div>
  );
};

// Service Cards (Pro Tier)
export const ServiceCards: React.FC<ServiceProps> = ({ business, tierConfig, maxServices }) => {
  const serviceCards = [
    {
      name: 'HVAC Installation',
      icon: <Wrench className="w-6 h-6" />,
      description: 'Complete heating and cooling system installation with energy-efficient options',
      pricing: 'Starting at $2,500',
      features: ['Free consultation', 'Warranty included', 'Financing available']
    },
    {
      name: 'Emergency Repairs',
      icon: <Clock className="w-6 h-6" />,
      description: '24/7 emergency service for urgent heating and cooling issues',
      pricing: '$99 service call',
      features: ['30-minute response', 'Available 24/7', 'Priority scheduling']
    },
    {
      name: 'Maintenance Plans',
      icon: <Award className="w-6 h-6" />,
      description: 'Annual maintenance programs to keep your system running efficiently',
      pricing: '$19/month',
      features: ['Bi-annual inspections', 'Priority service', '15% repair discount']
    },
    {
      name: 'Air Quality Solutions',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Indoor air quality improvements including purifiers and humidifiers',
      pricing: 'Custom quotes',
      features: ['Free air quality test', 'Multiple solutions', 'Health benefits']
    }
  ];
  
  const displayServices = serviceCards.slice(0, maxServices);
  
  return (
    <div className="services services--cards">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-bold text-ironwood-charcoal">
          Premium Service Offerings
        </h3>
        <Badge className="bg-agave-cream text-ironwood-charcoal border border-gray-200 px-3 py-1">
          <Star className="w-4 h-4 mr-1" />
          Pro-Verified Services
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {displayServices.map((service, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-agave-cream rounded-lg text-desert-marigold border border-gray-200">
                {service.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-ironwood-charcoal mb-2">{service.name}</h4>
                <p className="text-ironwood-charcoal/80 mb-3">{service.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-turquoise-sky" />
                  <span className="font-semibold text-turquoise-sky">{service.pricing}</span>
                </div>
                <div className="space-y-1">
                  {service.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-2 text-sm text-ironwood-charcoal/70">
                      <CheckCircle className="w-3 h-3 text-desert-marigold" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-agave-cream rounded-xl border border-gray-200">
        <p className="text-center text-ironwood-charcoal font-medium">
          All services backed by our Pro-level guarantee • Licensed & insured • Satisfaction guaranteed
        </p>
      </div>
    </div>
  );
};

// Premium Service Cards (Power Tier) - Unified Design System
export const PremiumServiceCards: React.FC<ServiceProps> = ({ business, tierConfig, maxServices }) => {
  const premiumServices = [
    {
      name: 'VIP Installation Package',
      icon: <Zap className="w-6 h-6" />,
      description: 'Premium HVAC system installation with white-glove service and extended warranty',
      pricing: 'Premium pricing',
      features: ['Same-day consultation', '10-year warranty', '0% financing for 24 months', 'VIP support'],
      highlight: true
    },
    {
      name: 'Instant Emergency Response',
      icon: <Clock className="w-6 h-6" />,
      description: 'Guaranteed 15-minute response time for VIP customers with dedicated technician',
      pricing: 'Included with Power plan',
      features: ['15-min response', 'Dedicated tech team', 'No overtime charges', 'Priority dispatch']
    },
    {
      name: 'Platinum Maintenance',
      icon: <Award className="w-6 h-6" />,
      description: 'Comprehensive quarterly maintenance with performance optimization and energy analysis',
      pricing: 'Included with Power plan',
      features: ['Quarterly service', 'Energy optimization', 'Parts included', 'Performance reports']
    },
    {
      name: 'Smart Home Integration',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Advanced smart home climate control with AI-powered efficiency optimization',
      pricing: 'Custom solutions',
      features: ['AI optimization', 'Mobile control', 'Energy tracking', 'Voice integration']
    },
    {
      name: 'Commercial Solutions',
      icon: <Wrench className="w-6 h-6" />,
      description: 'Enterprise-grade HVAC solutions for businesses with 24/7 monitoring',
      pricing: 'Enterprise pricing',
      features: ['24/7 monitoring', 'SLA guarantee', 'Dedicated account', 'Preventive analytics']
    }
  ];
  
  const displayServices = maxServices === -1 ? premiumServices : premiumServices.slice(0, maxServices);
  
  return (
    <div className="services services--premium-cards bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-ironwood-charcoal font-['Playfair_Display']">
          Elite Service Portfolio
        </h3>
        <Badge className="bg-white text-ocotillo-red border border-ocotillo-red px-3 py-1">
          <Zap className="w-4 h-4 mr-1" />
          Power-Tier Exclusive
        </Badge>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-4">
        {displayServices.map((service, index) => (
          <Card 
            key={index} 
            className={`bg-white border border-gray-200 p-4 hover:shadow-md transition-shadow ${
              service.highlight ? 'border-ocotillo-red' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-agave-cream rounded-lg text-desert-marigold flex-shrink-0 border border-gray-200">
                {service.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-ironwood-charcoal mb-2">{service.name}</h4>
                <p className="text-sm text-ironwood-charcoal/80 mb-3">{service.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-ocotillo-red" />
                  <span className="font-medium text-ocotillo-red">{service.pricing}</span>
                </div>
                <div className="space-y-1">
                  {service.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-2 text-sm text-ironwood-charcoal/70">
                      <CheckCircle className="w-3 h-3 text-turquoise-sky flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {service.highlight && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-ocotillo-red text-sm font-medium text-center">⭐ Most Popular Service</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};