const { createRequestHandler } = require("@react-router/node");

exports.handler = async (event, context) => {
  try {
    const build = await import("../../build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js");
    
    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || "production",
    });
    
    return await requestHandler(event, context);
  } catch (error) {
    console.error("Server function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};