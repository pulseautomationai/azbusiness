/**
 * Analytics Provider Component
 * Handles PostHog initialization, user tracking, and error boundary integration
 */

import { useEffect, type ReactNode } from 'react';
import { useAnalytics, usePerformanceTracking } from '~/hooks/useAnalytics';
import { isRouteErrorResponse } from 'react-router';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const analytics = useAnalytics();
  const { trackError } = usePerformanceTracking();

  // Set up global error tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        new Error(event.reason || 'Unhandled promise rejection'),
        {
          type: 'unhandled_promise_rejection',
          reason: event.reason,
          url: window.location.href,
        }
      );
    };

    // Handle JavaScript errors
    const handleError = (event: ErrorEvent) => {
      trackError(
        new Error(event.message || 'JavaScript error'),
        {
          type: 'javascript_error',
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          url: window.location.href,
        }
      );
    };

    // Handle resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.tagName) {
        trackError(
          new Error(`Resource failed to load: ${target.tagName}`),
          {
            type: 'resource_error',
            tag: target.tagName,
            src: (target as any).src || (target as any).href,
            url: window.location.href,
          }
        );
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('error', handleResourceError, true);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, [trackError]);

  return <>{children}</>;
}

/**
 * Enhanced Error Boundary that integrates with analytics
 */
interface ErrorBoundaryProps {
  error: unknown;
}

export function AnalyticsErrorBoundary({ error }: ErrorBoundaryProps) {
  const { trackError } = usePerformanceTracking();

  useEffect(() => {
    if (error) {
      let errorMessage = 'Unknown error';
      let errorDetails: Record<string, any> = {};

      if (isRouteErrorResponse(error)) {
        errorMessage = `Route Error: ${error.status}`;
        errorDetails = {
          type: 'route_error',
          status: error.status,
          status_text: error.statusText,
          data: error.data,
        };
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = {
          type: 'component_error',
          name: error.name,
          stack: error.stack,
        };
      }

      trackError(new Error(errorMessage), {
        ...errorDetails,
        url: window.location?.href,
        user_agent: navigator?.userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error, trackError]);

  return null;
}

/**
 * Hook for tracking component lifecycle
 */
export function useComponentAnalytics(componentName: string) {
  const { track } = useAnalytics();

  useEffect(() => {
    // Track component mount
    track('component_mounted', {
      component_name: componentName,
      timestamp: new Date().toISOString(),
    });

    return () => {
      // Track component unmount
      track('component_unmounted', {
        component_name: componentName,
        timestamp: new Date().toISOString(),
      });
    };
  }, [componentName, track]);
}

/**
 * Hook for tracking user interactions
 */
export function useInteractionTracking() {
  const { track } = useAnalytics();

  const trackClick = (element: string, properties?: Record<string, any>) => {
    track('element_clicked', {
      element_type: element,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  };

  const trackHover = (element: string, properties?: Record<string, any>) => {
    track('element_hovered', {
      element_type: element,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  };

  const trackScroll = (depth: number, properties?: Record<string, any>) => {
    track('page_scrolled', {
      scroll_depth: depth,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  };

  return { trackClick, trackHover, trackScroll };
}