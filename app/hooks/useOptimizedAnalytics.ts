/**
 * Optimized Analytics Hook
 * Separates PostHog (general analytics) from Convex (business-specific data)
 */

import { useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/react-router';
import { useLocation } from 'react-router';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { 
  optimizedAnalytics, 
  CRITICAL_EVENTS, 
  shouldUseConvexAnalytics,
  createDebouncedTracker 
} from '~/services/analytics-optimized';

interface OptimizedAnalyticsOptions {
  enableConvexTracking?: boolean;
  enablePostHogTracking?: boolean;
  throttleMs?: number;
}

/**
 * Main optimized analytics hook
 */
export function useOptimizedAnalytics(options: OptimizedAnalyticsOptions = {}) {
  const {
    enableConvexTracking = true,
    enablePostHogTracking = true,
    throttleMs = 5000
  } = options;

  const { user, isLoaded } = useUser();
  const location = useLocation();
  const hasIdentified = useRef(false);
  const lastPageView = useRef<string>('');
  const debouncedTracker = useRef(createDebouncedTracker(throttleMs));

  // Convex mutation for business-specific events only
  const trackConvexEvent = useMutation(api.analytics.trackEvent);

  // Identify user when auth loads (PostHog only)
  useEffect(() => {
    if (!enablePostHogTracking) return;

    if (isLoaded && user && !hasIdentified.current) {
      optimizedAnalytics.identify(user.id, {
        planTier: user.publicMetadata?.planTier,
        businessId: user.publicMetadata?.businessId,
        role: user.publicMetadata?.role,
      });
      hasIdentified.current = true;
    } else if (isLoaded && !user && hasIdentified.current) {
      optimizedAnalytics.reset();
      hasIdentified.current = false;
    }
  }, [user, isLoaded, enablePostHogTracking]);

  // Track page views (throttled)
  useEffect(() => {
    if (!enablePostHogTracking || !isLoaded) return;

    const currentPath = location.pathname;
    
    // Prevent duplicate page views
    if (currentPath === lastPageView.current) return;
    lastPageView.current = currentPath;

    // PostHog handles general page views automatically
    // We only need to track business-specific views
  }, [location.pathname, isLoaded, enablePostHogTracking]);

  /**
   * Track critical events in PostHog
   */
  const trackCritical = useCallback((eventName: keyof typeof CRITICAL_EVENTS, properties?: Record<string, any>) => {
    if (!enablePostHogTracking) return;
    
    optimizedAnalytics.track(CRITICAL_EVENTS[eventName], properties);
  }, [enablePostHogTracking]);

  /**
   * Track business-specific events in Convex
   */
  const trackBusinessEvent = useCallback(async (
    businessId: Id<"businesses">,
    eventType: Parameters<typeof trackConvexEvent>[0]['eventType'],
    metadata?: any
  ) => {
    if (!enableConvexTracking || !shouldUseConvexAnalytics(eventType)) return;

    try {
      await trackConvexEvent({
        businessId,
        eventType,
        sourceUrl: window.location.href,
        deviceType: getDeviceType(),
        metadata,
      });
    } catch (error) {
      console.error('Failed to track Convex event:', error);
    }
  }, [trackConvexEvent, enableConvexTracking]);

  /**
   * Track non-critical events (debounced)
   */
  const trackDebounced = useCallback((event: string, properties?: Record<string, any>) => {
    if (!enablePostHogTracking) return;
    
    debouncedTracker.current.track(event, properties);
  }, [enablePostHogTracking]);

  /**
   * Track revenue events
   */
  const trackRevenue = useCallback((amount: number, properties?: Record<string, any>) => {
    if (!enablePostHogTracking) return;
    
    optimizedAnalytics.trackRevenue(amount, properties);
  }, [enablePostHogTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedTracker.current.flush();
    };
  }, []);

  return {
    trackCritical,
    trackBusinessEvent,
    trackDebounced,
    trackRevenue,
    identify: optimizedAnalytics.identify.bind(optimizedAnalytics),
    reset: optimizedAnalytics.reset.bind(optimizedAnalytics),
  };
}

/**
 * Hook for tracking business profile interactions
 */
export function useBusinessAnalytics(businessId: Id<"businesses">) {
  const { trackBusinessEvent, trackCritical } = useOptimizedAnalytics();
  const viewTracked = useRef(false);

  // Track initial view (once per session)
  useEffect(() => {
    if (!viewTracked.current) {
      trackBusinessEvent(businessId, 'page_view');
      trackCritical('BUSINESS_VIEWED', { business_id: businessId });
      viewTracked.current = true;
    }
  }, [businessId, trackBusinessEvent, trackCritical]);

  const trackPhoneClick = useCallback((phoneNumber: string) => {
    trackBusinessEvent(businessId, 'phone_click', { phoneNumber });
    trackCritical('CONTACT_CLICKED', { 
      business_id: businessId, 
      contact_type: 'phone' 
    });
  }, [businessId, trackBusinessEvent, trackCritical]);

  const trackWebsiteClick = useCallback((websiteUrl: string) => {
    trackBusinessEvent(businessId, 'website_click', { websiteUrl });
    trackCritical('CONTACT_CLICKED', { 
      business_id: businessId, 
      contact_type: 'website' 
    });
  }, [businessId, trackBusinessEvent, trackCritical]);

  const trackLeadSubmit = useCallback((formType: string = 'contact') => {
    trackBusinessEvent(businessId, 'lead_submit', { formType });
    trackCritical('LEAD_SUBMITTED', { 
      business_id: businessId,
      form_type: formType 
    });
  }, [businessId, trackBusinessEvent, trackCritical]);

  return {
    trackPhoneClick,
    trackWebsiteClick,
    trackLeadSubmit,
  };
}

/**
 * Hook for subscription tracking
 */
export function useSubscriptionAnalytics() {
  const { trackCritical, trackRevenue } = useOptimizedAnalytics();

  const trackSubscriptionStart = useCallback((plan: 'pro' | 'power', amount: number) => {
    trackCritical('SUBSCRIPTION_STARTED', {
      plan_name: plan,
      plan_amount: amount,
    });
    trackRevenue(amount, {
      plan_name: plan,
      transaction_type: 'subscription',
    });
  }, [trackCritical, trackRevenue]);

  const trackSubscriptionUpgrade = useCallback((
    fromPlan: string,
    toPlan: 'pro' | 'power',
    amount: number
  ) => {
    trackCritical('SUBSCRIPTION_UPGRADED', {
      from_plan: fromPlan,
      to_plan: toPlan,
      plan_amount: amount,
    });
    trackRevenue(amount, {
      plan_name: toPlan,
      transaction_type: 'upgrade',
    });
  }, [trackCritical, trackRevenue]);

  return {
    trackSubscriptionStart,
    trackSubscriptionUpgrade,
  };
}

/**
 * Hook for search analytics (debounced)
 */
export function useSearchAnalytics() {
  const { trackCritical, trackDebounced } = useOptimizedAnalytics();
  const lastSearch = useRef<string>('');

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    // Prevent duplicate searches
    if (query === lastSearch.current) return;
    lastSearch.current = query;

    trackCritical('SEARCH_PERFORMED', {
      query,
      results_count: resultsCount,
    });
  }, [trackCritical]);

  const trackSearchFilter = useCallback((filterType: string, value: any) => {
    trackDebounced('search_filter_applied', {
      filter_type: filterType,
      filter_value: value,
    });
  }, [trackDebounced]);

  return {
    trackSearch,
    trackSearchFilter,
  };
}

// Utility functions
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}