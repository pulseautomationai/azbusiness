# Quick Demo Setup Guide

## 🚀 Step-by-Step Demo Setup

Since the enhanced business profile is now connected, here's how to quickly set up demo data to see all the enhanced features:

### Step 1: Verify the Enhanced Profile is Working
1. Navigate to: `http://localhost:5173/hvac-services/phoenix/cactus-mechanical`
2. You should now see the **enhanced business profile** with tabs instead of the old basic profile

### Step 2: Set Up Different Plan Tiers (Manual via Convex Dashboard)

#### Option A: Via Convex Dashboard (Recommended)
1. Go to your **Convex Dashboard**: `https://dashboard.convex.dev`
2. Navigate to **Data** → **businesses** table
3. Find "Cactus Mechanical" (or any business)
4. **Edit the business record**:
   - Set `planTier` to `"free"` (default)
   - Set `claimed` to `false`
   - Set `verified` to `false`

#### Option B: Via Browser Console (Quick Method)
1. Open your business page in browser
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Paste this code to update a business to PRO tier:

```javascript
// Find the business ID from the page (check React DevTools or Network tab)
// Replace 'BUSINESS_ID_HERE' with actual ID

fetch('/api/convex', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'mutation',
    variables: {
      businessId: 'BUSINESS_ID_HERE',
      updates: {
        planTier: 'pro',
        claimed: true,
        verified: true
      }
    }
  })
});
```

### Step 3: What You Should See Now

#### Free Tier Features ✅
- **AI Summary Teaser**: First line visible, rest blurred with "Upgrade to see full summary"
- **Basic Service List**: Simple bullet points
- **Disabled Contact Form**: Overlay with "Claim this business to enable contact form"
- **Grayed Badges**: Hover to see "Upgrade to unlock" tooltips
- **Sticky CTA**: "Claim This Listing" button at bottom

#### Pro Tier Features ✅ (after updating planTier to "pro")
- **Full AI Summary**: Complete business description visible
- **Enhanced Service Cards**: Cards with icons and descriptions
- **Active Contact Form**: Functional lead capture
- **Verification Badge**: "Verified Business" badge
- **Analytics Tab**: Basic metrics and insights

#### Power Tier Features ✅ (after updating planTier to "power")
- **AI Content Tools**: Full suite of AI enhancement tools
- **Advanced Analytics**: Comprehensive business insights
- **SEO Audit Tools**: Complete SEO analysis
- **Social Media Generator**: Platform-specific content creation

### Step 4: Add Demo Business Content

To see the AI-enhanced content, you can manually add some demo content via Convex Dashboard:

1. Go to **Data** → **businessContent** table
2. Find the record for your business (match `businessId`)
3. Edit and add:

```json
{
  "customSummary": "We are Phoenix's premier HVAC specialists, providing 24/7 emergency service and expert installation, repair, and maintenance for residential and commercial clients.",
  "serviceCards": [
    {
      "name": "Emergency Repair",
      "description": "24/7 emergency HVAC repair services",
      "pricing": "$150-300",
      "icon": "wrench",
      "featured": true
    },
    {
      "name": "AC Installation", 
      "description": "Professional air conditioning installation",
      "pricing": "$3,000-8,000",
      "icon": "snowflake",
      "featured": true
    }
  ]
}
```

### Step 5: Demo Flow Testing

#### Test Free Tier (planTier: "free", claimed: false)
- ✅ Shows basic features only
- ✅ AI summary is blurred after first line
- ✅ Contact form is disabled with overlay
- ✅ "Claim This Listing" CTA appears

#### Test Pro Tier (planTier: "pro", claimed: true)
- ✅ Full AI summary visible
- ✅ Enhanced service cards
- ✅ Contact form works
- ✅ Verification badge shows
- ✅ Analytics tab available

#### Test Power Tier (planTier: "power", claimed: true)
- ✅ All Pro features plus
- ✅ AI content enhancement tools
- ✅ Advanced SEO audit
- ✅ Social media generator
- ✅ Comprehensive analytics

### Step 6: Demo Multiple Businesses

Create 3 demo businesses by repeating the above steps:
- **Business 1**: Free tier (unclaimed)
- **Business 2**: Pro tier (claimed, verified)  
- **Business 3**: Power tier (claimed, verified, featured)

This gives you a complete demo flow showing the progression from Free → Pro → Power.

### Troubleshooting

#### If Enhanced Profile Not Showing:
- ✅ Check that you updated the route file to use `EnhancedBusinessProfile`
- ✅ Verify both Convex and React servers are running
- ✅ Clear browser cache and reload

#### If Feature Gating Not Working:
- ✅ Check `planTier` field in business record
- ✅ Verify `usePlanFeatures` hook is working
- ✅ Check browser console for JavaScript errors

#### If Business Content Missing:
- ✅ Verify `businessContent` record exists for the business
- ✅ Check that `businessContent.ts` functions are deployed
- ✅ Add demo content manually via Convex Dashboard

### Quick URLs for Demo
- Free Tier: `http://localhost:5173/hvac-services/phoenix/[business-slug]`
- Pro Tier: Same URL after updating planTier to "pro"
- Power Tier: Same URL after updating planTier to "power"
- Admin Dashboard: `http://localhost:5173/admin` (requires admin role)

**This setup will give you a fully functional demo of all the enhanced business features across all three subscription tiers!**