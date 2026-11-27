import React from 'react';
import { useConecta } from '../context/ConectaContext';
import { formatUbicacion } from '../data/peruUbigeo';
import {
  PhoneCall,
  Copy,
  X,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Lock,
  UserPlus,
  LogIn
} from 'lucide-react';

export const CallModal: React.FC = () => {
  const {
    currentUser,
    activeCallTarget,
    setActiveCallTarget,
    openWhatsAppChat,
    showToast,
    setActiveTab,
    setShowAuthModal
  } = useConecta();

  if (!activeCallTarget) return null;

  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setActiveCallTarget(null)}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden relative text-slate-800 animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-navy-950 text-white p-6 text-center relative">
            <button
              type="button"
              onClick={() => setActiveCallTarget(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar llamada"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Registro Requerido para Llamar
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {activeCallTarget.tecnicoNombre}
              {activeCallTarget.institucion ? ` · ${activeCallTarget.institucion}` : ''}
            </p>
          </div>

          <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950">
              Para ver el número telefónico completo y realizar una <strong>llamada directa</strong> a{' '}
              <strong>{activeCallTarget.tecnicoNombre}</strong>, debes registrarte o iniciar sesión en TrabajaYa.
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveCallTarget(null);
                  setShowAuthModal('register');
                  setActiveTab('acceso');
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrarme ahora</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCallTarget(null);
                  setShowAuthModal('login');
                  setActiveTab('acceso');
                }}
                className="flex-1 py-3 px-4 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cleanPhone = activeCallTarget.tecnicoTelefono.replace(/\D/g, '');
  const telHref = `tel:+51${cleanPhone}`;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(`+51 ${activeCallTarget.tecnicoTelefono}`);
    showToast('Teléfono Copiado', `Número +51 ${activeCallTarget.tecnicoTelefono} copiado al portapapeles.`, 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setActiveCallTarget(null)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden relative text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-navy-950 text-white p-6 text-center relative">
          <button
            onClick={() => setActiveCallTarget(null)}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar llamada"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <PhoneCall className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-white">
            Contacto Telefónico Directo
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {activeCallTarget.tecnicoNombre}
            {activeCallTarget.institucion ? ` · ${activeCallTarget.institucion}` : ''}
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Servicio Consultado
            </span>
            <p className="text-xs font-bold text-slate-800 leading-snug">
              {activeCallTarget.servicioTitulo}
            </p>
            {(activeCallTarget.distrito || activeCallTarget.provincia || activeCallTarget.region) && (
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {formatUbicacion(
                    activeCallTarget.distrito,
                    activeCallTarget.provincia,
                    activeCallTarget.region
                  )}, Perú
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200/80 mt-2">
              <span className="text-[11px] text-slate-400 block">Número Móvil Verificado:</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-navy-950 tracking-wide">
                  +51 {activeCallTarget.tecnicoTelefono}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-2 text-slate-500 hover:text-navy-950 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  title="Copiar número telefónico"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px]">
              Para mantener la <strong>Garantía TrabajaYa (10%)</strong> y el Pago en Custodia, te recomendamos formalizar tu solicitud desde la plataforma después de coordinar por teléfono.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <a
              href={telHref}
              onClick={() =>
                showToast(
                  'Iniciando Llamada',
                  `Marcando al +51 ${activeCallTarget.tecnicoTelefono} (${activeCallTarget.tecnicoNombre})...`,
                  'info'
                )
              }
              className="w-full sm:flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Llamar Ahora</span>
            </a>

            <button
              type="button"
              onClick={() => {
                const target = activeCallTarget;
                setActiveCallTarget(null);
                openWhatsAppChat(
                  target.tecnicoNombre,
                  target.tecnicoTelefono,
                  target.servicioTitulo,
                  undefined,
                  '👨‍🔧',
                  target.institucion
                );
              }}
              className="w-full sm:flex-1 py-3 px-4 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#075E54] border border-[#25D366]/40 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#128C7E]" />
              <span>Escribir por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
