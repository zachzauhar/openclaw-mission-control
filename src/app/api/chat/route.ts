import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";

/**
 * Chat endpoint — proxies messages to our Open Claw agent's HTTP API.
 * Works with Vercel AI SDK v5's TextStreamChatTransport.
 *
 * Request body: { messages, agentId?, sessionKey? }
 * Each UIMessage has { id, role, parts: [{ type: 'text', text }] }
 */

type MessagePart = {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
};

type Message = {
  role: string;
  parts?: MessagePart[];
  content?: string;
};

function extractText(messages: Message[]): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return "";

  if (lastUserMsg.parts) {
    return lastUserMsg.parts
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text)
      .join("\n");
  }

  return lastUserMsg.content || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages || [];
    const channelId: string = body.sessionKey || body.agentId || "dashboard";

    const text = extractText(messages);
    if (!text) {
      return new Response("Please send a message.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const apiUrl = getAgentApiUrl();

    const agentRes = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: getAgentAuthHeaders(),
      body: JSON.stringify({
        message: text,
        channel_id: channelId,
      }),
      signal: AbortSignal.timeout(180_000),
    });

    if (!agentRes.ok) {
      const errText = await agentRes.text().catch(() => "Agent unavailable");
      return new Response(`Error: ${errText}`, {
        status: agentRes.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const data = await agentRes.json();
    const responseText = data.response || "(no response)";

    // Return as plain text stream for TextStreamChatTransport
    return new Response(responseText, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    const errMsg =
      err instanceof Error ? err.message : "Failed to get agent response";
    return new Response(`Error: ${errMsg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
