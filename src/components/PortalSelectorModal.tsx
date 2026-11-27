import React from 'react';
import { useConecta } from '../context/ConectaContext';
import {
  X,
  User,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
  FileCheck2,
  Lock,
  MessageSquare,
  UserPlus,
  Megaphone,
  PhoneCall
} from 'lucide-react';

export const PortalSelectorModal: React.FC = () => {
  const {
    showPortalModal,
    setShowPortalModal,
    currentRole,
    setShowAuthModal
  } = useConecta();

  if (!showPortalModal) return null;

  const handleOpenUnifiedLogin = () => {
    setShowPortalModal(false);
    setShowAuthModal('login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setShowPortalModal(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-navy-950 text-white p-6 sm:p-7 relative text-center">
          <button
            onClick={() => setShowPortalModal(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-28 h-28 rounded-full bg-white border-2 border-amber-400/80 overflow-hidden flex items-center justify-center mx-auto mb-3 shadow-xl p-1">
            <img
              src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
              alt="Trabaja Ya · Tu talento, nuestro compromiso"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            Inicio de Sesión Único · Permisos por Correo
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            Existe un solo inicio de sesión. Los atributos asignados (<strong>Usuario</strong> o <strong>Administrador Único</strong>) dependen directamente del <strong>correo permitido</strong> con el que ingreses.
          </p>
        </div>

        {/* 2 Portal Cards Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* CARD 1: Permiso Usuario */}
          <div
            onClick={handleOpenUnifiedLogin}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 ${
              currentRole === 'USUARIO'
                ? 'border-amber-400 bg-amber-50/40 shadow-md ring-2 ring-amber-400/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                {currentRole === 'USUARIO' && (
                  <span className="text-[10px] font-bold bg-amber-400 text-navy-950 px-2 py-0.5 rounded-full uppercase">
                    Permiso Activo
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-navy-950 mb-1 group-hover:text-amber-600 transition-colors">
                1. Permiso de Usuario
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Para ciudadanos que contratan servicios o técnicos que se registran con DNI y pagan para publicar su anuncio.
              </p>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Publicar anuncios pagados con DNI</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Contacto por WhatsApp y Llamada</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pago Protegido en Custodia (Escrow)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Seguimiento de órdenes y anuncios</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-5 w-full py-2.5 px-3 bg-navy-900 group-hover:bg-navy-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Ir al Inicio de Sesión</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>

          {/* CARD 2: Permiso Administrador */}
          <div
            onClick={handleOpenUnifiedLogin}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 ${
              currentRole === 'ADMIN'
                ? 'border-sky-500 bg-sky-50/40 shadow-md ring-2 ring-sky-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                {currentRole === 'ADMIN' && (
                  <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full uppercase">
                    Permiso Activo
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-navy-950 mb-1 group-hover:text-sky-600 transition-colors">
                2. Permiso de Administrador Único
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Cuenta única exclusiva en todo el sistema. Requiere iniciar sesión con su correo permitido y contraseña.
              </p>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Admitir o rechazar publicaciones pagadas</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Gestionar correos permitidos y usuarios</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Billetera fiduciaria e ingresos de anuncios</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Gestión de turnos, diplomas y garantías</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-5 w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Ir al Inicio de Sesión</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Footer info + Register button */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>TrabajaYa Perú · Cobertura Nacional en todo el Perú</span>
          <button
            type="button"
            onClick={() => {
              setShowPortalModal(false);
              setShowAuthModal('register');
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Usuario con DNI</span>
          </button>
        </div>

      </div>
    </div>
  );
};

