import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  Servicio,
  ItemCarrito,
  DatosVisita,
  Orden,
  CertificadoTecnico,
  MetodoPago,
  CalificacionServicio,
  EstadoOrden,
  AdminTabType,
  UsuarioRegistrado,
  PermisoRol,
  TipoUsuario,
  EstadoCuentaUsuario,
  EstadoVerificacionMedia,
  OficioType,
  UbicacionPeru,
  PlanPublicacion,
  PlanPublicacionId,
  PromoLanzamientoConfig,
  ImprevistoHogar,
  OfertaImprevisto,
  UrgenciaImprevisto,
  EstadoImprevisto,
  TipoDocumentoIdentidad,
  ComprobanteDomicilioTipo,
  TipoComprobanteTributario,
  TipoContratoLaboral,
  InventarioHerramientaItem,
  FotoTrabajoRealizado,
  ResenaPublicacion,
  ChatConversation,
  ChatMessage,
  CulqiPaymentReceipt
} from '../types';
import {
  resolveEmailServicio,
  buildWhatsAppSolicitudTrabajadorMsg,
  buildCorreoSolicitudTrabajador,
  getTrabajadoresUnicosOrden
} from '../utils/whatsappSolicitud';
import {
  SERVICIOS_INICIALES,
  ORDENES_DEMO_INICIALES,
  CERTIFICADOS_OFICIALES,
  USUARIOS_INICIALES,
  PLANES_PUBLICACION,
  PLAN_PRUEBA_GRATIS,
  IMPREVISTOS_INICIALES
} from '../data/initialData';
import { safeLocalStorageSet } from '../utils/mediaUpload';
import { inferUbicacionPeru } from '../data/peruUbigeo';

interface ToastInfo {
  title: string;
  desc: string;
  type: 'success' | 'info' | 'warning';
}

export interface NuevoAnuncioPayload {
  oficio: OficioType;
  titulo: string;
  descripcion: string;
  tecnicoNombre: string;
  tecnicoDni: string;
  tecnicoTelefono: string;
  institucionCertificadora: string;
  codigoCertificado: string;
  precioBase: number;
  turnosLibres: number;
  experienciaAnos: number;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  habilidades: string[];
  planId: PlanPublicacionId;
  metodoPago: MetodoPago;
  culqiReceipt?: CulqiPaymentReceipt;
}

export interface VerificacionMediaPayload {
  dni?: string;
  tipoDocumento?: TipoDocumentoIdentidad;
  dniFotoUrl?: string;
  fotoPersonaUrl?: string;
  videoPersonaUrl?: string;
  videoPersonaNombre?: string;
  certificadoOpcionalUrl?: string;
  certificadoOpcionalNombre?: string;
}

export interface ExpedienteCumplimientoPayload {
  tipoDocumento?: TipoDocumentoIdentidad;
  dni?: string;
  dniFotoUrl?: string;
  fotoPersonaUrl?: string;
  videoPersonaUrl?: string;
  videoPersonaNombre?: string;
  comprobanteDomicilioTipo?: ComprobanteDomicilioTipo;
  comprobanteDomicilioUrl?: string;
  comprobanteDomicilioNombre?: string;
  emergenciaFamiliarNombre?: string;
  emergenciaFamiliarParentesco?: string;
  emergenciaFamiliarTelefono?: string;
  rucNumero?: string;
  rucActivo?: boolean;
  tipoComprobanteTributario?: TipoComprobanteTributario;
  fichaRucUrl?: string;
  fichaRucNombre?: string;
  antecedentesPolicialesUrl?: string;
  antecedentesPolicialesNombre?: string;
  antecedentesPenalesUrl?: string;
  antecedentesPenalesNombre?: string;
  antecedentesJudicialesUrl?: string;
  antecedentesJudicialesNombre?: string;
  certificacionTecnicaDetalle?: string;
  certificadoOpcionalUrl?: string;
  certificadoOpcionalNombre?: string;
  licenciaConducirNumero?: string;
  licenciaConducirCategoria?: string;
  licenciaConducirUrl?: string;
  licenciaConducirNombre?: string;
  contratoTipo?: TipoContratoLaboral;
  contratoFirmado?: boolean;
  contratoFirmaNombre?: string;
  contratoFechaFirma?: string;
  normasConductaFirmadas?: boolean;
  normasConductaFecha?: string;
  inventarioHerramientas?: InventarioHerramientaItem[];
  inventarioFirmado?: boolean;
  inventarioFechaFirma?: string;
}

export type CampoArchivoVerificacion =
  | 'dniFotoUrl'
  | 'fotoPersonaUrl'
  | 'videoPersonaUrl'
  | 'certificadoOpcionalUrl'
  | 'comprobanteDomicilioUrl'
  | 'fichaRucUrl'
  | 'antecedentesPolicialesUrl'
  | 'antecedentesPenalesUrl'
  | 'antecedentesJudicialesUrl'
  | 'licenciaConducirUrl';

export interface RegistroUsuarioPayload {
  tipoDocumento?: TipoDocumentoIdentidad;
  dni: string;
  nombreCompleto: string;
  telefonoWhatsapp: string;
  email: string;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  direccion: string;
  password: string;
  especialidadPrincipal?: string;
  tipoUsuario?: TipoUsuario;
  dniFotoUrl?: string;
  fotoPersonaUrl?: string;
  videoPersonaUrl?: string;
  videoPersonaNombre?: string;
  certificadoOpcionalUrl?: string;
  certificadoOpcionalNombre?: string;
  emergenciaFamiliarNombre?: string;
  emergenciaFamiliarParentesco?: string;
  emergenciaFamiliarTelefono?: string;
  rucNumero?: string;
}

export interface ActualizarPerfilPayload {
  tipoDocumento?: TipoDocumentoIdentidad;
  dni: string;
  nombreCompleto: string;
  email?: string;
  telefonoWhatsapp: string;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  direccion: string;
  especialidadPrincipal?: string;
  tipoUsuario?: TipoUsuario;
  password?: string;
}

export interface NuevoImprevistoPayload {
  oficio: OficioType;
  titulo: string;
  descripcion: string;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  direccion: string;
  urgencia: UrgenciaImprevisto;
  presupuestoReferencial?: number;
  telefonoContacto: string;
  imagenes: string[];
  metodoPago?: MetodoPago;
  culqiReceipt?: CulqiPaymentReceipt;
}

export interface NuevaOfertaImprevistoPayload {
  montoOferta: number;
  tiempoEstimado: string;
  garantiaDias: number;
  mensajePropuesta: string;
  especialidad?: string;
  institucionCertificadora?: string;
}

export interface EditarPublicacionPayload {
  oficio: OficioType;
  titulo: string;
  descripcion: string;
  tecnicoNombre: string;
  tecnicoDni: string;
  tecnicoTelefono: string;
  tecnicoEmail?: string;
  institucionCertificadora: string;
  codigoCertificado: string;
  precioBase: number;
  turnosLibres: number;
  experienciaAnos: number;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  habilidades: string[];
}

export interface CallTarget {
  tecnicoNombre: string;
  tecnicoTelefono: string;
  servicioTitulo: string;
  region?: string;
  provincia?: string;
  distrito?: string;
  institucion?: string;
}

export type ActiveTabType =
  | 'catalogo'
  | 'perfiles'
  | 'imprevistos'
  | 'publicar'
  | 'solicitud'
  | 'ordenes'
  | 'portal'
  | 'perfil'
  | 'perfil-inspeccion'
  | 'acceso';

export interface InspectedProfileTarget {
  userId?: string;
  dni?: string;
  servicioId?: string;
  returnAdminTab?: AdminTabType;
}

export interface PublicProfileTarget {
  userId?: string;
  dni?: string;
  nombre?: string;
}

interface ConectaContextType {
  servicios: Servicio[];
  serviciosAprobados: Servicio[];
  imprevistos: ImprevistoHogar[];
  imprevistosAbiertosCount: number;
  publicacionesPendientesCount: number;
  usuariosPendientesCount: number;
  verificacionesPendientesCount: number;
  ordenesPendientesTrabajadorCount: number;
  ordenesPendientesCalificarClienteCount: number;
  carrito: ItemCarrito[];
  ordenes: Orden[];
  certificados: CertificadoTecnico[];
  usuarios: UsuarioRegistrado[];
  currentUser: UsuarioRegistrado | null;

  // Navigation
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  filtroOficio: string;
  setFiltroOficio: (oficio: string) => void;
  filtroRegion: string;
  setFiltroRegion: (region: string) => void;
  filtroProvincia: string;
  setFiltroProvincia: (provincia: string) => void;
  filtroDistrito: string;
  setFiltroDistrito: (distrito: string) => void;
  busquedaTexto: string;
  setBusquedaTexto: (texto: string) => void;
  selectedServiceForModal: Servicio | null;
  setSelectedServiceForModal: (srv: Servicio | null) => void;
  showArchitectureModal: boolean;
  setShowArchitectureModal: (show: boolean) => void;
  lastCreatedOrder: Orden | null;
  setLastCreatedOrder: (ord: Orden | null) => void;
  pedidoEnDetalleId: string | null;
  setPedidoEnDetalleId: (ordenId: string | null) => void;
  toast: ToastInfo | null;
  showToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;

  // Strict 2-permission Role Management ('USUARIO' | 'ADMIN')
  currentRole: PermisoRol;
  setCurrentRole: (role: PermisoRol) => void;
  adminTab: AdminTabType;
  setAdminTab: (tab: AdminTabType) => void;
  showPortalModal: boolean;
  setShowPortalModal: (show: boolean) => void;
  showAuthModal: 'login' | 'register' | null;
  setShowAuthModal: (mode: 'login' | 'register' | null) => void;

  // Admin Full-Profile Inspection
  inspectedProfile: InspectedProfileTarget | null;
  inspeccionarPerfil: (target: InspectedProfileTarget) => void;
  volverAConsolaAdmin: () => void;

  // Public Profile Viewer (Available to all visitors & users for any specialist or user)
  publicProfileTarget: PublicProfileTarget | null;
  verPerfilPublico: (target: PublicProfileTarget) => void;
  cerrarPerfilPublico: () => void;

  // Permitted Emails Policy & Unique Admin Info
  correosPermitidos: string[];
  adminUnico: UsuarioRegistrado;
  esCorreoPermitido: (email: string) => boolean;
  agregarCorreoPermitido: (regla: string) => { ok: boolean; error?: string };
  eliminarCorreoPermitido: (regla: string) => { ok: boolean; error?: string };

  // Auth, Logout, Profile Editing, Verification Media & Admin User Management Actions
  registrarUsuario: (data: RegistroUsuarioPayload) => { ok: boolean; error?: string };
  iniciarSesion: (
    email: string,
    password: string,
    mediaOnLogin?: VerificacionMediaPayload
  ) => { ok: boolean; error?: string; notRegistered?: boolean };
  cerrarSesion: () => void;
  cambiarCuentaUsuario: () => void;
  actualizarMiPerfil: (data: ActualizarPerfilPayload) => { ok: boolean; error?: string };
  actualizarVerificacionMedia: (
    media: VerificacionMediaPayload
  ) => { ok: boolean; error?: string };
  actualizarExpedienteCumplimiento: (
    data: ExpedienteCumplimientoPayload,
    silentToast?: boolean
  ) => { ok: boolean; error?: string };
  actualizarExpedientePorAdmin: (
    usuarioId: string,
    data: ExpedienteCumplimientoPayload
  ) => { ok: boolean; error?: string };
  cambiarEstadoCuentaUsuario: (usuarioId: string, nuevoEstado: EstadoCuentaUsuario) => void;
  gestionarVerificacionUsuarioAdmin: (
    usuarioId: string,
    estado: EstadoVerificacionMedia,
    observacion?: string
  ) => void;
  eliminarArchivoVerificacionAdmin: (
    usuarioId: string,
    campo: CampoArchivoVerificacion
  ) => void;
  editarUsuarioPorAdmin: (usuarioId: string, data: ActualizarPerfilPayload) => { ok: boolean; error?: string };
  eliminarUsuarioPorAdmin: (usuarioId: string) => { ok: boolean; error?: string };
  agregarFotoTrabajoPerfil: (trabajo: {
    imagenUrl: string;
    titulo: string;
    descripcion?: string;
    oficio?: OficioType;
    ubicacion?: string;
  }) => { ok: boolean; error?: string };
  eliminarFotoTrabajoPerfil: (trabajoId: string) => void;
  eliminarFotoTrabajoAdmin: (usuarioId: string, trabajoId: string) => void;

  // Imprevistos Hogar & Ofertas de Reparación
  publicarImprevisto: (payload: NuevoImprevistoPayload) => { ok: boolean; error?: string; imprevisto?: ImprevistoHogar };
  ofrecerServicioImprevisto: (
    imprevistoId: string,
    payload: NuevaOfertaImprevistoPayload
  ) => { ok: boolean; error?: string };
  aceptarOfertaImprevisto: (
    imprevistoId: string,
    ofertaId: string,
    crearOrdenEscrow?: boolean
  ) => { ok: boolean; error?: string; orden?: Orden };
  cambiarEstadoImprevistoAdmin: (imprevistoId: string, estado: EstadoImprevisto) => void;
  eliminarImprevistoAdmin: (imprevistoId: string) => void;
  eliminarOfertaImprevistoAdmin: (imprevistoId: string, ofertaId: string) => void;

  // Paid Advertisement Plans (Editable ONLY by ADMIN), Editing & Moderation Actions
  planesPublicacion: PlanPublicacion[];
  promoConfig: PromoLanzamientoConfig;
  actualizarPlanPublicacionAdmin: (
    planId: PlanPublicacionId,
    data: {
      nombre: string;
      subtituloTag: string;
      duracionDias: number;
      precio: number;
      precioRegular?: number;
      destacado: boolean;
      beneficios: string[];
    }
  ) => { ok: boolean; error?: string };
  actualizarPromoConfigAdmin: (next: PromoLanzamientoConfig) => { ok: boolean; error?: string };
  restablecerPlanesPublicacionAdmin: () => { ok: boolean; error?: string };
  publicarAnuncioPagado: (payload: NuevoAnuncioPayload) => Servicio;
  editarMiPublicacion: (servicioId: string, data: EditarPublicacionPayload) => { ok: boolean; error?: string };
  admitirPublicacion: (servicioId: string) => void;
  rechazarPublicacion: (servicioId: string, motivo: string) => void;

  // Cart & Escrow Actions
  agregarAlCarrito: (servicio: Servicio) => void;
  quitarDelCarrito: (servicioId: string) => void;
  actualizarCantidadItem: (servicioId: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  confirmarOrdenYEscrow: (datosVisita: DatosVisita, metodoPago?: MetodoPago) => Orden;
  marcarCanalEnvioOrden: (ordenId: string, canal: 'whatsapp' | 'correo') => void;
  responderDisponibilidadOrden: (
    ordenId: string,
    decision: 'ACEPTADA' | 'NO_DISPONIBLE',
    nota?: string
  ) => { ok: boolean; error?: string };
  darConformidadYLiberarFondos: (ordenId: string) => void;
  pagarOrdenConCulqi: (ordenId: string, receipt: CulqiPaymentReceipt) => void;
  reportarObservacion: (ordenId: string, motivo: string) => void;
  calificarOrden: (ordenId: string, calificacion: CalificacionServicio) => void;
  actualizarTurnosServicio: (servicioId: string, delta: number) => void;
  actualizarEstadoOrdenManual: (ordenId: string, nuevoEstado: EstadoOrden) => void;
  cambiarEstadoCertificado: (certId: string, nuevoEstado: 'VERIFICADO' | 'EN_REVISION') => void;
  resolverGarantiaAdmin: (ordenId: string, accion: 'REVISITA' | 'LIBERAR') => void;

  // Contact: WhatsApp & Phone Call
  activeWhatsAppChat: {
    tecnicoNombre: string;
    tecnicoTelefono: string;
    servicioTitulo: string;
    ordenId?: string;
    avatar: string;
    institucion?: string;
  } | null;
  setActiveWhatsAppChat: (chat: {
    tecnicoNombre: string;
    tecnicoTelefono: string;
    servicioTitulo: string;
    ordenId?: string;
    avatar: string;
    institucion?: string;
  } | null) => void;
  openWhatsAppChat: (
    tecnicoNombre: string,
    tecnicoTelefono: string,
    servicioTitulo: string,
    ordenId?: string,
    avatar?: string,
    institucion?: string
  ) => void;
  openExternalWhatsApp: (telefono: string, mensaje: string) => void;
  activeCallTarget: CallTarget | null;
  setActiveCallTarget: (target: CallTarget | null) => void;
  openCallModal: (target: CallTarget) => void;

  // Real-time Worker <-> Client Direct Chat + Automatic Order Dispatch
  chatConversations: ChatConversation[];
  activeChatConversationId: string | null;
  setActiveChatConversationId: (id: string | null) => void;
  showChatInbox: boolean;
  setShowChatInbox: (open: boolean) => void;
  abrirChatDirecto: (params: {
    conversationId?: string;
    ordenId?: string;
    imprevistoId?: string;
    servicioTitulo: string;
    clienteId?: string;
    clienteNombre?: string;
    clienteDni?: string;
    clienteTelefono?: string;
    trabajadorId?: string;
    trabajadorNombre: string;
    trabajadorDni?: string;
    trabajadorTelefono: string;
    trabajadorAvatar?: string;
    trabajadorInstitucion?: string;
  }) => Promise<void>;
  enviarMensajeChat: (
    conversationId: string,
    text: string,
    overrideRole?: 'cliente' | 'trabajador'
  ) => Promise<void>;
  despacharOrdenAutomaticamente: (orden: Orden) => Promise<void>;

  // Financial statistics
  totalItemsEnCarrito: number;
  subtotalCarrito: number;
  garantiaCarrito: number;
  igvCarrito: number;
  totalCarrito: number;
  billeteraTecnico: {
    fondosLiberados: number;
    fondosEnCustodia: number;
    fondoGarantia: number;
    totalContratos: number;
    ingresosPublicaciones: number;
    ingresosImprevistos: number;
  };
}

export const PRECIO_PUBLICACION_IMPREVISTO = 5.0;

const ConectaContext = createContext<ConectaContextType | undefined>(undefined);

const OFICIO_LABELS: Record<OficioType, string> = {
  GASFITERIA: '🔧 Gasfitería',
  ELECTRICIDAD: '⚡ Electricidad Residencial',
  CERRAJERIA: '🔑 Cerrajería',
  PINTURA: '🎨 Pintura',
  ALBANILERIA: '🧱 Albañilería Básica',
  DRYWALL: '🏗️ Instalación de Drywall',
  CARPINTERIA: '🪚 Carpintería (Madera y Melamina)',
  SOLDADURA: '🔥 Soldadura (Herrería)',
  ELECTRODOMESTICOS: '🔌 Técnico de Línea Blanca',
  CLIMATIZACION: '❄️ Aire Acondicionado',
  VIDRIERIA: '🪟 Vidriería y Aluminio',
  LIMPIEZA: '🧹 Limpieza y Saneamiento',
  JARDINERIA: '🌿 Jardinería',
  SOPORTE_TI: '💻 Cámaras y Redes TI'
};

const OFICIO_IMAGENES: Record<OficioType, string> = {
  GASFITERIA: '/src/assets/images/plumbing_service_1794288024564.jpg',
  ELECTRICIDAD: '/src/assets/images/electrician_service_1794288025810.jpg',
  CERRAJERIA: '/src/assets/images/hero_technicians_ayacucho_1794288024922.jpg',
  PINTURA: '/src/assets/images/carpentry_service_1794288025960.jpg',
  ALBANILERIA: '/src/assets/images/hero_technicians_ayacucho_1794288024922.jpg',
  DRYWALL: '/src/assets/images/carpentry_service_1794288025960.jpg',
  CARPINTERIA: '/src/assets/images/carpentry_service_1794288025960.jpg',
  SOLDADURA: '/src/assets/images/hero_technicians_ayacucho_1794288024922.jpg',
  ELECTRODOMESTICOS: '/src/assets/images/plumbing_service_1794288024564.jpg',
  CLIMATIZACION: '/src/assets/images/electrician_service_1794288025810.jpg',
  VIDRIERIA: '/src/assets/images/carpentry_service_1794288025960.jpg',
  LIMPIEZA: '/src/assets/images/plumbing_service_1794288024564.jpg',
  JARDINERIA: '/src/assets/images/hero_technicians_ayacucho_1794288024922.jpg',
  SOPORTE_TI: '/src/assets/images/electrician_service_1794288025810.jpg'
};

const OFICIO_AVATARS: Record<OficioType, string> = {
  GASFITERIA: '🔧',
  ELECTRICIDAD: '⚡',
  CERRAJERIA: '🔑',
  PINTURA: '🎨',
  ALBANILERIA: '🧱',
  DRYWALL: '🏗️',
  CARPINTERIA: '🪚',
  SOLDADURA: '🔥',
  ELECTRODOMESTICOS: '🔌',
  CLIMATIZACION: '❄️',
  VIDRIERIA: '🪟',
  LIMPIEZA: '🧹',
  JARDINERIA: '🌿',
  SOPORTE_TI: '💻'
};

const validarNumeroDocumento = (
  valor: string,
  tipo: TipoDocumentoIdentidad = 'DNI'
): { ok: boolean; clean: string; error?: string } => {
  const trimmed = valor.trim().toUpperCase();
  if (tipo === 'DNI') {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length !== 8) {
      return { ok: false, clean: digits, error: 'El DNI debe contener exactamente 8 dígitos numéricos.' };
    }
    return { ok: true, clean: digits };
  }
  const cleanAlnum = trimmed.replace(/[^A-Z0-9-]/g, '');
  if (cleanAlnum.length < 6 || cleanAlnum.length > 15) {
    return {
      ok: false,
      clean: cleanAlnum,
      error: `El ${tipo === 'CE' ? 'Carnet de Extranjería' : 'Pasaporte'} debe tener entre 6 y 15 caracteres.`
    };
  }
  return { ok: true, clean: cleanAlnum };
};

