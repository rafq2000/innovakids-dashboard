"use client";
import { useState, useEffect } from "react";

interface LeadRow {
    row_number: number;
    Fecha: string;
    Telefono: string;
    Nombre: string;
    Email: string;
    Pais: string;
    LinkCalendly: string;
    AgendoDemo: string;
    FechaDemo: string;
}

export default function SinRespuestaPage() {
    const [leads, setLeads] = useState<LeadRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPais, setFilterPais] = useState("all");

    useEffect(() => {
        fetch("/api/sheets?sheet=Leads")
            .then((r) => r.json())
            .then(({ data }: { data: LeadRow[] }) => {
                // Sin Respuesta = tiene teléfono pero no tiene nombre (nunca interactuó con el bot)
                const sinResp = (data || []).filter((r) => {
                    const tel = String(r.Telefono || "").trim();
                    const nombre = String(r.Nombre || "").trim();
                    return tel && !tel.includes("{{") && (!nombre || nombre.includes("{{"));
                });
                setLeads(sinResp);
            })
            .finally(() => setLoading(false));
    }, []);

    const paises = Array.from(new Set(
        leads.map((l) => String(l.Pais || "").trim()).filter((p) => p && !p.includes("{{"))
    )).sort();

    const filtered = leads.filter((l) => {
        const matchSearch = !search ||
            String(l.Telefono || "").includes(search) ||
            String(l.Email || "").toLowerCase().includes(search.toLowerCase());
        const matchPais = filterPais === "all" || String(l.Pais || "").trim() === filterPais;
        return matchSearch && matchPais;
    });

    const copyPhone = (phone: string) => {
        navigator.clipboard.writeText(phone).catch(() => {});
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-gray-400">Cargando...</div>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🔕</span>
                    <h1 className="text-3xl font-bold">Sin Respuesta</h1>
                </div>
                <p className="text-gray-400">
                    Números registrados que <strong className="text-yellow-400">no han respondido al bot</strong>.
                    Estos contactos tienen teléfono en el sistema pero nunca interactuaron con Mia.
                </p>
            </div>

            {/* Alert banner */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                <span className="text-yellow-400 text-xl mt-0.5">⚠️</span>
                <div>
                    <p className="text-yellow-300 font-medium">{leads.length} contactos sin respuesta</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Puedes copiar el número y enviar un mensaje manual por WhatsApp para retomar el contacto.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Buscar por teléfono o email..."
                        className="search-input flex-1 min-w-56"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                        value={filterPais}
                        onChange={(e) => setFilterPais(e.target.value)}
                    >
                        <option value="all">Todos los países</option>
                        {paises.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <span className="text-gray-500 text-sm">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-xl font-medium text-green-400">¡Sin pendientes!</p>
                    <p className="text-gray-500 mt-2">Todos los contactos registrados han respondido al bot.</p>
                </div>
            ) : (
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Teléfono</th>
                                <th>País</th>
                                <th>Email</th>
                                <th>Fecha Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((lead, i) => {
                                const tel = String(lead.Telefono || "").trim();
                                const email = String(lead.Email || "").trim();
                                const pais = String(lead.Pais || "").trim();
                                const fecha = String(lead.Fecha || "").trim();
                                const waLink = `https://wa.me/${tel.replace(/[^0-9]/g, "")}`;
                                return (
                                    <tr key={i}>
                                        <td className="text-gray-500 text-sm">{lead.row_number || i + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm">{tel || "—"}</span>
                                                {tel && (
                                                    <button
                                                        onClick={() => copyPhone(tel)}
                                                        className="text-gray-500 hover:text-gray-300 text-xs"
                                                        title="Copiar"
                                                    >
                                                        📋
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {pais && !pais.includes("{{") ? (
                                                <span className="text-sm">{pais}</span>
                                            ) : (
                                                <span className="text-gray-600 text-sm">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {email && !email.includes("{{") ? (
                                                <span className="text-sm text-blue-400">{email}</span>
                                            ) : (
                                                <span className="text-gray-600 text-sm">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-sm text-gray-400">
                                                {fecha && !fecha.includes("{{") ? fecha : "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {tel && (
                                                    <a
                                                        href={waLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-success text-xs px-2 py-1"
                                                    >
                                                        💬 WhatsApp
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
