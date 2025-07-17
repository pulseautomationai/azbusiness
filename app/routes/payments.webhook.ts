import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Forward the webhook to Convex
    const body = await request.text();
    const headers: Record<string, string> = {};
    
    // Copy relevant headers
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log("Forwarding webhook to Convex...");
    
    const response = await fetch("https://brainy-mole-762.convex.cloud/payments/webhook", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: body,
    });

    console.log("Convex response status:", response.status);
    
    if (response.ok) {
      const result = await response.text();
      console.log("Webhook processed successfully");
      return new Response(result, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const error = await response.text();
      console.error("Convex webhook error:", error);
      return new Response(error, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Webhook forwarding error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Test endpoint
export async function loader() {
  return new Response(JSON.stringify({ 
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString() 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}