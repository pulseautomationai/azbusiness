import { SignUp } from "@clerk/react-router";
import { useSearchParams } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import type { Route } from "./+types/sign-up";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - AZ Business Services" },
    { name: "description", content: "Create your AZ Business Services account to manage your business listings and start reaching local customers." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const intent = searchParams.get("intent");

  // If user is signing up to add a business, redirect to business creation form
  const businessCreationRedirect = intent === "add-business" ? "/add-business/create" : redirectUrl;
  const finalRedirect = businessCreationRedirect || "/dashboard";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create Your Account
              </h1>
              <p className="text-muted-foreground">
                Join Arizona's premier business directory
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <SignUp 
                routing="hash"
                signInUrl="/sign-in"
                forceRedirectUrl={finalRedirect}
                fallbackRedirectUrl={finalRedirect}
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "bg-transparent shadow-none border-0",
                    headerTitle: "sr-only",
                    headerSubtitle: "sr-only",
                    socialButtonsBlockButton: "w-full",
                    formButtonPrimary: "w-full bg-primary hover:bg-primary/90",
                    footerActionLink: "text-primary hover:text-primary/90"
                  }
                }}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a 
                  href={`/sign-in${finalRedirect !== "/dashboard" ? `?redirect=${encodeURIComponent(finalRedirect)}` : ""}`}
                  className="text-primary hover:text-primary/90 font-medium"
                >
                  Sign in here
                </a>
              </p>
            </div>
            
            {intent === "add-business" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🏢 After creating your account, you'll be redirected to add your business listing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
