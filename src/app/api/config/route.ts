import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const res = await fetch(`${getAgentApiUrl()}/api/config`, { headers: getAgentAuthHeaders(), signal: AbortSignal.timeout(3000) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ settings: {}, schema: {} });
}
export async function PATCH() { return NextResponse.json({ ok: true }); }
export async function PUT() { return NextResponse.json({ ok: true }); }
