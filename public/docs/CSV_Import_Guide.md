# CSV Import Guide - Arizona Business Directory

## Overview

This guide provides step-by-step instructions for importing business data into the Arizona Business Directory using our Import Wizard. The new system is designed for 100% reliability and ease of use.

## 🎯 Quick Start

1. **Download a Template** - Start with one of our standard templates
2. **Fill Your Data** - Add your business information to the template
3. **Upload & Preview** - Upload your CSV and review the field mapping
4. **Validate & Import** - Check for issues and complete the import

## 📋 Standard Templates

### 1. Basic Import Template
**Use for**: Simple business listings with minimal information
**Required Fields**: Name, City, Phone, Category
**Best for**: Quick bulk imports when you only have basic contact info

**Download**: [basic-import-template.csv](/templates/basic-import-template.csv)

### 2. Arizona Business Template  
**Use for**: Standard business profiles with complete information
**Required Fields**: Name, Address, City, State, ZIP, Phone, Email, Website, Category, Description
**Best for**: Complete business profiles with full contact and location data

**Download**: [arizona-business-template.csv](/templates/arizona-business-template.csv)

### 3. Google My Business Template
**Use for**: Importing data exported from Google My Business
**Required Fields**: Name, Street_Address, City, State, Zip, Phone_Standard_format, Email_From_WEBSITE, Website, Category, Description
**Best for**: When you have GMB export data with ratings, reviews, and location coordinates

**Download**: [google-my-business-template.csv](/templates/google-my-business-template.csv)

## 📊 Field Reference

### Required Fields
These fields must be present and cannot be empty:

| Field | Description | Example | Notes |
|-------|-------------|---------|-------|
| Name | Business name | "Arizona Professional Cleaning LLC" | Unique business identifier |
| City | City in Arizona | "Mesa", "Phoenix", "Scottsdale" | Must be valid Arizona city |
| Phone | Phone number | "(480) 555-1234" | Any format acceptable |
| Category | Business category | "Cleaning Services", "HVAC Services" | Used for categorization |

### Optional Fields
These fields will enhance your listing if provided:

| Field | Description | Example | Notes |
|-------|-------------|---------|-------|
| Address | Street address | "1234 Main Street" | For map display |
| State | State abbreviation | "AZ" | Defaults to "AZ" if not provided |
| ZIP | ZIP code | "85204" | 5-digit ZIP codes |
| Email | Contact email | "info@business.com" | Must be valid email format |
| Website | Business website | "https://business.com" | Include http:// or https:// |
| Description | Business description | "Professional cleaning services..." | Up to 500 characters |

### Google My Business Fields
Additional fields when using the GMB template:

| Field | Description | Example |
|-------|-------------|---------|
| Average_rating | Google rating | "4.9" |
| Reviews_count | Number of reviews | "29" |
| Latitude | GPS latitude | "34.8543588" |
| Longitude | GPS longitude | "-111.7975656" |
| Hours | Business hours | "Monday: 8 AM-4 PM; Tuesday: 8 AM-4 PM..." |

## 🔧 Import Wizard Process

### Step 1: Upload Your CSV
1. Click "Upload CSV" tab in the Import Manager
2. Download and use one of our templates (recommended)
3. Drag and drop your CSV file or click "Browse Files"
4. The system will automatically parse and preview your data

### Step 2: Preview & Map Fields
1. Review the auto-detected field mapping
2. Adjust any incorrect field assignments using the dropdowns
3. Preview the first 5 rows to verify data looks correct
4. Required fields are marked with a red asterisk (*)

### Step 3: Validate Data
1. Review validation results showing valid, warning, and error counts
2. See detailed issues for each row
3. Only valid and warning rows will be imported (error rows are skipped)
4. Download an error report if needed

### Step 4: Import Execution
1. Confirm the number of businesses to import
2. Watch the progress bar as data is imported in batches
3. See real-time completion status

### Step 5: Import Complete
1. View success summary with import statistics
2. Navigate to view your imported businesses
3. Start a new import if needed

## ✅ Data Quality Guidelines

### Business Names
- Use the official business name
- Include LLC, Inc, etc. if part of the legal name
- Avoid ALL CAPS unless that's the official styling
- **Good**: "Arizona Professional Cleaning LLC"
- **Avoid**: "ARIZONA PROFESSIONAL CLEANING"

### Phone Numbers
- Any format is acceptable: (480) 555-1234, 480-555-1234, 480.555.1234
- Must be 10 digits (US format)
- System will auto-format to (XXX) XXX-XXXX

### Cities
- Must be valid Arizona cities
- Use proper capitalization: "Mesa", not "MESA" or "mesa"
- Avoid including state: "Mesa" not "Mesa, AZ"
- Common cities: Phoenix, Mesa, Scottsdale, Tempe, Glendale, Chandler, Peoria, Gilbert

### Categories
- Use our standard categories when possible:
  - Cleaning Services
  - HVAC Services  
  - Landscaping
  - Plumbing
  - Electrical
  - Home Improvement
  - Auto Services
  - Professional Services
- Will be auto-mapped to closest existing category

### Websites
- Include full URL with protocol: "https://business.com"
- Common formats accepted:
  - https://business.com
  - http://www.business.com
  - https://www.business.com

## 🚨 Common Issues & Solutions

### Issue: "Missing required field: name"
**Solution**: Ensure the business name column is mapped correctly and contains data for every row

### Issue: "Phone number format may be invalid"
**Solution**: Check phone numbers are 10 digits. Remove any extra characters or country codes

### Issue: "City not recognized as Arizona city"  
**Solution**: Use standard city names. Check spelling and remove state abbreviations

### Issue: "Email format appears invalid"
**Solution**: Ensure email addresses contain @ symbol and valid domain

### Issue: CSV parsing errors
**Solution**: 
- Save your file as CSV (not Excel format)
- Ensure no line breaks within data cells
- Use quotes around text that contains commas
- Check file encoding is UTF-8

## 📈 Best Practices

### Before Import
1. **Use Templates**: Always start with our templates for best results
2. **Clean Your Data**: Remove empty rows, fix formatting issues
3. **Validate Manually**: Spot-check a few rows before bulk import
4. **Backup**: Keep a copy of your original data

### During Import
1. **Review Mapping**: Always check the field mapping in Step 2
2. **Check Preview**: Verify data looks correct in the preview table
3. **Address Warnings**: Fix high-confidence warnings before importing
4. **Monitor Progress**: Stay on the page during import

### After Import
1. **Review Results**: Check a few imported businesses for accuracy
2. **Fix Issues**: Use business management to correct any problems
3. **Update Listings**: Add photos, enhanced descriptions, hours
4. **Monitor Performance**: Track how imported businesses perform

## 📞 Support

If you encounter issues not covered in this guide:

1. **Error Reports**: Download validation error reports for detailed issue lists
2. **Template Issues**: Ensure you're using the latest template version
3. **Data Format**: Verify your CSV follows the format guidelines
4. **Contact Support**: Reach out with specific error messages and sample data

## 🔄 Import History

All imports are tracked with complete audit trails:
- Import date and time
- Number of businesses processed
- Success/failure status
- Detailed error logs
- Source file information

Access your import history through the "Import History" tab for troubleshooting and record-keeping.

---

**Last Updated**: January 2025
**Template Version**: 1.0