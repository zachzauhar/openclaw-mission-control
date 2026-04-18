import { NextResponse } from "next/server";
import { getAgentApiUrl } from "@/lib/paths";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = getAgentApiUrl();

  try {
    const res = await fetch(`${apiUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();

    return NextResponse.json({
      status: "connected",
      url: apiUrl,
      agent: data.agent,
      version: data.version,
    });
  } catch {
    return NextResponse.json(
      { status: "disconnected", url: apiUrl },
      { status: 503 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ ok: true });
}

export async function PATCH() {
  return NextResponse.json({ ok: true });
}
