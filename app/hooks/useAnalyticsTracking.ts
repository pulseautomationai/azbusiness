import { useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface AnalyticsEvent {
  businessId: Id<"businesses">;
  eventType: "page_view" | "lead_submit" | "phone_click" | "directions_click" | "website_click" | "social_click" | "cta_click";
  sourceUrl?: string;
  metadata?: any;
}

export function useAnalyticsTracking() {
  const trackEventMutation = useMutation(api.analytics.trackEvent);

  // Get device type
  const getDeviceType = (): "mobile" | "desktop" | "tablet" => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return "tablet";
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return "mobile";
    }
    return "desktop";
  };

  // Generate session ID
  const getSessionId = useCallback((): string => {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }, []);

  // Track an event
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await trackEventMutation({
        ...event,
        sourceUrl: event.sourceUrl || window.location.href,
        deviceType: getDeviceType(),
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
      });
    } catch (error) {
      console.error("Failed to track analytics event:", error);
    }
  }, [trackEventMutation, getSessionId]);

  // Track page view
  const trackPageView = useCallback((businessId: Id<"businesses">) => {
    trackEvent({
      businessId,
      eventType: "page_view",
      metadata: {
        title: document.title,
        referrer: document.referrer,
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Track phone click
  const trackPhoneClick = useCallback((businessId: Id<"businesses">, phoneNumber: string) => {
    trackEvent({
      businessId,
      eventType: "phone_click",
      metadata: {
        phoneNumber,
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Track directions click
  const trackDirectionsClick = useCallback((businessId: Id<"businesses">, address: string) => {
    trackEvent({
      businessId,
      eventType: "directions_click",
      metadata: {
        address,
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Track website click
  const trackWebsiteClick = useCallback((businessId: Id<"businesses">, websiteUrl: string) => {
    trackEvent({
      businessId,
      eventType: "website_click",
      metadata: {
        websiteUrl,
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Track social media click
  const trackSocialClick = useCallback((businessId: Id<"businesses">, platform: string, url: string) => {
    trackEvent({
      businessId,
      eventType: "social_click",
      metadata: {
        platform,
        url,
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Track CTA click
  const trackCTAClick = useCallback((businessId: Id<"businesses">, ctaType: string, location: string) => {
    trackEvent({
      businessId,
      eventType: "cta_click",
      metadata: {
        ctaType,
        location,
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Track lead submission
  const trackLeadSubmission = useCallback((businessId: Id<"businesses">, leadData: any) => {
    trackEvent({
      businessId,
      eventType: "lead_submit",
      metadata: {
        formType: leadData.formType || "contact",
        timestamp: Date.now(),
      },
    });
  }, [trackEvent]);

  // Auto-track page view when component mounts
  const usePageViewTracking = (businessId: Id<"businesses">) => {
    useEffect(() => {
      // Track initial page view
      trackPageView(businessId);

      // Track page visibility changes
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          trackPageView(businessId);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [businessId, trackPageView]);
  };

  // Track scroll depth
  const useScrollTracking = (businessId: Id<"businesses">) => {
    useEffect(() => {
      let maxScrollDepth = 0;
      const scrollThresholds = [25, 50, 75, 100];
      const trackedThresholds = new Set<number>();

      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

        if (scrollPercentage > maxScrollDepth) {
          maxScrollDepth = scrollPercentage;
        }

        // Track milestone thresholds
        scrollThresholds.forEach(threshold => {
          if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
            trackedThresholds.add(threshold);
            trackEvent({
              businessId,
              eventType: "page_view",
              metadata: {
                scrollDepth: threshold,
                eventSubtype: "scroll_milestone",
                timestamp: Date.now(),
              },
            });
          }
        });
      };

      // Throttle scroll events
      let scrollTimeout: NodeJS.Timeout;
      const throttledHandleScroll = () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null as any;
        }, 100);
      };

      window.addEventListener('scroll', throttledHandleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', throttledHandleScroll);
        if (scrollTimeout) clearTimeout(scrollTimeout);

        // Track final scroll depth on unmount
        if (maxScrollDepth > 0) {
          trackEvent({
            businessId,
            eventType: "page_view",
            metadata: {
              scrollDepth: maxScrollDepth,
              eventSubtype: "final_scroll_depth",
              timestamp: Date.now(),
            },
          });
        }
      };
    }, [businessId, trackEvent]);
  };

  return {
    trackEvent,
    trackPageView,
    trackPhoneClick,
    trackDirectionsClick,
    trackWebsiteClick,
    trackSocialClick,
    trackCTAClick,
    trackLeadSubmission,
    usePageViewTracking,
    useScrollTracking,
  };
}