// api/index.js - Step 1: Basic React Server-Side Rendering Handler
export default async function handler(req, res) {
  console.log('Request:', req.method, req.url);
  
  // Handle favicon requests with quick 404 to avoid noise
  if (req.url === '/favicon.ico') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  try {
    // Import React and ReactDOM server-side rendering functions using dynamic imports
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    
    // Create a simple React element that displays working message and current URL
    const reactElement = React.createElement('div', null, [
      React.createElement('h1', { key: 'title' }, 'React Router v7 Working!'),
      React.createElement('p', { key: 'url' }, `Current URL: ${String(req.url)}`),
      React.createElement('p', { key: 'method' }, `Method: ${String(req.method)}`),
      React.createElement('p', { key: 'timestamp' }, `Server Time: ${new Date().toISOString()}`)
    ]);
    
    // Use renderToString to convert React element to HTML
    const reactHtml = renderToString(reactElement);
    
    // Wrap the rendered React in a complete HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React Router v7 - Step 1 Test</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      h1 { color: #2563eb; }
      p { margin: 10px 0; }
    </style>
  </head>
  <body>
    <div id="root">${reactHtml}</div>
  </body>
</html>`;

    // Use res.writeHead and res.end to send the response
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    
  } catch (error) {
    // Comprehensive error handling that converts all error messages to strings
    console.error('Handler error:', error);
    
    const errorMessage = String(error.message || 'Unknown error occurred');
    const errorStack = String(error.stack || 'No stack trace available');
    
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Error - React Router v7</title>
    <style>
      body { font-family: monospace; margin: 40px; }
      .error { color: #dc2626; background: #fef2f2; padding: 20px; border-radius: 8px; }
      .stack { background: #f3f4f6; padding: 15px; margin-top: 15px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="error">
      <h1>Server Error</h1>
      <p><strong>Message:</strong> ${errorMessage}</p>
      <div class="stack">${errorStack}</div>
    </div>
  </body>
</html>`;

    // Error responses also use res.writeHead and res.end pattern
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(errorHtml);
  }
}