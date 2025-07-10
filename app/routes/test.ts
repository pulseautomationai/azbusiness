// Test route - SPA mode compatible
export default function TestRoute() {
  return new Response("Test route working - SPA mode", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}