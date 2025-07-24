# Batch Processing Guide for AI Analysis & Rankings

## Overview

This guide explains how to process ALL businesses in your database for AI analysis and ranking, avoiding Convex's memory and scheduling limits.

## The Solution: Batched Processing

The `process-all-batched` script processes businesses in manageable batches to:
- Avoid Convex's 16MB memory limit
- Prevent hitting the 1000 scheduled function limit
- Provide progress tracking and resumability
- Handle failures gracefully with retries

## Quick Start

Process all businesses with default settings:
```bash
npm run process-all-batched
```

## Command Options

```bash
npm run process-all-batched -- [options]

Options:
  --force           Re-analyze even recently analyzed businesses
  --days <n>        Days threshold for skipping (default: 7)
  --dry-run         Show what would be processed without running
  --start-batch <n> Start from specific batch number (for resuming)
  --max-batches <n> Limit number of batches to process
  --help            Show help message
```

## Examples

### Preview what will be processed (dry run)
```bash
npm run process-all-batched -- --dry-run
```

### Force re-analysis of all businesses
```bash
npm run process-all-batched -- --force
```

### Resume from batch 5 after interruption
```bash
npm run process-all-batched -- --start-batch 5
```

### Process only 10 batches (for testing)
```bash
npm run process-all-batched -- --max-batches 10
```

### Re-analyze businesses older than 3 days
```bash
npm run process-all-batched -- --days 3
```

## How It Works

### 1. Business Fetching
- Fetches ALL businesses with reviews using pagination
- Sorts by review count (processes businesses with more reviews first)
- Filters out businesses without reviews

### 2. Batch Processing
- Default batch size: 100 businesses
- Each business is analyzed with the Internal Analyzer
- 2-second delay between businesses
- 30-second pause between batches
- Automatic retry on failures (up to 3 attempts)

### 3. Progress Tracking
- Shows current batch number and total batches
- Displays processed/total businesses count
- Estimates time remaining based on current pace
- Logs all activity to `logs/ai-analysis/`

### 4. Ranking Calculation
- After all businesses are analyzed, triggers ranking calculation
- Rankings are also processed in batches to avoid limits
- Uses cursor-based pagination for efficiency

## Monitoring Progress

While the batch processor is running, you can monitor progress in another terminal:

```bash
# Live monitoring dashboard
npm run monitor-live

# Or view the analysis dashboard
npm run dashboard
```

## Handling Interruptions

If the process is interrupted:

1. Check the last completed batch number from the console output
2. Resume from the next batch:
   ```bash
   npm run process-all-batched -- --start-batch [next_batch_number]
   ```

## Performance Expectations

- **Processing Speed**: ~30-60 businesses per minute
- **Memory Usage**: Stays well under Convex limits
- **Total Time**: Depends on total businesses
  - 1,000 businesses: ~30-60 minutes
  - 5,000 businesses: ~2.5-5 hours
  - 10,000 businesses: ~5-10 hours

## Best Practices

1. **Run during off-peak hours** to minimize impact on other operations
2. **Monitor the first few batches** to ensure everything is working
3. **Keep the Convex backend running** (`npx convex dev`) during processing
4. **Check logs** in `logs/ai-analysis/` for detailed information
5. **Use dry-run first** to preview what will be processed

## Troubleshooting

### "Too many reads" error
- Reduce batch size by modifying `BATCH_SIZE` in the script
- Increase pause between batches

### "Too many scheduled functions" warning
- The script handles this automatically by spacing out function scheduling
- If issues persist, increase delays in the script

### Process seems stuck
- Check if Convex backend is still running
- Look for errors in the console
- Review logs in `logs/ai-analysis/`
- Resume from the last completed batch

## Architecture Details

### Batch Processing Flow
```
1. Fetch all businesses with reviews (paginated)
2. Sort by review count (descending)
3. Divide into batches of 100
4. For each batch:
   - Process each business
   - Retry failures up to 3 times
   - Track progress
   - Pause 30 seconds
5. Trigger ranking calculation
6. Process rankings in batches
```

### Memory Optimization
- Uses cursor-based pagination
- Processes data in chunks
- Clears intermediate results
- Caches only essential data

### Error Handling
- Automatic retries with exponential backoff
- Detailed error logging
- Graceful degradation
- Resume capability

## Next Steps

After running the batch processor:

1. **Verify Rankings**: Check that businesses appear in rankings on your website
2. **Monitor Performance**: Use the dashboard to track ongoing analysis
3. **Set Up Automation**: Consider scheduling regular batch runs
4. **Optimize Further**: Adjust batch sizes and delays based on your needs