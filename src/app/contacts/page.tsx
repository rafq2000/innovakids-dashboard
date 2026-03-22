"use client";
import { useState, useEffect } from "react";

interface Contact {
    id: string;
    phone: string;
    name: string;
    country: string;
    temperature: "nuevo" | "tibio" | "caliente" | "cliente" | "bloqueado";
    lastMessage: string;
    lastInteraction: string;
    meetingScheduled: boolean;
    blocked: boolean;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated data - will connect to Google Sheets
        setTimeout(() => {
            setContacts([
                { id: "1", phone: "+56912345678", name: "María García", country: "Chile", temperature: "caliente", lastMessage: "¡Me interesa el curso!", lastInteraction: "Hace 5 min", meetingScheduled: true, blocked: false },
                { id: "2", phone: "+52155512345", name: "Carlos López", country: "México", temperature: "tibio", lastMessage: "Cuánto cuesta?", lastInteraction: "Hace 1 hora", meetingScheduled: false, blocked: false },
                { id: "3", phone: "+573001234567", name: "Ana Martínez", country: "Colombia", temperature: "cliente", lastMessage: "Gracias por todo!", lastInteraction: "Hace 2 días", meetingScheduled: false, blocked: false },
                { id: "4", phone: "+56998765432", name: "Pedro Sánchez", country: "Chile", temperature: "nuevo", lastMessage: "Hola, quiero info", lastInteraction: "Hace 10 min", meetingScheduled: false, blocked: false },
                { id: "5", phone: "+51987654321", name: "Laura Díaz", country: "Perú", temperature: "caliente", lastMessage: "Mi hijo tiene 10 años", lastInteraction: "Hace 30 min", meetingScheduled: true, blocked: false },
                { id: "6", phone: "+56911111111", name: "Spam User", country: "Chile", temperature: "bloqueado", lastMessage: "bitcoin crypto", lastInteraction: "Hace 3 días", meetingScheduled: false, blocked: true },
            ]);
            setLoading(false);
        }, 300);
    }, []);

    const getTempBadge = (temp: string) => {
        switch (temp) {
            case "caliente": return "badge badge-hot";
            case "tibio": return "badge badge-warm";
            case "nuevo": return "badge badge-new";
            case "cliente": return "badge badge-customer";
            case "bloqueado": return "badge badge-blocked";
            default: return "badge badge-cold";
        }
    };

    const getTempLabel = (temp: string) => {
        switch (temp) {
            case "caliente": return "🔥 Caliente";
            case "tibio": return "🌡️ Tibio";
            case "nuevo": return "🆕 Nuevo";
            case "cliente": return "⭐ Cliente";
            case "bloqueado": return "🚫 Bloqueado";
            default: return temp;
        }
    };

    const filteredContacts = contacts.filter((c) => {
        const matchesFilter = filter === "all" || c.temperature === filter;
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search);
        return matchesFilter && matchesSearch;
    });

    const toggleBlock = (id: string) => {
        setContacts(contacts.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    blocked: !c.blocked,
                    temperature: c.blocked ? "nuevo" : "bloqueado"
                };
            }
            return c;
        }));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Cargando...</div></div>;
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Contactos</h1>
                    <p className="text-gray-400">Gestiona tus leads y clientes</p>
                </div>
                <button className="btn btn-primary">➕ Nuevo Contacto</button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        className="search-input flex-1 min-w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="nuevo">Nuevos</option>
                        <option value="tibio">Tibios</option>
                        <option value="caliente">Calientes</option>
                        <option value="cliente">Clientes</option>
                        <option value="bloqueado">Bloqueados</option>
                    </select>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Contacto</th>
                            <th>País</th>
                            <th>Estado</th>
                            <th>Último Mensaje</th>
                            <th>Reunión</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id}>
                                <td>
                                    <div>
                                        <p className="font-medium">{contact.name}</p>
                                        <p className="text-sm text-gray-500">{contact.phone}</p>
                                    </div>
                                </td>
                                <td>{contact.country}</td>
                                <td>
                                    <span className={getTempBadge(contact.temperature)}>
                                        {getTempLabel(contact.temperature)}
                                    </span>
                                </td>
                                <td>
                                    <div>
                                        <p className="text-sm truncate max-w-48">{contact.lastMessage}</p>
                                        <p className="text-xs text-gray-500">{contact.lastInteraction}</p>
                                    </div>
                                </td>
                                <td>
                                    {contact.meetingScheduled ? (
                                        <span className="text-green-400">📅 Agendada</span>
                                    ) : (
                                        <span className="text-gray-500">-</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn btn-outline text-xs px-2 py-1">💬 Chat</button>
                                        <button
                                            className={`btn text-xs px-2 py-1 ${contact.blocked ? "btn-success" : "btn-danger"}`}
                                            onClick={() => toggleBlock(contact.id)}
                                        >
                                            {contact.blocked ? "✓ Desbloquear" : "🚫 Bloquear"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredContacts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron contactos
                    </div>
                )}
            </div>
        </div>
    );
}
