import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { BarChart3 } from 'lucide-react';

interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
}

// AI Analysis Header Card - Used across multiple tiers
export const AIAnalysisCard: React.FC<{
  reviewCount: number;
  tier: 'starter' | 'pro' | 'power';
  className?: string;
  currentRank?: number;
  city?: string;
  category?: string;
}> = ({ reviewCount, tier, className, currentRank, city, category }) => {
  const getContent = () => {
    switch (tier) {
      case 'starter':
        return {
          title: '🤖 AI Business Analysis',
          subtitle: `Based on analysis of ${reviewCount} customer reviews`
        };
      case 'pro':
        return {
          title: '🤖 AI Business Intelligence',
          subtitle: `Analyzed ${reviewCount} customer reviews • Performance tracked since 2023`
        };
      case 'power':
        return {
          title: '🤖 Premium AI Business Intelligence',
          subtitle: `Live analysis of ${reviewCount} reviews • Real-time monitoring • Predictive insights`
        };
    }
  };

  const content = getContent();
  const bgClass = tier === 'power' 
    ? 'bg-white border-l-4 border-ocotillo-red' 
    : tier === 'pro'
    ? 'bg-white border-l-4 border-desert-marigold'
    : 'bg-white border-l-4 border-turquoise-sky';

  return (
    <Card className={cn(bgClass, 'border-0 shadow-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-xl font-semibold",
          'text-ironwood-charcoal'
        )}>
          {content.title}
        </CardTitle>
        <p className={cn(
          "text-sm mt-1",
          'text-ironwood-charcoal/80'
        )}>
          {content.subtitle}
        </p>
        
        {/* Rankings and Awards for Power Tier */}
        {tier === 'power' && currentRank && city && category && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ocotillo-red">🏆</span>
              <span className="font-medium text-ironwood-charcoal">
                #{currentRank} Ranked {category} Service in {city}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ocotillo-red">⭐</span>
              <span className="font-medium text-ironwood-charcoal">
                98% Customer Satisfaction Rating
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ocotillo-red">🏅</span>
              <span className="font-medium text-ironwood-charcoal">
                'Best Value' Award Winner - October 2023
              </span>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

// Customer Insights Card - Used in Starter, Pro, Power
export const CustomerInsightsCard: React.FC<{
  quotes: string[];
  satisfactionPercentage?: number;
  tier: 'starter' | 'pro' | 'power';
  className?: string;
}> = ({ quotes, satisfactionPercentage, tier, className }) => {
  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ironwood-charcoal flex items-center gap-2">
          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-desert-marigold" />
          </div>
          What Customers Say Most:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {quotes.map((quote, index) => (
            <li key={index} className="text-sm text-ironwood-charcoal">
              • "{quote}"
            </li>
          ))}
        </ul>
        
        {(tier === 'pro' || tier === 'power') && satisfactionPercentage && (
          <div className="mt-4 p-3 bg-agave-cream rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-ironwood-charcoal flex items-center gap-2">
              <span className="text-ocotillo-red">⭐</span>
              Customer Satisfaction: {satisfactionPercentage}% rate their experience as excellent
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Service Performance Card - Pro tier
export const ServicePerformanceCard: React.FC<{
  responsePhrase: string;
  responsePercentage: number;
  qualityPhrase: string;
  qualityPercentage: number;
  pricingPhrase: string;
  pricingPercentage: number;
  reliabilityScore: number;
  className?: string;
}> = ({ 
  responsePhrase, 
  responsePercentage, 
  qualityPhrase, 
  qualityPercentage,
  pricingPhrase,
  pricingPercentage,
  reliabilityScore,
  className 
}) => {
  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ironwood-charcoal flex items-center gap-2">
          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
            <span className="text-turquoise-sky">🔧</span>
          </div>
          Service Performance Insights:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">
          Emergency Response: "{responsePhrase}" mentioned in {responsePercentage}% of reviews
        </p>
        <p className="text-sm text-gray-700">
          Work Quality: "{qualityPhrase}" highlighted by {qualityPercentage}% of customers
        </p>
        <p className="text-sm text-gray-700">
          Fair Pricing: "{pricingPhrase}" noted by {pricingPercentage}% of customers
        </p>
        <p className="text-sm font-medium text-gray-800 mt-3">
          Reliability Score: {reliabilityScore}/10 based on customer experiences
        </p>
      </CardContent>
    </Card>
  );
};

// Ranking Performance Card - Pro tier
export const RankingPerformanceCard: React.FC<{
  currentRank: number;
  city: string;
  category: string;
  responseSpeed: number;
  retentionRate: number;
  completionRate: number;
  className?: string;
}> = ({ 
  currentRank, 
  city, 
  category, 
  responseSpeed,
  retentionRate,
  completionRate,
  className 
}) => {
  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ironwood-charcoal flex items-center gap-2">
          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
            <span className="text-desert-marigold">🏆</span>
          </div>
          Ranking Performance:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Currently ranked <span className="font-semibold text-ocotillo-red">#{currentRank}</span> in {city} {category} services</li>
          <li>• Responds <span className="font-semibold text-turquoise-sky">{responseSpeed}% faster</span> than area average</li>
          <li>• <span className="font-semibold text-turquoise-sky">{retentionRate}%</span> customer retention rate</li>
          <li>• <span className="font-semibold text-desert-marigold">{completionRate}%</span> same-day completion rate</li>
        </ul>
      </CardContent>
    </Card>
  );
};

// Deep Service Intelligence Card - Power tier
export const DeepServiceIntelligenceCard: React.FC<{
  responseTime: number;
  multiplier: number;
  outperformanceRate: number;
  competitorCount: number;
  category: string;
  callbackReduction: number;
  marketArea: string;
  retentionRate: number;
  industryAverage: number;
  className?: string;
}> = ({ 
  responseTime,
  multiplier,
  outperformanceRate,
  competitorCount,
  category,
  callbackReduction,
  marketArea,
  retentionRate,
  industryAverage,
  className 
}) => {
  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ironwood-charcoal flex items-center gap-2">
          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
            <span className="text-ocotillo-red">🔧</span>
          </div>
          Deep Service Intelligence:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">
          Emergency Response: <span className="font-semibold text-ocotillo-red">{responseTime} minutes</span> average (<span className="font-semibold">{multiplier}x faster</span> than competitors)
        </p>
        <p className="text-sm text-gray-700">
          Work Quality: Outperforms <span className="font-semibold text-turquoise-sky">{outperformanceRate}%</span> of {competitorCount}+ local {category} companies
        </p>
        <p className="text-sm text-gray-700">
          Problem Resolution: <span className="font-semibold text-desert-marigold">{callbackReduction}% fewer</span> callback issues than typical services
        </p>
        <p className="text-sm text-gray-700">
          Value Leader: Best price-to-quality ratio in {marketArea}
        </p>
        <p className="text-sm text-gray-700">
          Customer Loyalty: <span className="font-semibold text-ocotillo-red">{retentionRate}%</span> retention vs {industryAverage}% industry average
        </p>
      </CardContent>
    </Card>
  );
};

// Market Leadership Card - Power tier
export const MarketLeadershipCard: React.FC<{
  currentRank: number;
  previousRank: number;
  city: string;
  category: string;
  monthlyAward: string;
  monthYear: string;
  weeklyAward: string;
  frequency: string;
  timePeriod: string;
  percentile: number;
  categoryStrength: string;
  className?: string;
}> = ({ 
  currentRank,
  previousRank,
  city,
  category,
  monthlyAward,
  monthYear,
  weeklyAward,
  frequency,
  timePeriod,
  percentile,
  categoryStrength,
  className 
}) => {
  const trendIndicator = currentRank < previousRank ? '⬆️' : currentRank > previousRank ? '⬇️' : '➡️';
  
  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ironwood-charcoal flex items-center gap-2">
          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
            <span className="text-desert-marigold">🏆</span>
          </div>
          Market Leadership:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">
          Current Position: <span className="font-semibold text-ocotillo-red">#{currentRank}</span> in {city} {category} ({trendIndicator} improved from #{previousRank} this month)
        </p>
        <p className="text-sm text-gray-700">
          Recognition: "{monthlyAward}" Monthly Champion ({monthYear})
        </p>
        <p className="text-sm text-gray-700">
          Awards: "{weeklyAward}" winner {frequency} in last {timePeriod}
        </p>
        <p className="text-sm text-gray-700">
          Market Standing: <span className="font-semibold text-turquoise-sky">Top {percentile}%</span> for {categoryStrength} statewide
        </p>
      </CardContent>
    </Card>
  );
};

// Why Customers Choose Card - Power tier
export const WhyCustomersChooseCard: React.FC<{
  responseTime: number;
  averageTime: number;
  satisfactionRate: number;
  problemReduction: number;
  category: string;
  pattern1: string;
  pattern2: string;
  className?: string;
}> = ({ 
  responseTime,
  averageTime,
  satisfactionRate,
  problemReduction,
  category,
  pattern1,
  pattern2,
  className 
}) => {
  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ironwood-charcoal flex items-center gap-2">
          <div className="w-8 h-8 bg-agave-cream rounded-full flex items-center justify-center">
            <span className="text-turquoise-sky">💎</span>
          </div>
          Why Customers Choose This Business:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">
          Speed Advantage: Emergency calls answered in <span className="font-semibold text-ocotillo-red">{responseTime} minutes</span> vs {averageTime} minute average
        </p>
        <p className="text-sm text-gray-700">
          Quality Assurance: <span className="font-semibold text-turquoise-sky">{satisfactionRate}%</span> satisfaction rate for emergency situations
        </p>
        <p className="text-sm text-gray-700">
          Value Leadership: Premium service at competitive pricing
        </p>
        <p className="text-sm text-gray-700">
          Reliability Promise: <span className="font-semibold text-desert-marigold">{problemReduction}% fewer</span> problems than typical {category} services
        </p>
        <p className="text-sm text-gray-700">
          Recognition Pattern: Consistently wins "{pattern1}" and "{pattern2}"
        </p>
      </CardContent>
    </Card>
  );
};