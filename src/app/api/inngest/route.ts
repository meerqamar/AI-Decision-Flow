import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { runAiWorkflow } from "@/inngest/functions";

const handler = serve({
  client: inngest,
  functions: [
    runAiWorkflow,
  ],
});

export const GET = async (req: any) => { try { return await handler.GET(req); } catch(e) { console.error("GET INNGEST ERROR:", e); throw e; } };
export const POST = async (req: any) => { try { return await handler.POST(req); } catch(e) { console.error("POST INNGEST ERROR:", e); throw e; } };
export const PUT = async (req: any) => { try { return await handler.PUT(req); } catch(e) { console.error("PUT INNGEST ERROR:", e); throw e; } };
