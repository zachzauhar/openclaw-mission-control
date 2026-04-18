import { NextResponse } from "next/server";
import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const res = await fetch(`${getAgentApiUrl()}/api/tasks`, { headers: getAgentAuthHeaders(), signal: AbortSignal.timeout(3000) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ tasks: [] });
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${getAgentApiUrl()}/api/tasks`, { method: "POST", headers: getAgentAuthHeaders(), body: JSON.stringify(body) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ ok: true });
}
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || "";
    const res = await fetch(`${getAgentApiUrl()}/api/tasks/${id}`, { method: "PATCH", headers: getAgentAuthHeaders(), body: JSON.stringify(body) });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {}
  return NextResponse.json({ ok: true });
}
