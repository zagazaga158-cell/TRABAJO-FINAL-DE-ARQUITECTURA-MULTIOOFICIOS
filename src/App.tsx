import React, { Suspense, lazy, useState } from 'react';
import { ConectaProvider, useConecta } from './context/ConectaContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CatalogoView } from './components/CatalogoView';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { OrdenConfirmadaModal } from './components/OrdenConfirmadaModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { WhatsAppChatModal } from './components/WhatsAppChatModal';
import { CallModal } from './components/CallModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import { PedidoDetalleModal } from './components/PedidoDetalleModal';
import { Toast } from './components/Toast';

// Code Splitting (Lazy Loading) para vistas secundarias y consola administrativa
const AuthScreen = lazy(() =>
  import('./components/AuthScreen').then(m => ({ default: m.AuthScreen }))
);
const ImprevistosView = lazy(() =>
  import('./components/ImprevistosView').then(m => ({ default: m.ImprevistosView }))
);
const PublicarAnuncioView = lazy(() =>
  import('./components/PublicarAnuncioView').then(m => ({ default: m.PublicarAnuncioView }))
);
const CarritoView = lazy(() =>
  import('./components/CarritoView').then(m => ({ default: m.CarritoView }))
);
const OrdenesView = lazy(() =>
  import('./components/OrdenesView').then(m => ({ default: m.OrdenesView }))
);
const TecnicoAdminView = lazy(() =>
  import('./components/TecnicoAdminView').then(m => ({ default: m.TecnicoAdminView }))
);
const PerfilView = lazy(() =>
  import('./components/PerfilView').then(m => ({ default: m.PerfilView }))
);
const AdminInspectProfileView = lazy(() =>
  import('./components/AdminInspectProfileView').then(m => ({ default: m.AdminInspectProfileView }))
);
const PerfilesView = lazy(() =>
  import('./components/PerfilesView').then(m => ({ default: m.PerfilesView }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold text-navy-900">
      <span className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
      <span>Cargando módulo TrabajaYa Perú...</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, activeTab, currentRole } = useConecta();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = activeTab === 'acceso' && !currentUser;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased selection:bg-amber-400 selection:text-navy-950 relative overflow-x-clip">
      {/* Left Side Navigation (Desktop fixed sidebar + Mobile drawer) */}
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen relative lg:pl-64">
        {/* Global Large Background Watermark centered in workspace */}
        <div
          aria-hidden="true"
          className="fixed inset-0 lg:left-64 pointer-events-none select-none z-20 flex items-center justify-center overflow-hidden"
        >
          <img
            src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
            alt=""
            className="w-[460px] h-[460px] sm:w-[680px] sm:h-[680px] lg:w-[820px] lg:h-[820px] object-contain opacity-[0.055]"
          />
        </div>

        {/* Slim Top Utility Header */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main View Port */}
        <Suspense fallback={<ViewLoadingFallback />}>
          {isAuthPage ? (
            <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <AuthScreen />
            </main>
          ) : (
            <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {activeTab === 'catalogo' && <CatalogoView />}
              {activeTab === 'perfiles' && <PerfilesView />}
              {activeTab === 'imprevistos' && <ImprevistosView />}
              {activeTab === 'solicitud' && <CarritoView />}
              {activeTab === 'publicar' && (currentUser ? <PublicarAnuncioView /> : <AuthScreen />)}
              {activeTab === 'ordenes' && (currentUser ? <OrdenesView /> : <CatalogoView />)}
              {activeTab === 'perfil' && (currentUser ? <PerfilView /> : <CatalogoView />)}
              {activeTab === 'portal' && (currentUser && currentRole === 'ADMIN' ? <TecnicoAdminView /> : <CatalogoView />)}
              {activeTab === 'perfil-inspeccion' &&
                (currentUser && currentRole === 'ADMIN' ? <AdminInspectProfileView /> : <CatalogoView />)}
            </main>
          )}
        </Suspense>

        {/* Global Footer */}
        <div className="relative z-10">
          <Footer />
        </div>
      </div>

      {/* Modals & Overlays */}
      <ServiceDetailModal />
      <PublicProfileModal />
      <OrdenConfirmadaModal />
      <PedidoDetalleModal />
      <WhatsAppChatModal />
      <CallModal />
      <ArchitectureModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ConectaProvider>
      <AppContent />
    </ConectaProvider>
  );
}
