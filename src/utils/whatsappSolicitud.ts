import { Orden, Servicio, UsuarioRegistrado } from '../types';
import { formatUbicacion } from '../data/peruUbigeo';

export const formatPeruWhatsAppDigits = (telefono: string): string => {
  const clean = (telefono || '').replace(/\D/g, '');
  if (!clean) return '51966000100';
  return clean.startsWith('51') ? clean : `51${clean}`;
};

export const buildOrdenMapsUrl = (orden: Orden): string => {
  const { datosVisita } = orden;
  if (datosVisita.enlaceMapa?.trim()) {
    return datosVisita.enlaceMapa.trim();
  }
  if (datosVisita.coordenadas) {
    return `https://www.google.com/maps?q=${datosVisita.coordenadas.lat},${datosVisita.coordenadas.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${datosVisita.direccion}, ${datosVisita.distrito}, ${datosVisita.provincia || ''}, ${datosVisita.region || ''}, Peru`
  )}`;
};

export const resolveEmailServicio = (
  servicio: Servicio,
  usuarios: UsuarioRegistrado[]
): string => {
  if (servicio.tecnicoEmail?.trim()) return servicio.tecnicoEmail.trim();
  const match = usuarios.find(
    u =>
      (servicio.autorUsuarioId && u.id === servicio.autorUsuarioId) ||
      (servicio.tecnicoDni && u.dni === servicio.tecnicoDni) ||
      u.nombreCompleto.toLowerCase() === servicio.tecnicoNombre.toLowerCase()
  );
  if (match?.email) return match.email;
  const slug = servicio.tecnicoNombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${slug || 'especialista'}@conectaoficios.pe`;
};

export interface TrabajadorContactoOrden {
  usuarioId?: string;
  nombre: string;
  telefono: string;
  email: string;
  avatar: string;
  titulo: string;
  institucion: string;
}

