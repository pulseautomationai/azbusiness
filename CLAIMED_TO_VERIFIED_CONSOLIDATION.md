# Claimed to Verified Field Consolidation

## Summary
We have consolidated the redundant `claimed` and `verified` fields into a single `verified` field throughout the codebase.

## Changes Made

### Schema Updates
- **convex/schema.ts**: Removed `claimed: v.boolean()` from the main schema
- Added temporary `claimed: v.optional(v.boolean())` for migration purposes

### Component Updates
All references to `business.claimed` have been updated to `business.verified`:

1. **tier-based-business-profile.tsx**: Updated claim banner logic
2. **headers/index.tsx**: Tier badge shows only for verified businesses  
3. **claim-banner.tsx**: Shows only for unverified businesses
4. **single-page-business-profile.tsx**: All claimed references updated
5. **enhanced-business-profile.tsx**: All claimed references updated
6. **business-profile.tsx**: All claimed references updated
7. **StickyCTABar.tsx**: CTA logic updated
8. **claim-listing-cta.tsx**: Shows for unverified businesses
9. **admin/moderation.tsx**: Status display updated
10. **businessClaims.ts**: Claim verification logic updated
11. **batchImport.ts**: Import logic updated
12. **seedBusinesses.ts**: Seed data updated

### Migration Script
Created `convex/migrations/consolidateClaimedToVerified.ts` to migrate existing data.

## Next Steps

1. Run the migration script to update existing data:
   ```bash
   npx convex run migrations:consolidateClaimedToVerified
   ```

2. After migration is complete and verified, remove the temporary `claimed` field from schema.ts

3. Test thoroughly to ensure:
   - Verified businesses show the "Verified by Business Owner" badge
   - Unverified businesses show the "Claim Your Listing" banner
   - No business shows both simultaneously

## Logic Summary
- `verified: true` → Shows "Verified by Business Owner" badge, no claim banner
- `verified: false` → Shows "Claim Your Listing" banner, no verified badge