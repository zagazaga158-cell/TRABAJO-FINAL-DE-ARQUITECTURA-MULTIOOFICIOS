import React, { useState, useEffect } from 'react';
import { useConecta } from '../context/ConectaContext';
import { CATEGORIAS_OFICIO, GRUPOS_OFICIO, OficioType, Servicio, TipoDocumentoIdentidad, TipoUsuario, ResenaPublicacion } from '../types';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { ExpedienteCumplimientoSection } from './ExpedienteCumplimientoSection';
import { formatUbicacion, inferUbicacionPeru } from '../data/peruUbigeo';
import {
  compressImageToDataUrl,
  readCertificateFile,
  readPersonVideoFile
} from '../utils/mediaUpload';
import {
  User,
  ShieldAlert,
  Mail,
  CreditCard,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  LogOut,
  Megaphone,
  Search,
  PackageCheck,
  FileCheck2,
  Users,
  Wallet,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Pencil,
  Save,
  X,
  AlertCircle,
  Lock,
  Camera,
  Video,
  FileText,
  Home,
  Wrench,
  ImagePlus,
  Trash2,
  Maximize2,
  Eye,
  Star,
  MessageSquare
} from 'lucide-react';

export const PerfilView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    setActiveTab,
    setAdminTab,
    cerrarSesion,
    actualizarMiPerfil,
    actualizarVerificacionMedia,
    agregarFotoTrabajoPerfil,
    eliminarFotoTrabajoPerfil,
    verPerfilPublico,
    setPedidoEnDetalleId,
    responderDisponibilidadOrden,
    actualizarEstadoOrdenManual,
    editarMiPublicacion,
    servicios,
    ordenes,
    usuarios,
    correosPermitidos,
    publicacionesPendientesCount,
    usuariosPendientesCount,
    billeteraTecnico,
    totalItemsEnCarrito,
    imprevistos,
    abrirChatDirecto
  } = useConecta();

  const isAdmin = currentRole === 'ADMIN';
  const estadoCuenta = currentUser?.estadoCuenta || 'ACTIVO';
  const estadoMedia = currentUser?.estadoVerificacionMedia || 'SIN_ADJUNTOS';

  // Profile edit state
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [pNombre, setPNombre] = useState(currentUser?.nombreCompleto || '');
  const [pEmail, setPEmail] = useState(currentUser?.email || '');
  const [pTipoDoc, setPTipoDoc] = useState<TipoDocumentoIdentidad>(currentUser?.tipoDocumento || 'DNI');
  const [pDni, setPDni] = useState(currentUser?.dni || '');
  const [pTelefono, setPTelefono] = useState(currentUser?.telefonoWhatsapp || '');
  const initialUserLoc = inferUbicacionPeru(
    currentUser?.distrito || 'Miraflores',
    currentUser?.provincia,
    currentUser?.region
  );
  const [pRegion, setPRegion] = useState<string>(initialUserLoc.region);
  const [pProvincia, setPProvincia] = useState<string>(initialUserLoc.provincia);
  const [pDistrito, setPDistrito] = useState<string>(initialUserLoc.distrito);
  const [pDireccion, setPDireccion] = useState(currentUser?.direccion || '');
  const [pEspecialidad, setPEspecialidad] = useState(currentUser?.especialidadPrincipal || '');
  const [pTipoUsuario, setPTipoUsuario] = useState<TipoUsuario>(currentUser?.tipoUsuario || 'AMBOS');
  const [pPassword, setPPassword] = useState('');
  const [perfilError, setPerfilError] = useState<string | null>(null);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);

  // Publication edit state
  const [editandoPubId, setEditandoPubId] = useState<string | null>(null);
  const [pubOficio, setPubOficio] = useState<OficioType>('ELECTRICIDAD');
  const [pubTitulo, setPubTitulo] = useState('');
  const [pubDescripcion, setPubDescripcion] = useState('');
  const [pubTecnicoNombre, setPubTecnicoNombre] = useState('');
  const [pubTecnicoDni, setPubTecnicoDni] = useState('');
  const [pubTecnicoTelefono, setPubTecnicoTelefono] = useState('');
  const [pubTecnicoEmail, setPubTecnicoEmail] = useState('');
  const [pubInstitucion, setPubInstitucion] = useState('');
  const [pubCodigoCert, setPubCodigoCert] = useState('');
  const [pubPrecioBase, setPubPrecioBase] = useState<number>(60);
  const [pubTurnos, setPubTurnos] = useState<number>(5);
  const [pubExp, setPubExp] = useState<number>(3);
  const [pubRegion, setPubRegion] = useState<string>('Lima');
  const [pubProvincia, setPubProvincia] = useState<string>('Lima');
  const [pubDistrito, setPubDistrito] = useState<string>('Miraflores');
  const [pubHabilidades, setPubHabilidades] = useState('');
  const [pubError, setPubError] = useState<string | null>(null);

  // Completed work photos gallery state
  const [trabajoPendientes, setTrabajoPendientes] = useState<{ url: string; fileName: string }[]>([]);
  const [trabajoTitulo, setTrabajoTitulo] = useState('');
  const [trabajoOficio, setTrabajoOficio] = useState<OficioType>('ELECTRICIDAD');
  const [trabajoUbicacion, setTrabajoUbicacion] = useState(
    formatUbicacion(initialUserLoc.distrito, initialUserLoc.provincia, initialUserLoc.region)
  );
  const [trabajoDescripcion, setTrabajoDescripcion] = useState('');
  const [trabajoError, setTrabajoError] = useState<string | null>(null);
  const [lightboxTrabajo, setLightboxTrabajo] = useState<{ url: string; titulo: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const loc = inferUbicacionPeru(currentUser.distrito, currentUser.provincia, currentUser.region);
    setPNombre(currentUser.nombreCompleto);
    setPEmail(currentUser.email);
    setPTipoDoc(currentUser.tipoDocumento || 'DNI');
    setPDni(currentUser.dni);
    setPTelefono(currentUser.telefonoWhatsapp);
    setPRegion(loc.region);
    setPProvincia(loc.provincia);
    setPDistrito(loc.distrito);
    setPDireccion(currentUser.direccion);
    setPEspecialidad(currentUser.especialidadPrincipal || '');
    setPTipoUsuario(currentUser.tipoUsuario || 'AMBOS');
    setPPassword('');
    setPerfilError(null);
    setEditandoPerfil(false);
    setEditandoPubId(null);
  }, [currentUser]);

  if (!currentUser) return null;

  const misAnuncios = servicios.filter(
    s => s.autorUsuarioId === currentUser.id || s.tecnicoDni === currentUser.dni
  );
  const misOrdenes = ordenes.filter(
    o => o.clienteUsuarioId === currentUser.id || o.datosVisita.clienteDni === currentUser.dni
  );
  const ordenesRecibidasTrabajador = ordenes.filter(o =>
    o.items.some(
      it =>
        it.servicio.autorUsuarioId === currentUser.id ||
        (Boolean(currentUser.dni) && it.servicio.tecnicoDni === currentUser.dni)
    )
  );
  const ordenesRecibidasPendientes = ordenesRecibidasTrabajador.filter(
    o => (!o.aceptacionTrabajador || o.aceptacionTrabajador === 'PENDIENTE') && o.estado !== 'CONFORMIDAD_Y_LIBERADO'
  );
  const misImprevistosCount = imprevistos.filter(i => i.autorUsuarioId === currentUser.id).length;

  const tipoUsuarioLabel =
    (currentUser.tipoUsuario || 'AMBOS') === 'CLIENTE_HOGAR'
      ? '🏠 Cliente / Hogar (Publica Imprevistos)'
      : (currentUser.tipoUsuario || 'AMBOS') === 'OFERTANTE_OFICIO'
      ? '🛠️ Persona de Oficio (Ofrece Servicios)'
      : '⚡ Cliente Hogar + Persona de Oficio';

  const handleGuardarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilError(null);
    const res = actualizarMiPerfil({
      tipoDocumento: pTipoDoc,
      dni: pDni,
      nombreCompleto: pNombre,
      email: pEmail,
      telefonoWhatsapp: pTelefono,
      region: pRegion,
      provincia: pProvincia,
      distrito: pDistrito,
      direccion: pDireccion,
      especialidadPrincipal: pEspecialidad,
      tipoUsuario: pTipoUsuario,
      password: pPassword
    });
    if (!res.ok) {
      setPerfilError(res.error || 'No se pudo actualizar tu perfil.');
    } else {
      setEditandoPerfil(false);
      setPPassword('');
    }
  };

  const handleUploadDniFoto = async (file?: File) => {
    if (!file) return;
    try {
      const url = await compressImageToDataUrl(file);
      actualizarVerificacionMedia({ dniFotoUrl: url });
      setMediaNotice(null);
    } catch (err: any) {
      setMediaNotice(err?.message || 'Error al subir foto del DNI.');
    }
  };

  const handleUploadFotoPersona = async (file?: File) => {
    if (!file) return;
    try {
      const url = await compressImageToDataUrl(file);
      actualizarVerificacionMedia({ fotoPersonaUrl: url });
      setMediaNotice(null);
    } catch (err: any) {
      setMediaNotice(err?.message || 'Error al subir foto personal.');
    }
  };

  const handleUploadVideoPersona = async (file?: File) => {
    if (!file) return;
    try {
      const res = await readPersonVideoFile(file);
      actualizarVerificacionMedia({
        videoPersonaUrl: res.url,
        videoPersonaNombre: res.fileName
      });
      setMediaNotice(
        res.isSessionOnly
          ? `El video "${res.fileName}" supera 2.2 MB y estará disponible para reproducción durante esta sesión.`
          : null
      );
    } catch (err: any) {
      setMediaNotice(err?.message || 'Error al subir video de verificación.');
    }
  };

  const handleUploadCertificado = async (file?: File) => {
    if (!file) return;
    try {
      const res = await readCertificateFile(file);
      actualizarVerificacionMedia({
        certificadoOpcionalUrl: res.url,
        certificadoOpcionalNombre: res.fileName
      });
      setMediaNotice(res.warning || null);
    } catch (err: any) {
      setMediaNotice(err?.message || 'Error al subir certificado opcional.');
    }
  };

  const handleSelectFotosTrabajo = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setTrabajoError(null);
    const selected = Array.from(files).slice(0, 6);
    try {
      const processed = await Promise.all(
        selected.map(async f => ({
          url: await compressImageToDataUrl(f, 960, 0.78),
          fileName: f.name
        }))
      );
      setTrabajoPendientes(prev => [...prev, ...processed].slice(0, 6));
      if (!trabajoTitulo.trim() && selected[0]) {
        const cleanName = selected[0].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
        setTrabajoTitulo(cleanName.slice(0, 60));
      }
    } catch (err: any) {
      setTrabajoError(err?.message || 'No se pudieron procesar las fotos de trabajo.');
    }
  };

  const handleGuardarFotosTrabajo = (e: React.FormEvent) => {
    e.preventDefault();
    setTrabajoError(null);
    if (trabajoPendientes.length === 0) {
      setTrabajoError('Selecciona al menos una foto de un trabajo que hayas realizado.');
      return;
    }
    if (!trabajoTitulo.trim()) {
      setTrabajoError('Ingresa un título breve para describir el trabajo realizado.');
      return;
    }

    let okCount = 0;
    for (let i = 0; i < trabajoPendientes.length; i++) {
      const item = trabajoPendientes[i];
      const tituloFinal =
        trabajoPendientes.length > 1
          ? `${trabajoTitulo.trim()} (${i + 1}/${trabajoPendientes.length})`
          : trabajoTitulo.trim();
      const res = agregarFotoTrabajoPerfil({
        imagenUrl: item.url,
        titulo: tituloFinal,
        descripcion: trabajoDescripcion.trim() || undefined,
        oficio: trabajoOficio,
        ubicacion:
          trabajoUbicacion.trim() ||
          formatUbicacion(currentUser.distrito, currentUser.provincia, currentUser.region)
      });
      if (res.ok) okCount++;
      else {
        setTrabajoError(res.error || 'No se pudo guardar una de las fotos.');
        break;
      }
    }

    if (okCount > 0) {
      setTrabajoPendientes([]);
      setTrabajoTitulo('');
      setTrabajoDescripcion('');
    }
  };

  const startEditarPublicacion = (pub: Servicio) => {
    const loc = inferUbicacionPeru(pub.distrito, pub.provincia, pub.region);
    setEditandoPubId(pub.id);
    setPubOficio(pub.oficio);
    setPubTitulo(pub.titulo);
    setPubDescripcion(pub.descripcion);
    setPubTecnicoNombre(pub.tecnicoNombre);
    setPubTecnicoDni(pub.tecnicoDni);
    setPubTecnicoTelefono(pub.tecnicoTelefono);
    setPubTecnicoEmail(pub.tecnicoEmail || currentUser?.email || '');
    setPubInstitucion(pub.institucionCertificadora);
    setPubCodigoCert(pub.codigoCertificado);
    setPubPrecioBase(pub.precioBase);
    setPubTurnos(pub.turnosLibres);
    setPubExp(pub.experienciaAnos);
    setPubRegion(loc.region);
    setPubProvincia(loc.provincia);
    setPubDistrito(loc.distrito);
    setPubHabilidades(pub.habilidades.join(', '));
    setPubError(null);
  };

  const handleGuardarPublicacion = (e: React.FormEvent, pubId: string) => {
    e.preventDefault();
    setPubError(null);
    const res = editarMiPublicacion(pubId, {
      oficio: pubOficio,
      titulo: pubTitulo,
      descripcion: pubDescripcion,
      tecnicoNombre: pubTecnicoNombre,
      tecnicoDni: pubTecnicoDni,
      tecnicoTelefono: pubTecnicoTelefono,
      tecnicoEmail: pubTecnicoEmail,
      institucionCertificadora: pubInstitucion,
      codigoCertificado: pubCodigoCert,
      precioBase: Number(pubPrecioBase),
      turnosLibres: Number(pubTurnos),
      experienciaAnos: Number(pubExp),
      region: pubRegion,
      provincia: pubProvincia,
      distrito: pubDistrito,
      habilidades: pubHabilidades
        .split(',')
        .map(h => h.trim())
        .filter(Boolean)
    });
    if (!res.ok) {
      setPubError(res.error || 'No se pudo actualizar la publicación.');
    } else {
      setEditandoPubId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Main Profile Banner Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg border relative overflow-hidden ${
          isAdmin
            ? 'bg-gradient-to-br from-sky-950 via-navy-950 to-slate-900 border-sky-800'
            : 'bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {currentUser.fotoPersonaUrl ? (
              <img
                src={currentUser.fotoPersonaUrl}
                alt={currentUser.nombreCompleto}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xl ring-4 ring-amber-400/35 shrink-0"
              />
            ) : (
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-xl shrink-0 ${
                  isAdmin
                    ? 'bg-sky-500 text-white ring-4 ring-sky-400/25'
                    : 'bg-amber-400 text-navy-950 ring-4 ring-amber-400/25'
                }`}
              >
                {isAdmin ? <ShieldAlert className="w-9 h-9" /> : <User className="w-9 h-9" />}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider ${
                    isAdmin ? 'bg-sky-500 text-white' : 'bg-amber-400 text-navy-950'
                  }`}
                >
                  {isAdmin ? 'Perfil de Administrador Único' : 'Perfil de Usuario'}
                </span>
                <span className="text-xs font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  ID: {currentUser.id}
                </span>
                {estadoCuenta === 'ACTIVO' ? (
                  <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                    ✓ Cuenta Aceptada
                  </span>
                ) : (
                  <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                    ⏳ Pendiente de Aceptación Admin
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {currentUser.nombreCompleto}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono">{currentUser.email}</span>
                <span className="text-emerald-400 font-semibold text-[11px]">· Atributos asignados por correo permitido</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('portal');
                  setAdminTab('publicaciones');
                }}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Abrir Consola Admin</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('imprevistos')}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>Imprevistos Hogar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('publicar')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Publicar Servicio</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={cerrarSesion}
              className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Acceptance Alert for newly registered users */}
      {!isAdmin && estadoCuenta === 'PENDIENTE' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm">Cuenta Pendiente de Aceptación por el Administrador</strong>
            <p className="mt-0.5 text-amber-900">
              Tu registro fue recibido. Puedes completar o editar tus datos completos aquí abajo; en cuanto el Administrador acepte tu cuenta, podrás publicar anuncios pagados en el catálogo.
            </p>
          </div>
        </div>
      )}

      {/* Personal & Complete Account Information Card (Editable) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mis Datos Completos (Editables)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mantén tus datos completos actualizados para tus publicaciones, contratos y contactos directos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditandoPerfil(!editandoPerfil);
              setPerfilError(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
              editandoPerfil
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-navy-900 hover:bg-navy-950 text-white shadow-xs'
            }`}
          >
            {editandoPerfil ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Cancelar Edición</span>
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5 text-amber-300" />
                <span>Editar Mis Datos</span>
              </>
            )}
          </button>
        </div>

        {!editandoPerfil ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5" /> Nombres y Apellidos
              </span>
              <span className="font-extrabold text-sm text-navy-950">{currentUser.nombreCompleto}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5" /> Documento ({currentUser.tipoDocumento || 'DNI'})
              </span>
              <span className="font-mono font-extrabold text-sm text-navy-950">{currentUser.dni}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5" /> Correo Electrónico Permitido
              </span>
              <span className="font-mono font-bold text-sm text-navy-950 break-all">{currentUser.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Celular / WhatsApp
              </span>
              <span className="font-mono font-bold text-sm text-emerald-700">+51 {currentUser.telefonoWhatsapp}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5" /> Región / Provincia / Distrito y Dirección
              </span>
              <span className="font-bold text-slate-800 block">
                {formatUbicacion(currentUser.distrito, currentUser.provincia, currentUser.region)}
              </span>
              <span className="text-slate-600">{currentUser.direccion}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <Briefcase className="w-3.5 h-3.5" /> Modalidad, Especialidad & Registro
              </span>
              <span className="font-extrabold text-navy-950 block">{tipoUsuarioLabel}</span>
              <span className="text-slate-700 block mt-0.5">
                {currentUser.especialidadPrincipal || 'General'}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> {currentUser.fechaRegistro}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGuardarPerfil} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombres y Apellidos Completos *
                </label>
                <input
                  type="text"
                  value={pNombre}
                  onChange={e => setPNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Documento ({pTipoDoc}) *
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={pTipoDoc}
                    onChange={e => setPTipoDoc(e.target.value as TipoDocumentoIdentidad)}
                    className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">C.E.</option>
                    <option value="PASAPORTE">PAS</option>
                  </select>
                  <input
                    type="text"
                    value={pDni}
                    onChange={e =>
                      setPDni(
                        pTipoDoc === 'DNI'
                          ? e.target.value.replace(/\D/g, '').slice(0, 8)
                          : e.target.value.toUpperCase().slice(0, 15)
                      )
                    }
                    maxLength={15}
                    className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo Electrónico (Acceso y Solicitudes) *
                </label>
                <input
                  type="email"
                  value={pEmail}
                  onChange={e => setPEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Celular / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={pTelefono}
                  onChange={e => setPTelefono(e.target.value)}
                  maxLength={15}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <PeruUbigeoSelector
                  mode="form"
                  compact
                  region={pRegion}
                  provincia={pProvincia}
                  distrito={pDistrito}
                  onChange={({ region, provincia, distrito }) => {
                    setPRegion(region);
                    setPProvincia(provincia);
                    setPDistrito(distrito);
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalidad de Uso *
                </label>
                <select
                  value={pTipoUsuario}
                  onChange={e => setPTipoUsuario(e.target.value as TipoUsuario)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                >
                  <option value="CLIENTE_HOGAR">🏠 Cliente / Hogar (Publicar Imprevistos)</option>
                  <option value="OFERTANTE_OFICIO">🛠️ Persona de Oficio (Ofrecer Servicios)</option>
                  <option value="AMBOS">⚡ Ambos Roles (Hogar + Oficio)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Especialidad / Oficio Principal
                </label>
                <input
                  type="text"
                  value={pEspecialidad}
                  onChange={e => setPEspecialidad(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección Exacta / Domicilio *
                </label>
                <input
                  type="text"
                  value={pDireccion}
                  onChange={e => setPDireccion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Nueva Contraseña (Opcional)
                </label>
                <input
                  type="password"
                  value={pPassword}
                  onChange={e => setPPassword(e.target.value)}
                  placeholder="Dejar vacío para mantener"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            {perfilError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{perfilError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditandoPerfil(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Mis Datos Completos</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Identity Verification Media Section (DNI Foto, Foto Persona, Video Persona, Certificado Opcional) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-600" />
              <span>Verificación de Identidad y Multimedia (DNI · Foto · Video · Certificado Opcional)</span>
            </h3>
            <p className="text-xs text-slate-500">
              🔒 <strong>Privado:</strong> estos archivos (DNI · Foto · Video · Certificado Opcional) solo los puedes ver <strong>tú (propietario)</strong> y el <strong>Administrador</strong>.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase self-start sm:self-auto ${
              estadoMedia === 'VERIFICADO'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : estadoMedia === 'PENDIENTE_REVISION'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : estadoMedia === 'OBSERVADO'
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {estadoMedia === 'VERIFICADO'
              ? '✓ Verificado por Admin'
              : estadoMedia === 'PENDIENTE_REVISION'
              ? '⏳ En Revisión Admin'
              : estadoMedia === 'OBSERVADO'
              ? '⚠ Observado por Admin'
              : 'Sin archivos adjuntos'}
          </span>
        </div>

        {currentUser.observacionVerificacion && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Observación del Administrador:</strong> {currentUser.observacionVerificacion}
            </div>
          </div>
        )}

        {mediaNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            {mediaNotice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Foto de la Persona */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2.5">
            <div>
              <span className="font-bold text-navy-950 flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>Foto de la Persona</span>
              </span>
              {currentUser.fotoPersonaUrl ? (
                <img
                  src={currentUser.fotoPersonaUrl}
                  alt="Foto de la persona"
                  className="w-full h-36 object-cover rounded-lg border border-slate-300"
                />
              ) : (
                <div className="w-full h-36 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 text-center px-3">
                  Sin foto personal subida
                </div>
              )}
            </div>
            <label className="block cursor-pointer py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-center">
              {currentUser.fotoPersonaUrl ? 'Actualizar Foto' : 'Subir Foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleUploadFotoPersona(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* 2. DNI + Foto DNI */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2.5">
            <div>
              <span className="font-bold text-navy-950 flex items-center gap-1.5 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>DNI ({currentUser.dni})</span>
              </span>
              {currentUser.dniFotoUrl ? (
                <img
                  src={currentUser.dniFotoUrl}
                  alt="Foto de DNI"
                  className="w-full h-36 object-cover rounded-lg border border-slate-300"
                />
              ) : (
                <div className="w-full h-36 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 text-center px-3">
                  Sin foto de DNI subida
                </div>
              )}
            </div>
            <label className="block cursor-pointer py-2 px-3 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold rounded-lg text-center">
              {currentUser.dniFotoUrl ? 'Actualizar Foto DNI' : 'Subir Foto DNI'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleUploadDniFoto(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* 3. Video de la Persona */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2.5">
            <div>
              <span className="font-bold text-navy-950 flex items-center gap-1.5 mb-2">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                <span>Video de la Persona</span>
              </span>
              {currentUser.videoPersonaUrl ? (
                <video
                  src={currentUser.videoPersonaUrl}
                  controls
                  className="w-full h-36 rounded-lg bg-black object-contain border border-slate-300"
                />
              ) : (
                <div className="w-full h-36 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 text-center px-3">
                  Sin video personal subido
                </div>
              )}
            </div>
            <label className="block cursor-pointer py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center">
              {currentUser.videoPersonaUrl ? 'Actualizar Video' : 'Subir Video'}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => handleUploadVideoPersona(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* 4. Certificado Opcional de lo que hace */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2.5">
            <div>
              <span className="font-bold text-navy-950 flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Certificado (Opcional)</span>
              </span>
              {currentUser.certificadoOpcionalUrl ? (
                currentUser.certificadoOpcionalUrl.startsWith('data:image/') ? (
                  <img
                    src={currentUser.certificadoOpcionalUrl}
                    alt="Certificado opcional"
                    className="w-full h-36 object-cover rounded-lg border border-slate-300"
                  />
                ) : (
                  <div className="w-full h-36 rounded-lg border border-purple-200 bg-purple-50 flex flex-col items-center justify-center text-purple-900 p-3 text-center gap-2">
                    <FileText className="w-7 h-7 text-purple-600" />
                    <span className="font-bold truncate max-w-full">
                      {currentUser.certificadoOpcionalNombre || 'Certificado.pdf'}
                    </span>
                    <a
                      href={currentUser.certificadoOpcionalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] underline font-bold text-purple-700"
                    >
                      Abrir documento
                    </a>
                  </div>
                )
              ) : (
                <div className="w-full h-36 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 text-center px-3">
                  Opcional: Diploma o certificado de oficio
                </div>
              )}
            </div>
            <label className="block cursor-pointer py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-center">
              {currentUser.certificadoOpcionalUrl ? 'Actualizar Certificado' : 'Subir Certificado'}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => handleUploadCertificado(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Fotos de Trabajos Realizados Gallery & Upload */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-amber-500" />
              <span>
                Galería de Fotos de Trabajos Realizados ({(currentUser.fotosTrabajos || []).length})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Sube fotos reales de trabajos, reparaciones, acabados o instalaciones que hiciste. Estas fotos acreditan tu experiencia y son visibles para el Administrador en tu perfil.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                verPerfilPublico({
                  userId: currentUser.id,
                  dni: currentUser.dni,
                  nombre: currentUser.nombreCompleto
                })
              }
              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Vista Admin del Perfil</span>
            </button>
          )}
        </div>

        {/* Upload New Work Photos Form */}
        <form
          onSubmit={handleGuardarFotosTrabajo}
          className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Título del Trabajo Realizado *
              </label>
              <input
                type="text"
                value={trabajoTitulo}
                onChange={e => setTrabajoTitulo(e.target.value)}
                placeholder="Ej. Tablero eléctrico renovado / Mueble de melamina instalado"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Especialidad</label>
              <select
                value={trabajoOficio}
                onChange={e => setTrabajoOficio(e.target.value as OficioType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
              >
                {GRUPOS_OFICIO.map(grupo => (
                  <optgroup key={grupo.id} label={`${grupo.icon} ${grupo.nombre}`}>
                    {CATEGORIAS_OFICIO.filter(c => c.grupoId === grupo.id).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ciudad / Distrito</label>
              <input
                type="text"
                value={trabajoUbicacion}
                onChange={e => setTrabajoUbicacion(e.target.value)}
                placeholder="Ej. Miraflores, Lima"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block font-bold text-slate-700 mb-1">
                Detalle del Trabajo (Opcional)
              </label>
              <input
                type="text"
                value={trabajoDescripcion}
                onChange={e => setTrabajoDescripcion(e.target.value)}
                placeholder="Describe brevemente qué materiales usaste, cuánto duró o el resultado entregado..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label className="cursor-pointer px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold rounded-xl inline-flex items-center justify-center gap-2 shadow-xs">
              <ImagePlus className="w-4 h-4" />
              <span>
                {trabajoPendientes.length > 0
                  ? `+ Agregar más fotos (${trabajoPendientes.length} listas)`
                  : 'Seleccionar Foto(s) del Trabajo'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleSelectFotosTrabajo(e.target.files)}
              />
            </label>

            {trabajoPendientes.length > 0 && (
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar {trabajoPendientes.length} Foto(s) en Mi Perfil</span>
              </button>
            )}
          </div>

          {trabajoPendientes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
              {trabajoPendientes.map((item, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-300 bg-white">
                  <img src={item.url} alt={item.fileName} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => setTrabajoPendientes(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full shadow"
                    title="Quitar foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {trabajoError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trabajoError}</span>
            </div>
          )}
        </form>

        {/* Uploaded Work Photos Grid */}
        {(!currentUser.fotosTrabajos || currentUser.fotosTrabajos.length === 0) ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 text-center text-xs text-slate-500">
            Todavía no has subido fotos de trabajos realizados. Selecciona fotos arriba para mostrar tu experiencia a los clientes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentUser.fotosTrabajos.map(foto => {
              const catMeta = CATEGORIAS_OFICIO.find(c => c.id === foto.oficio);
              return (
                <div
                  key={foto.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative h-44 bg-slate-200 overflow-hidden">
                    <img
                      src={foto.imagenUrl}
                      alt={foto.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setLightboxTrabajo({ url: foto.imagenUrl, titulo: foto.titulo })}
                      className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Ampliar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarFotoTrabajoPerfil(foto.id)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow"
                      title="Eliminar foto de trabajo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      {catMeta && (
                        <span className="px-2 py-0.5 bg-navy-900 text-amber-300 rounded font-bold text-[10px]">
                          {catMeta.shortLabel}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 ml-auto">{foto.fecha}</span>
                    </div>
                    <h4 className="font-extrabold text-navy-950">{foto.titulo}</h4>
                    {foto.descripcion && (
                      <p className="text-slate-600 leading-snug line-clamp-2">{foto.descripcion}</p>
                    )}
                    {foto.ubicacion && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {foto.ubicacion}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5-Block Compliance Dossier: Identidad/Emergencia, RUC, Antecedentes, Licencias y Contratos */}
      {!isAdmin && <ExpedienteCumplimientoSection user={currentUser} mode="owner" />}

      {/* Role-Specific Dashboard Summary */}
      {isAdmin ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Anuncios Pendientes</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{publicacionesPendientesCount}</span>
              <p className="text-[11px] text-slate-500 mt-1">Por admitir o rechazar</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Usuarios por Aceptar</span>
              <span className="text-2xl font-black text-navy-950 mt-1 block">
                {usuariosPendientesCount} <span className="text-xs font-semibold text-slate-400">/ {usuarios.length} total</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Gestión de altas y cuentas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Reglas de Correo</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{correosPermitidos.length}</span>
              <p className="text-[11px] text-slate-500 mt-1">Dominios/correos permitidos</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Custodia + Anuncios</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block">
                S/ {(billeteraTecnico.fondosEnCustodia + billeteraTecnico.ingresosPublicaciones).toFixed(2)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Control financiero global</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-navy-950 mb-4">Accesos Directos de Administración</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('portal');
                  setAdminTab('publicaciones');
                }}
                className="p-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <FileCheck2 className="w-5 h-5 text-sky-600 mb-1.5" />
                  <span className="font-bold text-navy-950 block">Admitir Anuncios</span>
                  <span className="text-[11px] text-slate-600">{publicacionesPendientesCount} pendientes</span>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('portal');
                  setAdminTab('usuarios');
                }}
                className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <Users className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <span className="font-bold text-navy-950 block">Aceptar y Gestionar Usuarios</span>
                  <span className="text-[11px] text-slate-600">{usuariosPendientesCount} pendientes · {correosPermitidos.length} correos</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('portal');
                  setAdminTab('billetera');
                }}
                className="p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <Wallet className="w-5 h-5 text-amber-600 mb-1.5" />
                  <span className="font-bold text-navy-950 block">Billetera & Órdenes</span>
                  <span className="text-[11px] text-slate-600">{ordenes.length} contratos Escrow</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('portal');
                  setAdminTab('certificados');
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <Award className="w-5 h-5 text-navy-900 mb-1.5" />
                  <span className="font-bold text-navy-950 block">Diplomas y Turnos</span>
                  <span className="text-[11px] text-slate-600">SENATI / SENCICO / CAPECO</span>
                </div>
                <ArrowRight className="w-4 h-4 text-navy-900" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* User KPIs + Quick Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('catalogo')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left hover:border-navy-900 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Explorar Especialistas</span>
                <span className="text-lg font-black text-navy-950 mt-1 block">Catálogo de Servicios</span>
                <span className="text-[11px] text-slate-500">Contrata o contacta directo</span>
              </div>
              <Search className="w-6 h-6 text-amber-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('imprevistos')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Siniestros en Casa</span>
                <span className="text-lg font-black text-navy-950 mt-1 block">
                  Imprevistos ({misImprevistosCount} míos)
                </span>
                <span className="text-[11px] text-slate-500">Publicar fotos u ofrecer costo</span>
              </div>
              <Wrench className="w-6 h-6 text-emerald-600 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('publicar')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left hover:border-amber-400 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Mis Publicaciones</span>
                <span className="text-lg font-black text-navy-950 mt-1 block">{misAnuncios.length} anuncio(s)</span>
                <span className="text-[11px] text-slate-500">Publicar nuevo servicio con DNI</span>
              </div>
              <Megaphone className="w-6 h-6 text-amber-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ordenes')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Mis Órdenes y Solicitud</span>
                <span className="text-lg font-black text-navy-950 mt-1 block">
                  {misOrdenes.length + ordenesRecibidasTrabajador.length} orden(es) · {totalItemsEnCarrito} en carrito
                </span>
                <span className="text-[11px] text-slate-500">
                  {ordenesRecibidasPendientes.length > 0
                    ? `${ordenesRecibidasPendientes.length} por aceptar horario`
                    : 'Revisar encargos y horarios'}
                </span>
              </div>
              <PackageCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            </button>
          </div>

          {/* Incoming Orders for Worker: Full Requester Details + Ver Pedido + Accept/Reject */}
          {ordenesRecibidasTrabajador.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                <div>
                  <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>
                      Pedidos Recibidos para Tu Oficio ({ordenesRecibidasTrabajador.length} total · {ordenesRecibidasPendientes.length} por responder)
                    </span>
                  </h3>
                  <p className="text-xs text-amber-900">
                    Visualiza todos los datos del solicitante, ubicación y hora. Solo tú como persona del oficio puedes aceptar o rechazar el pedido (Sin cobros: S/ 0.00).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ordenes')}
                  className="px-3 py-1.5 bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold rounded-xl self-start sm:self-auto"
                >
                  Abrir Mis Órdenes
                </button>
              </div>

              <div className="space-y-3">
                {[...ordenesRecibidasTrabajador]
                  .sort((a, b) => {
                    const aPend = !a.aceptacionTrabajador || a.aceptacionTrabajador === 'PENDIENTE' ? 0 : 1;
                    const bPend = !b.aceptacionTrabajador || b.aceptacionTrabajador === 'PENDIENTE' ? 0 : 1;
                    return aPend - bPend;
                  })
                  .map(ord => {
                    const estadoAceptacion = ord.aceptacionTrabajador || 'PENDIENTE';
                    const isLiberado = ord.estado === 'CONFORMIDAD_Y_LIBERADO';
                    return (
                      <div
                        key={ord.id}
                        className={`p-4 bg-white rounded-xl border space-y-3 text-xs ${
                          estadoAceptacion === 'PENDIENTE'
                            ? 'border-amber-300 ring-1 ring-amber-200'
                            : estadoAceptacion === 'ACEPTADA'
                            ? 'border-emerald-300'
                            : 'border-rose-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-navy-950">{ord.id}</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                Sin cobro (S/ 0.00)
                              </span>
                              {estadoAceptacion === 'PENDIENTE' && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-extrabold text-[10px]">
                                  ⏳ Pendiente de tu decisión
                                </span>
                              )}
                              {estadoAceptacion === 'ACEPTADA' && (
                                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-extrabold text-[10px]">
                                  ✓ Pedido Aceptado
                                </span>
                              )}
                              {estadoAceptacion === 'NO_DISPONIBLE' && (
                                <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-extrabold text-[10px]">
                                  ✕ Pedido Rechazado
                                </span>
                              )}
                            </div>

                            <p className="font-extrabold text-sm text-slate-900">
                              {ord.items.map(it => it.servicio.titulo).join(', ')}
                            </p>

                            {/* Complete Requester & Location Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                              <div>
                                <span className="text-slate-400 font-bold uppercase block text-[10px]">Solicitante:</span>
                                <strong className="text-navy-950">{ord.datosVisita.clienteNombre}</strong>
                                {ord.datosVisita.clienteDni && (
                                  <span className="text-slate-600 font-mono"> · DNI {ord.datosVisita.clienteDni}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold uppercase block text-[10px]">Contacto:</span>
                                <strong className="font-mono text-emerald-800">+51 {ord.datosVisita.telefonoWhatsapp}</strong>
                                {ord.datosVisita.clienteEmail && (
                                  <span className="block font-mono text-indigo-800 truncate">{ord.datosVisita.clienteEmail}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold uppercase block text-[10px]">Fecha y Hora Solicitada:</span>
                                <strong className="text-navy-950">
                                  {ord.datosVisita.fechaVisita || ord.fecha} ·{' '}
                                  {ord.datosVisita.horaVisita ? `${ord.datosVisita.horaVisita} hrs` : ord.datosVisita.turno}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold uppercase block text-[10px]">Domicilio:</span>
                                <strong className="text-navy-950">{ord.datosVisita.direccion}</strong>
                                <span className="block text-slate-600">
                                  {formatUbicacion(ord.datosVisita.distrito, ord.datosVisita.provincia, ord.datosVisita.region)}
                                  {ord.datosVisita.referencia ? ` · Ref: ${ord.datosVisita.referencia}` : ''}
                                </span>
                              </div>
                              {ord.datosVisita.notasAdicionales && (
                                <div className="sm:col-span-2 pt-1 border-t border-slate-200 text-slate-700">
                                  <strong>Notas del encargo:</strong> {ord.datosVisita.notasAdicionales}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPedidoEnDetalleId(ord.id)}
                              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" />
                              <span>Ver Pedido</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const primerSrv = ord.items[0]?.servicio;
                                void abrirChatDirecto({
                                  ordenId: ord.id,
                                  servicioTitulo: primerSrv?.titulo || 'Servicio Técnico',
                                  clienteId: ord.clienteUsuarioId,
                                  clienteNombre: ord.datosVisita.clienteNombre,
                                  clienteDni: ord.datosVisita.clienteDni,
                                  clienteTelefono: ord.datosVisita.telefonoWhatsapp,
                                  trabajadorId: currentUser.id,
                                  trabajadorNombre: primerSrv?.tecnicoNombre || currentUser.nombreCompleto,
                                  trabajadorDni: primerSrv?.tecnicoDni || currentUser.dni,
                                  trabajadorTelefono: primerSrv?.tecnicoTelefono || currentUser.telefonoWhatsapp,
                                  trabajadorAvatar: primerSrv?.tecnicoAvatar,
                                  trabajadorInstitucion: primerSrv?.institucionCertificadora
                                });
                              }}
                              className="px-3.5 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat Cliente</span>
                            </button>
                            {!isLiberado && estadoAceptacion !== 'ACEPTADA' && (
                              <button
                                type="button"
                                onClick={() => responderDisponibilidadOrden(ord.id, 'ACEPTADA')}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                              >
                                ✓ Aceptar Pedido
                              </button>
                            )}
                            {!isLiberado && estadoAceptacion !== 'NO_DISPONIBLE' && (
                              <button
                                type="button"
                                onClick={() =>
                                  responderDisponibilidadOrden(ord.id, 'NO_DISPONIBLE', 'Pedido rechazado / No disponible en ese horario')
                                }
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl"
                              >
                                ✕ Rechazar Pedido
                              </button>
                            )}
                            {estadoAceptacion === 'ACEPTADA' &&
                              (ord.estado === 'EN_CUSTODIA' ||
                                ord.estado === 'EN_CAMINO' ||
                                ord.estado === 'EN_EJECUCION') && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    actualizarEstadoOrdenManual(ord.id, 'COMPLETADO_PENDIENTE_CONFORMIDAD')
                                  }
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Marcar: Trabajo Terminado</span>
                                </button>
                              )}
                            {ord.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD' && (
                              <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-[11px]">
                                ✓ Terminado · Esperando estrellas del cliente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* User's own published ads (with full editing) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-950">Mis Publicaciones de Servicio (Editables)</h3>
                <p className="text-xs text-slate-500">
                  Publicaciones enviadas desde tu cuenta. Puedes editar sus datos completos en cualquier momento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('publicar')}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-navy-950 text-xs font-bold rounded-xl"
              >
                + Nuevo Anuncio
              </button>
            </div>

            {misAnuncios.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Aún no has publicado anuncios de servicio con esta cuenta. Puedes crear uno desde <strong>Publicar Anuncio</strong>.
              </p>
            ) : (
              <div className="space-y-4">
                {misAnuncios.map(pub => {
                  const isEditingThis = editandoPubId === pub.id;
                  return (
                    <div
                      key={pub.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-500">{pub.id}</span>
                            <span className="font-bold text-navy-950">{pub.oficioLabel}</span>
                            {pub.estadoPublicacion === 'APROBADO' && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Admitido en Catálogo
                              </span>
                            )}
                            {pub.estadoPublicacion === 'PENDIENTE_APROBACION' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Pendiente de Admisión
                              </span>
                            )}
                            {pub.estadoPublicacion === 'RECHAZADO' && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Observado
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-navy-950 mt-1">{pub.titulo}</h4>
                          <p className="text-slate-600 mt-0.5">{pub.descripcion}</p>
                          <p className="text-slate-600 mt-1">
                            Especialista: <strong className="text-navy-950">{pub.tecnicoNombre}</strong> · DNI: <strong className="font-mono">{pub.tecnicoDni}</strong> · Tel: <strong className="font-mono">+51 {pub.tecnicoTelefono}</strong>{pub.tecnicoEmail ? <> · Correo: <strong className="font-mono">{pub.tecnicoEmail}</strong></> : null} · Base: <strong>S/ {pub.precioBase.toFixed(2)}</strong> (Cliente: S/ {pub.tarifaCliente.toFixed(2)}) · {formatUbicacion(pub.distrito, pub.provincia, pub.region)}
                          </p>
                          {pub.motivoRechazo && (
                            <p className="mt-1.5 text-rose-700 font-semibold">
                              Observación Admin: {pub.motivoRechazo}
                            </p>
                          )}
                          {(() => {
                            const resenasMap = new Map<string, ResenaPublicacion>();
                            (pub.resenasPublicadas || []).forEach(r => resenasMap.set(r.ordenId, r));
                            ordenes.forEach(o => {
                              if (
                                o.calificacion &&
                                o.items.some(
                                  it =>
                                    it.servicioId === pub.id ||
                                    (Boolean(pub.autorUsuarioId) &&
                                      it.servicio.autorUsuarioId === pub.autorUsuarioId &&
                                      it.servicio.oficio === pub.oficio) ||
                                    (Boolean(pub.tecnicoDni) && it.servicio.tecnicoDni === pub.tecnicoDni)
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
                            const resenasPub = Array.from(resenasMap.values());
                            return (
                              <div className="mt-2.5 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-amber-950 inline-flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                    Valoración en Publicación: {pub.calificacion.toFixed(1)} ★ ({pub.numResenas} reseñas)
                                  </span>
                                </div>
                                {resenasPub.length > 0 && (
                                  <div className="space-y-1.5 pt-1 border-t border-amber-200/70">
                                    {resenasPub.slice(0, 3).map(r => (
                                      <div key={r.ordenId} className="text-[11px] text-slate-800">
                                        <span className="font-bold">{r.autorNombre}</span>{' '}
                                        <span className="text-amber-600 font-bold">{'★'.repeat(r.estrellas)}</span>:{' '}
                                        <span className="italic">"{r.comentario}"</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        <button
                          type="button"
                          onClick={() => (isEditingThis ? setEditandoPubId(null) : startEditarPublicacion(pub))}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-navy-950 font-bold rounded-xl flex items-center gap-1 shrink-0 self-start"
                        >
                          {isEditingThis ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Cerrar</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3.5 h-3.5 text-amber-600" />
                              <span>Editar Publicación</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isEditingThis && (
                        <form
                          onSubmit={e => handleGuardarPublicacion(e, pub.id)}
                          className="p-4 bg-white rounded-xl border border-slate-300 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Oficio *</label>
                              <select
                                value={pubOficio}
                                onChange={e => setPubOficio(e.target.value as OficioType)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                              >
                                {GRUPOS_OFICIO.map(grupo => (
                                  <optgroup key={grupo.id} label={grupo.nombre}>
                                    {CATEGORIAS_OFICIO.filter(c => c.grupoId === grupo.id).map(cat => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block font-semibold text-slate-700 mb-1">Título del Servicio *</label>
                              <input
                                type="text"
                                value={pubTitulo}
                                onChange={e => setPubTitulo(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                                required
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block font-semibold text-slate-700 mb-1">Descripción Detallada *</label>
                              <textarea
                                rows={2}
                                value={pubDescripcion}
                                onChange={e => setPubDescripcion(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Nombre Ofertante *</label>
                              <input
                                type="text"
                                value={pubTecnicoNombre}
                                onChange={e => setPubTecnicoNombre(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">DNI (8 dígitos) *</label>
                              <input
                                type="text"
                                value={pubTecnicoDni}
                                onChange={e => setPubTecnicoDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                maxLength={8}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                              <input
                                type="tel"
                                value={pubTecnicoTelefono}
                                onChange={e => setPubTecnicoTelefono(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Correo para Solicitudes</label>
                              <input
                                type="email"
                                value={pubTecnicoEmail}
                                onChange={e => setPubTecnicoEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Institución Certificadora</label>
                              <input
                                type="text"
                                value={pubInstitucion}
                                onChange={e => setPubInstitucion(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Código Certificado</label>
                              <input
                                type="text"
                                value={pubCodigoCert}
                                onChange={e => setPubCodigoCert(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                              />
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3">
                              <PeruUbigeoSelector
                                mode="form"
                                compact
                                region={pubRegion}
                                provincia={pubProvincia}
                                distrito={pubDistrito}
                                onChange={({ region, provincia, distrito }) => {
                                  setPubRegion(region);
                                  setPubProvincia(provincia);
                                  setPubDistrito(distrito);
                                }}
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Tarifa Base (S/) *</label>
                              <input
                                type="number"
                                min={20}
                                value={pubPrecioBase}
                                onChange={e => setPubPrecioBase(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Turnos Libres</label>
                              <input
                                type="number"
                                min={0}
                                value={pubTurnos}
                                onChange={e => setPubTurnos(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Años de Exp.</label>
                              <input
                                type="number"
                                min={0}
                                value={pubExp}
                                onChange={e => setPubExp(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block font-semibold text-slate-700 mb-1">Habilidades (separadas por coma)</label>
                              <input
                                type="text"
                                value={pubHabilidades}
                                onChange={e => setPubHabilidades(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>

                          {pubError && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{pubError}</span>
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditandoPubId(null)}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Guardar Cambios de Publicación</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {lightboxTrabajo && (
        <div
          onClick={() => setLightboxTrabajo(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-white">
              <span className="text-sm font-bold truncate">{lightboxTrabajo.titulo}</span>
              <button
                type="button"
                onClick={() => setLightboxTrabajo(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxTrabajo.url}
              alt={lightboxTrabajo.titulo}
              className="w-full max-h-[80vh] object-contain bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};
