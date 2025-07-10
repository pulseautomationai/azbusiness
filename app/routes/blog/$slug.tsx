import { useParams, Navigate } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { Badge } from "~/components/ui/badge";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/$slug";

export function meta({ params }: Route.MetaArgs) {
  // In a real app, you'd fetch the post data here
  const title = `Blog Post - AZ Business Services`;
  const description = "Read our latest insights about Arizona business growth and local market trends.";

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
  const slug = args.params.slug;

  // TODO: Fetch blog post from Convex by slug
  // For now, return sample data or redirect if not found
  const samplePost = {
    id: "1",
    title: "10 Essential Marketing Tips for Arizona HVAC Companies",
    content: `
# 10 Essential Marketing Tips for Arizona HVAC Companies

Arizona's extreme climate makes HVAC services essential year-round, but the competitive landscape means you need smart marketing to stand out. Here are proven strategies to grow your HVAC business in the Grand Canyon State.

## 1. Optimize for Local Search

Make sure your business appears when people search for "HVAC repair Phoenix" or "AC installation Mesa." This means:

- Claiming your Google Business Profile
- Getting consistent NAP (Name, Address, Phone) across all directories
- Gathering positive customer reviews regularly

## 2. Seasonal Marketing Strategies

Arizona has unique seasonal patterns:

**Pre-Summer (March-May)**: Focus on AC maintenance and tune-ups
**Summer Peak (June-September)**: Emergency repair messaging and fast response times
**Winter (October-February)**: Heating system maintenance and indoor air quality

## 3. Target Specific Arizona Communities

Each Arizona city has different demographics and needs:

- **Phoenix**: Large market, competitive pricing
- **Scottsdale**: Premium services, luxury homes
- **Mesa**: Family-oriented, value-conscious
- **Tucson**: Mix of retirees and young families

## 4. Leverage Customer Reviews

In the service industry, trust is everything. Encourage satisfied customers to leave reviews on:

- Google
- Yelp
- Better Business Bureau
- Facebook

## 5. Content Marketing for HVAC

Create helpful content that educates customers:

- "How to Prepare Your AC for Arizona Summer"
- "Energy Saving Tips for Phoenix Homeowners"
- "When to Replace vs. Repair Your HVAC System"

Ready to implement these strategies? List your HVAC business on AZ Business Services to start reaching more local customers today.
    `,
    author: "AZ Business Team",
    publishedAt: "2025-01-05",
    tags: ["HVAC", "Marketing", "Phoenix"],
    slug: "hvac-marketing-tips-arizona",
  };

  if (slug !== samplePost.slug) {
    throw redirect("/blog");
  }

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: false, // Simplified for blog post page
    post: samplePost,
  };
}
*/

export default function BlogPostPage() {
  const { slug } = useParams();
  
  // Sample posts data for client-side rendering
  const samplePosts = [
    {
      id: "1",
      title: "10 Essential Marketing Tips for Arizona HVAC Companies",
      content: `
# 10 Essential Marketing Tips for Arizona HVAC Companies

Arizona's extreme climate makes HVAC services essential year-round, but the competitive landscape means you need smart marketing to stand out. Here are proven strategies to grow your HVAC business in the Grand Canyon State.

## 1. Optimize for Local Search

Make sure your business appears when people search for "HVAC repair Phoenix" or "AC installation Mesa." This means:

- Claiming your Google Business Profile
- Getting consistent NAP (Name, Address, Phone) across all directories
- Gathering positive customer reviews regularly

## 2. Seasonal Marketing Strategies

Arizona has unique seasonal patterns:

**Pre-Summer (March-May)**: Focus on AC maintenance and tune-ups
**Summer Peak (June-September)**: Emergency repair messaging and fast response times
**Winter (October-February)**: Heating system maintenance and indoor air quality

## 3. Target Specific Arizona Communities

Each Arizona city has different demographics and needs:

- **Phoenix**: Large market, competitive pricing
- **Scottsdale**: Premium services, luxury homes
- **Mesa**: Family-oriented, value-conscious
- **Tucson**: Mix of retirees and young families

## 4. Leverage Customer Reviews

In the service industry, trust is everything. Encourage satisfied customers to leave reviews on:

- Google
- Yelp
- Better Business Bureau
- Facebook

## 5. Content Marketing for HVAC

Create helpful content that educates customers:

- "How to Prepare Your AC for Arizona Summer"
- "Energy Saving Tips for Phoenix Homeowners"
- "When to Replace vs. Repair Your HVAC System"

Ready to implement these strategies? List your HVAC business on AZ Business Services to start reaching more local customers today.
      `,
      author: "AZ Business Team",
      publishedAt: "2025-01-05",
      tags: ["HVAC", "Marketing", "Phoenix"],
      slug: "hvac-marketing-tips-arizona",
    },
    {
      id: "2",
      title: "Best Practices for Local SEO in Arizona Cities",
      content: `
# Best Practices for Local SEO in Arizona Cities

Dominating local search results in Arizona requires understanding the unique characteristics of each market. From Phoenix's competitive landscape to Tucson's distinct demographics, here's how to optimize your local SEO strategy.

## Understanding Arizona's Market Dynamics

Arizona's major cities each have distinct characteristics:

- **Phoenix Metro**: Highly competitive, tech-savvy population
- **Tucson**: University town with diverse age groups
- **Mesa**: Family-oriented communities
- **Scottsdale**: Affluent market with premium service expectations

## Key Local SEO Strategies

### 1. Google Business Profile Optimization
- Complete all profile sections
- Use Arizona-specific keywords
- Post regular updates about local events and services

### 2. Local Citation Building
Build citations on Arizona-specific directories and regional business listings.

### 3. Review Management
Actively encourage and respond to reviews, especially on platforms popular in Arizona.

Ready to improve your local SEO? Get listed on AZ Business Services today!
      `,
      author: "SEO Expert",
      publishedAt: "2025-01-03",
      tags: ["SEO", "Local Business", "Digital Marketing"],
      slug: "local-seo-arizona-cities",
    },
  ];
  
  const post = samplePosts.find(p => p.slug === slug);
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-24">
        <article className="py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            {/* Back Link */}
            <Link 
              to="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight mb-6">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-muted rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-4">Ready to Grow Your Arizona Business?</h3>
              <p className="text-muted-foreground mb-6">
                Join hundreds of local businesses using AZ Business Services to reach more customers.
              </p>
              <Link 
                to="/add-business"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                List Your Business
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}