// api/index.js - Debug version

export default async function handler(request) {
  try {
    console.log('Handler starting...');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    // First, let's see what files exist
    const fs = await import('fs');
    const path = await import('path');
    
    // Check build directory structure
    console.log('Checking build structure...');
    const buildExists = fs.existsSync('./build');
    const serverExists = fs.existsSync('./build/server');
    const indexExists = fs.existsSync('./build/server/index.js');
    
    console.log('Build exists:', buildExists);
    console.log('Server exists:', serverExists);
    console.log('Index.js exists:', indexExists);
    
    if (!indexExists) {
      return new Response(JSON.stringify({
        error: 'Server build not found',
        buildExists,
        serverExists,
        indexExists
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Try to read the first few lines of the server file
    const serverContent = fs.readFileSync('./build/server/index.js', 'utf8').slice(0, 500);
    console.log('Server file start:', serverContent);
    
    // If it starts with HTML, that's the problem
    if (serverContent.trim().startsWith('<')) {
      return new Response(JSON.stringify({
        error: 'Server file contains HTML instead of JavaScript',
        content: serverContent.slice(0, 200)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Try basic import
    console.log('Attempting to import server build...');
    const serverModule = await import('../build/server/index.js');
    console.log('Server module keys:', Object.keys(serverModule));
    
    return new Response(JSON.stringify({
      success: true,
      moduleKeys: Object.keys(serverModule),
      hasDefault: !!serverModule.default,
      message: 'Import successful - ready to implement handler'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({
      error: 'Handler failed',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}