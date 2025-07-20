# Database Schema Documentation

## AZ Business Services - Multi-Source Data Architecture

This document describes the database schema for the Arizona Business Directory platform, with particular focus on the multi-source data architecture that intelligently handles business information from Google My Business API, admin imports, and manual user entry.

---

## Core Design Principles

### 1. Single Source of Truth
- Main tables (`businesses`, `reviews`, etc.) contain the current "active" data
- No redundant storage of the same information across multiple tables
- Clear data lineage tracking without database bloat

### 2. Source-Aware Data Management
- Every piece of data tracks its origin (GMB API, admin import, manual entry, system generated)
- Priority-based resolution when multiple sources provide conflicting information
- Field-level source preferences and locking capabilities

### 3. Audit Trail & Data Provenance
- Complete history of all data changes and their sources
- Import batch tracking for bulk operations
- Conflict resolution logging

---

## Database Tables

### Core Business Tables

#### `businesses`
The primary business listing table with source tracking.

```typescript
{
  _id: Id<"businesses">,
  _creationTime: number,
  
  // Core business information
  name: string,
  slug: string,
  urlPath: string,
  description?: string,
  phone?: string,
  email?: string,
  website?: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  coordinates: { lat: number, lng: number },
  
  // Classification
  categoryId: Id<"categories">,
  subcategory?: string,
  services: string[],
  
  // Ratings & Reviews
  rating: number,
  reviewCount: number,
  
  // Business Status
  active: boolean,
  claimed: boolean,
  verified: boolean,
  featured: boolean,
  
  // Plan & Subscription
  planTier: "free" | "pro" | "power",
  claimedByUserId?: Id<"users">,
  subscriptionId?: string,
  
  // Data Source Tracking - NEW
  dataSource: {
    primary: "gmb_api" | "admin_import" | "user_manual" | "system",
    lastSyncedAt?: number,
    syncStatus?: "synced" | "pending" | "failed",
    gmbLocationId?: string,
  },
  
  // Metadata
  createdAt: number,
  updatedAt: number,
  viewCount: number,
  
  // SEO
  metaTitle?: string,
  metaDescription?: string,
  
  // Social Media
  socialMedia?: {
    facebook?: string,
    instagram?: string,
    twitter?: string,
    linkedin?: string,
  },
  
  // Business Hours
  hours?: {
    monday?: { open: string, close: string, closed?: boolean },
    tuesday?: { open: string, close: string, closed?: boolean },
    wednesday?: { open: string, close: string, closed?: boolean },
    thursday?: { open: string, close: string, closed?: boolean },
    friday?: { open: string, close: string, closed?: boolean },
    saturday?: { open: string, close: string, closed?: boolean },
    sunday?: { open: string, close: string, closed?: boolean },
  },
  
  // Images
  images?: string[],
  logoUrl?: string,
  
  // Additional Features
  badges?: string[],
  specialOffers?: string[],
  certifications?: string[],
}
```

#### `reviews` - Enhanced with Source Tracking
Customer reviews with multi-source support and AI sentiment analysis.

```typescript
{
  _id: Id<"reviews">,
  _creationTime: number,
  
  businessId: Id<"businesses">,
  reviewId: string, // External review ID for deduplication
  
  // Review Content
  userName: string,
  authorPhotoUrl?: string,
  rating: number,
  comment: string,
  
  // Review Metadata
  verified: boolean,
  helpful: number,
  flagged?: boolean,
  
  // Source Tracking - ENHANCED
  source: "gmb_api" | "gmb_import" | "facebook" | "yelp" | "direct",
  originalCreateTime?: string, // For GMB reviews
  originalUpdateTime?: string, // For GMB reviews
  syncedAt?: number, // When synced from external source
  importBatchId?: Id<"importBatches">,
  
  // AI Enhancement (Power tier)
  sentiment?: {
    score: number, // -1 to 1
    magnitude: number, // 0 to 1
    classification: "positive" | "neutral" | "negative",
  },
  keywords?: string[],
  topics?: string[],
  
  // Business Response
  reply?: {
    text: string,
    createdAt: number,
  },
  
  // Timestamps
  createdAt: number,
  updatedAt?: number,
}
```

### Multi-Source Data Management Tables

#### `businessDataSources` - NEW
Tracks all data values from different sources for each business field.

