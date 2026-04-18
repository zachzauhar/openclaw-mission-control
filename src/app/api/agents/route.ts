import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = getAgentApiUrl();

  try {
    const res = await fetch(`${apiUrl}/api/agents`, {
      headers: getAgentAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ agents: [] }, { status: res.status });
    }

    const data = await res.json();
    const emojis = ["🤖", "💻", "🔬", "📋", "🔧"];

    const agents = (data.agents || []).map(
      (a: { id: string; name: string; description: string; model: string; tools: string[] }, i: number) => ({
        id: a.id,
        name: a.name,
        emoji: emojis[i % emojis.length],
        model: a.model,
        fallbackModels: [],
        workspace: "~/workspace",
        agentDir: "",
        isDefault: i === 0,
        sessionCount: 0,
        lastActive: null,
        totalTokens: 0,
        description: a.description,
        tools: a.tools || [],
        status: "active",
      }),
    );

    return NextResponse.json({ agents });
  } catch (err) {
    return NextResponse.json(
      { agents: [], error: String(err) },
      { status: 503 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
