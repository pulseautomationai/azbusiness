/**
 * PostHog Analytics Service Layer
 * Provides type-safe, SSR-compatible analytics tracking
 */

import posthog from 'posthog-js';
import type { PostHog } from 'posthog-js';

// Type definitions for our analytics events
export interface AnalyticsUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  planTier?: 'free' | 'starter' | 'pro' | 'power';
  businessId?: string;
  role?: 'user' | 'admin' | 'business_owner';
  createdAt?: string;
}

export interface PageViewEvent {
  $current_url: string;
  $title: string;
  $referrer?: string;
  page_category?: string;
  user_tier?: string;
}

export interface BusinessEvent {
  business_id: string;
  business_name: string;
  action: string;
  category: string;
  plan_tier?: string;
  [key: string]: any;
}

export interface SubscriptionEvent {
  plan_tier: 'pro' | 'power';
  plan_amount: number;
  action: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate';
  previous_tier?: string;
  user_id: string;
}

export interface AIUsageEvent {
  feature: 'content_generation' | 'review_analysis' | 'seo_audit' | 'competitor_analysis';
  tokens_used: number;
  cost_estimate: number;
  plan_tier: string;
  business_id?: string;
}

// PostHog Analytics Class
class Analytics {
  private posthog: PostHog | null = null;
  private isInitialized = false;
  private eventQueue: Array<{ event: string; properties: any; options?: any }> = [];

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializePostHog();
    }
  }

  private initializePostHog() {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
    
    if (!posthogKey) {
      console.warn('PostHog key not found. Analytics disabled.');
      return;
    }

    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll handle page views manually
        capture_pageleave: true,
        loaded: (posthog) => {
          this.posthog = posthog;
          this.isInitialized = true;
          this.flushEventQueue();
          
          if (import.meta.env.DEV) {
            console.log('PostHog initialized successfully');
          }
        },
        // Privacy and GDPR settings
        opt_out_capturing_by_default: false,
        opt_out_persistence_by_default: false,
        disable_session_recording: !import.meta.env.VITE_ENABLE_SESSION_RECORDINGS,
        disable_surveys: true,
        // Performance settings
        property_blacklist: ['$performance_raw'],
        sanitize_properties: (properties, event) => {
          // Remove sensitive data
          const sanitized = { ...properties };
          delete sanitized.password;
          delete sanitized.token;
          delete sanitized.api_key;
          return sanitized;
        }
      });
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  private flushEventQueue() {
    if (!this.posthog) return;
    
    while (this.eventQueue.length > 0) {
      const { event, properties, options } = this.eventQueue.shift()!;
      this.posthog.capture(event, properties, options);
    }
  }

  private ensureInitialized(): boolean {
    return typeof window !== 'undefined' && this.isInitialized && this.posthog !== null;
  }

  /**
   * Identify user with PostHog
   */
  public identify(user: AnalyticsUser) {
    if (!this.ensureInitialized()) return;

    try {
      this.posthog!.identify(user.id, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        planTier: user.planTier,
        businessId: user.businessId,
        role: user.role,
        createdAt: user.createdAt,
        // Add company-level properties
        $groups: user.businessId ? { business: user.businessId } : undefined
      });

      if (import.meta.env.DEV) {
        console.log('User identified:', user.id);
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Track page view events
   */
  public trackPageView(properties?: Partial<PageViewEvent>) {
    if (!this.ensureInitialized()) return;

    try {
      const pageProperties: PageViewEvent = {
        $current_url: window.location.href,
        $title: document.title,
        $referrer: document.referrer || undefined,
        page_category: properties?.page_category || this.getPageCategory(),
        user_tier: properties?.user_tier,
        ...properties
      };

      this.posthog!.capture('$pageview', pageProperties);
      
      if (import.meta.env.DEV) {
        console.log('Page view tracked:', pageProperties);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track business-related events
   */
  public trackBusinessEvent(event: string, properties: BusinessEvent) {
    this.track(`business_${event}`, {
      ...properties,
      event_category: 'business',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track subscription events
   */
  public trackSubscriptionEvent(event: string, properties: SubscriptionEvent) {
    this.track(`subscription_${event}`, {
      ...properties,
      event_category: 'subscription',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track AI usage events
   */
  public trackAIUsage(properties: AIUsageEvent) {
    this.track('ai_usage', {
      ...properties,
      event_category: 'ai',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track custom events
   */
  public track(event: string, properties?: Record<string, any>, options?: any) {
    if (!this.ensureInitialized()) {
      // Queue events if PostHog isn't ready yet
      this.eventQueue.push({ event, properties: properties || {}, options });
      return;
    }

    try {
      this.posthog!.capture(event, {
        ...properties,
        $timestamp: new Date().toISOString(),
        // Add session context
        session_id: this.posthog!.get_session_id(),
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      }, options);

      if (import.meta.env.DEV) {
        console.log('Event tracked:', event, properties);
      }
    } catch (error) {
      console.error('Failed to track event:', error, { event, properties });
    }
  }

  /**
   * Set user properties
   */
  public setUserProperties(properties: Record<string, any>) {
    if (!this.ensureInitialized()) return;

    try {
      this.posthog!.people.set(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Reset user session (logout)
   */
  public reset() {
    if (!this.ensureInitialized()) return;

    try {
      this.posthog!.reset();
      if (import.meta.env.DEV) {
        console.log('Analytics session reset');
      }
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }

  /**
   * Feature flag evaluation
   */
  public isFeatureEnabled(flag: string): boolean {
    if (!this.ensureInitialized()) return false;

    try {
      return this.posthog!.isFeatureEnabled(flag) || false;
    } catch (error) {
      console.error('Failed to check feature flag:', error);
      return false;
    }
  }

  /**
   * Get feature flag value
   */
  public getFeatureFlagValue(flag: string): string | boolean | undefined {
    if (!this.ensureInitialized()) return undefined;

    try {
      return this.posthog!.getFeatureFlag(flag);
    } catch (error) {
      console.error('Failed to get feature flag value:', error);
      return undefined;
    }
  }

  /**
   * Capture performance metrics
   */
  public trackPerformance(metrics: Record<string, number>) {
    this.track('performance_metrics', {
      ...metrics,
      event_category: 'performance',
      page_url: window.location.href
    });
  }

  /**
   * Track errors
   */
  public trackError(error: Error, context?: Record<string, any>) {
    this.track('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      event_category: 'error',
      ...context
    });
  }

  /**
   * Get page category from URL
   */
  private getPageCategory(): string {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/claim-business')) return 'claim';
    if (path.includes('/pricing')) return 'pricing';
    if (path === '/' || path === '') return 'home';
    if (path.match(/^\/[^\/]+\/[^\/]+\/[^\/]+$/)) return 'business_listing';
    return 'other';
  }

  /**
   * Shutdown PostHog (cleanup)
   */
  public shutdown() {
    if (this.posthog) {
      this.posthog.opt_out_capturing();
    }
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export commonly used tracking functions
export const {
  identify,
  track,
  trackPageView,
  trackBusinessEvent,
  trackSubscriptionEvent,
  trackAIUsage,
  setUserProperties,
  reset,
  isFeatureEnabled,
  getFeatureFlagValue,
  trackPerformance,
  trackError
} = analytics;

// Export the class for advanced usage
export { Analytics };
export default analytics;