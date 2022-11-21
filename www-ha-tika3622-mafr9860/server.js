import { serve } from "https://deno.land/std@0.156.0/http/server.ts";
import { handleRequest } from "./app.js";

await serve(handleRequest, { port: 5000 });