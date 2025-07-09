import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import BusinessProfile from "~/components/business/business-profile";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/$slug";

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
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  const businessSlug = args.params.slug;

  // Fetch business details
  const business = await fetchQuery(api.businesses.getBusinessBySlug, {
    slug: businessSlug,
  });

  // If business doesn't exist, redirect to categories
  if (!business) {
    throw redirect("/categories");
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
      categorySlug: business.category?.slug,
      citySlug: business.city.toLowerCase().replace(/\s+/g, "-"),
      limit: 4,
    }).then(businesses => 
      businesses.filter(b => b._id !== business._id).slice(0, 3)
    ),
    // Get reviews (we'll implement this function later)
    Promise.resolve([]), // Placeholder for reviews
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    business,
    relatedBusinesses: relatedBusinesses || [],
    reviews: reviews || [],
    isOwner: userId === business.ownerId,
  };
}

export default function BusinessPage({ loaderData }: Route.ComponentProps) {
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