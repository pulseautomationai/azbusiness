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
    
    // Create minimal routes array with simple components that don't use React Router hooks
    let routes = [];
    let routeSource = 'minimal';
    
    console.log('Creating minimal routes for testing...');
    
    // Create simple React element that shows minimal route test
    const MinimalComponent = () => React.createElement('div', null, [
      React.createElement('h1', { key: 'title' }, 'Minimal Route Test Working'),
      React.createElement('p', { key: 'url' }, `Current URL: ${String(req.url)}`),
      React.createElement('p', { key: 'timestamp' }, `Server Time: ${new Date().toISOString()}`),
      React.createElement('p', { key: 'source' }, `Route Source: ${String(routeSource)}`),
      React.createElement('p', { key: 'method' }, `Method: ${String(req.method)}`),
      React.createElement('div', { key: 'info', style: { background: '#f0f0f0', padding: '10px', margin: '10px 0' } }, [
        React.createElement('h3', { key: 'debug-title' }, 'Debug Info'),
        React.createElement('p', { key: 'debug1' }, 'No React Router hooks used in this component'),
        React.createElement('p', { key: 'debug2' }, 'Testing basic StaticRouterProvider context'),
        React.createElement('p', { key: 'debug3' }, 'This should render without useContext errors')
      ])
    ]);
    
    // Create an array with one route that matches all paths
    routes = [
      {
        id: 'minimal-test',
        path: '*',
        Component: MinimalComponent
      }
    ];
    
    console.log('Minimal routes created successfully:', routes.length);
    
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
    
    // Add error boundary and proper context setup
    let reactHtml;
    try {
      console.log('Creating StaticRouterProvider element...');
      // Wrap the StaticRouterProvider in React.StrictMode for proper context
      const routerElement = React.createElement(StaticRouterProvider, { 
        router: router, 
        context: context 
      });
      
      const appElement = React.createElement(React.StrictMode, null, routerElement);
      console.log('About to call renderToString...');
      
      // Use renderToString to convert React element to HTML with error isolation
      reactHtml = renderToString(appElement);
      console.log('renderToString completed successfully');
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