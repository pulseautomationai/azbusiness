import { createRequestHandler } from "@react-router/node";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const build = await import(path.join(__dirname, "../../build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js"));

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV || "production",
});