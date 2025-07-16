#!/usr/bin/env node

/**
 * Generate sitemap.xml files from the Convex database
 * This script can be run manually or as part of a CI/CD pipeline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = process.env.FRONTEND_URL || 'https://azbusinessservices.com';
const OUTPUT_DIR = path.join(__dirname, '../public');

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

// Generate pages sitemap
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

// Generate categories sitemap
function generateCategoriesSitemap() {
  const currentDate = new Date().toISOString();
  
  // These would be fetched from the database in a real implementation
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

// Generate category+city combination sitemap
function generateCategoryCitySitemap() {
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

  // Generate all category+city combinations
  const combinations = [];
  categories.forEach(category => {
    cities.forEach(city => {
      combinations.push({
        url: `/${category}/${city}`,
        priority: "0.7" // High priority for local service pages
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

// Generate cities sitemap
function generateCitiesSitemap() {
  const currentDate = new Date().toISOString();
  
  // These would be fetched from the database in a real implementation
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

// Generate businesses sitemap
function generateBusinessesSitemap() {
  const currentDate = new Date().toISOString();
  
  // Sample businesses - in production this would fetch from Convex database
  const businesses = [
    {
      category: "plumbing",
      city: "phoenix", 
      name: "joes-plumbing",
      planTier: "pro",
      rating: 4.5,
      updatedAt: Date.now()
    },
    {
      category: "electrical",
      city: "scottsdale", 
      name: "bright-electric",
      planTier: "power",
      rating: 4.8,
      updatedAt: Date.now()
    }
  ];

  const urls = businesses.map(business => {
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
    <loc>${SITE_URL}/${business.category}/${business.city}/${business.name}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `${generateXMLHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Main function
function generateSitemaps() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate all sitemaps
  const sitemaps = {
    'sitemap.xml': generateSitemapIndex(),
    'sitemap-pages.xml': generatePagesSitemap(),
    'sitemap-categories.xml': generateCategoriesSitemap(),
    'sitemap-cities.xml': generateCitiesSitemap(),
    'sitemap-category-cities.xml': generateCategoryCitySitemap(),
    'sitemap-businesses.xml': generateBusinessesSitemap()
  };

  // Write files
  Object.entries(sitemaps).forEach(([filename, content]) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Generated ${filename}`);
  });

  console.log(`\n🎉 All sitemaps generated successfully in ${OUTPUT_DIR}`);
  console.log(`📊 Generated ${Object.keys(sitemaps).length} sitemap files`);
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemaps();
}

export { generateSitemaps };