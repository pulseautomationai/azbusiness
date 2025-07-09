import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import CategoryPageContent from "~/components/category/category-page-content";
import { api } from "../../../convex/_generated/api";
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
    fetchQuery(api.cities.getCitiesWithCount),
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

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <CategoryPageContent 
        category={loaderData.category}
        businesses={loaderData.businesses}
        cities={loaderData.cities}
      />
      <Footer />
    </>
  );
}