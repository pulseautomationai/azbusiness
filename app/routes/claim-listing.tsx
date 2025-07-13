import { redirect } from "react-router";
import type { Route } from "./+types/claim-listing";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  
  // Redirect to the correct claim-business route with all parameters
  const redirectUrl = businessId 
    ? `/claim-business?businessId=${businessId}`
    : "/claim-business";
    
  throw redirect(redirectUrl);
}

export default function ClaimListing() {
  // This component should never render because of the loader redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to claim business page...</p>
    </div>
  );
}