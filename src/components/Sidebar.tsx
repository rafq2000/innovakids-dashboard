"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/contacts", label: "Contactos", icon: "👥" },
  { href: "/conversations", label: "Conversaciones", icon: "💬" },
  { href: "/meetings", label: "Reuniones", icon: "📅" },
  { href: "/settings", label: "Configuración", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [botActive, setBotActive] = useState<boolean | null>(null);
  const [reminderActive, setReminderActive] = useState<boolean | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/workflows", { cache: "no-store" });
      const data = await res.json();
      for (const wf of data.workflows || []) {
        if (wf.key === "bot") setBotActive(wf.active);
        if (wf.key === "reminder") setReminderActive(wf.active);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const allActive = botActive && reminderActive;
  const noneActive = botActive === false && reminderActive === false;

  return (
    <aside className="sidebar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">InnovaKids</h1>
        <p className="text-gray-500 text-sm">Panel de Control</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="my-3 border-t border-gray-700/50" />

        <Link
          href="/sin-respuesta"
          className={`sidebar-link border border-yellow-500/20 hover:border-yellow-500/40 ${
            pathname === "/sin-respuesta" ? "active" : ""
          }`}
        >
          <span className="text-xl">🔕</span>
          <span>Sin Respuesta</span>
        </Link>
      </nav>

      {/* Status panel */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        {/* Kill switch warning */}
        {noneActive && (
          <div className="px-3 py-2 bg-red-900/40 border border-red-700/50 rounded-lg text-center">
            <p className="text-red-400 text-xs font-medium">⏹ Automatización detenida</p>
          </div>
        )}

        {/* Bot card */}
        <div className="card !p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Bot Mia</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Principal</span>
              {botActive === null ? (
                <span className="text-gray-600 animate-pulse">●●●</span>
              ) : (
                <span className={botActive ? "text-green-400 flex items-center gap-1" : "text-gray-500"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${botActive ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
                  {botActive ? "Activo" : "Inactivo"}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Recordatorio</span>
              {reminderActive === null ? (
                <span className="text-gray-600 animate-pulse">●●●</span>
              ) : (
                <span className={reminderActive ? "text-green-400 flex items-center gap-1" : "text-gray-500"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${reminderActive ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
                  {reminderActive ? "Activo" : "Inactivo"}
                </span>
              )}
            </div>
          </div>

          {allActive && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 text-center">
              <span className="text-xs text-green-400">✓ Todo funcionando</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
