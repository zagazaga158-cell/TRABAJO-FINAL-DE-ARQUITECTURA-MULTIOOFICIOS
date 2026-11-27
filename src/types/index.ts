export type OficioType =
  | 'GASFITERIA'
  | 'ELECTRICIDAD'
  | 'CERRAJERIA'
  | 'PINTURA'
  | 'ALBANILERIA'
  | 'DRYWALL'
  | 'CARPINTERIA'
  | 'SOLDADURA'
  | 'ELECTRODOMESTICOS'
  | 'CLIMATIZACION'
  | 'VIDRIERIA'
  | 'LIMPIEZA'
  | 'JARDINERIA'
  | 'SOPORTE_TI';

export type GrupoOficioId = 'CRITICAS' | 'ACABADOS' | 'MOBILIARIO' | 'COMPLEMENTARIOS';

export interface GrupoOficioInfo {
  id: GrupoOficioId;
  numero: number;
  nombre: string;
  subtitulo: string;
  icon: string;
}

export const GRUPOS_OFICIO: GrupoOficioInfo[] = [
  {
    id: 'CRITICAS',
    numero: 1,
    nombre: '1. Instalaciones y Reparaciones Críticas',
    subtitulo: 'Gasfitería, Electricidad residencial, Cerrajería y Climatización',
    icon: '⚡'
  },
  {
    id: 'ACABADOS',
    numero: 2,
    nombre: '2. Acabados y Estructuras',
    subtitulo: 'Pintura, Albañilería básica, Instalación de Drywall y Vidriería',
    icon: '🧱'
  },
  {
    id: 'MOBILIARIO',
    numero: 3,
    nombre: '3. Mobiliario y Equipamiento',
    subtitulo: 'Carpintería (Madera y Melamina), Soldadura (Herrería) y Línea Blanca',
    icon: '🪚'
  },
  {
    id: 'COMPLEMENTARIOS',
    numero: 4,
    nombre: '4. Servicios Complementarios',
    subtitulo: 'Limpieza y Saneamiento, Jardinería y Cámaras / Redes TI',
    icon: '🌿'
  }
];

