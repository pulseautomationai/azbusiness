import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import HeroSection from "~/components/homepage/hero";
import FeaturedBusinesses from "~/components/homepage/featured-businesses";
import CTACards from "~/components/homepage/cta-cards";
import Footer from "~/components/homepage/footer";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title = "AZ Business Services - Find Trusted Local Service Providers in Arizona";
  const description =
    "Connect with verified HVAC, plumbing, electrical, and other home service professionals across Arizona. Get quotes, read reviews, and hire the best local contractors.";
  const keywords = "Arizona business directory, local services, HVAC, plumbing, electrical, contractors, home services, Phoenix, Tucson, Mesa";
  const siteUrl = "https://azbusiness.services/";
  const imageUrl = "/favicon.png"; // We'll use a placeholder for now

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "AZ Business Services" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "AZ Business Services" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Parallel data fetching
  const [subscriptionData, featuredBusinesses, cities] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch((error) => {
          console.error("Failed to fetch subscription data:", error);
          return null;
        })
      : Promise.resolve(null),
    fetchQuery(api.businesses.getFeaturedBusinesses, { limit: 6 }).catch((error) => {
      console.error("Failed to fetch featured businesses:", error);
      return [];
    }),
    fetchQuery(api.cities.getCities).catch((error) => {
      console.error("Failed to fetch cities:", error);
      return [];
    }),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    featuredBusinesses: featuredBusinesses || [],
    cities: cities || [],
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <HeroSection cities={loaderData.cities} />
      <CTACards />
      <FeaturedBusinesses businesses={loaderData.featuredBusinesses} />
      <Footer />
    </>
  );
}
