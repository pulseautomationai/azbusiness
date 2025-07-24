# Business Listing Page - Tier-Based Implementation with Connection Schema

## 🎯 Project Overview
Transform the existing business listing page into a dynamic tier-based experience that automatically updates when a business changes from Free → Starter → Pro → Power. This requires implementing a robust connection schema that maps tier levels to specific UI components, content display, and feature availability.

## 🗂️ Tier Connection Schema Design

### **Core Schema Structure**
```typescript
// Central tier configuration system
interface TierConfig {
  id: TierLevel;
  name: string;
  badge: BadgeConfig;
  features: FeatureSet;
  ui: UIConfiguration;
  content: ContentConfiguration;
  limits: LimitConfiguration;
}

type TierLevel = 'free' | 'starter' | 'pro' | 'power';

interface BusinessWithTier {
  id: string;
  planTier: TierLevel;
  // ... other business fields
}
```

### **Tier-Specific Configuration Maps**
```typescript
const TIER_CONFIGURATIONS: Record<TierLevel, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    badge: {
      text: 'Verified by Business Owner',
      icon: '✅',
      color: 'gray',
      style: 'basic'
    },
    features: {
      showLogo: false,
      showPerformanceData: false,
      showAdvancedAI: false,
      showImageGallery: false,
      showLeadCapture: false,
      showReviewResponses: false,
      showCompetitiveAnalysis: false
    },
    ui: {
      headerStyle: 'basic',
      contactStyle: 'minimal',
      serviceStyle: 'bullets',
      reviewStyle: 'basic',
      aiSectionCount: 1
    },
    content: {
      aiInsightType: 'basic',
      reviewCount: 3,
      serviceDescriptionLevel: 'minimal',
      performanceIndicators: []
    },
    limits: {
      maxReviews: 3,
      maxServices: 6,
      maxAIInsights: 4
    }
  },
  
  starter: {
    id: 'starter',
    name: 'Starter Professional',
    badge: {
      text: 'Starter Professional',
      icon: '✅',
      color: 'blue',
      style: 'enhanced'
    },
    features: {
      showLogo: true,
      showPerformanceData: true,
      showAdvancedAI: false,
      showImageGallery: false,
      showLeadCapture: false,
      showReviewResponses: false,
      showCompetitiveAnalysis: false
    },
    ui: {
      headerStyle: 'professional',
      contactStyle: 'enhanced',
      serviceStyle: 'enhanced-bullets',
      reviewStyle: 'enhanced',
      aiSectionCount: 1
    },
    content: {
      aiInsightType: 'enhanced',
      reviewCount: 8,
      serviceDescriptionLevel: 'detailed',
      performanceIndicators: ['ranking', 'responseTime', 'satisfaction']
    },
    limits: {
      maxReviews: 8,
      maxServices: 12,
      maxAIInsights: 8
    }
  },
  
  pro: {
    id: 'pro',
    name: 'Pro-Verified Business',
    badge: {
      text: 'Pro-Verified Business',
      icon: '🌟',
      color: 'orange',
      style: 'featured'
    },
    features: {
      showLogo: true,
      showPerformanceData: true,
      showAdvancedAI: true,
      showImageGallery: false,
      showLeadCapture: false,
      showReviewResponses: true,
      showCompetitiveAnalysis: true
    },
    ui: {
      headerStyle: 'featured',
      contactStyle: 'professional',
      serviceStyle: 'cards',
      reviewStyle: 'interactive',
      aiSectionCount: 2
    },
    content: {
      aiInsightType: 'professional',
      reviewCount: 15,
      serviceDescriptionLevel: 'comprehensive',
      performanceIndicators: ['ranking', 'responseTime', 'satisfaction', 'marketPosition', 'competitiveAdvantage']
    },
    limits: {
      maxReviews: 15,
      maxServices: 20,
      maxAIInsights: 12
    }
  },
  
  power: {
    id: 'power',
    name: 'Power-Tier Verified',
    badge: {
      text: 'Power-Tier Verified Business',
      icon: '⚡',
      color: 'green',
      style: 'premium'
    },
    features: {
      showLogo: true,
      showPerformanceData: true,
      showAdvancedAI: true,
      showImageGallery: true,
      showLeadCapture: true,
      showReviewResponses: true,
      showCompetitiveAnalysis: true
    },
    ui: {
      headerStyle: 'premium',
      contactStyle: 'lead-focused',
      serviceStyle: 'premium-cards',
      reviewStyle: 'advanced',
      aiSectionCount: 3
    },
    content: {
      aiInsightType: 'premium',
      reviewCount: -1, // unlimited
      serviceDescriptionLevel: 'premium',
      performanceIndicators: ['ranking', 'responseTime', 'satisfaction', 'marketPosition', 'competitiveAdvantage', 'realTimeMetrics']
    },
    limits: {
      maxReviews: -1, // unlimited
      maxServices: -1, // unlimited
      maxAIInsights: 20
    }
  }
};
```

