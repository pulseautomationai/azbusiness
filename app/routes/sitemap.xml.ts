import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/sitemap.xml";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  try {
    // Fetch all data needed for sitemap using the new SEO function
    const sitemapData = await fetchQuery(api.seo.getSitemapData);
    
    if (!sitemapData) {
      throw new Error("Failed to fetch sitemap data");
    }
    
    const { businesses, categories, cities } = sitemapData;

    const sitemap = generateSitemap(baseUrl, businesses, categories, cities);

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    
    // Return basic sitemap on error
    const basicSitemap = generateBasicSitemap(baseUrl);
    return new Response(basicSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes on error
      },
    });
  }
}

function generateSitemap(baseUrl: string, businesses: any[], categories: any[], cities: any[]): string {
  const now = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  // Homepage
  xml += `
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Static pages
  const staticPages = [
    { path: "/categories", priority: "0.9", changefreq: "weekly" },
    { path: "/cities", priority: "0.9", changefreq: "weekly" },
    { path: "/pricing", priority: "0.8", changefreq: "monthly" },
    { path: "/about", priority: "0.7", changefreq: "monthly" },
    { path: "/contact", priority: "0.7", changefreq: "monthly" },
    { path: "/blog", priority: "0.8", changefreq: "weekly" },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" },
    { path: "/terms", priority: "0.3", changefreq: "yearly" },
  ];

  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Category pages
  categories.forEach(category => {
    xml += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Category pages for each city
    cities.forEach(city => {
      xml += `
  <url>
    <loc>${baseUrl}/category/${category.slug}?city=${city.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  });

  // City pages
  cities.forEach(city => {
    xml += `
  <url>
    <loc>${baseUrl}/city/${city.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Business pages
  businesses.forEach(business => {
    const lastmod = business.updatedAt || business.createdAt || now;
    const priority = business.planTier === "power" ? "0.9" : 
                    business.planTier === "pro" ? "0.8" : "0.7";

    // New URL structure: /category/city/business-name
    if (business.category && business.city) {
      const categorySlug = business.category.slug || business.category.name.toLowerCase().replace(/\s+/g, "-");
      const citySlug = business.city.toLowerCase().replace(/\s+/g, "-");
      
      xml += `
  <url>
    <loc>${baseUrl}/${categorySlug}/${citySlug}/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>`;

      // Add image sitemap data if business has images
      if (business.logo) {
        xml += `
    <image:image>
      <image:loc>${business.logo}</image:loc>
      <image:title>${business.name} Logo</image:title>
      <image:caption>${business.name} - ${business.category?.name || "Service Provider"} in ${business.city}, Arizona</image:caption>
    </image:image>`;
      }

      if (business.images && business.images.length > 0) {
        business.images.slice(0, 5).forEach((image: any) => {
          xml += `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${image.title || business.name}</image:title>
      <image:caption>${image.description || `${business.name} - ${business.category?.name || "Service Provider"}`}</image:caption>
    </image:image>`;
        });
      }

      xml += `
  </url>`;
    }

    // Keep old URL structure for backwards compatibility
    xml += `
  <url>
    <loc>${baseUrl}/business/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
}

function generateBasicSitemap(baseUrl: string): string {
  const now = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/cities</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
}