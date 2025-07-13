import { redirect } from "react-router";
import { useUser } from "@clerk/react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { BusinessOnboardingForm } from "~/components/business/business-onboarding-form";
import type { Route } from "./+types/add-business.create";

export function meta({}: Route.MetaArgs) {
  const title = "Create Your Business Listing - AZ Business Services";
  const description = "Add your Arizona business to our directory and start reaching local customers today.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export default function AddBusinessCreatePage() {
  const { isSignedIn, user } = useUser();

  // Redirect to sign-up if not authenticated
  if (!isSignedIn) {
    return redirect("/sign-up?intent=add-business");
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome, {user?.firstName || "Business Owner"}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's get your business listed on AZ Business Services
            </p>
          </div>
          
          <BusinessOnboardingForm />
        </div>
      </div>
      <Footer />
    </>
  );
}