// Vercel serverless function adapter for React Router v7
import { createRequestHandler } from "@react-router/node";

export default async function handler(req, res) {
  try {
    // Import the React Router build dynamically
    const build = await import("../build/server/index.js");
    
    // Create the request handler
    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || "production",
    });
    
    // Handle the request
    return await requestHandler(req, res);
  } catch (error) {
    console.error("Server function error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}