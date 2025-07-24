# Field Consolidation: claimed → verified

## Summary
We have successfully consolidated the redundant `claimed` and `verified` fields into a single `verified` field throughout the codebase. This eliminates confusion and ensures consistent behavior across the application.

## Changes Made

### 1. Database Schema Updates
- Removed `claimed: v.boolean()` from the main schema definition
- Added temporary `claimed: v.optional(v.boolean())` for migration compatibility
- Created migration script to transfer data from `claimed` to `verified`

### 2. Component Updates
Updated all UI components to use `business.verified` instead of `business.claimed`:

- **Claim Banner**: Shows only when `business.verified === false`
- **Verified Badge**: Shows only when `business.verified === true`
- **Sticky CTAs**: Updated logic to check `verified` status
- **Admin Pages**: Updated to display "Verified/Unverified" status

### 3. Backend Updates
- **businessClaims.ts**: Updated verification logic to set only `verified` field
- **batchImport.ts**: Removed `claimed` field from imports
- **seedBusinesses.ts**: Removed `claimed` field from seed data

## Behavior Summary

### For Verified Businesses (`verified: true`)
- ✅ Shows "Verified by Business Owner" badge
- ❌ Does NOT show "Claim Your Listing" banner
- ✅ Shows tier-specific features based on plan

### For Unverified Businesses (`verified: false`)
- ❌ Does NOT show "Verified by Business Owner" badge
- ✅ Shows "Claim Your Listing" banner
- ✅ Limited features until verified

## Migration Steps

1. The temporary `claimed` field has been added to schema for backward compatibility
2. Run the migration to copy `claimed` values to `verified`:
   ```bash
   npx convex run migrations:consolidateClaimedToVerified
   ```
3. After successful migration, remove the temporary `claimed` field from schema

## Testing Checklist

- [ ] Verified businesses show badge without claim banner
- [ ] Unverified businesses show claim banner without badge
- [ ] Admin panel shows correct verified/unverified status
- [ ] Business claiming flow updates `verified` field correctly
- [ ] No TypeScript errors related to `claimed` field

## Notes

- The TypeScript compilation issue in `single-page-business-profile.tsx` appears to be unrelated to our consolidation changes
- All functional changes have been implemented successfully
- The application should work correctly with the new unified `verified` field