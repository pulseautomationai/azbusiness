import React from 'react';
import { TierLevel, TIER_CONFIGURATIONS } from '~/types/tiers';
import { getNextTierForFeature } from '~/utils/tierValidation';
import { Lock, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useNavigate } from 'react-router';

interface UpgradePromptProps {
  currentTier: TierLevel;
  feature: string;
  targetTier: TierLevel;
  compact?: boolean;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  currentTier, 
  feature, 
  targetTier,
  compact = false 
}) => {
  const navigate = useNavigate();
  
  const getUpgradeMessage = () => {
    const featureMessages: Record<string, string> = {
      'logo': 'Add your professional logo and enhance your presentation',
      'performance-tracking': 'See your ranking position and track performance',
      'competitive-analysis': 'Compare your performance to competitors',
      'advanced-ai': 'Get comprehensive AI business intelligence',
      'image-gallery': 'Showcase your work with professional photos',
      'lead-capture': 'Start capturing unlimited exclusive leads',
      'enhanced-insights': 'Unlock detailed AI-powered business insights',
      'all-services': 'Display all your services and specialties',
      'enhanced-contact': 'Get professional contact options with priority support',
    };
    
    return featureMessages[feature] || 'Unlock this premium feature';
  };
  
  const handleUpgradeClick = () => {
    // Navigate to pricing page or open upgrade modal
    navigate('/pricing');
  };
  
  const targetConfig = TIER_CONFIGURATIONS[targetTier];
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Lock className="w-4 h-4" />
          <span>Upgrade to {targetConfig.name}</span>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleUpgradeClick}
          className="text-xs"
        >
          View Plans
        </Button>
      </div>
    );
  }
  
  return (
    <div className="upgrade-prompt relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="absolute top-2 right-2">
        <Lock className="w-6 h-6 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-8 h-8 text-yellow-500 mt-1" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {getUpgradeMessage()}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Available with {targetConfig.name} plan and above
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Upgrade to {targetConfig.name}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          
          <span className="text-sm text-gray-500">
            Starting at ${getPlanPrice(targetTier)}/month
          </span>
        </div>
      </div>
    </div>
  );
};

function getPlanPrice(tier: TierLevel): number {
  const prices: Record<TierLevel, number> = {
    free: 0,
    starter: 9,
    pro: 29,
    power: 97,
  };
  return prices[tier];
}