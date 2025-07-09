import { ArrowRight, Rocket, Store } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function CTACards() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Add Your Business Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/10" />
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Add Your Business</CardTitle>
              <CardDescription className="text-base">
                Get listed for free and start reaching customers across Arizona
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Free basic listing
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Manage your business profile
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Receive customer reviews
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Get found by local customers
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/add-business">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade Listing Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/10" />
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rocket className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Upgrade Your Listing</CardTitle>
              <CardDescription className="text-base">
                Stand out from competitors with premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Homepage featured placement
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Priority in search results
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  Advanced analytics & leads
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span>
                  SEO-optimized blog posts
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link to="/pricing">
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}