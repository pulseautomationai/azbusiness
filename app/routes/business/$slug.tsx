import { useParams, Navigate, redirect } from "react-router";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
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

// Temporarily disabled for SPA mode
/*
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
*/

export default function BusinessPage() {
  const { slug: businessSlug } = useParams();
  const { user } = useUser();
  
  // Fetch business details client-side
  const business = useQuery(api.businesses.getBusinessBySlug, {
    slug: businessSlug || "",
  });

  const isLoading = business === undefined;
  
  // If business doesn't exist, redirect to categories
  if (!isLoading && !business) {
    return <Navigate to="/categories" replace />;
  }

  // Get related businesses if we have the business data
  const relatedBusinesses = useQuery(
    api.businesses.getBusinesses,
    business ? {
      categorySlug: business.category?.slug || "",
      citySlug: business.city.toLowerCase().replace(/\s+/g, "-"),
      limit: 4,
    } : "skip"
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-24">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading business information...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Filter out the current business from related businesses and limit to 3
  const filteredRelatedBusinesses = relatedBusinesses 
    ? relatedBusinesses.filter(b => b._id !== business._id).slice(0, 3)
    : [];

  const isOwner = user?.id === business.ownerId;

  return (
    <>
      <Header />
      <ComponentErrorBoundary componentName="Business Profile">
        <BusinessProfile 
          business={business}
          relatedBusinesses={filteredRelatedBusinesses}
          reviews={[]} // Placeholder for reviews
          isOwner={isOwner}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}