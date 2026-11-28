import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import {
  X,
  Layers,
  Database,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  BookOpen,
  Lock,
  ExternalLink,
  Activity,
  Gauge,
  FileCode2,
  GitBranch,
  RefreshCw
} from 'lucide-react';

type ArchTab = 'arquitectura' | 'solid-cache' | 'openapi' | 'validacion';

interface LiveCacheResponse {
  ok: boolean;
  backend: string;
  stats: {
    size: number;
    maxEntries: number;
    hits: number;
    misses: number;
    sets: number;
    invalidations: number;
    evictions: number;
    hitRatio: number;
  };
}

const REST_ENDPOINTS: Array<{
  method: 'GET' | 'POST';
  path: string;
  desc: string;
  badge: string;
}> = [
  { method: 'GET', path: '/api/health', desc: 'Estado operativo del servidor y arquitectura activa', badge: 'Health' },
  { method: 'GET', path: '/api/cache/stats', desc: 'Métricas en vivo LRU/TTL (hits, misses, hitRatio)', badge: 'no-store' },
  { method: 'GET', path: '/api/services', desc: 'Catálogo aprobado (PRO > DESTACADO > BASICO) + filtros Ubigeo', badge: 'Cache 60s · ETag' },
  { method: 'GET', path: '/api/services/:id', desc: 'Detalle de servicio aprobado (404 si no existe)', badge: 'Cache 60s · ETag' },
  { method: 'POST', path: '/api/escrow/quote', desc: 'Cotizador financiero autoritativo (Garantía 10% + IGV 18%)', badge: 'Dominio Puro' },
  { method: 'GET', path: '/api/payments/culqi/config', desc: 'Configuración pública Culqi (nunca expone secretKey)', badge: 'Cache 60s · 304' },
  { method: 'GET', path: '/api/payments/culqi/transactions', desc: 'Ledger histórico de cobros Culqi', badge: 'Cache 30s' },
  { method: 'POST', path: '/api/payments/culqi/charge', desc: 'Ejecuta cargo Culqi v2 / Sandbox e invalida caché', badge: 'Invalida Caché' },
  { method: 'GET', path: '/api/chat/conversations', desc: 'Hilos visibles según RBAC (ADMIN, USUARIO, GUEST)', badge: 'RBAC · 15s' },
  { method: 'POST', path: '/api/chat/conversations/ensure', desc: 'Crea/enriquece hilo y difunde evento WebSocket', badge: 'WS Broadcast' },
  { method: 'POST', path: '/api/chat/messages', desc: 'Envía mensaje idempotente (messageId) con bloqueo 401 a GUEST', badge: 'RBAC 401' },
  { method: 'POST', path: '/api/notifications/dispatch-order', desc: 'Despacho automático en 3 canales (Chat + SMTP + WhatsApp)', badge: '3 Canales' }
];

const LOAD_STAGES = [
  { label: '1. Smoke', vus: 10, reqs: '101', err: '0.00%', rps: 1262.5, p95: '33.68 ms', p99: '34.21 ms', rss: '77.9 MB' },
  { label: '2. Carga Base', vus: 100, reqs: '810', err: '0.00%', rps: 4050.0, p95: '48.17 ms', p99: '68.56 ms', rss: '87.0 MB' },
  { label: '3. Carga Media', vus: 500, reqs: '3,050', err: '0.79%', rps: 5980.4, p95: '138.65 ms', p99: '179.08 ms', rss: '126.6 MB' },
  { label: '4. Alta Demanda', vus: 1000, reqs: '5,100', err: '0.47%', rps: 7183.1, p95: '169.68 ms', p99: '192.50 ms', rss: '153.6 MB' },
  { label: '5. Estrés Severo', vus: 1500, reqs: '6,150', err: '0.39%', rps: 7884.6, p95: '216.72 ms', p99: '236.04 ms', rss: '207.9 MB' },
  { label: '6. Pico Máximo', vus: 2000, reqs: '8,200', err: '0.29%', rps: 7961.2, p95: '279.10 ms', p99: '295.97 ms', rss: '228.0 MB' }
];

