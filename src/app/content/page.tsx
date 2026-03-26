"use client";
import { useState, useEffect, useCallback } from "react";

interface ContentItem {
  fecha: string;
  dia: string;
  tiktok: {
    hook: string;
    contenido: string;
    cta: string;
    caption: string;
    hashtags: string;
  };
  instagram: {
    tipo: string;
    titulo: string;
    contenido: string;
    caption: string;
    hashtags: string;
  };
  estado: string;
}

interface ContentData {
  content: ContentItem[];
  total: number;
  generados: number;
  publicados: number;
  error?: string;
}

export default function ContentPage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState<"tiktok" | "instagram">("tiktok");

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ content: [], total: 0, generados: 0, publicados: 0, error: "Error de conexion" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 60000);
    return () => clearInterval(interval);
  }, [fetchContent]);

  const estadoColor = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "PUBLICADO": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "GENERADO": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PENDIENTE": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contenido TikTok + Instagram</h1>
          <p className="text-gray-500 text-sm mt-1">
            Contenido generado automaticamente por IA cada dia
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total Contenidos</p>
          <p className="text-3xl font-bold mt-1">{data?.total ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Generados (listos)</p>
          <p className="text-3xl font-bold mt-1 text-blue-400">{data?.generados ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Publicados</p>
          <p className="text-3xl font-bold mt-1 text-green-400">{data?.publicados ?? 0}</p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-500">Cargando contenido...</p>
        </div>
      ) : data?.content && data.content.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content list */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {data.content.slice().reverse().map((item, i) => (
              <div
                key={i}
                onClick={() => setSelectedItem(item)}
                className={`card cursor-pointer hover:border-blue-500/50 transition-all ${
                  selectedItem === item ? "border-blue-500 bg-blue-500/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{item.dia}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoColor(item.estado)}`}>
                    {item.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{item.fecha}</p>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                  {item.tiktok.hook || item.instagram.titulo || "Sin contenido"}
                </p>
              </div>
            ))}
          </div>

          {/* Content detail */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold capitalize">
                    {selectedItem.dia} - {selectedItem.fecha}
                  </h2>
                  <span className={`text-sm px-3 py-1 rounded-full border ${estadoColor(selectedItem.estado)}`}>
                    {selectedItem.estado}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab("tiktok")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "tiktok"
                        ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    🎵 TikTok
                  </button>
                  <button
                    onClick={() => setActiveTab("instagram")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "instagram"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    📸 Instagram
                  </button>
                </div>

                {activeTab === "tiktok" ? (
                  <div className="space-y-4">
                    {selectedItem.tiktok.hook && (
                      <div>
                        <p className="text-xs text-pink-400 font-medium mb-1">HOOK (3 seg)</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                          {selectedItem.tiktok.hook}
                        </div>
                      </div>
                    )}
                    {selectedItem.tiktok.contenido && (
                      <div>
                        <p className="text-xs text-pink-400 font-medium mb-1">CONTENIDO</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                          {selectedItem.tiktok.contenido}
                        </div>
                      </div>
                    )}
                    {selectedItem.tiktok.cta && (
                      <div>
                        <p className="text-xs text-pink-400 font-medium mb-1">CTA</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                          {selectedItem.tiktok.cta}
                        </div>
                      </div>
                    )}
                    {selectedItem.tiktok.caption && (
                      <div>
                        <p className="text-xs text-pink-400 font-medium mb-1">CAPTION</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                          {selectedItem.tiktok.caption}
                        </div>
                      </div>
                    )}
                    {selectedItem.tiktok.hashtags && (
                      <div>
                        <p className="text-xs text-pink-400 font-medium mb-1">HASHTAGS</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-pink-300">
                          {selectedItem.tiktok.hashtags}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedItem.instagram.tipo && (
                      <div>
                        <p className="text-xs text-purple-400 font-medium mb-1">
                          FORMATO: {selectedItem.instagram.tipo.toUpperCase()}
                        </p>
                      </div>
                    )}
                    {selectedItem.instagram.titulo && (
                      <div>
                        <p className="text-xs text-purple-400 font-medium mb-1">TITULO</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                          {selectedItem.instagram.titulo}
                        </div>
                      </div>
                    )}
                    {selectedItem.instagram.contenido && (
                      <div>
                        <p className="text-xs text-purple-400 font-medium mb-1">CONTENIDO</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                          {selectedItem.instagram.contenido}
                        </div>
                      </div>
                    )}
                    {selectedItem.instagram.caption && (
                      <div>
                        <p className="text-xs text-purple-400 font-medium mb-1">CAPTION</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                          {selectedItem.instagram.caption}
                        </div>
                      </div>
                    )}
                    {selectedItem.instagram.hashtags && (
                      <div>
                        <p className="text-xs text-purple-400 font-medium mb-1">HASHTAGS</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-purple-300">
                          {selectedItem.instagram.hashtags}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-16">
                <p className="text-4xl mb-4">🎬</p>
                <p className="text-gray-500">Selecciona un contenido para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-gray-400 font-medium">No hay contenido generado todavia</p>
          <p className="text-gray-500 text-sm mt-2">
            El workflow genera contenido automaticamente de Lunes a Viernes a las 10am.
            <br />
            Asegurate de crear la pestaña &quot;ContentCalendar&quot; en Google Sheets.
          </p>
        </div>
      )}
    </div>
  );
}
