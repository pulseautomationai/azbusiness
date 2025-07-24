import React from 'react';
import { BusinessWithTier, TierLevel } from '~/types/tiers';
import { getTierConfig } from '~/utils/tierValidation';
import { 
  BasicAIInsights, 
  EnhancedAIInsights, 
  ProfessionalAIInsights, 
  PremiumAIInsights 
} from '~/components/business/ai-insights';

export default function AIInsightsDemo() {
  // Example business data for One Stop Heating and Cooling - Master Mechanical
  const exampleBusiness: BusinessWithTier = {
    _id: 'example-id' as any,
    _creationTime: Date.now(),
    name: 'One Stop Heating and Cooling - Master Mechanical',
    city: 'Phoenix',
    state: 'AZ',
    address: '123 Main St',
    zip: '85001',
    phone: '(602) 555-0123',
    website: 'https://example.com',
    slug: 'one-stop-heating-cooling',
    urlPath: '/hvac/phoenix/one-stop-heating-cooling',
    active: true,
    claimed: true,
    verified: true,
    featured: true,
    priority: 1,
    rating: 4.7,
    reviewCount: 403,
    services: ['HVAC Installation', 'AC Repair', 'Heating Maintenance'],
    planTier: 'free' as TierLevel,
    category: {
      _id: 'hvac-category' as any,
      _creationTime: Date.now(),
      name: 'HVAC',
      slug: 'hvac',
      description: 'Heating, Ventilation, and Air Conditioning Services',
      active: true,
      order: 1
    },
    performanceData: {
      ranking: 3,
      previousRanking: 5,
      score: 95.8
    }
  };

  const tiers: Array<{ level: TierLevel; title: string; description: string }> = [
    { 
      level: 'free', 
      title: 'Free Tier',
      description: 'Basic AI analysis with customer feedback summary and recognition eligibility'
    },
    { 
      level: 'starter', 
      title: 'Starter Tier ($9/month)',
      description: 'Enhanced insights with performance metrics and AI recommendations'
    },
    { 
      level: 'pro', 
      title: 'Pro Tier ($29/month)',
      description: 'Professional intelligence with competitive analysis and recognition history'
    },
    { 
      level: 'power', 
      title: 'Power Tier ($97/month)',
      description: 'Premium AI suite with real-time monitoring and predictive analytics'
    }
  ];

  const getAIComponent = (tier: TierLevel) => {
    const businessWithTier = { ...exampleBusiness, planTier: tier };
    const tierConfig = getTierConfig(tier);

    switch (tier) {
      case 'free':
        return <BasicAIInsights business={businessWithTier} tierConfig={tierConfig} maxInsights={4} />;
      case 'starter':
        return <EnhancedAIInsights business={businessWithTier} tierConfig={tierConfig} maxInsights={5} />;
      case 'pro':
        return <ProfessionalAIInsights business={businessWithTier} tierConfig={tierConfig} maxInsights={6} />;
      case 'power':
        return <PremiumAIInsights business={businessWithTier} tierConfig={tierConfig} maxInsights={8} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Business Intelligence Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience how our AI insights evolve across different subscription tiers, 
            featuring real data from One Stop Heating and Cooling - Master Mechanical in Phoenix, AZ
          </p>
        </div>

        <div className="space-y-12">
          {tiers.map((tier) => (
            <div key={tier.level} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{tier.title}</h2>
                <p className="text-gray-200">{tier.description}</p>
              </div>
              <div className="p-6">
                {getAIComponent(tier.level)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Ready to upgrade your business intelligence?
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/pricing" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View Pricing Plans
            </a>
            <a 
              href="/claim-business" 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Claim Your Business
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}