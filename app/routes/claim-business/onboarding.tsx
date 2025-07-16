import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, Crown, ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Claim Submitted - Next Steps | AZ Business Services" },
    { name: "description", content: "Your business claim has been submitted. Learn about your next steps and available plans." },
  ];
}

export default function ClaimBusinessOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [currentStep, setCurrentStep] = useState<"welcome" | "plans" | "complete">("welcome");
  
  const claimId = searchParams.get("claimId");
  const businessId = searchParams.get("businessId");
  const status = searchParams.get("status"); // "pending", "approved", "verified"
  
  // Get business and claim details
  const business = useQuery(api.businesses.getBusinessById, businessId ? { businessId } : "skip");
  const claim = useQuery(api.businessClaims.getClaimById, claimId ? { claimId } : "skip");

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
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to={`/sign-up?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-primary hover:underline">
                  Create one here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 1: Welcome Screen
  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {status === "approved" ? "Business Claim Approved!" : 
               status === "verified" ? "Business Verified!" : 
               "Claim Submitted Successfully!"}
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome to AZ Business Services, {user?.firstName || "Business Owner"}!
            </p>
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

          {/* Business Info Card */}
          {business && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Your Business
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <p className="text-muted-foreground">{business.shortDescription}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {business.city}, {business.state} {business.zip}
                    </p>
                  </div>
                  <Badge variant={
                    status === "approved" ? "default" : 
                    status === "verified" ? "default" : 
                    "secondary"
                  }>
                    {status === "approved" ? "Approved" : 
                     status === "verified" ? "Verified" : 
                     "Pending Review"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status-based messaging */}
          {status === "approved" || status === "verified" ? (
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Congratulations!</h3>
                    <p className="text-green-700">
                      Your business claim has been {status === "verified" ? "automatically verified" : "approved"}. 
                      You now have full control over your business listing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Under Review</h3>
                    <p className="text-blue-700">
                      Your claim is being reviewed by our team. You'll receive an email within 24-48 hours with updates.
                      In the meantime, you can choose a plan to unlock additional features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Here's what you can do while your claim is being processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Choose Your Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Select a plan that fits your business needs and unlock powerful features
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Complete Your Profile</p>
                  <p className="text-sm text-muted-foreground">
                    Add photos, update hours, and enhance your business listing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Start Connecting</p>
                  <p className="text-sm text-muted-foreground">
                    Begin engaging with customers and growing your online presence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setCurrentStep("plans")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Choose Your Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Plan Selection (redirect to plans page)
  if (currentStep === "plans") {
    navigate(`/claim-business/plans?businessId=${businessId}&claimId=${claimId}&status=${status}`);
    return null;
  }

  return null;
}