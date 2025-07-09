import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router";
import { BreadcrumbGenerator, type BreadcrumbItem } from "~/utils/seo";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  const breadcrumbSchema = BreadcrumbGenerator.generateBreadcrumbSchema(items);

  return (
    <div className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
      {/* JSON-LD Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
        {items.map((item, index) => (
          <div key={item.position} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
            
            {index === 0 && (
              <Home className="h-4 w-4 text-muted-foreground/70" />
            )}
            
            {index === items.length - 1 ? (
              <span 
                className="font-medium text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.url}
                className="hover:text-saguaro-teal transition-colors truncate max-w-[150px]"
                prefetch="intent"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

// Specific breadcrumb components for different page types
export function HomeBreadcrumbs() {
  return null; // No breadcrumbs on homepage
}

export function CategoryBreadcrumbs({ category, city }: { category: any; city?: string }) {
  const items = BreadcrumbGenerator.generateCategoryBreadcrumb(category, city);
  return <Breadcrumbs items={items} />;
}

export function CityBreadcrumbs({ city }: { city: any }) {
  const items = BreadcrumbGenerator.generateCityBreadcrumb(city);
  return <Breadcrumbs items={items} />;
}

export function BusinessBreadcrumbs({ business, category }: { business: any; category?: any }) {
  const items = BreadcrumbGenerator.generateBusinessBreadcrumb(business, category);
  return <Breadcrumbs items={items} />;
}

export function BlogBreadcrumbs({ post }: { post: any }) {
  const items = BreadcrumbGenerator.generateBlogBreadcrumb(post);
  return <Breadcrumbs items={items} />;
}