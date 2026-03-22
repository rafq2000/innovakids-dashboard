import { NextResponse } from "next/server";

const N8N_HOST = "http://157.230.156.140:5678";
const N8N_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2ZiYWViNi02OGFiLTQxN2YtOTBmYi1jMjM1MjdiZTE4MzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY5NzE2NjE4fQ.YM5b3EgVw510LpsI7wksPIEAhqdcr6wLNKnneRXioGc";

const WORKFLOWS = {
  bot: "iRu4ihRve7jB1Mm8",
  reminder: "vh5VuB7AFL8s3ya1",
  postmeeting: "fRC6UjuPqGBpsjLY",
};

async function n8n(method: string, path: string) {
  const res = await fetch(`${N8N_HOST}/api/v1${path}`, {
    method,
    headers: { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" },
    body: method !== "GET" ? "{}" : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`n8n ${method} ${path} → ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const [bot, reminder, postmeeting] = await Promise.all([
      n8n("GET", `/workflows/${WORKFLOWS.bot}`),
      n8n("GET", `/workflows/${WORKFLOWS.reminder}`),
      n8n("GET", `/workflows/${WORKFLOWS.postmeeting}`),
    ]);

    return NextResponse.json({
      workflows: [
        {
          id: WORKFLOWS.bot,
          key: "bot",
          name: "Bot Principal — Mia",
          description: "Recibe mensajes WhatsApp, califica leads y agenda sesiones",
          active: bot.active,
          features: ["AI Mia (ventas)", "AI Soporte (clientes)", "Routing por compra"],
        },
        {
          id: WORKFLOWS.reminder,
          key: "reminder",
          name: "Recordatorio 1h Antes",
          description: "Envía WhatsApp con link Google Meet, 1 hora antes de la sesión",
          active: reminder.active,
          features: ["Corre cada 5 min", "Detecta sesiones en Google Calendar", "Evita duplicados"],
        },
        {
          id: WORKFLOWS.postmeeting,
          key: "postmeeting",
          name: "Post-Reunión: Reservar Cupo",
          description: "Envía WhatsApp de agradecimiento + link de reserva al terminar la sesión",
          active: postmeeting.active,
          features: ["Detecta sesiones terminadas", "Mensaje + link de pago", "Sin duplicados"],
        },
      ],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, workflowId } = await request.json();

    if (action === "activate" && workflowId) {
      await n8n("POST", `/workflows/${workflowId}/activate`);
      return NextResponse.json({ success: true });
    }

    if (action === "deactivate" && workflowId) {
      await n8n("POST", `/workflows/${workflowId}/deactivate`);
      return NextResponse.json({ success: true });
    }

    if (action === "deactivate-all") {
      await Promise.all(
        Object.values(WORKFLOWS).map((id) =>
          n8n("POST", `/workflows/${id}/deactivate`).catch(() => null)
        )
      );
      return NextResponse.json({ success: true });
    }

    if (action === "activate-all") {
      await Promise.all(
        Object.values(WORKFLOWS).map((id) =>
          n8n("POST", `/workflows/${id}/activate`).catch(() => null)
        )
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
