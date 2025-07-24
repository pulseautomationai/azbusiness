/**
 * Optimized PostHog Analytics Service
 * Reduces duplicate tracking and improves performance
 */

import posthog from 'posthog-js';
import type { PostHog } from 'posthog-js';

// Optimized configuration for PostHog
export const POSTHOG_CONFIG = {
  // Performance settings
  batch_size: 20, // Batch events before sending
  batch_interval_ms: 5000, // Send events every 5 seconds
  batch_mode: true, // Enable batching
  request_timeout_ms: 10000, // 10 second timeout
  
  // Privacy and optimization
  person_profiles: 'identified_only' as const,
  capture_pageview: true, // Let PostHog handle page views
  capture_pageleave: false, // Reduce noise
  autocapture: false, // Disable automatic event capture
  disable_session_recording: true, // Unless you need recordings
  disable_surveys: true,
  
  // Performance optimizations
  property_blacklist: ['$performance_raw', '$network_round_trip_time'],
  sanitize_properties: (properties: any) => {
    // Remove sensitive and unnecessary data
    const sanitized = { ...properties };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.api_key;
    delete sanitized.userAgent; // Already captured by PostHog
    delete sanitized.timestamp; // PostHog adds its own
    return sanitized;
  },
  
  // Reduce API calls
  feature_flag_request_timeout_ms: 5000,
  disable_persistence: false,
  persistence: 'localStorage' as const,
  
  // Event filtering
  before_send: (event: any) => {
    // Filter out noisy events
    const noisyEvents = [
      'component_mounted',
      'component_unmounted',
      'element_hovered',
      'scroll_milestone'
    ];
    
    if (noisyEvents.includes(event.event)) {
      return null; // Don't send these events
    }
    
    // Deduplicate page views
    if (event.event === '$pageview') {
      const lastPageView = sessionStorage.getItem('last_pageview');
      const currentUrl = event.properties?.$current_url;
      
      if (lastPageView === currentUrl && Date.now() - parseInt(sessionStorage.getItem('last_pageview_time') || '0') < 2000) {
        return null; // Skip duplicate page view within 2 seconds
      }
      
      sessionStorage.setItem('last_pageview', currentUrl);
      sessionStorage.setItem('last_pageview_time', Date.now().toString());
    }
    
    return event;
  }
};

// Critical events only - reduce noise
export const CRITICAL_EVENTS = {
  // Authentication (keep these)
  AUTH_SIGNUP_COMPLETED: 'auth_signup_completed',
  AUTH_SIGNIN_COMPLETED: 'auth_signin_completed',
  
  // Business critical (keep these) 
  BUSINESS_CLAIMED: 'business_claim_completed',
  BUSINESS_VIEWED: 'business_listing_viewed', // Throttled
  LEAD_SUBMITTED: 'business_lead_submitted',
  
  // Revenue events (keep these)
  SUBSCRIPTION_STARTED: 'subscription_checkout_completed',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Key user actions (keep these)
  SEARCH_PERFORMED: 'search_performed',
  CONTACT_CLICKED: 'business_contact_clicked', // Combines phone/email/website
} as const;

// Singleton optimized analytics instance
class OptimizedAnalytics {
  private posthog: PostHog | null = null;
  private isInitialized = false;
  private eventQueue: Array<{ event: string; properties: any }> = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializePostHog();
    }
  }

  private initializePostHog() {
    const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
    const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    
    if (!posthogKey) {
      console.warn('PostHog key not found. Analytics disabled.');
      return;
    }

    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        ...POSTHOG_CONFIG,
        loaded: (posthog) => {
          this.posthog = posthog;
          this.isInitialized = true;
          this.flushEventQueue();
        }
      });
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  private flushEventQueue() {
    if (!this.posthog || this.eventQueue.length === 0) return;
    
    // Send queued events in batch
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    events.forEach(({ event, properties }) => {
      this.posthog!.capture(event, properties);
    });
  }

  /**
   * Track event with throttling and deduplication
   */
  public track(event: string, properties?: Record<string, any>) {
    if (!this.isInitialized) {
      this.eventQueue.push({ event, properties: properties || {} });
      return;
    }

    // Throttle business view events
    if (event === CRITICAL_EVENTS.BUSINESS_VIEWED) {
      const lastView = sessionStorage.getItem(`last_view_${properties?.business_id}`);
      const now = Date.now();
      
      if (lastView && now - parseInt(lastView) < 30000) { // 30 second throttle
        return;
      }
      
      sessionStorage.setItem(`last_view_${properties?.business_id}`, now.toString());
    }

    try {
      this.posthog!.capture(event, {
        ...properties,
        // Add performance context
        page_load_time: performance.timing ? 
          performance.timing.loadEventEnd - performance.timing.navigationStart : undefined,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Identify user - only essential properties
   */
  public identify(userId: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      // Only send essential user properties
      const essentialProps = {
        plan_tier: properties?.planTier,
        role: properties?.role,
        business_id: properties?.businessId,
      };

      this.posthog!.identify(userId, essentialProps);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Track revenue events with proper attribution
   */
  public trackRevenue(amount: number, properties?: Record<string, any>) {
    this.track('revenue', {
      ...properties,
      revenue: amount,
      currency: 'USD',
    });
  }

  /**
   * Batch multiple events
   */
  public batchTrack(events: Array<{ event: string; properties?: Record<string, any> }>) {
    events.forEach(({ event, properties }) => {
      this.track(event, properties);
    });
  }

  /**
   * Reset user session
   */
  public reset() {
    if (!this.isInitialized) return;
    
    try {
      this.posthog!.reset();
      sessionStorage.clear(); // Clear throttling data
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }

  /**
   * Shutdown and cleanup
   */
  public shutdown() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    
    if (this.posthog) {
      this.posthog.opt_out_capturing();
    }
  }
}

// Export optimized singleton
export const optimizedAnalytics = new OptimizedAnalytics();

// Helper to check if we should use Convex analytics
export function shouldUseConvexAnalytics(eventType: string): boolean {
  // Only store business-specific analytics in Convex
  const convexEvents = [
    'page_view', // For business-specific views only
    'lead_submit',
    'phone_click', 
    'website_click'
  ];
  
  return convexEvents.includes(eventType);
}

// Debounced track function for non-critical events
export function createDebouncedTracker(delay: number = 1000) {
  let timeout: NodeJS.Timeout | null = null;
  let pendingEvents: Array<{ event: string; properties?: Record<string, any> }> = [];

  return {
    track: (event: string, properties?: Record<string, any>) => {
      pendingEvents.push({ event, properties });
      
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        optimizedAnalytics.batchTrack(pendingEvents);
        pendingEvents = [];
        timeout = null;
      }, delay);
    },
    
    flush: () => {
      if (timeout) clearTimeout(timeout);
      if (pendingEvents.length > 0) {
        optimizedAnalytics.batchTrack(pendingEvents);
        pendingEvents = [];
      }
    }
  };
}