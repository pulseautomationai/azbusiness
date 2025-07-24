# Overnight Review Import System Guide

A comprehensive system for systematically importing Google Reviews using the GEOscraper API with a 3-connection concurrency limit. This system is designed for overnight operations and can handle large-scale imports efficiently.

## 🏗️ System Architecture

### Components Created

1. **Scheduler** (`scripts/schedule-review-import.ts`)
   - Analyzes businesses that need review imports
   - Adds them to the processing queue in batches
   - Respects priority and filtering options

2. **Queue Processor** (`scripts/process-review-queue.ts`)
   - Maintains exactly 3 concurrent GEOscraper connections
   - Handles automatic retry logic and error recovery
   - Designed for overnight unattended operation

3. **Monitor** (`scripts/monitor-review-queue.ts`)
   - Real-time dashboard showing queue status
   - Processing metrics and success rates
   - ETA calculations and error reporting

4. **Queue Management** (`convex/geoScraperQueue.ts`)
   - Database-backed queue system
   - Priority handling and retry logic
   - Automatic cleanup of stuck items

## 📋 npm Scripts Added

```bash
# Schedule businesses for review import
npm run schedule-reviews                    # Schedule up to 1000 businesses
npm run schedule-reviews -- --limit 100    # Limit to 100 businesses  
npm run schedule-reviews -- --priority high --dry-run  # High priority dry run
npm run schedule-reviews -- --all          # Include businesses that already have reviews

# Process the queue (for overnight operation)
npm run process-queue                       # Run continuously
npm run process-queue -- --verbose         # With detailed logging
npm run process-queue -- --max-cycles 100  # Limited run

# Monitor progress in real-time
npm run monitor-queue                       # Monitor with 5-second updates
npm run monitor-queue -- --interval 10     # Update every 10 seconds
npm run monitor-queue -- --compact         # Compact display mode
```

## 🚀 Step-by-Step Setup Guide

### Step 1: Verify GEOscraper Configuration

Make sure your GEOscraper API token is set:

```bash
# Check if token is configured
grep GEOSCRAPER_API_TOKEN .env.local

# If not set, add it:
echo "GEOSCRAPER_API_TOKEN=your_token_here" >> .env.local
```

### Step 2: Test the Connection

Before running large imports, test a few businesses:

```bash
# Test with a small sample first
npm run schedule-reviews -- --limit 5 --dry-run

# If dry run looks good, schedule them for real
npm run schedule-reviews -- --limit 5

# Monitor the test run
npm run monitor-queue
```

### Step 3: Schedule Overnight Import

For a full overnight import:

```bash
# Schedule all businesses that need reviews (dry run first)
npm run schedule-reviews -- --dry-run

# If satisfied with the plan, execute it
npm run schedule-reviews

# Check queue status
npx convex run geoScraperQueue:getQueueStatus
```

### Step 4: Start Overnight Processing

The queue will process automatically via cron jobs, but you can also run manually:

```bash
# Start the processor (runs until queue is empty)
npm run process-queue -- --verbose

# Or run in background (recommended for overnight)
nohup npm run process-queue -- --verbose > review-import.log 2>&1 &
```

### Step 5: Monitor Progress

In a separate terminal, monitor the progress:

```bash
# Real-time monitoring dashboard
npm run monitor-queue

# Or check queue status periodically
npx convex run geoScraperQueue:getQueueStatus
```

## ⚙️ Configuration Options

### Scheduler Options

```bash
--limit <number>     # Limit number of businesses (default: 1000)
--priority <level>   # high(8), medium(5), low(3) (default: 5)
--batch-size <num>   # Batch processing size (default: 50)
--dry-run           # Show what would be scheduled
--all               # Include businesses that already have reviews
--monitor           # Start monitoring after scheduling
```

### Processor Options

```bash
--max-cycles <number>    # Maximum processing cycles
--verbose               # Detailed logging
--check-interval <ms>   # Queue check interval (default: 5000ms)
```

### Monitor Options

```bash
--interval <seconds>    # Update interval (default: 5)
--compact              # Compact display mode
--history              # Show processing history
```

## 📊 Expected Performance

### Capacity Estimates

- **3 concurrent connections** = ~6 businesses per minute
- **360 businesses per hour** (conservative estimate)
- **8,640 businesses in 24 hours** (theoretical maximum)

