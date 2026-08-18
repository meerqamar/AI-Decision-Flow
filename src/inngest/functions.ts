import { inngest } from "./client";
import { askGeminiYesNo } from "@/lib/gemini";
import fs from "fs/promises";
import path from "path";

type WorkflowPayload = {
  workflowId: string;
  nodes: any[];
  edges: any[];
  startNodeId: string;
};

export const runAiWorkflow = inngest.createFunction(
  { id: "run-ai-workflow", triggers: [{ event: "workflow.execute" }] },
  async ({ event, step }) => {
    const { workflowId, nodes, edges, startNodeId } = event.data as WorkflowPayload;

    const getExecutionFilePath = () => path.join(process.cwd(), "executions.json");

    // Initialize execution state
    await step.run("init-execution-state", async () => {
      const state = {
        status: "RUNNING",
        logs: [],
        currentNodeId: startNodeId,
        visitedEdges: [],
        visitedNodes: [startNodeId],
      };
      
      let allExecutions: any = {};
      try {
        const fileData = await fs.readFile(getExecutionFilePath(), "utf-8");
        allExecutions = JSON.parse(fileData);
      } catch (e) {
        // File might not exist yet
      }
      allExecutions[workflowId] = state;
      await fs.writeFile(getExecutionFilePath(), JSON.stringify(allExecutions, null, 2));
      return state;
    });

    let currentNodeId = startNodeId;
    let keepRunning = true;
    let stepCount = 0;
    const MAX_STEPS = 20; // safety limit

    while (keepRunning && stepCount < MAX_STEPS) {
      stepCount++;
      
      const stepResult: any = await step.run(`process-node-${currentNodeId}-${stepCount}`, async () => {
        const node = nodes.find((n: any) => n.id === currentNodeId);
        
        if (!node) {
          return { done: true, error: "Node not found" };
        }

        if (node.type === "result") {
          return { done: true, result: node.data.label };
        }

        if (node.type === "start") {
          // Find the single outgoing edge
          const outgoingEdge = edges.find((e: any) => e.source === currentNodeId);
          if (!outgoingEdge) {
            return { done: true, error: "Start node has no outgoing connection" };
          }
          return { done: false, nextNodeId: outgoingEdge.target, edgeId: outgoingEdge.id, decision: "START" };
        }

        if (node.type === "decision") {
          const prompt = node.data.prompt;
          if (!prompt) {
            return { done: true, error: "Decision node missing prompt" };
          }
          
          let decision: string;
          try {
            decision = await askGeminiYesNo(prompt);
          } catch (e: any) {
            return { done: true, error: `Gemini API Error: ${e.message || "Failed"}` };
          }
          
          const outgoingEdge = edges.find((e: any) => e.source === currentNodeId && e.sourceHandle === decision.toLowerCase());
          
          if (!outgoingEdge) {
            return { done: true, error: `No outgoing connection for decision: ${decision}` };
          }
          
          return { done: false, nextNodeId: outgoingEdge.target, edgeId: outgoingEdge.id, decision, prompt };
        }

        return { done: true, error: "Unknown node type" };
      });

      // Update state
      await step.run(`update-state-${stepCount}`, async () => {
        let allExecutions: any = {};
        try {
          const fileData = await fs.readFile(getExecutionFilePath(), "utf-8");
          allExecutions = JSON.parse(fileData);
        } catch (e) {}

        const state = allExecutions[workflowId];

        if (stepResult.error) {
          state.status = "ERROR";
          state.logs.push(`Error: ${stepResult.error}`);
        } else if (stepResult.done) {
          state.status = "COMPLETED";
          state.logs.push(`Workflow reached result: ${stepResult.result}`);
        } else {
          state.currentNodeId = stepResult.nextNodeId;
          state.visitedEdges.push(stepResult.edgeId);
          state.visitedNodes.push(stepResult.nextNodeId);
          if (stepResult.decision !== "START") {
            state.logs.push(`Node Evaluated. AI decided: ${stepResult.decision}`);
          } else {
            state.logs.push(`Workflow Started`);
          }
        }

        allExecutions[workflowId] = state;
        await fs.writeFile(getExecutionFilePath(), JSON.stringify(allExecutions, null, 2));
      });

      if (stepResult.done || stepResult.error) {
        keepRunning = false;
      } else {
        currentNodeId = stepResult.nextNodeId;
      }
    }

    return { success: true };
  }
);
