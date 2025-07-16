import { useState } from "react";
import { useUser } from "@clerk/react-router";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface PolarCheckoutButtonProps {
  planId: "starter" | "pro" | "power";
  planName: string;
  productId: string;
  amount: number;
  billingPeriod: "monthly" | "yearly";
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// Map plan IDs to product IDs for different billing periods
const PLAN_PRODUCT_IDS = {
  starter: {
    monthly: import.meta.env.VITE_POLAR_STARTER_MONTHLY_PRODUCT_ID || "starter_monthly",
    yearly: import.meta.env.VITE_POLAR_STARTER_YEARLY_PRODUCT_ID || "starter_yearly",
  },
  pro: {
    monthly: import.meta.env.VITE_POLAR_PRO_MONTHLY_PRODUCT_ID || "pro_monthly", 
    yearly: import.meta.env.VITE_POLAR_PRO_YEARLY_PRODUCT_ID || "pro_yearly",
  },
  power: {
    monthly: import.meta.env.VITE_POLAR_POWER_MONTHLY_PRODUCT_ID || "power_monthly",
    yearly: import.meta.env.VITE_POLAR_POWER_YEARLY_PRODUCT_ID || "power_yearly",
  },
};

export default function PolarCheckoutButton({
  planId,
  planName,
  productId,
  amount,
  billingPeriod,
  className = "",
  children,
  disabled = false,
}: PolarCheckoutButtonProps) {
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const createCheckoutSession = useAction(api.subscriptions.createCheckoutSession);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      // Redirect to sign-in with intent to return to checkout
      window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: "Email Required",
        description: "Please complete your profile before subscribing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the appropriate product ID based on plan and billing period
      const actualProductId = PLAN_PRODUCT_IDS[planId][billingPeriod] || productId;
      
      // Debug: Log all available product IDs
      console.log("All available product IDs:", {
        PLAN_PRODUCT_IDS,
        envVars: {
          STARTER_MONTHLY: import.meta.env.VITE_POLAR_STARTER_MONTHLY_PRODUCT_ID,
          STARTER_YEARLY: import.meta.env.VITE_POLAR_STARTER_YEARLY_PRODUCT_ID,
          PRO_MONTHLY: import.meta.env.VITE_POLAR_PRO_MONTHLY_PRODUCT_ID,
          PRO_YEARLY: import.meta.env.VITE_POLAR_PRO_YEARLY_PRODUCT_ID,
          POWER_MONTHLY: import.meta.env.VITE_POLAR_POWER_MONTHLY_PRODUCT_ID,
          POWER_YEARLY: import.meta.env.VITE_POLAR_POWER_YEARLY_PRODUCT_ID,
        }
      });
      
      console.log("Creating checkout session for:", {
        planId,
        planName,
        productId: actualProductId,
        amount,
        billingPeriod,
        userEmail: user.emailAddresses[0].emailAddress,
      });

      const checkoutUrl = await createCheckoutSession({
        productId: actualProductId,
      });

      if (checkoutUrl) {
        // Redirect to Polar checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children || (
            <>
              {isSignedIn ? "Subscribe Now" : "Sign Up & Subscribe"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </>
      )}
    </Button>
  );
}

// Export convenience components for each plan
export function StarterCheckoutButton({ 
  billingPeriod, 
  className, 
  children 
}: { 
  billingPeriod: "monthly" | "yearly";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <PolarCheckoutButton
      planId="starter"
      planName="Starter"
      productId={PLAN_PRODUCT_IDS.starter[billingPeriod]}
      amount={billingPeriod === "yearly" ? 7 : 9}
      billingPeriod={billingPeriod}
      className={className}
    >
      {children}
    </PolarCheckoutButton>
  );
}

export function ProCheckoutButton({ 
  billingPeriod, 
  className, 
  children 
}: { 
  billingPeriod: "monthly" | "yearly";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <PolarCheckoutButton
      planId="pro"
      planName="Pro"
      productId={PLAN_PRODUCT_IDS.pro[billingPeriod]}
      amount={billingPeriod === "yearly" ? 22 : 29}
      billingPeriod={billingPeriod}
      className={className}
    >
      {children}
    </PolarCheckoutButton>
  );
}

export function PowerCheckoutButton({ 
  billingPeriod, 
  className, 
  children 
}: { 
  billingPeriod: "monthly" | "yearly";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <PolarCheckoutButton
      planId="power"
      planName="Power"
      productId={PLAN_PRODUCT_IDS.power[billingPeriod]}
      amount={billingPeriod === "yearly" ? 73 : 97}
      billingPeriod={billingPeriod}
      className={className}
    >
      {children}
    </PolarCheckoutButton>
  );
}