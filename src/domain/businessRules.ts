import {
  EstadoOrden,
  ImprevistoHogar,
  ItemCarrito,
  Orden,
  Servicio,
  TipoDocumentoIdentidad,
  UsuarioRegistrado
} from '../types';

/**
 * Capa de Dominio Pura (Clean Architecture — Capa 1)
 * Reglas de negocio, validaciones e invariantes verificables independientemente de React o Express.
 */

export const IGV_PERU_RATE = 0.18;
export const GARANTIA_ESCROW_RATE = 0.1;
export const PRECIO_IMPREVISTO_SOLES = 5.0;
export const MONTO_MINIMO_CULQI_CENTIMOS = 100;

export const round2 = (value: number): number => Number(value.toFixed(2));

export function validarNumeroDocumento(
  valor: string,
  tipo: TipoDocumentoIdentidad = 'DNI'
): { ok: boolean; clean: string; error?: string } {
  const trimmed = (valor || '').trim().toUpperCase();
  if (tipo === 'DNI') {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length !== 8) {
      return {
        ok: false,
        clean: digits,
        error: 'El DNI debe contener exactamente 8 dígitos numéricos.'
      };
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
}

export function esCorreoPermitidoEnLista(email: string, correosPermitidos: string[]): boolean {
  const clean = (email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) return false;
  return correosPermitidos.some(regla => {
    const r = regla.trim().toLowerCase();
    if (!r) return false;
    return r.startsWith('@') ? clean.endsWith(r) : clean === r;
  });
}

export function calcularTarifaServicio(precioBase: number): {
  precioBase: number;
  garantiaMonto: number;
  tarifaCliente: number;
} {
  const base = Number.isFinite(precioBase) && precioBase > 0 ? round2(precioBase) : 50;
  const garantiaMonto = round2(base * GARANTIA_ESCROW_RATE);
  const tarifaCliente = round2(base + garantiaMonto);
  return { precioBase: base, garantiaMonto, tarifaCliente };
}

export function calcularResumenCarrito(items: ItemCarrito[]): {
  totalItems: number;
  subtotalCarrito: number;
  garantiaCarrito: number;
  igvCarrito: number;
  totalCarrito: number;
  montoReferencial: number;
} {
  const totalItems = items.reduce((acc, it) => acc + it.cantidadTurnos, 0);
  const subtotalCarrito = round2(items.reduce((acc, it) => acc + it.subtotal, 0));
  const garantiaCarrito = round2(
    items.reduce((acc, it) => acc + it.servicio.garantiaMonto * it.cantidadTurnos, 0)
  );
  const igvCarrito = round2(subtotalCarrito * IGV_PERU_RATE);
  const totalCarrito = round2(subtotalCarrito + igvCarrito);
  const montoReferencial = round2(
    items.reduce((acc, it) => acc + it.servicio.precioBase * it.cantidadTurnos, 0)
  );
  return {
    totalItems,
    subtotalCarrito,
    garantiaCarrito,
    igvCarrito,
    totalCarrito,
    montoReferencial
  };
}

export function calcularDesgloseCulqiOrden(montoPagado: number): {
  subtotalTecnico: number;
  garantiaTotal: number;
} {
  const subtotalTecnico = round2(montoPagado / (1 + GARANTIA_ESCROW_RATE));
  const garantiaTotal = round2(montoPagado - subtotalTecnico);
  return { subtotalTecnico, garantiaTotal };
}

export function calcularBilletera(
  ordenes: Orden[],
  servicios: Servicio[],
  imprevistos: ImprevistoHogar[]
): {
  fondosLiberados: number;
  fondosEnCustodia: number;
  fondoGarantia: number;
  totalContratos: number;
  ingresosPublicaciones: number;
  ingresosImprevistos: number;
} {
  const fondosLiberados = round2(
    ordenes
      .filter(o => o.estado === 'CONFORMIDAD_Y_LIBERADO')
      .reduce((acc, o) => acc + (o.subtotalTecnico - o.garantiaTotal), 0)
  );
  const fondosEnCustodia = round2(
    ordenes
      .filter(o => o.estado !== 'CONFORMIDAD_Y_LIBERADO')
      .reduce((acc, o) => acc + o.subtotalTecnico, 0)
  );
  const fondoGarantia = round2(ordenes.reduce((acc, o) => acc + o.garantiaTotal, 0));
  const ingresosPublicaciones = round2(
    servicios.reduce((acc, s) => acc + (s.pagoPublicacion?.montoPagado || 0), 0)
  );
  const ingresosImprevistos = round2(
    imprevistos.reduce((acc, imp) => acc + (imp.pagoPublicacion?.montoPagado || 0), 0)
  );
  return {
    fondosLiberados,
    fondosEnCustodia,
    fondoGarantia,
    totalContratos: ordenes.length,
    ingresosPublicaciones,
    ingresosImprevistos
  };
}

export function pesoPrioridadPlan(srv: Pick<Servicio, 'nivelPlan' | 'destacado' | 'selloVerificadoPro'>): number {
  if (srv.nivelPlan === 'PRO' || srv.selloVerificadoPro) return 3;
  if (srv.nivelPlan === 'DESTACADO' || srv.destacado) return 2;
  if (srv.nivelPlan === 'BASICO') return 1;
  return 0;
}

export function ordenarCatalogoAprobado(servicios: Servicio[]): Servicio[] {
  return servicios
    .filter(s => s.estadoPublicacion === 'APROBADO')
    .sort((a, b) => {
      const diffPlan = pesoPrioridadPlan(b) - pesoPrioridadPlan(a);
      if (diffPlan !== 0) return diffPlan;
      return b.calificacion - a.calificacion;
    });
}

export function puedeVerMediosPrivados(
  currentUser: Pick<UsuarioRegistrado, 'id' | 'permiso'> | null,
  targetUserId: string
): boolean {
  if (!currentUser) return false;
  return currentUser.permiso === 'ADMIN' || currentUser.id === targetUserId;
}

const TRANSICIONES_ESCROW_PERMITIDAS: Record<EstadoOrden, EstadoOrden[]> = {
  EN_CUSTODIA: ['EN_CAMINO', 'EN_EJECUCION', 'COMPLETADO_PENDIENTE_CONFORMIDAD', 'OBSERVADO_GARANTIA'],
  EN_CAMINO: ['EN_EJECUCION', 'COMPLETADO_PENDIENTE_CONFORMIDAD', 'OBSERVADO_GARANTIA'],
  EN_EJECUCION: ['COMPLETADO_PENDIENTE_CONFORMIDAD', 'OBSERVADO_GARANTIA'],
  COMPLETADO_PENDIENTE_CONFORMIDAD: ['CONFORMIDAD_Y_LIBERADO', 'OBSERVADO_GARANTIA'],
  OBSERVADO_GARANTIA: ['EN_CAMINO', 'CONFORMIDAD_Y_LIBERADO'],
  CONFORMIDAD_Y_LIBERADO: []
};

export function esTransicionEscrowValida(actual: EstadoOrden, siguiente: EstadoOrden): boolean {
  return TRANSICIONES_ESCROW_PERMITIDAS[actual].includes(siguiente);
}
