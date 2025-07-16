import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, Crown, ArrowRight, CreditCard, Sparkles, TrendingUp, Users, Building } from "lucide-react";
import { Link } from "react-router";
import { StarterCheckoutButton, ProCheckoutButton, PowerCheckoutButton } from "~/components/payments/PolarCheckoutButton";

export function meta() {
  return [
    { title: "Choose Your Plan - Business Claim | AZ Business Services" },
    { name: "description", content: "Select the perfect plan for your claimed business and unlock powerful features." },
  ];
}

export default function ClaimBusinessPlans() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const planFeatures = usePlanFeatures();
  
  const businessId = searchParams.get("businessId");
  const claimId = searchParams.get("claimId");
  const status = searchParams.get("status"); // "pending", "approved", "verified"
  
  // Get business details
  const business = useQuery(api.businesses.getBusinessById, businessId ? { businessId } : "skip");

  // Authentication check
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to continue with your business claim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild>
                <Link to={`/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                  Sign In to Continue
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSkipPlan = () => {
    // Redirect to dashboard or completion page
    navigate(`/dashboard?claimed=true&businessId=${businessId}`);
  };

  const handlePlanSuccess = () => {
    // Redirect to completion page
    navigate(`/dashboard?claimed=true&businessId=${businessId}&plan=selected`);
  };

  return (
    <div className="min-h-screen bg-background pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Crown className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            Unlock powerful features for your claimed business
          </p>
          {business && (
            <p className="text-lg text-muted-foreground">
              Plan for <strong>{business.name}</strong>
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">
              ✓
            </div>
            <span>Claim Submitted</span>
          </div>
          <div className="flex-1 h-px bg-border max-w-20" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              2
            </div>
            <span>Choose Plan</span>
          </div>
          <div className="flex-1 h-px bg-border max-w-20" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
              3
            </div>
            <span>Complete Setup</span>
          </div>
        </div>

        {/* Claiming Status Banner */}
        <Card className={`mb-8 ${
          status === "approved" || status === "verified" 
            ? "bg-green-50 border-green-200" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                status === "approved" || status === "verified" 
                  ? "bg-green-100" 
                  : "bg-blue-100"
              }`}>
                {status === "approved" || status === "verified" ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Building className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  status === "approved" || status === "verified" 
                    ? "text-green-800" 
                    : "text-blue-800"
                }`}>
                  {status === "approved" ? "Claim Approved!" : 
                   status === "verified" ? "Business Verified!" : 
                   "Claim Under Review"}
                </h3>
                <p className={
                  status === "approved" || status === "verified" 
                    ? "text-green-700" 
                    : "text-blue-700"
                }>
                  {status === "approved" || status === "verified" 
                    ? "Your business is now active. Choose a plan to unlock additional features."
                    : "Choose a plan now and features will activate when your claim is approved."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Advantage Section */}
        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Why Choose AZ Business Services?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-amber-700">
                  <TrendingUp className="h-4 w-4" />
                  <span>Exclusive leads (not shared with competitors)</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <CreditCard className="h-4 w-4" />
                  <span>Predictable monthly pricing vs per-lead costs</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-powered professional presentation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-8">
          {/* Starter Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Starter</CardTitle>
              <div className="text-3xl font-bold">
                $9<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Save $27/year with annual billing
              </div>
              <CardDescription>Perfect for establishing credibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Professional presence</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI-generated summary</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Verification badge</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SEO backlink to website</span>
                </div>
              </div>
              <div className="space-y-2">
                <StarterCheckoutButton billingPeriod="monthly" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Starter
                </StarterCheckoutButton>
                <p className="text-xs text-center text-muted-foreground">
                  Great for new businesses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Pro</CardTitle>
              <div className="text-3xl font-bold">
                $29<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Save $84/year with annual billing
              </div>
              <CardDescription>Enhanced visibility and control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Everything in Starter</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Featured placement</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Editable content</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Enhanced service cards</span>
                </div>
              </div>
              <div className="space-y-2">
                <ProCheckoutButton billingPeriod="monthly" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Pro
                </ProCheckoutButton>
                <p className="text-xs text-center text-muted-foreground">
                  Best for growing businesses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Power Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Crown className="h-5 w-5" />
                Power
              </CardTitle>
              <div className="text-3xl font-bold">
                $97<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Save $292/year with annual billing
              </div>
              <CardDescription>Complete growth package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited exclusive leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Homepage featuring</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI insights & analytics</span>
                </div>
              </div>
              <div className="space-y-2">
                <PowerCheckoutButton billingPeriod="monthly" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Power
                </PowerCheckoutButton>
                <p className="text-xs text-center text-muted-foreground">
                  Perfect for established businesses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Option */}
        <Card className="mb-8 bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Start with Free Tier
              </h3>
              <p className="text-gray-600 mb-4">
                Keep your basic listing active while you explore our features
              </p>
              <Button variant="outline" onClick={handleSkipPlan}>
                Continue with Free
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Value Proposition */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Why Upgrade?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Customer Acquisition
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Exclusive leads not shared with competitors</li>
                  <li>• Featured placement in search results</li>
                  <li>• Homepage spotlights for maximum visibility</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Professional Presentation
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-enhanced business summaries</li>
                  <li>• Professional service descriptions</li>
                  <li>• Competitive intelligence insights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="text-center mb-8">
          <Button variant="outline" onClick={handleSkipPlan} className="mr-4">
            Skip for Now
          </Button>
          <Button asChild>
            <Link to="/pricing">
              Compare All Features
            </Link>
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            💡 <strong>Pro tip:</strong> You can upgrade or downgrade your plan anytime from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}