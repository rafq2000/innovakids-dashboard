"use client";
import { useState, useEffect, useCallback } from "react";

interface Lead {
  rowNumber: number;
  nombre: string;
  telefono: string;
  email: string;
  pais: string;
  fecha: string;
  agendoDemo: string;
  fechaDemo: string;
  linkCalendly: string;
}

interface LeadsData {
  leads: Lead[];
  total: number;
  conDemo: number;
  pendientes: number;
  conTelefono: number;
  error?: string;
}

export default function ContactsPage() {
  const [data, setData] = useState<LeadsData>({ leads: [], total: 0, conDemo: 0, pendientes: 0, conTelefono: 0 });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch {
      // keep state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const iv = setInterval(fetchLeads, 60000);
    return () => clearInterval(iv);
  }, [fetchLeads]);

  const filtered = data.leads.filter((l) => {
    const matchFilter =
      filter === "all" ||
      (filter === "demo" && l.agendoDemo === "SI") ||
      (filter === "pendiente" && l.agendoDemo !== "SI") ||
      (filter === "conTel" && !!l.telefono);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.nombre.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.telefono.includes(q);
    return matchFilter && matchSearch;
  });

  const tabs = [
    { key: "all", label: `Todos (${data.total})` },
    { key: "demo", label: `Demo (${data.conDemo})` },
    { key: "pendiente", label: `Pendientes (${data.pendientes})` },
    { key: "conTel", label: `Con teléfono (${data.conTelefono})` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 animate-pulse">Cargando leads desde Google Sheets...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contactos</h1>
          <p className="text-gray-400">Leads registrados desde Calendly · {data.total} únicos</p>
        </div>
        <button onClick={fetchLeads} className="btn btn-outline text-sm">
          ↻ Actualizar
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total leads", value: data.total, color: "border-blue-700/50 bg-blue-900/20", text: "text-blue-400" },
          { label: "Demo agendada", value: data.conDemo, color: "border-green-700/50 bg-green-900/20", text: "text-green-400" },
          { label: "Pendientes", value: data.pendientes, color: "border-yellow-700/50 bg-yellow-900/20", text: "text-yellow-400" },
          { label: "Con teléfono", value: data.conTelefono, color: "border-purple-700/50 bg-purple-900/20", text: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nombre, email o teléfono..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input w-full mb-4"
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`btn text-sm ${filter === t.key ? "btn-primary" : "btn-outline"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lead list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          No hay contactos que coincidan
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <div key={lead.rowNumber} className="card !p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
                  {(lead.nombre.charAt(0) || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lead.nombre || "(sin nombre)"}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {lead.email && <span className="text-xs text-gray-400 truncate">{lead.email}</span>}
                    {lead.telefono && <span className="text-xs text-green-400 font-mono">{lead.telefono}</span>}
                    {lead.pais && <span className="text-xs text-gray-500">{lead.pais}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">{lead.fecha}</p>
                  {lead.fechaDemo && <p className="text-xs text-purple-400">Demo: {lead.fechaDemo}</p>}
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  lead.agendoDemo === "SI"
                    ? "bg-green-600/30 text-green-400 border border-green-700/40"
                    : "bg-yellow-600/20 text-yellow-400 border border-yellow-700/30"
                }`}>
                  {lead.agendoDemo === "SI" ? "✓ Demo" : "⏳ Pendiente"}
                </span>

                {lead.telefono && (
                  <a
                    href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-400 hover:text-green-300 text-xl"
                    title="Abrir WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
