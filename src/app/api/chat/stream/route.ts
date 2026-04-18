import { getAgentApiUrl } from "@/lib/paths";

/**
 * Streaming chat endpoint — simplified for our Open Claw agent.
 * Falls back to non-streaming since our agent doesn't support SSE yet.
 *
 * POST /api/chat/stream
 * Body: { agent, messages, sessionKey? }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const channelId: string = body.sessionKey || body.agentId || body.agent || "dashboard";

    // Extract last user message text
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    let text = "";
    if (lastUserMsg?.parts) {
      text = lastUserMsg.parts
        .filter((p: { type: string; text?: string }) => p.type === "text" && p.text)
        .map((p: { text: string }) => p.text)
        .join("\n");
    } else if (lastUserMsg?.content) {
      text = lastUserMsg.content;
    }

    if (!text.trim()) {
      return new Response("Please send a message.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const apiUrl = getAgentApiUrl();
    const agentRes = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, channel_id: channelId }),
      signal: AbortSignal.timeout(180_000),
    });

    if (!agentRes.ok) {
      const errText = await agentRes.text().catch(() => "Agent unavailable");
      return new Response(
        JSON.stringify({ error: "agent_error", message: errText }),
        { status: agentRes.status, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await agentRes.json();
    const responseText = data.response || "(no response)";

    // Emit as a simple SSE stream for compatibility
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "response.output_text.delta", delta: responseText })}\n\ndata: [DONE]\n\n`,
          ),
        );
        ctrl.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "internal",
        message: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
