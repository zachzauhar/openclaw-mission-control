import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = getAgentApiUrl();

  let agents: Array<{ id: string; name: string; model: string; description: string }> = [];
  let gatewayStatus = "offline";
  let uptime = 0;
  let latency = 0;

  const start = Date.now();
  try {
    const res = await fetch(`${apiUrl}/api/health`, {
      headers: getAgentAuthHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      agents = data.agents || [];
      gatewayStatus = "online";
      uptime = data.uptime_seconds || 0;
    }
  } catch {
    latency = Date.now() - start;
  }

  const emojis = ["🤖", "💻", "🔬", "📋", "🔧"];

  return NextResponse.json({
    timestamp: Date.now(),
    gateway: {
      status: gatewayStatus,
      latencyMs: latency,
      port: 3080,
      version: "0.1.0",
    },
    cron: {
      jobs: [],
      stats: { total: 0, ok: 0, error: 0 },
    },
    cronRuns: [],
    agents: agents.map((a, i) => ({
      id: a.id,
      name: a.name,
      emoji: emojis[i % emojis.length],
      sessionCount: 0,
      totalTokens: 0,
      lastActivity: 0,
    })),
    logEntries: [],
  });
}
