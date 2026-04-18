import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = getAgentApiUrl();
  const start = Date.now();

  try {
    const res = await fetch(`${apiUrl}/api/health`, {
      headers: getAgentAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    if (res.ok) {
      return NextResponse.json({
        ok: true,
        gateway: "online",
        transport: "http",
        transportConfigured: "http",
        transportReason: "orchestrator",
        port: new URL(apiUrl).port || 3080,
        timestamp: new Date().toISOString(),
        latencyMs: latency,
      });
    }

    return NextResponse.json({
      ok: false,
      gateway: "degraded",
      transport: "http",
      transportConfigured: "http",
      transportReason: `orchestrator returned ${res.status}`,
      port: 3080,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      gateway: "offline",
      transport: "http",
      transportConfigured: "http",
      transportReason: "orchestrator unreachable",
      port: 3080,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
    });
  }
}
