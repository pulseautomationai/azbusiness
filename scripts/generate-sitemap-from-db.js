#!/usr/bin/env node

/**
 * Generate sitemap.xml files from the Convex database
 * This version connects to Convex to get real data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = process.env.FRONTEND_URL || 'https://azbusinessservices.com';
const OUTPUT_DIR = path.join(__dirname, '../public');
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

// Initialize Convex client
const client = new ConvexHttpClient(CONVEX_URL);

// Generate XML header
function generateXMLHeader() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n';
}

// Generate sitemap index
function generateSitemapIndex() {
  const currentDate = new Date().toISOString();
  
  return `${generateXMLHeader()}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Businesses sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-businesses.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Categories sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Cities sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Category+City combinations sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-category-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// Generate pages sitemap (static pages)
function generatePagesSitemap() {
  const currentDate = new Date().toISOString();
  
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/about", priority: "0.8", changefreq: "monthly" },
    { url: "/contact", priority: "0.8", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
    { url: "/add-business", priority: "0.9", changefreq: "weekly" },
    { url: "/sign-up", priority: "0.7", changefreq: "monthly" },
    { url: "/sign-in", priority: "0.7", changefreq: "monthly" },
    { url: "/pricing", priority: "0.8", changefreq: "monthly" },
    { url: "/categories", priority: "0.8", changefreq: "weekly" },
    { url: "/cities", priority: "0.8", changefreq: "weekly" },
  ];

  const urls = staticPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Generate categories sitemap from database
async function generateCategoriesSitemap() {
  const currentDate = new Date().toISOString();
  
  try {
    // Fetch categories from Convex
    const categories = await client.query(api.sitemaps.getAllActiveCategories);
    
    const urls = categories.map(category => `  <url>
    <loc>${SITE_URL}/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

    return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to static data
    return generateCategoriesSitemapStatic();
  }
}

// Generate cities sitemap from database
async function generateCitiesSitemap() {
  const currentDate = new Date().toISOString();
  
  try {
    // Fetch cities from Convex
    const cities = await client.query(api.sitemaps.getAllActiveCities);
    
    const urls = cities.map(city => `  <url>
    <loc>${SITE_URL}/city/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

    return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Fallback to static data
    return generateCitiesSitemapStatic();
  }
}

// Generate category+city combinations from database
async function generateCategoryCitySitemap() {
  const currentDate = new Date().toISOString();
  
  try {
    // Fetch categories and cities from Convex
    const [categories, cities] = await Promise.all([
      client.query(api.sitemaps.getAllActiveCategories),
      client.query(api.sitemaps.getAllActiveCities)
    ]);
    
    // Generate all combinations
    const combinations = [];
    categories.forEach(category => {
      cities.forEach(city => {
        combinations.push({
          url: `/${category.slug}/${city.slug}`,
          priority: "0.7"
        });
      });
    });

    const urls = combinations.map(combo => `  <url>
    <loc>${SITE_URL}${combo.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${combo.priority}</priority>
  </url>`).join('\n');

    return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } catch (error) {
    console.error('Error generating category+city combinations:', error);
    // Fallback to static data
    return generateCategoryCitySitemapStatic();
  }
}

// Generate businesses sitemap from database
async function generateBusinessesSitemap() {
  const currentDate = new Date().toISOString();
  
  try {
    // Fetch all active businesses from Convex
    const businesses = await client.query(api.sitemaps.getAllActiveBusinessesForSitemap);
    
    const urls = businesses.map(business => {
      // Generate business URL
      const categorySlug = business.category?.slug || 'services';
      const citySlug = business.city.toLowerCase().replace(/\s+/g, '-');
      const businessSlug = business.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const url = `/${categorySlug}/${citySlug}/${businessSlug}`;
      const lastmod = new Date(business.updatedAt).toISOString();
      
      // Priority based on plan tier and rating
      let priority = "0.6";
      if (business.planTier === "power") {
        priority = "0.9";
      } else if (business.planTier === "pro") {
        priority = "0.8";
      } else if (business.rating >= 4.5) {
        priority = "0.7";
      }

      return `  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    // Return empty sitemap on error
    return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }
}

// Static fallback functions
function generateCategoriesSitemapStatic() {
  const currentDate = new Date().toISOString();
  const categories = [
    "plumbing", "electrical", "hvac", "landscaping", "contractors",
    "cleaning", "automotive", "legal", "healthcare", "restaurants"
  ];

  const urls = categories.map(category => `  <url>
    <loc>${SITE_URL}/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateCitiesSitemapStatic() {
  const currentDate = new Date().toISOString();
  const cities = [
    "phoenix", "tucson", "mesa", "chandler", "scottsdale", "glendale",
    "gilbert", "tempe", "peoria", "surprise", "yuma", "avondale",
    "flagstaff", "goodyear", "buckeye"
  ];

  const urls = cities.map(city => `  <url>
    <loc>${SITE_URL}/city/${city}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

  return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateCategoryCitySitemapStatic() {
  const currentDate = new Date().toISOString();
  const categories = [
    "plumbing", "electrical", "hvac", "landscaping", "contractors",
    "cleaning", "automotive", "legal", "healthcare", "restaurants"
  ];
  const cities = [
    "phoenix", "tucson", "mesa", "chandler", "scottsdale", "glendale",
    "gilbert", "tempe", "peoria", "surprise", "yuma", "avondale",
    "flagstaff", "goodyear", "buckeye"
  ];

  const combinations = [];
  categories.forEach(category => {
    cities.forEach(city => {
      combinations.push({
        url: `/${category}/${city}`,
        priority: "0.7"
      });
    });
  });

  const urls = combinations.map(combo => `  <url>
    <loc>${SITE_URL}${combo.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${combo.priority}</priority>
  </url>`).join('\n');

  return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Main function
async function generateSitemaps() {
  console.log('🔄 Starting sitemap generation from database...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Generate all sitemaps
    const sitemaps = {
      'sitemap.xml': generateSitemapIndex(),
      'sitemap-pages.xml': generatePagesSitemap(),
      'sitemap-categories.xml': await generateCategoriesSitemap(),
      'sitemap-cities.xml': await generateCitiesSitemap(),
      'sitemap-category-cities.xml': await generateCategoryCitySitemap(),
      'sitemap-businesses.xml': await generateBusinessesSitemap()
    };

    // Write files
    Object.entries(sitemaps).forEach(([filename, content]) => {
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Generated ${filename}`);
    });

    console.log(`\n🎉 All sitemaps generated successfully in ${OUTPUT_DIR}`);
    console.log(`📊 Generated ${Object.keys(sitemaps).length} sitemap files`);
    
    // Log statistics
    const businessCount = (sitemaps['sitemap-businesses.xml'].match(/<url>/g) || []).length;
    console.log(`📈 Total businesses in sitemap: ${businessCount}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemaps().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateSitemaps };