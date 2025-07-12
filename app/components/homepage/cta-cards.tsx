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
          <Card className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white hover:shadow-lg transition-shadow">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/10" />
            <CardHeader className="px-6 py-6">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 mb-3 inline-block">
                Free Forever
              </span>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Claim Your Free Listing</CardTitle>
              <CardDescription className="text-base">
                Start building trust and visibility in your local market — completely free.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Appear in local search results</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Manage and improve your profile</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Collect and display customer reviews</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Add your logo for more credibility</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Get a free SEO backlink to your site</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Link to="/add-business">
                  Claim Your Free Listing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade Listing Card */}
          <Card className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white hover:shadow-lg transition-shadow">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/10" />
            <CardHeader className="px-6 py-6">
              <span className="text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 mb-3 inline-block">
                Premium Features
              </span>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rocket className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Boost Visibility & Get More Leads</CardTitle>
              <CardDescription className="text-base">
                Unlock premium tools to help your business grow faster across Arizona.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Get featured on the homepage for added visibility</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Show up higher in search results</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Receive leads sent straight to your inbox</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>1 blog post written for you every month</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>AI-enhanced listings for style and performance</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                <Link to="/pricing">
                  Explore Premium Features
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