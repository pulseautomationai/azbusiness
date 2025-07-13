import type { Route } from "./+types/sitemap-cities[.]xml";

export async function loader(args: Route.LoaderArgs) {
  try {
    // TODO: Fetch cities
    // const cities = await fetchQuery(api.sitemaps.getAllActiveCities);
    const cities: any[] = [];

    const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
    const currentDate = new Date().toISOString();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cities
  .map((city) => {
    return `  <url>
    <loc>${baseUrl}/city/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating cities sitemap:", error);
    return new Response("Error generating cities sitemap", { status: 500 });
  }
}