export const getTrabajadoresUnicosOrden = (
  orden: Orden,
  usuarios: UsuarioRegistrado[] = []
): TrabajadorContactoOrden[] => {
  const seen = new Set<string>();
  const result: TrabajadorContactoOrden[] = [];

  for (const it of orden.items) {
    const tel = it.servicio.tecnicoTelefono || '966 123 456';
    const email = resolveEmailServicio(it.servicio, usuarios);
    const key = `${it.servicio.tecnicoNombre}|${tel.replace(/\D/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        usuarioId: it.servicio.autorUsuarioId,
        nombre: it.servicio.tecnicoNombre,
        telefono: tel,
        email,
        avatar: it.servicio.tecnicoAvatar || '🛠️',
        titulo: it.servicio.titulo,
        institucion: it.servicio.institucionCertificadora
      });
    }
  }
  return result;
};

export const buildWhatsAppSolicitudTrabajadorMsg = (
  orden: Orden,
  trabajadorNombre?: string
): string => {
  const { datosVisita } = orden;
  const serviciosTxt = orden.items
    .map(
      it =>
        `- ${it.servicio.titulo} (${it.servicio.oficioLabel}) x${it.cantidadTurnos}`
    )
    .join('\n');

  const nombreDestino =
    trabajadorNombre ||
    orden.items[0]?.servicio.tecnicoNombre ||
    'Especialista';

  const horaTxt = datosVisita.horaVisita
    ? `${datosVisita.horaVisita} hrs (${datosVisita.turno})`
    : datosVisita.turno;

  const ubicacionPeru = formatUbicacion(
    datosVisita.distrito,
    datosVisita.provincia,
    datosVisita.region
  );

  const mapsUrl = buildOrdenMapsUrl(orden);
  const isSinCobro = Boolean(orden.sinCobroSolicitud || orden.total === 0);

  const lines: string[] = [
    `*NUEVA SOLICITUD DE ENCARGO - TrabajaYa Perú*`,
    `Hola *${nombreDestino}*, tienes una nueva solicitud de servicio con los siguientes datos:`,
    ``,
    `*Orden:* ${orden.id} (${orden.codigoAutorizacion})`,
    `*Servicio(s):*`,
    serviciosTxt,
    `*Fecha solicitada:* ${datosVisita.fechaVisita || orden.fecha}`,
    `*Hora solicitada:* ${horaTxt}`,
    ``,
    `*Datos del solicitante:*`,
    `- Nombre: ${datosVisita.clienteNombre}${datosVisita.clienteDni ? ` (DNI ${datosVisita.clienteDni})` : ''}`,
    `- Teléfono / WhatsApp: +51 ${datosVisita.telefonoWhatsapp}`,
    ...(datosVisita.clienteEmail ? [`- Correo: ${datosVisita.clienteEmail}`] : []),
    ``,
    `*Ubicación del domicilio:*`,
    `- Dirección: ${datosVisita.direccion}`,
    `- Lugar: ${ubicacionPeru}`,
    `- Referencia: ${datosVisita.referencia || 'Sin referencia adicional'}`,
    `- Mapa GPS / Ubicación: ${mapsUrl}`
  ];

  if (datosVisita.notasAdicionales?.trim()) {
    lines.push(`- Detalles del encargo: ${datosVisita.notasAdicionales.trim()}`);
  }

  lines.push('');

  if (isSinCobro) {
    if (orden.montoReferencial !== undefined) {
      lines.push(`*Tarifa referencial:* S/ ${orden.montoReferencial.toFixed(2)}`);
    }
    lines.push(`*Cobro en solicitud / al trabajador:* S/ 0.00 (Sin cobro al trabajador)`);
  } else {
    lines.push(`*Total de orden:* S/ ${orden.total.toFixed(2)}`);
  }

  lines.push('');
  lines.push(
    `Por favor revisa la hora y ubicación del domicilio y confirma en la app (o por este WhatsApp) si estás disponible a esa hora para aceptar la orden.`
  );

  return lines.join('\n');
};

export const buildCorreoSolicitudTrabajador = (
  orden: Orden,
  trabajadorNombre?: string
): { subject: string; body: string } => {
  const { datosVisita } = orden;
  const nombreDestino =
    trabajadorNombre ||
    orden.items[0]?.servicio.tecnicoNombre ||
    'Especialista';
  const horaTxt = datosVisita.horaVisita
    ? `${datosVisita.horaVisita} hrs (${datosVisita.turno})`
    : datosVisita.turno;
  const ubicacionPeru = formatUbicacion(
    datosVisita.distrito,
    datosVisita.provincia,
    datosVisita.region
  );
  const mapsUrl = buildOrdenMapsUrl(orden);
  const serviciosTxt = orden.items
    .map(it => `• ${it.servicio.titulo} (${it.servicio.oficioLabel}) x${it.cantidadTurnos}`)
    .join('\n');

  const subject = `Nueva Solicitud de Encargo ${orden.id} · ${datosVisita.fechaVisita || orden.fecha} ${datosVisita.horaVisita ? `${datosVisita.horaVisita} hrs` : ''}`;

  const body = [
    `Hola ${nombreDestino},`,
    ``,
    `Has recibido una nueva solicitud de servicio a domicilio en TrabajaYa Perú (enviada a tu correo, a tu página web de trabajador y a tu WhatsApp).`,
    ``,
    `DATOS DE LA SOLICITUD`,
    `----------------------------------------`,
    `Orden: ${orden.id} (Código: ${orden.codigoAutorizacion})`,
    `Servicio(s):`,
    serviciosTxt,
    `Fecha solicitada: ${datosVisita.fechaVisita || orden.fecha}`,
    `Hora solicitada: ${horaTxt}`,
    ``,
    `DATOS DEL SOLICITANTE`,
    `----------------------------------------`,
    `Nombre: ${datosVisita.clienteNombre}${datosVisita.clienteDni ? ` (DNI ${datosVisita.clienteDni})` : ''}`,
    `Teléfono / WhatsApp: +51 ${datosVisita.telefonoWhatsapp}`,
    datosVisita.clienteEmail ? `Correo: ${datosVisita.clienteEmail}` : '',
    ``,
    `UBICACIÓN DEL DOMICILIO`,
    `----------------------------------------`,
    `Dirección: ${datosVisita.direccion}`,
    `Región / Provincia / Distrito: ${ubicacionPeru}`,
    `Referencia: ${datosVisita.referencia || 'Sin referencia adicional'}`,
    `Enlace Mapa GPS: ${mapsUrl}`,
    datosVisita.notasAdicionales?.trim()
      ? `Detalles adicionales: ${datosVisita.notasAdicionales.trim()}`
      : '',
    ``,
    `CONDICIONES DE LA SOLICITUD`,
    `----------------------------------------`,
    orden.montoReferencial !== undefined
      ? `Tarifa referencial: S/ ${orden.montoReferencial.toFixed(2)}`
      : '',
    `Cobro en la solicitud / al trabajador: S/ 0.00 (Sin cobro al trabajador)`,
    ``,
    `Ingresa a tu página web en TrabajaYa Perú (Mi Perfil o Mis Órdenes) para aceptar si estás disponible a esa hora, o coordina directo por WhatsApp.`
  ]
    .filter(line => line !== '')
    .join('\n');

  return { subject, body };
};

export const buildMailtoUrl = (email: string, subject: string, body: string): string => {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const buildGmailComposeUrl = (email: string, subject: string, body: string): string => {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const buildWhatsAppUrl = (telefono: string, mensaje: string): string => {
  const fullPhone = formatPeruWhatsAppDigits(telefono);
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(mensaje)}`;
};

export const buildWhatsAppRespuestaClienteMsg = (orden: Orden): string => {
  const horaTxt = orden.datosVisita.horaVisita
    ? `${orden.datosVisita.horaVisita} hrs`
    : orden.datosVisita.turno;
  const tecnico = orden.items[0]?.servicio.tecnicoNombre || 'Especialista';
  const estadoTxt =
    orden.aceptacionTrabajador === 'ACEPTADA'
      ? `ACEPTADA (confirmo disponibilidad para el ${orden.datosVisita.fechaVisita || ''} a las ${horaTxt})`
      : orden.aceptacionTrabajador === 'NO_DISPONIBLE'
      ? `NO DISPONIBLE a las ${horaTxt}`
      : `EN REVISIÓN`;

  return [
    `*RESPUESTA DE DISPONIBILIDAD - TrabajaYa Perú*`,
    `Hola *${orden.datosVisita.clienteNombre}*, soy *${tecnico}*.`,
    `Respecto a tu solicitud *${orden.id}* en *${orden.datosVisita.direccion}*:`,
    `• Estado: *${estadoTxt}*`,
    orden.notaDisponibilidadTrabajador ? `• Nota: ${orden.notaDisponibilidadTrabajador}` : ''
  ]
    .filter(Boolean)
    .join('\n');
};
