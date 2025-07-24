# Analytics Real Data Transition Plan

## Current State
All analytics components are using mock data to demonstrate UI functionality. This includes:
- Overview Dashboard (revenue, conversions, activity)
- User Analytics (acquisition, retention, behavior)
- Business Intelligence (AI usage, subscriptions)
- Performance Monitoring (Core Web Vitals, API metrics)

## Data Sources & Integration Points

### 1. PostHog Integration (Partially Complete)
**Status**: Service layer created, but not collecting real events yet

**Required Actions**:
- [ ] Add VITE_POSTHOG_KEY to .env file
- [ ] Enable event tracking throughout the app
- [ ] Configure PostHog dashboard to match our metrics

**Real Data Available**:
- Page views, unique visitors
- User sessions and behavior
- Custom events (signups, claims, subscriptions)
- Conversion funnels
- Device/browser analytics
- Geographic data

### 2. Convex Database (Ready)
**Status**: Already connected and working

**Real Data Available**:
- Total businesses, reviews, users
- Subscription tiers and revenue
- Business claims and verifications
- User registrations

**Integration Needed**:
- [ ] Replace mock data in useRealTimeMetrics hook
- [ ] Update adminAnalytics.ts to calculate more metrics
- [ ] Add real-time activity tracking

### 3. Performance Monitoring
**Required Integrations**:
- [ ] Web Vitals library for Core Web Vitals
- [ ] API middleware for response time tracking
- [ ] Error boundary integration for error tracking
- [ ] Server monitoring (CPU, memory, disk)

### 4. Polar.sh (Billing)
**Required**:
- [ ] Webhook integration for payment events
- [ ] Revenue tracking and MRR calculation
- [ ] Subscription lifecycle events

## Implementation Steps

### Phase 1: Enable PostHog (Immediate)
```bash
# Add to .env
VITE_POSTHOG_KEY=your_posthog_project_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Phase 2: Replace Convex-Based Metrics (1-2 days)
1. Update `useRealTimeMetrics` to use real Convex data
2. Enhance `adminAnalytics.ts` with more calculations
3. Add activity logging to track user actions

### Phase 3: Implement Performance Monitoring (3-5 days)
1. Add web-vitals package: `npm install web-vitals`
2. Create API middleware for timing
3. Set up error tracking
4. Add server monitoring endpoints

### Phase 4: Complete PostHog Integration (1 week)
1. Track all user events
2. Set up conversion funnels
3. Configure dashboards in PostHog
4. Implement PostHog API calls for analytics

### Phase 5: Production Readiness (2 weeks)
1. Remove all mock data
2. Add data validation and error handling
3. Implement caching for performance
4. Set up monitoring and alerts

## Quick Start (What You Can Do Now)

### 1. Enable Basic Real Data from Convex
Replace mock data in components with real queries:

```typescript
// In OverviewDashboard.tsx, replace mock revenue data with:
const revenueData = useQuery(api.analytics.getRevenueHistory);

// In UserAnalytics.tsx, replace mock user data with:
const userMetrics = useQuery(api.analytics.getUserMetrics);
```

### 2. Add PostHog Tracking
The infrastructure is ready, just needs the API key:
1. Sign up for PostHog (free tier available)
2. Add your project API key to .env
3. Events will start flowing automatically

### 3. Create Convex Functions for Analytics
Add these to your Convex backend:
- `analytics.getRevenueHistory`
- `analytics.getUserMetrics`
- `analytics.getActivityFeed`
- `analytics.getPerformanceMetrics`

## Mock Data Locations to Replace

| Component | Mock Data Variable | Replace With |
|-----------|-------------------|--------------|
| OverviewDashboard | revenueData, trafficData, planDistributionData | Convex queries + PostHog API |
| UserAnalytics | acquisitionData, retentionData, behaviorData | PostHog API |
| BusinessIntelligence | aiUsageData, subscriptionData, featureAdoptionData | Convex queries |
| PerformanceMonitoring | webVitalsData, apiResponseData, errorData | Real monitoring tools |

## Timeline Estimate
- **Minimal Real Data**: 1-2 days (just Convex integration)
- **Basic Analytics**: 1 week (Convex + basic PostHog)
- **Full Platform**: 2-3 weeks (all integrations complete)