const DOMINIOS_CORREO_PERMITIDOS_INICIALES = [
  '@conectaoficios.pe',
  '@gmail.com',
  '@outlook.com',
  '@hotmail.com'
];

export const ConectaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [correosPermitidos, setCorreosPermitidos] = useState<string[]>(() => {
    const saved = localStorage.getItem('conecta_correos_permitidos_pe_v2');
    return saved ? JSON.parse(saved) : DOMINIOS_CORREO_PERMITIDOS_INICIALES;
  });

  const [usuarios, setUsuarios] = useState<UsuarioRegistrado[]>(() => {
    const saved = localStorage.getItem('conecta_usuarios_pe_v2');
    const parsed: UsuarioRegistrado[] = saved ? JSON.parse(saved) : USUARIOS_INICIALES;
    // Merge any newly added initial USUARIO accounts & compliance defaults for seed users
    const seedById = new Map(USUARIOS_INICIALES.map(s => [s.id, s]));
    const enriched = parsed.map(u => {
      const seed = seedById.get(u.id);
      if (!seed) return u;
      return {
        ...seed,
        ...u,
        tipoDocumento: u.tipoDocumento || seed.tipoDocumento || 'DNI',
        emergenciaFamiliarNombre: u.emergenciaFamiliarNombre || seed.emergenciaFamiliarNombre,
        emergenciaFamiliarParentesco: u.emergenciaFamiliarParentesco || seed.emergenciaFamiliarParentesco,
        emergenciaFamiliarTelefono: u.emergenciaFamiliarTelefono || seed.emergenciaFamiliarTelefono,
        rucNumero: u.rucNumero || seed.rucNumero,
        rucActivo: u.rucActivo !== undefined ? u.rucActivo : seed.rucActivo,
        tipoComprobanteTributario: u.tipoComprobanteTributario || seed.tipoComprobanteTributario,
        antecedentesPolicialesNombre: u.antecedentesPolicialesNombre || seed.antecedentesPolicialesNombre,
        antecedentesPenalesNombre: u.antecedentesPenalesNombre || seed.antecedentesPenalesNombre,
        antecedentesJudicialesNombre: u.antecedentesJudicialesNombre || seed.antecedentesJudicialesNombre,
        certificacionTecnicaDetalle: u.certificacionTecnicaDetalle || seed.certificacionTecnicaDetalle,
        licenciaConducirNumero: u.licenciaConducirNumero || seed.licenciaConducirNumero,
        licenciaConducirCategoria: u.licenciaConducirCategoria || seed.licenciaConducirCategoria,
        contratoTipo: u.contratoTipo || seed.contratoTipo,
        contratoFirmado: u.contratoFirmado !== undefined ? u.contratoFirmado : seed.contratoFirmado,
        contratoFirmaNombre: u.contratoFirmaNombre || seed.contratoFirmaNombre,
        contratoFechaFirma: u.contratoFechaFirma || seed.contratoFechaFirma,
        normasConductaFirmadas:
          u.normasConductaFirmadas !== undefined ? u.normasConductaFirmadas : seed.normasConductaFirmadas,
        normasConductaFecha: u.normasConductaFecha || seed.normasConductaFecha,
        inventarioHerramientas:
          u.inventarioHerramientas && u.inventarioHerramientas.length > 0
            ? u.inventarioHerramientas
            : seed.inventarioHerramientas,
        inventarioFirmado: u.inventarioFirmado !== undefined ? u.inventarioFirmado : seed.inventarioFirmado,
        inventarioFechaFirma: u.inventarioFechaFirma || seed.inventarioFechaFirma,
        fotosTrabajos:
          u.fotosTrabajos && u.fotosTrabajos.length > 0 ? u.fotosTrabajos : seed.fotosTrabajos
      };
    });
    const existingEmails = new Set(enriched.map(u => u.email.toLowerCase()));
    const existingDnis = new Set(enriched.map(u => u.dni));
    const merged = [...enriched];
    for (const seed of USUARIOS_INICIALES) {
      if (
        seed.permiso === 'USUARIO' &&
        !existingEmails.has(seed.email.toLowerCase()) &&
        !existingDnis.has(seed.dni)
      ) {
        merged.push(seed);
      }
    }
    // Enforce strictly ONE unique Administrator (ADM-001)
    let adminFound = false;
    const sanitized = merged.filter(u => {
      if (u.permiso === 'ADMIN') {
        if (adminFound) return false;
        adminFound = true;
      }
      return true;
    });
    if (!adminFound) {
      const defaultAdmin = USUARIOS_INICIALES.find(u => u.permiso === 'ADMIN')!;
      sanitized.push(defaultAdmin);
    }
    return sanitized;
  });

  const [currentUser, setCurrentUser] = useState<UsuarioRegistrado | null>(() => {
    const saved = localStorage.getItem('conecta_current_user_pe_v2');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [servicios, setServicios] = useState<Servicio[]>(() => {
    const saved = localStorage.getItem('conecta_servicios_pe_v2');
    if (!saved) return SERVICIOS_INICIALES;
    try {
      const parsed: Servicio[] = JSON.parse(saved);
      const seedById = new Map(SERVICIOS_INICIALES.map(s => [s.id, s]));
      const enriched = parsed.map(srv => {
        const seed = seedById.get(srv.id);
        if (!seed) return srv;
        return {
          ...srv,
          autorUsuarioId: srv.autorUsuarioId || seed.autorUsuarioId
        };
      });
      const existingIds = new Set(enriched.map(s => s.id));
      const newSeeds = SERVICIOS_INICIALES.filter(seed => !existingIds.has(seed.id));
      return newSeeds.length > 0 ? [...enriched, ...newSeeds] : enriched;
    } catch {
      return SERVICIOS_INICIALES;
    }
  });

  const [planesPublicacion, setPlanesPublicacion] = useState<PlanPublicacion[]>(() => {
    const saved = localStorage.getItem('conecta_planes_publicacion_pe_v2');
    if (!saved) return PLANES_PUBLICACION;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length === 3 ? parsed : PLANES_PUBLICACION;
    } catch {
      return PLANES_PUBLICACION;
    }
  });

  const [promoConfig, setPromoConfig] = useState<PromoLanzamientoConfig>(() => {
    const saved = localStorage.getItem('conecta_promo_lanzamiento_pe_v2');
    if (!saved) return { pruebaGratisActiva: true, descuentoDestacadoActivo: true };
    try {
      return JSON.parse(saved);
    } catch {
      return { pruebaGratisActiva: true, descuentoDestacadoActivo: true };
    }
  });

  const [imprevistos, setImprevistos] = useState<ImprevistoHogar[]>(() => {
    const saved = localStorage.getItem('conecta_imprevistos_pe_v2');
    if (!saved) return IMPREVISTOS_INICIALES;
    try {
      return JSON.parse(saved);
    } catch {
      return IMPREVISTOS_INICIALES;
    }
  });

  const [carritosPorUsuario, setCarritosPorUsuario] = useState<Record<string, ItemCarrito[]>>(() => {
    const saved = localStorage.getItem('conecta_carritos_por_usuario_pe_v2');
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  const [ordenes, setOrdenes] = useState<Orden[]>(() => {
    const saved = localStorage.getItem('conecta_ordenes_pe_v2');
    if (!saved) return ORDENES_DEMO_INICIALES;
    try {
      const parsed: Orden[] = JSON.parse(saved);
      const hasPendingSample = parsed.some(o => o.id === 'PED-2026-9045');
      return hasPendingSample ? parsed : [ORDENES_DEMO_INICIALES[0], ...parsed];
    } catch {
      return ORDENES_DEMO_INICIALES;
    }
  });

  const [certificados, setCertificados] = useState<CertificadoTecnico[]>(() => {
    const saved = localStorage.getItem('conecta_certificados_pe_v2');
    return saved ? JSON.parse(saved) : CERTIFICADOS_OFICIALES;
  });

  const [adminTab, setAdminTab] = useState<AdminTabType>('publicaciones');
  const [showPortalModal, setShowPortalModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [inspectedProfile, setInspectedProfile] = useState<InspectedProfileTarget | null>(null);
  const [publicProfileTarget, setPublicProfileTarget] = useState<PublicProfileTarget | null>(null);

  const [activeWhatsAppChat, setActiveWhatsAppChat] = useState<{
    tecnicoNombre: string;
    tecnicoTelefono: string;
    servicioTitulo: string;
    ordenId?: string;
    avatar: string;
    institucion?: string;
  } | null>(null);

  const [activeCallTarget, setActiveCallTarget] = useState<CallTarget | null>(null);

  const [activeTab, setActiveTabState] = useState<ActiveTabType>(() => {
    const savedUser = localStorage.getItem('conecta_current_user_pe_v2');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.permiso === 'ADMIN') return 'portal';
      } catch {
        return 'catalogo';
      }
    }
    return 'catalogo';
  });

  const [filtroOficio, setFiltroOficio] = useState<string>('TODOS');
  const [filtroRegion, setFiltroRegionState] = useState<string>('TODOS');
  const [filtroProvincia, setFiltroProvinciaState] = useState<string>('TODOS');
  const [filtroDistrito, setFiltroDistrito] = useState<string>('TODOS');

  const setFiltroRegion = (nextRegion: string) => {
    setFiltroRegionState(nextRegion);
    setFiltroProvinciaState('TODOS');
    setFiltroDistrito('TODOS');
  };

  const setFiltroProvincia = (nextProvincia: string) => {
    setFiltroProvinciaState(nextProvincia);
    setFiltroDistrito('TODOS');
  };

  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Servicio | null>(null);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Orden | null>(null);
  const [pedidoEnDetalleId, setPedidoEnDetalleId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [showChatInbox, setShowChatInbox] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const currentRole: PermisoRol = currentUser?.permiso || 'USUARIO';
  const adminUnico: UsuarioRegistrado =
    usuarios.find(u => u.permiso === 'ADMIN') || USUARIOS_INICIALES.find(u => u.permiso === 'ADMIN')!;

  // Sync to localStorage safely (avoids QuotaExceededError on large photos/videos)
  useEffect(() => {
    safeLocalStorageSet('conecta_correos_permitidos_pe_v2', correosPermitidos);
  }, [correosPermitidos]);

  useEffect(() => {
    safeLocalStorageSet('conecta_usuarios_pe_v2', usuarios);
  }, [usuarios]);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSet('conecta_current_user_pe_v2', currentUser);
    } else {
      localStorage.removeItem('conecta_current_user_pe_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorageSet('conecta_servicios_pe_v2', servicios);
  }, [servicios]);

  useEffect(() => {
    safeLocalStorageSet('conecta_planes_publicacion_pe_v2', planesPublicacion);
  }, [planesPublicacion]);

  useEffect(() => {
    safeLocalStorageSet('conecta_promo_lanzamiento_pe_v2', promoConfig);
  }, [promoConfig]);

  useEffect(() => {
    safeLocalStorageSet('conecta_imprevistos_pe_v2', imprevistos);
  }, [imprevistos]);

  const carritoOwnerKey = currentUser ? currentUser.id : 'GUEST';
  const carrito: ItemCarrito[] = carritosPorUsuario[carritoOwnerKey] || [];

  const setCarrito = (updater: ItemCarrito[] | ((prev: ItemCarrito[]) => ItemCarrito[])) => {
    setCarritosPorUsuario(prevMap => {
      const prevList = prevMap[carritoOwnerKey] || [];
      const nextList = typeof updater === 'function' ? updater(prevList) : updater;
      return {
        ...prevMap,
        [carritoOwnerKey]: nextList
      };
    });
  };

  useEffect(() => {
    safeLocalStorageSet('conecta_carritos_por_usuario_pe_v2', carritosPorUsuario);
  }, [carritosPorUsuario]);

  useEffect(() => {
    safeLocalStorageSet('conecta_ordenes_pe_v2', ordenes);
  }, [ordenes]);

  useEffect(() => {
    safeLocalStorageSet('conecta_certificados_pe_v2', certificados);
  }, [certificados]);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Real-time Server Sync for Worker <-> Client Direct Chat
  const fetchConversations = async () => {
    if (!currentUser) {
      setChatConversations([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (currentRole === 'ADMIN') {
        params.set('role', 'ADMIN');
      } else {
        params.set('role', 'USUARIO');
        params.set('userId', currentUser.id);
        if (currentUser.dni) params.set('dni', currentUser.dni);
        if (currentUser.telefonoWhatsapp) params.set('telefono', currentUser.telefonoWhatsapp);
      }
      const res = await fetch(`/api/chat/conversations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.conversations)) {
          setChatConversations(data.conversations);
        }
      }
    } catch {
      // Ignore transient network errors during dev restart
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, [currentUser?.id, currentUser?.dni, currentRole]);

  useEffect(() => {
    let closedByCleanup = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
      wsRef.current = ws;

      ws.onopen = () => {
        void fetchConversations();
      };

      ws.onmessage = event => {
        try {
          const payload = JSON.parse(event.data);
          if (
            (payload.type === 'chat:message' || payload.type === 'chat:conversation') &&
            payload.conversation
          ) {
            const incoming: ChatConversation = payload.conversation;
            const belongsToCurrent =
              Boolean(currentUser) &&
              (currentRole === 'ADMIN' ||
                incoming.clienteId === currentUser?.id ||
                incoming.trabajadorId === currentUser?.id ||
                (Boolean(currentUser?.dni) &&
                  (incoming.clienteDni === currentUser?.dni ||
                    incoming.trabajadorDni === currentUser?.dni)));

            if (!belongsToCurrent) return;

            setChatConversations(prev => {
              const filtered = prev.filter(c => c.id !== incoming.id);
              return [incoming, ...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
            });
          }
        } catch {
          // Ignore malformed WS payloads
        }
      };

      ws.onclose = () => {
        if (!closedByCleanup) {
          reconnectTimer = setTimeout(connectWs, 2500);
        }
      };
    };

    connectWs();

    return () => {
      closedByCleanup = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [currentUser?.id, currentUser?.dni, currentRole]);

  // Permitted email validation (domain or explicit whitelisted email)
  const esCorreoPermitido = (email: string): boolean => {
    const clean = email.trim().toLowerCase();
    const validSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
    if (!validSyntax) return false;
    return correosPermitidos.some(regla => {
      const r = regla.trim().toLowerCase();
      if (r.startsWith('@')) {
        return clean.endsWith(r);
      }
      return clean === r;
    });
  };

  const agregarCorreoPermitido = (regla: string): { ok: boolean; error?: string } => {
    const clean = regla.trim().toLowerCase();
    if (!clean) {
      return { ok: false, error: 'Ingresa un dominio (ej. @empresa.pe) o un correo electrónico completo.' };
    }
    const isDomain = clean.startsWith('@') && /^@[a-z0-9.-]+\.[a-z]{2,}$/.test(clean);
    const isEmail = !clean.startsWith('@') && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
    if (!isDomain && !isEmail) {
      return { ok: false, error: 'Formato inválido. Usa @dominio.com o usuario@dominio.com.' };
    }
    if (correosPermitidos.includes(clean)) {
      return { ok: false, error: `La regla "${clean}" ya está en la lista de correos permitidos.` };
    }
    setCorreosPermitidos(prev => [...prev, clean]);
    showToast('Correo / Dominio Permitido Agregado', `Se autorizó "${clean}" para registro e inicio de sesión.`, 'success');
    return { ok: true };
  };

  const eliminarCorreoPermitido = (regla: string): { ok: boolean; error?: string } => {
    const clean = regla.trim().toLowerCase();
    if (clean === '@conectaoficios.pe' || clean === adminUnico.email.toLowerCase()) {
      return {
        ok: false,
        error: 'No se puede eliminar el dominio del Administrador Único (@conectaoficios.pe).'
      };
    }
    setCorreosPermitidos(prev => prev.filter(r => r !== clean));
    showToast('Regla Eliminada', `"${clean}" fue retirado de los correos permitidos.`, 'info');
    return { ok: true };
  };

  // Enforce strict 2-permission boundary on navigation (catalogo, imprevistos, solicitud & acceso open to visitors; perfiles & admin tabs strictly ADMIN)
  const setActiveTab = (tab: ActiveTabType) => {
    if (
      !currentUser &&
      tab !== 'catalogo' &&
      tab !== 'imprevistos' &&
      tab !== 'solicitud' &&
      tab !== 'acceso'
    ) {
      setActiveTabState('acceso');
      showToast(
        'Inicio de Sesión Opcional',
        'Inicia sesión o regístrate con tu correo permitido y DNI para continuar a esta sección.',
        'info'
      );
      return;
    }
    if (
      (tab === 'portal' || tab === 'perfil-inspeccion' || tab === 'perfiles') &&
      currentUser?.permiso !== 'ADMIN'
    ) {
      showToast(
        'Acceso Restringido al Administrador',
        'Solo el Administrador Único del sistema puede ver los perfiles de usuarios y especialistas.',
        'warning'
      );
      return;
    }
    setActiveTabState(tab);
  };

  const inspeccionarPerfil = (target: InspectedProfileTarget) => {
    if (currentUser?.permiso !== 'ADMIN') return;
    setInspectedProfile(target);
    setActiveTabState('perfil-inspeccion');
  };

  const verPerfilPublico = (target: PublicProfileTarget) => {
    setPublicProfileTarget(target);
  };

  const cerrarPerfilPublico = () => {
    setPublicProfileTarget(null);
  };

  const volverAConsolaAdmin = () => {
    if (inspectedProfile?.returnAdminTab) {
      setAdminTab(inspectedProfile.returnAdminTab);
    }
    setInspectedProfile(null);
    setActiveTabState('portal');
  };

  const setCurrentRole = (newRole: PermisoRol) => {
    if (newRole === 'ADMIN') {
      if (currentUser?.permiso === 'ADMIN') {
        setActiveTabState('portal');
        setAdminTab('publicaciones');
        return;
      }
      showToast(
        'Autenticación de Administrador Único',
        'Cierra sesión e ingresa con el correo permitido del Administrador Único.',
        'info'
      );
    } else if (currentUser?.permiso === 'USUARIO') {
      setActiveTabState('catalogo');
    }
  };

  const cerrarSesion = () => {
    setCurrentUser(null);
    setInspectedProfile(null);
    setCarritosPorUsuario(prev => ({ ...prev, GUEST: [] }));
    setSelectedServiceForModal(null);
    setShowPortalModal(false);
    setShowAuthModal(null);
    setChatConversations([]);
    setActiveChatConversationId(null);
    setActiveWhatsAppChat(null);
    setShowChatInbox(false);
    setActiveCallTarget(null);
    setActiveTabState('catalogo');
    showToast('Sesión Cerrada', 'Has cerrado sesión correctamente. Las solicitudes de cada usuario permanecen guardadas en su cuenta.', 'info');
  };

  const cambiarCuentaUsuario = () => {
    cerrarSesion();
  };

  // Register new user (Strictly assigns 'USUARIO' permission & enforces permitted email)
  const registrarUsuario = (data: RegistroUsuarioPayload): { ok: boolean; error?: string } => {
    const tipoDoc = data.tipoDocumento || 'DNI';
    const docCheck = validarNumeroDocumento(data.dni, tipoDoc);
    const cleanEmail = data.email.trim().toLowerCase();

    if (!esCorreoPermitido(cleanEmail)) {
      return {
        ok: false,
        error: `Correo no permitido. Debes registrar un correo autorizado (${correosPermitidos.join(', ')}).`
      };
    }
    if (cleanEmail === adminUnico.email.toLowerCase()) {
      return {
        ok: false,
        error: 'Este correo pertenece al Administrador Único del sistema y no puede registrarse como Usuario.'
      };
    }
    if (!docCheck.ok) {
      return { ok: false, error: docCheck.error };
    }
    if (usuarios.some(u => u.dni === docCheck.clean)) {
      return { ok: false, error: `Ya existe una cuenta registrada con el documento ${docCheck.clean}.` };
    }
    if (usuarios.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'Este correo electrónico ya se encuentra registrado.' };
    }
    if (data.rucNumero && data.rucNumero.replace(/\D/g, '').length !== 11) {
      return { ok: false, error: 'Si ingresas un RUC, debe contener exactamente 11 dígitos.' };
    }

    const fechaActual = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const hasMedia = Boolean(
      data.dniFotoUrl || data.fotoPersonaUrl || data.videoPersonaUrl || data.certificadoOpcionalUrl
    );

    const ubicacionResuelta = inferUbicacionPeru(data.distrito, data.provincia, data.region);
    const cleanRuc = data.rucNumero ? data.rucNumero.replace(/\D/g, '') : undefined;

    const nuevoUsuario: UsuarioRegistrado = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      permiso: 'USUARIO', // El Administrador es único; el registro solo otorga permiso USUARIO
      tipoUsuario: data.tipoUsuario || 'AMBOS',
      estadoCuenta: 'PENDIENTE', // Pendiente de aceptación por el Administrador
      tipoDocumento: tipoDoc,
      dni: docCheck.clean,
      nombreCompleto: data.nombreCompleto.trim(),
      telefonoWhatsapp: data.telefonoWhatsapp.trim(),
      email: cleanEmail,
      region: ubicacionResuelta.region,
      provincia: ubicacionResuelta.provincia,
      distrito: ubicacionResuelta.distrito,
      direccion: data.direccion.trim(),
      password: data.password,
      fechaRegistro: fechaActual,
      especialidadPrincipal:
        data.especialidadPrincipal?.trim() ||
        (data.tipoUsuario === 'CLIENTE_HOGAR'
          ? 'Cliente de Hogar (Publica Imprevistos)'
          : 'Ofertante / Especialista de Oficio'),
      dniFotoUrl: data.dniFotoUrl,
      fotoPersonaUrl: data.fotoPersonaUrl,
      videoPersonaUrl: data.videoPersonaUrl,
      videoPersonaNombre: data.videoPersonaNombre,
      certificadoOpcionalUrl: data.certificadoOpcionalUrl,
      certificadoOpcionalNombre: data.certificadoOpcionalNombre,
      emergenciaFamiliarNombre: data.emergenciaFamiliarNombre?.trim() || undefined,
      emergenciaFamiliarParentesco: data.emergenciaFamiliarParentesco?.trim() || undefined,
      emergenciaFamiliarTelefono: data.emergenciaFamiliarTelefono?.trim() || undefined,
      rucNumero: cleanRuc || undefined,
      rucActivo: cleanRuc ? true : undefined,
      tipoComprobanteTributario: cleanRuc ? 'RECIBO_HONORARIOS' : undefined,
      estadoVerificacionMedia: hasMedia ? 'PENDIENTE_REVISION' : 'SIN_ADJUNTOS'
    };

    setUsuarios(prev => [nuevoUsuario, ...prev]);
    setCarritosPorUsuario(prev => {
      const guestItems = prev.GUEST || [];
      if (guestItems.length === 0) return prev;
      return {
        ...prev,
        GUEST: [],
        [nuevoUsuario.id]: guestItems
      };
    });
    setCurrentUser(nuevoUsuario);
    setActiveTabState('perfil');
    showToast(
      'Registro Completado · Pendiente de Aceptación',
      `Bienvenido ${nuevoUsuario.nombreCompleto}. Completa tu expediente de identidad, antecedentes y acuerdos en tu perfil mientras el Administrador aprueba tu cuenta.`,
      'info'
    );
    return { ok: true };
  };

  // Unified single login: validates permitted email, applies optional verification uploads on login, and resolves USUARIO or ADMIN
  const iniciarSesion = (
    email: string,
    password: string,
    mediaOnLogin?: VerificacionMediaPayload
  ): { ok: boolean; error?: string; notRegistered?: boolean } => {
    const cleanEmail = email.trim().toLowerCase();

    if (!esCorreoPermitido(cleanEmail)) {
      return {
        ok: false,
        error: `Correo no permitido. Para iniciar sesión debes usar un correo autorizado (${correosPermitidos.join(', ')}).`
      };
    }

    const found = usuarios.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        ok: false,
        notRegistered: true,
        error: 'Este correo permitido aún no está registrado. Puedes registrarte ahora con tu DNI o documento.'
      };
    }

    if (found.password !== password) {
      return { ok: false, error: 'Contraseña incorrecta para este correo.' };
    }

    if (found.estadoCuenta === 'SUSPENDIDO') {
      return {
        ok: false,
        error: 'Esta cuenta ha sido suspendida por el Administrador del sistema.'
      };
    }

    let userAfterLogin = found;

    if (mediaOnLogin) {
      const tipoDoc = mediaOnLogin.tipoDocumento || found.tipoDocumento || 'DNI';
      const cleanDniInput = mediaOnLogin.dni ? mediaOnLogin.dni.trim() : '';
      if (cleanDniInput) {
        const docCheck = validarNumeroDocumento(cleanDniInput, tipoDoc);
        if (!docCheck.ok) {
          return { ok: false, error: docCheck.error };
        }
        if (usuarios.some(u => u.id !== found.id && u.dni === docCheck.clean)) {
          return { ok: false, error: `Otro usuario ya tiene registrado el documento ${docCheck.clean}.` };
        }
      }

      const attachedAnyMedia = Boolean(
        mediaOnLogin.dniFotoUrl ||
          mediaOnLogin.fotoPersonaUrl ||
          mediaOnLogin.videoPersonaUrl ||
          mediaOnLogin.certificadoOpcionalUrl ||
          (cleanDniInput && cleanDniInput.toUpperCase() !== found.dni)
      );

      if (attachedAnyMedia) {
        userAfterLogin = {
          ...found,
          tipoDocumento: tipoDoc,
          dni: cleanDniInput ? validarNumeroDocumento(cleanDniInput, tipoDoc).clean : found.dni,
          dniFotoUrl: mediaOnLogin.dniFotoUrl || found.dniFotoUrl,
          fotoPersonaUrl: mediaOnLogin.fotoPersonaUrl || found.fotoPersonaUrl,
          videoPersonaUrl: mediaOnLogin.videoPersonaUrl || found.videoPersonaUrl,
          videoPersonaNombre: mediaOnLogin.videoPersonaNombre || found.videoPersonaNombre,
          certificadoOpcionalUrl: mediaOnLogin.certificadoOpcionalUrl || found.certificadoOpcionalUrl,
          certificadoOpcionalNombre: mediaOnLogin.certificadoOpcionalNombre || found.certificadoOpcionalNombre,
          estadoVerificacionMedia: 'PENDIENTE_REVISION',
          observacionVerificacion: undefined
        };
        setUsuarios(prev => prev.map(u => (u.id === found.id ? userAfterLogin : u)));
      }
    }

    setCurrentUser(userAfterLogin);
    setInspectedProfile(null);
    setActiveTabState(userAfterLogin.permiso === 'ADMIN' ? 'portal' : 'perfil');
    if (userAfterLogin.permiso === 'ADMIN') {
      setAdminTab('publicaciones');
    }
    showToast(
      'Sesión Iniciada Correctamente',
      `Bienvenido ${userAfterLogin.nombreCompleto} (${userAfterLogin.permiso === 'ADMIN' ? 'Administrador Único' : 'Usuario'}).`,
      'success'
    );
    return { ok: true };
  };

  // Helper: propagate edited user profile data to all their publications, offers, incidents, cart items, and active modal
  const sincronizarPublicacionesConUsuario = (
    prevUser: UsuarioRegistrado,
    nextUser: UsuarioRegistrado
  ) => {
    const matchesServicio = (srv: Servicio) =>
      srv.autorUsuarioId === prevUser.id ||
      (Boolean(prevUser.dni) && srv.tecnicoDni === prevUser.dni);

    const patchServicio = (srv: Servicio): Servicio => ({
      ...srv,
      autorUsuarioId: srv.autorUsuarioId || nextUser.id,
      tecnicoNombre: nextUser.nombreCompleto,
      tecnicoDni: nextUser.dni,
      tecnicoTelefono: nextUser.telefonoWhatsapp,
      tecnicoEmail: nextUser.email,
      region: nextUser.region,
      provincia: nextUser.provincia,
      distrito: nextUser.distrito,
      codigoCertificado:
        srv.codigoCertificado === `DNI-${prevUser.dni}`
          ? `DNI-${nextUser.dni}`
          : srv.codigoCertificado
    });

    setServicios(prev =>
      prev.map(srv => (matchesServicio(srv) ? patchServicio(srv) : srv))
    );

    setSelectedServiceForModal(prev =>
      prev && matchesServicio(prev) ? patchServicio(prev) : prev
    );

    setCarritosPorUsuario(prevMap => {
      let changed = false;
      const nextMap: Record<string, ItemCarrito[]> = {};
      for (const [ownerKey, items] of Object.entries(prevMap)) {
        const updatedItems = items.map(it => {
          if (!matchesServicio(it.servicio)) return it;
          changed = true;
          return { ...it, servicio: patchServicio(it.servicio) };
        });
        nextMap[ownerKey] = updatedItems;
      }
      return changed ? nextMap : prevMap;
    });

    setImprevistos(prev =>
      prev.map(imp => {
        const esAutor =
          imp.autorUsuarioId === prevUser.id ||
          (Boolean(prevUser.dni) && imp.autorDni === prevUser.dni);
        let ofertaCambiada = false;
        const ofertasActualizadas = imp.ofertas.map(of => {
          const esOfertante =
            of.ofertanteUsuarioId === prevUser.id ||
            (Boolean(prevUser.dni) && of.ofertanteDni === prevUser.dni);
          if (!esOfertante) return of;
          ofertaCambiada = true;
          return {
            ...of,
            ofertanteUsuarioId: of.ofertanteUsuarioId || nextUser.id,
            ofertanteNombre: nextUser.nombreCompleto,
            ofertanteDni: nextUser.dni,
            ofertanteTelefono: nextUser.telefonoWhatsapp,
            ofertanteFotoUrl: nextUser.fotoPersonaUrl
          };
        });
        if (!esAutor && !ofertaCambiada) return imp;
        return {
          ...imp,
          autorUsuarioId: esAutor ? (imp.autorUsuarioId || nextUser.id) : imp.autorUsuarioId,
          autorNombre: esAutor ? nextUser.nombreCompleto : imp.autorNombre,
          autorDni: esAutor ? nextUser.dni : imp.autorDni,
          autorTelefono:
            esAutor && imp.autorTelefono === prevUser.telefonoWhatsapp
              ? nextUser.telefonoWhatsapp
              : imp.autorTelefono,
          ofertas: ofertasActualizadas
        };
      })
    );
  };

  // User/Admin updates their own complete profile data
  const actualizarMiPerfil = (data: ActualizarPerfilPayload): { ok: boolean; error?: string } => {
    if (!currentUser) return { ok: false, error: 'Debes iniciar sesión primero.' };
    const tipoDoc = data.tipoDocumento || currentUser.tipoDocumento || 'DNI';
    const docCheck = validarNumeroDocumento(data.dni, tipoDoc);
    if (!docCheck.ok) {
      return { ok: false, error: docCheck.error };
    }
    if (data.nombreCompleto.trim().length < 4) {
      return { ok: false, error: 'Ingresa tus nombres y apellidos completos.' };
    }
    if (data.telefonoWhatsapp.replace(/\D/g, '').length < 9) {
      return { ok: false, error: 'Ingresa un número celular / WhatsApp válido.' };
    }
    if (data.direccion.trim().length < 5) {
      return { ok: false, error: 'Ingresa tu dirección completa.' };
    }
    if (usuarios.some(u => u.id !== currentUser.id && u.dni === docCheck.clean)) {
      return { ok: false, error: `Otro usuario ya tiene registrado el documento ${docCheck.clean}.` };
    }
    if (data.password && data.password.trim().length > 0 && data.password.trim().length < 6) {
      return { ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    const nextEmail = data.email !== undefined ? data.email.trim().toLowerCase() : currentUser.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return { ok: false, error: 'Ingresa un correo electrónico válido (ej. nombre@correo.com).' };
    }
    if (usuarios.some(u => u.id !== currentUser.id && u.email.toLowerCase() === nextEmail)) {
      return { ok: false, error: `Otro usuario ya tiene registrado el correo ${nextEmail}.` };
    }

    const ubicacionResuelta = inferUbicacionPeru(data.distrito, data.provincia, data.region);

    const actualizado: UsuarioRegistrado = {
      ...currentUser,
      tipoDocumento: tipoDoc,
      dni: docCheck.clean,
      nombreCompleto: data.nombreCompleto.trim(),
      email: nextEmail,
      telefonoWhatsapp: data.telefonoWhatsapp.trim(),
      region: ubicacionResuelta.region,
      provincia: ubicacionResuelta.provincia,
      distrito: ubicacionResuelta.distrito,
      direccion: data.direccion.trim(),
      tipoUsuario: data.tipoUsuario || currentUser.tipoUsuario || 'AMBOS',
      especialidadPrincipal: data.especialidadPrincipal?.trim() || currentUser.especialidadPrincipal,
      password: data.password && data.password.trim().length >= 6 ? data.password.trim() : currentUser.password
    };

    if (nextEmail !== currentUser.email.toLowerCase() && !esCorreoPermitido(nextEmail)) {
      setCorreosPermitidos(prev => (prev.includes(nextEmail) ? prev : [...prev, nextEmail]));
    }

    sincronizarPublicacionesConUsuario(currentUser, actualizado);

    setUsuarios(prev => prev.map(u => (u.id === currentUser.id ? actualizado : u)));
    setCurrentUser(actualizado);
    showToast(
      'Perfil y Publicaciones Actualizados',
      'Tus datos personales se actualizaron en tu cuenta y en todas tus publicaciones.',
      'success'
    );
    return { ok: true };
  };

  // User uploads/updates DNI photo, Person photo, Person video, and optional certificate
  const actualizarVerificacionMedia = (
    media: VerificacionMediaPayload
  ): { ok: boolean; error?: string } => {
    if (!currentUser) return { ok: false, error: 'Debes iniciar sesión primero.' };

    const tipoDoc = media.tipoDocumento || currentUser.tipoDocumento || 'DNI';
    const docCheck = validarNumeroDocumento(media.dni || currentUser.dni, tipoDoc);
    if (!docCheck.ok) {
      return { ok: false, error: docCheck.error };
    }
    if (usuarios.some(u => u.id !== currentUser.id && u.dni === docCheck.clean)) {
      return { ok: false, error: `Otro usuario ya registró el documento ${docCheck.clean}.` };
    }

    const updated: UsuarioRegistrado = {
      ...currentUser,
      tipoDocumento: tipoDoc,
      dni: docCheck.clean,
      dniFotoUrl: media.dniFotoUrl !== undefined ? media.dniFotoUrl : currentUser.dniFotoUrl,
      fotoPersonaUrl: media.fotoPersonaUrl !== undefined ? media.fotoPersonaUrl : currentUser.fotoPersonaUrl,
      videoPersonaUrl: media.videoPersonaUrl !== undefined ? media.videoPersonaUrl : currentUser.videoPersonaUrl,
      videoPersonaNombre:
        media.videoPersonaNombre !== undefined ? media.videoPersonaNombre : currentUser.videoPersonaNombre,
      certificadoOpcionalUrl:
        media.certificadoOpcionalUrl !== undefined
          ? media.certificadoOpcionalUrl
          : currentUser.certificadoOpcionalUrl,
      certificadoOpcionalNombre:
        media.certificadoOpcionalNombre !== undefined
          ? media.certificadoOpcionalNombre
          : currentUser.certificadoOpcionalNombre,
      estadoVerificacionMedia:
        currentUser.permiso === 'ADMIN' ? 'VERIFICADO' : 'PENDIENTE_REVISION',
      observacionVerificacion: undefined
    };

    sincronizarPublicacionesConUsuario(currentUser, updated);
    setUsuarios(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);
    showToast(
      'Documentos y Multimedia Guardados',
      'Tu documentación fue enviada al Administrador para verificación.',
      'success'
    );
    return { ok: true };
  };

  // Helper to apply 5-block compliance payload cleanly to any user record
  const applyExpedienteToUser = (
    target: UsuarioRegistrado,
    data: ExpedienteCumplimientoPayload,
    enforcePendingReview: boolean
  ): { ok: boolean; error?: string; next?: UsuarioRegistrado } => {
    const tipoDoc = data.tipoDocumento || target.tipoDocumento || 'DNI';
    let finalDni = target.dni;
    if (data.dni !== undefined) {
      const docCheck = validarNumeroDocumento(data.dni, tipoDoc);
      if (!docCheck.ok) return { ok: false, error: docCheck.error };
      if (usuarios.some(u => u.id !== target.id && u.dni === docCheck.clean)) {
        return { ok: false, error: `Otro usuario ya registró el documento ${docCheck.clean}.` };
      }
      finalDni = docCheck.clean;
    }

    if (data.rucNumero !== undefined && data.rucNumero.trim() !== '') {
      const cleanRuc = data.rucNumero.replace(/\D/g, '');
      if (cleanRuc.length !== 11) {
        return { ok: false, error: 'El RUC debe contener exactamente 11 dígitos numéricos.' };
      }
    }

    const cleanRucFinal =
      data.rucNumero !== undefined
        ? data.rucNumero.trim() === ''
          ? undefined
          : data.rucNumero.replace(/\D/g, '')
        : target.rucNumero;

    const uploadedComplianceDocs = Boolean(
      data.comprobanteDomicilioUrl ||
        data.fichaRucUrl ||
        data.antecedentesPolicialesUrl ||
        data.antecedentesPenalesUrl ||
        data.antecedentesJudicialesUrl ||
        data.certificadoOpcionalUrl ||
        data.licenciaConducirUrl ||
        data.dniFotoUrl
    );

    const next: UsuarioRegistrado = {
      ...target,
      tipoDocumento: tipoDoc,
      dni: finalDni,
      dniFotoUrl: data.dniFotoUrl !== undefined ? data.dniFotoUrl : target.dniFotoUrl,
      fotoPersonaUrl: data.fotoPersonaUrl !== undefined ? data.fotoPersonaUrl : target.fotoPersonaUrl,
      videoPersonaUrl: data.videoPersonaUrl !== undefined ? data.videoPersonaUrl : target.videoPersonaUrl,
      videoPersonaNombre:
        data.videoPersonaNombre !== undefined ? data.videoPersonaNombre : target.videoPersonaNombre,
      comprobanteDomicilioTipo:
        data.comprobanteDomicilioTipo !== undefined
          ? data.comprobanteDomicilioTipo
          : target.comprobanteDomicilioTipo,
      comprobanteDomicilioUrl:
        data.comprobanteDomicilioUrl !== undefined
          ? data.comprobanteDomicilioUrl
          : target.comprobanteDomicilioUrl,
      comprobanteDomicilioNombre:
        data.comprobanteDomicilioNombre !== undefined
          ? data.comprobanteDomicilioNombre
          : target.comprobanteDomicilioNombre,
      emergenciaFamiliarNombre:
        data.emergenciaFamiliarNombre !== undefined
          ? data.emergenciaFamiliarNombre.trim() || undefined
          : target.emergenciaFamiliarNombre,
      emergenciaFamiliarParentesco:
        data.emergenciaFamiliarParentesco !== undefined
          ? data.emergenciaFamiliarParentesco.trim() || undefined
          : target.emergenciaFamiliarParentesco,
      emergenciaFamiliarTelefono:
        data.emergenciaFamiliarTelefono !== undefined
          ? data.emergenciaFamiliarTelefono.trim() || undefined
          : target.emergenciaFamiliarTelefono,
      rucNumero: cleanRucFinal,
      rucActivo: data.rucActivo !== undefined ? data.rucActivo : target.rucActivo,
      tipoComprobanteTributario:
        data.tipoComprobanteTributario !== undefined
          ? data.tipoComprobanteTributario
          : target.tipoComprobanteTributario,
      fichaRucUrl: data.fichaRucUrl !== undefined ? data.fichaRucUrl : target.fichaRucUrl,
      fichaRucNombre: data.fichaRucNombre !== undefined ? data.fichaRucNombre : target.fichaRucNombre,
      antecedentesPolicialesUrl:
        data.antecedentesPolicialesUrl !== undefined
          ? data.antecedentesPolicialesUrl
          : target.antecedentesPolicialesUrl,
      antecedentesPolicialesNombre:
        data.antecedentesPolicialesNombre !== undefined
          ? data.antecedentesPolicialesNombre
          : target.antecedentesPolicialesNombre,
      antecedentesPenalesUrl:
        data.antecedentesPenalesUrl !== undefined ? data.antecedentesPenalesUrl : target.antecedentesPenalesUrl,
      antecedentesPenalesNombre:
        data.antecedentesPenalesNombre !== undefined
          ? data.antecedentesPenalesNombre
          : target.antecedentesPenalesNombre,
      antecedentesJudicialesUrl:
        data.antecedentesJudicialesUrl !== undefined
          ? data.antecedentesJudicialesUrl
          : target.antecedentesJudicialesUrl,
      antecedentesJudicialesNombre:
        data.antecedentesJudicialesNombre !== undefined
          ? data.antecedentesJudicialesNombre
          : target.antecedentesJudicialesNombre,
      certificacionTecnicaDetalle:
        data.certificacionTecnicaDetalle !== undefined
          ? data.certificacionTecnicaDetalle.trim() || undefined
          : target.certificacionTecnicaDetalle,
      certificadoOpcionalUrl:
        data.certificadoOpcionalUrl !== undefined ? data.certificadoOpcionalUrl : target.certificadoOpcionalUrl,
      certificadoOpcionalNombre:
        data.certificadoOpcionalNombre !== undefined
          ? data.certificadoOpcionalNombre
          : target.certificadoOpcionalNombre,
      licenciaConducirNumero:
        data.licenciaConducirNumero !== undefined
          ? data.licenciaConducirNumero.trim().toUpperCase() || undefined
          : target.licenciaConducirNumero,
      licenciaConducirCategoria:
        data.licenciaConducirCategoria !== undefined
          ? data.licenciaConducirCategoria
          : target.licenciaConducirCategoria,
      licenciaConducirUrl:
        data.licenciaConducirUrl !== undefined ? data.licenciaConducirUrl : target.licenciaConducirUrl,
      licenciaConducirNombre:
        data.licenciaConducirNombre !== undefined ? data.licenciaConducirNombre : target.licenciaConducirNombre,
      contratoTipo: data.contratoTipo !== undefined ? data.contratoTipo : target.contratoTipo,
      contratoFirmado: data.contratoFirmado !== undefined ? data.contratoFirmado : target.contratoFirmado,
      contratoFirmaNombre:
        data.contratoFirmaNombre !== undefined ? data.contratoFirmaNombre : target.contratoFirmaNombre,
      contratoFechaFirma:
        data.contratoFechaFirma !== undefined ? data.contratoFechaFirma : target.contratoFechaFirma,
      normasConductaFirmadas:
        data.normasConductaFirmadas !== undefined ? data.normasConductaFirmadas : target.normasConductaFirmadas,
      normasConductaFecha:
        data.normasConductaFecha !== undefined ? data.normasConductaFecha : target.normasConductaFecha,
      inventarioHerramientas:
        data.inventarioHerramientas !== undefined ? data.inventarioHerramientas : target.inventarioHerramientas,
      inventarioFirmado:
        data.inventarioFirmado !== undefined ? data.inventarioFirmado : target.inventarioFirmado,
      inventarioFechaFirma:
        data.inventarioFechaFirma !== undefined ? data.inventarioFechaFirma : target.inventarioFechaFirma,
      estadoVerificacionMedia:
        enforcePendingReview && uploadedComplianceDocs && target.permiso !== 'ADMIN'
          ? 'PENDIENTE_REVISION'
          : target.estadoVerificacionMedia
    };

    return { ok: true, next };
  };

  const actualizarExpedienteCumplimiento = (
    data: ExpedienteCumplimientoPayload,
    silentToast = false
  ): { ok: boolean; error?: string } => {
    if (!currentUser) return { ok: false, error: 'Debes iniciar sesión primero.' };
    const result = applyExpedienteToUser(currentUser, data, true);
    if (!result.ok || !result.next) {
      return { ok: false, error: result.error };
    }
    const updatedUser = result.next;
    setUsuarios(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    if (!silentToast) {
      showToast(
        'Expediente Actualizado',
        'Tu documentación, antecedentes, validaciones técnicas o acuerdos fueron guardados.',
        'success'
      );
    }
    return { ok: true };
  };

  const actualizarExpedientePorAdmin = (
    usuarioId: string,
    data: ExpedienteCumplimientoPayload
  ): { ok: boolean; error?: string } => {
    const target = usuarios.find(u => u.id === usuarioId);
    if (!target) return { ok: false, error: 'Usuario no encontrado.' };
    const result = applyExpedienteToUser(target, data, false);
    if (!result.ok || !result.next) {
      return { ok: false, error: result.error };
    }
    const updatedUser = result.next;
    setUsuarios(prev => prev.map(u => (u.id === usuarioId ? updatedUser : u)));
    if (currentUser?.id === usuarioId) {
      setCurrentUser(updatedUser);
    }
    showToast(
      'Expediente Actualizado por Admin',
      `Se guardaron los cambios en el legajo de ${updatedUser.nombreCompleto}.`,
      'success'
    );
    return { ok: true };
  };

  // Admin: Accept, mark pending, or suspend user accounts
  const cambiarEstadoCuentaUsuario = (usuarioId: string, nuevoEstado: EstadoCuentaUsuario) => {
    const target = usuarios.find(u => u.id === usuarioId);
    if (!target) return;
    if (target.permiso === 'ADMIN' && nuevoEstado !== 'ACTIVO') {
      showToast('Operación Protegida', 'No se puede suspender la cuenta del Administrador Único.', 'warning');
      return;
    }

    setUsuarios(prev =>
      prev.map(u => (u.id === usuarioId ? { ...u, estadoCuenta: nuevoEstado } : u))
    );
    if (currentUser?.id === usuarioId) {
      setCurrentUser(prev => (prev ? { ...prev, estadoCuenta: nuevoEstado } : prev));
    }

    const msg =
      nuevoEstado === 'ACTIVO'
        ? `La cuenta de ${target.nombreCompleto} fue aceptada y activada.`
        : nuevoEstado === 'SUSPENDIDO'
        ? `La cuenta de ${target.nombreCompleto} fue suspendida.`
        : `La cuenta de ${target.nombreCompleto} quedó en estado pendiente.`;
    showToast('Gestión de Usuario Actualizada', msg, nuevoEstado === 'ACTIVO' ? 'success' : 'warning');
  };

  // Admin: Verify, observe, or manage user's uploaded media (DNI photo, person photo, video, certificate)
  const gestionarVerificacionUsuarioAdmin = (
    usuarioId: string,
    estado: EstadoVerificacionMedia,
    observacion?: string
  ) => {
    const target = usuarios.find(u => u.id === usuarioId);
    if (!target) return;

    const cleanObs = estado === 'OBSERVADO' ? observacion?.trim() || 'Revisar nitidez del documento o antecedentes.' : undefined;

    setUsuarios(prev =>
      prev.map(u =>
        u.id === usuarioId
          ? { ...u, estadoVerificacionMedia: estado, observacionVerificacion: cleanObs }
          : u
      )
    );
    if (currentUser?.id === usuarioId) {
      setCurrentUser(prev =>
        prev ? { ...prev, estadoVerificacionMedia: estado, observacionVerificacion: cleanObs } : prev
      );
    }

    showToast(
      'Verificación Documental Actualizada',
      `Documentación de ${target.nombreCompleto} marcada como: ${estado}.`,
      estado === 'VERIFICADO' ? 'success' : 'warning'
    );
  };

  const eliminarArchivoVerificacionAdmin = (
    usuarioId: string,
    campo: CampoArchivoVerificacion
  ) => {
    const clearCompanionName = (obj: UsuarioRegistrado): UsuarioRegistrado => {
      const next: UsuarioRegistrado = { ...obj, [campo]: undefined };
      if (campo === 'videoPersonaUrl') next.videoPersonaNombre = undefined;
      if (campo === 'certificadoOpcionalUrl') next.certificadoOpcionalNombre = undefined;
      if (campo === 'comprobanteDomicilioUrl') next.comprobanteDomicilioNombre = undefined;
      if (campo === 'fichaRucUrl') next.fichaRucNombre = undefined;
      if (campo === 'antecedentesPolicialesUrl') next.antecedentesPolicialesNombre = undefined;
      if (campo === 'antecedentesPenalesUrl') next.antecedentesPenalesNombre = undefined;
      if (campo === 'antecedentesJudicialesUrl') next.antecedentesJudicialesNombre = undefined;
      if (campo === 'licenciaConducirUrl') next.licenciaConducirNombre = undefined;
      return next;
    };

    setUsuarios(prev =>
      prev.map(u => {
        if (u.id !== usuarioId) return u;
        const next = clearCompanionName(u);
        const stillHas = Boolean(
          next.dniFotoUrl ||
            next.fotoPersonaUrl ||
            next.videoPersonaUrl ||
            next.certificadoOpcionalUrl ||
            next.comprobanteDomicilioUrl ||
            next.fichaRucUrl ||
            next.antecedentesPolicialesUrl ||
            next.antecedentesPenalesUrl ||
            next.antecedentesJudicialesUrl ||
            next.licenciaConducirUrl
        );
        next.estadoVerificacionMedia = stillHas ? 'OBSERVADO' : 'SIN_ADJUNTOS';
        return next;
      })
    );
    if (currentUser?.id === usuarioId) {
      setCurrentUser(prev => (prev ? clearCompanionName(prev) : prev));
    }
    showToast('Archivo Retirado por Administrador', 'El documento fue eliminado del expediente.', 'info');
  };

  // Admin: Edit any user's data
  // Admin: Edit any user's data including email and optional password
  const editarUsuarioPorAdmin = (
    usuarioId: string,
    data: ActualizarPerfilPayload
  ): { ok: boolean; error?: string } => {
    const target = usuarios.find(u => u.id === usuarioId);
    if (!target) return { ok: false, error: 'Usuario no encontrado.' };
    const tipoDoc = data.tipoDocumento || target.tipoDocumento || 'DNI';
    const docCheck = validarNumeroDocumento(data.dni, tipoDoc);
    if (!docCheck.ok) {
      return { ok: false, error: docCheck.error };
    }
    if (usuarios.some(u => u.id !== usuarioId && u.dni === docCheck.clean)) {
      return { ok: false, error: `Ya existe otra cuenta con el documento ${docCheck.clean}.` };
    }
    const nextEmail = data.email !== undefined ? data.email.trim().toLowerCase() : target.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return { ok: false, error: 'Ingresa un correo electrónico válido.' };
    }
    if (usuarios.some(u => u.id !== usuarioId && u.email.toLowerCase() === nextEmail)) {
      return { ok: false, error: `Ya existe otra cuenta con el correo ${nextEmail}.` };
    }
    if (data.password && data.password.trim().length > 0 && data.password.trim().length < 6) {
      return { ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    const ubicacionResuelta = inferUbicacionPeru(data.distrito, data.provincia, data.region);
    const nextPassword =
      data.password && data.password.trim().length >= 6 ? data.password.trim() : target.password;

    if (nextEmail !== target.email.toLowerCase() && !esCorreoPermitido(nextEmail)) {
      setCorreosPermitidos(prev => (prev.includes(nextEmail) ? prev : [...prev, nextEmail]));
    }

    const actualizado: UsuarioRegistrado = {
      ...target,
      tipoDocumento: tipoDoc,
      dni: docCheck.clean,
      nombreCompleto: data.nombreCompleto.trim(),
      email: nextEmail,
      telefonoWhatsapp: data.telefonoWhatsapp.trim(),
      region: ubicacionResuelta.region,
      provincia: ubicacionResuelta.provincia,
      distrito: ubicacionResuelta.distrito,
      direccion: data.direccion.trim(),
      tipoUsuario: data.tipoUsuario || target.tipoUsuario || 'AMBOS',
      especialidadPrincipal: data.especialidadPrincipal?.trim() || target.especialidadPrincipal,
      password: nextPassword
    };

    sincronizarPublicacionesConUsuario(target, actualizado);

    setUsuarios(prev => prev.map(u => (u.id === usuarioId ? actualizado : u)));

    if (currentUser?.id === usuarioId) {
      setCurrentUser(actualizado);
    }

    showToast(
      'Usuario y Publicaciones Actualizados',
      `Datos, correo (${nextEmail}) y publicaciones de ${actualizado.nombreCompleto} actualizados.`,
      'success'
    );
    return { ok: true };
  };

  // Admin: Delete a non-admin user
  const eliminarUsuarioPorAdmin = (usuarioId: string): { ok: boolean; error?: string } => {
    const target = usuarios.find(u => u.id === usuarioId);
    if (!target) return { ok: false, error: 'Usuario no encontrado.' };
    if (target.permiso === 'ADMIN') {
      return { ok: false, error: 'No se puede eliminar al Administrador Único del sistema.' };
    }
    setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
    showToast('Usuario Eliminado', `Se retiró la cuenta de ${target.nombreCompleto}.`, 'info');
    return { ok: true };
  };

  // Portfolio / Photos of Completed Works in User Profile
  const agregarFotoTrabajoPerfil = (trabajo: {
    imagenUrl: string;
    titulo: string;
    descripcion?: string;
    oficio?: OficioType;
    ubicacion?: string;
  }): { ok: boolean; error?: string } => {
    if (!currentUser) {
      return { ok: false, error: 'Inicia sesión para subir fotos de tus trabajos.' };
    }
    if (!trabajo.imagenUrl) {
      return { ok: false, error: 'Selecciona una foto del trabajo realizado.' };
    }
    if (trabajo.titulo.trim().length < 4) {
      return { ok: false, error: 'Ingresa un título breve del trabajo realizado (mín. 4 caracteres).' };
    }
    const fechaActual = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const nuevoItem: FotoTrabajoRealizado = {
      id: `TRB-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 89)}`,
      imagenUrl: trabajo.imagenUrl,
      titulo: trabajo.titulo.trim(),
      descripcion: trabajo.descripcion?.trim() || undefined,
      oficio: trabajo.oficio,
      ubicacion:
        trabajo.ubicacion?.trim() ||
        `${currentUser.distrito}${currentUser.region ? `, ${currentUser.region}` : ''}`,
      fecha: fechaActual
    };

    const nextList = [nuevoItem, ...(currentUser.fotosTrabajos || [])];
    setUsuarios(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, fotosTrabajos: nextList } : u))
    );
    setCurrentUser(prev => (prev ? { ...prev, fotosTrabajos: nextList } : prev));
    showToast(
      'Foto de Trabajo Agregada a Tu Perfil',
      `Se publicó "${nuevoItem.titulo}" en tu galería de trabajos realizados.`,
      'success'
    );
    return { ok: true };
  };

  const eliminarFotoTrabajoPerfil = (trabajoId: string) => {
    if (!currentUser) return;
    const nextList = (currentUser.fotosTrabajos || []).filter(f => f.id !== trabajoId);
    setUsuarios(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, fotosTrabajos: nextList } : u))
    );
    setCurrentUser(prev => (prev ? { ...prev, fotosTrabajos: nextList } : prev));
    showToast('Foto Retirada', 'La foto del trabajo fue eliminada de tu perfil.', 'info');
  };

  const eliminarFotoTrabajoAdmin = (usuarioId: string, trabajoId: string) => {
    setUsuarios(prev =>
      prev.map(u =>
        u.id === usuarioId
          ? { ...u, fotosTrabajos: (u.fotosTrabajos || []).filter(f => f.id !== trabajoId) }
          : u
      )
    );
    if (currentUser?.id === usuarioId) {
      setCurrentUser(prev =>
        prev
          ? { ...prev, fotosTrabajos: (prev.fotosTrabajos || []).filter(f => f.id !== trabajoId) }
          : prev
      );
    }
    showToast('Foto de Trabajo Retirada por Admin', 'La imagen fue removida del perfil del usuario.', 'info');
  };

  // ===============================================================
  // IMPREVISTOS EN CASA & COTIZACIONES DE PERSONAS DE OFICIO
  // ===============================================================
  const publicarImprevisto = (
    payload: NuevoImprevistoPayload
  ): { ok: boolean; error?: string; imprevisto?: ImprevistoHogar } => {
    if (!currentUser) {
      return { ok: false, error: 'Inicia sesión o regístrate para publicar un imprevisto en tu hogar.' };
    }
    if (payload.titulo.trim().length < 3) {
      return { ok: false, error: 'Ingresa un título breve para el imprevisto (mín. 3 caracteres).' };
    }
    if (payload.descripcion.trim().length < 5) {
      return { ok: false, error: 'Describe brevemente lo que ocurrió en tu casa para que los técnicos puedan cotizar.' };
    }
    const metodoPagoElegido = payload.metodoPago;
    if (metodoPagoElegido !== 'YAPE_PLIN' && metodoPagoElegido !== 'TARJETA') {
      return {
        ok: false,
        error: `Cada publicación de imprevisto tiene un costo único de S/ ${PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)}. Selecciona Yape/Plin o Tarjeta para pagar.`
      };
    }

    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const ubicacionResuelta = inferUbicacionPeru(payload.distrito, payload.provincia, payload.region);
    const randomPay = Math.floor(100000 + Math.random() * 900000);

    const nuevo: ImprevistoHogar = {
      id: `IMP-2026-${Math.floor(400 + Math.random() * 599)}`,
      autorUsuarioId: currentUser.id,
      autorNombre: currentUser.nombreCompleto,
      autorDni: currentUser.dni,
      autorTelefono: payload.telefonoContacto.trim() || currentUser.telefonoWhatsapp,
      autorFotoUrl: currentUser.fotoPersonaUrl,
      region: ubicacionResuelta.region,
      provincia: ubicacionResuelta.provincia,
      distrito: ubicacionResuelta.distrito,
      direccion: payload.direccion.trim() || currentUser.direccion,
      oficio: payload.oficio,
      oficioLabel: OFICIO_LABELS[payload.oficio],
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion.trim(),
      urgencia: payload.urgencia,
      presupuestoReferencial:
        payload.presupuestoReferencial && payload.presupuestoReferencial > 0
          ? Number(payload.presupuestoReferencial)
          : undefined,
      imagenes: payload.imagenes,
      fechaPublicacion: fechaHora,
      estado: 'ABIERTO',
      pagoPublicacion: {
        codigoPago: payload.culqiReceipt?.chargeId || `PAG-IMP-${randomPay}`,
        codigoAutorizacion: payload.culqiReceipt?.authorizationCode || `AUT-CLQ-${Math.floor(1000 + Math.random() * 9000)}`,
        montoPagado: PRECIO_PUBLICACION_IMPREVISTO,
        metodoPago: payload.culqiReceipt?.method || metodoPagoElegido,
        fechaPago: payload.culqiReceipt?.createdAt || fechaHora,
        pasarela: 'CULQI',
        culqiChargeId: payload.culqiReceipt?.chargeId,
        culqiTokenId: payload.culqiReceipt?.tokenId,
        culqiModo: payload.culqiReceipt?.mode,
        culqiResumen: payload.culqiReceipt
          ? `${payload.culqiReceipt.brand || 'Culqi'}${payload.culqiReceipt.last4 ? ` •••• ${payload.culqiReceipt.last4}` : ''}`
          : undefined
      },
      ofertas: []
    };

    setImprevistos(prev => [nuevo, ...prev]);
    showToast(
      `Pago Culqi S/ ${PRECIO_PUBLICACION_IMPREVISTO.toFixed(2)} Aprobado · Imprevisto Publicado`,
      `Comprobante Culqi ${nuevo.pagoPublicacion?.codigoAutorizacion}. Los técnicos ya pueden ver tu imprevisto y enviarte sus costos.`,
      'success'
    );
    return { ok: true, imprevisto: nuevo };
  };

  const ofrecerServicioImprevisto = (
    imprevistoId: string,
    payload: NuevaOfertaImprevistoPayload
  ): { ok: boolean; error?: string } => {
    if (!currentUser) {
      return { ok: false, error: 'Inicia sesión como persona de oficio para enviar tu oferta.' };
    }
    const target = imprevistos.find(imp => imp.id === imprevistoId);
    if (!target) return { ok: false, error: 'Publicación de imprevisto no encontrada.' };
    if (target.estado !== 'ABIERTO') {
      return { ok: false, error: 'Este imprevisto ya fue adjudicado o cerrado.' };
    }
    if (target.autorUsuarioId === currentUser.id && currentUser.permiso !== 'ADMIN') {
      return { ok: false, error: 'No puedes cotizar sobre tu propia publicación de imprevisto.' };
    }
    if (!payload.montoOferta || payload.montoOferta < 10) {
      return { ok: false, error: 'Ingresa un monto de reparación válido (mínimo S/ 10.00).' };
    }
    if (payload.mensajePropuesta.trim().length < 10) {
      return { ok: false, error: 'Detalla brevemente cómo solucionarás el imprevisto.' };
    }

    // Compute technician's star rating from their catalog services & completed orders
    const srvDelTecnico = servicios.filter(
      s => s.autorUsuarioId === currentUser.id || s.tecnicoDni === currentUser.dni
    );
    const ordenesCalificadas = ordenes.filter(
      o =>
        o.calificacion &&
        o.items.some(
          it => it.servicio.autorUsuarioId === currentUser.id || it.servicio.tecnicoDni === currentUser.dni
        )
    );

    let promedioEstrellas = 4.8;
    let totalResenas = 12;

    if (srvDelTecnico.length > 0) {
      const sumCal = srvDelTecnico.reduce((acc, s) => acc + s.calificacion, 0);
      promedioEstrellas = Number((sumCal / srvDelTecnico.length).toFixed(1));
      totalResenas = srvDelTecnico.reduce((acc, s) => acc + s.numResenas, 0) || 12;
    }
    if (ordenesCalificadas.length > 0) {
      const sumOrd = ordenesCalificadas.reduce((acc, o) => acc + (o.calificacion?.estrellas || 5), 0);
      promedioEstrellas = Number((sumOrd / ordenesCalificadas.length).toFixed(1));
      totalResenas += ordenesCalificadas.length;
    }

    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const institucion =
      payload.institucionCertificadora?.trim() ||
      srvDelTecnico[0]?.institucionCertificadora ||
      (currentUser.certificadoOpcionalNombre ? 'Certificado Adjunto' : 'Oficio Verificado');

    const nuevaOferta: OfertaImprevisto = {
      id: `OFR-${Math.floor(100 + Math.random() * 899)}`,
      imprevistoId,
      ofertanteUsuarioId: currentUser.id,
      ofertanteNombre: currentUser.nombreCompleto,
      ofertanteDni: currentUser.dni,
      ofertanteTelefono: currentUser.telefonoWhatsapp,
      ofertanteFotoUrl: currentUser.fotoPersonaUrl,
      especialidad: payload.especialidad?.trim() || currentUser.especialidadPrincipal || target.oficioLabel,
      institucionCertificadora: institucion,
      verificadoAdmin: currentUser.estadoVerificacionMedia === 'VERIFICADO',
      calificacionEstrellas: promedioEstrellas,
      numResenas: totalResenas,
      montoOferta: Number(Number(payload.montoOferta).toFixed(2)),
      tiempoEstimado: payload.tiempoEstimado.trim() || 'Hoy mismo',
      garantiaDias: Math.max(0, Number(payload.garantiaDias) || 30),
      mensajePropuesta: payload.mensajePropuesta.trim(),
      fechaOferta: fechaHora,
      estado: 'ENVIADA'
    };

    setImprevistos(prev =>
      prev.map(imp => {
        if (imp.id !== imprevistoId) return imp;
        const filtered = imp.ofertas.filter(o => o.ofertanteUsuarioId !== currentUser.id);
        return { ...imp, ofertas: [nuevaOferta, ...filtered] };
      })
    );

    showToast(
      'Oferta de Reparación Enviada',
      `Enviaste tu propuesta por S/ ${nuevaOferta.montoOferta.toFixed(2)} (${nuevaOferta.calificacionEstrellas.toFixed(1)} ★).`,
      'success'
    );
    return { ok: true };
  };

  const aceptarOfertaImprevisto = (
    imprevistoId: string,
    ofertaId: string,
    crearOrdenEscrow = true
  ): { ok: boolean; error?: string; orden?: Orden } => {
    const imp = imprevistos.find(i => i.id === imprevistoId);
    if (!imp) return { ok: false, error: 'Imprevisto no encontrado.' };
    const oferta = imp.ofertas.find(o => o.id === ofertaId);
    if (!oferta) return { ok: false, error: 'Oferta no encontrada.' };

    let ordenCreada: Orden | undefined;

    if (crearOrdenEscrow) {
      const fechaActual = new Date().toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const precioBase = oferta.montoOferta;
      const garantiaMonto = Number((precioBase * 0.10).toFixed(2));
      const tarifaCliente = Number((precioBase + garantiaMonto).toFixed(2));
      const igv = Number((tarifaCliente * 0.18).toFixed(2));
      const total = Number((tarifaCliente + igv).toFixed(2));

      const servicioSintetico: Servicio = {
        id: `IMP-SRV-${oferta.id}`,
        oficio: imp.oficio,
        oficioLabel: imp.oficioLabel,
        titulo: `Reparación Imprevisto: ${imp.titulo}`,
        descripcion: oferta.mensajePropuesta,
        tecnicoNombre: oferta.ofertanteNombre,
        tecnicoDni: oferta.ofertanteDni,
        tecnicoTelefono: oferta.ofertanteTelefono,
        tecnicoAvatar: OFICIO_AVATARS[imp.oficio],
        institucionCertificadora: oferta.institucionCertificadora,
        codigoCertificado: `IMP-${imp.id}`,
        precioBase,
        tarifaCliente,
        garantiaMonto,
        turnosLibres: 1,
        calificacion: oferta.calificacionEstrellas,
        numResenas: oferta.numResenas,
        experienciaAnos: 5,
        region: imp.region,
        provincia: imp.provincia,
        distrito: imp.distrito,
        imagen: imp.imagenes[0] || OFICIO_IMAGENES[imp.oficio],
        capacitado: true,
        habilidades: [`Garantía ${oferta.garantiaDias} días`, oferta.tiempoEstimado],
        autorUsuarioId: oferta.ofertanteUsuarioId,
        estadoPublicacion: 'APROBADO',
        fechaPublicacion: fechaActual
      };

      ordenCreada = {
        id: `PED-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        codigoAutorizacion: `AUT-IMP-${Math.floor(100000 + Math.random() * 900000)}`,
        fecha: fechaActual,
        clienteUsuarioId: imp.autorUsuarioId,
        items: [
          {
            servicioId: servicioSintetico.id,
            servicio: servicioSintetico,
            cantidadTurnos: 1,
            subtotal: tarifaCliente
          }
        ],
        datosVisita: {
          clienteNombre: imp.autorNombre,
          clienteDni: imp.autorDni,
          region: imp.region,
          provincia: imp.provincia,
          distrito: imp.distrito,
          direccion: imp.direccion,
          referencia: `Atención de Imprevisto ${imp.id}`,
          turno: 'Atención de Urgencia',
          telefonoWhatsapp: imp.autorTelefono,
          notasAdicionales: imp.descripcion
        },
        subtotalTecnico: tarifaCliente,
        garantiaTotal: garantiaMonto,
        igv,
        total,
        montoReferencial: precioBase,
        aceptacionTrabajador: 'PENDIENTE',
        estado: 'EN_CUSTODIA',
        metodoPago: 'YAPE_PLIN',
        fondosLiberados: false,
        historialEstados: [
          {
            estado: 'EN_CUSTODIA',
            fecha: fechaActual,
            descripcion: `Oferta aceptada de ${oferta.ofertanteNombre} (${oferta.calificacionEstrellas.toFixed(1)} ★) por S/ ${oferta.montoOferta.toFixed(2)} para atender imprevisto ${imp.id}.`
          }
        ]
      };

      setOrdenes(prev => [ordenCreada!, ...prev]);
      setLastCreatedOrder(ordenCreada);
      void despacharOrdenAutomaticamente(ordenCreada);
    }

    setImprevistos(prev =>
      prev.map(item =>
        item.id === imprevistoId
          ? {
              ...item,
              estado: 'ADJUDICADO',
              ofertaAceptadaId: ofertaId,
              ordenGeneradaId: ordenCreada?.id,
              ofertas: item.ofertas.map(o => ({
                ...o,
                estado: o.id === ofertaId ? 'ACEPTADA' : 'DESCARTADA'
              }))
            }
          : item
      )
    );

    showToast(
      'Técnico Elegido y Presupuesto Aceptado',
      `Seleccionaste a ${oferta.ofertanteNombre} (${oferta.calificacionEstrellas.toFixed(1)} ★) por S/ ${oferta.montoOferta.toFixed(2)}.`,
      'success'
    );
    return { ok: true, orden: ordenCreada };
  };

  const cambiarEstadoImprevistoAdmin = (imprevistoId: string, estado: EstadoImprevisto) => {
    setImprevistos(prev => prev.map(i => (i.id === imprevistoId ? { ...i, estado } : i)));
    showToast('Estado de Imprevisto Actualizado', `El caso ${imprevistoId} pasó a ${estado}.`, 'info');
  };

  const eliminarImprevistoAdmin = (imprevistoId: string) => {
    setImprevistos(prev => prev.filter(i => i.id !== imprevistoId));
    showToast('Imprevisto Eliminado', `Se retiró la publicación ${imprevistoId}.`, 'info');
  };

  const eliminarOfertaImprevistoAdmin = (imprevistoId: string, ofertaId: string) => {
    setImprevistos(prev =>
      prev.map(i =>
        i.id === imprevistoId
          ? { ...i, ofertas: i.ofertas.filter(o => o.id !== ofertaId) }
          : i
      )
    );
    showToast('Oferta Retirada', 'La cotización fue eliminada por el Administrador.', 'info');
  };

  // Admin-only: Update publication plan prices, durations & titles
  const actualizarPlanPublicacionAdmin = (
    planId: PlanPublicacionId,
    data: {
      nombre: string;
      subtituloTag: string;
      duracionDias: number;
      precio: number;
      precioRegular?: number;
      destacado: boolean;
      beneficios: string[];
    }
  ): { ok: boolean; error?: string } => {
    if (currentUser?.permiso !== 'ADMIN') {
      return {
        ok: false,
        error: 'Acceso denegado: solo el Administrador Único tiene el privilegio de modificar planes, duraciones y precios.'
      };
    }
    const cleanNombre = data.nombre.trim();
    const cleanSub = data.subtituloTag.trim();
    const dias = Math.floor(Number(data.duracionDias));
    const precio = Number(Number(data.precio).toFixed(2));
    const precioReg =
      data.precioRegular && Number(data.precioRegular) > 0
        ? Number(Number(data.precioRegular).toFixed(2))
        : undefined;
    const cleanBeneficios = data.beneficios.map(b => b.trim()).filter(Boolean);

    if (cleanNombre.length < 3) {
      return { ok: false, error: 'El nombre del plan debe tener al menos 3 caracteres.' };
    }
    if (!Number.isFinite(dias) || dias < 1 || dias > 3650) {
      return { ok: false, error: 'La duración debe estar entre 1 y 3650 días.' };
    }
    if (!Number.isFinite(precio) || precio < 1) {
      return { ok: false, error: 'El precio debe ser mayor o igual a S/ 1.00.' };
    }
    if (cleanBeneficios.length === 0) {
      return { ok: false, error: 'Agrega al menos 1 beneficio para el plan.' };
    }

    setPlanesPublicacion(prev =>
      prev.map(p =>
        p.id === planId
          ? {
              ...p,
              nombre: cleanNombre,
              subtituloTag: cleanSub || p.subtituloTag,
              duracionDias: dias,
              precio,
              precioRegular: precioReg,
              destacado: Boolean(data.destacado),
              beneficios: cleanBeneficios
            }
          : p
      )
    );

    showToast(
      'Plan Actualizado por Administrador',
      `${cleanNombre}: S/ ${precio.toFixed(2)} (${dias} días) guardado correctamente.`,
      'success'
    );
    return { ok: true };
  };

  const actualizarPromoConfigAdmin = (next: PromoLanzamientoConfig): { ok: boolean; error?: string } => {
    if (currentUser?.permiso !== 'ADMIN') {
      return {
        ok: false,
        error: 'Solo el Administrador Único puede activar o desactivar promociones de lanzamiento.'
      };
    }
    setPromoConfig(next);
    showToast(
      'Promociones de Lanzamiento Actualizadas',
      'Las estrategias de captación y descuento se guardaron correctamente.',
      'success'
    );
    return { ok: true };
  };

  const restablecerPlanesPublicacionAdmin = (): { ok: boolean; error?: string } => {
    if (currentUser?.permiso !== 'ADMIN') {
      return {
        ok: false,
        error: 'Solo el Administrador Único puede restablecer las tarifas de publicación.'
      };
    }
    setPlanesPublicacion(PLANES_PUBLICACION);
    setPromoConfig({ pruebaGratisActiva: true, descuentoDestacadoActivo: true });
    showToast(
      'Propuesta Oficial Restablecida',
      'Se restauraron Plan Básico (S/ 4.90), Plan Destacado (S/ 24.90 lanz. / S/ 29.90) y Especialista PRO (S/ 59.90) + 7 días gratis.',
      'info'
    );
    return { ok: true };
  };

  // Publish paid or 7-day promo user advertisement (Enters PENDIENTE_APROBACION for Admin review)
  const publicarAnuncioPagado = (payload: NuevoAnuncioPayload): Servicio => {
    const misPrevios = servicios.filter(
      s => s.autorUsuarioId === currentUser?.id || (currentUser?.dni && s.tecnicoDni === currentUser.dni)
    );
    const puedeUsarPruebaGratis = promoConfig.pruebaGratisActiva && misPrevios.length === 0;

    let plan: PlanPublicacion =
      payload.planId === 'PRUEBA_7' && puedeUsarPruebaGratis
        ? PLAN_PRUEBA_GRATIS
        : planesPublicacion.find(p => p.id === payload.planId) || planesPublicacion[0];

    const montoEfectivo =
      plan.id === 'PRUEBA_7'
        ? 0
        : plan.id === 'DESTACADO' && !promoConfig.descuentoDestacadoActivo && plan.precioRegular
        ? plan.precioRegular
        : plan.precio;

    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const precioBase = Number(payload.precioBase) || 50;
    const garantiaMonto = Number((precioBase * 0.10).toFixed(2));
    const tarifaCliente = Number((precioBase + garantiaMonto).toFixed(2));
    const randomPub = Math.floor(200 + Math.random() * 799);
    const randomPay = Math.floor(1000 + Math.random() * 8999);
    const randomAuth = Math.floor(100000 + Math.random() * 899999);

    const nivelPlan: Servicio['nivelPlan'] =
      plan.id === 'PRO'
        ? 'PRO'
        : plan.id === 'DESTACADO'
        ? 'DESTACADO'
        : plan.id === 'PRUEBA_7'
        ? 'PRUEBA'
        : 'BASICO';

    const ubicacionResuelta = inferUbicacionPeru(payload.distrito, payload.provincia, payload.region);

    const nuevoAnuncio: Servicio = {
      id: `PUB-2026-${randomPub}`,
      oficio: payload.oficio,
      oficioLabel: OFICIO_LABELS[payload.oficio],
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion.trim(),
      tecnicoNombre: payload.tecnicoNombre.trim(),
      tecnicoDni: payload.tecnicoDni.replace(/\D/g, ''),
      tecnicoTelefono: payload.tecnicoTelefono.trim(),
      tecnicoEmail: currentUser?.email,
      tecnicoAvatar: OFICIO_AVATARS[payload.oficio],
      institucionCertificadora: payload.institucionCertificadora.trim() || 'Profesional Independiente',
      codigoCertificado: payload.codigoCertificado.trim() || `DNI-${payload.tecnicoDni}`,
      precioBase,
      tarifaCliente,
      garantiaMonto,
      turnosLibres: payload.turnosLibres,
      calificacion: 5.0,
      numResenas: 0,
      experienciaAnos: payload.experienciaAnos,
      region: ubicacionResuelta.region,
      provincia: ubicacionResuelta.provincia,
      distrito: ubicacionResuelta.distrito,
      imagen: OFICIO_IMAGENES[payload.oficio],
      capacitado: true,
      habilidades: payload.habilidades.length > 0 ? payload.habilidades : ['Servicio Garantizado', 'Atención a Domicilio'],
      autorUsuarioId: currentUser?.id,
      estadoPublicacion: 'PENDIENTE_APROBACION',
      fechaPublicacion: fechaHora,
      destacado: plan.destacado,
      nivelPlan,
      selloVerificadoPro: plan.id === 'PRO',
      pagoPublicacion: {
        codigoPago:
          plan.id === 'PRUEBA_7'
            ? `PROMO-7D-${randomPay}`
            : payload.culqiReceipt?.chargeId || `CLQ-PUB-${randomPay}`,
        codigoAutorizacion:
          plan.id === 'PRUEBA_7'
            ? `GRATIS-${randomAuth}`
            : payload.culqiReceipt?.authorizationCode || `AUT-CLQ-${randomAuth}`,
        planId: plan.id,
        planNombre:
          plan.id === 'PRUEBA_7'
            ? `${plan.nombre} (${plan.duracionDias} días gratis)`
            : `${plan.nombre} (${plan.duracionDias} días)`,
        montoPagado: montoEfectivo,
        metodoPago: payload.culqiReceipt?.method || payload.metodoPago,
        fechaPago: payload.culqiReceipt?.createdAt || fechaHora,
        pasarela: plan.id === 'PRUEBA_7' ? undefined : 'CULQI',
        culqiChargeId: payload.culqiReceipt?.chargeId,
        culqiTokenId: payload.culqiReceipt?.tokenId,
        culqiModo: payload.culqiReceipt?.mode,
        culqiResumen: payload.culqiReceipt
          ? `${payload.culqiReceipt.brand || 'Culqi'}${payload.culqiReceipt.last4 ? ` •••• ${payload.culqiReceipt.last4}` : ''}`
          : undefined
      }
    };

    setServicios(prev => [nuevoAnuncio, ...prev]);
    showToast(
      plan.id === 'PRUEBA_7' ? 'Prueba Gratis de 7 Días Activada' : 'Pago Culqi Confirmado · Anuncio Enviado',
      plan.id === 'PRUEBA_7'
        ? `Tu primera publicación promocional ${nuevoAnuncio.id} pasó a revisión del Administrador.`
        : `Tu publicación ${nuevoAnuncio.id} (S/ ${montoEfectivo.toFixed(2)} vía Culqi) pasó a revisión del Administrador para ser admitida.`,
      'success'
    );
    return nuevoAnuncio;
  };

  // User edits their own publication parameters (if rejected, moves back to PENDIENTE_APROBACION)
  const editarMiPublicacion = (
    servicioId: string,
    data: EditarPublicacionPayload
  ): { ok: boolean; error?: string } => {
    if (!currentUser) return { ok: false, error: 'Debes iniciar sesión primero.' };
    const target = servicios.find(s => s.id === servicioId);
    if (!target) return { ok: false, error: 'Publicación no encontrada.' };

    const esPropietario =
      currentUser.permiso === 'ADMIN' ||
      target.autorUsuarioId === currentUser.id ||
      target.tecnicoDni === currentUser.dni;
    if (!esPropietario) {
      return { ok: false, error: 'No tienes permiso para editar esta publicación.' };
    }

    const cleanDni = data.tecnicoDni.replace(/\D/g, '');
    if (cleanDni.length !== 8) {
      return { ok: false, error: 'El DNI debe contener 8 dígitos.' };
    }
    if (data.titulo.trim().length < 8) {
      return { ok: false, error: 'El título del anuncio es demasiado corto.' };
    }
    if (data.descripcion.trim().length < 15) {
      return { ok: false, error: 'La descripción debe tener al menos 15 caracteres.' };
    }

    const precioBase = Math.max(20, Number(data.precioBase) || 50);
    const garantiaMonto = Number((precioBase * 0.10).toFixed(2));
    const tarifaCliente = Number((precioBase + garantiaMonto).toFixed(2));

    const ubicacionResuelta = inferUbicacionPeru(data.distrito, data.provincia, data.region);

    const buildUpdatedServicio = (srv: Servicio): Servicio => ({
      ...srv,
      oficio: data.oficio,
      oficioLabel: OFICIO_LABELS[data.oficio],
      tecnicoAvatar: OFICIO_AVATARS[data.oficio],
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      tecnicoNombre: data.tecnicoNombre.trim(),
      tecnicoDni: cleanDni,
      tecnicoTelefono: data.tecnicoTelefono.trim(),
      tecnicoEmail: data.tecnicoEmail !== undefined ? data.tecnicoEmail.trim().toLowerCase() : srv.tecnicoEmail,
      institucionCertificadora: data.institucionCertificadora.trim() || 'Profesional Independiente',
      codigoCertificado: data.codigoCertificado.trim() || `DNI-${cleanDni}`,
      precioBase,
      garantiaMonto,
      tarifaCliente,
      turnosLibres: Math.max(0, Number(data.turnosLibres) || 0),
      experienciaAnos: Math.max(0, Number(data.experienciaAnos) || 0),
      region: ubicacionResuelta.region,
      provincia: ubicacionResuelta.provincia,
      distrito: ubicacionResuelta.distrito,
      habilidades: data.habilidades.length > 0 ? data.habilidades : srv.habilidades,
      estadoPublicacion: srv.estadoPublicacion === 'RECHAZADO' ? 'PENDIENTE_APROBACION' : srv.estadoPublicacion,
      motivoRechazo: undefined
    });

    setServicios(prev =>
      prev.map(srv => (srv.id === servicioId ? buildUpdatedServicio(srv) : srv))
    );

    setSelectedServiceForModal(prev =>
      prev && prev.id === servicioId ? buildUpdatedServicio(prev) : prev
    );

    setCarritosPorUsuario(prevMap => {
      let changed = false;
      const nextMap: Record<string, ItemCarrito[]> = {};
      for (const [ownerKey, items] of Object.entries(prevMap)) {
        const updatedItems = items.map(it => {
          if (it.servicioId !== servicioId && it.servicio.id !== servicioId) return it;
          changed = true;
          const nextSrv = buildUpdatedServicio(it.servicio);
          return {
            ...it,
            servicio: nextSrv,
            subtotal: nextSrv.tarifaCliente * it.cantidadTurnos
          };
        });
        nextMap[ownerKey] = updatedItems;
      }
      return changed ? nextMap : prevMap;
    });

    showToast(
      'Publicación Actualizada',
      'Los datos completos de tu publicación han sido guardados.',
      'success'
    );
    return { ok: true };
  };

  // Admin: Admitir publicación
  const admitirPublicacion = (servicioId: string) => {
    setServicios(prev =>
      prev.map(srv =>
        srv.id === servicioId
          ? { ...srv, estadoPublicacion: 'APROBADO', motivoRechazo: undefined }
          : srv
      )
    );
    showToast(
      'Publicación Admitida',
      `El anuncio ${servicioId} fue aprobado por el Administrador y ya es visible en el Catálogo público.`,
      'success'
    );
  };

  // Admin: Rechazar publicación
  const rechazarPublicacion = (servicioId: string, motivo: string) => {
    setServicios(prev =>
      prev.map(srv =>
        srv.id === servicioId
          ? {
              ...srv,
              estadoPublicacion: 'RECHAZADO',
              motivoRechazo: motivo.trim() || 'Información o DNI pendiente de subsanación.'
            }
          : srv
      )
    );
    showToast(
      'Publicación Observada / Rechazada',
      `El anuncio ${servicioId} fue marcado como rechazado y no aparecerá en el catálogo público.`,
      'warning'
    );
  };

  const abrirChatDirecto: ConectaContextType['abrirChatDirecto'] = async params => {
    if (!currentUser) {
      setActiveChatConversationId(null);
      setActiveWhatsAppChat(null);
      setShowChatInbox(true);
      showToast(
        'Registro Requerido para Chatear',
        'Regístrate o inicia sesión para conversar por chat con esta persona usando tu propio nombre.',
        'warning'
      );
      return;
    }

    const cleanPhone = params.trabajadorTelefono.replace(/\D/g, '');
    const clientKey = params.clienteId || currentUser.id;
    const convId =
      params.conversationId ||
      (params.ordenId
        ? `ORD:${params.ordenId}:${cleanPhone || params.trabajadorNombre}`
        : params.imprevistoId
        ? `IMP:${params.imprevistoId}:${cleanPhone || params.trabajadorNombre}`
        : `SRV:${cleanPhone || params.trabajadorNombre}:${clientKey}`);

    const resolvedWorker = usuarios.find(
      u =>
        u.id === params.trabajadorId ||
        (Boolean(params.trabajadorDni) && u.dni === params.trabajadorDni) ||
        (Boolean(cleanPhone) && u.telefonoWhatsapp.replace(/\D/g, '') === cleanPhone)
    );

    const isUnregisteredSolicitante = params.clienteId === 'GUEST';
    const resolvedClienteNombre = isUnregisteredSolicitante
      ? 'Anónimo (No registrado)'
      : params.clienteNombre || currentUser.nombreCompleto;

    const payload = {
      conversationId: convId,
      ordenId: params.ordenId,
      imprevistoId: params.imprevistoId,
      servicioTitulo: params.servicioTitulo,
      clienteId: params.clienteId || currentUser.id,
      clienteNombre: resolvedClienteNombre,
      clienteDni: isUnregisteredSolicitante ? undefined : params.clienteDni || currentUser.dni,
      clienteTelefono: params.clienteTelefono || currentUser.telefonoWhatsapp,
      trabajadorId: params.trabajadorId || resolvedWorker?.id,
      trabajadorNombre: params.trabajadorNombre,
      trabajadorDni: params.trabajadorDni || resolvedWorker?.dni,
      trabajadorTelefono: params.trabajadorTelefono,
      trabajadorAvatar: params.trabajadorAvatar || '👨‍🔧',
      trabajadorInstitucion: params.trabajadorInstitucion || 'SENATI',
      initialSystemText: `💬 Chat Directo entre ${resolvedClienteNombre} y ${params.trabajadorNombre} · Servicio: ${params.servicioTitulo}`
    };

    try {
      const res = await fetch('/api/chat/conversations/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setChatConversations(prev => {
            const rest = prev.filter(c => c.id !== data.conversation.id);
            return [data.conversation, ...rest];
          });
        }
      }
    } catch {
      // Offline fallback keeps modal open
    }

    setActiveChatConversationId(convId);
    setShowChatInbox(true);
    setActiveWhatsAppChat({
      tecnicoNombre: params.trabajadorNombre,
      tecnicoTelefono: params.trabajadorTelefono,
      servicioTitulo: params.servicioTitulo,
      ordenId: params.ordenId,
      avatar: params.trabajadorAvatar || '👨‍🔧',
      institucion: params.trabajadorInstitucion || 'SENATI'
    });
  };

  const enviarMensajeChat = async (
    conversationId: string,
    text: string,
    overrideRole?: 'cliente' | 'trabajador'
  ) => {
    if (!currentUser) {
      showToast(
        'Registro Requerido',
        'Debes registrarte o iniciar sesión para enviar mensajes en el chat.',
        'warning'
      );
      return;
    }

    const clean = text.trim();
    if (!clean) return;

    const conv = chatConversations.find(c => c.id === conversationId);
    let senderRole: 'cliente' | 'trabajador' = overrideRole || 'cliente';
    if (!overrideRole && conv) {
      const esTrabajador =
        conv.trabajadorId === currentUser.id ||
        (Boolean(currentUser.dni) && conv.trabajadorDni === currentUser.dni) ||
        (Boolean(currentUser.telefonoWhatsapp) &&
          conv.trabajadorTelefono.replace(/\D/g, '') ===
            currentUser.telefonoWhatsapp.replace(/\D/g, ''));
      const esCliente =
        conv.clienteId === currentUser.id ||
        (Boolean(currentUser.dni) && conv.clienteDni === currentUser.dni);
      if (esTrabajador && !esCliente) senderRole = 'trabajador';
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const senderId = currentUser.id;
    const senderName = currentUser.nombreCompleto;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messageId,
          senderId,
          senderName,
          senderRole,
          text: clean
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setChatConversations(prev => {
            const rest = prev.filter(c => c.id !== data.conversation.id);
            return [data.conversation, ...rest];
          });
        }
      }
    } catch {
      // Fallback WebSocket send if available
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat:send',
            conversationId,
            messageId,
            senderId,
            senderName,
            senderRole,
            text: clean
          })
        );
      }
    }
  };

  const openWhatsAppChat = (
    tecnicoNombre: string,
    tecnicoTelefono: string,
    servicioTitulo: string,
    ordenId?: string,
    avatar?: string,
    institucion?: string
  ) => {
    if (!currentUser) {
      setActiveChatConversationId(null);
      setActiveWhatsAppChat(null);
      setShowChatInbox(true);
      showToast(
        'Registro Requerido para Chatear',
        'Regístrate o inicia sesión para conversar directamente con este especialista.',
        'warning'
      );
      return;
    }

    const srvMatch = servicios.find(
      s =>
        (ordenId && ordenes.find(o => o.id === ordenId)?.items.some(it => it.servicioId === s.id)) ||
        s.tecnicoTelefono.replace(/\D/g, '') === tecnicoTelefono.replace(/\D/g, '')
    );
    const ordMatch = ordenId ? ordenes.find(o => o.id === ordenId) : undefined;
    const isAnonOrder = ordMatch ? !ordMatch.clienteUsuarioId : false;

    void abrirChatDirecto({
      ordenId,
      servicioTitulo,
      clienteId: ordMatch ? ordMatch.clienteUsuarioId || 'GUEST' : currentUser.id,
      clienteNombre: ordMatch
        ? isAnonOrder
          ? 'Anónimo (No registrado)'
          : ordMatch.datosVisita.clienteNombre
        : currentUser.nombreCompleto,
      clienteDni: ordMatch ? ordMatch.datosVisita.clienteDni : currentUser.dni,
      clienteTelefono: ordMatch ? ordMatch.datosVisita.telefonoWhatsapp : currentUser.telefonoWhatsapp,
      trabajadorId: srvMatch?.autorUsuarioId,
      trabajadorNombre: tecnicoNombre,
      trabajadorDni: srvMatch?.tecnicoDni,
      trabajadorTelefono: tecnicoTelefono,
      trabajadorAvatar: avatar || srvMatch?.tecnicoAvatar || '👨‍🔧',
      trabajadorInstitucion: institucion || srvMatch?.institucionCertificadora || 'SENATI'
    });
  };

  const openExternalWhatsApp = (telefono: string, mensaje: string) => {
    const cleanPhone = telefono.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(mensaje)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCallModal = (target: CallTarget) => {
    if (!currentUser) {
      showToast(
        'Registro Requerido para Llamar',
        'Debes registrarte o iniciar sesión para ver el número y llamar a esta persona.',
        'warning'
      );
    }
    setActiveCallTarget(target);
  };

  // Derived lists
  const serviciosAprobados = servicios.filter(s => s.estadoPublicacion === 'APROBADO');
  const imprevistosAbiertosCount = imprevistos.filter(i => i.estado === 'ABIERTO').length;
  const publicacionesPendientesCount = servicios.filter(s => s.estadoPublicacion === 'PENDIENTE_APROBACION').length;
  const usuariosPendientesCount = usuarios.filter(u => u.estadoCuenta === 'PENDIENTE').length;
  const verificacionesPendientesCount = usuarios.filter(
    u => u.estadoVerificacionMedia === 'PENDIENTE_REVISION'
  ).length;

  // Calculations for current cart
  const totalItemsEnCarrito = carrito.reduce((acc, item) => acc + item.cantidadTurnos, 0);
  const subtotalCarrito = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const garantiaCarrito = carrito.reduce((acc, item) => acc + item.servicio.garantiaMonto * item.cantidadTurnos, 0);
  const igvCarrito = Number((subtotalCarrito * 0.18).toFixed(2));
  const totalCarrito = Number((subtotalCarrito + igvCarrito).toFixed(2));

  const agregarAlCarrito = (servicio: Servicio) => {
    if (servicio.turnosLibres <= 0) {
      showToast('Turnos Agotados', `El especialista ${servicio.tecnicoNombre} no tiene turnos libres en este momento.`, 'warning');
      return;
    }

    setCarrito(prev => {
      const index = prev.findIndex(item => item.servicioId === servicio.id);
      if (index >= 0) {
        const itemActual = prev[index];
        if (itemActual.cantidadTurnos >= servicio.turnosLibres) {
          showToast('Límite de Turnos', `Has seleccionado el máximo de turnos disponibles (${servicio.turnosLibres}) para este servicio.`, 'warning');
          return prev;
        }
        const updated = [...prev];
        const newCantidad = itemActual.cantidadTurnos + 1;
        updated[index] = {
          ...itemActual,
          cantidadTurnos: newCantidad,
          subtotal: Number((newCantidad * servicio.tarifaCliente).toFixed(2))
        };
        showToast('Turno Agregado', `Se añadió 1 turno adicional para ${servicio.titulo}.`, 'success');
        return updated;
      } else {
        showToast('Servicio Seleccionado', `${servicio.titulo} añadido a tu Solicitud.`, 'success');
        return [
          ...prev,
          {
            servicioId: servicio.id,
            servicio,
            cantidadTurnos: 1,
            subtotal: servicio.tarifaCliente
          }
        ];
      }
    });
  };

  const quitarDelCarrito = (servicioId: string) => {
    setCarrito(prev => prev.filter(item => item.servicioId !== servicioId));
    showToast('Servicio Removido', 'Se retiró el servicio de la solicitud.', 'info');
  };

  const actualizarCantidadItem = (servicioId: string, cantidad: number) => {
    if (cantidad <= 0) {
      quitarDelCarrito(servicioId);
      return;
    }
    setCarrito(prev => {
      return prev.map(item => {
        if (item.servicioId === servicioId) {
          const maxTurnos = item.servicio.turnosLibres;
          const cantFinal = Math.min(cantidad, maxTurnos);
          return {
            ...item,
            cantidadTurnos: cantFinal,
            subtotal: Number((cantFinal * item.servicio.tarifaCliente).toFixed(2))
          };
        }
        return item;
      });
    });
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const despacharOrdenAutomaticamente = async (orden: Orden) => {
    const trabajadoresUnicos = getTrabajadoresUnicosOrden(orden, usuarios);
    const primerTrabajador = trabajadoresUnicos[0];
    const whatsappMessage = buildWhatsAppSolicitudTrabajadorMsg(orden, primerTrabajador?.nombre);
    const correoData = buildCorreoSolicitudTrabajador(orden, primerTrabajador?.nombre);

    try {
      const resp = await fetch('/api/notifications/dispatch-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordenId: orden.id,
          servicioTitulo: orden.items.map(it => it.servicio.titulo).join(', '),
          clienteId: orden.clienteUsuarioId || currentUser?.id || 'GUEST',
          clienteNombre: orden.datosVisita.clienteNombre,
          clienteDni: orden.datosVisita.clienteDni,
          clienteTelefono: orden.datosVisita.telefonoWhatsapp,
          workers: trabajadoresUnicos.map(t => {
            const matchedSrv = orden.items.find(
              it => it.servicio.tecnicoTelefono.replace(/\D/g, '') === t.telefono.replace(/\D/g, '')
            )?.servicio;
            const matchedUser = usuarios.find(
              u =>
                u.id === matchedSrv?.autorUsuarioId ||
                (Boolean(matchedSrv?.tecnicoDni) && u.dni === matchedSrv?.tecnicoDni) ||
                u.telefonoWhatsapp.replace(/\D/g, '') === t.telefono.replace(/\D/g, '')
            );
            return {
              ...t,
              usuarioId: matchedSrv?.autorUsuarioId || matchedUser?.id,
              dni: matchedSrv?.tecnicoDni || matchedUser?.dni
            };
          }),
          whatsappMessage,
          emailSubject: correoData.subject,
          emailBody: correoData.body
        })
      });

      if (resp.ok) {
        const result = await resp.json();
        const emailSent = Boolean(result?.emailStatus?.sent);
        const waSent = Boolean(result?.whatsappStatus?.sent);
        const emailDetail = String(result?.emailStatus?.detail || '');
        const waDetail = String(result?.whatsappStatus?.detail || '');

        setOrdenes(prev =>
          prev.map(o =>
            o.id === orden.id
              ? {
                  ...o,
                  canalesEnvio: {
                    webTrabajador: true,
                    fechaEnvio: o.canalesEnvio?.fechaEnvio || o.fecha,
                    correoTrabajador: o.canalesEnvio?.correoTrabajador,
                    whatsappTrabajador: o.canalesEnvio?.whatsappTrabajador,
                    whatsappIniciado: waSent || o.canalesEnvio?.whatsappIniciado,
                    correoIniciado: emailSent || o.canalesEnvio?.correoIniciado,
                    correoEnviadoAuto: emailSent,
                    whatsappEnviadoAuto: waSent,
                    chatEnviadoAuto: true,
                    correoDetalleAuto: emailDetail,
                    whatsappDetalleAuto: waDetail
                  }
                }
              : o
          )
        );

        setLastCreatedOrder(prev =>
          prev && prev.id === orden.id
            ? {
                ...prev,
                canalesEnvio: {
                  webTrabajador: true,
                  fechaEnvio: prev.canalesEnvio?.fechaEnvio || prev.fecha,
                  correoTrabajador: prev.canalesEnvio?.correoTrabajador,
                  whatsappTrabajador: prev.canalesEnvio?.whatsappTrabajador,
                  whatsappIniciado: waSent || prev.canalesEnvio?.whatsappIniciado,
                  correoIniciado: emailSent || prev.canalesEnvio?.correoIniciado,
                  correoEnviadoAuto: emailSent,
                  whatsappEnviadoAuto: waSent,
                  chatEnviadoAuto: true,
                  correoDetalleAuto: emailDetail,
                  whatsappDetalleAuto: waDetail
                }
              }
            : prev
        );

        void fetchConversations();
      }
    } catch {
      // Ignore network dispatch errors; channels remain accessible in UI
    }
  };

  const confirmarOrdenYEscrow = (
    datosVisita: DatosVisita,
    metodoPago: MetodoPago = 'SIN_COBRO_SOLICITUD'
  ): Orden => {
    const sinCobro = metodoPago === 'SIN_COBRO_SOLICITUD';
    const referencialBase = Number(
      carrito
        .reduce((sum, item) => sum + item.servicio.precioBase * item.cantidadTurnos, 0)
        .toFixed(2)
    );
    const subtotal = sinCobro ? 0 : subtotalCarrito;
    const garantia = sinCobro ? 0 : garantiaCarrito;
    const igv = sinCobro ? 0 : igvCarrito;
    const total = sinCobro ? 0 : totalCarrito;

    const fechaActual = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const randomPed = Math.floor(1000 + Math.random() * 9000);
    const randomAuth = Math.floor(100000 + Math.random() * 900000);

    const horaText = datosVisita.horaVisita ? ` a las ${datosVisita.horaVisita} hrs` : '';
    const fechaText = datosVisita.fechaVisita ? ` el ${datosVisita.fechaVisita}` : '';

    const primerServicio = carrito[0]?.servicio;
    const primerTrabajadorTel = primerServicio?.tecnicoTelefono;
    const primerTrabajadorCorreo = primerServicio
      ? resolveEmailServicio(primerServicio, usuarios)
      : undefined;

    const datosVisitaCompletos: DatosVisita = {
      ...datosVisita,
      clienteNombre: currentUser ? datosVisita.clienteNombre : 'Anónimo (No registrado)',
      clienteDni: currentUser ? datosVisita.clienteDni : '',
      clienteEmail: currentUser ? datosVisita.clienteEmail?.trim() || currentUser.email : undefined
    };

    const nuevaOrden: Orden = {
      id: `PED-2026-${randomPed}`,
      codigoAutorizacion: sinCobro ? `SOL-PE-${randomAuth}` : `AUT-NBZ-${randomAuth}`,
      fecha: fechaActual,
      clienteUsuarioId: currentUser?.id,
      items: [...carrito],
      datosVisita: datosVisitaCompletos,
      subtotalTecnico: subtotal,
      garantiaTotal: garantia,
      igv,
      total,
      montoReferencial: referencialBase,
      sinCobroSolicitud: sinCobro,
      aceptacionTrabajador: 'PENDIENTE',
      canalesEnvio: {
        webTrabajador: true,
        correoTrabajador: primerTrabajadorCorreo,
        whatsappTrabajador: primerTrabajadorTel,
        fechaEnvio: fechaActual,
        chatEnviadoAuto: true
      },
      estado: 'EN_CUSTODIA',
      metodoPago,
      fondosLiberados: false,
      historialEstados: [
        {
          estado: 'EN_CUSTODIA',
          fecha: fechaActual,
          descripcion: sinCobro
            ? `Solicitud enviada sin cobro (S/ 0.00 · 0% comisión al trabajador) para${fechaText}${horaText} en ${datosVisita.direccion} (${datosVisita.distrito}). Despachada automáticamente al trabajador por Web, Chat Directo, Correo (${primerTrabajadorCorreo || 'registrado'}) y WhatsApp (+51 ${primerTrabajadorTel || ''}).`
            : `Orden registrada para${fechaText}${horaText} en ${datosVisita.direccion}.`
        }
      ]
    };

    setServicios(prev => {
      return prev.map(srv => {
        const itemEncontrado = carrito.find(it => it.servicioId === srv.id);
        if (itemEncontrado) {
          const restantes = Math.max(0, srv.turnosLibres - itemEncontrado.cantidadTurnos);
          return { ...srv, turnosLibres: restantes };
        }
        return srv;
      });
    });

    setOrdenes(prev => [nuevaOrden, ...prev]);
    setCarrito([]);
    setLastCreatedOrder(nuevaOrden);

    // Automatic backend dispatch: In-App Chat + Email (SMTP) + WhatsApp API
    void despacharOrdenAutomaticamente(nuevaOrden);

    showToast(
      sinCobro ? 'Solicitud Despachada Automáticamente' : 'Orden Confirmada',
      sinCobro
        ? `Orden ${nuevaOrden.id} (S/ 0.00) enviada automáticamente a la web, chat directo, correo y WhatsApp del trabajador.`
        : `Orden ${nuevaOrden.id} registrada correctamente.`,
      'success'
    );

    return nuevaOrden;
  };

  const marcarCanalEnvioOrden = (ordenId: string, canal: 'whatsapp' | 'correo') => {
    setOrdenes(prev =>
      prev.map(ord => {
        if (ord.id !== ordenId) return ord;
        return {
          ...ord,
          canalesEnvio: {
            ...ord.canalesEnvio,
            webTrabajador: true,
            fechaEnvio: ord.canalesEnvio?.fechaEnvio || ord.fecha,
            correoTrabajador: ord.canalesEnvio?.correoTrabajador,
            whatsappTrabajador: ord.canalesEnvio?.whatsappTrabajador,
            whatsappIniciado:
              canal === 'whatsapp' ? true : ord.canalesEnvio?.whatsappIniciado,
            correoIniciado:
              canal === 'correo' ? true : ord.canalesEnvio?.correoIniciado
          }
        };
      })
    );
    setLastCreatedOrder(prev => {
      if (!prev || prev.id !== ordenId) return prev;
      return {
        ...prev,
        canalesEnvio: {
          ...prev.canalesEnvio,
          webTrabajador: true,
          fechaEnvio: prev.canalesEnvio?.fechaEnvio || prev.fecha,
          correoTrabajador: prev.canalesEnvio?.correoTrabajador,
          whatsappTrabajador: prev.canalesEnvio?.whatsappTrabajador,
          whatsappIniciado:
            canal === 'whatsapp' ? true : prev.canalesEnvio?.whatsappIniciado,
          correoIniciado:
            canal === 'correo' ? true : prev.canalesEnvio?.correoIniciado
        }
      };
    });
  };

  const responderDisponibilidadOrden = (
    ordenId: string,
    decision: 'ACEPTADA' | 'NO_DISPONIBLE',
    nota?: string
  ): { ok: boolean; error?: string } => {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return { ok: false, error: 'Orden no encontrada.' };

    const esTrabajadorAsignado = Boolean(
      currentUser &&
        orden.items.some(
          it =>
            it.servicio.autorUsuarioId === currentUser.id ||
            (Boolean(currentUser.dni) && it.servicio.tecnicoDni === currentUser.dni)
        )
    );

    if (!esTrabajadorAsignado) {
      const errMsg =
        'Solo la persona del oficio asignada a este pedido puede aceptar o rechazar el pedido.';
      showToast('Acción Exclusiva del Trabajador del Oficio', errMsg, 'warning');
      return {
        ok: false,
        error: errMsg
      };
    }

    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const horaSolicitada = orden.datosVisita.horaVisita || orden.datosVisita.turno;
    const fechaSolicitada = orden.datosVisita.fechaVisita || '';
    const notaLimpia = (nota || '').trim();

    setOrdenes(prev =>
      prev.map(ord => {
        if (ord.id !== ordenId) return ord;
        const nuevoEstado: EstadoOrden =
          decision === 'ACEPTADA' && ord.estado === 'EN_CUSTODIA' ? 'EN_CAMINO' : ord.estado;
        const msg =
          decision === 'ACEPTADA'
            ? `✓ Trabajador confirmó disponibilidad${fechaSolicitada ? ` para el ${fechaSolicitada}` : ''} a las ${horaSolicitada} y aceptó el encargo.${notaLimpia ? ` Nota: "${notaLimpia}"` : ''}`
            : `✕ Trabajador indicó que NO está disponible a la hora solicitada (${horaSolicitada}).${notaLimpia ? ` Detalle: "${notaLimpia}"` : ''}`;

        return {
          ...ord,
          aceptacionTrabajador: decision,
          fechaRespuestaTrabajador: fechaHora,
          notaDisponibilidadTrabajador: notaLimpia || undefined,
          estado: nuevoEstado,
          historialEstados: [
            ...ord.historialEstados,
            {
              estado: nuevoEstado,
              fecha: fechaHora,
              descripcion: msg
            }
          ]
        };
      })
    );

    if (decision === 'NO_DISPONIBLE') {
      // Restore turnos if worker cannot make that slot
      setServicios(prev =>
        prev.map(srv => {
          const item = orden.items.find(it => it.servicioId === srv.id);
          if (!item) return srv;
          return { ...srv, turnosLibres: srv.turnosLibres + item.cantidadTurnos };
        })
      );
    }

    showToast(
      decision === 'ACEPTADA' ? 'Orden Aceptada por el Trabajador' : 'Disponibilidad Actualizada',
      decision === 'ACEPTADA'
        ? `Confirmaste disponibilidad para la orden ${orden.id} (${horaSolicitada}).`
        : `Marcaste no disponibilidad para la orden ${orden.id}.`,
      decision === 'ACEPTADA' ? 'success' : 'warning'
    );

    return { ok: true };
  };

  const darConformidadYLiberarFondos = (ordenId: string) => {
    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setOrdenes(prev => {
      return prev.map(ord => {
        if (ord.id === ordenId) {
          const montoTecnico = (ord.subtotalTecnico - ord.garantiaTotal).toFixed(2);
          const montoGarantia = ord.garantiaTotal.toFixed(2);
          return {
            ...ord,
            estado: 'CONFORMIDAD_Y_LIBERADO',
            fondosLiberados: true,
            fechaLiberacion: fechaHora,
            historialEstados: [
              ...ord.historialEstados,
              {
                estado: 'CONFORMIDAD_Y_LIBERADO',
                fecha: fechaHora,
                descripcion: ord.sinCobroSolicitud || ord.total === 0
                  ? '¡Trabajo completado y confirmado con éxito por el solicitante! Sin cobros ni comisiones retenidas.'
                  : `¡Conformidad otorgada por el cliente! Fondos liberados: S/ ${montoTecnico} transferidos a la cuenta del especialista y S/ ${montoGarantia} al Fondo de Garantía TrabajaYa.`
              }
            ]
          };
        }
        return ord;
      });
    });

    showToast(
      'Servicio Confirmado con Éxito',
      'Has confirmado la finalización satisfactoria del trabajo.',
      'success'
    );
  };

  const pagarOrdenConCulqi = (ordenId: string, receipt: CulqiPaymentReceipt) => {
    const fechaHora = receipt.createdAt || new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setOrdenes(prev =>
      prev.map(ord => {
        if (ord.id !== ordenId) return ord;
        const montoPagado = receipt.amountSoles;
        const subtotalTecnico = Number((montoPagado / 1.1).toFixed(2));
        const garantiaTotal = Number((montoPagado - subtotalTecnico).toFixed(2));
        return {
          ...ord,
          codigoAutorizacion: receipt.authorizationCode,
          sinCobroSolicitud: false,
          metodoPago: receipt.method,
          pagoCulqi: receipt,
          subtotalTecnico: ord.subtotalTecnico > 0 ? ord.subtotalTecnico : subtotalTecnico,
          garantiaTotal: ord.garantiaTotal > 0 ? ord.garantiaTotal : garantiaTotal,
          total: montoPagado,
          historialEstados: [
            ...ord.historialEstados,
            {
              estado: ord.estado,
              fecha: fechaHora,
              descripcion: `Pago en Custodia procesado vía Culqi (${receipt.brand || receipt.method}${receipt.last4 ? ` •••• ${receipt.last4}` : ''}) · Cargo ${receipt.chargeId} · S/ ${montoPagado.toFixed(2)}.`
            }
          ]
        };
      })
    );

    showToast(
      'Pago en Custodia Culqi Confirmado',
      `Cargo ${receipt.chargeId} aprobado por S/ ${receipt.amountSoles.toFixed(2)}. Tu dinero queda protegido hasta tu conformidad.`,
      'success'
    );
  };

  const reportarObservacion = (ordenId: string, motivo: string) => {
    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setOrdenes(prev => {
      return prev.map(ord => {
        if (ord.id === ordenId) {
          return {
            ...ord,
            estado: 'OBSERVADO_GARANTIA',
            historialEstados: [
              ...ord.historialEstados,
              {
                estado: 'OBSERVADO_GARANTIA',
                fecha: fechaHora,
                descripcion: `Observación registrada por el cliente: "${motivo}". El fondo permanece 100% retenido en custodia fiduciaria mientras se efectúa la revisión de garantía.`
              }
            ]
          };
        }
        return ord;
      });
    });

    showToast(
      'Garantía Activada',
      'Tu reporte fue ingresado. Los fondos permanecen congelados en custodia hasta que el trabajo quede subsanado.',
      'warning'
    );
  };

  const calificarOrden = (ordenId: string, calificacion: CalificacionServicio) => {
    const ordActual = ordenes.find(o => o.id === ordenId);
    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setOrdenes(prev => {
      return prev.map(ord => {
        if (ord.id !== ordenId) return ord;
        const estabaPendienteConformidad = ord.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD';
        return {
          ...ord,
          calificacion,
          ...(estabaPendienteConformidad
            ? {
                estado: 'CONFORMIDAD_Y_LIBERADO' as EstadoOrden,
                fondosLiberados: true,
                fechaLiberacion: ord.fechaLiberacion || fechaHora,
                historialEstados: [
                  ...ord.historialEstados,
                  {
                    estado: 'CONFORMIDAD_Y_LIBERADO' as EstadoOrden,
                    fecha: fechaHora,
                    descripcion: `Trabajo confirmado y calificado con ${calificacion.estrellas}★ por el solicitante. Comentario publicado en la ficha del especialista.`
                  }
                ]
              }
            : {})
        };
      });
    });

    if (ordActual) {
      const nuevaResena: ResenaPublicacion = {
        ordenId,
        autorNombre: ordActual.datosVisita.clienteNombre,
        estrellas: calificacion.estrellas,
        comentario: calificacion.comentario,
        fecha: calificacion.fecha,
        criterios: calificacion.criterios
      };

      const coincideServicio = (srv: Servicio) =>
        ordActual.items.some(
          it =>
            it.servicioId === srv.id ||
            (Boolean(srv.autorUsuarioId) &&
              it.servicio.autorUsuarioId === srv.autorUsuarioId &&
              it.servicio.oficio === srv.oficio) ||
            (Boolean(srv.tecnicoDni) && it.servicio.tecnicoDni === srv.tecnicoDni)
        );

      const aplicarResenaEnServicio = (srv: Servicio): Servicio => {
        if (!coincideServicio(srv)) return srv;
        const prevResenas = srv.resenasPublicadas || [];
        const existingResena = prevResenas.find(r => r.ordenId === ordenId);
        const oldStars = existingResena?.estrellas ?? ordActual.calificacion?.estrellas;
        const yaContabilizada = Boolean(existingResena || ordActual.calificacion);

        const updatedResenas = [
          nuevaResena,
          ...prevResenas.filter(r => r.ordenId !== ordenId)
        ];

        const baseCount = Math.max(0, srv.numResenas || 0);
        if (yaContabilizada && typeof oldStars === 'number') {
          const safeCount = Math.max(1, baseCount);
          const totalScore = srv.calificacion * safeCount - oldStars + calificacion.estrellas;
          const newAvg = Math.min(5, Math.max(1, Number((totalScore / safeCount).toFixed(1))));
          return {
            ...srv,
            calificacion: newAvg,
            numResenas: safeCount,
            resenasPublicadas: updatedResenas
          };
        }

        const newCount = baseCount + 1;
        const totalScore = srv.calificacion * baseCount + calificacion.estrellas;
        const newAvg = Math.min(5, Math.max(1, Number((totalScore / newCount).toFixed(1))));
        return {
          ...srv,
          calificacion: newAvg,
          numResenas: newCount,
          resenasPublicadas: updatedResenas
        };
      };

      setServicios(prev => prev.map(aplicarResenaEnServicio));
      setSelectedServiceForModal(prev => (prev ? aplicarResenaEnServicio(prev) : null));
    }

    showToast(
      'Calificación y Comentario Publicados',
      'Tus estrellas y comentario ya aparecen en la publicación del especialista.',
      'success'
    );
  };

  const actualizarTurnosServicio = (servicioId: string, delta: number) => {
    setServicios(prev => {
      return prev.map(srv => {
        if (srv.id === servicioId) {
          const nuevo = Math.max(0, srv.turnosLibres + delta);
          return { ...srv, turnosLibres: nuevo };
        }
        return srv;
      });
    });
    showToast('Agenda Actualizada', 'Los turnos disponibles se actualizaron en tiempo real.', 'info');
  };

  const actualizarEstadoOrdenManual = (ordenId: string, nuevoEstado: EstadoOrden) => {
    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const descripciones: Record<EstadoOrden, string> = {
      EN_CUSTODIA: 'Pago retenido en cuenta fiduciaria en custodia.',
      EN_CAMINO: 'Técnico certificado en ruta hacia el domicilio.',
      EN_EJECUCION: 'Técnico iniciando labores en sitio.',
      COMPLETADO_PENDIENTE_CONFORMIDAD:
        'Trabajo finalizado por el técnico. Ya aparece en Mis Órdenes del solicitante para dejar estrellas y comentario.',
      CONFORMIDAD_Y_LIBERADO: 'Fondos liberados al técnico tras conformidad.',
      OBSERVADO_GARANTIA: 'Inspección de garantía solicitada por el usuario.'
    };

    setOrdenes(prev => {
      return prev.map(ord => {
        if (ord.id === ordenId) {
          return {
            ...ord,
            estado: nuevoEstado,
            aceptacionTrabajador: ord.aceptacionTrabajador || 'ACEPTADA',
            historialEstados: [
              ...ord.historialEstados,
              {
                estado: nuevoEstado,
                fecha: fechaHora,
                descripcion: descripciones[nuevoEstado]
              }
            ]
          };
        }
        return ord;
      });
    });

    if (nuevoEstado === 'COMPLETADO_PENDIENTE_CONFORMIDAD') {
      showToast(
        'Trabajo Finalizado',
        'El pedido ya aparece como terminado en Mis Órdenes del cliente para que ponga sus estrellas y comentario.',
        'success'
      );
    } else {
      showToast('Estado Actualizado', `La orden cambió a: ${nuevoEstado}`, 'info');
    }
  };

  const cambiarEstadoCertificado = (certId: string, nuevoEstado: 'VERIFICADO' | 'EN_REVISION') => {
    setCertificados(prev => prev.map(c => (c.id === certId ? { ...c, estado: nuevoEstado } : c)));
    showToast(
      'Certificado Actualizado',
      `El certificado ${certId} ahora está ${nuevoEstado === 'VERIFICADO' ? 'Aprobado y Verificado' : 'En Revisión'}.`,
      nuevoEstado === 'VERIFICADO' ? 'success' : 'info'
    );
  };

  const resolverGarantiaAdmin = (ordenId: string, accion: 'REVISITA' | 'LIBERAR') => {
    const fechaHora = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setOrdenes(prev => {
      return prev.map(ord => {
        if (ord.id === ordenId) {
          if (accion === 'REVISITA') {
            return {
              ...ord,
              estado: 'EN_CAMINO' as EstadoOrden,
              historialEstados: [
                ...ord.historialEstados,
                {
                  estado: 'EN_CAMINO' as EstadoOrden,
                  fecha: fechaHora,
                  descripcion: 'Resolución de Administración: Re-visita técnica programada sin costo adicional para subsanar observación.'
                }
              ]
            };
          } else {
            return {
              ...ord,
              estado: 'CONFORMIDAD_Y_LIBERADO' as EstadoOrden,
              fondosLiberados: true,
              fechaLiberacion: fechaHora,
              historialEstados: [
                ...ord.historialEstados,
                {
                  estado: 'CONFORMIDAD_Y_LIBERADO' as EstadoOrden,
                  fecha: fechaHora,
                  descripcion: 'Resolución de Administración: Trabajo verificado técnicamente y fondos liberados al especialista.'
                }
              ]
            };
          }
        }
        return ord;
      });
    });

    showToast(
      'Garantía Resuelta por Administración',
      accion === 'REVISITA' ? 'Re-visita técnica ordenada sin costo.' : 'Fondos liberados tras inspección satisfactoria.',
      'success'
    );
  };

  const ingresosPublicaciones = Number(
    servicios.reduce((sum, s) => sum + (s.pagoPublicacion?.montoPagado || 0), 0).toFixed(2)
  );
  const ingresosImprevistos = Number(
    imprevistos.reduce((sum, imp) => sum + (imp.pagoPublicacion?.montoPagado || 0), 0).toFixed(2)
  );

  const billeteraTecnico = {
    fondosLiberados: Number(
      ordenes
        .filter(o => o.estado === 'CONFORMIDAD_Y_LIBERADO')
        .reduce((sum, o) => sum + (o.subtotalTecnico - o.garantiaTotal), 0)
        .toFixed(2)
    ),
    fondosEnCustodia: Number(
      ordenes
        .filter(o => o.estado !== 'CONFORMIDAD_Y_LIBERADO')
        .reduce((sum, o) => sum + o.subtotalTecnico, 0)
        .toFixed(2)
    ),
    fondoGarantia: Number(ordenes.reduce((sum, o) => sum + o.garantiaTotal, 0).toFixed(2)),
    totalContratos: ordenes.length,
    ingresosPublicaciones,
    ingresosImprevistos
  };

  const ordenesPendientesTrabajadorCount = currentUser
    ? ordenes.filter(o => {
        const soyTrabajador = o.items.some(
          it =>
            it.servicio.autorUsuarioId === currentUser.id ||
            (Boolean(currentUser.dni) && it.servicio.tecnicoDni === currentUser.dni)
        );
        const pendienteResp = !o.aceptacionTrabajador || o.aceptacionTrabajador === 'PENDIENTE';
        return soyTrabajador && pendienteResp && o.estado !== 'CONFORMIDAD_Y_LIBERADO';
      }).length
    : 0;

  const ordenesPendientesCalificarClienteCount = currentUser
    ? ordenes.filter(o => {
        const soyCliente =
          o.clienteUsuarioId === currentUser.id ||
          (Boolean(currentUser.dni) && o.datosVisita.clienteDni === currentUser.dni);
        const terminado =
          o.estado === 'COMPLETADO_PENDIENTE_CONFORMIDAD' ||
          o.estado === 'CONFORMIDAD_Y_LIBERADO';
        return soyCliente && terminado && !o.calificacion;
      }).length
    : 0;

  return (
    <ConectaContext.Provider
      value={{
        servicios,
        serviciosAprobados,
        imprevistos,
        imprevistosAbiertosCount,
        publicacionesPendientesCount,
        usuariosPendientesCount,
        verificacionesPendientesCount,
        ordenesPendientesTrabajadorCount,
        ordenesPendientesCalificarClienteCount,
        carrito,
        ordenes,
        certificados,
        usuarios,
        currentUser,
        activeTab,
        setActiveTab,
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
        selectedServiceForModal,
        setSelectedServiceForModal,
        showArchitectureModal,
        setShowArchitectureModal,
        lastCreatedOrder,
        setLastCreatedOrder,
        pedidoEnDetalleId,
        setPedidoEnDetalleId,
        toast,
        showToast,
        currentRole,
        setCurrentRole,
        adminTab,
        setAdminTab,
        showPortalModal,
        setShowPortalModal,
        showAuthModal,
        setShowAuthModal,
        inspectedProfile,
        inspeccionarPerfil,
        volverAConsolaAdmin,
        publicProfileTarget,
        verPerfilPublico,
        cerrarPerfilPublico,
        correosPermitidos,
        adminUnico,
        esCorreoPermitido,
        agregarCorreoPermitido,
        eliminarCorreoPermitido,
        registrarUsuario,
        iniciarSesion,
        cerrarSesion,
        cambiarCuentaUsuario,
        actualizarMiPerfil,
        actualizarVerificacionMedia,
        actualizarExpedienteCumplimiento,
        actualizarExpedientePorAdmin,
        cambiarEstadoCuentaUsuario,
        gestionarVerificacionUsuarioAdmin,
        eliminarArchivoVerificacionAdmin,
        editarUsuarioPorAdmin,
        eliminarUsuarioPorAdmin,
        agregarFotoTrabajoPerfil,
        eliminarFotoTrabajoPerfil,
        eliminarFotoTrabajoAdmin,
        publicarImprevisto,
        ofrecerServicioImprevisto,
        aceptarOfertaImprevisto,
        cambiarEstadoImprevistoAdmin,
        eliminarImprevistoAdmin,
        eliminarOfertaImprevistoAdmin,
        planesPublicacion,
        promoConfig,
        actualizarPlanPublicacionAdmin,
        actualizarPromoConfigAdmin,
        restablecerPlanesPublicacionAdmin,
        publicarAnuncioPagado,
        editarMiPublicacion,
        admitirPublicacion,
        rechazarPublicacion,
        agregarAlCarrito,
        quitarDelCarrito,
        actualizarCantidadItem,
        limpiarCarrito,
        confirmarOrdenYEscrow,
        marcarCanalEnvioOrden,
        responderDisponibilidadOrden,
        darConformidadYLiberarFondos,
        pagarOrdenConCulqi,
        reportarObservacion,
        calificarOrden,
        actualizarTurnosServicio,
        actualizarEstadoOrdenManual,
        cambiarEstadoCertificado,
        resolverGarantiaAdmin,
        activeWhatsAppChat,
        setActiveWhatsAppChat,
        openWhatsAppChat,
        openExternalWhatsApp,
        activeCallTarget,
        setActiveCallTarget,
        openCallModal,
        chatConversations,
        activeChatConversationId,
        setActiveChatConversationId,
        showChatInbox,
        setShowChatInbox,
        abrirChatDirecto,
        enviarMensajeChat,
        despacharOrdenAutomaticamente,
        totalItemsEnCarrito,
        subtotalCarrito,
        garantiaCarrito,
        igvCarrito,
        totalCarrito,
        billeteraTecnico
      }}
    >
      {children}
    </ConectaContext.Provider>
  );
};

export const useConecta = () => {
  const ctx = useContext(ConectaContext);
  if (!ctx) throw new Error('useConecta must be used within ConectaProvider');
  return ctx;
};
