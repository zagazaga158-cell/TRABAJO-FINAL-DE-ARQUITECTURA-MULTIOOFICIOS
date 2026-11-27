import React, { useState, useEffect } from 'react';
import { useConecta } from '../context/ConectaContext';
import {
  CulqiPaymentReceipt,
  EstadoCuentaUsuario,
  EstadoPublicacion,
  PlanPublicacion,
  PlanPublicacionId,
  UsuarioRegistrado
} from '../types';
import { PeruUbigeoSelector } from './PeruUbigeoSelector';
import { formatUbicacion, inferUbicacionPeru } from '../data/peruUbigeo';
import {
  Wallet,
  Lock,
  Unlock,
  ShieldCheck,
  Calendar,
  Award,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck,
  User,
  MessageSquare,
  PhoneCall,
  Users,
  FileCheck2,
  XCircle,
  Megaphone,
  MapPin,
  Search,
  Mail,
  CreditCard,
  KeyRound,
  X,
  AlertCircle,
  Pencil,
  Trash2,
  Ban,
  Save,
  LogOut,
  Eye,
  Home,
  Camera,
  Video,
  FileText,
  Star,
  Tag,
  RotateCcw,
  Gift
} from 'lucide-react';

export const TecnicoAdminView: React.FC = () => {
  const {
    servicios,
    imprevistos,
    ordenes,
    certificados,
    usuarios,
    billeteraTecnico,
    publicacionesPendientesCount,
    usuariosPendientesCount,
    verificacionesPendientesCount,
    actualizarTurnosServicio,
    actualizarEstadoOrdenManual,
    setShowArchitectureModal,
    setActiveTab,
    cerrarSesion,
    inspeccionarPerfil,
    openWhatsAppChat,
    openCallModal,
    adminTab,
    setAdminTab,
    cambiarEstadoCertificado,
    resolverGarantiaAdmin,
    admitirPublicacion,
    rechazarPublicacion,
    correosPermitidos,
    adminUnico,
    agregarCorreoPermitido,
    eliminarCorreoPermitido,
    cambiarEstadoCuentaUsuario,
    gestionarVerificacionUsuarioAdmin,
    editarUsuarioPorAdmin,
    eliminarUsuarioPorAdmin,
    cambiarEstadoImprevistoAdmin,
    eliminarImprevistoAdmin,
    eliminarOfertaImprevistoAdmin,
    planesPublicacion,
    promoConfig,
    actualizarPlanPublicacionAdmin,
    actualizarPromoConfigAdmin,
    restablecerPlanesPublicacionAdmin
  } = useConecta();

  // Filter & rejection state for Admin moderation queue
  const [filtroPubEstado, setFiltroPubEstado] = useState<'TODAS' | EstadoPublicacion>('TODAS');
  const [rechazoActivoId, setRechazoActivoId] = useState<string | null>(null);
  const [motivoRechazoInput, setMotivoRechazoInput] = useState('Falta verificar código de certificado o ajustar tarifa.');

  // Search filter & management state for registered users directory
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [filtroUsuarioEstado, setFiltroUsuarioEstado] = useState<'TODOS' | EstadoCuentaUsuario>('TODOS');
  const [nuevaReglaCorreo, setNuevaReglaCorreo] = useState('');
  const [reglaCorreoError, setReglaCorreoError] = useState<string | null>(null);

  // Admin inline user edit state
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [uNombre, setUNombre] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uDni, setUDni] = useState('');
  const [uTel, setUTel] = useState('');
  const [uRegion, setURegion] = useState<string>('Lima');
  const [uProvincia, setUProvincia] = useState<string>('Lima');
  const [uDistrito, setUDistrito] = useState<string>('Miraflores');
  const [uDir, setUDir] = useState('');
  const [uEsp, setUEsp] = useState('');
  const [uError, setUError] = useState<string | null>(null);

  // Admin-only Publication Plans editor state
  const [editPlanId, setEditPlanId] = useState<PlanPublicacionId | null>(null);
  const [pNombre, setPNombre] = useState('');
  const [pSubtitulo, setPSubtitulo] = useState('');
  const [pDias, setPDias] = useState<number>(30);
  const [pPrecio, setPPrecio] = useState<number>(4.90);
  const [pPrecioRegular, setPPrecioRegular] = useState<string>('');
  const [pBeneficiosText, setPBeneficiosText] = useState('');
  const [pDestacado, setPDestacado] = useState(false);
  const [pError, setPError] = useState<string | null>(null);
  const [culqiTxs, setCulqiTxs] = useState<CulqiPaymentReceipt[]>([]);

  useEffect(() => {
    if (adminTab !== 'billetera') return;
    fetch('/api/payments/culqi/transactions')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.transactions)) {
          setCulqiTxs(data.transactions);
        }
      })
      .catch(() => {
        // Silent fallback if endpoint unreachable
      });
  }, [adminTab]);

  const startEditPlan = (plan: PlanPublicacion) => {
    setEditPlanId(plan.id);
    setPNombre(plan.nombre);
    setPSubtitulo(plan.subtituloTag);
    setPDias(plan.duracionDias);
    setPPrecio(plan.precio);
    setPPrecioRegular(plan.precioRegular ? String(plan.precioRegular) : '');
    setPBeneficiosText(plan.beneficios.join('\n'));
    setPDestacado(plan.destacado);
    setPError(null);
  };

  const handleSavePlanEdit = (e: React.FormEvent, planId: PlanPublicacionId) => {
    e.preventDefault();
    setPError(null);
    const res = actualizarPlanPublicacionAdmin(planId, {
      nombre: pNombre,
      subtituloTag: pSubtitulo,
      duracionDias: pDias,
      precio: pPrecio,
      precioRegular: pPrecioRegular ? Number(pPrecioRegular) : undefined,
      destacado: pDestacado,
      beneficios: pBeneficiosText.split('\n').map(l => l.trim()).filter(Boolean)
    });
    if (!res.ok) {
      setPError(res.error || 'No se pudo actualizar el plan.');
    } else {
      setEditPlanId(null);
    }
  };

  const startEditUser = (u: UsuarioRegistrado) => {
    const loc = inferUbicacionPeru(u.distrito, u.provincia, u.region);
    setEditUserId(u.id);
    setUNombre(u.nombreCompleto);
    setUEmail(u.email);
    setUPassword('');
    setUDni(u.dni);
    setUTel(u.telefonoWhatsapp);
    setURegion(loc.region);
    setUProvincia(loc.provincia);
    setUDistrito(loc.distrito);
    setUDir(u.direccion);
    setUEsp(u.especialidadPrincipal || '');
    setUError(null);
  };

  const handleSaveUserEdit = (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    setUError(null);
    const res = editarUsuarioPorAdmin(userId, {
      dni: uDni,
      nombreCompleto: uNombre,
      email: uEmail,
      password: uPassword,
      telefonoWhatsapp: uTel,
      region: uRegion,
      provincia: uProvincia,
      distrito: uDistrito,
      direccion: uDir,
      especialidadPrincipal: uEsp
    });
    if (!res.ok) {
      setUError(res.error || 'Error al guardar usuario.');
    } else {
      setEditUserId(null);
      setUPassword('');
    }
  };

  const publicacionesFiltradas = servicios
    .filter(s => (filtroPubEstado === 'TODAS' ? true : s.estadoPublicacion === filtroPubEstado))
    .sort((a, b) => {
      if (a.estadoPublicacion === 'PENDIENTE_APROBACION' && b.estadoPublicacion !== 'PENDIENTE_APROBACION') return -1;
      if (b.estadoPublicacion === 'PENDIENTE_APROBACION' && a.estadoPublicacion !== 'PENDIENTE_APROBACION') return 1;
      return 0;
    });

  const usuariosFiltrados = usuarios
    .filter(u => {
      const est = u.estadoCuenta || 'ACTIVO';
      if (filtroUsuarioEstado !== 'TODOS' && est !== filtroUsuarioEstado) return false;
      if (!busquedaUsuario.trim()) return true;
      const q = busquedaUsuario.toLowerCase();
      return (
        u.nombreCompleto.toLowerCase().includes(q) ||
        u.dni.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.distrito.toLowerCase().includes(q) ||
        (u.provincia || '').toLowerCase().includes(q) ||
        (u.region || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const estA = a.estadoCuenta || 'ACTIVO';
      const estB = b.estadoCuenta || 'ACTIVO';
      if (estA === 'PENDIENTE' && estB !== 'PENDIENTE') return -1;
      if (estB === 'PENDIENTE' && estA !== 'PENDIENTE') return 1;
      return 0;
    });

  const handleConfirmRechazo = (servicioId: string) => {
    rechazarPublicacion(servicioId, motivoRechazoInput);
    setRechazoActivoId(null);
    setMotivoRechazoInput('Falta verificar código de certificado o ajustar tarifa.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header of the Admin Portal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-950 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Permiso Administrador · Control Total del Sistema</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Consola del Administrador TrabajaYa
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Visualiza todos los usuarios registrados con DNI, revisa los pagos de anuncios, <strong>admite o rechaza</strong> publicaciones de servicios, audita la custodia Escrow y homologa diplomas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('perfil')}
            className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Mi Perfil Admin</span>
          </button>

          <button
            onClick={cerrarSesion}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            onClick={() => setShowArchitectureModal(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 shadow-xs transition-all active:scale-95 shrink-0"
          >
            Arquitectura del Sistema
          </button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('publicaciones')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'publicaciones'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Admisión de Publicaciones</span>
          {publicacionesPendientesCount > 0 && (
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              adminTab === 'publicaciones' ? 'bg-amber-400 text-navy-950' : 'bg-amber-100 text-amber-900'
            }`}>
              {publicacionesPendientesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('planes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'planes'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Planes y Tarifas (Solo Admin)</span>
        </button>

        <button
          onClick={() => setAdminTab('imprevistos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'imprevistos'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Imprevistos Hogar ({imprevistos.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('usuarios')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'usuarios'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios y Verificación ({usuarios.length})</span>
          {(usuariosPendientesCount + verificacionesPendientesCount) > 0 && (
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              adminTab === 'usuarios' ? 'bg-amber-400 text-navy-950' : 'bg-amber-100 text-amber-900'
            }`}>
              {usuariosPendientesCount + verificacionesPendientesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('billetera')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'billetera'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Billetera & Despacho ({ordenes.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('turnos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'turnos'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Turnos en Vivo</span>
        </button>

        <button
          onClick={() => setAdminTab('certificados')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'certificados'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Acreditaciones</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: ADMISIÓN Y MODERACIÓN DE PUBLICACIONES PAGADAS */}
      {/* ======================================================== */}
      {adminTab === 'publicaciones' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-sky-600" />
                <span>Cola de Admisión de Anuncios de Servicios (Con DNI y Pago Verificado)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Solo los anuncios admitidos por el Administrador se muestran en el Catálogo público.
              </p>
              <button
                type="button"
                onClick={() => setAdminTab('planes')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-bold transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Editar Planes, Duraciones y Tarifas (Solo Admin)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'TODAS', label: `Todas (${servicios.length})` },
                { id: 'PENDIENTE_APROBACION', label: `Pendientes (${servicios.filter(s => s.estadoPublicacion === 'PENDIENTE_APROBACION').length})` },
                { id: 'APROBADO', label: `Admitidas (${servicios.filter(s => s.estadoPublicacion === 'APROBADO').length})` },
                { id: 'RECHAZADO', label: `Rechazadas (${servicios.filter(s => s.estadoPublicacion === 'RECHAZADO').length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFiltroPubEstado(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    filtroPubEstado === tab.id
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {publicacionesFiltradas.map(pub => {
              const isPending = pub.estadoPublicacion === 'PENDIENTE_APROBACION';
              const isApproved = pub.estadoPublicacion === 'APROBADO';
              const isRejected = pub.estadoPublicacion === 'RECHAZADO';

              return (
                <div
                  key={pub.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 ${
                    isPending
                      ? 'border-amber-400 ring-1 ring-amber-200'
                      : isRejected
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{pub.id}</span>
                        <span className="text-[11px] font-bold bg-navy-900 text-amber-300 px-2 py-0.5 rounded uppercase">
                          {pub.oficioLabel}
                        </span>
                        {pub.destacado && (
                          <span className="text-[10px] font-extrabold bg-amber-300 text-navy-950 px-2 py-0.5 rounded uppercase">
                            Plan Destacado
                          </span>
                        )}

                        {isPending && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pendiente de Admisión
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Admitido y Visible
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rechazado / Observado
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-extrabold text-navy-950">{pub.titulo}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{pub.descripcion}</p>

                      {/* All parameters grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Ofertante & DNI</span>
                          <span className="font-bold text-slate-900 block">{pub.tecnicoNombre}</span>
                          <span className="font-mono text-navy-900">DNI: {pub.tecnicoDni}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Teléfono & Ubicación</span>
                          <span className="font-mono font-bold text-emerald-700 block">+51 {pub.tecnicoTelefono}</span>
                          <span className="text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" /> {formatUbicacion(pub.distrito, pub.provincia, pub.region)}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Acreditación & Exp.</span>
                          <span className="font-bold text-slate-800 block">{pub.institucionCertificadora}</span>
                          <span className="font-mono text-[11px] text-slate-500">{pub.codigoCertificado} · {pub.experienciaAnos} años</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tarifas & Cupos</span>
                          <span className="font-bold text-navy-950 block">
                            Base S/ {pub.precioBase.toFixed(2)} → Cliente S/ {pub.tarifaCliente.toFixed(2)}
                          </span>
                          <span className="text-slate-600">{pub.turnosLibres} turnos libres</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {pub.habilidades.map((hab, idx) => (
                          <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {hab}
                          </span>
                        ))}
                      </div>

                      {/* Paid Ad Receipt */}
                      {pub.pagoPublicacion && (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-emerald-900 font-semibold">
                            💳 Pago de Anuncio ({pub.pagoPublicacion.pasarela || 'CULQI'}): {pub.pagoPublicacion.planNombre} ({pub.pagoPublicacion.metodoPago})
                          </span>
                          <span className="font-mono font-bold text-emerald-800">
                            S/ {pub.pagoPublicacion.montoPagado.toFixed(2)} · {pub.pagoPublicacion.codigoAutorizacion}
                          </span>
                        </div>
                      )}

                      {pub.motivoRechazo && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <strong>Motivo de Rechazo:</strong> {pub.motivoRechazo}
                        </div>
                      )}
                    </div>

                    {/* Admin Moderation & Contact Actions */}
                    <div className="flex flex-col gap-2 min-w-[215px] shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          inspeccionarPerfil({
                            userId: pub.autorUsuarioId,
                            dni: pub.tecnicoDni,
                            servicioId: pub.id,
                            returnAdminTab: 'publicaciones'
                          })
                        }
                        className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Perfil Completo</span>
                      </button>

                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => admitirPublicacion(pub.id)}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Admitir y Publicar</span>
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => setRechazoActivoId(rechazoActivoId === pub.id ? null : pub.id)}
                          className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{isApproved ? 'Retirar / Observar' : 'Rechazar Anuncio'}</span>
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsAppChat(
                              pub.tecnicoNombre,
                              pub.tecnicoTelefono,
                              pub.titulo,
                              undefined,
                              pub.tecnicoAvatar,
                              pub.institucionCertificadora
                            )
                          }
                          className="py-2 px-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] border border-[#25D366]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#128C7E]" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openCallModal({
                              tecnicoNombre: pub.tecnicoNombre,
                              tecnicoTelefono: pub.tecnicoTelefono,
                              servicioTitulo: pub.titulo,
                              region: pub.region,
                              provincia: pub.provincia,
                              distrito: pub.distrito,
                              institucion: pub.institucionCertificadora
                            })
                          }
                          className="py-2 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                          <span>Llamar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline rejection reason box */}
                  {rechazoActivoId === pub.id && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={motivoRechazoInput}
                        onChange={e => setMotivoRechazoInput(e.target.value)}
                        placeholder="Indica el motivo de observación o rechazo..."
                        className="flex-1 px-3 py-2 bg-white border border-rose-300 rounded-lg focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmRechazo(pub.id)}
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
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: ADMINISTRADOR ÚNICO, CORREOS PERMITIDOS Y USUARIOS */}
      {/* ======================================================== */}
      {adminTab === 'usuarios' && (
        <div className="space-y-5">
          {/* Security Policy Panel: Unique Admin + Permitted Emails Whitelist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card: Unique Administrator Lock */}
            <div className="bg-sky-950 text-white rounded-2xl p-5 border border-sky-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Política de Administrador Único</span>
                </span>
                <span className="px-2.5 py-0.5 bg-sky-500 text-white text-[10px] font-extrabold rounded-full uppercase">
                  1 Administrador Único
                </span>
              </div>

              <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">{adminUnico.nombreCompleto}</span>
                  <span className="font-mono text-amber-300 font-bold">DNI {adminUnico.dni}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-200 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{adminUnico.email}</span>
                </div>
              </div>

              <p className="text-[11px] text-sky-200/90 leading-relaxed">
                El sistema garantiza que solo exista <strong>1 cuenta con permiso de Administrador</strong>. Todo registro público crea únicamente cuentas con permiso <strong>USUARIO</strong> y requiere un correo permitido.
              </p>
            </div>

            {/* Right Card: Permitted Emails Manager */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Correos y Dominios Permitidos ({correosPermitidos.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Solo los correos autorizados aquí pueden registrarse o iniciar sesión como Usuario o Administrador.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {correosPermitidos.map(regla => (
                  <span
                    key={regla}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold text-navy-950"
                  >
                    <span>{regla}</span>
                    {regla !== '@conectaoficios.pe' && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = eliminarCorreoPermitido(regla);
                          setReglaCorreoError(res.ok ? null : res.error || null);
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title={`Retirar ${regla}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  const res = agregarCorreoPermitido(nuevaReglaCorreo);
                  if (!res.ok) {
                    setReglaCorreoError(res.error || 'No se pudo agregar.');
                  } else {
                    setReglaCorreoError(null);
                    setNuevaReglaCorreo('');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={nuevaReglaCorreo}
                  onChange={e => setNuevaReglaCorreo(e.target.value)}
                  placeholder="Ej. @empresa.pe o tecnico@peru.pe"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0"
                >
                  + Permitir
                </button>
              </form>

              {reglaCorreoError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{reglaCorreoError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Aceptación y Gestión General de Usuarios ({usuarios.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  El Administrador Único acepta cuentas pendientes, suspende o reactiva usuarios, edita sus datos y revisa sus publicaciones.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'TODOS', label: `Todos (${usuarios.length})` },
                    { id: 'PENDIENTE', label: `Pendientes (${usuarios.filter(u => u.estadoCuenta === 'PENDIENTE').length})` },
                    { id: 'ACTIVO', label: `Activos (${usuarios.filter(u => (u.estadoCuenta || 'ACTIVO') === 'ACTIVO').length})` },
                    { id: 'SUSPENDIDO', label: `Suspendidos (${usuarios.filter(u => u.estadoCuenta === 'SUSPENDIDO').length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFiltroUsuarioEstado(tab.id as any)}
                      className={`px-2.5 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                        filtroUsuarioEstado === tab.id
                          ? 'bg-navy-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={busquedaUsuario}
                    onChange={e => setBusquedaUsuario(e.target.value)}
                    placeholder="Buscar DNI, nombre..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usuariosFiltrados.map(u => {
              const anunciosUsuario = servicios.filter(
                s => s.autorUsuarioId === u.id || s.tecnicoDni === u.dni
              ).length;
              const estado = u.estadoCuenta || 'ACTIVO';
              const isEditingThis = editUserId === u.id;

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border space-y-3 text-xs ${
                    estado === 'PENDIENTE'
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                      : estado === 'SUSPENDIDO'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-400">{u.id}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          u.permiso === 'ADMIN'
                            ? 'bg-sky-600 text-white'
                            : 'bg-amber-300 text-navy-950'
                        }`}>
                          {u.permiso === 'ADMIN' ? 'ADMIN ÚNICO' : 'USUARIO'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          estado === 'ACTIVO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : estado === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {estado}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-navy-950 mt-1">{u.nombreCompleto}</h4>
                    </div>
                    <span className="font-mono font-bold bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-navy-950 flex items-center gap-1 shrink-0">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      DNI {u.dni}
                    </span>
                  </div>

                  {!isEditingThis ? (
                    <>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.direccion} · <strong>{formatUbicacion(u.distrito, u.provincia, u.region)}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Modalidad:{' '}
                          <strong>
                            {u.tipoUsuario === 'CLIENTE_HOGAR'
                              ? 'Cliente Hogar'
                              : u.tipoUsuario === 'OFERTANTE_OFICIO'
                              ? 'Persona de Oficio'
                              : 'Hogar + Oficio'}
                          </strong>{' '}
                          · Especialidad: <strong>{u.especialidadPrincipal || 'General'}</strong> · Anuncios:{' '}
                          <strong>{anunciosUsuario}</strong>
                        </div>

                        {/* Verification Media Indicators */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              u.fotoPersonaUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            <Camera className="w-3 h-3" /> Foto {u.fotoPersonaUrl ? '✓' : '—'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              u.dniFotoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            <CreditCard className="w-3 h-3" /> Foto DNI {u.dniFotoUrl ? '✓' : '—'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              u.videoPersonaUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            <Video className="w-3 h-3" /> Video {u.videoPersonaUrl ? '✓' : '—'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              u.certificadoOpcionalUrl ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            <FileText className="w-3 h-3" /> Cert. {u.certificadoOpcionalUrl ? '✓' : 'Opcional'}
                          </span>
                          {u.estadoVerificacionMedia === 'PENDIENTE_REVISION' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-950">
                              Por Verificar
                            </span>
                          )}
                          {u.estadoVerificacionMedia === 'VERIFICADO' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-900">
                              Media Verificada ✓
                            </span>
                          )}
                          {u.rucNumero && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              RUC {u.rucNumero}
                            </span>
                          )}
                          {(u.antecedentesPolicialesNombre || u.antecedentesPolicialesUrl) &&
                          (u.antecedentesPenalesNombre || u.antecedentesPenalesUrl) &&
                          (u.antecedentesJudicialesNombre || u.antecedentesJudicialesUrl) ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                              Antecedentes 3/3 ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                              Antecedentes Pend.
                            </span>
                          )}
                          {u.contratoFirmado && u.normasConductaFirmadas && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              Contrato y Normas ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Admin User Acceptance & Management Actions */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              inspeccionarPerfil({
                                userId: u.id,
                                dni: u.dni,
                                returnAdminTab: 'usuarios'
                              })
                            }
                            className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Perfil / Media</span>
                          </button>
                          {u.estadoVerificacionMedia === 'PENDIENTE_REVISION' && (
                            <button
                              type="button"
                              onClick={() => gestionarVerificacionUsuarioAdmin(u.id, 'VERIFICADO')}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Aprobar Media</span>
                            </button>
                          )}
                          {u.permiso !== 'ADMIN' && estado !== 'ACTIVO' && (
                            <button
                              type="button"
                              onClick={() => cambiarEstadoCuentaUsuario(u.id, 'ACTIVO')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aceptar Usuario</span>
                            </button>
                          )}
                          {u.permiso !== 'ADMIN' && estado === 'ACTIVO' && (
                            <button
                              type="button"
                              onClick={() => cambiarEstadoCuentaUsuario(u.id, 'SUSPENDIDO')}
                              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspender</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEditUser(u)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-navy-950 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5 text-sky-600" />
                            <span>Editar</span>
                          </button>
                          {u.permiso !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => eliminarUsuarioPorAdmin(u.id)}
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-bold flex items-center gap-1"
                              title="Eliminar cuenta de usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openWhatsAppChat(
                                u.nombreCompleto,
                                u.telefonoWhatsapp,
                                'Contacto Administrativo TrabajaYa',
                                undefined,
                                '👤',
                                `DNI ${u.dni}`
                              )
                            }
                            className="px-2.5 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#075E54] border border-[#25D366]/40 rounded-lg font-bold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#128C7E]" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openCallModal({
                                tecnicoNombre: u.nombreCompleto,
                                tecnicoTelefono: u.telefonoWhatsapp,
                                servicioTitulo: `Contacto Usuario (${u.permiso})`,
                                region: u.region,
                                provincia: u.provincia,
                                distrito: u.distrito
                              })
                            }
                            className="px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg font-bold flex items-center gap-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Llamar</span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={e => handleSaveUserEdit(e, u.id)} className="p-3 bg-white rounded-xl border border-slate-300 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={uNombre}
                          onChange={e => setUNombre(e.target.value)}
                          placeholder="Nombre completo"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
                          required
                        />
                        <input
                          type="email"
                          value={uEmail}
                          onChange={e => setUEmail(e.target.value)}
                          placeholder="Correo electrónico *"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                          required
                        />
                        <input
                          type="text"
                          value={uPassword}
                          onChange={e => setUPassword(e.target.value)}
                          placeholder="Nueva clave (opcional)"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                        />
                        <input
                          type="text"
                          value={uDni}
                          onChange={e => setUDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          maxLength={8}
                          placeholder="DNI"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                          required
                        />
                        <input
                          type="tel"
                          value={uTel}
                          onChange={e => setUTel(e.target.value)}
                          placeholder="WhatsApp"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                          required
                        />
                        <div className="sm:col-span-2">
                          <PeruUbigeoSelector
                            mode="form"
                            compact
                            region={uRegion}
                            provincia={uProvincia}
                            distrito={uDistrito}
                            onChange={({ region, provincia, distrito }) => {
                              setURegion(region);
                              setUProvincia(provincia);
                              setUDistrito(distrito);
                            }}
                          />
                        </div>
                        <input
                          type="text"
                          value={uEsp}
                          onChange={e => setUEsp(e.target.value)}
                          placeholder="Especialidad"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={uDir}
                          onChange={e => setUDir(e.target.value)}
                          placeholder="Dirección"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
                          required
                        />
                      </div>

                      {uError && (
                        <div className="text-[11px] text-rose-700 font-semibold">{uError}</div>
                      )}

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditUserId(null)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2.5: GESTIÓN DE IMPREVISTOS HOGAR Y COTIZACIONES */}
      {/* ======================================================== */}
      {adminTab === 'imprevistos' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <Home className="w-4 h-4 text-sky-600" />
                <span>Moderación de Imprevistos en Casa y Ofertas de Técnicos ({imprevistos.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisa los incidentes con fotos publicados por clientes y las cotizaciones enviadas por personas de oficio.
              </p>
            </div>
          </div>

          {imprevistos.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No hay imprevistos publicados en la plataforma.
            </div>
          ) : (
            <div className="space-y-4">
              {imprevistos.map(imp => (
                <div key={imp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">{imp.id}</span>
                        <span className="px-2 py-0.5 bg-navy-900 text-amber-300 font-bold rounded text-[10px] uppercase">
                          {imp.oficioLabel}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[10px] uppercase">
                          {imp.urgencia}
                        </span>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-900 font-bold rounded text-[10px] uppercase">
                          {imp.estado}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-navy-950">{imp.titulo}</h4>
                      <p className="text-slate-600">{imp.descripcion}</p>
                      <div className="text-slate-500">
                        Autor: <strong>{imp.autorNombre}</strong> (DNI {imp.autorDni}) · {formatUbicacion(imp.distrito, imp.provincia, imp.region)} · {imp.imagenes.length} foto(s) · {imp.ofertas.length} oferta(s)
                      </div>

                      {imp.imagenes.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {imp.imagenes.map((img, i) => (
                            <img key={i} src={img} alt="Imprevisto" className="w-20 h-16 object-cover rounded-lg border border-slate-300" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap lg:flex-col gap-2 min-w-[190px]">
                      <button
                        type="button"
                        onClick={() =>
                          inspeccionarPerfil({
                            userId: imp.autorUsuarioId,
                            dni: imp.autorDni,
                            returnAdminTab: 'imprevistos'
                          })
                        }
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Perfil del Autor</span>
                      </button>

                      {imp.estado !== 'ABIERTO' && (
                        <button
                          type="button"
                          onClick={() => cambiarEstadoImprevistoAdmin(imp.id, 'ABIERTO')}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                          Reabrir Imprevisto
                        </button>
                      )}

                      {imp.estado !== 'CERRADO' && (
                        <button
                          type="button"
                          onClick={() => cambiarEstadoImprevistoAdmin(imp.id, 'CERRADO')}
                          className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl"
                        >
                          Cerrar Caso
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => eliminarImprevistoAdmin(imp.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Imprevisto</span>
                      </button>
                    </div>
                  </div>

                  {imp.ofertas.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="font-bold text-slate-700 block">
                        Ofertas Recibidas ({imp.ofertas.length}):
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {imp.ofertas.map(o => (
                          <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-navy-950 flex items-center gap-1.5">
                                <span>{o.ofertanteNombre}</span>
                                <span className="text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400" /> {o.calificacionEstrellas.toFixed(1)}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Monto: <strong className="text-navy-950">S/ {o.montoOferta.toFixed(2)}</strong> · {o.estado}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  inspeccionarPerfil({
                                    userId: o.ofertanteUsuarioId,
                                    dni: o.ofertanteDni,
                                    returnAdminTab: 'imprevistos'
                                  })
                                }
                                className="px-2 py-1 bg-sky-100 text-sky-800 rounded font-bold text-[11px]"
                              >
                                Perfil
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminarOfertaImprevistoAdmin(imp.id, o.id)}
                                className="p-1.5 bg-rose-100 text-rose-700 rounded"
                                title="Eliminar oferta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: BILLETERA Y CONTROL DE ÓRDENES EN VIVO */}
      {/* ======================================================== */}
      {adminTab === 'billetera' && (
        <div className="space-y-6">

          {/* Financial KPI Cards (includes Ad Publishing & Imprevistos S/ 5.00 Revenue) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Ingresos Anuncios</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-700 tabular-nums">
                S/ {billeteraTecnico.ingresosPublicaciones.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pagos por publicación de avisos de servicio.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Imprevistos (S/ 5)</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 tabular-nums">
                S/ {billeteraTecnico.ingresosImprevistos.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tarifa de S/ 5.00 por publicación de imprevisto.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Fondos Liberados</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Unlock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 tabular-nums">
                S/ {billeteraTecnico.fondosLiberados.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Conformidad del cliente completada.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">En Custodia Escrow</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600 tabular-nums">
                S/ {billeteraTecnico.fondosEnCustodia.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Fondos resguardados pendientes de visto bueno.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Fondo Garantía (10%)</span>
                <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-navy-950 tabular-nums">
                S/ {billeteraTecnico.fondoGarantia.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Reserva nacional ante contingencias en Perú.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Contratos Totales</span>
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-navy-950 tabular-nums">
                {billeteraTecnico.totalContratos}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Órdenes atendidas o activas.
              </p>
            </div>

          </div>

          {/* Culqi Payment Gateway Live Ledger */}
          <div className="bg-white rounded-2xl p-6 border border-[#00a19b]/40 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#00a19b] text-white text-[10px] font-black rounded uppercase">
                    Culqi
                  </span>
                  <span>Transacciones Procesadas por Pasarela Culqi ({culqiTxs.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro unificado en el servidor de cobros de Imprevistos (S/ 5.00), Publicación de Anuncios y Órdenes en Custodia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  fetch('/api/payments/culqi/transactions')
                    .then(r => r.json())
                    .then(data => {
                      if (Array.isArray(data?.transactions)) setCulqiTxs(data.transactions);
                    })
                    .catch(() => {});
                }}
                className="px-3 py-1.5 text-xs font-bold bg-teal-50 hover:bg-teal-100 text-[#006965] border border-[#00a19b]/30 rounded-xl cursor-pointer"
              >
                Actualizar Culqi
              </button>
            </div>

            {culqiTxs.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                Aún no hay cobros nuevos registrados en esta sesión. Todos los pagos nuevos de anuncios, imprevistos y custodia aparecerán aquí con su ID de cargo Culqi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500">
                      <th className="py-2 pr-3">Cargo Culqi</th>
                      <th className="py-2 pr-3">Concepto</th>
                      <th className="py-2 pr-3">Método</th>
                      <th className="py-2 pr-3">Correo / Cliente</th>
                      <th className="py-2 pr-3">Fecha</th>
                      <th className="py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {culqiTxs.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 pr-3 font-mono font-bold text-[#006965]">
                          {tx.chargeId}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {tx.authorizationCode} · {tx.mode}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="font-bold text-navy-950 block">{tx.concepto}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[220px] block">
                            {tx.description}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {tx.brand || tx.method}
                            {tx.last4 ? ` •••• ${tx.last4}` : ''}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-600">{tx.email}</td>
                        <td className="py-2.5 pr-3 text-slate-500">{tx.createdAt}</td>
                        <td className="py-2.5 text-right font-mono font-black text-emerald-700">
                          S/ {tx.amountSoles.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orders Management for Admin dispatch */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-navy-950">
                  Despacho y Control Global de Órdenes (Escrow)
                </h3>
                <p className="text-xs text-slate-500">
                  Supervisa los estados de atención, resuelve garantías y contacta por WhatsApp o Llamada.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                Admin Full Visibility
              </span>
            </div>

            <div className="space-y-3">
              {ordenes.map(ord => (
                <div key={ord.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-navy-950 text-xs">{ord.id}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-slate-700">
                        Cliente: {ord.datosVisita.clienteNombre} (DNI {ord.datosVisita.clienteDni || 'N/D'})
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{ord.datosVisita.direccion}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Servicio: {ord.items.map(it => it.servicio.titulo).join(', ')} | Tel: +51 {ord.datosVisita.telefonoWhatsapp}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                      <span>
                        🕒 {ord.datosVisita.fechaVisita || ord.fecha} ·{' '}
                        <strong>{ord.datosVisita.horaVisita ? `${ord.datosVisita.horaVisita} hrs` : ord.datosVisita.turno}</strong>
                      </span>
                      <span>·</span>
                      <span
                        className={`font-bold ${
                          ord.aceptacionTrabajador === 'ACEPTADA'
                            ? 'text-emerald-700'
                            : ord.aceptacionTrabajador === 'NO_DISPONIBLE'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        Trabajador: {ord.aceptacionTrabajador || 'PENDIENTE'}
                      </span>
                      {ord.sinCobroSolicitud && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          Sin cobro (S/ 0.00)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-navy-950">
                      Estado: {ord.estado}
                    </span>

                    {ord.estado === 'EN_CUSTODIA' && (
                      <button
                        onClick={() => actualizarEstadoOrdenManual(ord.id, 'EN_CAMINO')}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Pasar a: "En Camino"
                      </button>
                    )}

                    {ord.estado === 'EN_CAMINO' && (
                      <button
                        onClick={() => actualizarEstadoOrdenManual(ord.id, 'EN_EJECUCION')}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Pasar a: "En Ejecución"
                      </button>
                    )}

                    {ord.estado === 'EN_EJECUCION' && (
                      <button
                        onClick={() => actualizarEstadoOrdenManual(ord.id, 'COMPLETADO_PENDIENTE_CONFORMIDAD')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Marcar: "Trabajo Concluido"
                      </button>
                    )}

                    {ord.estado === 'OBSERVADO_GARANTIA' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => resolverGarantiaAdmin(ord.id, 'REVISITA')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold rounded-lg text-xs shadow-xs"
                        >
                          Re-visita Gratuita
                        </button>
                        <button
                          onClick={() => resolverGarantiaAdmin(ord.id, 'LIBERAR')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                        >
                          Liberar Fondos
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const primerServicio = ord.items[0]?.servicio;
                        openWhatsAppChat(
                          ord.datosVisita.clienteNombre,
                          ord.datosVisita.telefonoWhatsapp,
                          primerServicio?.titulo || 'Servicio Técnico',
                          ord.id,
                          primerServicio?.tecnicoAvatar,
                          primerServicio?.institucionCertificadora
                        );
                      }}
                      className="px-2.5 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#075E54] border border-[#25D366]/40 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#128C7E]" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() =>
                        openCallModal({
                          tecnicoNombre: ord.datosVisita.clienteNombre,
                          tecnicoTelefono: ord.datosVisita.telefonoWhatsapp,
                          servicioTitulo: `Orden ${ord.id}`,
                          region: ord.datosVisita.region,
                          provincia: ord.datosVisita.provincia,
                          distrito: ord.datosVisita.distrito
                        })
                      }
                      className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Llamar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 4: GESTIÓN DE TURNOS EN VIVO */}
      {/* ======================================================== */}
      {adminTab === 'turnos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Agenda de Disponibilidad de Turnos por Servicio (Tiempo Real)
              </h3>
              <p className="text-xs text-slate-500">
                Aumenta o reduce los cupos disponibles para cada publicación en todo el Perú.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {servicios.map(srv => (
              <div key={srv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {srv.tecnicoAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">{srv.oficioLabel}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        srv.estadoPublicacion === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : srv.estadoPublicacion === 'PENDIENTE_APROBACION'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {srv.estadoPublicacion}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{srv.titulo}</h4>
                    <p className="text-xs text-slate-500">
                      {srv.tecnicoNombre} · DNI {srv.tecnicoDni} · {formatUbicacion(srv.distrito, srv.provincia, srv.region)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tarifa Cliente:</span>
                    <span className="font-extrabold text-navy-950 text-xs">S/ {srv.tarifaCliente.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => actualizarTurnosServicio(srv.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                      title="Reducir turno"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-900">
                      {srv.turnosLibres}
                    </span>
                    <button
                      onClick={() => actualizarTurnosServicio(srv.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                      title="Añadir turno"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    srv.turnosLibres > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {srv.turnosLibres > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 5: CERTIFICADOS OFICIALES (SENATI / SENCICO / CAPECO) */}
      {/* ======================================================== */}
      {adminTab === 'certificados' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-navy-950 mb-1">
              Registro de Certificados y Homologaciones Técnicas
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Validación de identidad y título técnico con las instituciones académicas acreditadas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificados.map(cert => (
                <div key={cert.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded uppercase">
                        {cert.institucion}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {cert.tecnicoNombre}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md flex items-center gap-1 ${
                      cert.estado === 'VERIFICADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" /> {cert.estado}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-800">{cert.especialidad}</p>
                    <p className="font-mono text-[11px] text-slate-500">Registro: {cert.codigoRegistro}</p>
                    <p className="text-slate-500">Horas lectivas certificadas: <strong>{cert.horasCapacitacion} hrs</strong></p>
                    <p className="text-slate-500">Emisión: {cert.fechaEmision} · <span className="text-emerald-700 font-semibold">{cert.vigencia}</span></p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => cambiarEstadoCertificado(cert.id, cert.estado === 'VERIFICADO' ? 'EN_REVISION' : 'VERIFICADO')}
                      className={`px-3 py-1 font-bold rounded-lg transition-all ${
                        cert.estado === 'VERIFICADO'
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {cert.estado === 'VERIFICADO' ? 'Poner en Revisión' : '✓ Aprobar y Homologar Diploma'}
                    </button>
                    <span className="text-slate-500 font-mono">Reg: {cert.id}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB: PLANES Y TARIFAS DE PUBLICACIÓN (SOLO ADMIN) */}
      {/* ======================================================== */}
      {adminTab === 'planes' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-100 text-sky-900 rounded-md text-[10px] font-extrabold uppercase mb-1.5">
                <Lock className="w-3 h-3" />
                <span>Privilegio Exclusivo del Administrador Único</span>
              </div>
              <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-600" />
                <span>Gestión de Planes, Duraciones y Precios de Publicación</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Solo el Administrador puede cambiar los precios (S/), días de duración y descripciones que ven las personas de oficio al publicar su servicio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => restablecerPlanesPublicacionAdmin()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Tarifas Oficiales</span>
            </button>
          </div>

          {/* Launch Engagement Controls (Only Admin) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-navy-950 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Estrategias de Lanzamiento y Captación (Solo Admin)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <label className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={promoConfig.pruebaGratisActiva}
                  onChange={e =>
                    actualizarPromoConfigAdmin({
                      ...promoConfig,
                      pruebaGratisActiva: e.target.checked
                    })
                  }
                  className="mt-1 rounded border-emerald-400"
                />
                <div>
                  <span className="font-extrabold text-emerald-950 block">
                    1. Primera Publicación Promocional (7 días gratis)
                  </span>
                  <span className="text-[11px] text-emerald-900/80">
                    Permite que cada nuevo profesional pruebe la plataforma 7 días gratis con funciones limitadas en su 1ra publicación.
                  </span>
                </div>
              </label>

              <label className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={promoConfig.descuentoDestacadoActivo}
                  onChange={e =>
                    actualizarPromoConfigAdmin({
                      ...promoConfig,
                      descuentoDestacadoActivo: e.target.checked
                    })
                  }
                  className="mt-1 rounded border-amber-400"
                />
                <div>
                  <span className="font-extrabold text-amber-950 block">
                    2. Descuento de Lanzamiento en Plan Destacado (S/ 24.90)
                  </span>
                  <span className="text-[11px] text-amber-900/80">
                    Muestra el precio regular tachado y aplica el precio promocional de lanzamiento durante los primeros meses.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {planesPublicacion.map(plan => {
              const isEditing = editPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 ${
                    plan.destacado ? 'border-amber-300 ring-1 ring-amber-200/70' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        {plan.categoriaEtiqueta} · {plan.id}
                      </span>
                      <h4 className="text-sm font-extrabold text-navy-950">{plan.nombre}</h4>
                      <span className="text-[11px] text-slate-500">{plan.subtituloTag}</span>
                    </div>
                    <div className="text-right shrink-0">
                      {plan.precioRegular && (
                        <span className="text-[11px] text-slate-400 line-through block tabular-nums">
                          S/ {plan.precioRegular.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-black text-emerald-700 tabular-nums">
                        S/ {plan.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {!isEditing ? (
                    <>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-600 font-semibold">Duración Activa:</span>
                          <span className="font-extrabold text-navy-950">{plan.duracionDias} días</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-600 font-semibold">Visibilidad / Destacado:</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            plan.destacado ? 'bg-amber-200 text-amber-950' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {plan.id === 'PRO'
                              ? 'Prioritario PRO'
                              : plan.destacado
                              ? 'Prioridad Destacado'
                              : 'Estándar'}
                          </span>
                        </div>
                        <ul className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                          {plan.beneficios.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => startEditPlan(plan)}
                        className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-300" />
                        <span>Modificar Plan / Precio</span>
                      </button>
                    </>
                  ) : (
                    <form onSubmit={e => handleSavePlanEdit(e, plan.id)} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nombre del Plan *</label>
                        <input
                          type="text"
                          value={pNombre}
                          onChange={e => setPNombre(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Subtítulo / Etiqueta *</label>
                        <input
                          type="text"
                          value={pSubtitulo}
                          onChange={e => setPSubtitulo(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Precio (S/) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min={1}
                            value={pPrecio}
                            onChange={e => setPPrecio(Number(e.target.value))}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Regular (S/)</label>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="Opcional"
                            value={pPrecioRegular}
                            onChange={e => setPPrecioRegular(e.target.value)}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Días *</label>
                          <input
                            type="number"
                            min={1}
                            max={3650}
                            value={pDias}
                            onChange={e => setPDias(Number(e.target.value))}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Beneficios (uno por línea) *</label>
                        <textarea
                          rows={4}
                          value={pBeneficiosText}
                          onChange={e => setPBeneficiosText(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                          required
                        />
                      </div>

                      <label className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pDestacado}
                          onChange={e => setPDestacado(e.target.checked)}
                          className="rounded border-amber-400"
                        />
                        <span className="font-bold text-amber-950">Mostrar insignia y prioridad en búsqueda</span>
                      </label>

                      {pError && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700">
                          {pError}
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar Cambios</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPlanId(null)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

