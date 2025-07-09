import { mutation } from "./_generated/server";
import { sampleBusinesses } from "./seedData";

export const seedSampleBusinesses = mutation({
  handler: async (ctx) => {
    // Check if businesses already exist
    const existingBusinesses = await ctx.db.query("businesses").collect();
    if (existingBusinesses.length > 0) {
      return { message: "Businesses already seeded", count: existingBusinesses.length };
    }

    // Get HVAC category
    const hvacCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", "hvac-services"))
      .first();
    
    if (!hvacCategory) {
      throw new Error("HVAC category not found. Please seed categories first.");
    }

    // Insert sample businesses
    const insertedIds = [];
    for (const business of sampleBusinesses) {
      const id = await ctx.db.insert("businesses", {
        ...business,
        categoryId: hvacCategory._id,
        logo: undefined,
        heroImage: undefined,
        coordinates: undefined,
        hours: {
          monday: "8:00 AM - 6:00 PM",
          tuesday: "8:00 AM - 6:00 PM",
          wednesday: "8:00 AM - 6:00 PM",
          thursday: "8:00 AM - 6:00 PM",
          friday: "8:00 AM - 6:00 PM",
          saturday: "9:00 AM - 4:00 PM",
          sunday: "Emergency Service Only",
        },
        claimed: true,
        ownerId: undefined,
        socialLinks: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      insertedIds.push(id);
    }

    // Create more sample businesses for other cities and categories
    const categories = await ctx.db.query("categories").collect();
    const cities = ["Phoenix", "Tucson", "Scottsdale", "Chandler", "Tempe", "Glendale"];
    
    // Generate 2-3 businesses per category for major cities
    for (const category of categories.slice(0, 10)) { // First 10 categories
      for (const city of cities) {
        const businessCount = Math.floor(Math.random() * 2) + 1; // 1-2 businesses per city
        
        for (let i = 0; i < businessCount; i++) {
          const planTiers = ["free", "pro", "power"] as const;
          const planTier = planTiers[Math.floor(Math.random() * planTiers.length)];
          
          const business = {
            name: `${city} ${category.name} ${i + 1}`,
            slug: `${city.toLowerCase()}-${category.slug}-${i + 1}`,
            shortDescription: `Professional ${category.name.toLowerCase()} services in ${city}. Licensed, insured, and ready to help.`,
            description: `We are ${city}'s trusted provider for all your ${category.name.toLowerCase()} needs. With years of experience serving the local community, we pride ourselves on quality workmanship and excellent customer service.`,
            phone: `(${Math.floor(Math.random() * 900) + 100}) 555-${Math.floor(Math.random() * 9000) + 1000}`,
            email: `info@${city.toLowerCase()}${category.slug.replace(/-/g, "")}${i + 1}.com`,
            website: Math.random() > 0.5 ? `https://${city.toLowerCase()}${category.slug.replace(/-/g, "")}${i + 1}.com` : undefined,
            address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
            city: city,
            state: "AZ",
            zip: `85${Math.floor(Math.random() * 900) + 100}`,
            categoryId: category._id,
            services: [
              "Free Estimates",
              "Emergency Service",
              "Licensed & Insured",
              "Residential & Commercial",
            ],
            hours: {
              monday: "8:00 AM - 5:00 PM",
              tuesday: "8:00 AM - 5:00 PM",
              wednesday: "8:00 AM - 5:00 PM",
              thursday: "8:00 AM - 5:00 PM",
              friday: "8:00 AM - 5:00 PM",
              saturday: "By Appointment",
              sunday: "Closed",
            },
            planTier: planTier,
            featured: planTier === "power" || (planTier === "pro" && Math.random() > 0.5),
            priority: planTier === "power" ? 100 : planTier === "pro" ? 50 : 0,
            claimed: true,
            verified: planTier !== "free" || Math.random() > 0.5,
            active: true,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
            reviewCount: Math.floor(Math.random() * 150) + 10,
            ownerId: undefined,
            logo: undefined,
            heroImage: undefined,
            coordinates: undefined,
            socialLinks: undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          await ctx.db.insert("businesses", business);
        }
      }
    }

    return { message: "Businesses seeded successfully", count: insertedIds.length };
  },
});