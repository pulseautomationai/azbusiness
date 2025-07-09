const { createRequestHandler } = require("@react-router/node");
const path = require("path");

exports.handler = async (event, context) => {
  try {
    // Log the current working directory and build path for debugging
    console.log("Current working directory:", process.cwd());
    console.log("__dirname:", __dirname);
    
    // Import the server build
    const buildPath = path.resolve(__dirname, "../../build/server/index.js");
    console.log("Attempting to import from:", buildPath);
    
    const build = await import(buildPath);
    console.log("Successfully imported build");
    
    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || "production",
    });
    
    console.log("Created request handler, processing request");
    return await requestHandler(event, context);
  } catch (error) {
    console.error("Server function error:", error);
    console.error("Error stack:", error.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        error: "Internal server error",
        message: error.message,
        buildPath: path.resolve(__dirname, "../../build/server/index.js"),
        cwd: process.cwd(),
        dirname: __dirname,
        stack: error.stack
      }),
    };
  }
};