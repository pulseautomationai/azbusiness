import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import BusinessProfile from "~/components/business/business-profile";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { api } from "../../convex/_generated/api";
import { SlugGenerator } from "~/utils/slug-generator";
import type { Route } from "./+types/[$category].[$city].[$businessName]";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.business) {
    return [{ title: "Business Not Found - AZ Business Services" }];
  }

  const { business } = data;
  const title = `${business.name} - ${business.city}, AZ | AZ Business Services`;
  const description = business.shortDescription || 
    `Contact ${business.name} in ${business.city}, Arizona. ${business.category?.name || "Local service provider"} offering professional services. Read reviews and get a quote.`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "local.business" },
    { property: "og:url", content: `https://azbusiness.com/${data.params.category}/${data.params.city}/${data.params.businessName}` },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
    
    // Local business structured data
    { name: "geo.region", content: `US-AZ` },
    { name: "geo.placename", content: business.city },
    { name: "geo.position", content: business.coordinates ? `${business.coordinates.lat};${business.coordinates.lng}` : "" },
    { name: "ICBM", content: business.coordinates ? `${business.coordinates.lat}, ${business.coordinates.lng}` : "" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  const { category, city, businessName } = args.params;

  // Validate URL parameters
  if (!category || !city || !businessName) {
    throw redirect("/categories");
  }

  // Reconstruct the full slug from URL parameters
  const fullSlug = SlugGenerator.generateFullBusinessSlug(
    businessName.replace(/-/g, ' '), // Convert back from slug
    city.replace(/-/g, ' '),
    category.replace(/-/g, ' ')
  );

  // Try to fetch business by the reconstructed slug
  let business = await fetchQuery(api.businesses.getBusinessBySlug, {
    slug: fullSlug,
  });

  // If not found, try alternative slug formats
  if (!business) {
    // Try with the URL path format
    const urlPath = `/${category}/${city}/${businessName}`;
    business = await fetchQuery(api.businesses.getBusinessByUrlPath, {
      urlPath: urlPath,
    });
  }

  // If still not found, redirect to categories
  if (!business) {
    throw redirect("/categories");
  }

  // Validate that the URL parameters match the business data
  const expectedCategorySlug = SlugGenerator.generateCategorySlug(business.category?.name || '');
  const expectedCitySlug = SlugGenerator.generateCitySlug(business.city);
  const expectedBusinessSlug = SlugGenerator.generateBusinessNameSlug(business.name);

  // If URL doesn't match expected format, redirect to correct URL
  if (
    category !== expectedCategorySlug ||
    city !== expectedCitySlug ||
    businessName !== expectedBusinessSlug
  ) {
    const correctUrl = `/${expectedCategorySlug}/${expectedCitySlug}/${expectedBusinessSlug}`;
    throw redirect(correctUrl);
  }

  // Parallel data fetching
  const [subscriptionData, relatedBusinesses, reviews] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch(() => null)
      : Promise.resolve(null),
    
    // Get related businesses (same category, same city)
    fetchQuery(api.businesses.getBusinesses, {
      categorySlug: expectedCategorySlug,
      citySlug: expectedCitySlug,
      limit: 4,
    }).then(businesses => 
      businesses.filter(b => b._id !== business._id).slice(0, 3)
    ),
    
    // Get reviews (placeholder for now)
    Promise.resolve([]),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    business,
    relatedBusinesses: relatedBusinesses || [],
    reviews: reviews || [],
    isOwner: userId === business.ownerId,
    params: { category, city, businessName },
  };
}

export default function BusinessDetailPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <ComponentErrorBoundary componentName="Business Profile">
        <BusinessProfile 
          business={loaderData.business}
          relatedBusinesses={loaderData.relatedBusinesses}
          reviews={loaderData.reviews}
          isOwner={loaderData.isOwner}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}