import { useState } from "react";
import { Check, X, Star, TrendingUp, ArrowRight, Phone, Mail } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface PricingSectionProps {
  isSignedIn: boolean;
}

const pricingPlans = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    description: "Perfect for getting started with basic visibility",
    icon: "📝",
    features: [
      "1 category listing",
      "Contact info shown", 
      "Reviews enabled",
      "Visible in city + category pages",
      "Editable profile",
      "Basic business hours",
      "Phone number display",
    ],
    limitations: [
      "No homepage spotlight",
      "No priority placement",
      "Limited to 1 category",
      "No analytics",
      "No lead management",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 29,
    description: "Stand out from the competition with enhanced features",
    icon: "✨",
    features: [
      "Everything in Free Plan",
      "Homepage spotlight",
      "Top-of-category priority",
      "Multi-category listings",
      "Social media + image gallery",
      "Priority support",
      "Basic analytics dashboard",
      "Lead contact forms",
      "Business verification badge",
    ],
    limitations: [
      "No SEO copywriting",
      "No automated follow-up",
      "No blog posts",
      "Limited analytics",
    ],
    cta: "Start Pro Plan",
    popular: true,
  },
  {
    id: "power",
    name: "Power Plan", 
    price: 97,
    description: "Complete marketing solution for serious growth",
    icon: "⚡",
    features: [
      "Everything in Pro Plan",
      "Lead-gen strategy call",
      "SEO copywriting for profile",
      "Automated follow-up forms",
      "Google Review Booster",
      "2 blogs/month",
      "Booking calendar integration",
      "VIP badge + top-tier visibility",
      "Advanced analytics & reporting",
      "Dedicated account manager",
      "Priority phone support",
    ],
    limitations: [],
    cta: "Go Power",
    popular: false,
  },
];

export default function PricingSection({ isSignedIn }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Choose Your Business Growth Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            From free listings to comprehensive marketing solutions - find the perfect plan to showcase your Arizona business
          </p>

          {/* Billing Toggle */}
          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}>
            <TabsList className="mb-12">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan) => {
              const yearlyPrice = Math.round(plan.price * 12 * 0.8); // 20% discount
              const displayPrice = billingPeriod === "yearly" ? yearlyPrice : plan.price;
              const monthlyPrice = billingPeriod === "yearly" ? Math.round(yearlyPrice / 12) : plan.price;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1">
                        <Star className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="text-4xl mb-4">{plan.icon}</div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    
                    <div className="mt-6">
                      {plan.price === 0 ? (
                        <div className="text-4xl font-bold">Free</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold">
                            ${billingPeriod === "yearly" ? monthlyPrice : plan.price}
                            <span className="text-lg font-normal text-muted-foreground">/month</span>
                          </div>
                          {billingPeriod === "yearly" && (
                            <div className="text-sm text-muted-foreground">
                              Billed annually (${yearlyPrice}/year)
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="text-sm font-medium text-muted-foreground">Not included:</div>
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <X className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-6">
                      <Button 
                        asChild 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        <Link to={plan.price === 0 ? "/add-business" : "/sign-up"}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
            <p className="text-lg text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 pr-4 font-semibold">Features</th>
                  <th className="text-center py-4 px-4 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 font-semibold">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold">Power</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Basic business listing", true, true, true],
                  ["Contact information display", true, true, true],
                  ["Customer reviews", true, true, true],
                  ["Category/city page visibility", true, true, true],
                  ["Multiple categories", false, true, true],
                  ["Homepage spotlight", false, true, true],
                  ["Priority placement", false, true, true],
                  ["Social media links", false, true, true],
                  ["Image gallery", false, true, true],
                  ["Lead contact forms", false, true, true],
                  ["Basic analytics", false, true, true],
                  ["Verification badge", false, true, true],
                  ["SEO-optimized content", false, false, true],
                  ["Monthly blog posts (2x)", false, false, true],
                  ["Automated follow-up", false, false, true],
                  ["Google Review Booster", false, false, true],
                  ["Booking calendar", false, false, true],
                  ["Advanced analytics", false, false, true],
                  ["Dedicated support", false, false, true],
                ].map(([feature, free, pro, power], index) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="py-3 pr-4">{feature}</td>
                    <td className="text-center py-3 px-4">
                      {free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                    </td>
                    <td className="text-center py-3 px-4">
                      {pro ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                    </td>
                    <td className="text-center py-3 px-4">
                      {power ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-8">
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <h3>Can I change plans anytime?</h3>
              <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.</p>

              <h3>What happens if I cancel?</h3>
              <p>You can cancel anytime. Your listing will remain active until the end of your billing period, then automatically switch to the Free plan.</p>

              <h3>Do you offer custom enterprise plans?</h3>
              <p>Yes! For large businesses or franchise operations, we offer custom solutions. Contact us to discuss your specific needs.</p>

              <h3>How does the Google Review Booster work?</h3>
              <p>Our Power plan includes automated email campaigns to encourage satisfied customers to leave Google reviews, helping improve your online reputation.</p>

              <h3>What's included in the monthly blog posts?</h3>
              <p>We create 2 SEO-optimized blog posts per month about your services, local topics, and industry expertise to boost your search rankings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Plans?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is here to help you choose the right plan for your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
              <a href="tel:+1-555-123-4567">
                <Phone className="mr-2 h-4 w-4" />
                Call (555) 123-4567
              </a>
            </Button>
            <Button asChild size="lg">
              <a href="mailto:hello@azbusiness.services">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}