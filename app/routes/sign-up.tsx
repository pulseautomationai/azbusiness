import { SignUp } from "@clerk/react-router";
import { useSearchParams } from "react-router";

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const intent = searchParams.get("intent");

  // If user is signing up to add a business, redirect to business creation form
  const businessCreationRedirect = intent === "add-business" ? "/add-business/create" : redirectUrl;

  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp 
        forceRedirectUrl={businessCreationRedirect || undefined}
        fallbackRedirectUrl={businessCreationRedirect || "/"}
      />
    </div>
  );
}
