import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Business-specific breadcrumb helper
interface BusinessBreadcrumbProps {
  business: {
    name: string;
    city: string;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  className?: string;
}

export function BusinessBreadcrumb({ business, className }: BusinessBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
  ];

  // Add category if available
  if (business.category) {
    items.push({
      label: business.category.name,
      href: `/${business.category.slug}`,
    });
  }

  // Add city
  const citySlug = business.city.toLowerCase().replace(/\s+/g, "-");
  items.push({
    label: business.city,
    href: `/city/${citySlug}`,
  });

  // Add business name (current page, no link)
  items.push({
    label: business.name,
  });

  return <Breadcrumb items={items} className={className} />;
}