import { useEffect, useRef, useState } from 'react';
import { logger } from '~/utils/logger';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  fcp: number | null; // First Contentful Paint
  navigationStart: number | null;
  loadComplete: number | null;
}

interface NavigationTiming {
  domContentLoaded: number;
  loadComplete: number;
  ttfb: number;
  totalTime: number;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    navigationStart: null,
    loadComplete: null
  });

  const [navigationTiming, setNavigationTiming] = useState<NavigationTiming | null>(null);
  const observersRef = useRef<PerformanceObserver[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Measure navigation timing
    const measureNavigationTiming = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const timing: NavigationTiming = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          ttfb: navigation.responseStart - navigation.fetchStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        };

        setNavigationTiming(timing);
        setMetrics(prev => ({
          ...prev,
          ttfb: timing.ttfb,
          navigationStart: navigation.fetchStart,
          loadComplete: timing.loadComplete
        }));

        // Log navigation timing
        logger.info('Navigation timing measured', timing, 'PERFORMANCE');
      }
    };

    // Measure Largest Contentful Paint (LCP)
    const measureLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          setMetrics(prev => ({
            ...prev,
            lcp: lastEntry.startTime
          }));

          logger.info('LCP measured', { lcp: lastEntry.startTime }, 'PERFORMANCE');
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.push(observer);
      } catch (error) {
        logger.warn('LCP measurement not supported', { error }, 'PERFORMANCE');
      }
    };

    // Measure First Input Delay (FID)
    const measureFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            
            setMetrics(prev => ({
              ...prev,
              fid
            }));

            logger.info('FID measured', { fid }, 'PERFORMANCE');
          });
        });

        observer.observe({ entryTypes: ['first-input'] });
        observersRef.current.push(observer);
      } catch (error) {
        logger.warn('FID measurement not supported', { error }, 'PERFORMANCE');
      }
    };

    // Measure Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      try {
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              
              setMetrics(prev => ({
                ...prev,
                cls: clsValue
              }));

              logger.debug('CLS updated', { cls: clsValue }, 'PERFORMANCE');
            }
          });
        });

        observer.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.push(observer);
      } catch (error) {
        logger.warn('CLS measurement not supported', { error }, 'PERFORMANCE');
      }
    };

    // Measure First Contentful Paint (FCP)
    const measureFCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({
                ...prev,
                fcp: entry.startTime
              }));

              logger.info('FCP measured', { fcp: entry.startTime }, 'PERFORMANCE');
            }
          });
        });

        observer.observe({ entryTypes: ['paint'] });
        observersRef.current.push(observer);
      } catch (error) {
        logger.warn('FCP measurement not supported', { error }, 'PERFORMANCE');
      }
    };

    // Start measurements
    measureNavigationTiming();
    measureLCP();
    measureFID();
    measureCLS();
    measureFCP();

    // Wait for load event to measure final metrics
    window.addEventListener('load', measureNavigationTiming);

    return () => {
      // Clean up observers
      observersRef.current.forEach(observer => {
        observer.disconnect();
      });
      observersRef.current = [];
      
      window.removeEventListener('load', measureNavigationTiming);
    };
  }, []);

  // Report metrics to analytics (placeholder)
  useEffect(() => {
    if (metrics.lcp && metrics.fcp && metrics.cls !== null) {
      // Here you would send metrics to your analytics service
      logger.info('Core Web Vitals collected', {
        lcp: metrics.lcp,
        fcp: metrics.fcp,
        cls: metrics.cls,
        fid: metrics.fid,
        ttfb: metrics.ttfb
      }, 'PERFORMANCE');
    }
  }, [metrics]);

  return {
    metrics,
    navigationTiming,
    // Helper functions
    isGoodLCP: metrics.lcp ? metrics.lcp <= 2500 : null,
    isGoodFID: metrics.fid ? metrics.fid <= 100 : null,
    isGoodCLS: metrics.cls ? metrics.cls <= 0.1 : null,
    isGoodTTFB: metrics.ttfb ? metrics.ttfb <= 800 : null,
    isGoodFCP: metrics.fcp ? metrics.fcp <= 1800 : null
  };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - renderStartTime.current;
    
    if (renderTime > 16) { // Log slow renders (> 16ms)
      logger.warn(`Slow render detected in ${componentName}`, {
        renderTime,
        renderCount: renderCount.current
      }, 'PERFORMANCE');
    }

    renderStartTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStartTime.current = Date.now();
    },
    markRenderEnd: () => {
      const renderTime = Date.now() - renderStartTime.current;
      logger.debug(`${componentName} render completed`, {
        renderTime,
        renderCount: renderCount.current
      }, 'PERFORMANCE');
      return renderTime;
    }
  };
}

// Hook for measuring API performance
export function useApiPerformance() {
  const [apiMetrics, setApiMetrics] = useState<{
    [key: string]: {
      calls: number;
      totalTime: number;
      averageTime: number;
      lastCall: number;
    }
  }>({});

  const measureApiCall = (endpoint: string, startTime: number, endTime: number) => {
    const duration = endTime - startTime;

    setApiMetrics(prev => {
      const current = prev[endpoint] || { calls: 0, totalTime: 0, averageTime: 0, lastCall: 0 };
      const newCalls = current.calls + 1;
      const newTotalTime = current.totalTime + duration;
      
      return {
        ...prev,
        [endpoint]: {
          calls: newCalls,
          totalTime: newTotalTime,
          averageTime: newTotalTime / newCalls,
          lastCall: duration
        }
      };
    });

    // Log slow API calls
    if (duration > 3000) {
      logger.warn(`Slow API call detected`, {
        endpoint,
        duration,
        threshold: 3000
      }, 'PERFORMANCE');
    }
  };

  return {
    apiMetrics,
    measureApiCall,
    getSlowAPIs: () => {
      return Object.entries(apiMetrics)
        .filter(([_, metrics]) => metrics.averageTime > 1000)
        .map(([endpoint, metrics]) => ({ endpoint, ...metrics }));
    }
  };
}

// Hook for memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercentage: number;
  } | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage
        });

        // Log high memory usage
        if (usagePercentage > 80) {
          logger.warn('High memory usage detected', {
            usagePercentage,
            usedJSHeapSize: memory.usedJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          }, 'PERFORMANCE');
        }
      }
    };

    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}