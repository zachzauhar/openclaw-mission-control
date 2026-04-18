import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";
import * as os from "os";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = getAgentApiUrl();

  // Get system stats
  const cpus = os.cpus();
  const cpuUsage = cpus.length > 0
    ? Math.round(cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        return acc + (1 - cpu.times.idle / total);
      }, 0) / cpus.length * 100)
    : 0;

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = Math.round((1 - freeMem / totalMem) * 100);

  // Get agent info from orchestrator
  let agents: Array<{ id: string; name: string; model: string }> = [];
  let gatewayStatus = "offline";
  let uptime = 0;

  try {
    const res = await fetch(`${apiUrl}/api/health`, {
      headers: getAgentAuthHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      agents = data.agents || [];
      gatewayStatus = "online";
      uptime = data.uptime_seconds || 0;
    }
  } catch {
    // orchestrator unreachable
  }

  return NextResponse.json({
    system: {
      cpu: cpuUsage,
      memory: memUsage,
      memoryTotal: Math.round(totalMem / (1024 * 1024 * 1024) * 10) / 10,
      memoryUsed: Math.round((totalMem - freeMem) / (1024 * 1024 * 1024) * 10) / 10,
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
    },
    agents: agents.map((a, i) => ({
      id: a.id,
      name: a.name,
      model: a.model,
      status: "active",
      emoji: ["🤖", "💻", "🔬"][i % 3],
    })),
    gateway: {
      status: gatewayStatus,
      url: apiUrl,
      uptime,
    },
    cron: { active: 0, total: 0 },
    sessions: { active: 0 },
  });
}
