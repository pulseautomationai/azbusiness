import { useParams, Navigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import CityRankingsPage from "~/components/city/city-rankings-page";
import CategoryRankingsPage from "~/components/category/category-rankings-page";
import { generateMetaForRoute } from "~/utils/seo-middleware";

export function meta({ params }: { params: Record<string, string | undefined> }) {
  const { slug } = params;
  
  // Since we can't determine if it's a city or category at build time,
  // we'll generate generic SEO that works for both
  // The actual determination happens at runtime in the component
  
  // List of known categories to help with SEO
  const knownCategories = [
    "heating-and-air-conditioning",
    "plumbing",
    "landscaping",
    "house-cleaning",
    "electrical",
    "handyman",
    "pool-and-spa-services",
    "roofing",
    "pest-control",
    "garage-door-repair"
  ];
  
  // If it's a known category, generate category SEO
  if (knownCategories.includes(slug || "")) {
    return generateMetaForRoute("category-rankings", { category: slug });
  }
  
  // Otherwise assume it's a city
  return generateMetaForRoute("city-rankings", { slug });
}

export default function SlugPage() {
  const { slug } = useParams();
  
  // Exclude specific routes that should not be handled by this catch-all
  const excludedRoutes = [
    'claim-business', 'sign-in', 'sign-up', 'dashboard', 'admin', 
    'pricing', 'about', 'contact', 'terms', 'privacy', 'blog',
    'for-businesses', 'categories', 'cities', 'rankings', 'search',
    'add-business', 'success', 'subscription-required', 'claim-listing',
    'privacy-policy', 'terms-of-service', 'business'
  ];
  
  if (excludedRoutes.includes(slug || '')) {
    // Return empty div - let the actual route handle this
    return <div />;
  }
  
  // Check if it's a city
  const city = useQuery(api.cities.getBySlug, { slug: slug || "" });
  
  // Check if it's a category
  const category = useQuery(api.categories.getCategoryBySlug, { slug: slug || "" });
  
  // Still loading
  if (city === undefined || category === undefined) {
    return <div>Loading...</div>;
  }
  
  // If it's a city, render city rankings page
  if (city) {
    return <CityRankingsPage />;
  }
  
  // If it's a category, render category rankings page
  if (category) {
    return <CategoryRankingsPage />;
  }
  
  // Neither city nor category found - redirect to home
  return <Navigate to="/" replace />;
}