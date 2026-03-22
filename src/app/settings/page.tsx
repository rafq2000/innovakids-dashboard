"use client";
import { useState, useEffect, useCallback } from "react";

const WORKFLOW_IDS = {
  bot: "iRu4ihRve7jB1Mm8",
  reminder: "vh5VuB7AFL8s3ya1",
  postmeeting: "fRC6UjuPqGBpsjLY",
};

interface WorkflowStatus {
  bot: boolean;
  reminder: boolean;
  postmeeting: boolean;
}

export default function SettingsPage() {
  const [wfStatus, setWfStatus] = useState<WorkflowStatus>({ bot: false, reminder: false, postmeeting: false });
  const [wfLoading, setWfLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    businessHoursStart: "08:00",
    businessHoursEnd: "22:00",
    followUpsEnabled: false,
    maxFollowUps: 2,
    spamFilter: true,
  });

  const [blockedNumbers, setBlockedNumbers] = useState<string[]>([]);
  const [newBlockedNumber, setNewBlockedNumber] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/workflows", { cache: "no-store" });
      const data = await res.json();
      const wfs: WorkflowStatus = { bot: false, reminder: false, postmeeting: false };
      for (const wf of data.workflows || []) {
        if (wf.key === "bot") wfs.bot = wf.active;
        if (wf.key === "reminder") wfs.reminder = wf.active;
        if (wf.key === "postmeeting") wfs.postmeeting = wf.active;
      }
      setWfStatus(wfs);
    } catch {
      /* keep */
    } finally {
      setWfLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const toggleWorkflow = async (key: keyof WorkflowStatus) => {
    const id = WORKFLOW_IDS[key];
    const isActive = wfStatus[key];
    setToggling(key);
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isActive ? "deactivate" : "activate", workflowId: id }),
      });
      setWfStatus((prev) => ({ ...prev, [key]: !isActive }));
    } finally {
      setToggling(null);
    }
  };

  const addBlockedNumber = () => {
    if (newBlockedNumber && !blockedNumbers.includes(newBlockedNumber)) {
      setBlockedNumbers([...blockedNumbers, newBlockedNumber]);
      setNewBlockedNumber("");
    }
  };

  const removeBlockedNumber = (number: string) => {
    setBlockedNumbers(blockedNumbers.filter((n) => n !== number));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({
    enabled,
    onToggle,
    loading,
  }: {
    enabled: boolean;
    onToggle: () => void;
    loading?: boolean;
  }) => (
    <button
      className={`toggle ${enabled ? "active" : ""} ${loading ? "opacity-50 cursor-wait" : ""}`}
      onClick={onToggle}
      disabled={loading}
    >
      <span className="toggle-dot" />
    </button>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-400">Controla y ajusta toda la automatización</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bot Principal */}
        <div className="card">
          <h3 className="card-header">🤖 Bot Principal — Mia</h3>
          <div className="space-y-5">

            <div className="flex items-center justify-between p-4 bg-gray-700/40 rounded-xl">
              <div>
                <p className="font-medium">Bot Activo</p>
                <p className="text-sm text-gray-500">
                  {wfLoading ? "Verificando..." : wfStatus.bot ? "Respondiendo mensajes en WhatsApp" : "Bot detenido — no responde"}
                </p>
              </div>
              {wfLoading ? (
                <div className="text-gray-600 animate-pulse">●●●</div>
              ) : (
                <Toggle
                  enabled={wfStatus.bot}
                  onToggle={() => toggleWorkflow("bot")}
                  loading={toggling === "bot"}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Filtro de Spam</p>
                <p className="text-sm text-gray-500">Bloquea mensajes con palabras sospechosas</p>
              </div>
              <Toggle
                enabled={settings.spamFilter}
                onToggle={() => setSettings({ ...settings, spamFilter: !settings.spamFilter })}
              />
            </div>

            <div>
              <p className="font-medium mb-3">Horario de Atención</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Inicio</label>
                  <input
                    type="time"
                    value={settings.businessHoursStart}
                    onChange={(e) => setSettings({ ...settings, businessHoursStart: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Fin</label>
                  <input
                    type="time"
                    value={settings.businessHoursEnd}
                    onChange={(e) => setSettings({ ...settings, businessHoursEnd: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recordatorio 1h */}
        <div className="card">
          <h3 className="card-header">⏰ Recordatorio 1h Antes</h3>
          <div className="space-y-5">

            <div className="flex items-center justify-between p-4 bg-gray-700/40 rounded-xl">
              <div>
                <p className="font-medium">Recordatorios Activos</p>
                <p className="text-sm text-gray-500">
                  {wfLoading ? "Verificando..." : wfStatus.reminder ? "Enviando WhatsApp 1h antes de cada sesión" : "Recordatorios detenidos"}
                </p>
              </div>
              {wfLoading ? (
                <div className="text-gray-600 animate-pulse">●●●</div>
              ) : (
                <Toggle
                  enabled={wfStatus.reminder}
                  onToggle={() => toggleWorkflow("reminder")}
                  loading={toggling === "reminder"}
                />
              )}
            </div>

            <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-700/50 space-y-2 text-sm">
              <p className="text-gray-400 font-medium mb-2">Cómo funciona</p>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Revisa el calendario cada 5 minutos</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Detecta sesiones con &quot;InnovaKids&quot; en el título</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Envía WhatsApp con el link de Google Meet</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>No reenvía si ya fue enviado (sin duplicados)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post-Reunión */}
        <div className="card">
          <h3 className="card-header">🌟 Post-Reunión: Reservar Cupo</h3>
          <div className="space-y-5">

            <div className="flex items-center justify-between p-4 bg-gray-700/40 rounded-xl">
              <div>
                <p className="font-medium">Mensaje Post-Reunión</p>
                <p className="text-sm text-gray-500">
                  {wfLoading ? "Verificando..." : wfStatus.postmeeting ? "Enviando WhatsApp al terminar cada sesión" : "Mensajes post-reunión detenidos"}
                </p>
              </div>
              {wfLoading ? (
                <div className="text-gray-600 animate-pulse">●●●</div>
              ) : (
                <Toggle
                  enabled={wfStatus.postmeeting}
                  onToggle={() => toggleWorkflow("postmeeting")}
                  loading={toggling === "postmeeting"}
                />
              )}
            </div>

            <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-700/50 space-y-2 text-sm">
              <p className="text-gray-400 font-medium mb-2">Mensaje que se envía</p>
              <div className="p-3 bg-gray-800/60 rounded-lg text-xs text-gray-300 leading-relaxed border border-gray-600/40">
                🌟 <strong>¡Gracias por asistir a InnovaKids!</strong><br/><br/>
                ¡Hola [nombre]! 🙌<br/><br/>
                Fue un gusto compartir la sesión diagnóstica gratuita junto a <em>[hijo/a]</em> hoy...<br/><br/>
                Si deseas <strong>asegurar su cupo</strong> para el próximo curso de IA:<br/>
                👉 innovakidslatam.com/pagar?option=promo27<br/><br/>
                ⚡ Los cupos son <strong>limitados</strong>
              </div>
              <div className="flex items-start gap-2 text-gray-400 mt-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Se envía 3-40 min después de que termina la sesión</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Solo una vez por evento (sin duplicados)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Routing por Clientes */}
        <div className="card">
          <h3 className="card-header">🧠 Routing por Cliente</h3>
          <div className="space-y-4">

            <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
              <p className="text-blue-300 font-medium text-sm mb-1">¿Cómo activar para un cliente?</p>
              <p className="text-gray-400 text-sm">
                En la hoja <span className="font-semibold text-white">Leads</span> de Google Sheets, agrega la columna{" "}
                <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-yellow-300">Comprado</span>{" "}
                y escribe <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-green-300">SI</span>{" "}
                en la fila del cliente.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/30">
                <span className="text-green-400 text-lg">→</span>
                <div>
                  <p className="text-sm font-medium">Comprado = SI</p>
                  <p className="text-xs text-gray-400">AI Soporte responde, escucha el problema y transfiere a equipo humano</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/30">
                <span className="text-blue-400 text-lg">→</span>
                <div>
                  <p className="text-sm font-medium">Sin compra</p>
                  <p className="text-xs text-gray-400">AI Mia (Francisca) califica el lead y agenda sesión diagnóstica</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-ups */}
        <div className="card">
          <h3 className="card-header">📨 Follow-ups</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Follow-ups Automáticos</p>
                <p className="text-sm text-gray-500">Contactar leads que no responden</p>
              </div>
              <Toggle
                enabled={settings.followUpsEnabled}
                onToggle={() => setSettings({ ...settings, followUpsEnabled: !settings.followUpsEnabled })}
              />
            </div>

            <div>
              <p className="font-medium mb-2">Máximo de Follow-ups</p>
              <select
                value={settings.maxFollowUps}
                onChange={(e) => setSettings({ ...settings, maxFollowUps: parseInt(e.target.value) })}
                className="search-input"
                disabled={!settings.followUpsEnabled}
              >
                <option value={1}>1 mensaje</option>
                <option value={2}>2 mensajes</option>
                <option value={3}>3 mensajes</option>
              </select>
            </div>

            {!settings.followUpsEnabled && (
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Solo responde cuando te escriban directamente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Blocked Numbers */}
        <div className="card lg:col-span-2">
          <h3 className="card-header">🚫 Números Bloqueados</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="+56912345678"
                  value={newBlockedNumber}
                  onChange={(e) => setNewBlockedNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBlockedNumber()}
                  className="search-input flex-1"
                />
                <button onClick={addBlockedNumber} className="btn btn-danger">
                  Bloquear
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {blockedNumbers.map((number) => (
                  <div key={number} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="font-mono text-sm">{number}</span>
                    <button onClick={() => removeBlockedNumber(number)} className="text-red-400 hover:text-red-300 text-sm">
                      ✕
                    </button>
                  </div>
                ))}
                {blockedNumbers.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6">No hay números bloqueados</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-700/50 text-sm text-gray-400 space-y-2">
              <p className="text-gray-300 font-medium">¿Cómo funciona el bloqueo?</p>
              <p>Los números bloqueados son ignorados por el bot. Útil para:</p>
              <ul className="space-y-1 ml-3">
                <li>• Números de prueba propios</li>
                <li>• Spam recurrente</li>
                <li>• Conversaciones que llevas manualmente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className={`btn px-8 transition-all ${saved ? "btn-success" : "btn-primary"}`}
        >
          {saved ? "✓ Guardado" : "💾 Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
