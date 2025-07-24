import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const addDataSourceField = internalMutation({
  args: {},
  handler: async (ctx) => {
    const businesses = await ctx.db
      .query("businesses")
      .collect();

    console.log(`Found ${businesses.length} businesses to update`);

    let updated = 0;
    let errors = 0;

    for (const business of businesses) {
      try {
        // Check if dataSource already exists
        if (!business.dataSource) {
          // Add default dataSource based on existing data
          const dataSource = {
            primary: "admin_import" as const, // Default to admin_import for existing data
            lastSyncedAt: business.createdAt,
            syncStatus: "synced",
            // If business has a placeId, it might be from GMB
            ...(business.placeId && { gmbLocationId: business.placeId })
          };

          await ctx.db.patch(business._id, {
            dataSource
          });
          updated++;
        }
      } catch (error) {
        console.error(`Error updating business ${business._id}:`, error);
        errors++;
      }
    }

    console.log(`Migration complete: ${updated} businesses updated, ${errors} errors`);
    return { updated, errors, total: businesses.length };
  },
});