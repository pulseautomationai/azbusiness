import { SignIn } from "@clerk/react-router";
import { useSearchParams } from "react-router";

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn 
        forceRedirectUrl={redirectUrl || undefined}
        fallbackRedirectUrl={redirectUrl || "/"}
      />
    </div>
  );
}
