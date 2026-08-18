import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = path.join(process.cwd(), "executions.json");

    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      const allExecutions = JSON.parse(fileData);
      const state = allExecutions[id];

      if (!state) {
        return NextResponse.json({ error: "Execution not found" }, { status: 404 });
      }

      return NextResponse.json(state);
    } catch (e) {
      return NextResponse.json({ error: "No executions file found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
