import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { redirect, useLoaderData, Navigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { SiteHeader } from "~/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/layout";
import { createClerkClient } from "@clerk/react-router/api.server";
import { Outlet } from "react-router";

// Temporarily disabled for SPA mode - using client-side auth instead
/*
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in");
  }

  // Parallel data fetching to reduce waterfall
  const [subscriptionStatus, user] = await Promise.all([
    fetchQuery(api.subscriptions.checkUserSubscriptionStatus, { userId }).catch((error) => {
      console.error("Failed to fetch subscription status:", error);
      return { hasActiveSubscription: false };
    }),
    createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    }).users.getUser(userId).catch((error) => {
      console.error("Failed to fetch user data:", error);
      throw redirect("/sign-in");
    })
  ]);

  // Redirect to subscription-required if no active subscription
  if (!subscriptionStatus?.hasActiveSubscription) {
    throw redirect("/subscription-required");
  }

  return { user };
}
*/

export default function DashboardLayout() {
  const { user, isLoaded } = useUser();
  
  // Client-side auth protection
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
