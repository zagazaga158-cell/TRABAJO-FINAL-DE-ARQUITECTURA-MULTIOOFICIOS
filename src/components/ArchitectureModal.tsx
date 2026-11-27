import React from 'react';
import { useConecta } from '../context/ConectaContext';
import { 
  X, 
  Layers, 
  Database, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  BookOpen, 
  Server, 
  Code2, 
  Lock
} from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const { showArchitectureModal, setShowArchitectureModal } = useConecta();

  if (!showArchitectureModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 relative text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-navy-950 text-white p-6 sm:p-8 rounded-t-3xl relative">
          <button
            onClick={() => setShowArchitectureModal(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>TrabajaYa Perú · Arquitectura de Software</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-extrabold text-white">
            Especificación de Arquitectura de Software
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Plataforma Nacional <strong>TrabajaYa Perú</strong> · Servicios Multioficios Certificados con Custodia Fiduciaria.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
              Clean Architecture
            </span>
            <span className="px-2.5 py-1 bg-sky-400/20 text-sky-300 border border-sky-400/30 rounded-md">
              Monolito Modular
            </span>
            <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-md">
              PostgreSQL + Redis
            </span>
            <span className="px-2.5 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-md">
              Domain Escrow Pattern
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-slate-700">
          
          {/* Section 1: Clean Architecture Layers */}
          <section className="space-y-4">
            <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-5 h-5 text-amber-500" />
              1. Capas concéntricas de Clean Architecture (Robert C. Martin)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Capa de Dominio */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded uppercase font-mono">
                  Capa 1: Dominio (Core)
                </span>
                <h5 className="font-bold text-slate-900 text-sm">Entidades y Reglas de Negocio Puras</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Independiente de cualquier framework, base de datos o librería de UI. Define:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  <li><strong>Invariante de Escrow:</strong> Tarifa Cliente = Precio Base + 10% Garantía en Custodia.</li>
                  <li><strong>Fondo Fiduciario:</strong> Los fondos se dispersan (90% técnico / 10% fondo de garantía) <em>únicamente</em> cuando el cliente firma conformidad.</li>
                  <li><strong>Entidad Turno:</strong> Restricción de agenda sin doble reserva simultánea.</li>
                </ul>
              </div>

              {/* Capa de Aplicación */}
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-sky-900 bg-sky-200 px-2 py-0.5 rounded uppercase font-mono">
                  Capa 2: Aplicación (Casos de Uso)
                </span>
                <h5 className="font-bold text-slate-900 text-sm">Orquestación de Flujos de Negocio</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Implementa los comandos y consultas (CQRS-ready):
                </p>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  <li><code>CrearContratoCustodiaUseCase</code></li>
                  <li><code>ReservarTurnoEspecialistaUseCase</code></li>
                  <li><code>OtorgarConformidadYLiberarFondosUseCase</code></li>
                  <li><code>ReportarObservacionGarantiaUseCase</code></li>
                  <li><code>ValidarCertificadoSenatiSencicoUseCase</code></li>
                </ul>
              </div>

              {/* Capa de Infraestructura */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded uppercase font-mono">
                  Capa 3: Infraestructura (Adaptadores)
                </span>
                <h5 className="font-bold text-slate-900 text-sm">Tecnologías y Persistencia Externa</h5>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  <li><strong>PostgreSQL:</strong> Transacciones ACID para la retención fiduciaria de fondos y contratos de servicio.</li>
                  <li><strong>Redis:</strong> Candados distribuidos (Distributed Locks) para reserva de turnos en microsegundos y caché de catálogos.</li>
                  <li><strong>Culqi Perú Gateway Adapter (Checkout v4 + Charges API):</strong> Pasarela de pagos en Soles (PEN) para tarjetas y Yape con respaldo en servidor.</li>
                  <li><strong>WhatsApp SMS Gateway:</strong> Despacho de notificaciones a cliente y especialista.</li>
                </ul>
              </div>

              {/* Capa de Presentación */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-purple-900 bg-purple-200 px-2 py-0.5 rounded uppercase font-mono">
                  Capa 4: Presentación (UI / Interfaces)
                </span>
                <h5 className="font-bold text-slate-900 text-sm">Experiencia de Usuario React 19 + TypeScript</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Componentes reactivos y modulares: Catálogo con filtros reactivos, Carrito con cálculo estricto de IGV y garantía, Centro de Órdenes en tiempo real y Portal del Técnico.
                </p>
              </div>

            </div>
          </section>

          {/* Section 2: Monolito Modular Boundaries */}
          <section className="space-y-4">
            <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Cpu className="w-5 h-5 text-sky-500" />
              2. Arquitectura de Monolito Modular
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para una plataforma de servicios de alcance nacional en todo el Perú, el monolito modular ofrece máxima velocidad de despliegue, consistencia transaccional y límites de dominio claros sin la sobrecarga de latencia y orquestación de microservicios:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                <div className="font-bold text-slate-900">Módulo Catálogo</div>
                <div className="text-[11px] text-slate-500 mt-1">Especialistas, filtros y calificaciones</div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                <div className="font-bold text-slate-900">Módulo Agenda</div>
                <div className="text-[11px] text-slate-500 mt-1">Gestión de turnos libres en Redis</div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                <div className="font-bold text-slate-900">Módulo Escrow</div>
                <div className="text-[11px] text-slate-500 mt-1">Custodia fiduciaria y liberación</div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-200">
                <div className="font-bold text-slate-900">Módulo Acreditación</div>
                <div className="text-[11px] text-slate-500 mt-1">SENATI, SENCICO y CAPECO</div>
              </div>
            </div>
          </section>

          {/* Section 3: Escrow State Machine */}
          <section className="space-y-4">
            <h4 className="text-base font-extrabold text-navy-950 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              3. Máquina de Estados Finita del Contrato Escrow
            </h4>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
              <div className="text-amber-400 font-bold mb-2">// Transiciones de Estado del Contrato Fiduciario</div>
              <div>[CLIENTE CONTRATA] ➔ <span className="text-amber-300 font-bold">EN_CUSTODIA</span> (Fondos retenidos en cuenta bancaria)</div>
              <div className="pl-4">└── [DESPACHO TÉCNICO] ➔ <span className="text-sky-300 font-bold">EN_CAMINO</span></div>
              <div className="pl-8">└── [LLEGADA A DOMICILIO] ➔ <span className="text-indigo-300 font-bold">EN_EJECUCION</span></div>
              <div className="pl-12">└── [TRABAJO FINALIZADO] ➔ <span className="text-emerald-300 font-bold">COMPLETADO_PENDIENTE_CONFORMIDAD</span></div>
              <div className="pl-16">├── [CLIENTE OTORGA VISTO BUENO] ➔ <span className="text-emerald-400 font-bold">CONFORMIDAD_Y_LIBERADO</span> (Transferencia 90% técnico / 10% fondo)</div>
              <div className="pl-16">└── [CLIENTE DETECTA ANOMALÍA] ➔ <span className="text-rose-400 font-bold">OBSERVADO_GARANTIA</span> (Fondos congelados + Re-visita)</div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between">
          <div className="text-xs text-slate-500">
            TrabajaYa Perú · Cobertura Nacional en todo el Perú
          </div>
          <button
            type="button"
            onClick={() => setShowArchitectureModal(false)}
            className="px-6 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
