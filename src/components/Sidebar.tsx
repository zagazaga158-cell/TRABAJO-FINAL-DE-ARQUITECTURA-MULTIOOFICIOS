import React from 'react';
import { useConecta } from '../context/ConectaContext';
import {
  Search,
  ClipboardList,
  PackageCheck,
  User,
  ShieldAlert,
  Megaphone,
  LayoutDashboard,
  LogIn,
  LogOut,
  Wrench,
  Users,
  MessageSquare,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    totalItemsEnCarrito,
    currentRole,
    currentUser,
    cerrarSesion,
    publicacionesPendientesCount,
    usuariosPendientesCount,
    verificacionesPendientesCount,
    ordenesPendientesTrabajadorCount,
    ordenesPendientesCalificarClienteCount,
    imprevistosAbiertosCount,
    chatConversations,
    setShowChatInbox
  } = useConecta();

  const ordenesAlertCount =
    ordenesPendientesTrabajadorCount + ordenesPendientesCalificarClienteCount;

  const adminPendingTotal =
    publicacionesPendientesCount + usuariosPendientesCount + verificacionesPendientesCount;

  const chatCount = chatConversations.length;
  const isAdmin = Boolean(currentUser && currentRole === 'ADMIN');

  const navigateTo = (tab: Parameters<typeof setActiveTab>[0]) => {
    setActiveTab(tab);
    onClose();
  };

  const navItemClass = (isActive: boolean, accent: 'amber' | 'emerald' | 'sky' = 'amber') => {
    const base =
      'w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all text-left border cursor-pointer';
    if (!isActive) {
      return `${base} border-transparent text-slate-300 hover:text-white hover:bg-slate-900/90`;
    }
    if (accent === 'emerald') {
      return `${base} bg-emerald-500/15 text-emerald-300 border-emerald-400/35 shadow-sm font-bold`;
    }
    if (accent === 'sky') {
      return `${base} bg-sky-500/20 text-white border-sky-400/40 shadow-sm font-bold`;
    }
    return `${base} bg-amber-400/15 text-amber-300 border-amber-400/35 shadow-sm font-bold`;
  };

  const counterBadgeClass = (isActive: boolean, accent: 'amber' | 'emerald' | 'sky' = 'amber') => {
    if (accent === 'emerald') {
      return isActive
        ? 'bg-emerald-400 text-navy-950 font-extrabold text-[11px] px-2 py-0.5 rounded-md tabular-nums'
        : 'bg-emerald-500/20 text-emerald-300 font-bold text-[11px] px-2 py-0.5 rounded-md tabular-nums';
    }
    if (accent === 'sky') {
      return 'bg-sky-400 text-navy-950 font-extrabold text-[11px] px-2 py-0.5 rounded-md tabular-nums';
    }
    return 'bg-amber-400 text-navy-950 font-extrabold text-[11px] px-2 py-0.5 rounded-md tabular-nums';
  };

  const renderSidebarBody = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full bg-navy-950 text-white select-none">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-slate-800/90 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigateTo(isAdmin ? 'portal' : 'catalogo')}
          className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
        >
          <div
            className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 shrink-0 bg-white border-2 p-0.5 ${
              isAdmin ? 'border-sky-400 shadow-sky-500/20' : 'border-amber-400/80 shadow-amber-500/20'
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
              <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors truncate">
                TrabajaYa
              </span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0 ${
                  isAdmin ? 'bg-sky-500 text-white' : 'bg-amber-400 text-navy-950'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'PERÚ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Tu talento, nuestro compromiso</p>
          </div>
        </button>

        {isMobileDrawer && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú lateral"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Section Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Gestión TrabajaYa' : 'Menú Principal'}
          </p>

          <nav className="space-y-1" aria-label="Navegación lateral TrabajaYa">
            {!currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo('catalogo')}
                  className={navItemClass(activeTab === 'catalogo', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Search className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Catálogo</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('imprevistos')}
                  className={navItemClass(activeTab === 'imprevistos', 'emerald')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Imprevistos Hogar</span>
                  </span>
                  {imprevistosAbiertosCount > 0 && (
                    <span className={counterBadgeClass(activeTab === 'imprevistos', 'emerald')}>
                      {imprevistosAbiertosCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('publicar')}
                  className={navItemClass(activeTab === 'publicar', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Publicar Anuncio</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('solicitud')}
                  className={navItemClass(activeTab === 'solicitud', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <ClipboardList className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Mi Solicitud</span>
                  </span>
                  {totalItemsEnCarrito > 0 && (
                    <span className={counterBadgeClass(activeTab === 'solicitud', 'amber')}>
                      {totalItemsEnCarrito}
                    </span>
                  )}
                </button>
              </>
            ) : isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo('portal')}
                  className={navItemClass(
                    activeTab === 'portal' || activeTab === 'perfil-inspeccion',
                    'sky'
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <LayoutDashboard className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">Consola Admin</span>
                  </span>
                  {adminPendingTotal > 0 && (
                    <span className={counterBadgeClass(activeTab === 'portal', 'amber')}>
                      {adminPendingTotal}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('catalogo')}
                  className={navItemClass(activeTab === 'catalogo', 'sky')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Search className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="truncate">Catálogo</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('perfiles')}
                  className={navItemClass(activeTab === 'perfiles', 'sky')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Users className="w-4 h-4 text-sky-300 shrink-0" />
                    <span className="truncate">Perfiles</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('imprevistos')}
                  className={navItemClass(activeTab === 'imprevistos', 'sky')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Imprevistos</span>
                  </span>
                  {imprevistosAbiertosCount > 0 && (
                    <span className={counterBadgeClass(activeTab === 'imprevistos', 'emerald')}>
                      {imprevistosAbiertosCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('ordenes')}
                  className={navItemClass(activeTab === 'ordenes', 'sky')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Órdenes Globales</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('perfil')}
                  className={navItemClass(activeTab === 'perfil', 'sky')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-sky-300 shrink-0" />
                    <span className="truncate">Mi Perfil</span>
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo('catalogo')}
                  className={navItemClass(activeTab === 'catalogo', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Search className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Catálogo</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('imprevistos')}
                  className={navItemClass(activeTab === 'imprevistos', 'emerald')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Imprevistos Hogar</span>
                  </span>
                  {imprevistosAbiertosCount > 0 && (
                    <span className={counterBadgeClass(activeTab === 'imprevistos', 'emerald')}>
                      {imprevistosAbiertosCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('publicar')}
                  className={navItemClass(activeTab === 'publicar', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Publicar Anuncio</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('solicitud')}
                  className={navItemClass(activeTab === 'solicitud', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <ClipboardList className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Mi Solicitud</span>
                  </span>
                  {totalItemsEnCarrito > 0 && (
                    <span className={counterBadgeClass(activeTab === 'solicitud', 'amber')}>
                      {totalItemsEnCarrito}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('ordenes')}
                  className={navItemClass(activeTab === 'ordenes', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Mis Órdenes</span>
                  </span>
                  {ordenesAlertCount > 0 && (
                    <span className={counterBadgeClass(activeTab === 'ordenes', 'amber')}>
                      {ordenesAlertCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('perfil')}
                  className={navItemClass(activeTab === 'perfil', 'amber')}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="truncate">Mi Perfil</span>
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Direct Communication Block */}
        <div className="pt-3 border-t border-slate-800/90">
          <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Comunicación
          </p>
          <button
            type="button"
            onClick={() => {
              setShowChatInbox(true);
              onClose();
            }}
            className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Chat Directo</span>
            </span>
            {chatCount > 0 && (
              <span className="bg-amber-400 text-navy-950 font-extrabold text-[11px] px-2 py-0.5 rounded-md tabular-nums">
                {chatCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Session Footer inside Sidebar */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/60">
        {!currentUser ? (
          <button
            type="button"
            onClick={() => navigateTo('acceso')}
            className={`w-full py-2.5 px-3.5 min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
              activeTab === 'acceso'
                ? 'bg-white text-navy-950'
                : 'bg-amber-400 hover:bg-amber-300 text-navy-950'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigateTo('perfil')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-colors text-left cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isAdmin ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-400/20 text-amber-300'
                }`}
              >
                {isAdmin ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.nombreCompleto}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  DNI {currentUser.dni} · {isAdmin ? 'ADMIN' : 'USUARIO'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                cerrarSesion();
                onClose();
              }}
              className="w-full py-2 px-3 min-h-[40px] text-xs font-bold text-white bg-rose-600/90 hover:bg-rose-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Persistent Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 w-64 shrink-0 border-r border-slate-800 h-screen z-40 shadow-xl">
        {renderSidebarBody(false)}
      </aside>

      {/* Mobile & Tablet Slide-Over Sidebar Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl border-r border-slate-800 z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarBody(true)}
          </aside>
        </div>
      )}
    </>
  );
};
