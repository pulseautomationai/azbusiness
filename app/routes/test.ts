import type { Route } from "./+types/test";

export async function loader({ request }: Route.LoaderArgs) {
  return new Response("Test route working", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}