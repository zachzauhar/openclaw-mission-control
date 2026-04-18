import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";

export const dynamic = "force-dynamic";

/**
 * Heartbeat — proxies health checks to our Open Claw agent's API.
 */

export async function GET() {
  const apiUrl = getAgentApiUrl();

  try {
    const res = await fetch(`${apiUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: "Agent returned non-200" },
        { status: 502 },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      status: "ok",
      agent: data.agent || "open-claw",
      version: data.version || {},
      uptime: data.uptime_human || "unknown",
      uptime_seconds: data.uptime_seconds || 0,
      gateway: { status: "connected", url: apiUrl },
      agents: [
        {
          id: "main",
          name: "Open Claw",
          status: "active",
        },
      ],
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Agent unreachable",
        gateway: { status: "disconnected", url: apiUrl },
        agents: [],
      },
      { status: 503 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
