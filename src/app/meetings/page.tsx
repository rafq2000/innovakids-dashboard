"use client";
import { useState, useEffect, useCallback } from "react";

interface Meeting {
  id: string;
  title: string;
  nombre: string;
  phone: string;
  date: string;
  time: string;
  startIso: string;
  endIso: string;
  meetLink: string;
  status: string;
  reminderSent: boolean;
  postMeetingSent: boolean;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch("/api/meetings", { cache: "no-store" });
      const data = await res.json();
      setMeetings(data.meetings || []);
      setTotal(data.total || 0);
      if (data.error) setError(data.error);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const filtered = meetings.filter((m) => filter === "all" || m.status === filter);

  const todayStr = new Date().toLocaleDateString("es-CL", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const tomorrowStr = new Date(Date.now() + 86400000).toLocaleDateString("es-CL", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  });

  const todays   = filtered.filter((m) => m.date === todayStr && m.status === "upcoming");
  const tomorrows = filtered.filter((m) => m.date === tomorrowStr && m.status === "upcoming");
  const upcoming  = filtered.filter((m) => m.status === "upcoming" && m.date !== todayStr && m.date !== tomorrowStr);
  const past      = filtered.filter((m) => m.status === "completed").slice(0, 20);

  const upcomingTotal = meetings.filter((m) => m.status === "upcoming").length;
  const pastTotal     = meetings.filter((m) => m.status === "completed").length;

  const MeetingCard = ({ m }: { m: Meeting }) => (
    <div className={`rounded-xl p-4 border transition-all ${
      m.status === "upcoming"
        ? "bg-gray-700/40 border-gray-700/50 hover:bg-gray-700/60"
        : "bg-gray-800/30 border-gray-700/30 opacity-70"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{m.nombre || m.title}</p>
          {m.phone && <p className="text-xs text-green-400 font-mono mt-0.5">{m.phone}</p>}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0 border ${
          m.status === "upcoming"
            ? "bg-blue-600/30 text-blue-300 border-blue-700/40"
            : "bg-gray-600/30 text-gray-400 border-gray-600/40"
        }`}>
          {m.status === "upcoming" ? "📅 Próxima" : "✅ Realizada"}
        </span>
      </div>

      <div className="flex gap-4 text-sm text-gray-400 mb-3">
        <span>🗓 {m.date}</span>
        <span>🕐 {m.time}</span>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded border ${
          m.reminderSent ? "border-green-700/40 bg-green-900/20 text-green-400" : "border-gray-700/40 text-gray-600"
        }`}>
          ⏰ Recordatorio {m.reminderSent ? "✓" : "○"}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded border ${
          m.postMeetingSent ? "border-purple-700/40 bg-purple-900/20 text-purple-400" : "border-gray-700/40 text-gray-600"
        }`}>
          🌟 Post-reunión {m.postMeetingSent ? "✓" : "○"}
        </span>
      </div>

      <div className="flex gap-2">
        {m.meetLink ? (
          <a href={m.meetLink} target="_blank" rel="noreferrer"
            className="btn btn-primary text-xs flex-1 text-center">
            📹 Abrir Google Meet
          </a>
        ) : (
          <span className="text-xs text-gray-600 py-1">Sin link de Meet</span>
        )}
        {m.phone && (
          <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
            className="btn btn-outline text-xs px-3" title="WhatsApp">
            💬
          </a>
        )}
      </div>
    </div>
  );

  const Section = ({ title, dot, items }: { title: string; dot: string; items: Meeting[] }) =>
    items.length > 0 ? (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
          {title} <span className="text-gray-500 font-normal text-sm">({items.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => <MeetingCard key={m.id} m={m} />)}
        </div>
      </div>
    ) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 animate-pulse">Cargando desde Google Calendar...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reuniones</h1>
          <p className="text-gray-400">{total} sesiones InnovaKids · Google Calendar</p>
        </div>
        <button onClick={fetchMeetings} className="btn btn-outline text-sm">↻ Actualizar</button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: `Todas (${total})` },
          { key: "upcoming", label: `Próximas (${upcomingTotal})` },
          { key: "completed", label: `Realizadas (${pastTotal})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`btn text-sm ${filter === t.key ? "btn-primary" : "btn-outline"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No hay reuniones para mostrar</div>
      ) : (
        <>
          <Section title="Hoy" dot="bg-green-400 animate-pulse" items={todays} />
          <Section title="Mañana" dot="bg-yellow-400" items={tomorrows} />
          <Section title="Próximas" dot="bg-blue-400" items={upcoming} />
          <Section title="Realizadas" dot="bg-gray-500" items={past} />
        </>
      )}
    </div>
  );
}
