import React from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { 
  AIAnalysisCard, 
  CustomerInsightsCard, 
  ServicePerformanceCard, 
  RankingPerformanceCard,
  DeepServiceIntelligenceCard,
  MarketLeadershipCard,
  WhyCustomersChooseCard
} from './cards';
import { AIInsightsTable } from './AIInsightsTable';

interface AIInsightsProps {
  business: BusinessWithTier;
  tierConfig: TierConfig;
  maxInsights: number;
}

// Basic AI Insights (Free Tier) - NO CARDS, only unlock message
export const BasicAIInsights: React.FC<AIInsightsProps> = ({ business, tierConfig, maxInsights }) => {
  return (
    <div className="ai-insights ai-insights--basic bg-white border border-gray-200 rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-medium text-ironwood-charcoal mb-2 flex items-center justify-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Business Insights
        </h3>
        <p className="text-gray-600 mb-4">This business has not unlocked AI insights</p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
            <span className="text-desert-marigold">💡</span>
            Want to see what customers are saying about this business?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Businesses can unlock detailed customer insights and performance data.
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced AI Insights (Starter Tier) - 2 CARDS layout
export const EnhancedAIInsights: React.FC<AIInsightsProps> = ({ business, tierConfig, maxInsights }) => {
  const reviewCount = business.reviewCount || 403;
  
  // Customer quotes for the insights card
  const customerQuotes = [
    "They arrive quickly and fix things right the first time",
    "Professional technicians who explain everything clearly",
    "Fair pricing with no surprise charges",
    "Reliable service you can count on during emergencies"
  ];
  
  return (
    <div className="ai-insights ai-insights--enhanced">
      <div className="grid grid-cols-1 gap-4">
        {/* Card 1: AI Business Analysis Header */}
        <AIAnalysisCard 
          reviewCount={reviewCount} 
          tier="starter" 
        />
        
        {/* Card 2: What Customers Say Most */}
        <CustomerInsightsCard 
          quotes={customerQuotes}
          tier="starter"
        />
      </div>
    </div>
  );
};

// Professional AI Insights (Pro Tier) - 4 CARDS layout
export const ProfessionalAIInsights: React.FC<AIInsightsProps> = ({ business, tierConfig, maxInsights }) => {
  const reviewCount = business.reviewCount || 403;
  const currentRank = business.performanceData?.ranking || 3;
  const city = business.city || "Phoenix";
  const category = business.category?.name || "HVAC";
  
  // Customer quotes for insights
  const customerQuotes = [
    "They arrive quickly and fix things right the first time",
    "Professional technicians who explain everything clearly",
    "Fair pricing with no surprise charges",
    "Reliable service you can count on during emergencies"
  ];
  
  return (
    <div className="ai-insights ai-insights--professional">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: AI Business Intelligence Header */}
        <div className="md:col-span-2">
          <AIAnalysisCard 
            reviewCount={reviewCount} 
            tier="pro" 
          />
        </div>
        
        {/* Card 2: What Customers Say Most */}
        <CustomerInsightsCard 
          quotes={customerQuotes}
          satisfactionPercentage={96}
          tier="pro"
        />
        
        {/* Card 3: Service Performance Insights */}
        <ServicePerformanceCard
          responsePhrase="arrives quickly"
          responsePercentage={89}
          qualityPhrase="fixes it right the first time"
          qualityPercentage={92}
          pricingPhrase="fair pricing"
          pricingPercentage={87}
          reliabilityScore={9.4}
        />
        
        {/* Card 4: Ranking Performance */}
        <div className="md:col-span-2">
          <RankingPerformanceCard
            currentRank={currentRank}
            city={city}
            category={category}
            responseSpeed={67}
            retentionRate={88}
            completionRate={94}
          />
        </div>
      </div>
    </div>
  );
};

// Premium AI Insights (Power Tier) - New Table Layout
export const PremiumAIInsights: React.FC<AIInsightsProps> = ({ business, tierConfig, maxInsights }) => {
  const reviewCount = business.reviewCount || 403;
  const currentRank = business.performanceData?.ranking || 3;
  const city = business.city || "Phoenix";
  const category = business.category?.name || "HVAC";
  
  return (
    <div className="ai-insights ai-insights--premium space-y-4">
      {/* Premium AI Business Intelligence Header with Rankings */}
      <AIAnalysisCard 
        reviewCount={reviewCount} 
        tier="power"
        currentRank={currentRank}
        city={city}
        category={category}
      />
      
      {/* AI Insights Table */}
      <AIInsightsTable />
    </div>
  );
};