## 🔧 Dynamic Component System

### **Tier-Aware Component Wrapper**
```typescript
interface TierAwareComponentProps {
  business: BusinessWithTier;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  requiredTier?: TierLevel[];
}

const TierAwareComponent: React.FC<TierAwareComponentProps> = ({
  business,
  children,
  fallback,
  requiredTier
}) => {
  const tierConfig = TIER_CONFIGURATIONS[business.planTier];
  const hasAccess = !requiredTier || requiredTier.includes(business.planTier);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Usage examples:
<TierAwareComponent 
  business={business} 
  requiredTier={['starter', 'pro', 'power']}
  fallback={<UpgradePrompt feature="logo" />}
>
  <BusinessLogo src={business.logo} />
</TierAwareComponent>

<TierAwareComponent 
  business={business} 
  requiredTier={['power']}
  fallback={<UpgradeToCapture />}
>
  <LeadCaptureForm businessId={business.id} />
</TierAwareComponent>
```

### **Component Factory System**
```typescript
// Dynamic component rendering based on tier
const ComponentFactory = {
  getHeaderComponent: (tier: TierLevel) => {
    const config = TIER_CONFIGURATIONS[tier];
    switch (config.ui.headerStyle) {
      case 'basic': return BasicHeader;
      case 'professional': return ProfessionalHeader;
      case 'featured': return FeaturedHeader;
      case 'premium': return PremiumHeader;
      default: return BasicHeader;
    }
  },
  
  getAIInsightsComponent: (tier: TierLevel) => {
    const config = TIER_CONFIGURATIONS[tier];
    switch (config.content.aiInsightType) {
      case 'basic': return BasicAIInsights;
      case 'enhanced': return EnhancedAIInsights;
      case 'professional': return ProfessionalAIInsights;
      case 'premium': return PremiumAIInsights;
      default: return BasicAIInsights;
    }
  },
  
  getContactComponent: (tier: TierLevel) => {
    const config = TIER_CONFIGURATIONS[tier];
    switch (config.ui.contactStyle) {
      case 'minimal': return MinimalContact;
      case 'enhanced': return EnhancedContact;
      case 'professional': return ProfessionalContact;
      case 'lead-focused': return LeadFocusedContact;
      default: return MinimalContact;
    }
  },
  
  getServiceComponent: (tier: TierLevel) => {
    const config = TIER_CONFIGURATIONS[tier];
    switch (config.ui.serviceStyle) {
      case 'bullets': return ServiceBullets;
      case 'enhanced-bullets': return EnhancedServiceBullets;
      case 'cards': return ServiceCards;
      case 'premium-cards': return PremiumServiceCards;
      default: return ServiceBullets;
    }
  }
};
```

## 🎨 Main Business Profile Component Implementation

