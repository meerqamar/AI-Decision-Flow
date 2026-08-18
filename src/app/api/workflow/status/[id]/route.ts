import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      const state = await redis.get(`execution:${id}`);

      if (!state) {
        return NextResponse.json({ error: "Execution not found" }, { status: 404 });
      }

      return NextResponse.json(state);
    } catch (e) {
      return NextResponse.json({ error: "Failed to connect to Redis" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
