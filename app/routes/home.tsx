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
  const { SEOGenerator } = require("~/utils/seo");
  const { generateMetaTags } = require("~/components/seo/seo-meta");
  const seo = SEOGenerator.generateHomepageSEO();
  const { metaTags, links } = generateMetaTags(seo);
  
  return [
    ...metaTags,
    ...links,
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
  const { SEOGenerator } = require("~/utils/seo");
  const seo = SEOGenerator.generateHomepageSEO();
  
  return (
    <>
      {/* JSON-LD Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seo.jsonLd),
        }}
      />
      
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
