// api/index.js - Step 2: React Router Static Handler
export default async function handler(req, res) {
  console.log('Request:', req.method, req.url);
  
  // Handle favicon requests with quick 404 to avoid noise
  if (req.url === '/favicon.ico') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  try {
    // Import React correctly for JSX createElement context
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    
    // Import React Router's createStaticHandler, createStaticRouter, and StaticRouterProvider
    const { createStaticHandler, createStaticRouter, StaticRouterProvider } = await import('react-router');
    
    // Step 1: Try Real Routes with Error Isolation
    let routes = [];
    let routeSource = 'minimal';
    let routeError = null;
    
    // Keep the working minimal route as fallback
    const MinimalComponent = () => React.createElement('div', null, [
      React.createElement('h1', { key: 'title' }, 'Minimal Route Test Working - Fallback Mode'),
      React.createElement('p', { key: 'url' }, `Current URL: ${String(req.url)}`),
      React.createElement('p', { key: 'timestamp' }, `Server Time: ${new Date().toISOString()}`),
      React.createElement('p', { key: 'source' }, `Route Source: ${String(routeSource)}`),
      React.createElement('p', { key: 'method' }, `Method: ${String(req.method)}`),
      routeError ? React.createElement('div', { key: 'error', style: { background: '#ffe6e6', padding: '10px', margin: '10px 0', border: '1px solid #ff0000' } }, [
        React.createElement('h3', { key: 'error-title' }, 'Route Error Details'),
        React.createElement('p', { key: 'error-msg' }, `Error: ${String(routeError)}`)
      ]) : null,
      React.createElement('div', { key: 'info', style: { background: '#f0f0f0', padding: '10px', margin: '10px 0' } }, [
        React.createElement('h3', { key: 'debug-title' }, 'Debug Info'),
        React.createElement('p', { key: 'debug1' }, 'Fallback active - real routes failed'),
        React.createElement('p', { key: 'debug2' }, 'Check console for specific component errors'),
        React.createElement('p', { key: 'debug3' }, 'Some component is using Router hooks incorrectly')
      ])
    ].filter(Boolean));
    
    // Add a try-catch around the route import
    console.log('Attempting to import real routes...');
    try {
      // Try to import your real routes first
      const build = await import('../build/server/index.js');
      
      if (build.routes && typeof build.routes === 'object') {
        console.log('Real routes imported successfully, converting to array...');
        
        // Convert build routes object to array format
        const buildRoutes = build.routes;
        const routesArray = [];
        const routeMap = new Map();
        
        // Log each route being processed
        console.log('Processing routes:', Object.keys(buildRoutes));
        
        // First pass: create route objects with error logging
        for (const [routeId, route] of Object.entries(buildRoutes)) {
          console.log(`Processing route: ${routeId}, path: ${route.path}`);
          
          try {
            const routeObj = {
              id: route.id,
              path: route.path || undefined,
              index: route.index || undefined,
              // Wrap components with error boundaries
              Component: route.module?.default || (() => {
                console.log(`Fallback component for route: ${String(routeId)}`);
                return React.createElement('div', null, [
                  React.createElement('h2', { key: 'title' }, `Route: ${String(routeId)}`),
                  React.createElement('p', { key: 'msg' }, 'Component not found or failed to load')
                ]);
              }),
              loader: route.module?.loader,
              action: route.module?.action,
            };
            
            routeMap.set(routeId, routeObj);
            
            // Root route goes directly into array
            if (routeId === 'root') {
              routesArray.push(routeObj);
            }
          } catch (routeProcessError) {
            console.error(`Error processing route ${routeId}:`, String(routeProcessError.message));
            routeError = `Route ${routeId}: ${routeProcessError.message}`;
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
        
        routes = routesArray;
        routeSource = 'build';
        console.log(`Successfully converted ${routes.length} routes from build`);
      }
    } catch (importError) {
      console.error('Failed to import real routes:', String(importError.message));
      routeError = `Import failed: ${importError.message}`;
    }
    
    // If import failed, create fallback minimal routes
    if (!routes || routes.length === 0) {
      console.log('Falling back to minimal routes due to import failure');
      routes = [
        {
          id: 'minimal-fallback',
          path: '*',
          Component: MinimalComponent
        }
      ];
      routeSource = 'minimal-fallback';
    }
    
    // Log how many routes were loaded for debugging
    console.log(`Loaded ${routes.length} routes from ${routeSource}`);
    
    // Create a static handler using createStaticHandler with the imported routes
    console.log('Creating StaticHandler...');
    const { query, dataRoutes } = createStaticHandler(routes);
    console.log('StaticHandler created successfully');
    
    // Convert the incoming req object to a proper URL and Request object for React Router
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const path = String(req.url || '/');
    const urlString = `${protocol}://${host}${path}`;
    
    const webRequest = new Request(urlString, {
      method: String(req.method || 'GET'),
      headers: new Headers(req.headers || {}),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
    
    // Call the query method on the static handler to get routing context
    const context = await query(webRequest);
    
    // Handle Response objects from query (like redirects) by setting proper headers and ending response
    if (context instanceof Response) {
      const status = context.status || 200;
      const headers = {};
      
      // Copy headers from Response
      context.headers.forEach((value, key) => {
        headers[String(key)] = String(value);
      });
      
      if (context.status >= 300 && context.status < 400) {
        // Handle redirects
        res.writeHead(status, headers);
        res.end();
        return;
      } else {
        // Handle other Response objects
        const responseText = await context.text();
        res.writeHead(status, headers);
        res.end(responseText);
        return;
      }
    }
    
    // Create a static router and render using StaticRouterProvider
    console.log('Creating StaticRouter...');
    const router = createStaticRouter(dataRoutes, context);
    console.log('StaticRouter created successfully');
    
    // Step 2: Wrap StaticRouterProvider in render try-catch with detailed error isolation
    let reactHtml;
    let renderError = null;
    
    try {
      console.log('Creating StaticRouterProvider element...');
      // Wrap the StaticRouterProvider in React.StrictMode for proper context
      const routerElement = React.createElement(StaticRouterProvider, { 
        router: router, 
        context: context 
      });
      
      const appElement = React.createElement(React.StrictMode, null, routerElement);
      console.log('About to call renderToString...');
      
      // Put the renderToString call in its own try-catch for specific error identification
      try {
        reactHtml = renderToString(appElement);
        console.log('renderToString completed successfully');
      } catch (specificRenderError) {
        console.error('Specific renderToString error:', String(specificRenderError.message));
        console.error('Error stack:', String(specificRenderError.stack));
        
        // Log specific component/route that caused failure
        if (specificRenderError.message.includes('useContext')) {
          console.error('IDENTIFIED: Component using React Router hooks incorrectly during SSR');
          console.error('Common causes: useParams, useNavigate, useLocation called outside Router context');
        }
        
        renderError = specificRenderError.message;
        throw specificRenderError;
      }
      
    } catch (renderError) {
      console.error('React Router render error - falling back to error display');
      console.error('Error details:', String(renderError.message));
      
      // If it fails with useContext error, log the error details and fall back
      const errorDetails = String(renderError.message);
      const isUseContextError = errorDetails.includes('useContext') || errorDetails.includes('Cannot read properties of null');
      
      console.error(`useContext error detected: ${isUseContextError}`);
      console.error('This indicates a component is calling React Router hooks incorrectly');
      
      // Fall back to a detailed "Route Error" message
      const fallbackElement = React.createElement('div', null, [
        React.createElement('h1', { key: 'title', style: { color: '#dc2626' } }, 'React Router v7 - Component Error Identified'),
        React.createElement('div', { key: 'error-box', style: { background: '#fef2f2', padding: '20px', margin: '20px 0', border: '2px solid #dc2626', borderRadius: '8px' } }, [
          React.createElement('h2', { key: 'error-title' }, 'Component Using Router Hooks Incorrectly'),
          React.createElement('p', { key: 'error-msg' }, `Error: ${errorDetails}`),
          React.createElement('p', { key: 'hook-info' }, 'Likely cause: Component calling useParams, useNavigate, useLocation, or useSearchParams during SSR'),
          React.createElement('p', { key: 'solution' }, 'Solution: Wrap hook usage in useEffect or check if running on server')
        ]),
        React.createElement('div', { key: 'debug', style: { background: '#f3f4f6', padding: '15px', margin: '15px 0' } }, [
          React.createElement('h3', { key: 'debug-title' }, 'Debug Info'),
          React.createElement('p', { key: 'url' }, `URL: ${String(req.url)}`),
          React.createElement('p', { key: 'routes' }, `Routes loaded: ${routes.length} from ${String(routeSource)}`),
          React.createElement('p', { key: 'context-ok' }, 'Router context setup: ✅ Working (minimal routes succeeded)'),
          React.createElement('p', { key: 'issue' }, 'Issue: ❌ Specific component in your app routes')
        ]),
        React.createElement('div', { key: 'investigation', style: { background: '#eff6ff', padding: '15px', margin: '15px 0' } }, [
          React.createElement('h3', { key: 'inv-title' }, 'Component Investigation Needed'),
          React.createElement('p', { key: 'inv1' }, 'Check components for: useParams(), useNavigate(), useLocation(), useSearchParams()'),
          React.createElement('p', { key: 'inv2' }, 'Ensure hooks are only called inside useEffect for SSR compatibility'),
          React.createElement('p', { key: 'inv3' }, 'Add server-side checks: if (typeof window !== "undefined") before hook usage')
        ])
      ]);
      
      reactHtml = renderToString(fallbackElement);
    }
    
    // Get status code from context
    const statusCode = context.statusCode || 200;
    
    // Wrap the rendered React in a complete HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React Router v7 - Step 2</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      h1 { color: #2563eb; }
      h2 { color: #059669; }
      p { margin: 10px 0; }
      .debug { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div id="root">${reactHtml}</div>
    <div class="debug">
      <h3>Debug Info</h3>
      <p>Route Source: ${String(routeSource)}</p>
      <p>Routes Loaded: ${routes.length}</p>
      <p>Status Code: ${statusCode}</p>
      <p>Server Time: ${new Date().toISOString()}</p>
    </div>
  </body>
</html>`;

    // Use res.writeHead and res.end to send the response
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    
  } catch (error) {
    // Maintain the same error handling pattern as Step 1 (string conversion, res.writeHead/res.end)
    console.error('Handler error:', error);
    
    const errorMessage = String(error.message || 'Unknown error occurred');
    const errorStack = String(error.stack || 'No stack trace available');
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Error - React Router v7 Step 2</title>
    <style>
      body { font-family: monospace; margin: 40px; }
      .error { color: #dc2626; background: #fef2f2; padding: 20px; border-radius: 8px; }
      .stack { background: #f3f4f6; padding: 15px; margin-top: 15px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="error">
      <h1>Server Error - Step 2</h1>
      <p><strong>Message:</strong> ${errorMessage}</p>
      <div class="stack">${errorStack}</div>
    </div>
  </body>
</html>`;

    // Error responses use res.writeHead and res.end pattern
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(errorHtml);
  }
}