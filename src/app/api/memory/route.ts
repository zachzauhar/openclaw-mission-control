import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const res = await fetch(`${getAgentApiUrl()}/api/memory`, { headers: getAgentAuthHeaders(), signal: AbortSignal.timeout(3000) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ entries: [] });
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${getAgentApiUrl()}/api/memory`, { method: "POST", headers: getAgentAuthHeaders(), body: JSON.stringify(body) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ ok: true });
}
