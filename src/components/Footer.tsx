import React from 'react';
import { useConecta } from '../context/ConectaContext';
import { ShieldCheck, Award, Layers, Database, Cpu, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setShowArchitectureModal } = useConecta();

  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-slate-800 text-sm mt-16">
      {/* Top Banner inside Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-800/80 pb-10">
          
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Custodia Fiduciaria Escrow</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                El 100% del pago queda resguardado en la cuenta de custodia. Solo se dispersa al especialista cuando confirmas tu total conformidad.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-950/60 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Técnicos Certificados</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Validación estricta de credenciales con instituciones líderes: SENATI, SENCICO y CAPECO. Cero improvisación en tu hogar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-sky-950/60 border border-sky-500/30 rounded-xl text-sky-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Garantía TrabajaYa (10%)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fondo de garantía solidario para respaldo ante observaciones, re-visitas técnicas y cobertura de materiales o subsanaciones.
              </p>
            </div>
          </div>

        </div>

        {/* Platform Credits */}
        <div className="py-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-2 border-amber-400/80 overflow-hidden shadow-xl shrink-0 flex items-center justify-center p-1">
              <img
                src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
                alt="Trabaja Ya · Tu talento, nuestro compromiso"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <span className="text-amber-400 font-bold text-base">TrabajaYa Perú</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 text-xs font-semibold">Tu talento, nuestro compromiso</span>
              </div>
              <p className="text-xs text-slate-400">
                Red nacional de especialistas certificados en <strong className="text-slate-200">Electricidad, Gasfitería, Carpintería, Climatización, Línea Blanca, Redes TI</strong> y más oficios verificados en todo el Perú.
              </p>
              <p className="text-xs text-amber-300/90 mt-1">
                Cobertura completa: <span className="font-semibold text-slate-200">25 Regiones · 196 Provincias · Todos los Distritos del Perú</span>
              </p>
            </div>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 rounded-md transition-colors font-semibold"
            >
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              <span>Sprint 2 · Swagger &amp; 2,000 VUs</span>
            </button>
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-md transition-colors"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Clean Architecture</span>
            </button>
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-md transition-colors"
            >
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>Monolito Modular</span>
            </button>
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-md transition-colors"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>25 Regiones · Perú</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 TrabajaYa Perú · Tu talento, nuestro compromiso.</p>
          <div className="flex items-center gap-4 text-center sm:text-right">
            <span>25 Regiones · 196 Provincias: Amazonas, Áncash, Apurímac, Arequipa, Ayacucho, Cajamarca, Callao, Cusco, Huancavelica, Huánuco, Ica, Junín, La Libertad, Lambayeque, Lima, Loreto, Madre de Dios, Moquegua, Pasco, Piura, Puno, San Martín, Tacna, Tumbes y Ucayali</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