export const CATEGORIAS_OFICIO: {
  id: OficioType;
  grupoId: GrupoOficioId;
  label: string;
  shortLabel: string;
  icon: string;
  descripcionServicios: string;
  tareasComunes: string[];
}[] = [
  {
    id: 'GASFITERIA',
    grupoId: 'CRITICAS',
    label: '🔧 Gasfitería',
    shortLabel: 'Gasfitería',
    icon: '🔧',
    descripcionServicios:
      'Reparación de fugas de agua, desatoros, instalación de griferías, sanitarios, termas y limpieza de tanques elevados o cisternas.',
    tareasComunes: [
      'Reparación de fugas de agua',
      'Desatoros de desagüe',
      'Instalación de griferías y sanitarios',
      'Instalación y mantenimiento de termas',
      'Limpieza de tanques elevados o cisternas'
    ]
  },
  {
    id: 'ELECTRICIDAD',
    grupoId: 'CRITICAS',
    label: '⚡ Electricidad Residencial',
    shortLabel: 'Electricidad',
    icon: '⚡',
    descripcionServicios:
      'Solución de cortocircuitos, instalación de luminarias, tomacorrientes, actualización de tableros eléctricos (llaves termomagnéticas) y cableado.',
    tareasComunes: [
      'Solución de cortocircuitos',
      'Instalación de luminarias y tomacorrientes',
      'Tableros eléctricos y llaves termomagnéticas',
      'Cableado residencial y pozo a tierra'
    ]
  },
  {
    id: 'CERRAJERIA',
    grupoId: 'CRITICAS',
    label: '🔑 Cerrajería',
    shortLabel: 'Cerrajería',
    icon: '🔑',
    descripcionServicios:
      'Apertura de puertas de emergencia, cambio de chapas, e instalación de cerraduras de seguridad o chapas inteligentes.',
    tareasComunes: [
      'Apertura de puertas de emergencia',
      'Cambio de chapas y cilindros',
      'Cerraduras de seguridad multipunto',
      'Instalación de chapas inteligentes'
    ]
  },
  {
    id: 'CLIMATIZACION',
    grupoId: 'CRITICAS',
    label: '❄️ Aire Acondicionado',
    shortLabel: 'Climatización',
    icon: '❄️',
    descripcionServicios:
      'Instalación, mantenimiento preventivo, limpieza de filtros y recarga de gas en equipos split e inverter.',
    tareasComunes: [
      'Mantenimiento preventivo Split',
      'Instalación de aire acondicionado',
      'Recarga de gas refrigerante',
      'Limpieza de evaporadora y drenaje'
    ]
  },
  {
    id: 'PINTURA',
    grupoId: 'ACABADOS',
    label: '🎨 Pintura',
    shortLabel: 'Pintura',
    icon: '🎨',
    descripcionServicios:
      'Empastado, lijado y pintado de interiores y fachadas, incluyendo tratamientos contra la humedad y el salitre.',
    tareasComunes: [
      'Empastado y lijado fino',
      'Pintado de interiores y fachadas',
      'Tratamiento contra humedad y salitre',
      'Sellado e impermeabilización'
    ]
  },
  {
    id: 'ALBANILERIA',
    grupoId: 'ACABADOS',
    label: '🧱 Albañilería Básica',
    shortLabel: 'Albañilería',
    icon: '🧱',
    descripcionServicios:
      'Resanes de paredes, enchapado de cerámicos o mayólicas, y pequeñas remodelaciones.',
    tareasComunes: [
      'Resanes de paredes y tarrajeo',
      'Enchapado de cerámicos o mayólicas',
      'Instalación de porcelanato',
      'Pequeñas remodelaciones'
    ]
  },
  {
    id: 'DRYWALL',
    grupoId: 'ACABADOS',
    label: '🏗️ Instalación de Drywall',
    shortLabel: 'Drywall',
    icon: '🏗️',
    descripcionServicios:
      'Armado de divisiones de habitaciones y falsos techos con perfilería metálica, planchas estándar o RH y masillado.',
    tareasComunes: [
      'Divisiones de habitaciones en Drywall',
      'Falsos techos y cielo raso',
      'Aislamiento acústico y térmico',
      'Masillado y acabado listo para pintar'
    ]
  },
  {
    id: 'VIDRIERIA',
    grupoId: 'ACABADOS',
    label: '🪟 Vidriería y Aluminio',
    shortLabel: 'Vidriería',
    icon: '🪟',
    descripcionServicios:
      'Mamparas de vidrio templado, puertas de ducha, ventanas acústicas de aluminio y reposición de espejos.',
    tareasComunes: [
      'Mamparas de vidrio templado',
      'Puertas de ducha y herrajes',
      'Ventanas de aluminio',
      'Sellado siliconado estructural'
    ]
  },
  {
    id: 'CARPINTERIA',
    grupoId: 'MOBILIARIO',
    label: '🪚 Carpintería (Madera y Melamina)',
    shortLabel: 'Carpintería',
    icon: '🪚',
    descripcionServicios:
      'Reparación de puertas, cambio de bisagras y el servicio de armado e instalación de muebles prefabricados (roperos, centros de TV, reposteros).',
    tareasComunes: [
      'Reparación de puertas y cambio de bisagras',
      'Armado de muebles prefabricados',
      'Instalación de roperos y centros de TV',
      'Reposteros en melamina y madera'
    ]
  },
  {
    id: 'SOLDADURA',
    grupoId: 'MOBILIARIO',
    label: '🔥 Soldadura (Herrería)',
    shortLabel: 'Soldadura',
    icon: '🔥',
    descripcionServicios:
      'Mantenimiento y reparación de rejas, portones, ventanas y barandas metálicas con acabado anticorrosivo.',
    tareasComunes: [
      'Mantenimiento y reparación de rejas',
      'Reparación de portones y bisagras metálicas',
      'Soldadura en ventanas y barandas',
      'Pintura base zincromato anticorrosiva'
    ]
  },
  {
    id: 'ELECTRODOMESTICOS',
    grupoId: 'MOBILIARIO',
    label: '🔌 Técnico de Línea Blanca',
    shortLabel: 'Línea Blanca',
    icon: '🔌',
    descripcionServicios:
      'Mantenimiento preventivo y reparación de lavadoras, refrigeradoras, cocinas y hornos.',
    tareasComunes: [
      'Reparación de lavadoras',
      'Mantenimiento de refrigeradoras',
      'Reparación de cocinas y hornos',
      'Diagnóstico de tarjetas inverter'
    ]
  },
  {
    id: 'LIMPIEZA',
    grupoId: 'COMPLEMENTARIOS',
    label: '🧹 Limpieza y Saneamiento',
    shortLabel: 'Limpieza',
    icon: '🧹',
    descripcionServicios:
      'Lavado de alfombras, muebles, limpieza post-construcción y fumigación residencial.',
    tareasComunes: [
      'Lavado de alfombras y muebles',
      'Limpieza post-construcción',
      'Fumigación residencial y saneamiento',
      'Desinfección integral de ambientes'
    ]
  },
  {
    id: 'JARDINERIA',
    grupoId: 'COMPLEMENTARIOS',
    label: '🌿 Jardinería',
    shortLabel: 'Jardinería',
    icon: '🌿',
    descripcionServicios:
      'Mantenimiento de áreas verdes, poda, siembra y control de plagas en exteriores.',
    tareasComunes: [
      'Mantenimiento de áreas verdes',
      'Poda técnica y ornamental',
      'Siembra de césped y plantas',
      'Control de plagas en exteriores'
    ]
  },
  {
    id: 'SOPORTE_TI',
    grupoId: 'COMPLEMENTARIOS',
    label: '💻 Cámaras y Redes TI',
    shortLabel: 'Soporte TI',
    icon: '💻',
    descripcionServicios:
      'Instalación de cámaras de videovigilancia CCTV, alarmas Wi-Fi, cableado estructurado y redes domésticas.',
    tareasComunes: [
      'Instalación de cámaras CCTV',
      'Configuración de redes Wi-Fi Mesh',
      'Cableado estructurado Cat6',
      'Soporte de alarmas inteligentes'
    ]
  }
];

