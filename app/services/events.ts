/**
 * Analytics Event Definitions
 * Centralized event schema for consistent tracking across the application
 */

// Authentication Events
export const AUTH_EVENTS = {
  SIGN_UP_STARTED: 'auth_signup_started',
  SIGN_UP_COMPLETED: 'auth_signup_completed', 
  SIGN_IN_STARTED: 'auth_signin_started',
  SIGN_IN_COMPLETED: 'auth_signin_completed',
  SIGN_OUT: 'auth_signout',
  PASSWORD_RESET_REQUESTED: 'auth_password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth_password_reset_completed',
} as const;

// Business Listing Events
export const BUSINESS_EVENTS = {
  LISTING_VIEWED: 'business_listing_viewed',
  LISTING_CLAIMED_STARTED: 'business_claim_started',
  LISTING_CLAIMED_COMPLETED: 'business_claim_completed',
  LISTING_EDITED: 'business_listing_edited',
  LISTING_PUBLISHED: 'business_listing_published',
  CONTACT_FORM_SUBMITTED: 'business_contact_submitted',
  PHONE_CLICKED: 'business_phone_clicked',
  EMAIL_CLICKED: 'business_email_clicked',
  WEBSITE_CLICKED: 'business_website_clicked',
  DIRECTIONS_CLICKED: 'business_directions_clicked',
  SOCIAL_LINK_CLICKED: 'business_social_clicked',
  PHOTOS_VIEWED: 'business_photos_viewed',
  SERVICES_VIEWED: 'business_services_viewed',
  REVIEWS_VIEWED: 'business_reviews_viewed',
  INSIGHTS_VIEWED: 'business_insights_viewed',
} as const;

// Subscription Events  
export const SUBSCRIPTION_EVENTS = {
  PRICING_PAGE_VIEWED: 'subscription_pricing_viewed',
  PLAN_SELECTED: 'subscription_plan_selected',
  CHECKOUT_STARTED: 'subscription_checkout_started',
  CHECKOUT_COMPLETED: 'subscription_checkout_completed',
  CHECKOUT_FAILED: 'subscription_checkout_failed',
  PLAN_UPGRADED: 'subscription_upgraded',
  PLAN_DOWNGRADED: 'subscription_downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_REACTIVATED: 'subscription_reactivated',
  PAYMENT_FAILED: 'subscription_payment_failed',
  PAYMENT_SUCCEEDED: 'subscription_payment_succeeded',
  TRIAL_STARTED: 'subscription_trial_started',
  TRIAL_ENDED: 'subscription_trial_ended',
} as const;

// AI Feature Events
export const AI_EVENTS = {
  CONTENT_GENERATED: 'ai_content_generated',
  SUMMARY_GENERATED: 'ai_summary_generated',
  SERVICES_ENHANCED: 'ai_services_enhanced',
  REVIEWS_ANALYZED: 'ai_reviews_analyzed',
  SEO_AUDIT_GENERATED: 'ai_seo_audit_generated',
  COMPETITOR_ANALYSIS_RUN: 'ai_competitor_analysis_run',
  SOCIAL_CONTENT_GENERATED: 'ai_social_content_generated',
  PRICING_SUGGESTIONS_GENERATED: 'ai_pricing_suggestions_generated',
} as const;

// Admin Events
export const ADMIN_EVENTS = {
  DASHBOARD_ACCESSED: 'admin_dashboard_accessed',
  BUSINESS_MODERATED: 'admin_business_moderated',
  USER_IMPERSONATED: 'admin_user_impersonated',
  BULK_OPERATION_PERFORMED: 'admin_bulk_operation',
  IMPORT_STARTED: 'admin_import_started',
  IMPORT_COMPLETED: 'admin_import_completed',
  EXPORT_GENERATED: 'admin_export_generated',
  ANALYTICS_VIEWED: 'admin_analytics_viewed',
  SYSTEM_SETTINGS_CHANGED: 'admin_settings_changed',
} as const;

// User Engagement Events
export const ENGAGEMENT_EVENTS = {
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  CATEGORY_BROWSED: 'category_browsed',
  CITY_BROWSED: 'city_browsed',
  COMPARISON_VIEWED: 'comparison_viewed',
  FAQ_OPENED: 'faq_opened',
  HELP_ACCESSED: 'help_accessed',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed',
  SHARE_ACTION: 'content_shared',
} as const;

