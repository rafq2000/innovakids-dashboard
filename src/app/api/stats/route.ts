import { NextResponse } from "next/server";

const N8N_HOST = "http://157.230.156.140:5678";
const N8N_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2ZiYWViNi02OGFiLTQxN2YtOTBmYi1jMjM1MjdiZTE4MzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY5NzE2NjE4fQ.YM5b3EgVw510LpsI7wksPIEAhqdcr6wLNKnneRXioGc";

export async function GET() {
  try {
    // Call the InnovaKids Stats API webhook (reads Sheets + Calendar + Executions)
    const statsRes = await fetch(`${N8N_HOST}/webhook/ik-stats`, {
      method: "GET",
      cache: "no-store",
    });

    if (!statsRes.ok) {
      throw new Error(`Stats webhook returned ${statsRes.status}`);
    }

    const stats = await statsRes.json();

    return NextResponse.json({
      totalLeads: stats.totalLeads ?? 0,
      hotLeads: stats.hotLeads ?? 0,
      customers: stats.customers ?? 0,
      scheduledMeetings: stats.reunionesHoy ?? 0,
      messagestoday: stats.messagestoday ?? 0,
      responseRate: stats.responseRate ?? 0,
    });
  } catch (error) {
    // Return last-known fallback so dashboard doesn't break
    return NextResponse.json(
      {
        totalLeads: 0,
        hotLeads: 0,
        customers: 0,
        scheduledMeetings: 0,
        messagestoday: 0,
        responseRate: 0,
        error: String(error),
      },
      { status: 200 } // 200 so frontend doesn't crash
    );
  }
}
