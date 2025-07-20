import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { ClerkProvider, useAuth } from "@clerk/react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { Route } from "./+types/root";
import "./app.css";
import { Analytics } from "@vercel/analytics/react";
import { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";
import { HydrateFallback } from "./components/hydrate-fallback";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// SPA mode loader - return empty object for development
export async function loader() {
  return {};
}
export const links: Route.LinksFunction = () => [
  // DNS prefetch for external services
  { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
  { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
  { rel: "dns-prefetch", href: "https://api.convex.dev" },
  { rel: "dns-prefetch", href: "https://clerk.dev" },
  
  // Preconnect to font services
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  
  // Font with display=swap for performance
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  
  // Favicon and Icons
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/logo.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/logo.png",
  },
  {
    rel: "manifest",
    href: "/manifest.json",
  },
  {
    rel: "mask-icon",
    href: "/logo.png",
    color: "#dc2626",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Analytics debug={false} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  // Temporarily disabled for debugging
  // const { metrics, navigationTiming } = usePerformanceMonitoring();
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} // Development keys - update for production
      signUpFallbackRedirectUrl="/"
      signInFallbackRedirectUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <PerformanceMonitor>
          <Outlet />
        </PerformanceMonitor>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export { HydrateFallback };

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
