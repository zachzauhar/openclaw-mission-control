import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const res = await fetch(`${getAgentApiUrl()}/api/health`, { headers: getAgentAuthHeaders(), signal: AbortSignal.timeout(3000) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ status: "error" }, { status: 503 });
}
