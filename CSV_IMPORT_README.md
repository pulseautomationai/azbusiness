# CSV Import System - User Guide

## Overview

The CSV Import System allows you to import thousands of businesses from CSV files with automatic category detection and zero token usage. All processing happens locally, and business listing pages are created automatically.

## 🚀 Quick Start

### 1. Prepare Your CSV File
- Save your CSV file in the `/data/imports/` directory
- Any CSV format works - the system auto-detects column names
- Example: `/data/imports/phoenix-businesses.csv`

### 2. Run the Import
```bash
# Navigate to your project directory
cd /Users/john/Dev/Personal/azbusiness

# Start Convex development server (required)
npx convex dev

# In another terminal, run the import
npx tsx scripts/csv-importer.ts data/imports/your-file.csv
```

### 3. Watch the Magic Happen
The system will automatically:
- Parse your CSV file
- Detect business categories
- Filter for Arizona cities only
- Create business records in the database
- Generate SEO-friendly URLs
- Create live business listing pages

## 📊 How It Works

### Automatic Category Detection
The system uses keyword-based detection to categorize businesses into one of 38 service categories:

**Categories Include:**
- HVAC Services (keywords: "hvac", "air conditioning", "heating", "cooling")
- Plumbing Services (keywords: "plumber", "plumbing", "pipe", "drain")
- Electrical Services (keywords: "electrician", "electrical", "wiring")
- Roofing Services (keywords: "roofing", "roof", "shingles")
- And 34 more categories...

### Arizona City Filtering
Only businesses in Arizona cities are imported. The system recognizes 50+ Arizona cities including:
- Phoenix, Scottsdale, Mesa, Tempe, Chandler
- Tucson, Flagstaff, Sedona, Prescott
- Glendale, Peoria, Gilbert, Surprise
- And many more...

### Field Mapping
The system automatically recognizes common CSV column names:

| Data Type | Recognized Column Names |
|-----------|------------------------|
| Business Name | `name`, `business_name`, `company`, `title` |
| Address | `address`, `street`, `location` |
| City | `city`, `town`, `location` |
| Phone | `phone`, `telephone`, `contact` |
| Email | `email`, `contact_email` |
| Website | `website`, `url`, `site` |
| Description | `description`, `about`, `services` |

## 📈 What You Get After Import

### Immediate Results
- ✅ **Live business listing pages** for every imported business
- ✅ **SEO-friendly URLs** like `/hvac-services/phoenix/desert-air-conditioning`
- ✅ **Automatic categorization** into service types
- ✅ **Database records** with all business details
- ✅ **Search functionality** - businesses appear in search results

### Business Page Features
Each imported business gets a complete profile page with:
- 📊 **Business Overview** - Name, description, contact info
- 🏢 **Services Offered** - Extracted from CSV data
- 📍 **Location & Address** - Full address with city/state
- 📞 **Contact Information** - Phone, email, website links
- ⭐ **Rating System** - Ready for customer reviews
- 🕒 **Business Hours** - Default hours (can be updated later)
- 📝 **Claim Listing** - Allows business owners to claim their listing

### URL Structure
New businesses get SEO-optimized URLs:
```
/hvac-services/phoenix/desert-air-conditioning
/plumbing/scottsdale/phoenix-plumbing-pros  
/electrical/mesa/elite-electric-services
/roofing/tempe/arizona-roofing-company
```

## 🔧 Technical Details

### System Architecture
- **Language**: TypeScript/Node.js
- **Database**: Convex (real-time database)
- **Processing**: Local (no external API calls)
- **Performance**: Processes 1000+ businesses in under 5 minutes

### Error Handling
- Invalid data is skipped with detailed error messages
- Duplicate businesses are detected and handled
- Missing required fields are reported
- Process continues even if some rows fail

### Progress Reporting
Real-time progress with detailed statistics:
```
📊 Found 1,247 rows in CSV file
🔍 Processing and detecting categories...
📍 Filtering for Arizona cities only...
✅ Kept 892 businesses (355 filtered out)

📦 Processing batch 1/9 (100 businesses)
✅ HVAC Services: Desert Air → /hvac-services/phoenix/desert-air
✅ Plumbing: Phoenix Plumbing → /plumbing/scottsdale/phoenix-plumbing
...

📋 IMPORT SUMMARY
===============
📊 Total processed: 1,247
✅ Successfully imported: 892
❌ Failed/Skipped: 355
📈 Success rate: 71.5%
🏷️ Categories detected: 23 types
⏱️ Import time: 2.3 minutes
```

