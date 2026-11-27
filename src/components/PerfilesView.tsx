import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { formatUbicacion, inferUbicacionPeru } from '../data/peruUbigeo';
import {
  Users,
  Search,
  MapPin,
  ShieldCheck,
  Camera,
  Star,
  Wrench,
  Home,
  CheckCircle2,
  User,
  MessageSquare,
  PhoneCall,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const PerfilesView: React.FC = () => {
  const {
    usuarios,
    serviciosAprobados,
    currentUser,
    currentRole,
    verPerfilPublico,
    setActiveTab,
    openWhatsAppChat,
    openCallModal
  } = useConecta();

  const [filtroRol, setFiltroRol] = useState<'TODOS' | 'OFERTANTES' | 'CLIENTES' | 'CON_FOTOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('TODOS');
  const [filtroProvincia, setFiltroProvincia] = useState('TODOS');
  const [filtroDistrito, setFiltroDistrito] = useState('TODOS');

  if (currentRole !== 'ADMIN') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-navy-950">Acceso Exclusivo para el Administrador</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Por política de privacidad de la plataforma, solo el <strong>Administrador</strong> puede ver los perfiles de los usuarios y prestadores de servicios. Puedes gestionar tu propia cuenta desde <strong>Mi Perfil</strong> o explorar los servicios en el <strong>Catálogo</strong>.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            className="px-4 py-2.5 bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Volver al Catálogo
          </button>
          {currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('perfil')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-navy-950 text-xs font-bold rounded-xl transition-colors"
            >
              Ir a Mi Perfil
            </button>
          )}
        </div>
      </div>
    );
  }

  // Exclude hidden suspended accounts; show all active users & specialists (plus admin if needed, or keep focus on community/specialists)
  const perfilesVisibles = usuarios
    .filter(u => u.permiso !== 'ADMIN' && u.estadoCuenta !== 'SUSPENDIDO')
    .filter(u => {
      const esOfertante =
        u.tipoUsuario === 'OFERTANTE_OFICIO' ||
        u.tipoUsuario === 'AMBOS' ||
        serviciosAprobados.some(s => s.autorUsuarioId === u.id || s.tecnicoDni === u.dni);
      const esCliente = u.tipoUsuario === 'CLIENTE_HOGAR' || u.tipoUsuario === 'AMBOS';

      if (filtroRol === 'OFERTANTES' && !esOfertante) return false;
      if (filtroRol === 'CLIENTES' && !esCliente) return false;
      if (filtroRol === 'CON_FOTOS' && (!u.fotosTrabajos || u.fotosTrabajos.length === 0)) return false;

      const ubi = inferUbicacionPeru(u.distrito, u.provincia, u.region);
      if (filtroRegion !== 'TODOS' && ubi.region.toLowerCase() !== filtroRegion.toLowerCase()) return false;
      if (filtroProvincia !== 'TODOS' && ubi.provincia.toLowerCase() !== filtroProvincia.toLowerCase()) return false;
      if (filtroDistrito !== 'TODOS' && ubi.distrito.toLowerCase() !== filtroDistrito.toLowerCase()) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const match =
          u.nombreCompleto.toLowerCase().includes(q) ||
          (u.especialidadPrincipal || '').toLowerCase().includes(q) ||
          ubi.region.toLowerCase().includes(q) ||
          ubi.provincia.toLowerCase().includes(q) ||
          ubi.distrito.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-950 via-[#0d3b66] to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Directorio Nacional de Perfiles · Especialistas y Usuarios</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Perfiles de Prestadores de Servicios y Usuarios
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Cada especialista y usuario cuenta con su propio perfil donde puedes revisar su trayectoria, verificación documental (DNI, antecedentes, RUC, acuerdos) y la <strong>galería de fotos de trabajos realizados</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab(currentUser ? 'perfil' : 'acceso')}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{currentUser ? 'Ir a Mi Perfil y Subir Fotos' : 'Crear Mi Perfil'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'TODOS', label: '👥 Todos los Perfiles' },
              { id: 'OFERTANTES', label: '🛠️ Prestadores de Servicios' },
              { id: 'CLIENTES', label: '🏠 Clientes / Hogar' },
              { id: 'CON_FOTOS', label: '📸 Con Fotos de Trabajos' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroRol(f.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filtroRol === f.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, oficio o ciudad..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div className="flex-1">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Filtrar perfiles por Región, Provincia y Distrito del Perú:
            </span>
            <PeruUbigeoSelector
              mode="filter"
              compact
              showLabels={false}
              region={filtroRegion}
              provincia={filtroProvincia}
              distrito={filtroDistrito}
              onChange={next => {
                setFiltroRegion(next.region);
                setFiltroProvincia(next.provincia);
                setFiltroDistrito(next.distrito);
              }}
            />
          </div>
          <div className="text-xs font-bold px-3.5 py-2 bg-slate-100 text-navy-950 rounded-xl border border-slate-200 shrink-0">
            {perfilesVisibles.length} {perfilesVisibles.length === 1 ? 'perfil encontrado' : 'perfiles encontrados'}
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      {perfilesVisibles.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay perfiles con esos filtros</h3>
          <p className="text-xs text-slate-500">Prueba limpiando el filtro de ubicación o búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {perfilesVisibles.map(u => {
            const userServicios = serviciosAprobados.filter(
              s => s.autorUsuarioId === u.id || s.tecnicoDni === u.dni
            );
            const fotos = u.fotosTrabajos || [];
            const avgRating =
              userServicios.length > 0
                ? Number(
                    (
                      userServicios.reduce((sum, s) => sum + s.calificacion, 0) / userServicios.length
                    ).toFixed(1)
                  )
                : 0;
            const has3Antecedentes = Boolean(
              (u.antecedentesPolicialesNombre || u.antecedentesPolicialesUrl) &&
                (u.antecedentesPenalesNombre || u.antecedentesPenalesUrl) &&
                (u.antecedentesJudicialesNombre || u.antecedentesJudicialesUrl)
            );
            const isOfertante =
              u.tipoUsuario === 'OFERTANTE_OFICIO' ||
              u.tipoUsuario === 'AMBOS' ||
              userServicios.length > 0;

            return (
              <div
                key={u.id}
                onClick={() => verPerfilPublico({ userId: u.id, dni: u.dni, nombre: u.nombreCompleto })}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Header */}
                  <div className="flex items-start gap-3">
                    {u.fotoPersonaUrl && (currentRole === 'ADMIN' || currentUser?.id === u.id) ? (
                      <img
                        src={u.fotoPersonaUrl}
                        alt={u.nombreCompleto}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-300 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                          isOfertante
                            ? 'bg-navy-900 text-amber-300'
                            : 'bg-amber-100 text-navy-950'
                        }`}
                      >
                        {userServicios[0]?.tecnicoAvatar || <User className="w-6 h-6" />}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.tipoUsuario === 'CLIENTE_HOGAR'
                              ? 'bg-amber-100 text-amber-900'
                              : u.tipoUsuario === 'AMBOS'
                              ? 'bg-sky-100 text-sky-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {u.tipoUsuario === 'CLIENTE_HOGAR' ? (
                            <span className="inline-flex items-center gap-0.5"><Home className="w-2.5 h-2.5" /> Cliente Hogar</span>
                          ) : u.tipoUsuario === 'AMBOS' ? (
                            '⚡ Hogar + Oficio'
                          ) : (
                            <span className="inline-flex items-center gap-0.5"><Wrench className="w-2.5 h-2.5" /> Especialista</span>
                          )}
                        </span>
                        {u.estadoVerificacionMedia === 'VERIFICADO' && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold inline-flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verificado
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm text-navy-950 truncate group-hover:text-sky-700 transition-colors">
                        {u.nombreCompleto}
                      </h3>
                      <p className="text-[11px] text-slate-600 truncate">
                        {u.especialidadPrincipal || 'Usuario TrabajaYa'}
                      </p>
                    </div>
                  </div>

                  {/* Location & Rating */}
                  <div className="flex items-center justify-between text-xs text-slate-600 border-y border-slate-100 py-2">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{formatUbicacion(u.distrito, u.provincia, u.region)}</span>
                    </span>
                    {avgRating > 0 && (
                      <span className="flex items-center gap-1 font-bold text-amber-600 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Compliance Mini Badges */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {has3Antecedentes && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Antecedentes 3/3
                      </span>
                    )}
                    {u.rucNumero && (
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded font-bold">
                        RUC Activo
                      </span>
                    )}
                    {u.normasConductaFirmadas && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold">
                        Reglamento Firmado
                      </span>
                    )}
                    {userServicios.length > 0 && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-bold">
                        {userServicios.length} servicio(s)
                      </span>
                    )}
                  </div>

                  {/* Mini Preview of Completed Work Photos */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Trabajos realizados ({fotos.length})</span>
                    </span>
                    {fotos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {fotos.slice(0, 3).map(f => (
                          <div key={f.id} className="h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={f.imagenUrl} alt={f.titulo} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-12 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400">
                        Sin fotos de trabajos aún
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      verPerfilPublico({ userId: u.id, dni: u.dni, nombre: u.nombreCompleto });
                    }}
                    className="flex-1 py-2 px-3 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Perfil Completo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>

                  {isOfertante && u.telefonoWhatsapp && (
                    <>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openWhatsAppChat(
                            u.nombreCompleto,
                            u.telefonoWhatsapp,
                            u.especialidadPrincipal || 'Consulta de servicio',
                            undefined,
                            userServicios[0]?.tecnicoAvatar || '👤',
                            'Perfil TrabajaYa'
                          );
                        }}
                        className="p-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] border border-[#25D366]/40 rounded-xl"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 text-[#128C7E]" />
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openCallModal({
                            tecnicoNombre: u.nombreCompleto,
                            tecnicoTelefono: u.telefonoWhatsapp,
                            servicioTitulo: u.especialidadPrincipal || 'Servicio Técnico',
                            region: u.region,
                            provincia: u.provincia,
                            distrito: u.distrito
                          });
                        }}
                        className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl"
                        title="Llamar"
                      >
                        <PhoneCall className="w-4 h-4 text-sky-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
