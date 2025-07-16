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
  priceId: string;
  amount: number;
  billingPeriod: "monthly" | "yearly";
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// Map plan IDs to price IDs for different billing periods
const PLAN_PRICE_IDS = {
  starter: {
    monthly: import.meta.env.VITE_POLAR_STARTER_MONTHLY_PRICE_ID || "starter_monthly",
    yearly: import.meta.env.VITE_POLAR_STARTER_YEARLY_PRICE_ID || "starter_yearly",
  },
  pro: {
    monthly: import.meta.env.VITE_POLAR_PRO_MONTHLY_PRICE_ID || "pro_monthly", 
    yearly: import.meta.env.VITE_POLAR_PRO_YEARLY_PRICE_ID || "pro_yearly",
  },
  power: {
    monthly: import.meta.env.VITE_POLAR_POWER_MONTHLY_PRICE_ID || "power_monthly",
    yearly: import.meta.env.VITE_POLAR_POWER_YEARLY_PRICE_ID || "power_yearly",
  },
};

export default function PolarCheckoutButton({
  planId,
  planName,
  priceId,
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
      // Use the appropriate price ID based on plan and billing period
      const actualPriceId = PLAN_PRICE_IDS[planId][billingPeriod] || priceId;
      
      console.log("Creating checkout session for:", {
        planId,
        planName,
        priceId: actualPriceId,
        amount,
        billingPeriod,
        userEmail: user.emailAddresses[0].emailAddress,
      });

      const checkoutUrl = await createCheckoutSession({
        priceId: actualPriceId,
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
      priceId={PLAN_PRICE_IDS.starter[billingPeriod]}
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
      priceId={PLAN_PRICE_IDS.pro[billingPeriod]}
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
      priceId={PLAN_PRICE_IDS.power[billingPeriod]}
      amount={billingPeriod === "yearly" ? 73 : 97}
      billingPeriod={billingPeriod}
      className={className}
    >
      {children}
    </PolarCheckoutButton>
  );
}