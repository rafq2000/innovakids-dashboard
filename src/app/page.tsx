"use client";
import { useState, useEffect, useCallback } from "react";

interface WorkflowStatus {
  id: string;
  key: string;
  name: string;
  description: string;
  active: boolean;
  features: string[];
}

interface Stats {
  totalLeads: number;
  hotLeads: number;
  scheduledMeetings: number;
  customers: number;
  messagestoday: number;
  responseRate: number;
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [wfLoading, setWfLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [killConfirm, setKillConfirm] = useState(false);
  const [killingAll, setKillingAll] = useState(false);
  const [expandedWf, setExpandedWf] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    hotLeads: 0,
    scheduledMeetings: 0,
    customers: 0,
    messagestoday: 0,
    responseRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data = await res.json();
      if (!data.error) {
        setStats(data);
        setStatsError(false);
      } else {
        setStatsError(true);
      }
    } catch {
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch("/api/workflows", { cache: "no-store" });
      const data = await res.json();
      setWorkflows(data.workflows || []);
    } catch {
      // keep previous state
    } finally {
      setWfLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
    fetchStats();
    const wfInterval = setInterval(fetchWorkflows, 30000);
    const statsInterval = setInterval(fetchStats, 60000);
    return () => {
      clearInterval(wfInterval);
      clearInterval(statsInterval);
    };
  }, [fetchWorkflows, fetchStats]);

  const toggleWorkflow = async (wf: WorkflowStatus) => {
    setToggling(wf.id);
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: wf.active ? "deactivate" : "activate",
          workflowId: wf.id,
        }),
      });
      await fetchWorkflows();
    } finally {
      setToggling(null);
    }
  };

  const killAll = async () => {
    setKillingAll(true);
    setKillConfirm(false);
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate-all" }),
      });
      await fetchWorkflows();
    } finally {
      setKillingAll(false);
    }
  };

  const activateAll = async () => {
    setToggling("all");
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate-all" }),
      });
      await fetchWorkflows();
    } finally {
      setToggling(null);
    }
  };

  const allActive = workflows.length > 0 && workflows.every((w) => w.active);
  const anyActive = workflows.some((w) => w.active);

  const statCards = [
    {
      label: "Total Leads",
      value: statsLoading ? "..." : stats.totalLeads,
      icon: "👥",
      color: "from-blue-900/50 to-blue-800/30 border-blue-700/50",
    },
    {
      label: "Leads Calientes",
      value: statsLoading ? "..." : stats.hotLeads,
      icon: "🔥",
      color: "from-red-900/50 to-red-800/30 border-red-700/50",
    },
    {
      label: "Reuniones Hoy",
      value: statsLoading ? "..." : stats.scheduledMeetings,
      icon: "📅",
      color: "from-purple-900/50 to-purple-800/30 border-purple-700/50",
    },
    {
      label: "Clientes Activos",
      value: statsLoading ? "..." : stats.customers,
      icon: "⭐",
      color: "from-green-900/50 to-green-800/30 border-green-700/50",
    },
    {
      label: "Mensajes Hoy",
      value: statsLoading ? "..." : stats.messagestoday,
      icon: "💬",
      color: "from-cyan-900/50 to-cyan-800/30 border-cyan-700/50",
    },
    {
      label: "Tasa Clientes",
      value: statsLoading ? "..." : `${stats.responseRate}%`,
      icon: "📈",
      color: "from-yellow-900/50 to-yellow-800/30 border-yellow-700/50",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Panel de control InnovaKids</p>
        </div>

        <div className="flex items-center gap-3">
          {!allActive && (
            <button
              onClick={activateAll}
              disabled={toggling === "all"}
              className="btn btn-success flex items-center gap-2"
            >
              {toggling === "all" ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <span>▶</span>
              )}
              Activar Todo
            </button>
          )}

          <button
            onClick={() => setKillConfirm(true)}
            disabled={killingAll || !anyActive}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-red-900/40"
          >
            {killingAll ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <span>⏹</span>
            )}
            Apagar Todo
          </button>
        </div>
      </div>

      {/* Kill Confirm Modal */}
      {killConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-500/50 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-4xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold text-center mb-2">¿Apagar toda la automatización?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Esto detendrá el Bot Mia y los recordatorios automáticos. Los mensajes entrantes no recibirán respuesta.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setKillConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={killAll}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
              >
                Sí, apagar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${statsLoading ? "animate-pulse text-gray-500" : ""}`}>
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
              <div className="text-3xl opacity-60">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats error banner */}
      {statsError && !statsLoading && (
        <div className="mb-4 px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm flex items-center justify-between">
          <span>⚠️ No se pudo cargar datos en tiempo real</span>
          <button onClick={fetchStats} className="text-yellow-300 hover:text-yellow-100 ml-4">
            ↻ Reintentar
          </button>
        </div>
      )}

      {/* Automation Control */}
      <div className="card mb-6">
        <div className="card-header">
          <span>⚡ Control de Automatización</span>
          <button
            onClick={fetchWorkflows}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ↻ Actualizar
          </button>
        </div>

        {wfLoading ? (
          <div className="text-gray-500 text-sm py-4 text-center animate-pulse">Conectando con n8n...</div>
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <div key={wf.id}>
                <div
                  className={`rounded-xl p-4 border transition-all ${
                    wf.active
                      ? "bg-green-900/20 border-green-700/40"
                      : "bg-gray-700/30 border-gray-700/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          wf.active ? "bg-green-400 shadow-green-400/50 shadow-md animate-pulse" : "bg-gray-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{wf.name}</p>
                        <p className="text-xs text-gray-400 truncate">{wf.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          wf.active
                            ? "bg-green-600/30 text-green-400"
                            : "bg-gray-700 text-gray-500"
                        }`}
                      >
                        {wf.active ? "Activo" : "Inactivo"}
                      </span>

                      <button
                        onClick={() => setExpandedWf(expandedWf === wf.id ? null : wf.id)}
                        className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 hover:border-gray-500 transition-all"
                      >
                        {expandedWf === wf.id ? "▲ Menos" : "▼ Detalle"}
                      </button>

                      <button
                        onClick={() => toggleWorkflow(wf)}
                        disabled={toggling === wf.id}
                        className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50 ${
                          wf.active
                            ? "bg-red-600/80 hover:bg-red-600 text-white"
                            : "bg-green-600/80 hover:bg-green-600 text-white"
                        }`}
                      >
                        {toggling === wf.id ? "..." : wf.active ? "Pausar" : "Activar"}
                      </button>
                    </div>
                  </div>

                  {/* Expandable detail */}
                  {expandedWf === wf.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Funciones incluidas</p>
                      <div className="flex flex-wrap gap-2">
                        {wf.features.map((f, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full bg-gray-700/60 text-gray-300 border border-gray-600/50"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>ID: <span className="font-mono text-gray-400">{wf.id}</span></div>
                        <div>Estado: <span className={wf.active ? "text-green-400" : "text-gray-400"}>{wf.active ? "corriendo" : "detenido"}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Feature badges */}
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700/30 flex items-center gap-1">
                🧠 Routing por compra activo
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-purple-900/30 text-purple-400 border border-purple-700/30 flex items-center gap-1">
                ⏰ Recordatorio 1h configurado
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-green-900/30 text-green-400 border border-green-700/30 flex items-center gap-1">
                📅 Calendario limpio
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats live indicator */}
        <div className="card">
          <div className="card-header">
            <span>📊 Datos en Tiempo Real</span>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              {statsLoading ? <span className="animate-spin inline-block">⟳</span> : "↻ Actualizar"}
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Leads totales</p>
                <p className="text-2xl font-bold text-blue-400">{statsLoading ? "..." : stats.totalLeads}</p>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Leads calientes</p>
                <p className="text-2xl font-bold text-red-400">{statsLoading ? "..." : stats.hotLeads}</p>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Clientes (Comprado=SI)</p>
                <p className="text-2xl font-bold text-green-400">{statsLoading ? "..." : stats.customers}</p>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Mensajes hoy</p>
                <p className="text-2xl font-bold text-cyan-400">{statsLoading ? "..." : stats.messagestoday}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-700/30 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Reuniones hoy en calendario</p>
                <p className="text-xl font-bold text-purple-400">{statsLoading ? "..." : stats.scheduledMeetings}</p>
              </div>
              <div className="text-2xl">📅</div>
            </div>
            <p className="text-xs text-gray-600 text-center">Actualiza cada 60s · Fuente: Google Sheets + Google Calendar + n8n</p>
          </div>
        </div>

        {/* Quick Actions + Feature Summary */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <span>Acciones Rápidas</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href="/contacts" className="btn btn-primary flex items-center justify-center gap-2 py-3">
                <span>👥</span> Ver Contactos
              </a>
              <a href="/meetings" className="btn btn-success flex items-center justify-center gap-2 py-3">
                <span>📅</span> Ver Reuniones
              </a>
              <a href="/conversations" className="btn btn-outline flex items-center justify-center gap-2 py-3">
                <span>💬</span> Conversaciones
              </a>
              <a href="/settings" className="btn btn-outline flex items-center justify-center gap-2 py-3">
                <span>⚙️</span> Configuración
              </a>
            </div>
          </div>

          {/* Feature cards */}
          <div className="card !p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Funciones Activas</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="text-sm font-medium text-blue-300">Routing por Cliente</p>
                  <p className="text-xs text-gray-400">
                    Si <span className="font-mono bg-gray-700 px-1 rounded">Comprado=SI</span> → AI Soporte. Si no → AI Mia (ventas).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                <span className="text-lg">⏰</span>
                <div>
                  <p className="text-sm font-medium text-purple-300">Recordatorio 1 Hora Antes</p>
                  <p className="text-xs text-gray-400">
                    WhatsApp automático con el link de Google Meet, 1 hora antes de cada sesión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
