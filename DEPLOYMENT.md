# Deployment Guide

## Environment Variables

The following environment variables must be set for production deployment:

### Required Environment Variables

#### Authentication & Services
- `CLERK_DOMAIN` - Clerk authentication domain
- `CLERK_PUBLISHABLE_KEY` - Clerk public key  
- `CLERK_SECRET_KEY` - Clerk secret key
- `CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment identifier

#### GeoScraper API Integration
- `GEOSCRAPER_API_TOKEN` - **Required** - GeoScraper API token for review scraping
  - Used for automated Google review syncing
  - Supports 3 concurrent connections
  - Required for review import functionality

#### Optional Services
- `VITE_POSTHOG_KEY` - PostHog analytics key (optional)
- `VITE_POSTHOG_HOST` - PostHog host URL (optional)

### Setting Environment Variables

#### Local Development (.env.local)
```bash
# Copy the example file
cp .env.example .env.local

# Add your GeoScraper API token
GEOSCRAPER_API_TOKEN=your_token_here
```

#### Vercel Deployment
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following:
   - `GEOSCRAPER_API_TOKEN` - Your GeoScraper API token
   - All other required environment variables

#### Convex Environment
For Convex-specific environment variables:
```bash
npx convex env set GEOSCRAPER_API_TOKEN your_token_here
```

## Deployment Steps

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Set up Convex
npx convex dev
```

### 2. Configure Environment
- Copy `.env.example` to `.env.local`
- Add all required environment variables
- Ensure `GEOSCRAPER_API_TOKEN` is set

### 3. Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod

# Deploy Convex functions
npx convex deploy
```

### 4. Verify Deployment
- Check that all environment variables are set in production
- Test GeoScraper API connection: `npx convex run geoScraperAPI:testGeoScraperConnection --placeId "ChIJ..."` 
- Monitor metrics: `npx convex run geoScraperMetrics:getMetricsSummary`

## Post-Deployment Tasks

### 1. Initialize Queue Processing
If using automated review syncing:
```bash
# Process pending queue items
npx convex run geoScraperProcessor:processQueue

# Check queue status
npx convex run geoScraperQueue:getQueueStatus
```

### 2. Monitor Performance
- Check API metrics regularly
- Monitor queue depth
- Review error rates

### 3. Set Up Scheduled Jobs (Optional)
Configure cron jobs for automated review syncing (see Phase 2 of REVIEW_API_INTEGRATION.md)

## Troubleshooting

### GeoScraper API Token Issues
- Verify token is set: `echo $GEOSCRAPER_API_TOKEN`
- Test connection: Use the test functions in production
- Check Convex logs for token validation errors

### Queue Processing Issues
- Clear stuck items: `npx convex run geoScraperQueue:clearStuckItems`
- Check metrics: `npx convex run geoScraperMetrics:getCurrentQueueMetrics`
- Review error logs in Convex dashboard

### Performance Issues
- Monitor concurrent connections (max 3)
- Check queue depth trends
- Review average response times in metrics