### **Core Business Profile Structure**
```typescript
interface BusinessProfileProps {
  business: BusinessWithTier;
  viewMode: 'consumer' | 'owner';
}

const BusinessProfile: React.FC<BusinessProfileProps> = ({ business, viewMode }) => {
  const tierConfig = TIER_CONFIGURATIONS[business.planTier];
  
  // Dynamic component selection based on tier
  const HeaderComponent = ComponentFactory.getHeaderComponent(business.planTier);
  const AIInsightsComponent = ComponentFactory.getAIInsightsComponent(business.planTier);
  const ContactComponent = ComponentFactory.getContactComponent(business.planTier);
  const ServiceComponent = ComponentFactory.getServiceComponent(business.planTier);
  
  return (
    <div className={`business-profile tier-${business.planTier}`}>
      {/* Dynamic Header Based on Tier */}
      <HeaderComponent 
        business={business}
        tierConfig={tierConfig}
        showPerformanceData={tierConfig.features.showPerformanceData}
      />
      
      <div className="profile-content">
        <div className="main-content">
          {/* Dynamic AI Insights Section */}
          <AIInsightsComponent 
            business={business}
            tierConfig={tierConfig}
            maxInsights={tierConfig.limits.maxAIInsights}
          />
          
          {/* Conditional Competitive Analysis */}
          <TierAwareComponent 
            business={business} 
            requiredTier={['pro', 'power']}
            fallback={<UpgradePrompt feature="competitive-analysis" targetTier="pro" />}
          >
            <CompetitiveAnalysisSection business={business} />
          </TierAwareComponent>
          
          {/* Dynamic Services Section */}
          <ServiceComponent 
            business={business}
            tierConfig={tierConfig}
            maxServices={tierConfig.limits.maxServices}
          />
          
          {/* Conditional Image Gallery */}
          <TierAwareComponent 
            business={business} 
            requiredTier={['power']}
            fallback={<ImageGalleryUpgrade />}
          >
            <ImageGallery business={business} />
          </TierAwareComponent>
          
          {/* Dynamic Reviews Section */}
          <ReviewsSection 
            business={business}
            tierConfig={tierConfig}
            maxReviews={tierConfig.limits.maxReviews}
            showResponses={tierConfig.features.showReviewResponses}
          />
        </div>
        
        <div className="sidebar">
          {/* Dynamic Contact Section */}
          <ContactComponent 
            business={business}
            tierConfig={tierConfig}
            showLeadCapture={tierConfig.features.showLeadCapture}
          />
          
          {/* Business Details */}
          <BusinessDetails business={business} tierConfig={tierConfig} />
        </div>
      </div>
    </div>
  );
};
```

## 🔄 Tier Transition System

### **Tier Update Handler**
```typescript
// Handle tier changes and trigger UI updates
const handleTierChange = async (businessId: string, newTier: TierLevel) => {
  try {
    // Update database
    await updateBusinessTier(businessId, newTier);
    
    // Trigger real-time UI update
    const updatedBusiness = await fetchBusinessWithTier(businessId);
    
    // Force component re-render with new tier configuration
    setBusiness(updatedBusiness);
    
    // Log tier change for analytics
    trackTierChange(businessId, newTier);
    
    // Show success notification
    showNotification(`Successfully upgraded to ${TIER_CONFIGURATIONS[newTier].name}!`);
    
  } catch (error) {
    console.error('Tier update failed:', error);
    showErrorNotification('Failed to update tier. Please try again.');
  }
};

// Real-time subscription for tier changes (if using real-time updates)
useEffect(() => {
  const unsubscribe = subscribeToBusinessChanges(business.id, (updatedBusiness) => {
    if (updatedBusiness.planTier !== business.planTier) {
      setBusiness(updatedBusiness);
      // Trigger tier-specific animations or notifications
      animateTierUpgrade(updatedBusiness.planTier);
    }
  });
  
  return unsubscribe;
}, [business.id]);
```

### **Tier Validation System**
```typescript
// Ensure tier configuration integrity
const validateTierConfiguration = (tier: TierLevel): boolean => {
  const config = TIER_CONFIGURATIONS[tier];
  
  // Check required fields
  if (!config || !config.id || !config.features) {
    console.error(`Invalid tier configuration for ${tier}`);
    return false;
  }
  
  // Validate tier progression rules
  const tierHierarchy = ['free', 'starter', 'pro', 'power'];
  const tierIndex = tierHierarchy.indexOf(tier);
  
  if (tierIndex === -1) {
    console.error(`Unknown tier: ${tier}`);
    return false;
  }
  
  return true;
};

// Component-level tier validation
const useTierValidation = (business: BusinessWithTier) => {
  useEffect(() => {
    if (!validateTierConfiguration(business.planTier)) {
      console.warn(`Business ${business.id} has invalid tier: ${business.planTier}`);
      // Fallback to free tier if invalid
      business.planTier = 'free';
    }
  }, [business.planTier]);
};
```

## 📊 Specific Component Implementations

### **Dynamic Badge System**
```typescript
const TierBadge: React.FC<{ tierConfig: TierConfig }> = ({ tierConfig }) => {
  const badgeClasses = `tier-badge tier-badge--${tierConfig.badge.style} tier-badge--${tierConfig.badge.color}`;
  
  return (
    <div className={badgeClasses}>
      <span className="tier-badge__icon">{tierConfig.badge.icon}</span>
      <span className="tier-badge__text">{tierConfig.badge.text}</span>
    </div>
  );
};
```

