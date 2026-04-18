import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ updateAvailable: false, current: "0.4.9", latest: "0.4.9" }); }
