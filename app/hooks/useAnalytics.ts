/**
 * React hooks for analytics integration
 * Provides easy-to-use hooks for tracking events and user behavior
 */

import { useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/react-router';
import { useLocation } from 'react-router';
import { analytics, type AnalyticsUser } from '~/services/analytics';
import { 
  type EventName, 
  type AuthEventProps, 
  type BusinessEventProps, 
  type SubscriptionEventProps,
  type AIEventProps,
  type SearchEventProps,
  createEventProperties 
} from '~/services/events';

/**
 * Main analytics hook - handles user identification and page tracking
 */
export function useAnalytics() {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const hasIdentified = useRef(false);

  // Identify user when auth loads
  useEffect(() => {
    if (isLoaded && user && !hasIdentified.current) {
      const analyticsUser: AnalyticsUser = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        // Get plan tier from user metadata or publicMetadata
        planTier: (user.publicMetadata?.planTier as any) || 'free',
        businessId: (user.publicMetadata?.businessId as string) || undefined,
        role: (user.publicMetadata?.role as any) || 'user',
        createdAt: user.createdAt?.toISOString(),
      };

      analytics.identify(analyticsUser);
      hasIdentified.current = true;
    } else if (isLoaded && !user && hasIdentified.current) {
      // User logged out
      analytics.reset();
      hasIdentified.current = false;
    }
  }, [user, isLoaded]);

  // Track page views on route changes
  useEffect(() => {
    if (isLoaded) {
      analytics.trackPageView({
        page_category: getPageCategory(location.pathname),
        user_tier: user?.publicMetadata?.planTier as string || 'anonymous'
      });
    }
  }, [location.pathname, isLoaded, user]);

  // Track custom events
  const track = useCallback((eventName: EventName, properties?: Record<string, any>) => {
    analytics.track(eventName, createEventProperties(eventName, properties));
  }, []);

  // Track authentication events
  const trackAuth = useCallback((eventName: EventName, properties?: AuthEventProps) => {
    analytics.track(eventName, createEventProperties(eventName, properties));
  }, []);

  // Track business events
  const trackBusiness = useCallback((eventName: EventName, properties: BusinessEventProps) => {
    analytics.trackBusinessEvent(eventName.replace('business_', ''), properties);
  }, []);

  // Track subscription events  
  const trackSubscription = useCallback((eventName: EventName, properties: SubscriptionEventProps) => {
    analytics.trackSubscriptionEvent(eventName.replace('subscription_', ''), properties);
  }, []);

  // Track AI usage
  const trackAI = useCallback((properties: AIEventProps) => {
    analytics.trackAIUsage(properties);
  }, []);

  return {
    track,
    trackAuth,
    trackBusiness,
    trackSubscription,
    trackAI,
    identify: analytics.identify.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    reset: analytics.reset.bind(analytics),
    isFeatureEnabled: analytics.isFeatureEnabled.bind(analytics),
    getFeatureFlagValue: analytics.getFeatureFlagValue.bind(analytics),
  };
}

/**
 * Hook for tracking search events
 */
export function useSearchTracking() {
  const { track } = useAnalytics();

  const trackSearch = useCallback((query: string, properties?: Partial<SearchEventProps>) => {
    track('search_performed', {
      query,
      results_count: 0,
      ...properties
    });
  }, [track]);

  const trackSearchResult = useCallback((query: string, resultId: string, position: number) => {
    track('search_result_clicked', {
      query,
      result_id: resultId,
      result_position: position
    });
  }, [track]);

  return { trackSearch, trackSearchResult };
}

/**
 * Hook for tracking performance metrics
 */
export function usePerformanceTracking() {
  const trackPerformance = useCallback((metrics: Record<string, number>) => {
    analytics.trackPerformance(metrics);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, []);

  // Track Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track page load time
      window.addEventListener('load', () => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          trackPerformance({
            page_load_time: navTiming.loadEventEnd - navTiming.loadEventStart,
            dom_content_loaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
            first_paint: navTiming.loadEventStart - navTiming.navigationStart,
          });
        }
      });

      // Track Core Web Vitals with Web Vitals library if available
      if ('getCLS' in window && 'getFID' in window && 'getFCP' in window && 'getLCP' in window && 'getTTFB' in window) {
        // @ts-ignore - Web Vitals library
        getCLS((metric: any) => trackPerformance({ cls: metric.value }));
        // @ts-ignore
        getFID((metric: any) => trackPerformance({ fid: metric.value }));
        // @ts-ignore  
        getFCP((metric: any) => trackPerformance({ fcp: metric.value }));
        // @ts-ignore
        getLCP((metric: any) => trackPerformance({ lcp: metric.value }));
        // @ts-ignore
        getTTFB((metric: any) => trackPerformance({ ttfb: metric.value }));
      }
    }
  }, [trackPerformance]);

  return { trackPerformance, trackError };
}

/**
 * Hook for feature flag management
 */
export function useFeatureFlags() {
  const isEnabled = useCallback((flag: string): boolean => {
    return analytics.isFeatureEnabled(flag);
  }, []);

  const getValue = useCallback((flag: string): string | boolean | undefined => {
    return analytics.getFeatureFlagValue(flag);
  }, []);

  return { isEnabled, getValue };
}

/**
 * Hook for A/B testing
 */
export function useABTest(testName: string) {
  const variant = analytics.getFeatureFlagValue(testName);
  const isTestUser = variant !== undefined && variant !== false;

  const trackConversion = useCallback((conversionEvent: string, value?: number) => {
    analytics.track(`ab_test_conversion`, {
      test_name: testName,
      variant: variant,
      conversion_event: conversionEvent,
      conversion_value: value,
    });
  }, [testName, variant]);

  return { 
    variant, 
    isTestUser, 
    trackConversion 
  };
}

/**
 * Hook for tracking form interactions
 */
export function useFormTracking(formName: string) {
  const { track } = useAnalytics();

  const trackFormStart = useCallback(() => {
    track('form_started', { form_name: formName });
  }, [track, formName]);

  const trackFormField = useCallback((fieldName: string, fieldType: string) => {
    track('form_field_focused', { 
      form_name: formName,
      field_name: fieldName,
      field_type: fieldType
    });
  }, [track, formName]);

  const trackFormError = useCallback((fieldName: string, errorMessage: string) => {
    track('form_error', { 
      form_name: formName,
      field_name: fieldName,
      error_message: errorMessage
    });
  }, [track, formName]);

  const trackFormSubmit = useCallback((success: boolean, errorMessage?: string) => {
    track(success ? 'form_submitted_success' : 'form_submitted_error', { 
      form_name: formName,
      error_message: errorMessage
    });
  }, [track, formName]);

  return {
    trackFormStart,
    trackFormField,
    trackFormError,
    trackFormSubmit
  };
}

/**
 * Utility function to get page category from pathname
 */
function getPageCategory(pathname: string): string {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/claim-business')) return 'business_claim';
  if (pathname.includes('/pricing')) return 'pricing';
  if (pathname === '/' || pathname === '') return 'homepage';
  if (pathname.match(/^\/[^\/]+\/[^\/]+\/[^\/]+$/)) return 'business_listing';
  if (pathname.startsWith('/categories')) return 'categories';
  if (pathname.startsWith('/cities')) return 'cities';
  if (pathname.includes('/blog')) return 'blog';
  return 'other';
}