### **AI Insights Tier Distribution**
```typescript
const AIInsightsSection: React.FC<{
  business: BusinessWithTier;
  tierConfig: TierConfig;
  maxInsights: number;
}> = ({ business, tierConfig, maxInsights }) => {
  
  const getAIInsightsData = () => {
    switch (tierConfig.content.aiInsightType) {
      case 'basic':
        return business.aiInsights?.basic?.slice(0, maxInsights) || [];
      case 'enhanced':
        return business.aiInsights?.enhanced?.slice(0, maxInsights) || [];
      case 'professional':
        return business.aiInsights?.professional?.slice(0, maxInsights) || [];
      case 'premium':
        return business.aiInsights?.premium?.slice(0, maxInsights) || [];
      default:
        return [];
    }
  };
  
  const insights = getAIInsightsData();
  const sectionTitle = {
    basic: '🤖 AI Customer Insights',
    enhanced: '🚀 Enhanced AI Insights',
    professional: '🏆 Professional AI Intelligence',
    premium: '🚀 Premium Business Intelligence'
  }[tierConfig.content.aiInsightType];
  
  return (
    <div className={`ai-insights ai-insights--${tierConfig.content.aiInsightType}`}>
      <h3 className="ai-insights__title">{sectionTitle}</h3>
      <div className="ai-insights__content">
        {insights.map((insight, index) => (
          <div key={index} className="ai-insight">
            • {insight}
          </div>
        ))}
      </div>
      
      {/* Show upgrade prompts for lower tiers */}
      {tierConfig.content.aiInsightType !== 'premium' && (
        <UpgradePrompt 
          currentTier={business.planTier}
          feature="advanced-ai"
          targetTier={getNextTierForFeature('advanced-ai', business.planTier)}
        />
      )}
    </div>
  );
};
```

### **Performance Indicators System**
```typescript
const PerformanceIndicators: React.FC<{
  business: BusinessWithTier;
  tierConfig: TierConfig;
}> = ({ business, tierConfig }) => {
  
  if (!tierConfig.features.showPerformanceData) {
    return null;
  }
  
  const indicators = tierConfig.content.performanceIndicators;
  
  return (
    <div className="performance-indicators">
      {indicators.includes('ranking') && (
        <div className="indicator">
          🏅 Ranked #{business.performanceData?.ranking} in {business.city} {business.category}
        </div>
      )}
      {indicators.includes('responseTime') && (
        <div className="indicator">
          ⚡ Avg Response: {business.performanceData?.responseTime}
        </div>
      )}
      {indicators.includes('satisfaction') && (
        <div className="indicator">
          💎 {business.rating} customer satisfaction (vs {business.areaAverage} area avg)
        </div>
      )}
      {/* Add more indicators based on tier */}
    </div>
  );
};
```

## 🎯 Upgrade Prompt System

### **Smart Upgrade Prompts**
```typescript
const UpgradePrompt: React.FC<{
  currentTier: TierLevel;
  feature: string;
  targetTier: TierLevel;
}> = ({ currentTier, feature, targetTier }) => {
  
  const getUpgradeMessage = () => {
    const targetConfig = TIER_CONFIGURATIONS[targetTier];
    const featureMessages = {
      'logo': `Add your professional logo and enhance your presentation`,
      'performance-tracking': `See your ranking position and track performance`,
      'competitive-analysis': `Compare your performance to competitors`,
      'advanced-ai': `Get comprehensive AI business intelligence`,
      'image-gallery': `Showcase your work with professional photos`,
      'lead-capture': `Start capturing unlimited exclusive leads`
    };
    
    return featureMessages[feature] || `Unlock this feature`;
  };
  
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt__content">
        <h4>🔒 {getUpgradeMessage()}</h4>
        <p>Upgrade to {TIER_CONFIGURATIONS[targetTier].name} to unlock this feature</p>
        <button 
          className="upgrade-prompt__button"
          onClick={() => handleUpgradeClick(targetTier)}
        >
          Upgrade to {targetTier.charAt(0).toUpperCase() + targetTier.slice(1)}
        </button>
      </div>
    </div>
  );
};
```

## 🔄 Testing & Validation

