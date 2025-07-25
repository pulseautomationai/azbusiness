import { useParams, Navigate, redirect } from "react-router";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import TierBasedBusinessProfile from "~/components/business/tier-based-business-profile";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/$slug";

export function meta({ params }: Route.MetaArgs) {
  // Simplified meta without data dependency
  const title = "Business Directory - AZ Business Services";
  const description = "Discover local businesses in Arizona. Find professional services, read reviews, and connect with trusted providers.";

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

  // Fetch reviews for the business
  const reviews = useQuery(
    api.businesses.getBusinessReviews,
    business ? {
      businessId: business._id,
      limit: 50
    } : "skip"
  );

  // Filter out the current business from related businesses and limit to 3
  const filteredRelatedBusinesses = relatedBusinesses 
    ? relatedBusinesses.filter(b => b._id !== business._id).slice(0, 3)
    : [];

  const isOwner = user?.id === business.ownerId;

  return (
    <>
      <Header />
      <ComponentErrorBoundary componentName="Business Profile">
        <TierBasedBusinessProfile 
          business={business}
          relatedBusinesses={filteredRelatedBusinesses}
          reviews={reviews || []}
          isOwner={isOwner}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}