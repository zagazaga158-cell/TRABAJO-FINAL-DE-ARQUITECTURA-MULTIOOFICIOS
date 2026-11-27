import React from 'react';
import { useConecta } from '../context/ConectaContext';
import {
  ShieldCheck,
  User,
  ShieldAlert,
  LogIn,
  LogOut,
  MessageSquare,
  Menu
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

const TAB_TITLES: Record<string, string> = {
  catalogo: 'Catálogo Nacional de Servicios',
  imprevistos: 'Imprevistos del Hogar',
  publicar: 'Publicar Anuncio de Servicio',
  solicitud: 'Mi Solicitud de Servicio',
  ordenes: 'Mis Órdenes y Conformidad',
  perfil: 'Mi Perfil y Verificación',
  perfiles: 'Directorio de Perfiles Registrados',
  portal: 'Consola del Administrador',
  'perfil-inspeccion': 'Inspección de Perfil',
  acceso: 'Acceso Único a TrabajaYa'
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    currentUser,
    cerrarSesion,
    chatConversations,
    setShowChatInbox
  } = useConecta();

  const chatCount = chatConversations.length;
  const isAdmin = Boolean(currentUser && currentRole === 'ADMIN');
  const activeTitle = TAB_TITLES[activeTab] || 'TrabajaYa Perú';

  return (
    <header className="sticky top-0 z-30 w-full bg-navy-950 text-white shadow-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Drawer Button + Compact Brand (< lg) / Active Section Title (lg+) */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Abrir menú lateral"
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile / Tablet Compact Brand */}
            <div
              onClick={() => setActiveTab(isAdmin ? 'portal' : 'catalogo')}
              className="flex lg:hidden items-center gap-2 cursor-pointer select-none min-w-0"
            >
              <div
                className={`h-10 w-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-white border-2 p-0.5 ${
                  isAdmin ? 'border-sky-400' : 'border-amber-400/80'
                }`}
              >
                <img
                  src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
                  alt="TrabajaYa · Tu talento, nuestro compromiso"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white truncate">
                    TrabajaYa
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                      isAdmin ? 'bg-sky-500 text-white' : 'bg-amber-400 text-navy-950'
                    }`}
                  >
                    {isAdmin ? 'ADMIN' : 'PERÚ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Context Title (Brand & Nav live in left Sidebar) */}
            <div className="hidden lg:flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-extrabold text-white tracking-tight truncate">
                  {activeTitle}
                </span>
                <span className="text-[11px] font-semibold text-amber-300/90 hidden xl:inline">
                  · TrabajaYa Perú
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                25 Regiones y 196 Provincias · Técnicos y Servicios Verificados
              </p>
            </div>
          </div>

          {/* Right Actions: Chat + Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowChatInbox(true)}
              className="px-3 py-2 min-h-[40px] text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
              title="Abrir Chat Directo Trabajador ↔ Cliente"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
              {chatCount > 0 && (
                <span className="bg-amber-400 text-navy-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                  {chatCount}
                </span>
              )}
            </button>

            {!currentUser ? (
              <button
                type="button"
                onClick={() => setActiveTab('acceso')}
                className={`px-3 sm:px-4 py-2 min-h-[40px] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'acceso'
                    ? 'bg-white text-navy-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-navy-950'
                }`}
                title="Inicio de sesión único opcional"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('perfil')}
                  className={`hidden md:flex items-center gap-1.5 px-2.5 py-2 min-h-[40px] text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                    isAdmin
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400/40 hover:bg-sky-500/30'
                      : 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Ver mi perfil"
                >
                  {isAdmin ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-300" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="max-w-[110px] truncate">
                    {currentUser.nombreCompleto.split(' ')[0]}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="px-3 py-2 min-h-[40px] text-xs font-bold text-white bg-rose-600/90 hover:bg-rose-600 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer shrink-0"
                  title="Cerrar sesión actual"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slim Session Info Strip when Logged In */}
      {currentUser && (
        <div
          className={`border-t text-xs py-1.5 px-3 sm:px-6 ${
            isAdmin
              ? 'bg-sky-950/90 border-sky-900/60 text-sky-200'
              : 'bg-navy-900/95 border-slate-800/70 text-slate-300'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                Conectado:{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('perfil')}
                  className="font-bold text-white underline decoration-amber-400/60 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {currentUser.nombreCompleto}
                </button>{' '}
                · <span className="font-mono text-sky-300">{currentUser.email}</span> ·{' '}
                <span className="font-mono text-amber-300">DNI {currentUser.dni}</span>
              </span>
            </div>
            <span className="uppercase font-bold text-[11px] px-2 py-0.5 rounded bg-white/10 shrink-0">
              Permiso: {isAdmin ? 'ADMINISTRADOR ÚNICO' : 'USUARIO'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