### **Tier Switching Test Suite**
```typescript
// Test tier transitions and UI updates
const testTierTransitions = async () => {
  const testBusiness = { id: 'test-123', planTier: 'free' as TierLevel };
  
  // Test each tier transition
  const tiers: TierLevel[] = ['free', 'starter', 'pro', 'power'];
  
  for (const tier of tiers) {
    testBusiness.planTier = tier;
    
    // Validate configuration
    expect(validateTierConfiguration(tier)).toBe(true);
    
    // Test component rendering
    const component = render(<BusinessProfile business={testBusiness} viewMode="consumer" />);
    
    // Verify tier-specific elements
    expect(component.getByText(TIER_CONFIGURATIONS[tier].badge.text)).toBeInTheDocument();
    
    // Test feature availability
    const tierConfig = TIER_CONFIGURATIONS[tier];
    if (tierConfig.features.showLogo) {
      expect(component.queryByTestId('business-logo')).toBeInTheDocument();
    } else {
      expect(component.queryByTestId('business-logo')).not.toBeInTheDocument();
    }
  }
};
```

## 📱 Responsive Tier Considerations

### **Mobile Tier Adaptations**
```typescript
const useResponsiveTier = (business: BusinessWithTier) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Adapt tier features for mobile
  const mobileAdaptedConfig = useMemo(() => {
    const config = TIER_CONFIGURATIONS[business.planTier];
    
    if (isMobile) {
      return {
        ...config,
        ui: {
          ...config.ui,
          // Simplify mobile presentations
          serviceStyle: config.ui.serviceStyle === 'premium-cards' ? 'cards' : config.ui.serviceStyle,
          aiSectionCount: Math.min(config.ui.aiSectionCount, 2)
        }
      };
    }
    
    return config;
  }, [business.planTier, isMobile]);
  
  return mobileAdaptedConfig;
};
```

## 🚀 Multi-Phased Implementation Strategy

### **Phase 1: Foundation Setup (Core Schema & Types)**
**Goal**: Establish the tier configuration system and TypeScript foundation
**Success Criteria**: Tier configurations compile and validate correctly

#### **Step 1.1: Create Tier Configuration System**
```typescript
// src/types/tiers.ts
export type TierLevel = 'free' | 'starter' | 'pro' | 'power';

export interface TierConfig {
  id: TierLevel;
  name: string;
  badge: BadgeConfig;
  features: FeatureSet;
  ui: UIConfiguration;
  content: ContentConfiguration;
  limits: LimitConfiguration;
}

// Create the complete TIER_CONFIGURATIONS object as defined above
```

#### **Step 1.2: Update Business Interface**
```typescript
// Extend existing business interface to include tier
interface BusinessWithTier extends ExistingBusinessInterface {
  planTier: TierLevel;
  performanceData?: {
    ranking?: number;
    responseTime?: string;
    competitivePosition?: string;
    satisfaction?: number;
    areaAverage?: number;
  };
  aiInsights?: {
    basic?: string[];
    enhanced?: string[];
    professional?: string[];
    premium?: string[];
  };
}
```

#### **Step 1.3: Create Validation Functions**
```typescript
// src/utils/tierValidation.ts
export const validateTierConfiguration = (tier: TierLevel): boolean => {
  // Implementation as shown above
};

export const getTierConfig = (tier: TierLevel): TierConfig => {
  return TIER_CONFIGURATIONS[tier];
};
```

**Phase 1 Testing**: Verify all tier configs load, TypeScript compiles without errors

---

### **Phase 2: Component Factory System**
**Goal**: Create the dynamic component selection system
**Success Criteria**: Components render correctly based on tier level

#### **Step 2.1: Create Component Factory**
```typescript
// src/factories/ComponentFactory.ts
export const ComponentFactory = {
  getHeaderComponent: (tier: TierLevel) => {
    // Implementation as shown above
  },
  // ... other factory methods
};
```

#### **Step 2.2: Build Tier-Aware Wrapper**
```typescript
// src/components/TierAwareComponent.tsx
export const TierAwareComponent: React.FC<TierAwareComponentProps> = ({
  business,
  children,
  fallback,
  requiredTier
}) => {
  // Implementation as shown above
};
```

#### **Step 2.3: Create Base Components for Each Tier Style**
```typescript
// Create these components (start with basic implementations):
// - BasicHeader, ProfessionalHeader, FeaturedHeader, PremiumHeader
// - BasicAIInsights, EnhancedAIInsights, ProfessionalAIInsights, PremiumAIInsights  
// - MinimalContact, EnhancedContact, ProfessionalContact, LeadFocusedContact
// - ServiceBullets, EnhancedServiceBullets, ServiceCards, PremiumServiceCards
```