### Realistic Overnight Processing

Assuming 8-hour overnight window:
- **~2,880 businesses** can be processed
- **Average 50-100 reviews per business**
- **~150,000-290,000 total reviews** imported

## 🔍 Monitoring and Troubleshooting

### Queue Status Check

```bash
# Quick status check
npx convex run geoScraperQueue:getQueueStatus

# Detailed metrics
npx convex run geoScraperMetrics:getMetricsSummary
```

### Common Issues and Solutions

1. **Stuck Items in Queue**
   ```bash
   # Clear stuck items manually
   npx convex run geoScraperQueue:clearStuckItems
   ```

2. **Rate Limiting**
   - System automatically handles rate limits with exponential backoff
   - Check error metrics for rate limit frequency

3. **Memory Issues**
   - Processor automatically batches large operations
   - Monitor system resources during processing

4. **API Errors**
   - Check GEOscraper API token validity
   - Review error logs for specific Place ID issues

### Log Monitoring

```bash
# Follow processing logs (if running in background)
tail -f review-import.log

# Check for errors
grep "❌" review-import.log

# Success rate
grep "✅" review-import.log | wc -l
```

## 🛡️ Safety Features

### Built-in Protections

1. **Connection Limits**: Strict 3-connection limit prevents API overload
2. **Retry Logic**: Automatic retry with exponential backoff
3. **Duplicate Prevention**: Queue system prevents duplicate processing
4. **Error Recovery**: Failed items are retried up to 3 times
5. **Graceful Shutdown**: Ctrl+C stops processing gracefully
6. **Stuck Item Cleanup**: Automatic cleanup every 15 minutes via cron

### Manual Safety Controls

```bash
# Emergency queue pause (set negative priority to pause all)
npx convex run geoScraperQueue:markAsFailed '{"queueId": "item_id", "error": "Manual pause"}'

# Cancel specific items
npx convex run geoScraperQueue:markAsFailed '{"queueId": "item_id", "error": "Cancelled"}'

# Clear all stuck items
npx convex run geoScraperQueue:clearStuckItems
```

## 📈 Success Metrics

### Key Performance Indicators

- **Success Rate**: Target >90% (typical: 95%+)
- **Processing Speed**: 6 businesses/minute sustained
- **Review Yield**: 50-100 reviews per business average
- **API Error Rate**: <5% of requests
- **Queue Efficiency**: <2% stuck items

### Daily Review Goals

- **New Businesses**: ~500-1000 businesses/night
- **Review Volume**: ~50,000-100,000 reviews/night
- **Coverage**: Process entire backlog in 5-10 nights

## 🔄 Automated Operations

### Cron Jobs (Already Configured)

```typescript
// Daily review sync at 2 AM MST
crons.daily("daily-review-sync", { hourUTC: 9, minuteUTC: 0 }, api.reviewSync.dailyReviewSync);

// Clear stuck items every 15 minutes  
crons.interval("clear-stuck-queue-items", { minutes: 15 }, api.geoScraperQueue.clearStuckItems);

// Cleanup old metrics hourly
crons.hourly("cleanup-old-metrics", { minuteUTC: 30 }, api.geoScraperMetrics.cleanupOldMetrics);
```

## 🎯 Usage Examples

### Quick Test Run

```bash
# Test 5 businesses with monitoring
npm run schedule-reviews -- --limit 5
npm run monitor-queue -- --interval 3
```

### Production Overnight Run

```bash
# 1. Schedule all businesses needing reviews
npm run schedule-reviews

# 2. Start processor in background
nohup npm run process-queue -- --verbose > /tmp/review-import-$(date +%Y%m%d).log 2>&1 &

# 3. Monitor in separate terminal
npm run monitor-queue

# 4. Check progress in the morning
tail /tmp/review-import-$(date +%Y%m%d).log
```

### Selective Processing

```bash
# High-priority businesses only
npm run schedule-reviews -- --limit 100 --priority high

# All businesses (including those with existing reviews)
npm run schedule-reviews -- --all --priority 8
```

This system provides a robust, monitored, and safe way to import large volumes of Google Reviews overnight while respecting API limits and providing comprehensive visibility into the process.