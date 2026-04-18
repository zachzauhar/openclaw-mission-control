import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({}); }
export async function POST() { return NextResponse.json({ ok: true }); }
export async function PATCH() { return NextResponse.json({ ok: true }); }
export async function DELETE() { return NextResponse.json({ ok: true }); }
