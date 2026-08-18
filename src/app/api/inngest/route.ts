import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { runAiWorkflow } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runAiWorkflow,
  ],
});
