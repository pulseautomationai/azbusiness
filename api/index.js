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
    
    // Try to import the user's routes file, but wrap in try-catch
    let routes = [];
    let routeSource = 'fallback';
    
    try {
      // Try to import build routes first
      const build = await import('../build/server/index.js');
      if (build.routes && typeof build.routes === 'object') {
        // Convert build routes object to array format
        const buildRoutes = build.routes;
        const routesArray = [];
        const routeMap = new Map();
        
        // First pass: create route objects
        for (const [routeId, route] of Object.entries(buildRoutes)) {
          const routeObj = {
            id: route.id,
            path: route.path || undefined,
            index: route.index || undefined,
            Component: route.module?.default || (() => React.createElement('div', null, `Route: ${String(routeId)}`)),
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
        
        routes = routesArray;
        routeSource = 'build';
      }
    } catch (buildError) {
      console.log('Could not load build routes:', String(buildError.message));
      
      // Try app routes as fallback
      try {
        const appRoutes = await import('../app/routes.ts');
        routes = appRoutes.default || appRoutes.routes || [];
        routeSource = 'app';
      } catch (appError) {
        console.log('Could not load app routes:', String(appError.message));
      }
    }
    
    // If route import fails, create a fallback route that matches all paths
    if (!routes || routes.length === 0) {
      routes = [
        {
          id: 'root',
          path: '/',
          Component: ({ children }) => React.createElement('div', null, [
            React.createElement('h1', { key: 'title' }, 'React Router v7 - Step 2 Working!'),
            React.createElement('p', { key: 'info' }, `Route source: ${String(routeSource)}`),
            React.createElement('p', { key: 'url' }, `Current URL: ${String(req.url)}`),
            children
          ]),
          children: [
            {
              id: 'catch-all',
              path: '*',
              Component: () => React.createElement('div', null, [
                React.createElement('h2', { key: 'catch-title' }, 'Fallback Route'),
                React.createElement('p', { key: 'catch-msg' }, 'This is a fallback route showing React Router is working!')
              ])
            }
          ]
        }
      ];
      routeSource = 'fallback';
    }
    
    // Log how many routes were loaded for debugging
    console.log(`Loaded ${routes.length} routes from ${routeSource}`);
    
    // Create a static handler using createStaticHandler with the imported routes
    const { query, dataRoutes } = createStaticHandler(routes);
    
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
    const router = createStaticRouter(dataRoutes, context);
    
    // Add error boundary and proper context setup
    let reactHtml;
    try {
      // Wrap the StaticRouterProvider in React.StrictMode for proper context
      const routerElement = React.createElement(StaticRouterProvider, { 
        router: router, 
        context: context 
      });
      
      const appElement = React.createElement(React.StrictMode, null, routerElement);
      
      // Use renderToString to convert React element to HTML with error isolation
      reactHtml = renderToString(appElement);
    } catch (renderError) {
      console.error('React Router render error:', String(renderError.message));
      
      // Fallback to simple message if router context fails
      const fallbackElement = React.createElement('div', null, [
        React.createElement('h1', { key: 'title' }, 'React Router v7 - Context Error'),
        React.createElement('p', { key: 'error' }, `Render Error: ${String(renderError.message)}`),
        React.createElement('p', { key: 'url' }, `URL: ${String(req.url)}`),
        React.createElement('p', { key: 'routes' }, `Routes loaded: ${routes.length} from ${String(routeSource)}`)
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