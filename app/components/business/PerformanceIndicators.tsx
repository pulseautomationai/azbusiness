import React from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { Trophy, Clock, Star, TrendingUp, Award, Zap } from 'lucide-react';

interface PerformanceIndicatorsProps {
  business: BusinessWithTier;
  tierConfig: TierConfig;
}

export const PerformanceIndicators: React.FC<PerformanceIndicatorsProps> = ({
  business,
  tierConfig,
}) => {
  if (!tierConfig.features.showPerformanceData || !business.performanceData) {
    return null;
  }
  
  const indicators = tierConfig.content.performanceIndicators;
  
  return (
    <div className="performance-indicators flex flex-wrap items-center gap-4">
      {indicators.includes('ranking') && business.performanceData.ranking && (
        <div className="flex items-center gap-2 text-sm bg-agave-cream text-ironwood-charcoal px-3 py-1.5 rounded-full border border-gray-200">
          <Trophy className="w-4 h-4" />
          <span className="font-medium">
            Ranked #{business.performanceData.ranking} in {business.city}
          </span>
        </div>
      )}
      
      {indicators.includes('responseTime') && business.performanceData.responseTime && (
        <div className="flex items-center gap-2 text-sm bg-agave-cream text-ironwood-charcoal px-3 py-1.5 rounded-full border border-gray-200">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {business.performanceData.responseTime}
          </span>
        </div>
      )}
      
      {indicators.includes('satisfaction') && business.performanceData.satisfaction && (
        <div className="flex items-center gap-2 text-sm bg-agave-cream text-ironwood-charcoal px-3 py-1.5 rounded-full border border-gray-200">
          <Star className="w-4 h-4" />
          <span className="font-medium">
            {business.performanceData.satisfaction}% Satisfaction
          </span>
        </div>
      )}
      
      {indicators.includes('marketPosition') && business.performanceData.marketPosition && (
        <div className="flex items-center gap-2 text-sm bg-agave-cream text-ironwood-charcoal px-3 py-1.5 rounded-full border border-gray-200">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">
            {business.performanceData.marketPosition}
          </span>
        </div>
      )}
      
      {indicators.includes('competitiveAdvantage') && business.performanceData.competitivePosition && (
        <div className="flex items-center gap-2 text-sm bg-agave-cream text-ironwood-charcoal px-3 py-1.5 rounded-full border border-gray-200">
          <Award className="w-4 h-4" />
          <span className="font-medium">
            {business.performanceData.competitivePosition}
          </span>
        </div>
      )}
      
      {indicators.includes('realTimeMetrics') && (
        <div className="flex items-center gap-2 text-sm bg-agave-cream text-ironwood-charcoal px-3 py-1.5 rounded-full border border-gray-200">
          <Zap className="w-4 h-4" />
          <span className="font-medium">Real-time Analytics</span>
        </div>
      )}
    </div>
  );
};