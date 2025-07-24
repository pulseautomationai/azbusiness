import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import HeroSection from "~/components/homepage/hero";
import TopPerformers from "~/components/homepage/top-performers";
import TopPerformersRanked from "~/components/homepage/top-performers-ranked";
import BusinessRankingsTable from "~/components/homepage/business-rankings-table";
import HowItWorks from "~/components/homepage/how-it-works";
import CityChampions from "~/components/homepage/city-champions";
import CityChampionsRanked from "~/components/homepage/city-champions-ranked";
import CategoryBest from "~/components/homepage/category-best";
import SmartRecommendations from "~/components/homepage/smart-recommendations";
import SuccessStories from "~/components/homepage/success-stories";
import SocialProof from "~/components/homepage/social-proof";
import Footer from "~/components/homepage/footer";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { withConvexRetry } from "~/utils/retry";
import { SEOGenerator } from "~/utils/seo";
import { generateMetaTags } from "~/components/seo/seo-meta";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";
import ConsumerFAQ from "~/components/homepage/consumer-faq";

export function meta({}: Route.MetaArgs) {
  const seo = SEOGenerator.generateHomepageSEO();
  const { metaTags, links } = generateMetaTags(seo);
  
  return [
    ...metaTags,
    ...links,
    { name: "author", content: "AZ Business Services" },
  ];
}

// Temporarily disabled for SPA mode
/*
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
*/

export default function Home() {
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
      
      <Header />
      <ComponentErrorBoundary componentName="Hero Section">
        <HeroSection />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Top Performers">
        <TopPerformersRanked />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Category Best">
        <CategoryBest />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="City Champions">
        <CityChampionsRanked />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Business Rankings Table">
        <BusinessRankingsTable />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="How It Works">
        <HowItWorks />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Smart Recommendations">
        <SmartRecommendations />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Success Stories">
        <SuccessStories />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Social Proof">
        <SocialProof />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="FAQ Section">
        <ConsumerFAQ className="bg-agave-cream" />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}
