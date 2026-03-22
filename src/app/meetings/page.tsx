"use client";
import { useState, useEffect } from "react";

interface Meeting {
    id: string;
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    zoomLink: string;
    status: "pending" | "confirmed" | "completed" | "noshow";
    reminder24h: boolean;
    reminder2h: boolean;
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setMeetings([
                { id: "1", name: "María García", phone: "+56912345678", email: "maria@email.com", date: "2026-01-27", time: "10:00", zoomLink: "https://zoom.us/j/123", status: "confirmed", reminder24h: true, reminder2h: false },
                { id: "2", name: "Carlos López", phone: "+52155512345", email: "carlos@email.com", date: "2026-01-27", time: "14:30", zoomLink: "https://zoom.us/j/456", status: "pending", reminder24h: false, reminder2h: false },
                { id: "3", name: "Laura Díaz", phone: "+51987654321", email: "laura@email.com", date: "2026-01-28", time: "09:00", zoomLink: "https://zoom.us/j/789", status: "pending", reminder24h: false, reminder2h: false },
                { id: "4", name: "Ana Martínez", phone: "+573001234567", email: "ana@email.com", date: "2026-01-26", time: "11:00", zoomLink: "https://zoom.us/j/111", status: "completed", reminder24h: true, reminder2h: true },
                { id: "5", name: "Pedro Sánchez", phone: "+56998765432", email: "pedro@email.com", date: "2026-01-25", time: "15:00", zoomLink: "https://zoom.us/j/222", status: "noshow", reminder24h: true, reminder2h: true },
            ]);
            setLoading(false);
        }, 300);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-green-600 text-white";
            case "pending": return "bg-yellow-600 text-white";
            case "completed": return "bg-blue-600 text-white";
            case "noshow": return "bg-red-600 text-white";
            default: return "bg-gray-600 text-white";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "confirmed": return "✓ Confirmada";
            case "pending": return "⏳ Pendiente";
            case "completed": return "✅ Completada";
            case "noshow": return "❌ No asistió";
            default: return status;
        }
    };

    const markAsCompleted = (id: string) => {
        setMeetings(meetings.map(m => m.id === id ? { ...m, status: "completed" as const } : m));
    };

    const markAsNoShow = (id: string) => {
        setMeetings(meetings.map(m => m.id === id ? { ...m, status: "noshow" as const } : m));
    };

    const filteredMeetings = meetings.filter(m => filter === "all" || m.status === filter);

    // Group by date
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const todayMeetings = filteredMeetings.filter(m => m.date === today);
    const tomorrowMeetings = filteredMeetings.filter(m => m.date === tomorrow);
    const otherMeetings = filteredMeetings.filter(m => m.date !== today && m.date !== tomorrow);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Cargando...</div></div>;
    }

    const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
        <div className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-medium">{meeting.name}</h4>
                    <p className="text-sm text-gray-400">{meeting.phone}</p>
                </div>
                <span className={`badge ${getStatusBadge(meeting.status)}`}>
                    {getStatusLabel(meeting.status)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="text-gray-400">
                    🕐 {meeting.time}
                </div>
                <div className="text-gray-400">
                    📧 {meeting.email}
                </div>
            </div>

            <div className="flex gap-2 text-xs mb-3">
                <span className={`px-2 py-1 rounded ${meeting.reminder24h ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-500"}`}>
                    24h {meeting.reminder24h ? "✓" : "○"}
                </span>
                <span className={`px-2 py-1 rounded ${meeting.reminder2h ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-500"}`}>
                    2h {meeting.reminder2h ? "✓" : "○"}
                </span>
            </div>

            <div className="flex gap-2">
                <a href={meeting.zoomLink} target="_blank" className="btn btn-primary text-xs flex-1">
                    🔗 Abrir Zoom
                </a>
                {meeting.status === "pending" || meeting.status === "confirmed" ? (
                    <>
                        <button onClick={() => markAsCompleted(meeting.id)} className="btn btn-success text-xs">✓</button>
                        <button onClick={() => markAsNoShow(meeting.id)} className="btn btn-danger text-xs">✗</button>
                    </>
                ) : null}
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reuniones</h1>
                    <p className="text-gray-400">Gestiona tus sesiones de evaluación</p>
                </div>
                <a href="https://calendly.com/innovakidslatam/reunion-informativa-innovakids" target="_blank" className="btn btn-primary">
                    📅 Ver en Calendly
                </a>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {["all", "pending", "confirmed", "completed", "noshow"].map((f) => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === "all" ? "Todas" : getStatusLabel(f)}
                    </button>
                ))}
            </div>

            {/* Today */}
            {todayMeetings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-green-400">●</span> Hoy
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todayMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                    </div>
                </div>
            )}

            {/* Tomorrow */}
            {tomorrowMeetings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-yellow-400">●</span> Mañana
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tomorrowMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                    </div>
                </div>
            )}

            {/* Other */}
            {otherMeetings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-gray-400">●</span> Otras fechas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                    </div>
                </div>
            )}

            {filteredMeetings.length === 0 && (
                <div className="card text-center py-12 text-gray-500">
                    No hay reuniones para mostrar
                </div>
            )}
        </div>
    );
}