export type UbicacionPeru = string;

// Estrictamente 2 permisos en toda la plataforma
export type PermisoRol = 'USUARIO' | 'ADMIN';

// Modalidad funcional dentro del permiso USUARIO
export type TipoUsuario = 'CLIENTE_HOGAR' | 'OFERTANTE_OFICIO' | 'AMBOS';

export type EstadoCuentaUsuario = 'PENDIENTE' | 'ACTIVO' | 'SUSPENDIDO';

export type EstadoVerificacionMedia = 'SIN_ADJUNTOS' | 'PENDIENTE_REVISION' | 'VERIFICADO' | 'OBSERVADO';

export type EstadoPublicacion = 'PENDIENTE_APROBACION' | 'APROBADO' | 'RECHAZADO';

export type PlanPublicacionId = 'PRUEBA_7' | 'BASICO' | 'DESTACADO' | 'PRO';

export type TipoDocumentoIdentidad = 'DNI' | 'CE' | 'PASAPORTE';

export type ComprobanteDomicilioTipo = 'AGUA' | 'LUZ' | 'TELEFONO';

export type TipoComprobanteTributario = 'RECIBO_HONORARIOS' | 'FACTURA';

export type TipoContratoLaboral = 'LOCACION_SERVICIOS' | 'CONTRATO_TRABAJO';

export interface InventarioHerramientaItem {
  id: string;
  equipo: string;
  codigoSerie: string;
  cantidad: number;
  estado: 'OPERATIVO' | 'NUEVO' | 'DEVUELTO';
  origen: 'EMPRESA' | 'PROPIA';
}

export interface FotoTrabajoRealizado {
  id: string;
  imagenUrl: string;
  titulo: string;
  descripcion?: string;
  oficio?: OficioType;
  ubicacion?: string;
  fecha: string;
}