export const ArchitectureModal: React.FC = () => {
  const { showArchitectureModal, setShowArchitectureModal } = useConecta();
  const [activeTab, setActiveTab] = useState<ArchTab>('arquitectura');
  const [liveCache, setLiveCache] = useState<LiveCacheResponse | null>(null);
  const [loadingCache, setLoadingCache] = useState(false);

  if (!showArchitectureModal) return null;

  const fetchLiveCacheStats = async () => {
    setLoadingCache(true);
    try {
      const res = await fetch('/api/cache/stats');
      if (res.ok) {
        const data = (await res.json()) as LiveCacheResponse;
        setLiveCache(data);
      }
    } catch {
      // Silencioso si no hay backend activo en modo preview estático
    } finally {
      setLoadingCache(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setShowArchitectureModal(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 relative text-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-navy-950 text-white p-5 sm:p-7 shrink-0 relative">
          <button
            onClick={() => setShowArchitectureModal(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
            <BookOpen className="w-4 h-4" />
            <span>TrabajaYa Perú · Sprint 2 — Implementación y Validación</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white pr-10">
            Especificación de Arquitectura de Software
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Monolito Modular en Capas con <strong>Clean Architecture</strong>, documentación <strong>OpenAPI 3.0 / Swagger</strong>, pruebas automatizadas <strong>Jest (96.53% cobertura)</strong> y validación de carga hasta <strong>2,000 VUs</strong>.
          </p>

          <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
              Clean Architecture (4 Capas)
            </span>
            <span className="px-2.5 py-1 bg-sky-400/20 text-sky-300 border border-sky-400/30 rounded-md">
              OpenAPI 3.0.3 / Swagger UI
            </span>
            <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-md">
              Jest 44/44 · 96.53% Cobertura
            </span>
            <span className="px-2.5 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-md">
              k6 Progresivo · 2,000 VUs (7,961 RPS)
            </span>
          </div>

          {/* Interactive Sprint 2 Tabs */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {(
              [
                { id: 'arquitectura', label: '1. Clean Architecture & Escrow', icon: Layers },
                { id: 'solid-cache', label: '2. SOLID, BD & Caché', icon: Database },
                { id: 'openapi', label: '3. API REST & Swagger', icon: FileCode2 },
                { id: 'validacion', label: '4. Jest, CI/CD & 2,000 VUs', icon: Gauge }
              ] as const
            ).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-navy-950 shadow-lg'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 space-y-6 text-xs sm:text-sm text-slate-700 overflow-y-auto flex-1">
          {activeTab === 'arquitectura' && (
            <>
              <section className="space-y-4">
                <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  1. Capas Concéntricas de Clean Architecture en Código Real
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded uppercase font-mono">
                      Capa 1 · Dominio Puro
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">
                      <code>src/domain/</code> + <code>server/domain/</code>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      <li><strong>Reglas Financieras:</strong> Tarifa Cliente = Precio Base + 10% Garantía + 18% IGV.</li>
                      <li><strong>Validadores Perú:</strong> DNI (8 dígitos), CE/Pasaporte y RBAC de 2 permisos.</li>
                      <li><strong>Puertos (DIP/ISP):</strong> <code>CacheStore</code>, <code>ChatRepository</code>, <code>PaymentGateway</code>, <code>NotificationDispatcher</code>.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-sky-900 bg-sky-200 px-2 py-0.5 rounded uppercase font-mono">
                      Capa 2 · Aplicación (Casos de Uso)
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">
                      <code>server/application/*.ts</code>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      <li><code>ListApprovedServicesUseCase</code> &amp; <code>QuoteEscrowUseCase</code></li>
                      <li><code>ProcessCulqiChargeUseCase</code> &amp; <code>ListCulqiTransactionsUseCase</code></li>
                      <li><code>ListConversationsUseCase</code> &amp; <code>SendChatMessageUseCase</code></li>
                      <li><code>DispatchOrderNotificationsUseCase</code> (3 canales)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded uppercase font-mono">
                      Capa 3 · Infraestructura (Adaptadores)
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">
                      <code>server/infrastructure/</code> + <code>database/</code>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      <li><strong>Caché LRU/TTL/ETag:</strong> <code>LruTtlCache</code> intercambiable por Redis 7.</li>
                      <li><strong>Persistencia:</strong> <code>JsonRepositories</code> + esquema SQL PostgreSQL 16 + PgBouncer.</li>
                      <li><strong>Gateways:</strong> <code>CulqiPaymentGateway</code> (v2/Sandbox) y SMTP/WhatsApp Cloud API.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-purple-900 bg-purple-200 px-2 py-0.5 rounded uppercase font-mono">
                      Capa 4 · Presentación &amp; Composition Root
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">
                      <code>server/presentation/</code> + <code>server.ts</code> + React 19
                    </h5>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      <li><strong>API &amp; Swagger:</strong> <code>apiRoutes.ts</code> sirve 12 endpoints REST + <code>/api-docs</code>.</li>
                      <li><strong>Seguridad L7:</strong> <code>securityAndRateLimit.ts</code> (cabeceras HTTP + límite 429).</li>
                      <li><strong>Tiempo Real:</strong> <code>chatSocketServer.ts</code> (WebSocket <code>/ws/chat</code>) + SPA React 19.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Cpu className="w-5 h-5 text-sky-500" />
                  2. Monolito Modular Stateless-Ready (Docker + Nginx)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                    <div className="font-bold text-slate-900">Catálogo &amp; Ubigeo</div>
                    <div className="text-[11px] text-slate-500 mt-1">25 regiones · 1,878 distritos</div>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                    <div className="font-bold text-slate-900">Escrow &amp; Culqi</div>
                    <div className="text-[11px] text-slate-500 mt-1">Garantía 10% + IGV 18%</div>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                    <div className="font-bold text-slate-900">Chat WS + 3 Canales</div>
                    <div className="text-[11px] text-slate-500 mt-1">RBAC 401 + Idempotencia</div>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                    <div className="font-bold text-slate-900">Escalado Horizontal</div>
                    <div className="text-[11px] text-slate-500 mt-1">Nginx + 2x Node + Redis + PG</div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  3. Máquina de Estados Finita del Contrato Escrow
                </h4>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                  <div className="text-amber-400 font-bold mb-2">// Validado en src/domain/businessRules.ts (esTransicionEscrowValida)</div>
                  <div>[CLIENTE CONTRATA] ➔ <span className="text-amber-300 font-bold">EN_CUSTODIA</span> (Fondos retenidos)</div>
                  <div className="pl-4">└── [DESPACHO TÉCNICO] ➔ <span className="text-sky-300 font-bold">EN_CAMINO</span></div>
                  <div className="pl-8">└── [LLEGADA A DOMICILIO] ➔ <span className="text-indigo-300 font-bold">EN_EJECUCION</span></div>
                  <div className="pl-12">└── [TRABAJO FINALIZADO] ➔ <span className="text-emerald-300 font-bold">COMPLETADO_PENDIENTE_CONFORMIDAD</span></div>
                  <div className="pl-16">├── [CONFORMIDAD] ➔ <span className="text-emerald-400 font-bold">CONFORMIDAD_Y_LIBERADO</span> (Terminal: sin retroceso)</div>
                  <div className="pl-16">└── [OBSERVACIÓN] ➔ <span className="text-rose-400 font-bold">OBSERVADO_GARANTIA</span> (Fondos congelados + re-visita)</div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'solid-cache' && (
            <>
              <section className="space-y-3">
                <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Principios SOLID Aplicados en Código Real
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                  {[
                    { letter: 'S', name: 'SRP', desc: 'Cada caso de uso y adaptador tiene 1 única responsabilidad.' },
                    { letter: 'O', name: 'OCP', desc: 'Culqi Sandbox → Live o LRU → Redis sin tocar lógica.' },
                    { letter: 'L', name: 'LSP', desc: 'LruTtlCache y RedisCacheStore cumplen igual CacheStore.' },
                    { letter: 'I', name: 'ISP', desc: '6 puertos pequeños y segregados en server/domain/ports.ts.' },
                    { letter: 'D', name: 'DIP', desc: 'Casos de uso testeados con mocks sin red ni disco.' }
                  ].map(item => (
                    <div key={item.letter} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-lg bg-navy-950 text-amber-300 font-black flex items-center justify-center text-xs">
                          {item.letter}
                        </span>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                  <h5 className="font-extrabold text-navy-950 flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-sky-600" />
                    Análisis de Base de Datos (PostgreSQL 16)
                  </h5>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    <li><strong>Índice Compuesto Parcial:</strong> catálogo <code>APROBADO</code> por oficio + Ubigeo + plan <code>PRO</code>.</li>
                    <li><strong>Índice GIN Full-Text:</strong> búsqueda en español sin <code>LIKE &apos;%...%&apos;</code>.</li>
                    <li><strong>Concurrencia:</strong> <code>sp_reservar_turno_atomico</code> con <code>SELECT ... FOR UPDATE</code>.</li>
                    <li><strong>Particionamiento + Pooling:</strong> partición mensual + PgBouncer (2,000 → 40 conns).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-extrabold text-navy-950 flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Estrategia de Caché (LRU + TTL + ETag)
                    </h5>
                    <button
                      type="button"
                      onClick={fetchLiveCacheStats}
                      disabled={loadingCache}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingCache ? 'animate-spin' : ''}`} />
                      <span>Ver en vivo</span>
                    </button>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    <li><strong>Cache-Aside O(1):</strong> TTL 60s catálogo/config, 30s pagos, 15s chat.</li>
                    <li><strong>ETag / 304 Not Modified:</strong> ahorro de ancho de banda con SHA-1.</li>
                    <li><strong>Invalidación inmediata:</strong> <code>del()</code> en cobros y <code>invalidateByPrefix()</code> en chat.</li>
                  </ul>
                  {liveCache && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] flex flex-wrap gap-3">
                      <span>backend: <strong>{liveCache.backend}</strong></span>
                      <span>hits: <strong>{liveCache.stats.hits}</strong></span>
                      <span>misses: <strong>{liveCache.stats.misses}</strong></span>
                      <span>hitRatio: <strong>{liveCache.stats.hitRatio}%</strong></span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'openapi' && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white">
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Documentación Viva OpenAPI 3.0.3
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Prueba todos los endpoints REST directamente en Swagger UI o descarga la especificación JSON estándar.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <a
                    href="/api-docs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors"
                  >
                    <span>Abrir Swagger UI (/api-docs)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="/api/openapi.json"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors"
                  >
                    <span>OpenAPI JSON</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Método</th>
                      <th className="py-2.5 px-3 font-bold">Endpoint</th>
                      <th className="py-2.5 px-3 font-bold">Descripción</th>
                      <th className="py-2.5 px-3 font-bold">Caché / Regla</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {REST_ENDPOINTS.map(ep => (
                      <tr key={`${ep.method}-${ep.path}`} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              ep.method === 'GET'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-navy-950">{ep.path}</td>
                        <td className="py-2 px-3 text-slate-600">{ep.desc}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {ep.badge}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'validacion' && (
            <>
              {/* KPI Summary Cards */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">Pruebas Jest</div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">44 / 44</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">7 suites aprobadas (2.4s)</div>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                  <div className="text-[11px] font-bold text-sky-800 uppercase">Cobertura Líneas</div>
                  <div className="text-2xl font-black text-sky-950 mt-1">96.53%</div>
                  <div className="text-[11px] text-sky-700 mt-0.5">Funciones: 97.18%</div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-[11px] font-bold text-purple-800 uppercase">Pico Concurrencia</div>
                  <div className="text-2xl font-black text-purple-950 mt-1">2,000 VUs</div>
                  <div className="text-[11px] text-purple-700 mt-0.5">7,961.2 RPS · 0.29% err</div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-800 uppercase">Cache Hit Ratio</div>
                  <div className="text-2xl font-black text-amber-950 mt-1">99.98%</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">p95 = 279.10 ms @ 2k VUs</div>
                </div>
              </section>

              {/* Coverage Bars */}
              <section className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Reporte de Cobertura Jest (<code>npm run test:coverage</code>)
                  </h5>
                  <span className="text-[11px] font-mono text-slate-500">coverage/lcov-report/index.html</span>
                </div>
                {[
                  { label: 'Statements (Sentencias)', pct: 96.53, color: 'bg-emerald-500' },
                  { label: 'Lines (Líneas)', pct: 96.53, color: 'bg-emerald-500' },
                  { label: 'Functions (Funciones)', pct: 97.18, color: 'bg-sky-500' },
                  { label: 'Branches (Ramas)', pct: 75.95, color: 'bg-amber-500' }
                ].map(bar => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{bar.label}</span>
                      <span className="font-mono text-slate-900">{bar.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%` }} />
                    </div>
                  </div>
                ))}
              </section>

              {/* Progressive 2,000 VU Table */}
              <section className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h5 className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    Simulación Progresiva hasta 2,000 VUs (k6 + <code>npm run test:load</code>)
                  </h5>
                  <span className="text-[11px] font-mono text-slate-500">docs/evidencias/load-2000vu-results.json</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="py-2 px-3 font-bold">Etapa</th>
                        <th className="py-2 px-3 font-bold text-center">VUs</th>
                        <th className="py-2 px-3 font-bold text-right">Req.</th>
                        <th className="py-2 px-3 font-bold text-right">Error</th>
                        <th className="py-2 px-3 font-bold text-right">RPS</th>
                        <th className="py-2 px-3 font-bold text-right">p95</th>
                        <th className="py-2 px-3 font-bold text-right">p99</th>
                        <th className="py-2 px-3 font-bold text-right">RSS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {LOAD_STAGES.map(st => (
                        <tr
                          key={st.label}
                          className={st.vus === 2000 ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'}
                        >
                          <td className="py-2 px-3 text-slate-900">{st.label}</td>
                          <td className="py-2 px-3 text-center font-mono">{st.vus.toLocaleString('es-PE')}</td>
                          <td className="py-2 px-3 text-right font-mono">{st.reqs}</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700">{st.err}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-navy-950">
                            {st.rps.toLocaleString('es-PE')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{st.p95}</td>
                          <td className="py-2 px-3 text-right font-mono">{st.p99}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500">{st.rss}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* CI/CD & Postman note */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>CI/CD GitHub Actions:</strong> <code>ci.yml</code> ejecuta <code>tsc</code> → Jest + Cobertura → Carga 2,000 VUs → Vite Build → Playwright E2E → Docker.
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-300 shrink-0">Postman + k6 listos</span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            TrabajaYa Perú · Sprint 2 Validado · Cobertura Nacional 25 Regiones / 1,878 Distritos
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <span>Swagger UI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setShowArchitectureModal(false)}
              className="px-5 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
