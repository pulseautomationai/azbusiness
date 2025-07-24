# PostHog Optimization Guide

This guide helps you migrate from the current dual-analytics setup to an optimized implementation that reduces load on both PostHog and Convex.

## Current Issues

1. **Duplicate Tracking**: Both PostHog and Convex are tracking the same events
2. **Excessive Events**: Component lifecycle and scroll tracking create noise
3. **No Batching**: Events are sent immediately, causing performance issues
4. **Redundant Storage**: Analytics data stored in both systems
5. **Missing Optimization**: PostHog lacks performance configuration

## Optimization Strategy

### 1. Separate Concerns

- **PostHog**: General analytics, user behavior, conversion tracking
- **Convex**: Business-specific analytics that need real-time updates

### 2. Event Reduction

**Remove these noisy events:**
- Component mount/unmount tracking
- Scroll depth milestones (keep only final depth)
- Hover events
- Excessive page view tracking

**Keep only critical events:**
- Authentication completions
- Business claims and views (throttled)
- Lead submissions
- Revenue events
- Search actions

### 3. Performance Optimizations

**PostHog Configuration:**
```javascript
{
  batch_size: 20,              // Batch 20 events before sending
  batch_interval_ms: 5000,     // Send every 5 seconds
  autocapture: false,          // Disable automatic capture
  disable_session_recording: true, // Unless needed
  capture_pageview: true,      // Let PostHog handle this
}
```

## Migration Steps

### Step 1: Update Environment Variables

Ensure your `.env` file has:
```env
VITE_PUBLIC_POSTHOG_KEY=your_key_here
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Step 2: Replace Analytics Service

1. Keep the current `analytics.ts` as backup
2. Use the new `analytics-optimized.ts` service
3. Import from the optimized service in your components

### Step 3: Update Hooks

Replace usage of `useAnalytics` and `useAnalyticsTracking` with:

```typescript
// For general analytics
import { useOptimizedAnalytics } from '~/hooks/useOptimizedAnalytics';

// For business-specific tracking
import { useBusinessAnalytics } from '~/hooks/useOptimizedAnalytics';

// For subscription tracking
import { useSubscriptionAnalytics } from '~/hooks/useOptimizedAnalytics';
```

### Step 4: Update Component Usage

#### Before:
```typescript
const { track } = useAnalytics();
const { trackPageView } = useAnalyticsTracking();

// Noisy tracking
track('component_mounted', { component_name: 'Header' });
track('element_hovered', { element: 'button' });
trackPageView(businessId);
```

#### After:
```typescript
const { trackCritical } = useOptimizedAnalytics();
const { trackPhoneClick } = useBusinessAnalytics(businessId);

// Only critical events
trackCritical('BUSINESS_VIEWED', { business_id: businessId });
trackPhoneClick(phoneNumber);
```

### Step 5: Update Business Profile Components

In your business profile components:

```typescript
// Replace this:
const { trackPageView, trackPhoneClick } = useAnalyticsTracking();

// With this:
const analytics = useBusinessAnalytics(businessId);
```

### Step 6: Clean Up Convex Analytics

Consider removing these from Convex analytics:
- General page views (let PostHog handle)
- User behavior events
- Performance metrics

Keep in Convex only:
- Business-specific interactions
- Lead data
- Real-time metrics that affect UI

### Step 7: Monitor Performance

After migration:
1. Check PostHog dashboard for event volume reduction
2. Monitor Convex function execution count
3. Verify critical events are still tracked

## Best Practices

### 1. Event Naming
Use consistent, descriptive event names:
```typescript
// Good
'subscription_checkout_completed'
'business_lead_submitted'

// Bad
'clicked_button'
'user_action'
```

### 2. Property Minimization
Only send necessary properties:
```typescript
// Good
trackCritical('BUSINESS_VIEWED', {
  business_id: id,
  plan_tier: tier,
});

// Bad
trackCritical('BUSINESS_VIEWED', {
  ...entireBusinessObject,
  timestamp: Date.now(), // PostHog adds this
  userAgent: navigator.userAgent, // PostHog captures this
});
```

### 3. Throttling
Use throttling for frequent events:
```typescript
// Business views throttled to once per 30 seconds
const { trackBusinessEvent } = useBusinessAnalytics(businessId);
```

### 4. Batching
Use debounced tracking for non-critical events:
```typescript
const { trackDebounced } = useOptimizedAnalytics();
trackDebounced('filter_applied', { filter: 'category' });
```

## Performance Metrics

Expected improvements after optimization:
- **Event Volume**: 70-80% reduction
- **Convex Function Calls**: 60% reduction for analytics
- **Page Load Time**: 200-500ms improvement
- **Network Requests**: 50% reduction

## Troubleshooting

### Events Not Appearing in PostHog
1. Check browser console for errors
2. Verify PostHog key is correct
3. Check if events are being filtered by `before_send`
4. Look for events in PostHog's live events view

### Convex Still Overloaded
1. Ensure you're not duplicating events
2. Check for loops in event tracking
3. Verify throttling is working
4. Consider increasing throttle delays

### Missing Critical Events
1. Review the `CRITICAL_EVENTS` constant
2. Ensure proper hook usage
3. Check if events are being batched too long
4. Verify user identification is working

## Rollback Plan

If issues arise:
1. Keep original files as `.backup`
2. Revert to original imports
3. Clear browser storage to reset throttling
4. Monitor for 24 hours before re-attempting

## Next Steps

1. Implement changes in development first
2. Test all critical user flows
3. Monitor metrics for 48 hours
4. Deploy to production with feature flag
5. Gradually roll out to all users

## Additional Resources

- [PostHog Performance Guide](https://posthog.com/docs/libraries/js#performance)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)
- [Web Vitals Optimization](https://web.dev/vitals/)