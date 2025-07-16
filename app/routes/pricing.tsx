import { useUser } from "@clerk/react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import PricingSection from "~/components/pricing/pricing-section";
import { generateMetaForRoute } from "~/utils/seo-middleware";
import type { Route } from "./+types/pricing";

export function meta({}: Route.MetaArgs) {
  return generateMetaForRoute("pricing");
}

// Temporarily disabled for SPA mode
/*
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  const [subscriptionData] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch(() => null)
      : Promise.resolve(null),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
  };
}
*/

export default function PricingPage() {
  const { isSignedIn } = useUser();
  
  return (
    <>
      <Header />
      <PricingSection isSignedIn={!!isSignedIn} />
      <Footer />
    </>
  );
}
