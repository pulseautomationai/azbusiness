// api/index.js - Direct React Router v7 SSR handler

export default async function handler(request) {
  try {
    // Import what we need for React Router v7 SSR
    const { createStaticHandler, createStaticRouter, StaticRouterProvider } = await import('react-router');
    const { renderToString } = await import('react-dom/server');
    const React = await import('react');
    
    // Import the build manifest
    const build = await import('../build/server/index.js');
    
    // Convert React Router v7 build routes object to array format expected by createStaticHandler
    function convertBuildRoutesToArray(buildRoutes) {
      const routesArray = [];
      const routeMap = new Map();
      
      // First pass: create route objects
      for (const [routeId, route] of Object.entries(buildRoutes)) {
        const routeObj = {
          id: route.id,
          path: route.path || undefined,
          index: route.index || undefined,
          // Use the actual component from the module
          Component: route.module?.default || (() => React.createElement('div', null, `Route: ${routeId}`)),
          loader: route.module?.loader,
          action: route.module?.action,
        };
        
        routeMap.set(routeId, routeObj);
        
        // Root route goes directly into array
        if (routeId === 'root') {
          routesArray.push(routeObj);
        }
      }
      
      // Second pass: build hierarchy
      for (const [routeId, route] of Object.entries(buildRoutes)) {
        if (route.parentId && routeMap.has(route.parentId)) {
          const parentRoute = routeMap.get(route.parentId);
          const childRoute = routeMap.get(routeId);
          
          if (!parentRoute.children) {
            parentRoute.children = [];
          }
          parentRoute.children.push(childRoute);
        }
      }
      
      return routesArray;
    }
    
    // Get routes from build and convert to proper format
    const buildRoutes = build.routes;
    if (!buildRoutes || typeof buildRoutes !== 'object') {
      throw new Error('No routes found in build manifest');
    }
    
    const routes = convertBuildRoutesToArray(buildRoutes);
    console.log('Converted routes:', routes.length, 'top-level routes');
    
    // Create static handler
    const { query, dataRoutes } = createStaticHandler(routes);
    
    // Convert Vercel request to standard Web API Request
    // Handle both relative and absolute URLs
    let urlString;
    if (request.url && request.url.startsWith('http')) {
      urlString = request.url;
    } else {
      const protocol = request.headers['x-forwarded-proto'] || 'https';
      const host = request.headers['x-forwarded-host'] || request.headers.host || 'localhost';
      const path = request.url || request.path || '/';
      urlString = `${protocol}://${host}${path}`;
    }
    
    const url = new URL(urlString);
    
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
    const appHtml = renderToString(
      React.createElement(StaticRouterProvider, { router, context })
    );

    // Get status code
    const statusCode = context.statusCode || 200;

    // Get assets from build manifest
    const assets = build.assets || {};
    const entry = build.entry || {};
    
    // Find CSS and JS files
    let cssFile = '';
    let jsFile = entry.module || '';
    
    // Look for root CSS in assets
    if (assets && assets.routes && assets.routes.root) {
      const rootAssets = assets.routes.root;
      if (rootAssets.css && rootAssets.css.length > 0) {
        cssFile = rootAssets.css[0];
      }
    }
    
    // Log assets for debugging
    console.log('Build entry:', entry);
    console.log('CSS file:', cssFile);
    console.log('JS file:', jsFile);
    
    // Create complete HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AZ Business Services - Arizona Local Business Directory</title>
    ${cssFile ? `<link rel="stylesheet" href="${cssFile}" />` : ''}
  </head>
  <body>
    <div id="root">${appHtml}</div>
    ${jsFile ? `<script type="module" src="${jsFile}"></script>` : ''}
  </body>
</html>`;

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

    return new Response(html, {
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