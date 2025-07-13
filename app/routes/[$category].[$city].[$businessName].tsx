import { useParams, Navigate, redirect } from "react-router";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import PowerTierProfile from "~/components/business/power-tier-profile";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { api } from "../../convex/_generated/api";
import { SlugGenerator } from "~/utils/slug-generator";
import type { Route } from "./+types/[$category].[$city].[$businessName]";

export function meta({ params }: Route.MetaArgs) {
  // Since the loader is disabled, we'll use a generic meta for now
  const title = "Business Directory - AZ Business Services";
  const description = "Discover local businesses in Arizona. Find professional services, read reviews, and connect with trusted providers.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

/*
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
*/

export default function BusinessDetailPage() {
  const { category, city, businessName } = useParams();
  const { user } = useUser();
  
  // Reconstruct the full slug from URL parameters - do this before validation
  const fullSlug = category && city && businessName ? SlugGenerator.generateFullBusinessSlug(
    (businessName || '').replace(/-/g, ' '), // Convert back from slug
    (city || '').replace(/-/g, ' '),
    (category || '').replace(/-/g, ' ')
  ) : "";

  // Try to fetch business by the reconstructed slug - always call the hook
  const business = useQuery(
    api.businesses.getBusinessBySlug, 
    fullSlug ? { slug: fullSlug } : "skip"
  );
  
  // Get related businesses if we have the business data - always call the hook
  const expectedCategorySlug = business?.category?.name ? SlugGenerator.generateCategorySlug(business.category.name) : '';
  const expectedCitySlug = business?.city ? SlugGenerator.generateCitySlug(business.city) : '';
  
  const relatedBusinesses = useQuery(
    api.businesses.getBusinesses, 
    business ? {
      categorySlug: expectedCategorySlug,
      citySlug: expectedCitySlug,
      limit: 4,
    } : "skip"
  );
  
  // Validate URL parameters - after all hooks
  if (!category || !city || !businessName) {
    return <Navigate to="/categories" replace />;
  }

  // If business query is undefined, we're still loading
  const isLoading = business === undefined;
  
  // If business is null (not found), try alternative slug formats or redirect
  if (!isLoading && !business) {
    return <Navigate to="/categories" replace />;
  }

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
        <PowerTierProfile 
          business={business}
          relatedBusinesses={filteredRelatedBusinesses}
          reviews={[]} // Placeholder for now
          isOwner={isOwner}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}