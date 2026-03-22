import { NextResponse } from "next/server";

const N8N_HOST = "http://157.230.156.140:5678";

export async function GET() {
  try {
    const res = await fetch(`${N8N_HOST}/webhook/ik-meetings`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`ik-meetings returned ${res.status}`);
    const raw = await res.json();
    // n8n respondWith:allIncomingItems wraps in array — unwrap first element
    const data = Array.isArray(raw) ? raw[0] : raw;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ meetings: [], total: 0, error: String(error) }, { status: 200 });
  }
}
