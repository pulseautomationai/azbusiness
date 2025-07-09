const { createRequestHandler } = require("@react-router/node");
const path = require("path");
const fs = require("fs");

exports.handler = async (event, context) => {
  try {
    // Log the current working directory and build path for debugging
    console.log("Current working directory:", process.cwd());
    console.log("__dirname:", __dirname);
    
    // Check different possible build paths
    const possiblePaths = [
      path.resolve(__dirname, "../../build/server/index.js"),
      path.resolve(process.cwd(), "build/server/index.js"),
      path.resolve(__dirname, "../build/server/index.js"),
      path.resolve("/var/task/build/server/index.js"),
      path.resolve(__dirname, "../../build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js"),
      path.resolve(process.cwd(), "build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js"),
    ];
    
    console.log("Checking possible build paths:");
    let buildPath = null;
    
    for (const testPath of possiblePaths) {
      console.log(`Checking: ${testPath}`);
      try {
        if (fs.existsSync(testPath)) {
          buildPath = testPath;
          console.log(`Found build at: ${buildPath}`);
          break;
        }
      } catch (e) {
        console.log(`Error checking ${testPath}:`, e.message);
      }
    }
    
    if (!buildPath) {
      // List the actual directory structure
      console.log("Build not found, checking directory structure:");
      
      try {
        // Check root directory contents
        console.log("Root directory (/var/task) contents:", fs.readdirSync("/var/task"));
        
        // Check if build directory exists
        const buildDir = path.resolve(process.cwd(), "build");
        console.log("Looking for build directory at:", buildDir);
        if (fs.existsSync(buildDir)) {
          console.log("build/ directory contents:", fs.readdirSync(buildDir));
          const serverDir = path.join(buildDir, "server");
          if (fs.existsSync(serverDir)) {
            console.log("build/server/ directory contents:", fs.readdirSync(serverDir));
          }
        } else {
          console.log("build/ directory does not exist");
        }
        
        // Check if the files are in a different location
        const possibleBuildDirs = [
          "/var/task/build",
          "/var/task/.netlify/functions-internal/build",
          "/var/task/dist",
          "/var/task/out"
        ];
        
        for (const dir of possibleBuildDirs) {
          if (fs.existsSync(dir)) {
            console.log(`Found directory: ${dir}`);
            console.log(`Contents: ${fs.readdirSync(dir)}`);
          }
        }
        
      } catch (dirError) {
        console.log("Error checking directories:", dirError.message);
      }
      
      throw new Error("No valid build file found");
    }
    
    // Import the server build
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
        cwd: process.cwd(),
        dirname: __dirname,
        stack: error.stack
      }),
    };
  }
};