import { SignIn } from "@clerk/react-router";
import { useSearchParams } from "react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import type { Route } from "./+types/sign-in";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - AZ Business Services" },
    { name: "description", content: "Sign in to your AZ Business Services account to manage your business listings and claims." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <SignIn 
                routing="hash"
                signUpUrl="/sign-up"
                forceRedirectUrl={redirectTo}
                fallbackRedirectUrl={redirectTo}
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
                Don't have an account?{" "}
                <a 
                  href={`/sign-up${redirectTo !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                  className="text-primary hover:text-primary/90 font-medium"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
