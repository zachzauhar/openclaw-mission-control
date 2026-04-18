import { cpus, totalmem, freemem, loadavg, uptime, hostname, platform, arch } from "os";
import { statfs } from "fs/promises";

export const dynamic = "force-dynamic";

export async function GET() {
  const cpu = cpus();
  const cpuUsage = cpu.length > 0
    ? Math.round(cpu.reduce((acc, c) => {
        const total = Object.values(c.times).reduce((a, b) => a + b, 0);
        return acc + (1 - c.times.idle / total);
      }, 0) / cpu.length * 100)
    : 0;
  const loads = loadavg();
  const total = totalmem();
  const free = freemem();
  const used = total - free;

  let diskTotal = 0, diskUsed = 0, diskFree = 0;
  try {
    const s = await statfs("/");
    diskTotal = s.bsize * s.blocks;
    diskFree = s.bsize * s.bavail;
    diskUsed = diskTotal - diskFree;
  } catch {}

  const data = JSON.stringify({
    ts: Date.now(),
    cpu: {
      usage: cpuUsage,
      cores: cpu.length,
      model: cpu[0]?.model || "unknown",
      speed: cpu[0]?.speed || 0,
      load1: loads[0]?.toFixed(2) || "0",
      load5: loads[1]?.toFixed(2) || "0",
      load15: loads[2]?.toFixed(2) || "0",
    },
    memory: {
      total, used, free,
      percent: Math.round(used / total * 100),
      source: "node_os",
    },
    disk: {
      total: diskTotal, used: diskUsed, free: diskFree,
      percent: diskTotal > 0 ? Math.round(diskUsed / diskTotal * 100) : 0,
    },
    uptime: uptime(),
    hostname: hostname(),
    platform: platform(),
    arch: arch(),
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(encoder.encode(`data: ${data}\n\n`));
      // Keep sending every 5s
      const id = setInterval(() => {
        try { ctrl.enqueue(encoder.encode(`data: ${data}\n\n`)); } catch { clearInterval(id); }
      }, 5000);
      // Close after 5 min
      setTimeout(() => { clearInterval(id); ctrl.close(); }, 300000);
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