export interface PlanPublicacion {
  id: PlanPublicacionId;
  categoriaEtiqueta: string;
  nombre: string;
  subtituloTag: string;
  duracionDias: number;
  precio: number;
  precioRegular?: number;
  beneficios: string[];
  destacado: boolean;
  nivelPrioridad: number;
}

export interface PromoLanzamientoConfig {
  pruebaGratisActiva: boolean;
  descuentoDestacadoActivo: boolean;
}

export interface UsuarioRegistrado {
  id: string;
  permiso: PermisoRol; // Solo 'USUARIO' o 'ADMIN'
  tipoUsuario?: TipoUsuario; // Cliente Hogar (publica imprevistos), Ofertante de Oficio, o Ambos
  estadoCuenta?: EstadoCuentaUsuario;
  tipoDocumento?: TipoDocumentoIdentidad;
  dni: string; // Número de documento (DNI, Carnet de Extranjería o Pasaporte)
  nombreCompleto: string;
  telefonoWhatsapp: string;
  email: string;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  direccion: string;
  password: string;
  fechaRegistro: string;
  especialidadPrincipal?: string;

  // 1. Documentación de Identidad, Domicilio y Emergencias
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

  // 2. Documentación Legal y Tributaria (Contratista independiente)
  rucNumero?: string;
  rucActivo?: boolean;
  tipoComprobanteTributario?: TipoComprobanteTributario;
  fichaRucUrl?: string;
  fichaRucNombre?: string;

  // 3. Seguridad y Antecedentes (Policiales, Penales, Judiciales)
  antecedentesPolicialesUrl?: string;
  antecedentesPolicialesNombre?: string;
  antecedentesPenalesUrl?: string;
  antecedentesPenalesNombre?: string;
  antecedentesJudicialesUrl?: string;
  antecedentesJudicialesNombre?: string;

  // 4. Validaciones Técnicas y Licencia de Conducir
  certificacionTecnicaDetalle?: string;
  certificadoOpcionalUrl?: string;
  certificadoOpcionalNombre?: string;
  licenciaConducirNumero?: string;
  licenciaConducirCategoria?: string;
  licenciaConducirUrl?: string;
  licenciaConducirNombre?: string;

  // 5. Acuerdos, Normas de Conducta e Inventario de Herramientas Firmado
  contratoTipo?: TipoContratoLaboral;
  contratoFirmado?: boolean;
  contratoFirmaNombre?: string;
  contratoFechaFirma?: string;
  normasConductaFirmadas?: boolean;
  normasConductaFecha?: string;
  inventarioHerramientas?: InventarioHerramientaItem[];
  inventarioFirmado?: boolean;
  inventarioFechaFirma?: string;

  // 6. Galería Pública de Fotos de Trabajos Realizados
  fotosTrabajos?: FotoTrabajoRealizado[];

  estadoVerificacionMedia?: EstadoVerificacionMedia;
  observacionVerificacion?: string;
}

export interface CulqiPaymentReceipt {
  id: string;
  chargeId: string;
  tokenId: string;
  authorizationCode: string;
  referenceCode: string;
  amountCentimos: number;
  amountSoles: number;
  currency: 'PEN';
  method: 'TARJETA' | 'YAPE_PLIN';
  concepto: 'IMPREVISTO' | 'ANUNCIO' | 'ORDEN_CUSTODIA';
  referenceId?: string;
  description: string;
  email: string;
  brand?: string;
  last4?: string;
  mode: 'live' | 'test' | 'sandbox';
  createdAt: string;
}

export interface PagoPublicacion {
  codigoPago: string;
  codigoAutorizacion: string;
  planId: PlanPublicacionId;
  planNombre: string;
  montoPagado: number;
  metodoPago: MetodoPago;
  fechaPago: string;
  pasarela?: 'CULQI';
  culqiChargeId?: string;
  culqiTokenId?: string;
  culqiModo?: 'live' | 'test' | 'sandbox';
  culqiResumen?: string;
}

