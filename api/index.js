// api/index.js - React Router v7 Vercel handler using Node adapter

export default async function handler(request) {
  try {
    // Import React Router Node adapter
    const { createRequestHandler } = await import('@react-router/node');
    
    // Import the build manifest
    const build = await import('../build/server/index.js');
    
    // Create request handler with build
    const handleRequest = createRequestHandler({ build });
    
    // Convert Vercel request to standard Web API Request
    const url = new URL(request.url || `https://${request.headers.host}${request.path || '/'}`);
    
    const webRequest = new Request(url.toString(), {
      method: request.method || 'GET',
      headers: new Headers(request.headers),
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Call React Router handler
    const response = await handleRequest(webRequest);
    
    return response;

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