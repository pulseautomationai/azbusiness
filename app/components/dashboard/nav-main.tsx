import { memo, useMemo, useState, useEffect } from "react";
import { type Icon } from "@tabler/icons-react";

import { Link, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export const NavMain = memo(({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) => {
  // Call hooks at top level - correct React pattern
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);
  const [currentPathname, setCurrentPathname] = useState('/');

  // Track when we're on client side and update pathname
  useEffect(() => {
    setIsClient(true);
    setCurrentPathname(location.pathname);
  }, [location.pathname]);

  const navItems = useMemo(() => 
    items.map((item) => ({
      ...item,
      isActive: currentPathname === item.url,
    })), 
    [items, currentPathname]
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                asChild
              >
                <Link to={item.url} prefetch="intent">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