export interface ResenaPublicacion {
  ordenId: string;
  autorNombre: string;
  estrellas: number;
  comentario: string;
  fecha: string;
  criterios?: {
    puntualidad: number;
    calidad: number;
    limpieza: number;
  };
}

export interface Servicio {
  id: string; // e.g. 'SRV-E01' or 'PUB-...'
  oficio: OficioType;
  oficioLabel: string;
  titulo: string;
  descripcion: string;
  tecnicoNombre: string;
  tecnicoDni: string;
  tecnicoTelefono: string;
  tecnicoEmail?: string;
  tecnicoAvatar: string;
  institucionCertificadora: 'SENATI' | 'SENCICO' | 'CAPECO' | string;
  codigoCertificado: string;
  precioBase: number;
  tarifaCliente: number; // precioBase + 10%
  garantiaMonto: number; // 10% de precioBase
  turnosLibres: number;
  calificacion: number;
  numResenas: number;
  experienciaAnos: number;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  imagen: string;
  capacitado: boolean;
  habilidades: string[];
  resenasPublicadas?: ResenaPublicacion[];
  // Campos de publicación pagada y moderación
  autorUsuarioId?: string;
  estadoPublicacion: EstadoPublicacion;
  fechaPublicacion: string;
  pagoPublicacion?: PagoPublicacion;
  motivoRechazo?: string;
  destacado?: boolean;
  nivelPlan?: 'PRUEBA' | 'BASICO' | 'DESTACADO' | 'PRO';
  selloVerificadoPro?: boolean;
}

export type UrgenciaImprevisto = 'NORMAL' | 'URGENTE' | 'EMERGENCIA';

export type EstadoImprevisto = 'ABIERTO' | 'ADJUDICADO' | 'CERRADO' | 'RETIRADO_ADMIN';

export interface OfertaImprevisto {
  id: string;
  imprevistoId: string;
  ofertanteUsuarioId: string;
  ofertanteNombre: string;
  ofertanteDni: string;
  ofertanteTelefono: string;
  ofertanteFotoUrl?: string;
  especialidad: string;
  institucionCertificadora: string;
  verificadoAdmin: boolean;
  calificacionEstrellas: number;
  numResenas: number;
  montoOferta: number;
  tiempoEstimado: string;
  garantiaDias: number;
  mensajePropuesta: string;
  fechaOferta: string;
  estado: 'ENVIADA' | 'ACEPTADA' | 'DESCARTADA';
}

export interface PagoImprevisto {
  codigoPago: string;
  codigoAutorizacion: string;
  montoPagado: number;
  metodoPago: MetodoPago;
  fechaPago: string;
  pasarela?: 'CULQI';
  culqiChargeId?: string;
  culqiTokenId?: string;
  culqiModo?: 'live' | 'test' | 'sandbox';
  culqiResumen?: string;
}

export interface ImprevistoHogar {
  id: string;
  autorUsuarioId: string;
  autorNombre: string;
  autorDni: string;
  autorTelefono: string;
  autorFotoUrl?: string;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  direccion: string;
  oficio: OficioType;
  oficioLabel: string;
  titulo: string;
  descripcion: string;
  urgencia: UrgenciaImprevisto;
  presupuestoReferencial?: number;
  imagenes: string[];
  fechaPublicacion: string;
  estado: EstadoImprevisto;
  pagoPublicacion?: PagoImprevisto;
  ofertaAceptadaId?: string;
  ordenGeneradaId?: string;
  ofertas: OfertaImprevisto[];
}

export interface ItemCarrito {
  servicioId: string;
  servicio: Servicio;
  cantidadTurnos: number;
  subtotal: number;
}

export interface DatosVisita {
  clienteNombre: string;
  clienteDni: string;
  region?: string;
  provincia?: string;
  distrito: UbicacionPeru;
  direccion: string;
  referencia: string;
  fechaVisita?: string; // YYYY-MM-DD
  horaVisita?: string; // HH:mm
  coordenadas?: { lat: number; lng: number };
  enlaceMapa?: string;
  turno: 'Mañana (08:00 - 12:00)' | 'Tarde (14:00 - 18:00)' | 'Atención de Urgencia';
  telefonoWhatsapp: string;
  clienteEmail?: string;
  notasAdicionales?: string;
}

