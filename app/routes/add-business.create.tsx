import { redirect } from "react-router";
import { useUser } from "@clerk/react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import { EnhancedBusinessOnboarding } from "~/components/business/enhanced-business-onboarding";
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
      <EnhancedBusinessOnboarding />
      <Footer />
    </>
  );
}