import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

const http = httpRouter();

// Helper to generate XML header
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

// Static pages sitemap
http.route({
  path: "/sitemap-pages.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const baseUrl = process.env.FRONTEND_URL || "https://azbusinessservices.com";
    const currentDate = new Date().toISOString();
    
    const pages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/rankings", priority: "0.9", changefreq: "hourly" },
      { url: "/about", priority: "0.5", changefreq: "monthly" },
      { url: "/pricing", priority: "0.8", changefreq: "weekly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
      { url: "/claim-business", priority: "0.7", changefreq: "weekly" },
      { url: "/for-businesses", priority: "0.7", changefreq: "weekly" },
    ];
    
    const urls = pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

    const sitemap = `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }),
});

// Dynamic sitemap.xml generation
http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const currentDate = new Date().toISOString();
    const baseUrl = process.env.FRONTEND_URL || "https://azbusinessservices.com";
    
    const sitemap = `${xmlHeader}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-businesses.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-category-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  }),
});

// Dynamic businesses sitemap
http.route({
  path: "/sitemap-businesses.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const baseUrl = process.env.FRONTEND_URL || "https://azbusinessservices.com";
    
    // Fetch all active businesses
    const businesses = await ctx.runQuery(api.sitemaps.getAllActiveBusinessesForSitemap);
    
    const urls = businesses.map((business: any) => {
      const categorySlug = business.category?.slug || 'services';
      const citySlug = business.city.toLowerCase().replace(/\s+/g, '-');
      const businessSlug = business.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const url = `/${categorySlug}/${citySlug}/${businessSlug}`;
      const lastmod = new Date(business.updatedAt).toISOString();
      
      let priority = "0.6";
      if (business.planTier === "power") {
        priority = "0.9";
      } else if (business.planTier === "pro") {
        priority = "0.8";
      } else if (business.rating >= 4.5) {
        priority = "0.7";
      }

      return `  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    const sitemap = `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  }),
});

// Dynamic categories sitemap
http.route({
  path: "/sitemap-categories.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const baseUrl = process.env.FRONTEND_URL || "https://azbusinessservices.com";
    const currentDate = new Date().toISOString();
    
    // Fetch all active categories
    const categories = await ctx.runQuery(api.sitemaps.getAllActiveCategories);
    
    const urls = categories.map((category: any) => `  <url>
    <loc>${baseUrl}/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

    const sitemap = `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }),
});

// Dynamic cities sitemap
http.route({
  path: "/sitemap-cities.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const baseUrl = process.env.FRONTEND_URL || "https://azbusinessservices.com";
    const currentDate = new Date().toISOString();
    
    // Fetch all active cities
    const cities = await ctx.runQuery(api.sitemaps.getAllActiveCities);
    
    const urls = cities.map((city: any) => `  <url>
    <loc>${baseUrl}/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

    const sitemap = `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }),
});

// Dynamic category+city combinations sitemap
http.route({
  path: "/sitemap-category-cities.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const baseUrl = process.env.FRONTEND_URL || "https://azbusinessservices.com";
    const currentDate = new Date().toISOString();
    
    // Fetch categories and cities
    const [categories, cities] = await Promise.all([
      ctx.runQuery(api.sitemaps.getAllActiveCategories),
      ctx.runQuery(api.sitemaps.getAllActiveCities)
    ]);
    
    const combinations: Array<{url: string; priority: string}> = [];
    categories.forEach((category: any) => {
      cities.forEach((city: any) => {
        combinations.push({
          url: `/${category.slug}/${city.slug}`,
          priority: "0.7"
        });
      });
    });

    const urls = combinations.map(combo => `  <url>
    <loc>${baseUrl}${combo.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${combo.priority}</priority>
  </url>`).join('\n');

    const sitemap = `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }),
});

export default http;