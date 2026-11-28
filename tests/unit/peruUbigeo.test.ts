import { describe, expect, it } from '@jest/globals';
import {
  formatUbicacion,
  getDistritosByProvincia,
  getProvinciasByRegion,
  inferUbicacionPeru,
  PERU_UBIGEO,
  REGIONES_PERU,
  TOTAL_DISTRITOS_PERU,
  TOTAL_PROVINCIAS_PERU,
  TOTAL_REGIONES_PERU
} from '../../src/data/peruUbigeo';

describe('Ubigeo Perú — Integridad Territorial (25 Regiones / 196 Provincias / 1,878 Distritos)', () => {
  it('contiene exactamente 25 regiones, 196 provincias y 1,878 distritos', () => {
    expect(PERU_UBIGEO).toHaveLength(25);
    expect(REGIONES_PERU).toHaveLength(25);
    expect(TOTAL_REGIONES_PERU).toBe(25);
    expect(TOTAL_PROVINCIAS_PERU).toBe(196);
    expect(TOTAL_DISTRITOS_PERU).toBe(1878);
  });

  it('consulta provincias y distritos en cascada (insensible a mayúsculas)', () => {
    const provAyacucho = getProvinciasByRegion('ayacucho');
    expect(provAyacucho).toContain('Huamanga');
    const distHuamanga = getDistritosByProvincia('Ayacucho', 'huamanga');
    expect(distHuamanga).toContain('Ayacucho');
    expect(distHuamanga).toContain('San Juan Bautista');
    expect(getProvinciasByRegion('RegionInexistente')).toEqual([]);
  });

  it('resuelve ubicaciones mediante inferUbicacionPeru (tripleta, alias legado, distrito y fallback)', () => {
    expect(inferUbicacionPeru('Miraflores', 'Lima', 'Lima')).toEqual({
      region: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores'
    });

    const legado = inferUbicacionPeru('Lima Metropolitana');
    expect(legado.region).toBe('Lima');
    expect(legado.provincia).toBe('Lima');

    const porDistrito = inferUbicacionPeru('Yanahuara');
    expect(porDistrito).toEqual({
      region: 'Arequipa',
      provincia: 'Arequipa',
      distrito: 'Yanahuara'
    });

    const fallback = inferUbicacionPeru('LugarPersonalizado123');
    expect(fallback.region).toBe('Lima');
    expect(fallback.distrito).toBe('LugarPersonalizado123');
  });

  it('formatea etiquetas limpias evitando redundancias con formatUbicacion', () => {
    expect(formatUbicacion('Miraflores', 'Lima', 'Lima')).toBe('Miraflores, Lima');
    expect(formatUbicacion('Yanahuara', 'Arequipa', 'Arequipa')).toBe('Yanahuara, Arequipa');
    expect(formatUbicacion('Callao', 'Callao', 'Callao')).toContain('Callao');
  });
});
