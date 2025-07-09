import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import PricingSection from "~/components/pricing/pricing-section";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/pricing";

export function meta({}: Route.MetaArgs) {
  const title = "Pricing Plans for Business Listings - AZ Business Services";
  const description = "Choose the perfect plan to showcase your Arizona business. From free listings to powerful marketing tools, find the plan that fits your needs and budget.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

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

export default function PricingPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <PricingSection isSignedIn={loaderData.isSignedIn} />
      <Footer />
    </>
  );
}
