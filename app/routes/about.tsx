import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Building2, Users, MapPin, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  const title = "About AZ Business Services - Arizona's Local Business Directory";
  const description = "Learn about AZ Business Services and our mission to connect Arizona businesses with local customers. Discover how we're helping the local economy thrive.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export async function loader() {
  return {
    isSignedIn: false, // Simplified for about page
    hasActiveSubscription: false,
  };
}

export default function AboutPage() {
  return (
    <>
      <Header loaderData={{ isSignedIn: false, hasActiveSubscription: false }} />
      <div className="min-h-screen bg-background pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <Building2 className="mx-auto h-16 w-16 text-primary mb-6" />
            <h1 className="text-4xl font-bold tracking-tight mb-6">
              About AZ Business Services
            </h1>
            <p className="text-xl text-muted-foreground">
              We're dedicated to helping Arizona businesses thrive by connecting them with local customers who need their services.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Arizona's diverse economy is built on the foundation of local businesses - from HVAC companies battling the desert heat to landscapers creating beautiful outdoor spaces. Our mission is to bridge the gap between these skilled professionals and the customers who need them most.
                </p>
                <p className="text-lg text-muted-foreground">
                  We believe that when local businesses succeed, entire communities prosper. That's why we've created a platform that not only showcases Arizona's finest service providers but also gives them the tools they need to grow and thrive in today's digital marketplace.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Users className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">For Customers</h3>
                    <p className="text-sm text-muted-foreground">Find trusted, verified local professionals with ease</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <TrendingUp className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">For Businesses</h3>
                    <p className="text-sm text-muted-foreground">Grow your customer base with powerful marketing tools</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Local Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're Arizona-born and bred. We understand the unique challenges and opportunities that come with doing business in the Grand Canyon State.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trust & Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every business on our platform is verified. We believe in honest reviews, clear pricing, and transparent business practices.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Partnership</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're not just a directory - we're your growth partner. Our tools and services are designed to help businesses of all sizes succeed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Arizona by the Numbers</h2>
              <p className="text-lg text-muted-foreground">
                Understanding the market we serve
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">7.3M+</div>
                <p className="text-muted-foreground">Arizona Residents</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground">Cities Covered</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">38</div>
                <p className="text-muted-foreground">Service Categories</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">365</div>
                <p className="text-muted-foreground">Days of Sunshine</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join the AZ Business Community?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Whether you're a business owner looking to grow or a customer seeking trusted local services, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/add-business">List Your Business</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/categories">Find Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}