import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Building2, Search, FileCheck } from "lucide-react";
import { BusinessSearch } from "./business-search";
import { BusinessOnboardingForm } from "./business-onboarding-form";
import { DocumentVerification } from "./document-verification";
import { toast } from "sonner";

type Step = "search" | "form" | "verification" | "complete";

interface ClaimedBusiness {
  _id: string;
  name: string;
  claimed: boolean;
}

export function EnhancedBusinessOnboarding() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<Step>("search");
  const [claimedBusiness, setClaimedBusiness] = useState<ClaimedBusiness | null>(null);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);

  const submitVerification = useMutation(api.verification.submitBusinessVerification);
  const updateBusiness = useMutation(api.businesses.updateBusiness);

  const handleBusinessFound = async (business: any) => {
    if (business.claimed) {
      toast.error("This business is already claimed by another user.");
      return;
    }

    // Claim the business
    try {
      await updateBusiness({
        businessId: business._id as any, // Type assertion for Convex ID
        updates: {
          claimed: true,
        }
      });

      setClaimedBusiness({
        _id: business._id,
        name: business.name,
        claimed: true
      });
      setCurrentStep("verification");
      toast.success(`You are now claiming ${business.name}. Please verify your ownership.`);
    } catch (error) {
      console.error("Error claiming business:", error);
      toast.error("Failed to claim business. Please try again.");
    }
  };

  const handleProceedWithNew = () => {
    setCurrentStep("form");
  };

  const handleBusinessCreated = (businessId: string) => {
    setCreatedBusinessId(businessId);
    setCurrentStep("verification");
  };

  const handleVerificationSubmitted = async (verificationData: any) => {
    const businessId = claimedBusiness?._id || createdBusinessId;
    if (!businessId) {
      toast.error("No business to verify");
      return;
    }

    try {
      // For now, we'll simulate file upload since we don't have file storage set up
      // In production, you'd upload files to a service like AWS S3 or Convex file storage
      const mockFileUrls = verificationData.documents.map((file: File, index: number) => 
        `https://example.com/verification-docs/${businessId}-${index}-${file.name}`
      );

      await submitVerification({
        businessId: businessId as any, // Type assertion for Convex ID
        documentTypes: verificationData.documentTypes,
        additionalInfo: verificationData.additionalInfo,
        fileUrls: mockFileUrls
      });

      setCurrentStep("complete");
      toast.success("Verification documents submitted! We'll review them within 24-48 hours.");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit verification. Please try again.");
    }
  };

  const handleSkipVerification = () => {
    setCurrentStep("complete");
    toast.info("You can submit verification documents later from your dashboard.");
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: "search", label: "Search", icon: Search },
      { id: "form", label: claimedBusiness ? "Claim" : "Create", icon: Building2 },
      { id: "verification", label: "Verify", icon: FileCheck },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = 
            (currentStep === "form" && step.id === "search") ||
            (currentStep === "verification" && ["search", "form"].includes(step.id)) ||
            (currentStep === "complete" && ["search", "form", "verification"].includes(step.id));

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? "bg-green-500" : "bg-muted"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case "search":
        return (
          <BusinessSearch
            onBusinessFound={handleBusinessFound}
            onProceedWithNew={handleProceedWithNew}
          />
        );

      case "form":
        return (
          <BusinessOnboardingForm 
            onBusinessCreated={handleBusinessCreated}
          />
        );

      case "verification":
        return (
          <div className="space-y-6">
            {claimedBusiness && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Claiming: {claimedBusiness.name}</h3>
                  <p className="text-muted-foreground">
                    You are claiming an existing business listing. Please provide verification documents 
                    to prove you own or represent this business.
                  </p>
                </CardContent>
              </Card>
            )}
            <DocumentVerification
              onVerificationSubmitted={handleVerificationSubmitted}
              onSkip={handleSkipVerification}
            />
          </div>
        );

      case "complete":
        return (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">Success!</CardTitle>
              <CardDescription>
                Your business has been {claimedBusiness ? "claimed" : "created"} successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Your business listing is now live and searchable</li>
                  <li>• We'll review your verification documents within 24-48 hours</li>
                  <li>• Once verified, you'll get a "Verified" badge on your listing</li>
                  <li>• You can manage your business from your dashboard</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 border border-border rounded-md hover:bg-muted"
                >
                  Back to Home
                </button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Your Business</h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of Arizona businesses reaching local customers
          </p>
        </div>

        {renderStepIndicator()}
        {renderContent()}
      </div>
    </div>
  );
}