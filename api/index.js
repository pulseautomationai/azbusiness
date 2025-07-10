// api/index.js - Quick test version
export default function handler(req, res) {
  console.log('Request:', req.method, req.url);
  
  if (req.url === '/favicon.ico') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const html = `<!DOCTYPE html>
<html>
  <head><title>Test</title></head>
  <body>
    <h1>React Router Test</h1>
    <p>URL: ${req.url}</p>
  </body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}