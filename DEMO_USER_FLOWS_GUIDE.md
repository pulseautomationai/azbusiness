# AZ Business Services - Demo User Flows Guide

## 🎬 Complete Demo Instructions

This guide provides step-by-step instructions for demonstrating the key user flows and features of your AZ Business Services platform.

---

## 🚀 Pre-Demo Setup

### 1. Start the Development Environment
```bash
# Terminal 1: Start Convex backend (REQUIRED FIRST)
npx convex dev

# Terminal 2: Start React Router frontend (wait for Convex to be ready)
npm run dev

# Verify both are running:
# - Convex: "Convex functions ready!" message
# - Frontend: Available at http://localhost:5173
```

### 2. Verify Demo Data
- Ensure you have businesses imported via CSV
- Check that categories and cities are populated
- Confirm analytics events are being tracked

---

## 🎯 Demo Flow 1: Business Discovery & Free Tier Experience

### Goal: Show how potential customers find and interact with businesses

#### Step 1: Homepage Exploration (2-3 minutes)
1. **Navigate to**: `http://localhost:5173`
2. **Demonstrate**:
   - Search functionality for businesses
   - Category browsing (38 service types)
   - Featured businesses section
   - City-based filtering

#### Step 2: Category Page Experience (2 minutes)
1. **Navigate to**: Any category page (e.g., `/hvac-services`)
2. **Show**:
   - Business listings with ratings and basic info
   - Map view with business locations
   - Filtering options (city, rating, etc.)
   - "View Details" on a business card

#### Step 3: Free Tier Business Profile (5 minutes)
1. **Navigate to**: A business detail page (format: `/[category]/[city]/[business-name]`)
2. **Demonstrate Free Tier Features**:
   - **Basic Information**: Name, contact, hours, location
   - **AI Summary Teaser**: Show first line visible, rest blurred with "Upgrade to see full summary"
   - **Service List**: Basic bullet points (not enhanced cards)
   - **Reviews Tab**: Customer reviews display
   - **Disabled Contact Form**: Show overlay with "Claim this business to enable contact form"
   - **Grayed Badges**: Hover to show "Upgrade to unlock this badge" tooltips
   - **Sticky CTA**: "Claim This Listing" button at bottom

#### Step 4: Claim Flow Initiation (3 minutes)
1. **Click**: "Claim This Listing" sticky button
2. **Show**: Clerk authentication modal
3. **Demonstrate**: Sign-up process (use test email)
4. **Explain**: This would normally trigger business verification workflow

---

## 🎯 Demo Flow 2: Pro Tier Features ($29/month)

### Goal: Show enhanced features for paying business owners

#### Step 1: Access Pro Features (Mock Setup)
```bash
# In Convex dashboard or via direct database update:
# Set business.planTier = "pro" for demo business
# Set business.claimed = true
# Set business.claimedByUserId = [test_user_id]
```

#### Step 2: Pro Business Profile (5 minutes)
1. **Navigate to**: Pro tier business profile
2. **Demonstrate Pro Features**:
   - **Full AI Summary**: Complete business description visible
   - **Service Cards**: Enhanced cards with icons, descriptions
   - **Contact Form**: Fully functional lead capture
   - **Verification Badge**: "Verified Business" badge displayed
   - **Analytics Preview**: Basic view counts and metrics

#### Step 3: Advanced Analytics Dashboard (5 minutes)
1. **Navigate to**: Business analytics section (if accessible via profile)
2. **Show**:
   - **Real-time Metrics**: Page views, clicks, leads
   - **Conversion Tracking**: Lead submission rates
   - **Device Breakdown**: Mobile vs desktop traffic
   - **Traffic Sources**: Referrer analysis
   - **Time-based Trends**: Daily/weekly patterns

#### Step 4: Lead Management System (4 minutes)
1. **Navigate to**: Lead dashboard section
2. **Demonstrate**:
   - **Lead Pipeline**: New → Contacted → Converted status
   - **Lead Details**: Contact information and messages
   - **Filtering Options**: By status, date, service type
   - **Lead Limits**: Show "47 of 50 leads used this month" indicator

#### Step 5: Theme Customization (3 minutes)
1. **Navigate to**: Profile customization section
2. **Show**:
   - **Theme Templates**: 4 professional options
   - **Live Preview**: Real-time theme changes
   - **Color Customization**: Brand color selection
   - **Export/Import**: Theme portability

---

## 🎯 Demo Flow 3: Power Tier AI Features ($97/month)

### Goal: Showcase advanced AI-powered marketing automation

#### Step 1: Access Power Features (Mock Setup)
```bash
# Set business.planTier = "power" for demo business
# Ensure OpenAI API key is configured
```

#### Step 2: AI Content Enhancement Suite (8 minutes)

