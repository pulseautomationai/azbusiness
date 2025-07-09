// Vercel serverless function adapter for React Router v7
import { createRequestHandler } from "@react-router/node";

export default async function handler(req, res) {
  try {
    // Import the React Router build dynamically
    const build = await import("../build/server/index.js");
    
    // Create the request handler
    const requestHandler = createRequestHandler({
      build: build.default || build,
      mode: process.env.NODE_ENV || "production",
    });
    
    // Convert Vercel req/res to standard Request/Response
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    // Handle the request
    const response = await requestHandler(request);
    
    // Convert Response back to Vercel format
    const body = await response.text();
    
    // Set status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Send response
    res.end(body);
    
  } catch (error) {
    console.error("Server function error:", error);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      stack: error.stack
    });
  }
}