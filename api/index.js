// api/index.js - Vercel function handler for React Router v7

export default async function handler(request) {
  try {
    // Import the React Router server build directly
    const { default: handleRequest } = await import('../build/server/index.js');
    
    // Create a proper Request object
    const url = new URL(request.url || `https://${request.headers.host}${request.path || '/'}`);
    const fetchRequest = new Request(url.toString(), {
      method: request.method || 'GET',
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Call the React Router handler directly
    const response = await handleRequest(fetchRequest);
    
    // Convert Response to Vercel format
    const responseBody = await response.text();
    
    return new Response(responseBody, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}