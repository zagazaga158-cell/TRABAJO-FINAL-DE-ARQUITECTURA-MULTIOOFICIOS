import { describe, expect, it } from '@jest/globals';
import {
  CERTIFICADOS_OFICIALES,
  IMPREVISTOS_INICIALES,
  ORDENES_DEMO_INICIALES,
  PLAN_PRUEBA_GRATIS,
  PLANES_PUBLICACION,
  SERVICIOS_INICIALES,
  USUARIOS_INICIALES
} from '../../src/data/initialData';
import { CATEGORIAS_OFICIO, GRUPOS_OFICIO } from '../../src/types';

describe('Datos Semilla e Invariantes de Constitución SDD (initialData.ts)', () => {
  it('mantiene la taxonomía exacta de 4 grupos y 14 oficios', () => {
    expect(GRUPOS_OFICIO).toHaveLength(4);
    expect(CATEGORIAS_OFICIO).toHaveLength(14);
    const groupIds = new Set(GRUPOS_OFICIO.map(g => g.id));
    for (const cat of CATEGORIAS_OFICIO) {
      expect(groupIds.has(cat.grupoId)).toBe(true);
      expect(cat.tareasComunes.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('cumple la Invariante I1: exactamente 1 único Administrador Nacional (ADM-001) y correos/DNI únicos', () => {
    const admins = USUARIOS_INICIALES.filter(u => u.permiso === 'ADMIN');
    expect(admins).toHaveLength(1);
    expect(admins[0].id).toBe('ADM-001');
    expect(admins[0].email).toBe('admin@conectaoficios.pe');

    const emails = new Set(USUARIOS_INICIALES.map(u => u.email.toLowerCase()));
    const dnis = new Set(USUARIOS_INICIALES.map(u => u.dni));
    expect(emails.size).toBe(USUARIOS_INICIALES.length);
    expect(dnis.size).toBe(USUARIOS_INICIALES.length);
  });

  it('cumple la Invariante I2 en todos los servicios semilla: tarifaCliente = precioBase + 10% garantía', () => {
    expect(SERVICIOS_INICIALES).toHaveLength(17);
    const aprobados = SERVICIOS_INICIALES.filter(s => s.estadoPublicacion === 'APROBADO');
    const pendientes = SERVICIOS_INICIALES.filter(s => s.estadoPublicacion === 'PENDIENTE_APROBACION');
    expect(aprobados).toHaveLength(15);
    expect(pendientes).toHaveLength(2);

    for (const srv of SERVICIOS_INICIALES) {
      expect(srv.garantiaMonto).toBeCloseTo(srv.precioBase * 0.1, 2);
      expect(srv.tarifaCliente).toBeCloseTo(srv.precioBase + srv.garantiaMonto, 2);
    }
  });

  it('configura los planes comerciales, certificados, órdenes e imprevistos semilla', () => {
    expect(PLAN_PRUEBA_GRATIS.id).toBe('PRUEBA_7');
    expect(PLAN_PRUEBA_GRATIS.precio).toBe(0);
    expect(PLANES_PUBLICACION.map(p => p.id)).toEqual(['BASICO', 'DESTACADO', 'PRO']);
    expect(CERTIFICADOS_OFICIALES).toHaveLength(5);
    expect(ORDENES_DEMO_INICIALES).toHaveLength(4);
    expect(ORDENES_DEMO_INICIALES[0].id).toBe('PED-2026-9045');
    expect(IMPREVISTOS_INICIALES).toHaveLength(3);
  });
});
