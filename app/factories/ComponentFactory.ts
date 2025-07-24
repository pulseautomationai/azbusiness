import { TierLevel } from '~/types/tiers';

// Import tier-specific components (to be created)
import { BasicHeader, ProfessionalHeader, FeaturedHeader, PremiumHeader } from '~/components/business/headers';
import { BasicAIInsights, EnhancedAIInsights, ProfessionalAIInsights, PremiumAIInsights } from '~/components/business/ai-insights';
import { MinimalContact, EnhancedContact, ProfessionalContact, LeadFocusedContact } from '~/components/business/contact';
import { ServiceBullets, EnhancedServiceBullets, ServiceCards, PremiumServiceCards } from '~/components/business/services';

// Dynamic component rendering based on tier
export const ComponentFactory = {
  getHeaderComponent: (tier: TierLevel) => {
    const components = {
      free: BasicHeader,
      starter: ProfessionalHeader,
      pro: FeaturedHeader,
      power: PremiumHeader,
    };
    return components[tier] || BasicHeader;
  },
  
  getAIInsightsComponent: (tier: TierLevel) => {
    const components = {
      free: BasicAIInsights,
      starter: EnhancedAIInsights,
      pro: ProfessionalAIInsights,
      power: PremiumAIInsights,
    };
    return components[tier] || BasicAIInsights;
  },
  
  getContactComponent: (tier: TierLevel) => {
    const components = {
      free: MinimalContact,
      starter: EnhancedContact,
      pro: ProfessionalContact,
      power: LeadFocusedContact,
    };
    return components[tier] || MinimalContact;
  },
  
  getServiceComponent: (tier: TierLevel) => {
    const components = {
      free: null, // Free tier does not include service lists per features.ts
      starter: EnhancedServiceBullets,
      pro: ServiceCards,
      power: PremiumServiceCards,
    };
    return components[tier] || null;
  },
};