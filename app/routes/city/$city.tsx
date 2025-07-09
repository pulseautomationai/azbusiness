import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import CityPageContent from "~/components/city/city-page-content";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/$city";

export function meta({ params }: Route.MetaArgs) {
  // Convert slug to title case for display
  const cityName = params.city
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const title = `${cityName}, AZ - Local Service Providers | AZ Business Services`;
  const description = `Find trusted home service professionals in ${cityName}, Arizona. Browse HVAC, plumbing, electrical, and more. Compare ratings, read reviews, get quotes.`;

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
  const citySlug = args.params.city;

  // Fetch city details
  const city = await fetchQuery(api.cities.getCityBySlug, {
    slug: citySlug,
  });

  // If city doesn't exist, redirect to cities page
  if (!city) {
    throw redirect("/cities");
  }

  // Parallel data fetching
  const [subscriptionData, businesses, categoriesWithCount] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch(() => null)
      : Promise.resolve(null),
    fetchQuery(api.businesses.getBusinesses, {
      citySlug: citySlug,
    }),
    fetchQuery(api.categories.getCategoriesWithCount),
  ]);

  // Filter categories to only show those with businesses in this city
  const businessesByCategory = businesses.reduce((acc, business) => {
    const categoryId = business.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId]++;
    return acc;
  }, {} as Record<string, number>);

  const relevantCategories = categoriesWithCount
    .filter(cat => businessesByCategory[cat._id] > 0)
    .map(cat => ({
      ...cat,
      cityBusinessCount: businessesByCategory[cat._id] || 0,
    }))
    .sort((a, b) => b.cityBusinessCount - a.cityBusinessCount);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    city,
    businesses: businesses || [],
    categories: relevantCategories,
    currentCitySlug: citySlug,
  };
}

export default function CityPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <CityPageContent 
        city={loaderData.city}
        businesses={loaderData.businesses}
        categories={loaderData.categories}
      />
      <Footer />
    </>
  );
}