```typescript
{
  _id: Id<"businessDataSources">,
  _creationTime: number,
  
  businessId: Id<"businesses">,
  fieldName: string, // "name", "phone", "address", etc.
  
  // Source Information
  source: "gmb_api" | "admin_import" | "user_manual" | "system",
  value: any, // The actual field value from this source
  
  // Data Quality
  confidence?: number, // 0-100, quality/confidence score
  verified: boolean,
  
  // Field Management
  isActive: boolean, // Is this the currently used value?
  locked?: boolean, // Prevent automatic updates
  preferredSource?: string, // Override automatic priority
  
  // Metadata
  createdAt: number,
  updatedAt: number,
  syncedAt?: number, // For external sources
  importBatchId?: Id<"importBatches">,
  
  // Additional context
  metadata?: {
    gmbLocationId?: string,
    importSource?: string,
    editedByUserId?: Id<"users">,
    automaticUpdate?: boolean,
  },
}
```

#### `importBatches` - NEW
Tracks bulk import operations and their results.

```typescript
{
  _id: Id<"importBatches">,
  _creationTime: number,
  
  // Import Information
  importType: "csv_import" | "gmb_sync" | "gmb_review_sync" | "facebook_import",
  importedBy: Id<"users">,
  importedAt: number,
  
  // Status Tracking
  status: "pending" | "processing" | "completed" | "failed",
  
  // Statistics
  businessCount: number,
  reviewCount: number,
  
  // Source Information
  source: "gmb_api" | "admin_import" | "csv_file" | "external_api",
  sourceMetadata?: {
    filename?: string,
    gmbAccountId?: string,
    businessId?: Id<"businesses">,
    gmbLocationId?: string,
  },
  
  // Results
  results?: {
    created: number,
    updated: number,
    failed: number,
    duplicates: number,
  },
  
  // Error Handling
  errors?: string[],
  
  // Timestamps
  createdAt: number,
  completedAt?: number,
}
```

### Enhanced Business Content

#### `businessContent` - Enhanced with AI Features
AI-generated and enhanced content for business listings.

```typescript
{
  _id: Id<"businessContent">,
  _creationTime: number,
  
  businessId: Id<"businesses">,
  
  // AI-Enhanced Content
  customSummary?: string, // AI-generated or user-edited summary
  aiGeneratedSummary?: string, // Original AI version
  summaryTone?: "professional" | "friendly" | "confident" | "local" | "premium",
  
  // Enhanced Services (Pro/Power)
  serviceCards?: Array<{
    name: string,
    description: string,
    pricing?: string,
    icon?: string,
    aiGenerated?: boolean,
  }>,
  
  // SEO Enhancement (Power)
  seoAudit?: {
    score: number,
    lastAuditAt: number,
    recommendations: Array<{
      category: "meta" | "content" | "technical" | "local" | "mobile" | "performance",
      priority: "high" | "medium" | "low",
      issue: string,
      recommendation: string,
      implemented?: boolean,
    }>,
    keywords: Array<{
      keyword: string,
      difficulty: number,
      volume: number,
      ranking?: number,
    }>,
  },
  
  // Review Intelligence (Power)
  reviewAnalysis?: {
    sentiment: {
      positive: number,
      neutral: number,
      negative: number,
    },
    keywords: string[],
    highlights: string[],
    trends: Array<{
      period: string,
      sentiment: number,
      volume: number,
    }>,
    lastAnalyzedAt: number,
  },
  
  // Social Media Content (Power)
  socialContent?: {
    facebook?: string,
    instagram?: string,
    linkedin?: string,
    twitter?: string,
    generatedAt: number,
  },
  
  // Competitive Intelligence (Power)
  competitorAnalysis?: {
    competitors: Array<{
      name: string,
      rating: number,
      reviewCount: number,
      strengths: string[],
      weaknesses: string[],
    }>,
    positioning: string,
    opportunities: string[],
    lastAnalyzedAt: number,
  },
  
  // Timestamps
  createdAt: number,
  updatedAt: number,
}
```

---

## Data Source Priority System

### Automatic Priority Resolution
When multiple sources provide conflicting data, the system uses this priority order:

1. **GMB API (Live)** - `gmb_api`
   - Highest priority - real-time data
   - Automatically synced from Google My Business
   - Updates business ratings, reviews, hours, photos

2. **Admin Import** - `admin_import`
   - Verified data from admin bulk imports
   - CSV imports, manual data entry by admins
   - Quality-controlled and verified

3. **Manual Entry** - `user_manual`
   - User-entered information
   - Business owner edits and updates
   - Can be locked to prevent overwrites

