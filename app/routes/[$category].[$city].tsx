import { useParams, Navigate } from "react-router";
import { useQuery } from "convex/react";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import CategoryCityPageContent from "~/components/category-city/category-city-page-content";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import { api } from "convex/_generated/api";
import type { Route } from "./+types/[$category].[$city]";

export function meta({ params }: Route.MetaArgs) {
  // Convert slugs to display names
  const categoryName = params.category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const cityName = params.city
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const title = `${categoryName} in ${cityName}, Arizona - Local Professionals | AZ Business Services`;
  const description = `Find trusted ${categoryName.toLowerCase()} professionals in ${cityName}, Arizona. Compare top-rated local service providers, read reviews, and connect directly with verified businesses.`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `https://azbusinessservices.com/${params.category}/${params.city}` },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "keywords", content: `${categoryName}, ${cityName}, Arizona, local business, service providers, professionals` },
    { name: "author", content: "AZ Business Services" },
    { name: "robots", content: "index, follow" },
  ];
}

export default function CategoryCityPage() {
  const { category: categorySlug, city: citySlug } = useParams();
  
  // Validate that both parameters exist
  if (!categorySlug || !citySlug) {
    return <Navigate to="/categories" replace />;
  }
  
  // Fetch category and city data for validation
  const category = useQuery(api.categories.getCategoryBySlug, { slug: categorySlug });
  const city = useQuery(api.cities.getCityBySlug, { slug: citySlug });
  
  // Fetch businesses for this category/city combination
  const businesses = useQuery(api.businesses.getBusinesses, 
    (category !== null && city !== null) ? {
      categorySlug: categorySlug,
      citySlug: citySlug,
    } : "skip"
  );
  
  const isLoading = category === undefined || city === undefined;
  const hasValidData = category !== null && city !== null;
  
  // If either category or city doesn't exist, redirect to categories
  if (!isLoading && (!category || !city)) {
    return <Navigate to="/categories" replace />;
  }
  
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white pt-24">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-ironwood-charcoal/80">Loading category and city information...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!hasValidData) {
    return <Navigate to="/categories" replace />;
  }
  
  // Wait for businesses to load
  if (businesses === undefined) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white pt-24">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-ironwood-charcoal/80">Loading businesses...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ComponentErrorBoundary componentName="Category City Page">
        <CategoryCityPageContent 
          category={category}
          city={city}
          businesses={businesses || []}
          categorySlug={categorySlug}
          citySlug={citySlug}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}