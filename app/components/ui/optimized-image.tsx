import { useState, useRef, useEffect, type ImgHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  placeholder,
  blurDataURL,
  sizes,
  priority = false,
  quality = 75,
  className,
  fallback,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Generate responsive sources
  const generateSrcSet = (baseSrc: string) => {
    if (!width || !height) return baseSrc;
    
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .filter(size => size <= width * 2) // Don't upscale beyond 2x
      .map(size => {
        const params = new URLSearchParams();
        params.set('w', size.toString());
        params.set('q', quality.toString());
        const url = baseSrc.includes('?') 
          ? `${baseSrc}&${params.toString()}`
          : `${baseSrc}?${params.toString()}`;
        return `${url} ${size}w`;
      })
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Show placeholder while not in view or loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-200 animate-pulse',
          width && height && `aspect-[${width}/${height}]`,
          className
        )}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      >
        {blurDataURL && (
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full object-cover opacity-50 blur-sm"
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  // Show fallback on error
  if (hasError && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={cn('object-cover', className)}
        style={{ width, height }}
        {...props}
      />
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={cn(
          'bg-gray-100 flex items-center justify-center text-gray-400 text-sm',
          width && height && `aspect-[${width}/${height}]`,
          className
        )}
        style={{ width, height }}
      >
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            blurDataURL && 'bg-transparent'
          )}
        >
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover opacity-50 blur-sm"
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes || '100vw'}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          'object-cover w-full h-full'
        )}
        {...props}
      />
    </div>
  );
}

interface ImagePlaceholderProps {
  width: number;
  height: number;
  text?: string;
  className?: string;
}

export function ImagePlaceholder({ 
  width, 
  height, 
  text = 'Image', 
  className 
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
        className
      )}
      style={{ width, height }}
      aria-label={`${text} placeholder`}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

// Utility function to generate blur data URLs
export function generateBlurDataURL(width = 8, height = 8): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}