// Performance Events
export const PERFORMANCE_EVENTS = {
  PAGE_LOAD_TIME: 'performance_page_load',
  API_RESPONSE_TIME: 'performance_api_response',
  ERROR_OCCURRED: 'performance_error',
  SLOW_QUERY_DETECTED: 'performance_slow_query',
  CORE_WEB_VITALS: 'performance_core_web_vitals',
} as const;

// Onboarding Events
export const ONBOARDING_EVENTS = {
  WELCOME_VIEWED: 'onboarding_welcome_viewed',
  PROFILE_COMPLETED: 'onboarding_profile_completed',
  TUTORIAL_STARTED: 'onboarding_tutorial_started',
  TUTORIAL_COMPLETED: 'onboarding_tutorial_completed',
  FIRST_BUSINESS_ADDED: 'onboarding_first_business_added',
  FIRST_PAYMENT_COMPLETED: 'onboarding_first_payment_completed',
} as const;

// All events combined for type safety
export const ALL_EVENTS = {
  ...AUTH_EVENTS,
  ...BUSINESS_EVENTS,
  ...SUBSCRIPTION_EVENTS,
  ...AI_EVENTS,
  ...ADMIN_EVENTS,
  ...ENGAGEMENT_EVENTS,
  ...PERFORMANCE_EVENTS,
  ...ONBOARDING_EVENTS,
} as const;

// Type for all valid event names
export type EventName = typeof ALL_EVENTS[keyof typeof ALL_EVENTS];

// Event property interfaces
export interface AuthEventProps {
  method?: 'email' | 'google' | 'github';
  source?: 'header' | 'footer' | 'modal' | 'redirect';
  user_id?: string;
  email?: string;
}

export interface BusinessEventProps {
  business_id: string;
  business_name: string;
  category: string;
  city: string;
  plan_tier: 'free' | 'starter' | 'pro' | 'power';
  is_claimed: boolean;
  is_verified: boolean;
  owner_id?: string;
}

export interface SubscriptionEventProps {
  plan_id: string;
  plan_name: 'pro' | 'power';
  plan_amount: number;
  interval: 'monthly' | 'yearly';
  currency: 'USD';
  user_id: string;
  business_id?: string;
  previous_plan?: string;
  discount_applied?: boolean;
  discount_amount?: number;
}

export interface AIEventProps {
  feature: string;
  model_used: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  tokens_used: number;
  cost_estimate: number;
  processing_time_ms: number;
  plan_tier: string;
  business_id?: string;
  user_id: string;
  success: boolean;
}

export interface SearchEventProps {
  query: string;
  category?: string;
  city?: string;
  results_count: number;
  filters_applied?: Record<string, any>;
  result_clicked?: boolean;
  result_position?: number;
}

export interface PerformanceEventProps {
  metric_name: string;
  value: number;
  url: string;
  user_agent: string;
  connection_type?: string;
  page_category?: string;
}

// Event tracking helpers
export function getEventCategory(eventName: EventName): string {
  if (Object.values(AUTH_EVENTS).includes(eventName as any)) return 'authentication';
  if (Object.values(BUSINESS_EVENTS).includes(eventName as any)) return 'business';
  if (Object.values(SUBSCRIPTION_EVENTS).includes(eventName as any)) return 'subscription';
  if (Object.values(AI_EVENTS).includes(eventName as any)) return 'ai';
  if (Object.values(ADMIN_EVENTS).includes(eventName as any)) return 'admin';
  if (Object.values(ENGAGEMENT_EVENTS).includes(eventName as any)) return 'engagement';
  if (Object.values(PERFORMANCE_EVENTS).includes(eventName as any)) return 'performance';
  if (Object.values(ONBOARDING_EVENTS).includes(eventName as any)) return 'onboarding';
  return 'other';
}

export function createEventProperties(
  eventName: EventName,
  customProps: Record<string, any> = {}
): Record<string, any> {
  return {
    event_category: getEventCategory(eventName),
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    ...customProps,
  };
}