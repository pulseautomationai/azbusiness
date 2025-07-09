// Vercel serverless function adapter for React Router v7
export default async function handler(req, res) {
  try {
    console.log("Function invoked:", req.method, req.url);
    
    // Import required modules
    const { createRequestHandler } = await import("@react-router/node");
    console.log("Imported createRequestHandler");
    
    // Import the React Router build dynamically
    const build = await import("../build/server/index.js");
    console.log("Imported build, keys:", Object.keys(build));
    
    // Create the request handler
    const requestHandler = createRequestHandler({
      build: build.default || build,
      mode: process.env.NODE_ENV || "production",
    });
    console.log("Created request handler");
    
    // Use the request handler directly with Vercel's req/res
    return await requestHandler(req, res);
    
  } catch (error) {
    console.error("Server function error:", error);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      stack: error.stack
    });
  }
}