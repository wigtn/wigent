import { NextRequest } from "next/server";
import { runDebate } from "@/lib/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let body: { topic?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";

  if (topic.length < 5 || topic.length > 200) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Topic must be 5-200 characters",
        },
      },
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
        for await (const sseEvent of runDebate(topic, abortController.signal)) {
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
