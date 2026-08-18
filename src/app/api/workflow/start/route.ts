import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodes, edges } = body;

    const startNode = nodes.find((n: any) => n.type === "start");
    if (!startNode) {
      return NextResponse.json({ error: "Missing start node" }, { status: 400 });
    }

    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await inngest.send({
      name: "workflow.execute",
      data: {
        workflowId,
        nodes,
        edges,
        startNodeId: startNode.id,
      },
    });

    return NextResponse.json({ workflowId });
  } catch (error) {
    console.error("Error starting workflow:", error);
    return NextResponse.json({ error: error instanceof Error ? (error.stack || error.message) : String(error) }, { status: 500 });
  }
}
