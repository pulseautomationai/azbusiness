import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/cities";

export function meta({}: Route.MetaArgs) {
  const title = "Browse Arizona Cities - AZ Business Services";
  const description = "Find local service providers in cities across Arizona. Browse businesses in Phoenix, Tucson, Mesa, Scottsdale, and more.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  const [subscriptionData, citiesByRegion] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch(() => null)
      : Promise.resolve(null),
    fetchQuery(api.cities.getCitiesByRegion),
  ]);

  // Get business counts for each city
  const citiesWithCount = await fetchQuery(api.cities.getCitiesWithCount, {});
  const cityCountMap = citiesWithCount.reduce((acc, city) => {
    acc[city.slug] = city.businessCount;
    return acc;
  }, {} as Record<string, number>);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    citiesByRegion: citiesByRegion || {},
    cityCountMap,
  };
}

export default function CitiesPage({ loaderData }: Route.ComponentProps) {
  const regionOrder = [
    "Phoenix Metro Area",
    "Tucson Metro Area",
    "Northern Arizona",
    "Western Arizona",
    "Eastern Arizona",
    "Other",
  ];

  return (
    <>
      <Header loaderData={loaderData} />
      <div className="min-h-screen bg-background pt-24">
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Browse Arizona Cities
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Find local service providers in cities across the Grand Canyon State
              </p>
            </div>

            <div className="space-y-12">
              {regionOrder.map((region) => {
                const cities = loaderData.citiesByRegion[region];
                if (!cities || cities.length === 0) return null;

                return (
                  <div key={region}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-primary" />
                      {region}
                    </h2>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {cities.map((city: any) => {
                        const businessCount = loaderData.cityCountMap[city.slug] || 0;
                        
                        return (
                          <Link key={city._id} to={`/city/${city.slug}`}>
                            <Card className="h-full hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  {city.name}
                                </CardTitle>
                                <CardDescription className="flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    {city.population && (
                                      <>
                                        <Users className="h-3 w-3" />
                                        {city.population.toLocaleString()}
                                      </>
                                    )}
                                  </span>
                                  {businessCount > 0 && (
                                    <Badge variant="secondary">
                                      {businessCount} {businessCount === 1 ? "business" : "businesses"}
                                    </Badge>
                                  )}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SEO Content */}
            <div className="mt-16 prose prose-lg mx-auto max-w-3xl dark:prose-invert">
              <h2>Local Services Across Arizona</h2>
              <p>
                From the bustling Phoenix metropolitan area to the scenic cities of Northern Arizona, 
                our directory helps you find trusted service providers wherever you are in the state. 
                Each city page features local businesses specializing in HVAC, plumbing, electrical work, 
                and dozens of other essential services.
              </p>
              <p>
                Arizona's diverse geography and climate create unique challenges for homeowners and 
                businesses. Whether you're dealing with the intense heat of the Sonoran Desert or 
                the winter snow in Flagstaff, local professionals understand your specific needs 
                and are ready to help.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}