// api/index.js - Direct React Router v7 SSR handler

export default async function handler(request) {
  try {
    // Import what we need for React Router v7 SSR
    const { createStaticHandler, createStaticRouter, StaticRouterProvider } = await import('react-router');
    const { renderToString } = await import('react-dom/server');
    const React = await import('react');
    
    // Import the build manifest
    const build = await import('../build/server/index.js');
    
    // Get routes from the build
    const routes = build.routes;
    
    if (!routes) {
      throw new Error('No routes found in build manifest');
    }
    
    // Create static handler
    const { query, dataRoutes } = createStaticHandler(routes);
    
    // Convert Vercel request to standard Web API Request
    const url = new URL(request.url || `https://${request.headers.host}${request.path || '/'}`);
    
    const webRequest = new Request(url.toString(), {
      method: request.method || 'GET',
      headers: new Headers(request.headers),
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Query the handler for context
    const context = await query(webRequest);

    // If query returns a Response (redirect, error), return it
    if (context instanceof Response) {
      return context;
    }

    // Create static router
    const router = createStaticRouter(dataRoutes, context);

    // Render app to string  
    const html = renderToString(
      React.createElement(StaticRouterProvider, { router, context })
    );

    // Get status code
    const statusCode = context.statusCode || 200;

    // Collect headers
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    
    // Add any loader/action headers
    if (context.loaderHeaders) {
      Object.entries(context.loaderHeaders).forEach(([routeId, routeHeaders]) => {
        if (routeHeaders) {
          routeHeaders.forEach((value, key) => {
            headers.append(key, value);
          });
        }
      });
    }

    return new Response(`<!DOCTYPE html>${html}`, {
      status: statusCode,
      headers,
    });

  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({
      error: "Server error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}