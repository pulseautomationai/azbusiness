// Vercel serverless function adapter for React Router v7
import { createRequestHandler } from "@react-router/node";
import * as build from "../build/server/index.js";

export default createRequestHandler({
  build,
  mode: process.env.NODE_ENV || "production",
});