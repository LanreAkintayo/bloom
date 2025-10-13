import { NextResponse } from "next/server";
import { handleMessage } from "@/lib/gemini";

// Simple in-memory cache
const cache = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "No message provided" }, { status: 400 });

    if (cache.has(message)) return NextResponse.json(cache.get(message));

    const response:any = await handleMessage(message);

    cache.set(message, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
