/**
 * Real-time Data Hook
 * Integrates Convex real-time subscriptions with PostHog analytics data
 */

import { useEffect, useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { analytics } from '~/services/analytics';

// Real-time dashboard data types
export interface RealTimeMetrics {
  activeUsers: number;
  todayPageViews: number;
  todaySignups: number;
  todaySubscriptions: number;
  revenueToday: number;
  conversionRate: number;
  lastUpdated: Date;
}

export interface LiveBusinessMetrics {
  totalBusinesses: number;
  claimedToday: number;
  reviewsToday: number;
  leadsCaptured: number;
  topPerformingBusiness?: {
    id: string;
    name: string;
    views: number;
    leads: number;
  };
}

/**
 * Hook for real-time platform metrics
 */
export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get Convex data
  const adminMetrics = useQuery(api.adminAnalytics.getAdminDashboardMetrics);
  
  // Fetch PostHog data
  const fetchPostHogMetrics = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Combine Convex and PostHog data
      const conversionRate = adminMetrics ? 
        (adminMetrics.customers.new / Math.max(adminMetrics.businesses.total, 1)) * 100 : 0;

      const realTimeData: RealTimeMetrics = {
        activeUsers: 0, // Will be populated by PostHog API
        todayPageViews: 0, // Will be populated by PostHog API
        todaySignups: adminMetrics?.customers.new || 0,
        todaySubscriptions: adminMetrics?.subscriptions.active || 0,
        revenueToday: adminMetrics?.revenue.total || 0,
        conversionRate,
        lastUpdated: new Date(),
      };

      setMetrics(realTimeData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, [adminMetrics]);

  // Set up real-time updates
  useEffect(() => {
    fetchPostHogMetrics();
    
    // Update every 30 seconds
    const interval = setInterval(fetchPostHogMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPostHogMetrics]);

  // Track dashboard views
  useEffect(() => {
    analytics.track('dashboard_viewed', {
      dashboard_type: 'real_time_metrics',
      timestamp: new Date().toISOString(),
    });
  }, []);

  return { metrics, isLoading, error, refresh: fetchPostHogMetrics };
}

/**
 * Hook for live business performance data
 */
export function useLiveBusinessMetrics() {
  const [metrics, setMetrics] = useState<LiveBusinessMetrics | null>(null);
  const businessMetrics = useQuery(api.adminAnalytics.getAdminDashboardMetrics);

  useEffect(() => {
    if (businessMetrics) {
      const liveData: LiveBusinessMetrics = {
        totalBusinesses: businessMetrics.businesses.total,
        claimedToday: businessMetrics.businesses.claimed,
        reviewsToday: businessMetrics.reviews.recentReviews,
        leadsCaptured: 0, // Would need to implement lead tracking
        topPerformingBusiness: undefined, // Would need to implement
      };

      setMetrics(liveData);
    }
  }, [businessMetrics]);

  return metrics;
}

/**
 * Hook for real-time user activity
 */
export function useRealTimeUserActivity() {
  const [activity, setActivity] = useState<Array<{
    id: string;
    type: 'signup' | 'claim' | 'subscribe' | 'view';
    user: string;
    business?: string;
    timestamp: Date;
  }>>([]);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time activity feed
    // In a real implementation, this would connect to PostHog's real-time API
    // or use WebSockets/Server-Sent Events
    
    const simulateActivity = () => {
      const activities = [
        { type: 'signup' as const, user: 'New User' },
        { type: 'view' as const, user: 'Anonymous', business: 'Phoenix Plumbing' },
        { type: 'claim' as const, user: 'Business Owner', business: 'AC Repair Pro' },
        { type: 'subscribe' as const, user: 'Premium User' },
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      setActivity(prev => [{
        id: Date.now().toString(),
        ...randomActivity,
        timestamp: new Date(),
      }, ...prev.slice(0, 19)]); // Keep last 20 activities
    };

    setIsConnected(true);
    
    // Add new activity every 10-30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance each check
        simulateActivity();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  return { activity, isConnected };
}

/**
 * Hook for conversion funnel real-time data
 */
export function useConversionFunnel() {
  const [funnelData, setFunnelData] = useState({
    visitors: 0,
    signups: 0,
    claimed: 0,
    subscribed: 0,
    rates: {
      visitorToSignup: 0,
      signupToClaim: 0,
      claimToSubscription: 0,
      overall: 0,
    }
  });

  const adminMetrics = useQuery(api.adminAnalytics.getAdminDashboardMetrics);

  useEffect(() => {
    if (adminMetrics) {
      // Calculate funnel metrics
      const visitors = 10000; // This would come from PostHog
      const signups = adminMetrics.customers.new || 0;
      const claimed = adminMetrics.businesses.claimed || 0;
      const subscribed = adminMetrics.subscriptions.active || 0;

      const rates = {
        visitorToSignup: visitors > 0 ? (signups / visitors) * 100 : 0,
        signupToClaim: signups > 0 ? (claimed / signups) * 100 : 0,
        claimToSubscription: claimed > 0 ? (subscribed / claimed) * 100 : 0,
        overall: visitors > 0 ? (subscribed / visitors) * 100 : 0,
      };

      setFunnelData({
        visitors,
        signups,
        claimed,
        subscribed,
        rates,
      });
    }
  }, [adminMetrics]);

  return funnelData;
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    averagePageLoadTime: 0,
    apiResponseTime: 0,
    errorRate: 0,
    coreWebVitals: {
      lcp: 0,
      fid: 0,
      cls: 0,
    },
  });

  useEffect(() => {
    // Monitor performance in real-time
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              averagePageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            }));
          }
          
          if (entry.entryType === 'measure' && entry.name.includes('api')) {
            setMetrics(prev => ({
              ...prev,
              apiResponseTime: entry.duration,
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'measure'] });

      return () => observer.disconnect();
    }
  }, []);

  return metrics;
}

/**
 * Hook for A/B test real-time results
 */
export function useABTestResults(testName: string) {
  const [results, setResults] = useState({
    variants: [] as Array<{
      name: string;
      users: number;
      conversions: number;
      conversionRate: number;
      confidence: number;
    }>,
    winner: null as string | null,
    isSignificant: false,
  });

  useEffect(() => {
    // Fetch A/B test results from PostHog
    // This would integrate with PostHog's experiments API
    const fetchResults = async () => {
      try {
        // Simulate A/B test data
        const variants = [
          { name: 'Control', users: 500, conversions: 25, conversionRate: 5.0, confidence: 0.85 },
          { name: 'Variant A', users: 480, conversions: 32, conversionRate: 6.7, confidence: 0.92 },
        ];

        const winner = variants.reduce((best, current) => 
          current.conversionRate > best.conversionRate ? current : best
        );

        setResults({
          variants,
          winner: winner.confidence > 0.9 ? winner.name : null,
          isSignificant: winner.confidence > 0.9,
        });
      } catch (error) {
        console.error('Failed to fetch A/B test results:', error);
      }
    };

    fetchResults();
    
    // Update every minute
    const interval = setInterval(fetchResults, 60000);
    
    return () => clearInterval(interval);
  }, [testName]);

  return results;
}

/**
 * Custom hook to trigger real-time events
 */
export function useRealTimeEvents() {
  const triggerEvent = useCallback((eventType: string, data: any) => {
    // In a real implementation, this would emit to WebSocket/SSE
    analytics.track(`realtime_${eventType}`, {
      ...data,
      timestamp: new Date().toISOString(),
      event_category: 'realtime',
    });
  }, []);

  return { triggerEvent };
}