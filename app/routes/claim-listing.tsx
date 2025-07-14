import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function ClaimListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const businessId = searchParams.get("businessId");
    
    // Client-side redirect to the correct claim-business route with all parameters
    const redirectUrl = businessId 
      ? `/claim-business?businessId=${businessId}`
      : "/claim-business";
      
    navigate(redirectUrl, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to claim business page...</p>
    </div>
  );
}