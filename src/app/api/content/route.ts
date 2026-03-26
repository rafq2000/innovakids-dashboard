import { NextResponse } from "next/server";

const N8N_HOST = "http://157.230.156.140:5678";

export async function GET() {
  try {
    const res = await fetch(`${N8N_HOST}/webhook/ik-content`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Content webhook returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { content: [], total: 0, generados: 0, publicados: 0, error: String(error) },
      { status: 200 }
    );
  }
}
