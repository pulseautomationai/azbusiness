/**
 * Admin Layout Component for Phase 5.1
 * Provides authentication and navigation structure for admin dashboard
 */

import { LoaderFunctionArgs, redirect } from "react-router";
import { Outlet, Link, useLoaderData, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAuthToken } from "@clerk/remix/ssr.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Shield, 
  Home, 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  AlertTriangle,
  Clock
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  // Get auth token and validate admin access on server side
  const { userId, sessionId, getToken } = await getAuthToken(request);
  
  if (!userId) {
    throw redirect("/sign-in?redirectTo=/admin");
  }

  return {
    userId,
    sessionId,
  };
}

export default function AdminLayout() {
  const { userId } = useLoaderData<typeof loader>();
  const location = useLocation();
  
  // Check admin access client-side with Convex
  const adminAccess = useQuery(api.admin.checkAdminAccess, {});
  
  // If not loading and no admin access, redirect
  if (adminAccess !== undefined && !adminAccess.hasAccess) {
    window.location.href = "/";
    return null;
  }

  // Show loading state while checking permissions
  if (adminAccess === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      permission: null, // Available to all admins
    },
    {
      name: "Businesses",
      href: "/admin/businesses",
      icon: Building2,
      permission: "business_management",
    },
    {
      name: "Users",
      href: "/admin/users", 
      icon: Users,
      permission: "user_management",
    },
    {
      name: "Moderation",
      href: "/admin/moderation",
      icon: FileText,
      permission: "content_moderation",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      permission: "platform_analytics",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      permission: "system_settings",
    },
  ];

  // Filter navigation based on permissions
  const allowedItems = navigationItems.filter(item => 
    !item.permission || 
    adminAccess.permissions.includes(item.permission) ||
    adminAccess.permissions.includes("super_admin")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AZ Business Admin
                </h1>
                <p className="text-xs text-gray-500">
                  Platform Management Dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Admin Role Badge */}
              <Badge 
                variant="secondary" 
                className={
                  adminAccess.role === "super_admin" 
                    ? "bg-red-100 text-red-800" 
                    : "bg-blue-100 text-blue-800"
                }
              >
                <Shield className="h-3 w-3 mr-1" />
                {adminAccess.role?.replace("_", " ").toUpperCase()}
              </Badge>
              
              {/* Admin User Info */}
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900">
                  {adminAccess.user?.name || "Admin User"}
                </div>
                <div className="text-gray-500">
                  {adminAccess.user?.email}
                </div>
              </div>
              
              {/* Logout Button */}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/sign-out">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-1">
              {allowedItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}
                      `}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Link
                  to="/admin/moderation?status=pending_review"
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <AlertTriangle className="mr-3 h-4 w-4 text-orange-400 group-hover:text-orange-500" />
                  Pending Reviews
                </Link>
                
                <Link
                  to="/admin/businesses?filter=recently_claimed"
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <Clock className="mr-3 h-4 w-4 text-green-400 group-hover:text-green-500" />
                  Recent Claims
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}