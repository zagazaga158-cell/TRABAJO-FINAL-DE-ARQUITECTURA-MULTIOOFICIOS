import { describe, expect, it } from '@jest/globals';
import {
  buildCorreoSolicitudTrabajador,
  buildGmailComposeUrl,
  buildMailtoUrl,
  buildOrdenMapsUrl,
  buildWhatsAppRespuestaClienteMsg,
  buildWhatsAppSolicitudTrabajadorMsg,
  buildWhatsAppUrl,
  formatPeruWhatsAppDigits,
  getTrabajadoresUnicosOrden,
  resolveEmailServicio
} from '../../src/utils/whatsappSolicitud';
import {
  ORDENES_DEMO_INICIALES,
  SERVICIOS_INICIALES,
  USUARIOS_INICIALES
} from '../../src/data/initialData';
import { Orden } from '../../src/types';

describe('Utilidades de Despacho Multicanal — whatsappSolicitud.ts', () => {
  const ordenDemo = ORDENES_DEMO_INICIALES[0];

  it('normaliza teléfonos peruanos agregando prefijo 51', () => {
    expect(formatPeruWhatsAppDigits('986 864 822')).toBe('51986864822');
    expect(formatPeruWhatsAppDigits('+51 999-111-222')).toBe('51999111222');
    expect(formatPeruWhatsAppDigits('')).toBe('51966000100');
  });

  it('construye enlaces Google Maps priorizando enlaceMapa > coordenadas > dirección', () => {
    const conEnlace: Orden = {
      ...ordenDemo,
      datosVisita: {
        ...ordenDemo.datosVisita,
        enlaceMapa: 'https://maps.google.com/?q=-13.1631,-74.2236'
      }
    };
    expect(buildOrdenMapsUrl(conEnlace)).toBe('https://maps.google.com/?q=-13.1631,-74.2236');

    const conCoords: Orden = {
      ...ordenDemo,
      datosVisita: {
        ...ordenDemo.datosVisita,
        enlaceMapa: undefined,
        coordenadas: { lat: -12.1211, lng: -77.0293 }
      }
    };
    expect(buildOrdenMapsUrl(conCoords)).toBe('https://www.google.com/maps?q=-12.1211,-77.0293');

    const porDireccion: Orden = {
      ...ordenDemo,
      datosVisita: {
        ...ordenDemo.datosVisita,
        enlaceMapa: undefined,
        coordenadas: undefined
      }
    };
    expect(buildOrdenMapsUrl(porDireccion)).toContain('https://www.google.com/maps/search/?api=1&query=');
  });

  it('resuelve correo del especialista desde usuario registrado o fallback institucional', () => {
    const srv = SERVICIOS_INICIALES[0];
    const email = resolveEmailServicio(srv, USUARIOS_INICIALES);
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);

    const fallback = resolveEmailServicio(
      { ...srv, tecnicoEmail: undefined, autorUsuarioId: 'NO-EXISTE', tecnicoDni: '00000000', tecnicoNombre: 'Técnico Prueba' },
      USUARIOS_INICIALES
    );
    expect(fallback).toBe('tecnico.prueba@conectaoficios.pe');
  });

  it('deduplica trabajadores únicos en una orden con múltiples ítems del mismo técnico', () => {
    const dobleItem: Orden = {
      ...ordenDemo,
      items: [ordenDemo.items[0], ordenDemo.items[0]]
    };
    const trabajadores = getTrabajadoresUnicosOrden(dobleItem, USUARIOS_INICIALES);
    expect(trabajadores).toHaveLength(1);
    expect(trabajadores[0].email).toContain('@');
  });

  it('construye mensajes WhatsApp, correo, Gmail, mailto y respuesta de disponibilidad', () => {
    const waMsg = buildWhatsAppSolicitudTrabajadorMsg(ordenDemo);
    expect(waMsg).toContain(ordenDemo.id);
    expect(waMsg).toContain('S/ 0.00');

    const correo = buildCorreoSolicitudTrabajador(ordenDemo);
    expect(correo.subject).toContain(ordenDemo.id);
    expect(correo.body).toContain(ordenDemo.datosVisita.direccion);

    expect(buildMailtoUrl('test@gmail.com', 'Asunto', 'Cuerpo')).toContain('mailto:test%40gmail.com');
    expect(buildGmailComposeUrl('test@gmail.com', 'Asunto', 'Cuerpo')).toContain('mail.google.com');
    expect(buildWhatsAppUrl('987654321', 'Hola')).toBe('https://wa.me/51987654321?text=Hola');

    const resp = buildWhatsAppRespuestaClienteMsg({ ...ordenDemo, aceptacionTrabajador: 'ACEPTADA' });
    expect(resp).toContain('ACEPTADA');
  });
});
