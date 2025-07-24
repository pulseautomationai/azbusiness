import { Navigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { SiteHeader } from "~/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Outlet } from "react-router";
import { 
  IconDashboard,
  IconBuildingStore,
  IconSettings,
  IconUpload,
  IconPhoto,
  IconCreditCard,
  IconHelp,
  IconTrophy
} from "@tabler/icons-react";

// Customer dashboard sidebar data
const customerSidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Claims",
      url: "/dashboard/claims",
      icon: IconBuildingStore,
    },
    {
      title: "Achievements",
      url: "/dashboard/achievements",
      icon: IconTrophy,
    },
    {
      title: "Upload Documents", 
      url: "/dashboard/documents",
      icon: IconUpload,
    },
    {
      title: "Media Manager",
      url: "/dashboard/media",
      icon: IconPhoto,
    },
  ],
  navSecondary: [
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: IconCreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Support",
      url: "/dashboard/support",
      icon: IconHelp,
    },
  ],
};

export default function CustomerDashboardLayout() {
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
      <AppSidebar variant="inset" user={user} sidebarData={customerSidebarData} />
      <SidebarInset>
        <SiteHeader title="Customer Dashboard" />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
