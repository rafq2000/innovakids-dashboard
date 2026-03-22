"use client";
import { useState, useEffect } from "react";

interface Message {
    id: string;
    direction: "in" | "out";
    content: string;
    type: "text" | "audio" | "image";
    timestamp: string;
}

interface Conversation {
    phone: string;
    name: string;
    lastMessage: string;
    unread: boolean;
    messages: Message[];
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setConversations([
                {
                    phone: "+56912345678",
                    name: "María García",
                    lastMessage: "¡Me interesa el curso!",
                    unread: true,
                    messages: [
                        { id: "1", direction: "in", content: "Hola, vi su publicidad en Instagram", type: "text", timestamp: "10:30" },
                        { id: "2", direction: "out", content: "¡Hola María! 👋 Soy Mia, del equipo de InnovaKids Vibe Academy. Qué gusto saludarte 😊 ¿Cómo se llama tu hijo/a y qué edad tiene?", type: "text", timestamp: "10:31" },
                        { id: "3", direction: "in", content: "Se llama Matías y tiene 10 años", type: "text", timestamp: "10:35" },
                        { id: "4", direction: "out", content: "¡Matías! 🚀 10 años es perfecto para el programa. ¿Qué le apasiona? ¿Videojuegos, música, crear videos, dibujar?", type: "text", timestamp: "10:36" },
                        { id: "5", direction: "in", content: "Le encantan los videojuegos!", type: "text", timestamp: "10:40" },
                        { id: "6", direction: "out", content: "¡Genial! En Vibe Coding, Matías puede crear sus propios juegos 🎮 La IA escribe el código, él diseña la experiencia. ¿Te gustaría conocer más?", type: "text", timestamp: "10:41" },
                        { id: "7", direction: "in", content: "¡Me interesa el curso!", type: "text", timestamp: "10:45" },
                    ]
                },
                {
                    phone: "+52155512345",
                    name: "Carlos López",
                    lastMessage: "Cuánto cuesta?",
                    unread: false,
                    messages: [
                        { id: "1", direction: "in", content: "Hola, cuánto cuesta el curso?", type: "text", timestamp: "09:15" },
                        { id: "2", direction: "out", content: "¡Hola Carlos! 👋 Antes de hablar de precios, me encantaría conocer un poco más. ¿Tienes un hijo/a interesado en tecnología?", type: "text", timestamp: "09:16" },
                        { id: "3", direction: "in", content: "Cuánto cuesta?", type: "text", timestamp: "11:00" },
                    ]
                },
                {
                    phone: "+51987654321",
                    name: "Laura Díaz",
                    lastMessage: "[Audio transcrito] Mi hija tiene 12 años...",
                    unread: false,
                    messages: [
                        { id: "1", direction: "in", content: "[🎙️ Audio transcrito] Mi hija tiene 12 años y le encanta la tecnología pero no sé si esto es para ella", type: "audio", timestamp: "15:20" },
                        { id: "2", direction: "out", content: "¡Hola Laura! 👋 Gracias por tu audio. ¡12 años es una edad perfecta! 🚀 ¿Cómo se llama tu hija? Me encantaría saber qué tipo de tecnología le gusta.", type: "text", timestamp: "15:21" },
                    ]
                },
            ]);
            setLoading(false);
        }, 300);
    }, []);

    const selectedConversation = conversations.find(c => c.phone === selectedPhone);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Cargando...</div></div>;
    }

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h1 className="text-3xl font-bold">Conversaciones</h1>
                <p className="text-gray-400">Historial de mensajes con leads</p>
            </div>

            <div className="flex h-[calc(100%-4rem)] gap-4">
                {/* Conversation List */}
                <div className="w-80 bg-gray-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            className="search-input w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conv) => (
                            <div
                                key={conv.phone}
                                className={`p-4 cursor-pointer border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${selectedPhone === conv.phone ? "bg-gray-700" : ""
                                    }`}
                                onClick={() => setSelectedPhone(conv.phone)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                                        {conv.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium truncate">{conv.name}</p>
                                            {conv.unread && (
                                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat View */}
                <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        {selectedConversation.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedConversation.name}</p>
                                        <p className="text-sm text-gray-500">{selectedConversation.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-outline text-sm">📅 Agendar</button>
                                    <button className="btn btn-outline text-sm">👤 Ver Perfil</button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {selectedConversation.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-md px-4 py-2 rounded-2xl ${msg.direction === "out"
                                                    ? "bg-blue-600 text-white rounded-br-sm"
                                                    : "bg-gray-700 text-white rounded-bl-sm"
                                                }`}
                                        >
                                            {msg.type === "audio" && <span className="mr-2">🎙️</span>}
                                            {msg.type === "image" && <span className="mr-2">🖼️</span>}
                                            <span>{msg.content}</span>
                                            <span className="text-xs opacity-50 ml-2">{msg.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Respuesta manual (desactiva bot para este contacto)..."
                                        className="search-input flex-1"
                                    />
                                    <button className="btn btn-primary">Enviar</button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    ⚠️ Enviar un mensaje manual pausará el bot para este contacto
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <p>Selecciona una conversación</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
