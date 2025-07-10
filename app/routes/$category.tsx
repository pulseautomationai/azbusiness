import { useParams, Navigate } from "react-router";
import { useQuery } from "convex/react";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import CategoryPageContent from "~/components/category/category-page-content";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/$category";

export function meta({ params }: Route.MetaArgs) {
  // Convert slug to title case for display
  const categoryName = params.category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const title = `${categoryName} in Arizona - Find Local Professionals | AZ Business Services`;
  const description = `Find reliable ${categoryName.toLowerCase()} specialists in Arizona. Compare top-rated local professionals, read reviews, and get quotes for your project.`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

// Temporarily disabled for SPA mode
/*
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  const categorySlug = args.params.category;

  // Fetch category details
  const category = await fetchQuery(api.categories.getCategoryBySlug, {
    slug: categorySlug,
  });

  // If category doesn't exist, redirect to categories page
  if (!category) {
    throw redirect("/categories");
  }

  // Parallel data fetching
  const [subscriptionData, businesses, cities] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch(() => null)
      : Promise.resolve(null),
    fetchQuery(api.businesses.getBusinesses, {
      categorySlug: categorySlug,
    }),
    fetchQuery(api.cities.getCitiesWithCount, {}),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    category,
    businesses: businesses || [],
    cities: cities || [],
    currentCategorySlug: categorySlug,
  };
}
*/

export default function CategoryPage() {
  const { category: categorySlug } = useParams();
  
  // Fetch data client-side
  const category = useQuery(api.categories.getCategoryBySlug, { slug: categorySlug || "" });
  const businesses = useQuery(api.businesses.getBusinesses, { categorySlug: categorySlug || "" });
  const cities = useQuery(api.cities.getCitiesWithCount, {});
  
  const isLoading = category === undefined || businesses === undefined || cities === undefined;
  
  // Redirect to categories page if category doesn't exist (once loaded)
  if (!isLoading && !category) {
    return <Navigate to="/categories" replace />;
  }
  
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-24">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading category information...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ComponentErrorBoundary componentName="Category Page">
        <CategoryPageContent 
          category={category}
          businesses={businesses || []}
          cities={cities || []}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}