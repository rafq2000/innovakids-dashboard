import { NextResponse } from "next/server";

const N8N_HOST = "http://157.230.156.140:5678";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet") || "Leads";

    const webhookPath = sheet === "LeadScoring" ? "ik-scoring" : "ik-leads";

    try {
        const res = await fetch(`${N8N_HOST}/webhook/${webhookPath}`, {
            cache: "no-store",
        });

        if (!res.ok) throw new Error(`n8n returned ${res.status}`);

        const raw = await res.json();
        // n8n allIncomingItems returns [{json: {...row}}, ...] or [{...row}, ...]
        const items: Record<string, unknown>[] = Array.isArray(raw) ? raw : [];
        const data = items.map((item) =>
            (item.json as Record<string, unknown>) ?? item
        );

        return NextResponse.json({ data });
    } catch (error) {
        console.error(`Sheets fetch error (${sheet}):`, error);
        return NextResponse.json({ error: "Failed to fetch sheet data", data: [] }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { action, data } = await request.json();

        if (action === "block" || action === "unblock" || action === "update") {
            console.log(`Action ${action}:`, data);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (_error) {
        return NextResponse.json({ error: "Failed to execute action" }, { status: 500 });
    }
}
