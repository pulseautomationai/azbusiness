import type { Route } from "./+types/sitemap[.]xml";

export async function loader(args: Route.LoaderArgs) {
  try {

    const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
    const currentDate = new Date().toISOString();

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages sitemap -->
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Businesses sitemap -->
  <sitemap>
    <loc>${baseUrl}/sitemap-businesses.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Categories sitemap -->
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Cities sitemap -->
  <sitemap>
    <loc>${baseUrl}/sitemap-cities.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Blog sitemap -->
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
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
  } catch (error) {
    console.error("Error generating main sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}