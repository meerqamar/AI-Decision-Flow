import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ai-decision-flow", isDev: process.env.NODE_ENV === "development" });
