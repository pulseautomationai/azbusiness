import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { useQuery } from "convex/react";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/categories";

export function meta({}: Route.MetaArgs) {
  const title = "Browse Services by Category - AZ Business Services";
  const description = "Explore all service categories available in Arizona. From HVAC and plumbing to landscaping and home security, find the right professionals for your needs.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

// Temporarily disabled for SPA mode
/*
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  const [subscriptionData, categories] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch(() => null)
      : Promise.resolve(null),
    fetchQuery(api.categories.getCategoriesWithCount),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    categories: categories || [],
  };
}
*/

export default function CategoriesPage() {
  // Fetch categories client-side
  const categories = useQuery(api.categories.getCategoriesWithCount) || [];
  const isLoading = categories === undefined;
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-24">
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Browse Services by Category
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Find the right professionals for your home and business needs
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-muted-foreground">Loading categories...</div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category) => (
                <Link key={category._id} to={`/${category.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <span className="text-3xl">{category.icon}</span>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {category.name}
                          </CardTitle>
                          {category.businessCount > 0 && (
                            <CardDescription>
                              {category.businessCount} {category.businessCount === 1 ? "business" : "businesses"}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}