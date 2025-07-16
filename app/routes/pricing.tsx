import { useUser } from "@clerk/react-router";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import PricingSection from "~/components/pricing/pricing-section";
import type { Route } from "./+types/pricing";

export function meta({}: Route.MetaArgs) {
  const title = "Professional Business Listings - Predictable Pricing | AZ Business Services";
  const description = "Unlike Thumbtack's $80-100 per shared lead, get exclusive leads and professional AI-enhanced listings for one flat monthly rate. Starter $9, Pro $29, Power $97.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
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
