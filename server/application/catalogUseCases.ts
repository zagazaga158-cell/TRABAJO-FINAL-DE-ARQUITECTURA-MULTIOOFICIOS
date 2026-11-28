import {
  IGV_PERU_RATE,
  calcularTarifaServicio,
  ordenarCatalogoAprobado,
  round2
} from '../../src/domain/businessRules';
import { SERVICIOS_INICIALES } from '../../src/data/initialData';
import type { Servicio } from '../../src/types';
import type { CacheEntry, CacheStore } from '../domain/ports';

/**
 * Capa de Aplicación — Catálogo Nacional Multioficios y Cotizador Escrow (Clean Architecture Capa 2)
 * Expone por API REST las reglas puras del dominio (prioridad PRO > DESTACADO > BASICO, Ubigeo e IGV/Garantía 10%).
 */

export interface CatalogQueryFilters {
  oficio?: string;
  region?: string;
  provincia?: string;
  distrito?: string;
  q?: string;
}

export class ListApprovedServicesUseCase {
  constructor(
    private readonly cache: CacheStore,
    private readonly catalogSource: Servicio[] = SERVICIOS_INICIALES
  ) {}

  execute(filters: CatalogQueryFilters): {
    entry: CacheEntry<{ ok: true; total: number; services: Servicio[] }>;
    cacheHit: boolean;
  } {
    const oficio = (filters.oficio || '').trim().toUpperCase();
    const region = (filters.region || '').trim().toLowerCase();
    const provincia = (filters.provincia || '').trim().toLowerCase();
    const distrito = (filters.distrito || '').trim().toLowerCase();
    const q = (filters.q || '').trim().toLowerCase();

    const cacheKey = `catalog:approved:${oficio}:${region}:${provincia}:${distrito}:${q}`;
    let entry = this.cache.get<{ ok: true; total: number; services: Servicio[] }>(cacheKey);
    const cacheHit = Boolean(entry);

    if (!entry) {
      let approved = ordenarCatalogoAprobado(this.catalogSource);

      if (oficio) {
        approved = approved.filter(s => s.oficio.toUpperCase() === oficio);
      }
      if (region) {
        approved = approved.filter(s => (s.region || '').toLowerCase() === region);
      }
      if (provincia) {
        approved = approved.filter(s => (s.provincia || '').toLowerCase() === provincia);
      }
      if (distrito) {
        approved = approved.filter(s => (s.distrito || '').toLowerCase() === distrito);
      }
      if (q) {
        approved = approved.filter(
          s =>
            s.titulo.toLowerCase().includes(q) ||
            s.descripcion.toLowerCase().includes(q) ||
            s.tecnicoNombre.toLowerCase().includes(q)
        );
      }

      entry = this.cache.set(
        cacheKey,
        { ok: true, total: approved.length, services: approved },
        60_000
      );
    }

    return { entry, cacheHit };
  }
}

export class GetServiceByIdUseCase {
  constructor(
    private readonly cache: CacheStore,
    private readonly catalogSource: Servicio[] = SERVICIOS_INICIALES
  ) {}

  execute(id: string): {
    entry: CacheEntry<{ ok: true; service: Servicio }> | null;
    cacheHit: boolean;
  } {
    const cleanId = id.trim();
    const cacheKey = `catalog:service:${cleanId}`;
    let entry = this.cache.get<{ ok: true; service: Servicio }>(cacheKey);
    if (entry) {
      return { entry, cacheHit: true };
    }

    const found = this.catalogSource.find(
      s => s.id === cleanId && s.estadoPublicacion === 'APROBADO'
    );
    if (!found) {
      return { entry: null, cacheHit: false };
    }

    entry = this.cache.set(cacheKey, { ok: true, service: found }, 60_000);
    return { entry, cacheHit: false };
  }
}

export class QuoteEscrowUseCase {
  execute(body: Record<string, unknown>):
    | {
        ok: true;
        statusCode: 200;
        quote: {
          precioBaseUnitario: number;
          garantiaUnitaria: number;
          tarifaClienteUnitaria: number;
          cantidadTurnos: number;
          subtotalServicio: number;
          garantiaTotal: number;
          igv18: number;
          totalConIgv: number;
          currency: 'PEN';
        };
      }
    | { ok: false; statusCode: 400; error: string } {
    const precioBase = Number(body.precioBase);
    const cantidadTurnos = Math.floor(Number(body.cantidadTurnos ?? 1));

    if (!Number.isFinite(precioBase) || precioBase < 20) {
      return {
        ok: false,
        statusCode: 400,
        error: 'El precioBase debe ser un número válido mayor o igual a S/ 20.00.'
      };
    }
    if (!Number.isFinite(cantidadTurnos) || cantidadTurnos < 1 || cantidadTurnos > 50) {
      return {
        ok: false,
        statusCode: 400,
        error: 'cantidadTurnos debe ser un entero entre 1 y 50.'
      };
    }

    const tarifa = calcularTarifaServicio(precioBase);
    const subtotalServicio = round2(tarifa.tarifaCliente * cantidadTurnos);
    const garantiaTotal = round2(tarifa.garantiaMonto * cantidadTurnos);
    const igv18 = round2(subtotalServicio * IGV_PERU_RATE);
    const totalConIgv = round2(subtotalServicio + igv18);

    return {
      ok: true,
      statusCode: 200,
      quote: {
        precioBaseUnitario: tarifa.precioBase,
        garantiaUnitaria: tarifa.garantiaMonto,
        tarifaClienteUnitaria: tarifa.tarifaCliente,
        cantidadTurnos,
        subtotalServicio,
        garantiaTotal,
        igv18,
        totalConIgv,
        currency: 'PEN'
      }
    };
  }
}