##### A. AI Business Summary Generator (2 minutes)
1. **Navigate to**: AI Content section
2. **Demonstrate**:
   - **Tone Selection**: Professional, Friendly, Confident, Local, Premium
   - **Generate Summary**: Click to create AI content
   - **Live Preview**: Show generated content with different tones
   - **Apply Changes**: Save new summary to business profile

##### B. AI Service Enhancement (2 minutes)
1. **Show**:
   - **Service Selection**: Choose services to enhance
   - **AI Enhancement**: Generate improved descriptions
   - **Pricing Suggestions**: Market-based pricing recommendations
   - **Before/After**: Compare original vs enhanced content

##### C. AI Social Media Generator (2 minutes)
1. **Demonstrate**:
   - **Platform Selection**: Facebook, Instagram, LinkedIn, Twitter
   - **Content Generation**: Platform-specific posts
   - **Hashtag Suggestions**: Relevant hashtags for each platform
   - **Scheduling Recommendations**: Optimal posting times

##### D. Content Optimization Engine (2 minutes)
1. **Show**:
   - **Content Scoring**: 1-100 quality score
   - **SEO Analysis**: Keyword optimization suggestions
   - **Readability**: Grammar and clarity improvements
   - **CTA Optimization**: Call-to-action enhancement

#### Step 3: Advanced SEO & Marketing Tools (8 minutes)

##### A. Comprehensive SEO Audit (3 minutes)
1. **Navigate to**: SEO Audit section
2. **Demonstrate**:
   - **6-Category Scoring**: Meta, Performance, Mobile, Local SEO, Content, Technical
   - **Detailed Recommendations**: Specific improvement actions
   - **Competitor Comparison**: How business ranks vs competitors
   - **Priority Matrix**: High/Medium/Low impact recommendations

##### B. Keyword Tracking & Optimization (2 minutes)
1. **Show**:
   - **Keyword Performance**: Current rankings and trends
   - **Content Calendar**: AI-generated content schedule
   - **Optimization Suggestions**: Keyword targeting improvements

##### C. Local SEO Optimization (3 minutes)
1. **Demonstrate**:
   - **Arizona-Specific Strategies**: Local optimization recommendations
   - **GMB Optimization**: Google My Business improvements
   - **Citation Analysis**: Local directory recommendations
   - **Schema Markup**: Structured data suggestions

#### Step 4: Advanced Analytics & Insights (4 minutes)
1. **Navigate to**: Power tier analytics
2. **Show**:
   - **Competitor Benchmarking**: Market position analysis
   - **Customer Journey**: Complete funnel analysis
   - **ROI Tracking**: Marketing investment returns
   - **Predictive Analytics**: Growth forecasting

---

## 🎯 Demo Flow 4: Admin Dashboard & Platform Management

### Goal: Show platform administration and business intelligence

#### Step 1: Admin Access Setup
```bash
# In Convex dashboard, set user role:
# users.role = "admin" or "super_admin"
# Grant admin permissions in adminPermissions array
```

#### Step 2: Admin Dashboard Overview (5 minutes)
1. **Navigate to**: `http://localhost:5173/admin`
2. **Demonstrate**:
   - **Platform Metrics**: Total businesses, revenue, user counts
   - **Business Distribution**: Free/Pro/Power tier breakdown
   - **Health Indicators**: Platform performance metrics
   - **Quick Actions**: Common admin tasks

#### Step 3: Business Management Tools (8 minutes)

##### A. Business Overview & Filtering (3 minutes)
1. **Navigate to**: `/admin/businesses`
2. **Show**:
   - **Business List**: All businesses with key details
   - **Advanced Filtering**: By plan, city, status, claim status
   - **Search Functionality**: Find specific businesses
   - **Sorting Options**: By performance, revenue, activity

##### B. Bulk Operations (3 minutes)
1. **Demonstrate**:
   - **Selection Tools**: Choose multiple businesses
   - **Bulk Actions**: Activate, deactivate, feature, approve
   - **Progress Tracking**: Real-time operation status
   - **Result Summary**: Success/failure reporting

##### C. Business Quality Scoring (2 minutes)
1. **Show**:
   - **Quality Metrics**: 5-criteria scoring system
   - **Score Breakdown**: Profile, engagement, content, activity, sentiment
   - **Improvement Recommendations**: Actionable suggestions
   - **Trend Analysis**: Quality improvements over time

#### Step 4: Platform Analytics Dashboard (10 minutes)

##### A. Overview Tab (2 minutes)
1. **Navigate to**: `/admin/analytics`
2. **Show**:
   - **Platform Health**: Overall system status
   - **Key Performance Indicators**: Critical metrics
   - **Growth Trends**: User and business growth
   - **Alert Summary**: Important notifications