## 📝 CSV Format Examples

### Example 1: Basic Business Data
```csv
name,address,city,phone,email,website,description
Desert Air HVAC,123 Main St,Phoenix,(602) 555-0123,info@desertair.com,https://desertair.com,Professional HVAC services
Phoenix Plumbing,456 Oak Ave,Scottsdale,(480) 555-0456,contact@phoenixplumbing.com,https://phoenixplumbing.com,Licensed plumbing contractors
```

### Example 2: Extended Business Data
```csv
business_name,street,town,telephone,contact_email,site,about,services
Elite Electric,789 Pine St,Mesa,(480) 555-0789,info@eliteelectric.com,https://eliteelectric.com,Certified electrical contractors,Electrical repair; Panel upgrades; Lighting
Arizona Roofing,321 Elm St,Tempe,(480) 555-0321,contact@azroofing.com,https://azroofing.com,Quality roofing services,Roof repair; Roof replacement; Inspections
```

## 🎯 Best Practices

### Data Quality
- **Clean your data** before import for best results
- **Include descriptions** to improve category detection
- **Standardize city names** (use "Phoenix" not "Phoenix, AZ")
- **Validate phone numbers** and email addresses

### File Management
- Use descriptive file names: `phoenix-hvac-contractors.csv`
- Keep backup copies of your original CSV files
- Process files in batches if you have very large datasets

### Category Detection Tips
- Include relevant keywords in business names or descriptions
- Use industry-standard terms (e.g., "HVAC" instead of "air conditioning company")
- Review the category mappings in `/config/category-detector.ts` for keyword examples

## 🚨 Important Notes

### Requirements
- **Convex server must be running** (`npx convex dev`)
- **Environment variables** must be configured (`.env` file)
- **Database schema** must be up to date

### Limitations
- Only Arizona businesses are imported
- Category detection requires recognizable keywords
- Duplicate detection is based on business name + city combination
- Large files (10k+ records) may take several minutes to process

### Zero Token Usage
The entire import process runs locally without using any AI API tokens. Category detection uses keyword matching, not LLM calls.

## 🆘 Troubleshooting

### Common Issues

**Error: "Environment variable NEXT_PUBLIC_CONVEX_URL is not set"**
```bash
# Create .env file with your Convex URL
echo "NEXT_PUBLIC_CONVEX_URL=your-convex-url" > .env
```

**Error: "Cannot find module 'csv-parser'"**
```bash
# Install dependencies
npm install csv-parser
```

**Low category detection accuracy**
- Review business descriptions - add more descriptive keywords
- Check the category detector mappings in `/config/category-detector.ts`
- Consider manually categorizing businesses with generic names

**Import script hangs**
- Ensure Convex development server is running
- Check that your CSV file is properly formatted
- Try with a smaller sample file first

### Getting Help
- Review the full implementation plan in `CSV_IMPORT_AND_URL_REDESIGN_PLAN.md`
- Check the category detector configuration in `/config/category-detector.ts`
- Examine the field mappings in `/config/field-mappings.ts`

## 📚 File Structure

```
/data/imports/           # Your CSV files go here
/scripts/
├── csv-importer.ts      # Main import script
└── test-migration.ts    # Test script for validation
/config/
├── category-detector.ts # Category detection logic
├── field-mappings.ts    # CSV field mappings
└── import-config.ts     # Import configuration
/utils/
├── csv-processor.ts     # CSV parsing utilities
├── data-validator.ts    # Data validation
└── slug-generator.ts    # URL generation
/convex/
└── batchImport.ts      # Database import functions
```

---

## 🎉 Ready to Import?

1. **Place your CSV file** in `/data/imports/`
2. **Start Convex** with `npx convex dev`
3. **Run the import** with `npx tsx scripts/csv-importer.ts data/imports/your-file.csv`
4. **Watch your business directory** populate with live listing pages!

The system is designed to be simple, reliable, and efficient. Drop your CSV files and let the automation handle the rest!