import type { Route } from "./+types/sitemap-businesses[.]xml";

export async function loader(args: Route.LoaderArgs) {
  try {
    // TODO: Fetch all active businesses with their category and city info
    // const businesses = await fetchQuery(api.sitemaps.getAllActiveBusinessesForSitemap);
    const businesses: any[] = []; // Placeholder

    const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
    const currentDate = new Date().toISOString();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${businesses
  .map((business) => {
    // Generate business URL from category, city, and business name slugs
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
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating businesses sitemap:", error);
    return new Response("Error generating businesses sitemap", { status: 500 });
  }
}