**Phase 2 Testing**: Each component factory method returns correct component, TierAwareComponent shows/hides correctly

---

### **Phase 3: Transform Existing Business Profile**
**Goal**: Convert current BusinessProfile to use tier system
**Success Criteria**: Existing page works with tier system, no visual regressions

#### **Step 3.1: Update Main BusinessProfile Component**
```typescript
// Update existing BusinessProfile component to:
// 1. Accept business with tier property
// 2. Use ComponentFactory for dynamic rendering
// 3. Wrap conditional sections with TierAwareComponent
// 4. Apply tier-specific CSS classes
```

#### **Step 3.2: Migrate AI Insights Section**
**CRITICAL**: Replace the three separate AI sections with single dynamic section:
```typescript
// REMOVE these existing sections:
// - Professional Overview
// - Competitive Intelligence  
// - Review Intelligence

// REPLACE with single dynamic AI section:
<AIInsightsSection 
  business={business}
  tierConfig={tierConfig}
  maxInsights={tierConfig.limits.maxAIInsights}
/>
```

#### **Step 3.3: Update Contact Sidebar**
```typescript
// Transform existing contact sidebar:
// - Free/Starter: Keep current basic contact info
// - Pro: Add "Featured Professional" styling
// - Power: Replace with prominent lead capture form + contact info
```

#### **Step 3.4: Add Tier Badge to Header**
```typescript
// Replace "Professional Overview" badge with dynamic tier badge:
<TierBadge tierConfig={tierConfig} />
```

**Phase 3 Testing**: Page renders correctly for each tier, no broken layouts, all existing functionality preserved

---

### **Phase 4: Implement Tier-Specific Features**
**Goal**: Add the tier-specific functionality and content
**Success Criteria**: Clear visual differences between tiers, proper feature gating

#### **Step 4.1: Implement Performance Indicators (Starter+)**
```typescript
// Add performance indicators to header for Starter, Pro, Power:
<TierAwareComponent business={business} requiredTier={['starter', 'pro', 'power']}>
  <PerformanceIndicators business={business} tierConfig={tierConfig} />
</TierAwareComponent>
```

#### **Step 4.2: Add Review Response System (Pro+)**
```typescript
// Update reviews section to show business responses for Pro+ tiers:
<ReviewsSection 
  business={business}
  tierConfig={tierConfig}
  maxReviews={tierConfig.limits.maxReviews}
  showResponses={tierConfig.features.showReviewResponses}
/>
```

#### **Step 4.3: Implement Lead Capture (Power Only)**
```typescript
// Add prominent lead capture form for Power tier:
<TierAwareComponent 
  business={business} 
  requiredTier={['power']}
  fallback={<UpgradeToCapture />}
>
  <LeadCaptureForm businessId={business.id} />
</TierAwareComponent>
```

#### **Step 4.4: Add Image Gallery (Power Only)**
```typescript
// Show image gallery only for Power tier:
<TierAwareComponent 
  business={business} 
  requiredTier={['power']}
  fallback={<ImageGalleryUpgrade />}
>
  <ImageGallery business={business} />
</TierAwareComponent>
```

**Phase 4 Testing**: Feature gating works correctly, upgrade prompts show appropriately, tier-specific features function

---

### **Phase 5: Styling & Visual Polish**
**Goal**: Apply tier-specific styling and visual enhancements
**Success Criteria**: Clear visual hierarchy between tiers, professional appearance

#### **Step 5.1: Add Tier-Specific CSS Classes**
```scss
// Add CSS classes for each tier:
.business-profile {
  &.tier-free { /* Basic styling */ }
  &.tier-starter { /* Blue accents, professional feel */ }
  &.tier-pro { /* Orange accents, featured styling */ }
  &.tier-power { /* Green accents, premium styling */ }
}

.tier-badge {
  &--basic { /* Free tier badge styling */ }
  &--enhanced { /* Starter tier badge styling */ }
  &--featured { /* Pro tier badge styling */ }
  &--premium { /* Power tier badge styling */ }
}
```

#### **Step 5.2: Implement Service Display Variations**
```typescript
// Ensure service display changes by tier:
// - Free: Basic bullet points
// - Starter: Enhanced bullet points with details
// - Pro: Service cards with descriptions
// - Power: Premium service cards with enhanced features
```

