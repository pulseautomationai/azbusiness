# Convex Query Rules and Limits

## Document Limit: 32,000 documents per function

To avoid "Too many documents read" errors, follow these strict rules:

## 1. ALWAYS Use Limits on Queries
```typescript
// ❌ BAD - No limit
const items = await ctx.db.query("table").collect();

// ✅ GOOD - With limit
const items = await ctx.db.query("table").take(100);
```

## 2. Use Indexes for Filtering
```typescript
// ❌ BAD - Scans entire table
const existing = await ctx.db
  .query("reviewSyncQueue")
  .filter((q) => q.eq(q.field("businessId"), businessId))
  .first();

// ✅ GOOD - Uses index
const existing = await ctx.db
  .query("reviewSyncQueue")
  .withIndex("by_business", (q) => q.eq("businessId", businessId))
  .first();
```

## 3. Batch Processing Rules
- **Maximum batch size**: 100 items
- **Use pagination** for larger operations
- **Process in chunks** with delays
- **Always validate batch size before processing**

## 4. Queue Operations
- **Check existence**: Use indexes, not full table scans
- **Bulk operations**: Process in batches of 50-100
- **Status checks**: Limit to recent items (24-48 hours)
- **Processing count**: Use index with small limit (10-20)

## 5. Metrics and Analytics
- **Time windows**: Process in hourly chunks
- **Aggregation**: Use server-side counting, not client-side
- **Cleanup**: Keep only 7 days of detailed data
- **Rate limiting**: Record only 10% of high-frequency metrics

## 6. Common Patterns

### Checking if item exists in queue:
```typescript
// Use index
const existing = await ctx.db
  .query("reviewSyncQueue")
  .withIndex("by_business_status", (q) => 
    q.eq("businessId", businessId).eq("status", "pending")
  )
  .first();
```

### Bulk adding with existence check:
```typescript
// Process in small batches
const BATCH_SIZE = 50;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  // Process batch
}
```

### Getting queue status:
```typescript
// Limit time range
const recentTime = Date.now() - (24 * 60 * 60 * 1000);
const pending = await ctx.db
  .query("reviewSyncQueue")
  .withIndex("by_status", (q) => q.eq("status", "pending"))
  .filter((q) => q.gte(q.field("requestedAt"), recentTime))
  .take(1000);
```

## 7. Required Indexes

For the patterns above to work efficiently, ensure these indexes exist in your schema:

```typescript
reviewSyncQueue: defineTable({
  // ... fields
})
  .index("by_status", ["status"])
  .index("by_business", ["businessId"])
  .index("by_business_status", ["businessId", "status"])
  .index("by_created", ["_creationTime"])

businesses: defineTable({
  // ... fields  
})
  .index("by_active", ["active"])
  .index("by_place_id", ["placeId"])
  .index("by_sync_status", ["syncStatus"])

geoScraperMetrics: defineTable({
  // ... fields
})
  .index("by_type", ["type"])
  .index("by_timestamp", ["timestamp"])
```

## 8. Error Handling

Always handle document limit errors gracefully:

```typescript
try {
  const result = await ctx.db.query("table").take(1000);
} catch (error) {
  if (error.message.includes("Too many documents")) {
    // Reduce batch size or implement pagination
    console.error("Document limit hit, reducing batch size");
  }
  throw error;
}
```