"use client";
import { useState, useEffect, useCallback, useRef } from "react";

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
  lastMessageAt: string;
  msgCount: number;
  messages: Message[];
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CL", {
      timeZone: "America/Santiago",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatTimeShort(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("es-CL", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json();
      if (data.error) setError(data.error);
      setConversations(data.conversations || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPhone, conversations]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const selectedConv = conversations.find((c) => c.phone === selectedPhone);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 animate-pulse">Cargando conversaciones reales...</div>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 6rem)" }} className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Conversaciones</h1>
          <p className="text-gray-400">{total} contactos · historial real de WhatsApp</p>
        </div>
        <button onClick={fetchConversations} className="btn btn-outline text-sm">
          ↻ Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-3 px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm flex-shrink-0">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar list */}
        <div className="w-72 bg-gray-800/60 rounded-xl border border-gray-700/50 flex flex-col min-h-0">
          <div className="p-3 border-b border-gray-700/50 flex-shrink-0">
            <input
              type="text"
              placeholder="Buscar contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input w-full text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                {search ? "Sin resultados" : "Sin conversaciones"}
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.phone}
                  onClick={() => setSelectedPhone(conv.phone)}
                  className={`w-full text-left p-3 border-b border-gray-700/30 transition-colors hover:bg-gray-700/40 ${
                    selectedPhone === conv.phone ? "bg-gray-700/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/70 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(conv.name.charAt(0) || "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-medium text-sm truncate">{conv.name}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {conv.msgCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.lastMessage || "—"}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatTime(conv.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat view */}
        <div className="flex-1 bg-gray-800/60 rounded-xl border border-gray-700/50 flex flex-col min-h-0">
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/70 flex items-center justify-center font-bold">
                    {(selectedConv.name.charAt(0) || "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedConv.name}</p>
                    <p className="text-xs text-green-400 font-mono">{selectedConv.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500 mr-2 self-center">
                    {selectedConv.msgCount} mensajes
                  </span>
                  <a
                    href={`https://wa.me/${selectedConv.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline text-sm"
                    title="Abrir WhatsApp"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        msg.direction === "out"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-700 text-white rounded-bl-sm"
                      }`}
                    >
                      {msg.type === "audio" && <span className="mr-1">🎙️</span>}
                      {msg.type === "image" && <span className="mr-1">🖼️</span>}
                      <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                      <div
                        className={`text-xs mt-1 ${
                          msg.direction === "out" ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        {formatTimeShort(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer info */}
              <div className="p-3 border-t border-gray-700/50 flex-shrink-0">
                <p className="text-xs text-gray-500 text-center">
                  📖 Historial de conversación real · Para responder usa WhatsApp directamente
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="font-medium">Selecciona una conversación</p>
                <p className="text-sm mt-1 text-gray-600">
                  {total} conversaciones reales disponibles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
