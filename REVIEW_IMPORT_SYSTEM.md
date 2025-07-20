# CSV Review Import System

## Overview

The CSV Review Import System allows you to import customer reviews from various sources (Google My Business, Yelp, Facebook) using the same robust CSV upload workflow you currently have for businesses.

## Quick Start

```bash
# Import a single review CSV file
npm run import-reviews reviews.csv

# Import all review CSV files in data/imports/
npm run import-all-reviews

# View import statistics and validation
npm run validate-import
```

## Supported CSV Formats

### Google My Business Reviews
```csv
Business_Name,Review_ID,Rating,Review_Text,Reviewer_Name,Created_Date,Owner_Reply
"ABC Plumbing",review_123,5,"Excellent service!","John Smith","2024-01-15","Thank you!"
```

### Yelp Reviews
```csv
business_name,review_id,stars,text,user_name,date
"ABC Plumbing",yelp_456,5,"Great work!","Jane Doe","2024-01-10"
```

### Facebook Reviews
```csv
page_name,review_id,rating,review_text,reviewer_name,created_time,page_reply
"ABC Plumbing",fb_789,5,"Highly recommend","Mike Johnson","2024-01-12","Thanks!"
```

### Generic Format
```csv
Business Name,Review ID,Rating,Review,Reviewer,Date
"ABC Plumbing",gen_101,5,"Professional service","Sarah Wilson","2024-01-08"
```

## Key Features

### 🎯 **Intelligent Business Matching**
- **Exact Match**: Business name + phone number (95% confidence)
- **Fuzzy Match**: Business name similarity (85%+ confidence)
- **Address Match**: Street address matching (80% confidence)
- **Manual Match**: Direct business ID in CSV (100% confidence)

### 📊 **Tier-Based Import Limits**
- **Free**: 15 reviews per business
- **Starter**: 25 reviews per business
- **Pro**: 40 reviews per business
- **Power**: 100 reviews per business

### 🔍 **Smart Deduplication**
- Review ID matching across sources
- Content similarity detection (90%+ similarity)
- Same reviewer + business combination detection
- Cross-platform review identification

### 🤖 **AI Integration Ready**
- Automatic sentiment analysis on import
- Performance mention extraction (speed, value, quality, reliability)
- Review quality scoring
- Keyword extraction and classification

### 📈 **Multi-Source Support**
- Google My Business (scraped data)
- Yelp reviews
- Facebook reviews
- Direct platform reviews
- Manual review entry

## File Structure

```
scripts/
├── review-importer.ts          # Main review import script
└── csv-importer.ts            # Business import script (existing)

config/
└── field-mappings.ts          # Extended with review field mappings

convex/
├── reviewImport.ts            # Review import functions
├── batchImport.ts            # Batch tracking (existing)
└── schema.ts                 # Database schema (existing)
```

## Data Processing Pipeline

1. **CSV Detection**: Auto-detect review vs business CSV
2. **Field Mapping**: Map CSV headers to database fields
3. **Business Matching**: Find corresponding businesses in database
4. **Tier Validation**: Check review limits for business plan tier
5. **Deduplication**: Prevent duplicate reviews across sources
6. **AI Processing**: Extract sentiment and performance mentions
7. **Database Import**: Batch import with full audit trail

## Business Matching Examples

```typescript
// Strategy 1: Exact match (highest confidence)
Business Name: "ABC Plumbing LLC"
Phone: "(480) 555-0123"
→ Matches existing business with same name/phone

// Strategy 2: Fuzzy match (good confidence)
CSV: "ABC Plumbing Service"
DB:  "ABC Plumbing LLC"
→ 87% similarity match

// Strategy 3: Address match (medium confidence)
CSV Address: "123 Main St, Phoenix"
DB Address:  "123 Main Street, Phoenix, AZ"
→ Address pattern match

// Strategy 4: Manual match (perfect confidence)
CSV includes: business_id = "j57abc123def456"
→ Direct database ID reference
```

## Error Handling & Validation

### Pre-Import Validation
- ✅ Required fields present (business name, rating, comment, reviewer)
- ✅ Rating normalization (1-5 scale)
- ✅ Business matching confidence scoring
- ✅ Tier limit checking

### Import Process
- ✅ Batch processing with progress tracking
- ✅ Error collection and reporting
- ✅ Rollback capability on batch failures
- ✅ Detailed import statistics

### Post-Import
- ✅ Business review count updates
- ✅ Average rating recalculation
- ✅ AI sentiment analysis processing
- ✅ Performance metric extraction

## Usage Examples

### Basic Import
```bash
# Place your CSV in data/imports/
cp google-reviews.csv data/imports/

# Import the reviews
npm run import-reviews google-reviews.csv
```

### Bulk Import
```bash
# Place multiple review files in data/imports/
cp *.csv data/imports/

# Import all review files
npm run import-all-reviews
```

### Validation
```bash
# Check import results and data quality
npm run validate-import
```

## Advanced Features

### Business Review Statistics
- Automatic review count updates
- Average rating recalculation
- Review source tracking
- Historical review trends

### AI Enhancement
- Sentiment classification (positive/neutral/negative)
- Performance factor extraction
- Keyword identification
- Review quality scoring

### Admin Integration
- Import batch tracking
- Error reporting and resolution
- Business-to-review mapping verification
- Cross-source duplicate detection

## Integration with Existing System

The review import system seamlessly integrates with your existing infrastructure:

- ✅ **Uses same CSV processor** as business imports
- ✅ **Follows same batch tracking** patterns
- ✅ **Integrates with validation system** 
- ✅ **Works with admin dashboard**
- ✅ **Supports same error handling**
- ✅ **Uses existing AI ranking data**

## Benefits

### For Business Growth
- 🎯 **Targeted Review Collection**: Identify businesses needing more reviews
- 📊 **Data-Driven Insights**: Understand review patterns and sentiment
- 🔄 **Multi-Source Aggregation**: Centralize reviews from all platforms
- 📈 **Performance Tracking**: Monitor review quality and business impact

### For Platform Value
- 🤖 **AI-Powered Analytics**: Automatic sentiment and performance analysis
- 🎨 **Rich Dashboard Data**: Comprehensive review insights for business owners
- 🔗 **Cross-Platform Integration**: Unified review management
- 📱 **Scalable Architecture**: Handle thousands of reviews efficiently

## Next Steps

1. **Prepare Review Data**: Export reviews from GMB, Yelp, Facebook
2. **Test Import**: Start with small CSV files to validate process
3. **Scale Up**: Import bulk review data for existing businesses
4. **Monitor Results**: Use validation tools to ensure data quality
5. **AI Analysis**: Leverage imported reviews for ranking improvements

The system is now ready for production use and will provide the substantial review datasets needed to make your AI ranking system more accurate and valuable for business owners.