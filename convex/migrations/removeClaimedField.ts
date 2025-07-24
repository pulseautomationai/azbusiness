import { mutation } from "../_generated/server";

export const removeClaimedField = mutation({
  handler: async (ctx) => {
    // Get all businesses
    const businesses = await ctx.db.query("businesses").collect();
    
    let updatedCount = 0;
    
    for (const business of businesses) {
      // If the business has the old 'claimed' field, remove it
      if ("claimed" in business) {
        // Update the business to remove the claimed field
        const updateData: any = {};
        
        // If verified field is missing, set it based on claimed status
        if (business.verified === undefined && business.claimed !== undefined) {
          updateData.verified = business.claimed;
        }
        
        // Remove the claimed field by setting it to undefined
        updateData.claimed = undefined;
        
        await ctx.db.patch(business._id, updateData);
        updatedCount++;
      }
    }
    
    return {
      success: true,
      totalBusinesses: businesses.length,
      updatedBusinesses: updatedCount,
      message: `Removed 'claimed' field from ${updatedCount} businesses`
    };
  },
});