#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Missing VITE_CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// New categories to add
const NEW_CATEGORIES = [
  {
    name: "Pet Training",
    slug: "pet-training",
    description: "Professional training services for dogs, cats, and other pets",
    icon: "🐾"
  },
  {
    name: "Pet Sitting & Walking",
    slug: "pet-sitting-walking",
    description: "Pet care, sitting, and walking services",
    icon: "🦮"
  },
  {
    name: "IT Support & Computer Repair",
    slug: "it-support-computer-repair",
    description: "Technical support and computer repair services",
    icon: "💻"
  },
  {
    name: "Notary Service",
    slug: "notary-service",
    description: "Notary public and document authentication services",
    icon: "📋"
  },
  {
    name: "Catering Service",
    slug: "catering-service",
    description: "Professional catering for events and gatherings",
    icon: "🍽️"
  },
  {
    name: "DJ & Entertainment Service",
    slug: "dj-entertainment-service",
    description: "DJs, MCs, and entertainment providers for events",
    icon: "🎵"
  },
  {
    name: "Bartending Service",
    slug: "bartending-service",
    description: "Professional bartending and beverage services",
    icon: "🍹"
  },
  {
    name: "Party & Event Rental",
    slug: "party-event-rental",
    description: "Party supplies, equipment, and event rental services",
    icon: "🎪"
  },
  {
    name: "Mobile Auto Repair & Maintenance",
    slug: "mobile-auto-repair-maintenance",
    description: "On-site automotive repair and maintenance services",
    icon: "🚐"
  },
  {
    name: "Windshield Repair",
    slug: "windshield-repair",
    description: "Auto glass repair and windshield replacement",
    icon: "🚘"
  },
  // Skip "Pool Cleaning & Maintenance" as we already have "Pool & Spa Services"
  {
    name: "Xeriscaping & Desert Landscaping",
    slug: "xeriscaping-desert-landscaping",
    description: "Water-efficient desert landscaping and xeriscaping design",
    icon: "🌵"
  },
  {
    name: "Shade Structure Installation",
    slug: "shade-structure-installation",
    description: "Installation of awnings, pergolas, and shade structures",
    icon: "⛱️"
  },
  {
    name: "Evaporative Cooler Service",
    slug: "evaporative-cooler-service",
    description: "Swamp cooler installation, repair, and maintenance",
    icon: "🌬️"
  },
  {
    name: "Courier & Delivery Service",
    slug: "courier-delivery-service",
    description: "Local courier and same-day delivery services",
    icon: "📦"
  },
  {
    name: "Equipment Rental",
    slug: "equipment-rental",
    description: "Tools, construction equipment, and machinery rental",
    icon: "🛠️"
  }
];

async function addNewCategories() {
  console.log(`🚀 Starting to add new categories...\n`);

  try {
    // Use the seedNewCategories mutation which doesn't require authentication
    const result = await client.mutation(api.seedNewCategories.seedNewCategories, {});
    
    console.log("\n📊 Summary:");
    console.log(`   ✅ Successfully created: ${result.added}`);
    console.log(`   ⏭️  Skipped (already exist): ${result.skipped}`);
    console.log(`   ❌ Failed: ${result.errors}`);
    
    if (result.details) {
      if (result.details.added.length > 0) {
        console.log("\n✅ Added categories:");
        result.details.added.forEach(name => console.log(`   - ${name}`));
      }
      
      if (result.details.skipped.length > 0) {
        console.log("\n⏭️  Skipped categories (already exist):");
        result.details.skipped.forEach(name => console.log(`   - ${name}`));
      }
      
      if (result.details.errors.length > 0) {
        console.log("\n❌ Errors:");
        result.details.errors.forEach(error => console.log(`   - ${error}`));
      }
    }

    if (result.added > 0) {
      console.log("\n🎉 New categories have been added successfully!");
      console.log("   You can now import businesses for these categories.");
    }

  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
addNewCategories();