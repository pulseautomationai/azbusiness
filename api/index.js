// api/index.js - Vercel function handler for React Router v7

export default async function handler(request, response) {
  try {
    // Import the React Router server build
    const { default: handleRequest } = await import('../build/server/index.js');
    
    // Build proper Request URL 
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const url = new URL(request.url || '/', `${protocol}://${host}`);
    
    // Create Web API Request object
    const webRequest = new Request(url.toString(), {
      method: request.method || 'GET',
      headers: new Headers(request.headers),
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Create router context and headers
    const responseHeaders = new Headers();
    let responseStatusCode = 200;

    // Call React Router's handleRequest function with proper parameters
    const webResponse = await handleRequest(
      webRequest,
      responseStatusCode,
      responseHeaders,
      {}, // routerContext - empty for now
      {} // loadContext - empty for now
    );

    // Convert Web API Response to Vercel Response
    const body = await webResponse.text();
    
    // Set headers
    webResponse.headers.forEach((value, key) => {
      response.setHeader(key, value);
    });
    
    // Set status and send response
    response.status(webResponse.status).send(body);
    
  } catch (error) {
    console.error('Handler error:', error);
    response.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: error.stack
    });
  }
}