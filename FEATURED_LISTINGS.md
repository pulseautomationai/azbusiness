# Featured Listings Management

This document explains how the featured listings system works and how to manage featured businesses on the AZ Business Services homepage.

## Overview

The featured listings system allows you to highlight specific businesses on the homepage in a carousel format. Featured businesses appear in the "Featured Businesses" section with enhanced visibility.

## Database Structure

### Business Fields
Each business in the database has two fields related to featuring:

- `featured` (boolean): Whether the business should appear in the featured section
- `priority` (number): Determines the order of featured businesses (higher priority = shown first)

### Database Schema
```typescript
// From convex/schema.ts
businesses: defineTable({
  // ... other fields
  featured: v.boolean(),  // Homepage featured spot
  priority: v.number(),   // Sorting priority (higher = top)
  // ... other fields
})
```

## How It Works

### 1. Query Logic
The `getFeaturedBusinesses` query in `convex/businesses.ts`:
- Filters for businesses where `active = true` AND `featured = true`
- Sorts by `priority` (descending), then by `rating` (descending)
- Returns top N businesses (default: 6)
- Includes category information for display

### 2. Frontend Display
The `FeaturedBusinesses` component (`app/components/homepage/featured-businesses.tsx`):
- Shows 3 businesses at a time in a carousel
- Includes navigation arrows for browsing
- Displays pagination dots
- Shows business details: name, rating, reviews, location, services
- Links to individual business pages

### 3. Mutation for Updates
The `updateBusinessFeaturedStatus` mutation allows you to:
- Toggle the featured status on/off
- Set or update the priority
- Automatically updates the `updatedAt` timestamp

## Admin Commands

Use the `manage-featured-businesses.ts` script via npm commands:

### List Current Featured Businesses
```bash
npm run featured-businesses list
```
Shows all currently featured businesses with their details and priorities.

### View Top-Rated Candidates
```bash
npm run featured-businesses candidates
```
Shows top 10 businesses with 4.5+ rating and 100+ reviews as potential candidates.

### Quick Setup (Recommended)
```bash
npm run featured-businesses quick-setup
```
Automatically features the top 6 highest-rated businesses with priorities 100, 90, 80, 70, 60, 50.

### Feature a Specific Business
```bash
npm run featured-businesses feature <businessId> [priority]
```
Example:
```bash
npm run featured-businesses feature jn7am94az0wqtqqp3865q75n7n7kdmcp 100
```
If priority is not provided, it will be auto-assigned based on position.

### Remove Featured Status
```bash
npm run featured-businesses unfeature <businessId>
```
Example:
```bash
npm run featured-businesses unfeature jn7am94az0wqtqqp3865q75n7n7kdmcp
```

## Best Practices

### Priority Guidelines
- **100-90**: Premium/sponsored listings (highest visibility)
- **80-70**: High-performing businesses
- **60-50**: Standard featured businesses
- **Below 50**: Lower priority featured businesses

### Selection Criteria
Consider featuring businesses that:
- Have high ratings (4.5+ stars)
- Have substantial review counts (100+)
- Represent different service categories
- Cover different cities/areas
- Are verified or claimed businesses
- Have complete profiles with photos

### Rotation Strategy
- Rotate featured businesses monthly or quarterly
- Consider seasonal relevance (e.g., HVAC in summer)
- Mix different categories for variety
- Balance between Phoenix and other cities

## Technical Implementation Details

### Files Modified/Created

1. **convex/businesses.ts**
   - Added `updateBusinessFeaturedStatus` mutation
   - Existing `getFeaturedBusinesses` query (already implemented)

2. **scripts/manage-featured-businesses.ts**
   - CLI tool for managing featured businesses
   - Commands: list, candidates, quick-setup, feature, unfeature

3. **package.json**
   - Added script: `"featured-businesses": "tsx scripts/manage-featured-businesses.ts"`

### Data Flow
1. Admin runs command to update featured status
2. Mutation updates database fields (`featured`, `priority`)
3. Homepage component queries `getFeaturedBusinesses`
4. Results are sorted by priority and displayed in carousel

## Troubleshooting

### Featured Businesses Not Showing
1. Check if businesses are marked as `active = true`
2. Verify `featured = true` using the list command
3. Ensure businesses have valid category associations
4. Check browser console for query errors

### Wrong Order
- Verify priority values using the list command
- Higher priority numbers appear first
- Businesses with same priority are sorted by rating

### To Update Display Count
Edit `app/components/homepage/featured-businesses.tsx`:
```typescript
const itemsPerPage = 3; // Change this to show more/fewer at once
```

## Future Enhancements

Potential improvements to consider:

1. **Admin UI Panel**: Build a web interface for easier management
2. **Auto-Rotation**: Automatically rotate featured businesses based on performance
3. **Category Diversity**: Ensure featured businesses represent multiple categories
4. **Analytics**: Track click-through rates on featured businesses
5. **Scheduling**: Schedule businesses to be featured on specific dates
6. **A/B Testing**: Test different featured combinations for engagement

## Example Workflow

1. **Initial Setup**:
   ```bash
   npm run featured-businesses quick-setup
   ```

2. **Review Current Featured**:
   ```bash
   npm run featured-businesses list
   ```

3. **Replace a Business**:
   ```bash
   # Remove old one
   npm run featured-businesses unfeature jn7am94az0wqtqqp3865q75n7n7kdmcp
   
   # Add new one with same priority
   npm run featured-businesses feature jn7newbusinessid123 90
   ```

4. **Find New Candidates**:
   ```bash
   npm run featured-businesses candidates
   ```

Remember: Changes take effect immediately on the live site!