import { mutation } from "./_generated/server";
import { categories, cities } from "./seedData";

export const seedCategories = mutation({
  handler: async (ctx) => {
    // Check if categories already exist
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { message: "Categories already seeded", count: existingCategories.length };
    }

    // Insert all categories
    const insertedIds = [];
    for (const category of categories) {
      const id = await ctx.db.insert("categories", {
        ...category,
        active: true,
      });
      insertedIds.push(id);
    }

    return { message: "Categories seeded successfully", count: insertedIds.length };
  },
});

export const seedCities = mutation({
  handler: async (ctx) => {
    // Check if cities already exist
    const existingCities = await ctx.db.query("cities").collect();
    if (existingCities.length > 0) {
      return { message: "Cities already seeded", count: existingCities.length };
    }

    // Insert all cities
    const insertedIds = [];
    for (const city of cities) {
      const id = await ctx.db.insert("cities", {
        ...city,
        description: `${city.name} is ${
          city.region === "Phoenix Metro Area" 
            ? "part of the thriving Phoenix metropolitan area" 
            : city.region === "Tucson Metro Area"
            ? "located in the dynamic Tucson metropolitan region"
            : `located in ${city.region}`
        } with a population of ${city.population?.toLocaleString() || "N/A"}. Find trusted local service providers for all your home and business needs.`,
        active: true,
      });
      insertedIds.push(id);
    }

    return { message: "Cities seeded successfully", count: insertedIds.length };
  },
});