export type MetodoPago = 'SIN_COBRO_SOLICITUD' | 'TARJETA' | 'YAPE_PLIN' | 'PAGO_EFECTIVO';

export type EstadoAceptacionTrabajador = 'PENDIENTE' | 'ACEPTADA' | 'NO_DISPONIBLE';

export type EstadoOrden =
  | 'EN_CUSTODIA' // Orden registrada / en espera o en curso
  | 'EN_CAMINO' // Especialista en camino
  | 'EN_EJECUCION' // En ejecución técnica
  | 'COMPLETADO_PENDIENTE_CONFORMIDAD' // Visita completada, esperando conformidad
  | 'CONFORMIDAD_Y_LIBERADO' // Trabajo finalizado y confirmado
  | 'OBSERVADO_GARANTIA'; // Observación / garantía activada

export interface CalificacionServicio {
  estrellas: number;
  comentario: string;
  fecha: string;
  criterios: {
    puntualidad: number;
    calidad: number;
    limpieza: number;
  };
}

export interface Orden {
  id: string; // e.g. 'PED-2026-8942'
  codigoAutorizacion: string; // e.g. 'AUT-NBZ-948201'
  fecha: string;
  clienteUsuarioId?: string;
  items: ItemCarrito[];
  datosVisita: DatosVisita;
  subtotalTecnico: number;
  garantiaTotal: number;
  igv: number;
  total: number;
  montoReferencial?: number;
  sinCobroSolicitud?: boolean;
  aceptacionTrabajador?: EstadoAceptacionTrabajador;
  fechaRespuestaTrabajador?: string;
  notaDisponibilidadTrabajador?: string;
  canalesEnvio?: {
    webTrabajador: boolean;
    correoTrabajador?: string;
    whatsappTrabajador?: string;
    fechaEnvio: string;
    whatsappIniciado?: boolean;
    correoIniciado?: boolean;
    correoEnviadoAuto?: boolean;
    whatsappEnviadoAuto?: boolean;
    chatEnviadoAuto?: boolean;
    correoDetalleAuto?: string;
    whatsappDetalleAuto?: string;
  };
  estado: EstadoOrden;
  metodoPago: MetodoPago;
  pagoCulqi?: CulqiPaymentReceipt;
  fondosLiberados: boolean;
  fechaLiberacion?: string;
  calificacion?: CalificacionServicio;
  historialEstados: {
    estado: EstadoOrden;
    fecha: string;
    descripcion: string;
  }[];
}

export type RoleType = PermisoRol;

export type AdminTabType = 'publicaciones' | 'planes' | 'imprevistos' | 'usuarios' | 'billetera' | 'turnos' | 'certificados';

export type UserTabType = 'catalogo' | 'imprevistos' | 'publicar' | 'solicitud' | 'ordenes';

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  sender: 'cliente' | 'tecnico' | 'trabajador' | 'sistema';
  senderRole?: 'cliente' | 'trabajador' | 'sistema';
  text: string;
  timestamp: string;
  createdAt?: number;
  isStatusUpdate?: boolean;
}

export interface ChatConversation {
  id: string;
  ordenId?: string;
  imprevistoId?: string;
  servicioTitulo: string;
  clienteId?: string;
  clienteNombre: string;
  clienteDni?: string;
  clienteTelefono?: string;
  trabajadorId?: string;
  trabajadorNombre: string;
  trabajadorDni?: string;
  trabajadorTelefono: string;
  trabajadorAvatar?: string;
  trabajadorInstitucion?: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface CertificadoTecnico {
  id: string;
  tecnicoNombre: string;
  institucion: 'SENATI' | 'SENCICO' | 'CAPECO';
  especialidad: string;
  codigoRegistro: string;
  fechaEmision: string;
  vigencia: string;
  estado: 'VERIFICADO' | 'EN_REVISION';
  horasCapacitacion: number;
}
