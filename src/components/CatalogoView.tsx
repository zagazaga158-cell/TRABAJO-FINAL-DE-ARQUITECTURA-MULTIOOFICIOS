import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import { CATEGORIAS_OFICIO, GRUPOS_OFICIO, GrupoOficioId, Servicio, ResenaPublicacion } from '../types';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { formatUbicacion, inferUbicacionPeru, TOTAL_DISTRITOS_PERU, TOTAL_PROVINCIAS_PERU, TOTAL_REGIONES_PERU } from '../data/peruUbigeo';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  PhoneCall,
  Megaphone,
  LogIn,
  User,
  Wrench,
  Camera
} from 'lucide-react';

export const CatalogoView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    serviciosAprobados,
    ordenes,
    usuarios,
    filtroOficio,
    setFiltroOficio,
    filtroRegion,
    setFiltroRegion,
    filtroProvincia,
    setFiltroProvincia,
    filtroDistrito,
    setFiltroDistrito,
    busquedaTexto,
    setBusquedaTexto,
    agregarAlCarrito,
    setSelectedServiceForModal,
    setActiveTab,
    verPerfilPublico,
    openWhatsAppChat,
    openCallModal
  } = useConecta();

  const [filtroGrupo, setFiltroGrupo] = useState<'TODOS' | GrupoOficioId>('TODOS');

  const categoriasVisibles =
    filtroGrupo === 'TODOS'
      ? CATEGORIAS_OFICIO
      : CATEGORIAS_OFICIO.filter(c => c.grupoId === filtroGrupo);

  // Categories config (14 especialidades en 4 grupos nacionales)
  const categorias = [
    { id: 'TODOS', label: '🛠️ Todos los oficios', icon: '🛠️' },
    ...categoriasVisibles.map(c => ({ id: c.id, label: c.label, icon: c.icon }))
  ];

  const categoriaActivaMeta = CATEGORIAS_OFICIO.find(c => c.id === filtroOficio);
  const grupoActivoMeta = GRUPOS_OFICIO.find(g => g.id === filtroGrupo);

  const getPlanPriorityRank = (srv: Servicio): number => {
    if (srv.nivelPlan === 'PRO' || srv.selloVerificadoPro) return 3;
    if (srv.nivelPlan === 'DESTACADO' || srv.destacado) return 2;
    if (srv.nivelPlan === 'PRUEBA') return 0;
    return 1;
  };

  // Filtering & real priority ranking strictly over Admin-approved services (PRO > DESTACADO > BASICO > PRUEBA)
  const serviciosFiltrados = serviciosAprobados
    .filter(srv => {
      if (filtroGrupo !== 'TODOS') {
        const srvCat = CATEGORIAS_OFICIO.find(c => c.id === srv.oficio);
        if (!srvCat || srvCat.grupoId !== filtroGrupo) return false;
      }
      if (filtroOficio !== 'TODOS' && srv.oficio !== filtroOficio) {
        return false;
      }
      const ubi = inferUbicacionPeru(srv.distrito, srv.provincia, srv.region);
      if (filtroRegion !== 'TODOS' && ubi.region.toLowerCase() !== filtroRegion.toLowerCase()) {
        return false;
      }
      if (filtroProvincia !== 'TODOS' && ubi.provincia.toLowerCase() !== filtroProvincia.toLowerCase()) {
        return false;
      }
      if (filtroDistrito !== 'TODOS' && ubi.distrito.toLowerCase() !== filtroDistrito.toLowerCase()) {
        return false;
      }
      if (busquedaTexto.trim()) {
        const q = busquedaTexto.toLowerCase();
        const matchTitulo = srv.titulo.toLowerCase().includes(q);
        const matchTecnico = srv.tecnicoNombre.toLowerCase().includes(q);
        const matchDesc = srv.descripcion.toLowerCase().includes(q);
        const matchCert = srv.institucionCertificadora.toLowerCase().includes(q);
        const matchUbi =
          ubi.region.toLowerCase().includes(q) ||
          ubi.provincia.toLowerCase().includes(q) ||
          ubi.distrito.toLowerCase().includes(q);
        if (!matchTitulo && !matchTecnico && !matchDesc && !matchCert && !matchUbi) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const rankDiff = getPlanPriorityRank(b) - getPlanPriorityRank(a);
      if (rankDiff !== 0) return rankDiff;
      return b.calificacion - a.calificacion;
    });

  const handleSolicitarVisita = (e: React.MouseEvent, srv: Servicio) => {
    e.stopPropagation();
    agregarAlCarrito(srv);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Hero Banner Superior */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3b66] via-[#082d52] to-[#001e3d] text-white shadow-xl border border-slate-700/60">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtitle, Quick CTAs & Search */}
          <div className="lg:col-span-7 space-y-5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Red Nacional de Maestros y Técnicos · Todo el Perú</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Técnicos y Profesionales <span className="text-[#f4d06f]">Capacitados</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Contrata especialistas certificados con acreditación oficial de <strong>SENATI</strong>, <strong>SENCICO</strong> y <strong>CAPECO</strong> en todo el Perú, contáctalos por <strong>Chat Directo, WhatsApp o Llamada</strong>, o publica tu propio anuncio con tu <strong>DNI</strong>.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('imprevistos')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
              >
                <Wrench className="w-4 h-4" />
                <span>Imprevistos en Casa (S/ 5.00)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('publicar')}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
              >
                <Megaphone className="w-4 h-4" />
                <span>Publicar mi Anuncio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(currentUser ? 'perfil' : 'acceso')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs rounded-xl transition-all flex items-center gap-2 active:scale-95"
              >
                {currentUser ? (
                  <>
                    <User className="w-4 h-4 text-amber-300" />
                    <span>Ver Mi Perfil</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Iniciar Sesión (Opcional)</span>
                  </>
                )}
              </button>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xl flex items-start gap-3.5">
              <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h2 className="font-bold text-white text-sm">
                  🛡️ Garantía TrabajaYa
                </h2>
                <p className="text-slate-200 mt-0.5 leading-snug">
                  Pago protegido en custodia fiduciaria hasta tu conformidad. Todos los anuncios son verificados y admitidos por el Administrador.
                </p>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="pt-1 max-w-xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={busquedaTexto}
                  onChange={e => setBusquedaTexto(e.target.value)}
                  placeholder="Buscar por oficio, técnico (ej. Carlos Mendoza, SENATI, termas)..."
                  className="w-full pl-12 pr-4 py-3 text-sm bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {busquedaTexto && (
                  <button
                    onClick={() => setBusquedaTexto('')}
                    className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Large Official Circular Brand Logo + Hero Visual Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4 relative min-w-0">
            <img
              src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 m-auto w-72 h-72 sm:w-80 sm:h-80 object-contain opacity-[0.09]"
            />

            <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-white/95 border-4 border-amber-400/80 shadow-2xl overflow-hidden p-1.5 flex items-center justify-center">
              <img
                src="/assets/aistudio/Logotipo_circular_de_empleo_y_oficios_632f5abe.webp"
                alt="Trabaja Ya · Tu talento, nuestro compromiso"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group w-full max-w-md">
              <img
                src="/src/assets/images/hero_technicians_ayacucho_1794288024922.jpg"
                alt="Técnicos certificados TrabajaYa en todo el Perú"
                className="w-full h-40 sm:h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Homologados
                  </span>
                  <span className="text-amber-300 font-bold text-[11px]">
                    {TOTAL_REGIONES_PERU} Regiones · {TOTAL_PROVINCIAS_PERU} Provincias
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  Cobertura nacional en +{TOTAL_DISTRITOS_PERU.toLocaleString('es-PE')} distritos · 4 grupos y {CATEGORIAS_OFICIO.length} especialidades
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Barra de Filtros por 4 Grupos y Especialidades & Región / Provincia / Distrito */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        {/* 4 Grupos Principales */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Explorar por Grupo de Servicio
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFiltroGrupo('TODOS');
                setFiltroOficio('TODOS');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filtroGrupo === 'TODOS'
                  ? 'bg-amber-400 text-navy-950 shadow-sm ring-2 ring-amber-400/50'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Todos los Grupos (4)
            </button>
            {GRUPOS_OFICIO.map(grupo => {
              const active = filtroGrupo === grupo.id;
              return (
                <button
                  key={grupo.id}
                  type="button"
                  onClick={() => {
                    setFiltroGrupo(grupo.id);
                    setFiltroOficio('TODOS');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-navy-900 text-white shadow-md ring-2 ring-navy-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{grupo.icon}</span>
                  <span>{grupo.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chips de Especialidades */}
        <div className="flex flex-wrap items-center gap-2">
          {categorias.map(cat => {
            const active = filtroOficio === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFiltroOficio(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'bg-navy-900 text-white shadow-md shadow-navy-900/20 ring-2 ring-navy-900'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-service description banner when a group or specialty is selected */}
        {(categoriaActivaMeta || grupoActivoMeta) && (
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="block text-navy-950">
                {categoriaActivaMeta ? categoriaActivaMeta.label : grupoActivoMeta?.nombre}
              </strong>
              <span className="text-slate-700">
                {categoriaActivaMeta
                  ? categoriaActivaMeta.descripcionServicios
                  : grupoActivoMeta?.subtitulo}
              </span>
            </div>
            {categoriaActivaMeta && (
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {categoriaActivaMeta.tareasComunes.slice(0, 3).map(t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-white border border-sky-200 rounded-md text-[10px] font-semibold text-sky-900"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cascading Región -> Provincia -> Distrito Filter & Counter */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Filtrar cobertura nacional en el Perú (Región / Provincia / Distrito):</span>
            </div>
            <PeruUbigeoSelector
              mode="filter"
              compact
              showLabels={false}
              region={filtroRegion}
              provincia={filtroProvincia}
              distrito={filtroDistrito}
              onChange={({ region, provincia, distrito }) => {
                if (region !== filtroRegion) {
                  setFiltroRegion(region);
                } else if (provincia !== filtroProvincia) {
                  setFiltroProvincia(provincia);
                } else {
                  setFiltroDistrito(distrito);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(filtroGrupo !== 'TODOS' || filtroOficio !== 'TODOS' || filtroRegion !== 'TODOS' || busquedaTexto.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setFiltroGrupo('TODOS');
                  setFiltroOficio('TODOS');
                  setFiltroRegion('TODOS');
                  setBusquedaTexto('');
                }}
                className="text-xs font-semibold px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
            <div className="text-xs font-bold px-3.5 py-2 bg-slate-100 text-navy-900 rounded-xl whitespace-nowrap border border-slate-200">
              {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? 'especialista disponible' : 'especialistas disponibles'}
            </div>
          </div>
        </div>

      </section>

      {/* 3. Grilla de Tarjetas de Servicios Técnicos */}
      {serviciosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-800">No se encontraron especialistas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba cambiando los filtros de categoría, región, provincia o distrito en el Perú.
          </p>
          <button
            onClick={() => {
              setFiltroOficio('TODOS');
              setFiltroRegion('TODOS');
              setBusquedaTexto('');
            }}
            className="mt-4 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold hover:bg-navy-950 transition-colors"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviciosFiltrados.map(srv => {
            const hasTurns = srv.turnosLibres > 0;
            const isPro = srv.nivelPlan === 'PRO' || Boolean(srv.selloVerificadoPro);
            const isDestacado = !isPro && (srv.nivelPlan === 'DESTACADO' || Boolean(srv.destacado));
            const techAccount = usuarios.find(
              u => u.id === srv.autorUsuarioId || u.dni === srv.tecnicoDni
            );
            const isDocsVerified =
              isPro || techAccount?.estadoVerificacionMedia === 'VERIFICADO' || srv.capacitado;

            return (
              <div
                key={srv.id}
                onClick={() => setSelectedServiceForModal(srv)}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer hover:-translate-y-1 ${
                  isPro
                    ? 'border-navy-900 ring-2 ring-amber-400/70'
                    : isDestacado
                    ? 'border-amber-400 ring-1 ring-amber-300/60'
                    : 'border-slate-200'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={srv.imagen}
                    alt={srv.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  {/* Category label & Tier / Verified Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold bg-navy-950/90 text-amber-300 px-2.5 py-1 rounded-md backdrop-blur-sm border border-navy-900/40 uppercase tracking-wider">
                      {srv.oficioLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      {isPro && (
                        <span className="text-[10px] font-extrabold bg-navy-950 text-amber-300 border border-amber-400/60 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-amber-300" /> PRO
                        </span>
                      )}
                      {isDestacado && (
                        <span className="text-[10px] font-extrabold bg-amber-400 text-navy-950 px-1.5 py-0.5 rounded shadow-sm">
                          DESTACADO
                        </span>
                      )}
                      {isDocsVerified && (
                        <span className="text-[10px] font-bold bg-emerald-600/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Technician mini tag at bottom of image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 font-semibold drop-shadow">
                      <span className="text-base">{srv.tecnicoAvatar}</span>
                      <span className="truncate max-w-[140px]">{srv.tecnicoNombre}</span>
                    </div>
                    <span className="text-[11px] text-amber-300 bg-black/40 px-1.5 py-0.5 rounded font-mono">
                      {srv.institucionCertificadora}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div>
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-navy-900 transition-colors line-clamp-2 leading-snug">
                      {srv.titulo}
                    </h3>

                    {/* Metrics Row */}
                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{srv.calificacion.toFixed(1)}</span>
                        <span className="text-[11px] font-normal text-slate-400">({srv.numResenas})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{srv.experienciaAnos} años exp.</span>
                      </div>
                    </div>

                    {/* District & Direct Phone */}
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1 truncate" title={formatUbicacion(srv.distrito, srv.provincia, srv.region)}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formatUbicacion(srv.distrito, srv.provincia, srv.region)}</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        +51 {srv.tecnicoTelefono}
                      </span>
                    </div>

                    {/* Worker Profile Trigger & Work Photos Count */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          verPerfilPublico({
                            userId: srv.autorUsuarioId || techAccount?.id,
                            dni: srv.tecnicoDni,
                            nombre: srv.tecnicoNombre
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-navy-900 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <User className="w-3 h-3" />
                        <span>Ver Perfil</span>
                      </button>

                      {(techAccount?.fotosTrabajos?.length || 0) > 0 && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            verPerfilPublico({
                              userId: srv.autorUsuarioId || techAccount?.id,
                              dni: srv.tecnicoDni,
                              nombre: srv.tecnicoNombre
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-amber-600" />
                          <span>{techAccount!.fotosTrabajos!.length} foto(s) de trabajos</span>
                        </button>
                      )}
                    </div>

                    {/* Trust & Compliance Mini Badges */}
                    {(techAccount?.rucNumero ||
                      techAccount?.antecedentesPolicialesNombre ||
                      techAccount?.antecedentesPolicialesUrl ||
                      techAccount?.normasConductaFirmadas) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(techAccount?.antecedentesPolicialesNombre || techAccount?.antecedentesPolicialesUrl) && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Antecedentes ✓
                          </span>
                        )}
                        {techAccount?.rucNumero && (
                          <span className="text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded">
                            RUC Activo
                          </span>
                        )}
                        {techAccount?.normasConductaFirmadas && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                            Reglamento Firmado
                          </span>
                        )}
                      </div>
                    )}

                    {/* Latest Client Review & Comment on Publication */}
                    {(() => {
                      const resenasMap = new Map<string, ResenaPublicacion>();
                      (srv.resenasPublicadas || []).forEach(r => {
                        resenasMap.set(r.ordenId, r);
                      });
                      ordenes.forEach(o => {
                        if (
                          o.calificacion &&
                          o.items.some(
                            it =>
                              it.servicioId === srv.id ||
                              (Boolean(srv.autorUsuarioId) &&
                                it.servicio.autorUsuarioId === srv.autorUsuarioId &&
                                it.servicio.oficio === srv.oficio) ||
                              (Boolean(srv.tecnicoDni) && it.servicio.tecnicoDni === srv.tecnicoDni)
                          ) &&
                          !resenasMap.has(o.id)
                        ) {
                          resenasMap.set(o.id, {
                            ordenId: o.id,
                            autorNombre: o.datosVisita.clienteNombre,
                            estrellas: o.calificacion.estrellas,
                            comentario: o.calificacion.comentario,
                            fecha: o.calificacion.fecha,
                            criterios: o.calificacion.criterios
                          });
                        }
                      });
                      const resenasVisibles = Array.from(resenasMap.values());
                      if (resenasVisibles.length === 0) return null;
                      const ultima = resenasVisibles[0];
                      return (
                        <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-amber-950 truncate">
                              💬 {ultima.autorNombre}
                            </span>
                            <span className="font-bold text-amber-600 shrink-0">
                              {'★'.repeat(ultima.estrellas)}
                            </span>
                          </div>
                          <p className="text-slate-700 italic line-clamp-2 leading-snug">
                            "{ultima.comentario}"
                          </p>
                          {resenasVisibles.length > 1 && (
                            <span className="text-[10px] font-bold text-amber-800 block">
                              + {resenasVisibles.length - 1} comentario(s) más en esta publicación
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bloque de Tarifa Transparente */}
                  <div className="pt-2">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 font-medium">Tarifa al cliente:</span>
                        <span className="text-lg font-extrabold text-navy-950 tabular-nums">
                          S/ {srv.tarifaCliente.toFixed(2)}
                        </span>
                      </div>

                      {/* Formula breakdown */}
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Base S/ {srv.precioBase.toFixed(2)} + 10% garantía = S/ {srv.tarifaCliente.toFixed(2)}
                      </div>

                      {/* Turnos indicator */}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Agenda semanal:</span>
                        {hasTurns ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                            {srv.turnosLibres} turnos libres
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold text-xs">
                            ● Agotado
                          </span>
                        )}
                      </div>

                    </div>

                    {/* CTA Buttons: Solicitar Visita + WhatsApp + Llamar */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!hasTurns}
                        onClick={e => handleSolicitarVisita(e, srv)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                          hasTurns
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-98'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {hasTurns ? (
                          <>
                            <span>Solicitar Visita</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <span>Sin turnos</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openWhatsAppChat(
                            srv.tecnicoNombre,
                            srv.tecnicoTelefono,
                            srv.titulo,
                            undefined,
                            srv.tecnicoAvatar,
                            srv.institucionCertificadora
                          );
                        }}
                        className="p-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] border border-[#25D366]/40 rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0"
                        title={`Hablar por WhatsApp con ${srv.tecnicoNombre}`}
                      >
                        <MessageSquare className="w-4 h-4 text-[#128C7E]" />
                      </button>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openCallModal({
                            tecnicoNombre: srv.tecnicoNombre,
                            tecnicoTelefono: srv.tecnicoTelefono,
                            servicioTitulo: srv.titulo,
                            region: srv.region,
                            provincia: srv.provincia,
                            distrito: srv.distrito,
                            institucion: srv.institucionCertificadora
                          });
                        }}
                        className="p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0"
                        title={`Llamar por teléfono a ${srv.tecnicoNombre} (+51 ${srv.tecnicoTelefono})`}
                      >
                        <PhoneCall className="w-4 h-4 text-sky-600" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Proof Section: How TrabajaYa Escrow Works */}
      <section className="bg-slate-100/90 rounded-2xl p-6 sm:p-8 border border-slate-200 text-slate-800">
        <h3 className="text-lg font-bold text-navy-950 mb-1">
          ¿Cómo funciona el Pago Protegido en Custodia (Escrow) de TrabajaYa?
        </h3>
        <p className="text-xs text-slate-600 mb-6">
          Desarrollado bajo principios de Arquitectura Limpia para garantizar transparencia técnica y financiera entre el cliente y el técnico en todo el Perú.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-navy-900 text-amber-300 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-1">
              Contratación y Retención
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seleccionas tu servicio e ingresas tu pago. El dinero no se entrega al técnico, sino que queda congelado en la cuenta de custodia TrabajaYa.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-navy-900 text-amber-300 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-1">
              Visita y Ejecución Homologada
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El especialista de SENATI, SENCICO o CAPECO acude a tu domicilio o empresa en tu ciudad en el turno acordado con instrumental profesional.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-navy-900 text-amber-300 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-1">
              Visto Bueno y Liberación
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verificas la reparación o instalación. Al presionar "Dar Conformidad", la pasarela libera los fondos al especialista. Si hay fallas, la garantía te respalda.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
