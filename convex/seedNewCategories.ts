import { mutation } from "./_generated/server";

// New categories to add
const newCategories = [
  {
    name: "Pet Training",
    slug: "pet-training",
    description: "Professional training services for dogs, cats, and other pets",
    icon: "🐾",
    order: 40
  },
  {
    name: "Pet Sitting & Walking",
    slug: "pet-sitting-walking",
    description: "Pet care, sitting, and walking services",
    icon: "🦮",
    order: 41
  },
  {
    name: "IT Support & Computer Repair",
    slug: "it-support-computer-repair",
    description: "Technical support and computer repair services",
    icon: "💻",
    order: 42
  },
  {
    name: "Notary Service",
    slug: "notary-service",
    description: "Notary public and document authentication services",
    icon: "📋",
    order: 43
  },
  {
    name: "Catering Service",
    slug: "catering-service",
    description: "Professional catering for events and gatherings",
    icon: "🍽️",
    order: 44
  },
  {
    name: "DJ & Entertainment Service",
    slug: "dj-entertainment-service",
    description: "DJs, MCs, and entertainment providers for events",
    icon: "🎵",
    order: 45
  },
  {
    name: "Bartending Service",
    slug: "bartending-service",
    description: "Professional bartending and beverage services",
    icon: "🍹",
    order: 46
  },
  {
    name: "Party & Event Rental",
    slug: "party-event-rental",
    description: "Party supplies, equipment, and event rental services",
    icon: "🎪",
    order: 47
  },
  {
    name: "Mobile Auto Repair & Maintenance",
    slug: "mobile-auto-repair-maintenance",
    description: "On-site automotive repair and maintenance services",
    icon: "🚐",
    order: 48
  },
  {
    name: "Windshield Repair",
    slug: "windshield-repair",
    description: "Auto glass repair and windshield replacement",
    icon: "🚘",
    order: 49
  },
  {
    name: "Xeriscaping & Desert Landscaping",
    slug: "xeriscaping-desert-landscaping",
    description: "Water-efficient desert landscaping and xeriscaping design",
    icon: "🌵",
    order: 50
  },
  {
    name: "Shade Structure Installation",
    slug: "shade-structure-installation",
    description: "Installation of awnings, pergolas, and shade structures",
    icon: "⛱️",
    order: 51
  },
  {
    name: "Evaporative Cooler Service",
    slug: "evaporative-cooler-service",
    description: "Swamp cooler installation, repair, and maintenance",
    icon: "🌬️",
    order: 52
  },
  {
    name: "Courier & Delivery Service",
    slug: "courier-delivery-service",
    description: "Local courier and same-day delivery services",
    icon: "📦",
    order: 53
  },
  {
    name: "Equipment Rental",
    slug: "equipment-rental",
    description: "Tools, construction equipment, and machinery rental",
    icon: "🛠️",
    order: 54
  }
];

export const seedNewCategories = mutation({
  handler: async (ctx) => {
    // Get existing categories to check for duplicates
    const existingCategories = await ctx.db.query("categories").collect();
    const existingSlugs = new Set(existingCategories.map(cat => cat.slug));
    
    // Track results
    const results = {
      added: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    };

    // Insert new categories
    for (const category of newCategories) {
      try {
        // Skip if already exists
        if (existingSlugs.has(category.slug)) {
          results.skipped.push(category.name);
          continue;
        }

        // Insert the category
        await ctx.db.insert("categories", {
          ...category,
          active: true,
        });
        
        results.added.push(category.name);
      } catch (error) {
        results.errors.push(`${category.name}: ${error}`);
      }
    }

    return {
      message: "Category seeding complete",
      added: results.added.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      details: results
    };
  },
});