import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import HeroSection from "~/components/homepage/hero";
import FeaturedBusinesses from "~/components/homepage/featured-businesses";
import CTACards from "~/components/homepage/cta-cards";
import Footer from "~/components/homepage/footer";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { withConvexRetry } from "~/utils/retry";
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

  // Create retryable query functions
  const fetchSubscriptionData = () => 
    fetchQuery(api.subscriptions.checkUserSubscriptionStatus, { userId: userId || '' });
  
  const fetchFeaturedBusinesses = () => 
    fetchQuery(api.businesses.getFeaturedBusinesses, { limit: 6 });
  
  const fetchCities = () => 
    fetchQuery(api.cities.getCities);

  // Parallel data fetching with retry logic
  const [subscriptionData, featuredBusinesses, cities] = await Promise.all([
    userId
      ? withConvexRetry(fetchSubscriptionData, {
          maxAttempts: 3,
          baseDelay: 500,
          onRetry: (error, attempt) => {
            console.warn(`Retrying subscription fetch (attempt ${attempt}):`, error.message);
          }
        }).catch((error) => {
          console.error("Failed to fetch subscription data after retries:", error);
          return null;
        })
      : Promise.resolve(null),
    
    withConvexRetry(fetchFeaturedBusinesses, {
      maxAttempts: 3,
      baseDelay: 500,
      onRetry: (error, attempt) => {
        console.warn(`Retrying featured businesses fetch (attempt ${attempt}):`, error.message);
      }
    }).catch((error) => {
      console.error("Failed to fetch featured businesses after retries:", error);
      return [];
    }),
    
    withConvexRetry(fetchCities, {
      maxAttempts: 3,
      baseDelay: 500,
      onRetry: (error, attempt) => {
        console.warn(`Retrying cities fetch (attempt ${attempt}):`, error.message);
      }
    }).catch((error) => {
      console.error("Failed to fetch cities after retries:", error);
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
      <ComponentErrorBoundary componentName="Hero Section">
        <HeroSection cities={loaderData.cities} />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="CTA Cards">
        <CTACards />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Featured Businesses">
        <FeaturedBusinesses businesses={loaderData.featuredBusinesses} />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}
