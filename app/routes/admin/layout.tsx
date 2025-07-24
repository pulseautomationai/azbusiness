import { Navigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { SiteHeader } from "~/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Outlet } from "react-router";
import { 
  IconChartBar, 
  IconShield, 
  IconBuilding, 
  IconSettings, 
  IconArrowLeft,
  IconUsers,
  IconTags,
  IconUpload,
  IconTestPipe,
  IconRefresh
} from "@tabler/icons-react";

// Admin-specific sidebar data
const adminSidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconChartBar,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Moderation",
      url: "/admin/moderation",
      icon: IconShield,
    },
    {
      title: "Businesses",
      url: "/admin/businesses",
      icon: IconBuilding,
    },
    {
      title: "Import Management",
      url: "/admin/imports",
      icon: IconUpload,
    },
    {
      title: "Review Sync",
      url: "/admin/review-sync",
      icon: IconRefresh,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: IconUsers,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconTags,
    },
    {
      title: "AI Ranking Tests",
      url: "/admin/ai-ranking-tests",
      icon: IconTestPipe,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Back to Site",
      url: "/",
      icon: IconArrowLeft,
    },
  ],
};

export default function AdminLayout() {
  const { user, isLoaded } = useUser();
  
  // Client-side auth protection
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // TODO: Add admin role check here
  // For now, allow all authenticated users

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} sidebarData={adminSidebarData} />
      <SidebarInset>
        <SiteHeader title="Admin Dashboard" />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}