4. **System Generated** - `system`
   - Default or calculated values
   - AI-generated content
   - Fallback data

### Override Mechanisms

#### Field Locking
- Users can "lock" specific fields to prevent automatic updates
- Locked fields maintain their current value regardless of new data
- Useful for custom descriptions, special hours, etc.

#### Preferred Source
- Override automatic priority for specific fields
- Example: Use manual address even if GMB provides different address
- Granular control over data source preferences

---

## GMB Integration Architecture

### Authentication Flow
1. Business owner initiates GMB connection via OAuth
2. System stores access tokens and refresh tokens
3. Periodic sync maintains data freshness
4. Rate limiting prevents API abuse

### Review Sync Process
```typescript
// 1. User initiates sync
syncBusinessReviews({ businessId, forceSync?: boolean })

// 2. System checks permissions and rate limits
// 3. Creates import batch record
// 4. Schedules background sync job

// 5. Background job fetches GMB reviews
syncGMBReviewsInternal({
  batchId,
  businessId,
  reviews: GMBReview[],
  totalReviewCount,
  averageRating,
})

// 6. System processes reviews:
//    - Deduplicates using reviewId
//    - Updates existing reviews
//    - Creates new reviews
//    - Updates business rating stats
//    - Marks sync as completed
```

### Data Sync Rules
- **Deduplication**: Uses external `reviewId` to prevent duplicates
- **Conflict Resolution**: GMB data overwrites existing data from lower priority sources
- **Incremental Updates**: Only syncs changed data to minimize API calls
- **Error Handling**: Failed syncs are logged and can be retried

---

## API Functions

### Review Management
```typescript
// Get reviews with filtering
getBusinessReviews({
  businessId: Id<"businesses">,
  limit?: number,
  source?: string,
  minRating?: number,
  maxRating?: number,
})

// Get review analytics
getReviewAnalytics({
  businessId: Id<"businesses">,
  timeframe?: "30d" | "90d" | "1y" | "all",
})

// Get sync status
getSyncStatus({
  businessId: Id<"businesses">,
})
```

### Data Source Management
```typescript
// Update field source preference
updateFieldSource(fieldName: string, source: string)

// Lock/unlock field from automatic updates
toggleFieldLock(fieldName: string, locked: boolean)

// Set preferred source for field
setPreferredSource(fieldName: string, source: string)
```

---

## Performance Considerations

### Indexing Strategy
- `businesses.dataSource.gmbLocationId` - Fast GMB lookups
- `reviews.businessId` - Efficient business review queries
- `reviews.reviewId` - Deduplication queries
- `businessDataSources.businessId + fieldName` - Field source queries
- `importBatches.importType + status` - Batch processing queries

### Caching
- Business listings cached for 1 hour
- Review analytics cached for 30 minutes
- Sync status cached for 5 minutes
- Data source preferences cached in browser

### Rate Limiting
- GMB API: 1 sync per hour per business (unless forced)
- Review API calls: Throttled to prevent quota exhaustion
- Import batches: Max 1 concurrent import per user

---

## Security & Privacy

### Data Protection
- All external API tokens encrypted at rest
- User data anonymized in analytics
- GDPR-compliant data deletion procedures

### Access Control
- Role-based permissions (user, admin, super_admin)
- Business owners can only modify their claimed listings
- Admins can override any data source
- Audit trail tracks all data modifications

### API Security
- All mutations require authentication
- Business ownership verified before sync operations
- Rate limiting prevents abuse
- Input validation on all external data

---

## Migration Guide

### Upgrading from Single-Source to Multi-Source

1. **Backup existing data**
2. **Run schema migration** to add new fields
3. **Backfill source tracking** for existing records
4. **Update application code** to use new APIs
5. **Test data source resolution** logic
6. **Deploy UI updates** for source management

### Data Migration Script
```typescript
// Set all existing businesses to "admin_import" source
// Create businessDataSources records for existing data
// Update review sources based on existing metadata
// Validate data integrity post-migration
```

---

This multi-source architecture provides the foundation for:
- ✅ Intelligent data management without redundancy
- ✅ Complete audit trail and data provenance
- ✅ Flexible source prioritization and user control
- ✅ Seamless GMB integration with real-time sync
- ✅ Scalable import/export capabilities
- ✅ Professional-grade data quality management

The system handles the complexity of multiple data sources while presenting a clean, unified interface to end users and maintaining data consistency across the platform.