#### **Step 5.3: Add Upgrade Prompt Styling**
```typescript
// Style upgrade prompts to be visually appealing but not intrusive:
<UpgradePrompt 
  currentTier={business.planTier}
  feature="advanced-ai"
  targetTier={getNextTierForFeature('advanced-ai', business.planTier)}
/>
```

**Phase 5 Testing**: Visual differences clear between tiers, upgrade prompts well-styled, responsive design works

---

### **Phase 6: Dynamic Tier Updates**
**Goal**: Handle real-time tier changes and updates
**Success Criteria**: Page updates automatically when tier changes, smooth transitions

#### **Step 6.1: Implement Tier Update Handler**
```typescript
// Add tier change handling:
const handleTierChange = async (businessId: string, newTier: TierLevel) => {
  // Implementation as shown above
};
```

#### **Step 6.2: Add Real-time Subscriptions (if applicable)**
```typescript
// Subscribe to tier changes for real-time updates:
useEffect(() => {
  const unsubscribe = subscribeToBusinessChanges(business.id, (updatedBusiness) => {
    if (updatedBusiness.planTier !== business.planTier) {
      setBusiness(updatedBusiness);
      animateTierUpgrade(updatedBusiness.planTier);
    }
  });
  return unsubscribe;
}, [business.id]);
```

#### **Step 6.3: Add Transition Animations**
```typescript
// Add smooth transitions when tier changes:
const animateTierUpgrade = (newTier: TierLevel) => {
  // Animate new features appearing
  // Show success notifications
  // Highlight newly unlocked sections
};
```

**Phase 6 Testing**: Tier changes update UI correctly, animations smooth, no visual glitches

---

## 🔍 Critical Implementation Details

### **Data Requirements**
```typescript
// Ensure these data fields are available in your business object:
interface RequiredBusinessData {
  id: string;
  planTier: TierLevel;
  name: string;
  rating: number;
  reviewCount: number;
  city: string;
  category: string;
  logo?: string;
  images?: string[];
  performanceData?: PerformanceData;
  aiInsights?: AIInsightsData;
  services?: ServiceData[];
  reviews?: ReviewData[];
}
```

### **Convex Schema Updates**
```typescript
// Update your Convex business schema to include:
export default defineSchema({
  businesses: defineTable({
    // ... existing fields
    planTier: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("power")),
    performanceData: v.optional(v.object({
      ranking: v.optional(v.number()),
      responseTime: v.optional(v.string()),
      satisfaction: v.optional(v.number()),
      areaAverage: v.optional(v.number()),
    })),
    aiInsights: v.optional(v.object({
      basic: v.optional(v.array(v.string())),
      enhanced: v.optional(v.array(v.string())),
      professional: v.optional(v.array(v.string())),
      premium: v.optional(v.array(v.string())),
    })),
  }),
});
```

### **Error Handling Strategy**
```typescript
// Always include fallback handling:
const TierSafeComponent = ({ business, children }) => {
  try {
    const tierConfig = getTierConfig(business.planTier);
    return <div className={`tier-${business.planTier}`}>{children}</div>;
  } catch (error) {
    console.error('Tier configuration error:', error);
    // Fallback to free tier if configuration fails
    return <div className="tier-free">{children}</div>;
  }
};
```

### **Testing Checklist for Each Phase**
- [ ] TypeScript compiles without errors
- [ ] All tier configurations are valid
- [ ] Components render correctly for each tier
- [ ] Feature gating works as expected
- [ ] Upgrade prompts appear appropriately
- [ ] Styling differences are clear between tiers
- [ ] Mobile responsiveness maintained
- [ ] No existing functionality broken
- [ ] Tier updates trigger correct UI changes

### **Common Pitfalls to Avoid**
1. **Don't break existing functionality** - Maintain backward compatibility
2. **Test all four tiers** - Don't just test one tier and assume others work
3. **Handle missing data gracefully** - Not all businesses will have complete data
4. **Validate tier configurations** - Ensure tier configs are complete before using
5. **Consider mobile experience** - Tier differences should work on mobile too
6. **Don't hardcode tier logic** - Use the configuration system consistently

This multi-phased approach ensures systematic implementation with clear success criteria at each step, making it much more likely to succeed without breaking existing functionality.