/**
 * Create a lazy-loaded component with a loading fallback
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: any }>
) {
  // This would be implemented in a .tsx file
  // For now, just return the import function
  return importFn;
}

/**
 * Preload a component to improve perceived performance
 */
export function preloadComponent(importFn: () => Promise<any>) {
  // Preload the component in the background
  importFn().catch(() => {
    // Ignore preload errors - component will be loaded on demand
  });
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit how often a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create a memoized version of a function with optional custom key generation
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const startIndex = Math.max(0, Math.floor(window.scrollY / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((window.scrollY + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex
  };
}

/**
 * Image optimization utilities
 */
export const ImageOptimization = {
  /**
   * Create responsive image sources for different screen sizes
   */
  createResponsiveSources(baseUrl: string, sizes: number[] = [400, 800, 1200]) {
    return sizes.map(size => ({
      srcSet: `${baseUrl}?w=${size} ${size}w`,
      type: 'image/webp'
    }));
  },

  /**
   * Lazy load images with IntersectionObserver
   */
  lazyLoadImage(
    img: HTMLImageElement,
    src: string,
    options: IntersectionObserverInit = {}
  ) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove('opacity-0');
          img.classList.add('opacity-100');
          observer.unobserve(img);
        }
      });
    }, { threshold: 0.1, ...options });

    observer.observe(img);
    return observer;
  },

  /**
   * Preload critical images
   */
  preloadImages(urls: string[]) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

/**
 * Web Vitals optimization utilities
 */
export const WebVitals = {
  /**
   * Measure Largest Contentful Paint (LCP)
   */
  measureLCP(callback: (value: number) => void) {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        callback(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },

  /**
   * Measure First Input Delay (FID)
   */
  measureFID(callback: (value: number) => void) {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          callback(entry.processingStart - entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  },

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  measureCLS(callback: (value: number) => void) {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            callback(clsValue);
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
};

/**
 * Service Worker utilities for caching
 */
export const ServiceWorkerUtils = {
  /**
   * Register service worker for caching
   */
  register(swPath = '/sw.js') {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(swPath)
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  },

  /**
   * Cache critical resources
   */
  cacheResources(resources: string[]) {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.open('critical-cache-v1').then((cache) => {
        cache.addAll(resources);
      });
    }
  }
};

/**
 * Bundle optimization utilities
 */
export const BundleOptimization = {
  /**
   * Dynamically import modules only when needed
   */
  async importOnDemand<T>(importFn: () => Promise<T>): Promise<T> {
    try {
      return await importFn();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      throw error;
    }
  },

  /**
   * Prefetch resources on hover/focus
   */
  prefetchOnInteraction(href: string, element: HTMLElement) {
    const prefetch = () => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    };

    element.addEventListener('mouseenter', prefetch, { once: true });
    element.addEventListener('focus', prefetch, { once: true });
  }
};