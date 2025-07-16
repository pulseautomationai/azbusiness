import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import HeroSection from "~/components/homepage/hero";
import BusinessOwnerHeader from "~/components/homepage/business-owner-header";
import ComparisonTable from "~/components/homepage/comparison-table";
import AIShowcase from "~/components/homepage/ai-showcase";
import CTACards from "~/components/homepage/cta-cards";
import FeaturedBusinesses from "~/components/homepage/featured-businesses";
import Footer from "~/components/homepage/footer";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { withConvexRetry } from "~/utils/retry";
import { SEOGenerator } from "~/utils/seo";
import { generateMetaTags } from "~/components/seo/seo-meta";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";
import FAQSection from "~/components/ui/faq-section";

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
      <ComponentErrorBoundary componentName="Plan Cards">
        <CTACards />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Comparison Table">
        <ComparisonTable />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="AI Showcase">
        <AIShowcase />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Featured Businesses">
        <FeaturedBusinesses />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="FAQ Section">
        <FAQSection className="bg-agave-cream" />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}
