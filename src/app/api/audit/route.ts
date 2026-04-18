import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") || "50";
  try {
    const res = await fetch(`${getAgentApiUrl()}/api/audit?limit=${limit}`, { headers: getAgentAuthHeaders(), signal: AbortSignal.timeout(3000) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ events: [] });
}
