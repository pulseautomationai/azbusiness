import { getAuth } from "@clerk/react-router/ssr.server";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/blog";

export function meta({}: Route.MetaArgs) {
  const title = "Arizona Business Blog - Tips, Guides & Local Insights | AZ Business Services";
  const description = "Get expert advice for Arizona businesses. Local marketing tips, industry insights, and guides to help your business grow in the Grand Canyon State.";

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

  // TODO: Fetch blog posts from Convex
  const samplePosts = [
    {
      id: "1",
      title: "10 Essential Marketing Tips for Arizona HVAC Companies",
      excerpt: "Learn how to market your HVAC business effectively in Arizona's unique climate and competitive landscape.",
      author: "AZ Business Team",
      publishedAt: "2025-01-05",
      tags: ["HVAC", "Marketing", "Phoenix"],
      slug: "hvac-marketing-tips-arizona",
    },
    {
      id: "2", 
      title: "Best Practices for Local SEO in Arizona Cities",
      excerpt: "Dominate local search results in Phoenix, Tucson, Mesa, and other Arizona markets with these proven SEO strategies.",
      author: "SEO Expert",
      publishedAt: "2025-01-03",
      tags: ["SEO", "Local Business", "Digital Marketing"],
      slug: "local-seo-arizona-businesses",
    },
    {
      id: "3",
      title: "Seasonal Business Strategies for Arizona's Climate",
      excerpt: "How to adapt your service business for Arizona's extreme weather patterns and seasonal demand fluctuations.",
      author: "Business Consultant",
      publishedAt: "2025-01-01",
      tags: ["Business Strategy", "Seasonal", "Arizona"],
      slug: "seasonal-business-strategies-arizona",
    },
  ];

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: false, // Simplified for blog page
    posts: samplePosts,
  };
}
*/

export default function BlogPage() {
  // Temporary sample posts for SPA mode
  const samplePosts = [
    {
      id: "1",
      title: "10 Essential Marketing Tips for Arizona HVAC Companies",
      excerpt: "Learn how to market your HVAC business effectively in Arizona's unique climate and competitive landscape.",
      author: "AZ Business Team",
      publishedAt: "2025-01-05",
      tags: ["HVAC", "Marketing", "Phoenix"],
      slug: "hvac-marketing-tips-arizona",
    },
    {
      id: "2", 
      title: "Best Practices for Local SEO in Arizona Cities",
      excerpt: "Dominate local search results in Phoenix, Tucson, Mesa, and other Arizona markets with these proven SEO strategies.",
      author: "SEO Expert",
      publishedAt: "2025-01-03",
      tags: ["SEO", "Local Business", "Digital Marketing"],
      slug: "local-seo-arizona-cities",
    },
    {
      id: "3",
      title: "How to Handle Summer Seasonality for Arizona Businesses",
      excerpt: "Navigate the unique challenges of Arizona's extreme summer heat and its impact on customer behavior and business operations.",
      author: "Business Coach",
      publishedAt: "2025-01-01",
      tags: ["Business Strategy", "Seasonal", "Arizona"],
      slug: "seasonal-business-strategies-arizona",
    },
  ];
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32">
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Arizona Business Blog
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Expert insights, local tips, and practical guides to help your Arizona business thrive
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Featured Post */}
              <div className="lg:col-span-2">
                <Card className="mb-8">
                  <CardHeader>
                    <Badge className="w-fit mb-4">Featured Post</Badge>
                    <CardTitle className="text-2xl">
                      <Link 
                        to={`/blog/${samplePosts[0].slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {samplePosts[0].title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {samplePosts[0].excerpt}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {samplePosts[0].author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(samplePosts[0].publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {samplePosts[0].tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link 
                      to={`/blog/${samplePosts[0].slug}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>

                {/* Recent Posts */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Recent Posts</h2>
                  {samplePosts.slice(1).map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle>
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-primary hover:underline"
                        >
                          Read More
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["HVAC", "Plumbing", "Electrical", "Marketing", "SEO", "Business Tips"].map((category) => (
                        <Link 
                          key={category}
                          to={`/blog?category=${category.toLowerCase()}`}
                          className="block text-sm hover:text-primary transition-colors"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Cities */}
                <Card>
                  <CardHeader>
                    <CardTitle>By City</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["Phoenix", "Tucson", "Mesa", "Scottsdale", "Chandler"].map((city) => (
                        <Link 
                          key={city}
                          to={`/blog?city=${city.toLowerCase()}`}
                          className="block text-sm hover:text-primary transition-colors"
                        >
                          {city}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Newsletter */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stay Updated</CardTitle>
                    <CardDescription>
                      Get the latest Arizona business tips delivered to your inbox
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}