##### B. Revenue Analytics (3 minutes)
1. **Navigate to**: Revenue tab
2. **Demonstrate**:
   - **MRR/ARR Tracking**: Monthly and annual recurring revenue
   - **Subscription Analytics**: Plan distribution and changes
   - **Customer Lifetime Value**: LTV calculations by plan
   - **Revenue Forecasting**: Predictive revenue models

##### C. User Engagement (2 minutes)
1. **Navigate to**: Users tab
2. **Show**:
   - **Journey Analysis**: User behavior patterns
   - **Retention Cohorts**: User retention over time
   - **Engagement Scoring**: Activity-based user segments
   - **Conversion Funnels**: Sign-up to paid conversion

##### D. Business Performance (2 minutes)
1. **Navigate to**: Business tab
2. **Demonstrate**:
   - **City Performance**: Business success by location
   - **Category Analysis**: Performance by service type
   - **Growth Metrics**: Business acquisition and retention
   - **Market Insights**: Local market trends

##### E. Competitive Intelligence (1 minute)
1. **Navigate to**: Competitive tab
2. **Show**:
   - **Market Share**: Platform position in market
   - **Pricing Analysis**: Competitive pricing insights
   - **Feature Comparison**: Platform advantages
   - **Trend Identification**: Market opportunities

---

## 🎯 Demo Flow 5: Feature Gating & Upgrade Experience

### Goal: Show how the platform drives subscriptions through feature restrictions

#### Step 1: Free to Pro Conversion Flow (5 minutes)
1. **Start with**: Free tier business profile
2. **Demonstrate Upgrade Triggers**:
   - **Blurred AI Summary**: "Upgrade to Pro to see full summary"
   - **Disabled Contact Form**: "Claim this business to enable leads"
   - **Analytics Teasers**: "Pro businesses get detailed analytics"
   - **Badge Tooltips**: "Upgrade to unlock verification badge"

#### Step 2: Pro to Power Conversion Flow (3 minutes)
1. **Start with**: Pro tier business profile
2. **Show Power Teasers**:
   - **AI Tools Preview**: "Power plan includes AI content generation"
   - **Advanced SEO**: "Unlock comprehensive SEO audit with Power"
   - **Unlimited Leads**: "Remove 50 lead monthly limit"

#### Step 3: Subscription Management (2 minutes)
1. **Navigate to**: Billing/subscription section
2. **Show**:
   - **Current Plan**: Plan details and usage
   - **Upgrade Options**: Clear value propositions
   - **Usage Metrics**: Lead counts, feature usage
   - **ROI Calculator**: Value demonstration

---

## 🎯 Demo Script Templates

### 30-Second Elevator Pitch
*"AZ Business Services is a comprehensive business directory that helps Arizona service providers get found online and convert visitors into customers. We offer three tiers: Free for basic listings, Pro at $29/month for advanced analytics and lead management, and Power at $97/month with AI-powered content creation and marketing automation worth over $500/month in equivalent tools."*

### 2-Minute Platform Overview
*"Let me show you how this works. [Navigate to homepage] Customers can search for services and find businesses by category or location. [Click on business] Each business gets a detailed profile page. Free businesses see basic features with upgrade prompts. [Switch to Pro example] Pro businesses get full analytics, lead management, and custom branding. [Switch to Power example] Power businesses get our complete AI suite that automatically optimizes their content, analyzes SEO, and generates social media posts. [Show admin] Platform owners get a complete dashboard to manage thousands of businesses and track revenue."*

### 5-Minute Feature Deep Dive
*[Follow any of the detailed demo flows above, focusing on 2-3 key features that resonate with your audience]*

---

## 🛠️ Demo Troubleshooting

### Common Issues and Solutions

#### Convex Not Starting
```bash
# If you get schema errors:
# 1. Check that simplified schema is in place
# 2. Verify disabled files are in disabled_convex_files/
# 3. Restart: Ctrl+C, then npx convex dev
```

#### Missing Demo Data
```bash
# Import sample businesses:
npm run import-csv

# Or import all available data:
npm run import-all-csv
```

#### Authentication Issues
```bash
# Ensure Clerk is configured in .env.local
# Use test accounts for demos
# Admin access requires role configuration in Convex dashboard
```

#### AI Features Not Working
```bash
# Verify OpenAI API key in environment
# Check Convex functions are deployed
# Power tier features require proper plan assignment
```

### Demo Best Practices

1. **Prepare Multiple Business Examples**: Have Free, Pro, and Power examples ready
2. **Use Realistic Data**: Import actual business data for authenticity
3. **Practice Transitions**: Smooth navigation between features
4. **Have Backup Plans**: Know how to handle technical issues
5. **Time Management**: Keep each section within allocated time
6. **Interactive Elements**: Let audience suggest businesses to explore

---

**This demo guide covers all major user flows and provides the structure for compelling demonstrations of your production-ready business directory platform. Each flow is designed to showcase the value proposition and drive understanding of the three-tier monetization model.**