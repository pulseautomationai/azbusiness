import { getAuth } from "@clerk/react-router/ssr.server";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Building2, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/add-business";

export function meta({}: Route.MetaArgs) {
  const title = "Add Your Business - AZ Business Services";
  const description = "List your Arizona business for free and start reaching local customers. Get found by people searching for your services.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: false, // Simplified for add-business page
  };
}

export default function AddBusinessPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <div className="min-h-screen bg-background pt-24">
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Building2 className="mx-auto h-16 w-16 text-primary mb-6" />
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Add Your Business to AZ Business Services
              </h1>
              <p className="text-xl text-muted-foreground">
                Join thousands of Arizona businesses reaching local customers every day
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 mb-12">
              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Why List Your Business?</CardTitle>
                  <CardDescription>
                    Get discovered by customers actively searching for your services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Get found by local customers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Manage your business profile</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Receive customer reviews</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Lead generation tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Mobile-optimized listings</span>
                  </div>
                </CardContent>
              </Card>

              {/* Process */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>
                    Get your business online in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Create Your Account</p>
                      <p className="text-sm text-muted-foreground">Sign up with your email address</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Add Business Details</p>
                      <p className="text-sm text-muted-foreground">Tell us about your services and location</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Go Live</p>
                      <p className="text-sm text-muted-foreground">Your listing appears immediately</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center">
              {loaderData.isSignedIn ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button size="lg" asChild>
                    <Link to="/sign-up">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}