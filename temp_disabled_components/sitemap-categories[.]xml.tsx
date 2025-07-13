import type { Route } from "./+types/sitemap-categories[.]xml";

export async function loader(args: Route.LoaderArgs) {
  try {
    // TODO: Fetch categories and cities
    // const [categories, cities] = await Promise.all([
    //   fetchQuery(api.sitemaps.getAllActiveCategories),
    //   fetchQuery(api.sitemaps.getAllActiveCities),
    // ]);
    const categories: any[] = [];
    const cities: any[] = [];

    const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
    const currentDate = new Date().toISOString();

    const urls: string[] = [];

    // Add main category pages
    categories.forEach((category) => {
      urls.push(`  <url>
    <loc>${baseUrl}/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // Add category + city combination pages
    categories.forEach((category) => {
      cities.forEach((city) => {
        const citySlug = city.slug;
        urls.push(`  <url>
    <loc>${baseUrl}/${category.slug}/${citySlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return new Response("Error generating categories sitemap", { status: 500 });
  }
}