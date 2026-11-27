import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import { CATEGORIAS_OFICIO } from '../types';
import { formatUbicacion } from '../data/peruUbigeo';
import {
  X,
  User,
  ShieldCheck,
  MapPin,
  Star,
  Calendar,
  Briefcase,
  Camera,
  CheckCircle2,
  Award,
  FileCheck,
  MessageSquare,
  PhoneCall,
  Home,
  Wrench,
  ArrowRight,
  Pencil,
  Maximize2,
  Lock
} from 'lucide-react';

export const PublicProfileModal: React.FC = () => {
  const {
    publicProfileTarget,
    cerrarPerfilPublico,
    usuarios,
    serviciosAprobados,
    ordenes,
    imprevistos,
    currentUser,
    currentRole,
    setActiveTab,
    setSelectedServiceForModal,
    openWhatsAppChat,
    openCallModal
  } = useConecta();

  const [lightboxImg, setLightboxImg] = useState<{ url: string; titulo: string } | null>(null);

  if (!publicProfileTarget) return null;

  const userAccount =
    (publicProfileTarget.userId
      ? usuarios.find(u => u.id === publicProfileTarget.userId)
      : undefined) ||
    (publicProfileTarget.dni
      ? usuarios.find(u => u.dni === publicProfileTarget.dni)
      : undefined) ||
    (publicProfileTarget.nombre
      ? usuarios.find(
          u => u.nombreCompleto.toLowerCase() === publicProfileTarget.nombre!.toLowerCase()
        )
      : undefined);

  const userServicios = serviciosAprobados.filter(s => {
    if (userAccount && (s.autorUsuarioId === userAccount.id || s.tecnicoDni === userAccount.dni)) {
      return true;
    }
    if (publicProfileTarget.dni && s.tecnicoDni === publicProfileTarget.dni) return true;
    if (
      publicProfileTarget.nombre &&
      s.tecnicoNombre.toLowerCase() === publicProfileTarget.nombre.toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  const primaryServicio = userServicios[0];
  const displayName =
    userAccount?.nombreCompleto ||
    primaryServicio?.tecnicoNombre ||
    publicProfileTarget.nombre ||
    'Usuario TrabajaYa';
  const displayDni = userAccount?.dni || primaryServicio?.tecnicoDni || publicProfileTarget.dni || '';
  const displayPhone =
    userAccount?.telefonoWhatsapp || primaryServicio?.tecnicoTelefono || '';
  const displayUbicacion = userAccount
    ? formatUbicacion(userAccount.distrito, userAccount.provincia, userAccount.region)
    : primaryServicio
    ? formatUbicacion(primaryServicio.distrito, primaryServicio.provincia, primaryServicio.region)
    : 'Perú';
  const displayEspecialidad =
    userAccount?.especialidadPrincipal ||
    primaryServicio?.oficioLabel ||
    'Usuario de la plataforma';
  const tipoUsuario = userAccount?.tipoUsuario || (userServicios.length > 0 ? 'OFERTANTE_OFICIO' : 'CLIENTE_HOGAR');
  const isOwnProfile = Boolean(currentUser && userAccount && currentUser.id === userAccount.id);
  const canViewIdentityMedia = currentRole === 'ADMIN' || isOwnProfile;

  // Completed-work photos
  const fotosTrabajos = userAccount?.fotosTrabajos || [];

  // Verified reviews as specialist
  const resenasRecibidas = ordenes.filter(
    o =>
      o.calificacion &&
      o.items.some(
        it =>
          (userAccount && it.servicio.autorUsuarioId === userAccount.id) ||
          (displayDni && it.servicio.tecnicoDni === displayDni)
      )
  );

  // Avg rating across services or reviews
  const avgRating =
    userServicios.length > 0
      ? Number(
          (
            userServicios.reduce((sum, s) => sum + s.calificacion, 0) / userServicios.length
          ).toFixed(1)
        )
      : resenasRecibidas.length > 0
      ? Number(
          (
            resenasRecibidas.reduce((sum, o) => sum + (o.calificacion?.estrellas || 5), 0) /
            resenasRecibidas.length
          ).toFixed(1)
        )
      : 0;
  const totalResenas = userServicios.reduce((sum, s) => sum + s.numResenas, 0) || resenasRecibidas.length;

  // Incidents published by user (if client/both)
  const userImprevistos = imprevistos.filter(
    imp =>
      imp.estado !== 'RETIRADO_ADMIN' &&
      ((userAccount && imp.autorUsuarioId === userAccount.id) ||
        (displayDni && imp.autorDni === displayDni))
  );

  // Compliance verification indicators
  const has3Antecedentes = Boolean(
    (userAccount?.antecedentesPolicialesNombre || userAccount?.antecedentesPolicialesUrl) &&
      (userAccount?.antecedentesPenalesNombre || userAccount?.antecedentesPenalesUrl) &&
      (userAccount?.antecedentesJudicialesNombre || userAccount?.antecedentesJudicialesUrl)
  );
  const hasDomicilio = Boolean(
    userAccount?.comprobanteDomicilioNombre || userAccount?.comprobanteDomicilioUrl
  );
  const hasRuc = Boolean(userAccount?.rucNumero);
  const hasAcuerdos = Boolean(userAccount?.contratoFirmado && userAccount?.normasConductaFirmadas);
  const isVerifiedDoc =
    userAccount?.estadoVerificacionMedia === 'VERIFICADO' || userServicios.some(s => s.capacitado);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={cerrarPerfilPublico}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 relative text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Navy Header */}
        <div className="bg-gradient-to-br from-navy-950 via-[#0d3b66] to-slate-900 text-white p-6 sm:p-7 rounded-t-3xl relative">
          <button
            type="button"
            onClick={cerrarPerfilPublico}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar perfil"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-start sm:items-center gap-4">
              {canViewIdentityMedia && userAccount?.fotoPersonaUrl ? (
                <img
                  src={userAccount.fotoPersonaUrl}
                  alt={displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg ring-4 ring-amber-400/40 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg ring-4 ring-amber-400/25 shrink-0">
                  {primaryServicio?.tecnicoAvatar || displayName.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-navy-950">
                    {tipoUsuario === 'OFERTANTE_OFICIO'
                      ? '🛠️ Prestador de Servicios'
                      : tipoUsuario === 'CLIENTE_HOGAR'
                      ? '🏠 Cliente / Hogar'
                      : '⚡ Hogar + Prestador de Oficio'}
                  </span>
                  {isVerifiedDoc && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Perfil Verificado
                    </span>
                  )}
                  {userAccount?.fechaRegistro && (
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Desde {userAccount.fechaRegistro}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {displayName}
                </h2>
                <p className="text-xs sm:text-sm text-amber-200 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>{displayEspecialidad}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {displayUbicacion}, Perú
                  </span>
                  {avgRating > 0 && (
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      {avgRating.toFixed(1)} ({totalResenas} reseñas)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Contact or Edit Own Profile */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    cerrarPerfilPublico();
                    setActiveTab('perfil');
                  }}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar Mi Perfil / Subir Fotos</span>
                </button>
              )}

              {displayPhone && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppChat(
                        displayName,
                        displayPhone,
                        primaryServicio?.titulo || `Consulta de perfil · ${displayEspecialidad}`,
                        undefined,
                        primaryServicio?.tecnicoAvatar || '👤',
                        primaryServicio?.institucionCertificadora || 'Perfil TrabajaYa'
                      )
                    }
                    className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-navy-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openCallModal({
                        tecnicoNombre: displayName,
                        tecnicoTelefono: displayPhone,
                        servicioTitulo: primaryServicio?.titulo || displayEspecialidad,
                        region: userAccount?.region || primaryServicio?.region,
                        provincia: userAccount?.provincia || primaryServicio?.provincia,
                        distrito: userAccount?.distrito || primaryServicio?.distrito,
                        institucion: primaryServicio?.institucionCertificadora
                      })
                    }
                    className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Llamar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Profile Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Servicios Activos</span>
              <span className="text-lg font-black text-navy-950">{userServicios.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Fotos de Trabajos</span>
              <span className="text-lg font-black text-emerald-700">{fotosTrabajos.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Calificación</span>
              <span className="text-lg font-black text-amber-600">
                {avgRating > 0 ? `${avgRating.toFixed(1)} ★` : 'Nuevo'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Ubicación</span>
              <span className="text-xs font-extrabold text-navy-950 block mt-0.5 truncate">
                {displayUbicacion}
              </span>
            </div>
          </div>

          {/* 5-Block Compliance & Trust Verification Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
            <h3 className="text-xs sm:text-sm font-extrabold text-navy-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Respaldo, Documentación y Seguridad Verificada en Perfil</span>
            </h3>

            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className={`px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 ${
                  isVerifiedDoc
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {userAccount?.tipoDocumento || 'DNI'} Verificado{' '}
                {canViewIdentityMedia && displayDni ? `(${displayDni})` : ''}
              </span>

              {hasDomicilio && (
                <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Domicilio Verificado ({userAccount?.comprobanteDomicilioTipo || 'Recibo'})
                </span>
              )}

              {hasRuc && (
                <span className="px-2.5 py-1 rounded-lg font-bold bg-sky-100 text-sky-900 border border-sky-200 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" /> RUC Activo{' '}
                  {canViewIdentityMedia ? userAccount?.rucNumero : ''}{' '}
                  ({userAccount?.tipoComprobanteTributario === 'FACTURA' ? 'Factura' : 'Recibo por Honorarios'})
                </span>
              )}

              {has3Antecedentes && (
                <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Antecedentes Policiales, Penales y Judiciales
                </span>
              )}

              {userAccount?.certificacionTecnicaDetalle && (
                <span className="px-2.5 py-1 rounded-lg font-bold bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {userAccount.certificacionTecnicaDetalle}
                </span>
              )}

              {userAccount?.licenciaConducirNumero && (
                <span className="px-2.5 py-1 rounded-lg font-bold bg-slate-200 text-slate-800 border border-slate-300">
                  🚗 Licencia de Conducir Cat. {userAccount.licenciaConducirCategoria || 'A-I'}
                </span>
              )}

              {hasAcuerdos && (
                <span className="px-2.5 py-1 rounded-lg font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  ✓ Contrato y Normas de Conducta Firmadas
                </span>
              )}
            </div>
          </div>

          {/* Private Identity & Multimedia Verification (Admin & Owner only) */}
          {canViewIdentityMedia && userAccount && (
            <div className="bg-amber-50/70 rounded-2xl p-4 sm:p-5 border border-amber-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-navy-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Verificación de Identidad y Multimedia (DNI · Foto · Video · Certificado Opcional)</span>
                </h3>
                <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded text-[10px] font-extrabold">
                  🔒 Privado: Solo Propietario y Administrador
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1.5">
                  <span className="font-bold text-slate-700 block">
                    {userAccount.tipoDocumento || 'DNI'}: {userAccount.dni}
                  </span>
                  {userAccount.dniFotoUrl ? (
                    <img
                      src={userAccount.dniFotoUrl}
                      alt="Documento de identidad"
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg text-[11px] text-slate-400 border border-dashed border-slate-200">
                      Sin foto de documento
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1.5">
                  <span className="font-bold text-slate-700 block">Foto de Persona</span>
                  {userAccount.fotoPersonaUrl ? (
                    <img
                      src={userAccount.fotoPersonaUrl}
                      alt={userAccount.nombreCompleto}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg text-[11px] text-slate-400 border border-dashed border-slate-200">
                      Sin foto de rostro
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1.5">
                  <span className="font-bold text-slate-700 block">Video de Verificación</span>
                  {userAccount.videoPersonaUrl ? (
                    <video
                      src={userAccount.videoPersonaUrl}
                      controls
                      className="w-full h-24 rounded-lg bg-black object-cover"
                    />
                  ) : (
                    <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg text-[11px] text-slate-400 border border-dashed border-slate-200">
                      Sin video adjunto
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1.5">
                  <span className="font-bold text-slate-700 block">Certificado (Opcional)</span>
                  {userAccount.certificadoOpcionalUrl ? (
                    userAccount.certificadoOpcionalUrl.startsWith('data:image') ? (
                      <img
                        src={userAccount.certificadoOpcionalUrl}
                        alt={userAccount.certificadoOpcionalNombre || 'Certificado'}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="h-24 flex flex-col items-center justify-center bg-purple-50 rounded-lg text-[11px] text-purple-900 p-2 text-center border border-purple-200">
                        <span className="font-bold line-clamp-2">
                          {userAccount.certificadoOpcionalNombre || 'Certificado adjunto'}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg text-[11px] text-slate-400 border border-dashed border-slate-200">
                      No adjuntado (opcional)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COMPLETED WORK PHOTOS GALLERY */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Fotos de Trabajos Realizados ({fotosTrabajos.length})</span>
              </h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    cerrarPerfilPublico();
                    setActiveTab('perfil');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  + Subir más fotos de trabajos en Mi Perfil
                </button>
              )}
            </div>

            {fotosTrabajos.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500">
                Este usuario aún no ha subido fotos de trabajos realizados en su galería.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotosTrabajos.map(foto => {
                  const catMeta = foto.oficio
                    ? CATEGORIAS_OFICIO.find(c => c.id === foto.oficio)
                    : undefined;
                  return (
                    <div
                      key={foto.id}
                      onClick={() => setLightboxImg({ url: foto.imagenUrl, titulo: foto.titulo })}
                      className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={foto.imagenUrl}
                          alt={foto.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-85 group-hover:opacity-100">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                        {catMeta && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-navy-950/85 text-amber-300 text-[10px] font-bold rounded">
                            {catMeta.icon} {catMeta.shortLabel}
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1 text-xs">
                        <h4 className="font-bold text-navy-950 line-clamp-1">{foto.titulo}</h4>
                        {foto.descripcion && (
                          <p className="text-[11px] text-slate-600 line-clamp-2">{foto.descripcion}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span className="truncate">{foto.ubicacion || displayUbicacion}</span>
                          <span className="shrink-0">{foto.fecha}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Published Services by this Provider */}
          {userServicios.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                <span>Servicios Disponibles en Catálogo ({userServicios.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userServicios.map(srv => (
                  <div
                    key={srv.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold bg-navy-900 text-amber-300 px-2 py-0.5 rounded uppercase">
                          {srv.oficioLabel}
                        </span>
                        <span className="font-extrabold text-navy-950">
                          S/ {srv.tarifaCliente.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-navy-950 mt-1.5">{srv.titulo}</h4>
                      <p className="text-slate-600 mt-1 line-clamp-2">{srv.descripcion}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cerrarPerfilPublico();
                        setSelectedServiceForModal(srv);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <span>Ver Servicio y Solicitar Visita</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Reviews / Household Incidents */}
          {(resenasRecibidas.length > 0 || userImprevistos.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resenasRecibidas.length > 0 && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2.5 text-xs">
                  <h4 className="font-extrabold text-navy-950 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>Opiniones Verificadas ({resenasRecibidas.length})</span>
                  </h4>
                  {resenasRecibidas.map(ord => (
                    <div key={ord.id} className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{ord.datosVisita.clienteNombre}</span>
                        <span className="text-amber-600">{'★'.repeat(ord.calificacion?.estrellas || 5)}</span>
                      </div>
                      <p className="text-slate-600 italic">"{ord.calificacion?.comentario}"</p>
                    </div>
                  ))}
                </div>
              )}

              {userImprevistos.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                  <h4 className="font-extrabold text-navy-950 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-amber-600" />
                    <span>Imprevistos Publicados en Casa ({userImprevistos.length})</span>
                  </h4>
                  {userImprevistos.map(imp => (
                    <div key={imp.id} className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950">{imp.oficioLabel}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">
                          {imp.estado}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 mt-1">{imp.titulo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for Enlarged Work Photo */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/90 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="max-w-3xl w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white text-sm">
              <span className="font-bold">{lightboxImg.titulo}</span>
              <button
                type="button"
                onClick={() => setLightboxImg(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.titulo}
              className="w-full max-h-[78vh] object-contain rounded-2xl border border-white/20 bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};
