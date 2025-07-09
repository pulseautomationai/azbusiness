// api/index.js - Correct Vercel function handler for React Router v7

import React from "react";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { renderToString } from "react-dom/server";

export default async function handler(request) {
  try {
    // Import your routes - adjust path as needed
    const { default: routes } = await import('../app/routes.ts');
    
    // Create static handler
    const { query, dataRoutes } = createStaticHandler(routes);
    
    // Convert Vercel request to standard Request
    const url = new URL(request.url || `https://${request.headers.host}${request.path || '/'}`);
    const fetchRequest = new Request(url.toString(), {
      method: request.method || 'GET',
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Query the handler for context
    const context = await query(fetchRequest);

    // If query returns a Response (like a redirect), send it
    if (context instanceof Response) {
      return context;
    }

    // Create static router for SSR
    const router = createStaticRouter(dataRoutes, context);

    // Render to string
    const html = renderToString(
      <StaticRouterProvider router={router} context={context} />
    );

    // Set up headers
    const leaf = context.matches[context.matches.length - 1];
    const actionHeaders = context.actionHeaders[leaf?.route?.id];
    const loaderHeaders = context.loaderHeaders[leaf?.route?.id];
    const headers = new Headers(actionHeaders);
    
    if (loaderHeaders) {
      for (const [key, value] of loaderHeaders.entries()) {
        headers.append(key, value);
      }
    }
    
    headers.set("Content-Type", "text/html; charset=utf-8");

    return new Response(`<!DOCTYPE html>${html}`, {
      status: context.statusCode,
      headers,
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