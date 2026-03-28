import { NextRequest } from "next/server";
import { continueDebate } from "@/lib/orchestrator";
import type { Agent, AgentMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let body: {
    topic?: string;
    agents?: Agent[];
    messages?: AgentMessage[];
  };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const agents = Array.isArray(body.agents) ? body.agents : [];
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!topic || agents.length === 0) {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Missing topic or agents" } },
      { status: 400 },
    );
  }

  const abortController = new AbortController();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      }

      try {
        for await (const sseEvent of continueDebate(
          topic,
          agents,
          messages,
          abortController.signal,
        )) {
          if (abortController.signal.aborted) break;
          send(sseEvent.type, sseEvent.data);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        if (!abortController.signal.aborted) {
          send("error", { message });
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
