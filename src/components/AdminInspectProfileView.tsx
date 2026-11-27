import React, { useState } from 'react';
import { useConecta } from '../context/ConectaContext';
import { formatUbicacion } from '../data/peruUbigeo';
import { ExpedienteCumplimientoSection } from './ExpedienteCumplimientoSection';
import {
  ArrowLeft,
  User,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  MessageSquare,
  PhoneCall,
  Megaphone,
  Award,
  PackageCheck,
  Camera,
  Video,
  FileText,
  Trash2,
  AlertTriangle,
  Home
} from 'lucide-react';

export const AdminInspectProfileView: React.FC = () => {
  const {
    inspectedProfile,
    volverAConsolaAdmin,
    usuarios,
    servicios,
    ordenes,
    certificados,
    imprevistos,
    currentRole,
    currentUser,
    cambiarEstadoCuentaUsuario,
    gestionarVerificacionUsuarioAdmin,
    eliminarArchivoVerificacionAdmin,
    eliminarFotoTrabajoAdmin,
    admitirPublicacion,
    rechazarPublicacion,
    openWhatsAppChat,
    openCallModal
  } = useConecta();

  const [rechazoId, setRechazoId] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('Falta verificar código de certificado o ajustar tarifa.');
  const [observacionMediaInput, setObservacionMediaInput] = useState(
    'Por favor sube una foto más nítida de tu DNI o un video claro de presentación.'
  );
  const [showObservarMedia, setShowObservarMedia] = useState(false);

  if (!inspectedProfile) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <p className="text-sm text-slate-600">No se ha seleccionado ningún perfil para inspeccionar.</p>
        <button
          type="button"
          onClick={volverAConsolaAdmin}
          className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl"
        >
          Volver a Consola Admin
        </button>
      </div>
    );
  }

  // Locate inspected service if opened from a publication card
  const focusedServicio = inspectedProfile.servicioId
    ? servicios.find(s => s.id === inspectedProfile.servicioId)
    : undefined;

  // Locate matching registered user account by ID or DNI
  const targetDni = inspectedProfile.dni || focusedServicio?.tecnicoDni;
  const userAccount =
    (inspectedProfile.userId ? usuarios.find(u => u.id === inspectedProfile.userId) : undefined) ||
    (focusedServicio?.autorUsuarioId
      ? usuarios.find(u => u.id === focusedServicio.autorUsuarioId)
      : undefined) ||
    (targetDni ? usuarios.find(u => u.dni === targetDni) : undefined);

  const canViewIdentityMedia =
    currentRole === 'ADMIN' ||
    (Boolean(currentUser?.id) && Boolean(userAccount?.id) && currentUser!.id === userAccount!.id);

  if (!canViewIdentityMedia) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center space-y-4 max-w-xl mx-auto">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-extrabold text-navy-950">
          Acceso Restringido · Verificación de Identidad y Multimedia
        </h3>
        <p className="text-xs text-slate-600">
          Los archivos de Verificación de Identidad y Multimedia (DNI, foto, video y certificado opcional) solo pueden ser visualizados por el <strong>Administrador</strong> y el <strong>propietario de los datos</strong>.
        </p>
        <button
          type="button"
          onClick={volverAConsolaAdmin}
          className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl"
        >
          Volver
        </button>
      </div>
    );
  }

  const displayName = userAccount?.nombreCompleto || focusedServicio?.tecnicoNombre || 'Especialista Registrado';
  const displayDni = userAccount?.dni || targetDni || 'No registrado';
  const displayPhone = userAccount?.telefonoWhatsapp || focusedServicio?.tecnicoTelefono || '966 000 000';
  const displayRegion = userAccount?.region || focusedServicio?.region;
  const displayProvincia = userAccount?.provincia || focusedServicio?.provincia;
  const displayDistrito = userAccount?.distrito || focusedServicio?.distrito || 'Lima';
  const displayUbicacionCompleta = formatUbicacion(displayDistrito, displayProvincia, displayRegion);
  const displayDireccion = userAccount?.direccion || 'Dirección registrada en padrón de especialistas';
  const displayEspecialidad =
    userAccount?.especialidadPrincipal ||
    focusedServicio?.oficioLabel ||
    'Servicios Generales';

  // All publications belonging to this user or DNI
  const userPublicaciones = servicios
    .filter(s => {
      if (userAccount && (s.autorUsuarioId === userAccount.id || s.tecnicoDni === userAccount.dni)) {
        return true;
      }
      if (targetDni && s.tecnicoDni === targetDni) {
        return true;
      }
      if (focusedServicio && s.id === focusedServicio.id) {
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      if (a.id === inspectedProfile.servicioId) return -1;
      if (b.id === inspectedProfile.servicioId) return 1;
      return 0;
    });

  // Matching official certificates
  const userCertificados = certificados.filter(c => {
    const cleanTarget = displayName.toLowerCase();
    return (
      c.tecnicoNombre.toLowerCase().includes(cleanTarget) ||
      cleanTarget.includes(c.tecnicoNombre.toLowerCase().replace(/^(ing\.|mtro\.|téc\.)\s*/i, '')) ||
      userPublicaciones.some(p => p.codigoCertificado === c.codigoRegistro)
    );
  });

  // All Escrow orders linked to this person (as client or as specialist)
  const userOrdenes = ordenes.filter(o => {
    const asClient =
      (userAccount && o.clienteUsuarioId === userAccount.id) ||
      (displayDni !== 'No registrado' && o.datosVisita.clienteDni === displayDni);
    const asSpecialist = o.items.some(
      it =>
        (displayDni !== 'No registrado' && it.servicio.tecnicoDni === displayDni) ||
        (userAccount && it.servicio.autorUsuarioId === userAccount.id)
    );
    return asClient || asSpecialist;
  });

  const estadoCuenta = userAccount?.estadoCuenta || 'ACTIVO';
  const estadoMedia = userAccount?.estadoVerificacionMedia || 'SIN_ADJUNTOS';

  const userImprevistos = imprevistos.filter(
    imp =>
      (userAccount && imp.autorUsuarioId === userAccount.id) ||
      (displayDni !== 'No registrado' && imp.autorDni === displayDni)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Return Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={volverAConsolaAdmin}
          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-navy-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Consola Admin</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-900 border border-sky-300 rounded-xl">
          Inspección de Perfil Completo · Vista Administrador
        </span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-navy-950 via-sky-950 to-slate-900 text-white shadow-xl border border-sky-800/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {userAccount?.fotoPersonaUrl ? (
              <img
                src={userAccount.fotoPersonaUrl}
                alt={displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg ring-4 ring-sky-400/40 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg ring-4 ring-sky-400/25 shrink-0">
                {userAccount?.permiso === 'ADMIN' ? (
                  <ShieldAlert className="w-9 h-9" />
                ) : (
                  <User className="w-9 h-9" />
                )}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase bg-amber-400 text-navy-950">
                  {userAccount ? (userAccount.permiso === 'ADMIN' ? 'ADMIN ÚNICO' : 'USUARIO') : 'OFERTANTE / ESPECIALISTA'}
                </span>
                {userAccount && (
                  <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-md text-slate-200">
                    ID: {userAccount.id}
                  </span>
                )}
                {userAccount && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                      estadoCuenta === 'ACTIVO'
                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30'
                        : estadoCuenta === 'PENDIENTE'
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/30'
                        : 'bg-rose-500/25 text-rose-200 border border-rose-400/30'
                    }`}
                  >
                    Estado: {estadoCuenta}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{displayName}</h2>
              <p className="text-xs sm:text-sm text-sky-200 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-amber-300">DNI: {displayDni}</span>
                {userAccount && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{userAccount.email}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Direct Admin Acceptance / Suspension & Contact Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {userAccount && userAccount.permiso !== 'ADMIN' && estadoCuenta !== 'ACTIVO' && (
              <button
                type="button"
                onClick={() => cambiarEstadoCuentaUsuario(userAccount.id, 'ACTIVO')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ Aceptar Cuenta de Usuario</span>
              </button>
            )}

            {userAccount && userAccount.permiso !== 'ADMIN' && estadoCuenta === 'ACTIVO' && (
              <button
                type="button"
                onClick={() => cambiarEstadoCuentaUsuario(userAccount.id, 'SUSPENDIDO')}
                className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Ban className="w-4 h-4" />
                <span>Suspender Cuenta</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                openWhatsAppChat(
                  displayName,
                  displayPhone,
                  focusedServicio?.titulo || 'Verificación Administrativa TrabajaYa',
                  undefined,
                  focusedServicio?.tecnicoAvatar || '👤',
                  `DNI ${displayDni}`
                )
              }
              className="px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-navy-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
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
                  servicioTitulo: focusedServicio?.titulo || 'Verificación de Perfil',
                  region: displayRegion,
                  provincia: displayProvincia,
                  distrito: displayDistrito
                })
              }
              className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Llamar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Complete Personal Parameters Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Todos los Datos Personales y de Contacto</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5" /> Nombres y Apellidos
            </span>
            <span className="font-extrabold text-sm text-navy-950">{displayName}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <CreditCard className="w-3.5 h-3.5" /> DNI (Documento de Identidad)
            </span>
            <span className="font-mono font-extrabold text-sm text-navy-950">{displayDni}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <Mail className="w-3.5 h-3.5" /> Correo Electrónico Permitido
            </span>
            <span className="font-mono font-bold text-sm text-navy-950 break-all">
              {userAccount?.email || 'No vinculado a cuenta web'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Celular / WhatsApp Directo
            </span>
            <span className="font-mono font-bold text-sm text-emerald-700">+51 {displayPhone}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5" /> Ubicación (Región / Prov. / Dist.) y Dirección
            </span>
            <span className="font-bold text-slate-800 block">{displayUbicacionCompleta}</span>
            <span className="text-slate-600">{displayDireccion}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Modalidad, Especialidad & Registro
            </span>
            <span className="font-extrabold text-navy-950 block">
              {userAccount?.tipoUsuario === 'CLIENTE_HOGAR'
                ? '🏠 Cliente / Hogar'
                : userAccount?.tipoUsuario === 'OFERTANTE_OFICIO'
                ? '🛠️ Persona de Oficio'
                : '⚡ Hogar + Oficio'}
            </span>
            <span className="font-semibold text-slate-700 block">{displayEspecialidad}</span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> {userAccount?.fechaRegistro || focusedServicio?.fechaPublicacion || 'Padrón inicial'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1.5: Admin Management of DNI Photo, Person Photo, Person Video & Optional Certificate */}
      {userAccount && canViewIdentityMedia && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-600" />
                <span>Verificación de Identidad y Multimedia (DNI · Foto · Video · Certificado Opcional)</span>
              </h3>
              <p className="text-xs text-slate-500">
                🔒 Privado: visible únicamente para el Administrador y el propietario de los datos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase ${
                  estadoMedia === 'VERIFICADO'
                    ? 'bg-emerald-100 text-emerald-800'
                    : estadoMedia === 'PENDIENTE_REVISION'
                    ? 'bg-amber-100 text-amber-900'
                    : estadoMedia === 'OBSERVADO'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Estado Media: {estadoMedia}
              </span>

              {estadoMedia !== 'VERIFICADO' && (
                <button
                  type="button"
                  onClick={() => gestionarVerificacionUsuarioAdmin(userAccount.id, 'VERIFICADO')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Aprobar Verificación</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowObservarMedia(prev => !prev)}
                className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Observar Multimedia</span>
              </button>
            </div>
          </div>

          {userAccount.observacionVerificacion && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <strong>Observación vigente:</strong> {userAccount.observacionVerificacion}
            </div>
          )}

          {showObservarMedia && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row gap-2 text-xs">
              <input
                type="text"
                value={observacionMediaInput}
                onChange={e => setObservacionMediaInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg"
                placeholder="Indica qué debe corregir en su DNI, foto o video..."
              />
              <button
                type="button"
                onClick={() => {
                  gestionarVerificacionUsuarioAdmin(userAccount.id, 'OBSERVADO', observacionMediaInput);
                  setShowObservarMedia(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
              >
                Guardar Observación
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Foto Persona */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-sky-600" /> Foto de Persona
                </span>
                {userAccount.fotoPersonaUrl && (
                  <button
                    type="button"
                    onClick={() => eliminarArchivoVerificacionAdmin(userAccount.id, 'fotoPersonaUrl')}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="Eliminar foto personal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {userAccount.fotoPersonaUrl ? (
                <img
                  src={userAccount.fotoPersonaUrl}
                  alt="Foto persona"
                  className="w-full h-40 object-cover rounded-lg border border-slate-300"
                />
              ) : (
                <div className="h-40 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                  No adjuntada
                </div>
              )}
            </div>

            {/* Foto DNI */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Foto DNI ({userAccount.dni})
                </span>
                {userAccount.dniFotoUrl && (
                  <button
                    type="button"
                    onClick={() => eliminarArchivoVerificacionAdmin(userAccount.id, 'dniFotoUrl')}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="Eliminar foto de DNI"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {userAccount.dniFotoUrl ? (
                <img
                  src={userAccount.dniFotoUrl}
                  alt="Foto DNI"
                  className="w-full h-40 object-cover rounded-lg border border-slate-300"
                />
              ) : (
                <div className="h-40 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                  No adjuntada
                </div>
              )}
            </div>

            {/* Video Persona */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-emerald-600" /> Video Persona
                </span>
                {userAccount.videoPersonaUrl && (
                  <button
                    type="button"
                    onClick={() => eliminarArchivoVerificacionAdmin(userAccount.id, 'videoPersonaUrl')}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="Eliminar video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {userAccount.videoPersonaUrl ? (
                <video
                  src={userAccount.videoPersonaUrl}
                  controls
                  className="w-full h-40 rounded-lg bg-black object-contain border border-slate-300"
                />
              ) : (
                <div className="h-40 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                  No adjuntado
                </div>
              )}
            </div>

            {/* Certificado Opcional */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-600" /> Certificado Opcional
                </span>
                {userAccount.certificadoOpcionalUrl && (
                  <button
                    type="button"
                    onClick={() => eliminarArchivoVerificacionAdmin(userAccount.id, 'certificadoOpcionalUrl')}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="Eliminar certificado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {userAccount.certificadoOpcionalUrl ? (
                userAccount.certificadoOpcionalUrl.startsWith('data:image/') ? (
                  <img
                    src={userAccount.certificadoOpcionalUrl}
                    alt="Certificado opcional"
                    className="w-full h-40 object-cover rounded-lg border border-slate-300"
                  />
                ) : (
                  <div className="h-40 rounded-lg border border-purple-200 bg-purple-50 flex flex-col items-center justify-center p-3 text-center gap-2">
                    <FileText className="w-7 h-7 text-purple-600" />
                    <span className="font-bold text-purple-950 truncate max-w-full">
                      {userAccount.certificadoOpcionalNombre || 'Certificado.pdf'}
                    </span>
                    <a
                      href={userAccount.certificadoOpcionalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-purple-700"
                    >
                      Ver / Descargar
                    </a>
                  </div>
                )
              ) : (
                <div className="h-40 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                  No adjuntado (Opcional)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 1.6: Fotos de Trabajos Realizados por el Usuario */}
      {userAccount && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" />
              <span>
                Galería de Trabajos Realizados ({(userAccount.fotosTrabajos || []).length})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Fotos reales de obras, reparaciones o instalaciones publicadas por el usuario en su perfil.
            </p>
          </div>

          {(!userAccount.fotosTrabajos || userAccount.fotosTrabajos.length === 0) ? (
            <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl border border-slate-200">
              Este usuario aún no ha subido fotos de trabajos realizados.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {userAccount.fotosTrabajos.map(foto => (
                <div
                  key={foto.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-40 bg-slate-200">
                    <img
                      src={foto.imagenUrl}
                      alt={foto.titulo}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarFotoTrabajoAdmin(userAccount.id, foto.id)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow"
                      title="Eliminar foto de trabajo (Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="font-extrabold text-navy-950">{foto.titulo}</h4>
                    {foto.descripcion && (
                      <p className="text-slate-600 line-clamp-2">{foto.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>{foto.ubicacion || displayUbicacionCompleta}</span>
                      <span>{foto.fecha}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 1.8: Admin 5-Block Compliance, Antecedents, RUC, Driving License & Contracts Inspection */}
      {userAccount && <ExpedienteCumplimientoSection user={userAccount} mode="admin" />}

      {/* Section 2: All Publications by this User / DNI with Direct Accept/Reject */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-sky-600" />
              <span>Publicaciones de Servicio Asociadas ({userPublicaciones.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Revisa todos los parámetros técnicos, tarifas y comprobantes de pago antes de admitir o rechazar.
            </p>
          </div>
        </div>

        {userPublicaciones.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl border border-slate-200">
            Este usuario aún no ha enviado publicaciones de servicio.
          </p>
        ) : (
          <div className="space-y-4">
            {userPublicaciones.map(pub => {
              const isFocused = pub.id === inspectedProfile.servicioId;
              const isApproved = pub.estadoPublicacion === 'APROBADO';
              const isPending = pub.estadoPublicacion === 'PENDIENTE_APROBACION';
              const isRejected = pub.estadoPublicacion === 'RECHAZADO';

              return (
                <div
                  key={pub.id}
                  className={`p-5 rounded-2xl border space-y-3 text-xs ${
                    isFocused
                      ? 'bg-sky-50/50 border-sky-400 ring-2 ring-sky-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isFocused && (
                          <span className="px-2 py-0.5 bg-sky-600 text-white font-extrabold rounded text-[10px] uppercase">
                            Publicación Seleccionada
                          </span>
                        )}
                        <span className="font-mono font-bold text-slate-500">{pub.id}</span>
                        <span className="px-2 py-0.5 bg-navy-900 text-amber-300 font-bold rounded text-[10px] uppercase">
                          {pub.oficioLabel}
                        </span>
                        {isApproved && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Admitida en Catálogo
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente de Admisión
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rechazada
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-extrabold text-navy-950">{pub.titulo}</h4>
                      <p className="text-slate-600 leading-relaxed">{pub.descripcion}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Ofertante / DNI</span>
                          <span className="font-bold text-slate-900 block">{pub.tecnicoNombre}</span>
                          <span className="font-mono text-navy-900">DNI {pub.tecnicoDni}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Contacto & Zona</span>
                          <span className="font-mono font-bold text-emerald-700 block">+51 {pub.tecnicoTelefono}</span>
                          <span className="text-slate-600">{formatUbicacion(pub.distrito, pub.provincia, pub.region)}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Acreditación</span>
                          <span className="font-bold text-slate-800 block">{pub.institucionCertificadora}</span>
                          <span className="font-mono text-[11px] text-slate-500">{pub.codigoCertificado} · {pub.experienciaAnos} años exp.</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Tarifas & Turnos</span>
                          <span className="font-bold text-navy-950 block">
                            Base S/ {pub.precioBase.toFixed(2)} · Cliente S/ {pub.tarifaCliente.toFixed(2)}
                          </span>
                          <span className="text-slate-600">{pub.turnosLibres} turnos libres</span>
                        </div>
                      </div>

                      {pub.pagoPublicacion && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-emerald-900">
                            💳 Pago de Anuncio ({pub.pagoPublicacion.pasarela || 'CULQI'}): {pub.pagoPublicacion.planNombre} ({pub.pagoPublicacion.metodoPago})
                          </span>
                          <span className="font-mono font-bold text-emerald-800">
                            S/ {pub.pagoPublicacion.montoPagado.toFixed(2)} · {pub.pagoPublicacion.codigoAutorizacion}
                          </span>
                        </div>
                      )}

                      {pub.motivoRechazo && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                          <strong>Motivo de Rechazo:</strong> {pub.motivoRechazo}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px] shrink-0">
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => admitirPublicacion(pub.id)}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Admitir y Publicar</span>
                        </button>
                      )}
                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => setRechazoId(rechazoId === pub.id ? null : pub.id)}
                          className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{isApproved ? 'Retirar / Observar' : 'Rechazar Anuncio'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {rechazoId === pub.id && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={motivoRechazo}
                        onChange={e => setMotivoRechazo(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-rose-300 rounded-lg focus:outline-none"
                        placeholder="Indica el motivo del rechazo..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          rechazarPublicacion(pub.id, motivoRechazo);
                          setRechazoId(null);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
                      >
                        Confirmar Rechazo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Certificates & Linked Escrow Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Acreditaciones y Certificados ({userCertificados.length})</span>
          </h3>
          {userCertificados.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              No figuran diplomas adicionales en el padrón oficial para este perfil.
            </p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {userCertificados.map(cert => (
                <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950">{cert.institucion}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {cert.estado}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">{cert.especialidad}</div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {cert.codigoRegistro} · {cert.horasCapacitacion} hrs · {cert.vigencia}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Órdenes y Contratos Vinculados ({userOrdenes.length})</span>
          </h3>
          {userOrdenes.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              No hay órdenes Escrow asociadas a este usuario o DNI todavía.
            </p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {userOrdenes.map(ord => (
                <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-navy-950">{ord.id}</span>
                    <span className="font-bold text-navy-950">S/ {ord.total.toFixed(2)}</span>
                  </div>
                  <div className="text-slate-600">
                    Cliente: <strong>{ord.datosVisita.clienteNombre}</strong> (DNI {ord.datosVisita.clienteDni || 'N/D'})
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{ord.fecha}</span>
                    <span className="font-mono font-bold text-sky-700">{ord.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Household Incidents published by this user */}
      {userImprevistos.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Home className="w-4 h-4 text-amber-600" />
            <span>Imprevistos en Casa Publicados ({userImprevistos.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {userImprevistos.map(imp => (
              <div key={imp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-500">{imp.id}</span>
                  <span className="px-2 py-0.5 bg-navy-900 text-amber-300 font-bold rounded text-[10px]">
                    {imp.estado}
                  </span>
                </div>
                <h4 className="font-extrabold text-navy-950">{imp.titulo}</h4>
                <p className="text-slate-600">{imp.ofertas.length} cotización(es) recibidas · {imp.imagenes.length} foto(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
