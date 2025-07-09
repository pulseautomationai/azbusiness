import { useState } from "react";
import { cn } from "~/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  // Business-specific props
  business?: {
    name: string;
    city: string;
    category?: string;
  };
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  sizes,
  style,
  onLoad,
  onError,
  loading = "lazy",
  decoding = "async",
  business,
  ...props
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Generate SEO-friendly alt text if business data is provided
  const seoAlt = business 
    ? `${business.name} - ${business.category || "Service Provider"} in ${business.city}, Arizona`
    : alt;

  // Generate structured data for business images
  const imageSchema = business ? {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": src,
    "url": src,
    "name": seoAlt,
    "description": seoAlt,
    "width": width,
    "height": height,
    "encodingFormat": src.split('.').pop()?.toUpperCase() || "JPEG",
    "creator": {
      "@type": "Organization",
      "name": business.name
    }
  } : null;

  // Fallback image for errors
  const fallbackSrc = "/favicon.png";
  const displaySrc = imageError ? fallbackSrc : src;

  return (
    <>
      {/* Add structured data for business images */}
      {imageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageSchema),
          }}
        />
      )}
      
      <div className={cn("relative overflow-hidden", className)}>
        {/* Placeholder while loading */}
        {placeholder === "blur" && !imageLoaded && (
          <div
            className="absolute inset-0 bg-gray-200 animate-pulse"
            style={{ backgroundColor: "#f3f4f6" }}
          />
        )}
        
        <img
          src={displaySrc}
          alt={seoAlt}
          className={cn(
            "transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          width={width}
          height={height}
          loading={priority ? "eager" : loading}
          decoding={decoding}
          sizes={sizes}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        
        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
            Image unavailable
          </div>
        )}
      </div>
    </>
  );
}

// Specialized components for different image types
export function BusinessLogo({ business, className, ...props }: OptimizedImageProps & { business: any }) {
  return (
    <OptimizedImage
      src={business.logo || "/favicon.png"}
      alt={`${business.name} logo`}
      className={cn("rounded-lg object-cover", className)}
      business={business}
      priority={true}
      {...props}
    />
  );
}

export function BusinessImage({ business, image, className, ...props }: OptimizedImageProps & { business: any; image: any }) {
  return (
    <OptimizedImage
      src={image.url}
      alt={image.alt || `${business.name} - ${business.category?.name || "Service Provider"} in ${business.city}, Arizona`}
      className={cn("rounded-lg object-cover", className)}
      business={business}
      loading="lazy"
      {...props}
    />
  );
}

export function CategoryIcon({ category, className, ...props }: { category: any; className?: string } & Omit<OptimizedImageProps, "src" | "alt">) {
  if (!category.iconUrl) {
    return (
      <div className={cn("flex items-center justify-center text-2xl", className)}>
        {category.icon || "🏢"}
      </div>
    );
  }
  
  return (
    <OptimizedImage
      src={category.iconUrl}
      alt={`${category.name} services icon`}
      className={cn("rounded-lg object-cover", className)}
      loading="lazy"
      {...props}
    />
  );
}