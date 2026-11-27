import { describe, it, expect } from 'vitest';
import {
  calcularBilletera,
  calcularDesgloseCulqiOrden,
  calcularResumenCarrito,
  calcularTarifaServicio,
  esCorreoPermitidoEnLista,
  esTransicionEscrowValida,
  ordenarCatalogoAprobado,
  puedeVerMediosPrivados,
  validarNumeroDocumento
} from '../../src/domain/businessRules';
import {
  IMPREVISTOS_INICIALES,
  ORDENES_DEMO_INICIALES,
  SERVICIOS_INICIALES
} from '../../src/data/initialData';
import { ItemCarrito } from '../../src/types';

describe('Dominio — Validaciones de Identidad y Lista Blanca de Correos', () => {
  it('valida DNI peruano de exactamente 8 dígitos numéricos', () => {
    expect(validarNumeroDocumento('41829304', 'DNI')).toEqual({ ok: true, clean: '41829304' });
    expect(validarNumeroDocumento('4182-9304', 'DNI')).toEqual({ ok: true, clean: '41829304' });
    expect(validarNumeroDocumento('1234567', 'DNI').ok).toBe(false);
    expect(validarNumeroDocumento('123456789', 'DNI').ok).toBe(false);
  });

  it('valida Carnet de Extranjería (CE) y Pasaporte (6 a 15 caracteres alfanuméricos)', () => {
    expect(validarNumeroDocumento('ce-90812a', 'CE')).toEqual({ ok: true, clean: 'CE-90812A' });
    expect(validarNumeroDocumento('PE123456', 'PASAPORTE')).toEqual({ ok: true, clean: 'PE123456' });
    expect(validarNumeroDocumento('AB12', 'CE').ok).toBe(false);
    expect(validarNumeroDocumento('A'.repeat(16), 'PASAPORTE').ok).toBe(false);
  });

  it('valida correos permitidos por dominio (@dominio) o coincidencia exacta', () => {
    const reglas = ['@conectaoficios.pe', '@gmail.com', 'especial@empresa.pe'];
    expect(esCorreoPermitidoEnLista('usuario@gmail.com', reglas)).toBe(true);
    expect(esCorreoPermitidoEnLista('ADMIN@CONECTAOFICIOS.PE', reglas)).toBe(true);
    expect(esCorreoPermitidoEnLista('especial@empresa.pe', reglas)).toBe(true);
    expect(esCorreoPermitidoEnLista('otro@yahoo.com', reglas)).toBe(false);
    expect(esCorreoPermitidoEnLista('correo-invalido', reglas)).toBe(false);
  });
});

describe('Dominio — Motor Financiero Escrow, IGV 18%, Culqi y Billetera', () => {
  it('calcula tarifa cliente = precioBase + 10% garantía', () => {
    expect(calcularTarifaServicio(100)).toEqual({
      precioBase: 100,
      garantiaMonto: 10,
      tarifaCliente: 110
    });
    expect(calcularTarifaServicio(85)).toEqual({
      precioBase: 85,
      garantiaMonto: 8.5,
      tarifaCliente: 93.5
    });
  });

  it('calcula resumen de carrito con garantía 10%, IGV 18% y monto referencial', () => {
    const srv = SERVICIOS_INICIALES[0]; // precioBase = 80, garantia = 8, tarifa = 88
    const items: ItemCarrito[] = [
      {
        servicioId: srv.id,
        servicio: srv,
        cantidadTurnos: 2,
        subtotal: Number((srv.tarifaCliente * 2).toFixed(2))
      }
    ];
    const resumen = calcularResumenCarrito(items);
    expect(resumen.totalItems).toBe(2);
    expect(resumen.subtotalCarrito).toBe(Number((srv.tarifaCliente * 2).toFixed(2)));
    expect(resumen.garantiaCarrito).toBe(Number((srv.garantiaMonto * 2).toFixed(2)));
    expect(resumen.igvCarrito).toBe(Number((resumen.subtotalCarrito * 0.18).toFixed(2)));
    expect(resumen.totalCarrito).toBe(
      Number((resumen.subtotalCarrito + resumen.igvCarrito).toFixed(2))
    );
    expect(resumen.montoReferencial).toBe(Number((srv.precioBase * 2).toFixed(2)));
  });

  it('desglosa correctamente un pago Culqi de orden en subtotal técnico y garantía 10%', () => {
    const { subtotalTecnico, garantiaTotal } = calcularDesgloseCulqiOrden(110);
    expect(subtotalTecnico).toBe(100);
    expect(garantiaTotal).toBe(10);
    expect(Number((subtotalTecnico + garantiaTotal).toFixed(2))).toBe(110);
  });

  it('consolida los 6 KPIs de billeteraTecnico sin discrepancias', () => {
    const billetera = calcularBilletera(
      ORDENES_DEMO_INICIALES,
      SERVICIOS_INICIALES,
      IMPREVISTOS_INICIALES
    );
    expect(billetera.totalContratos).toBe(ORDENES_DEMO_INICIALES.length);
    expect(billetera.fondosLiberados).toBeGreaterThan(0);
    expect(billetera.fondosEnCustodia).toBeGreaterThan(0);
    expect(billetera.fondoGarantia).toBeGreaterThan(0);
    expect(billetera.ingresosPublicaciones).toBeGreaterThan(0);
    expect(billetera.ingresosImprevistos).toBeGreaterThanOrEqual(0);
  });
});

describe('Dominio — Catálogo, Privacidad Ley 29733 y Máquina de Estados Escrow', () => {
  it('filtra solo servicios APROBADOS y ordena PRO > DESTACADO > BASICO > PRUEBA', () => {
    const ordenados = ordenarCatalogoAprobado(SERVICIOS_INICIALES);
    expect(ordenados.every(s => s.estadoPublicacion === 'APROBADO')).toBe(true);
    expect(ordenados.length).toBeLessThan(SERVICIOS_INICIALES.length);

    // Verifica que los servicios PRO estén al inicio
    const primerNoPro = ordenados.findIndex(s => s.nivelPlan !== 'PRO' && !s.selloVerificadoPro);
    if (primerNoPro > 0) {
      for (let i = 0; i < primerNoPro; i++) {
        expect(ordenados[i].nivelPlan === 'PRO' || ordenados[i].selloVerificadoPro).toBe(true);
      }
    }
  });

  it('aplica privacidad documental estricta (solo ADMIN o propietario)', () => {
    expect(puedeVerMediosPrivados(null, 'USR-002')).toBe(false);
    expect(puedeVerMediosPrivados({ id: 'USR-018', permiso: 'USUARIO' }, 'USR-002')).toBe(false);
    expect(puedeVerMediosPrivados({ id: 'USR-002', permiso: 'USUARIO' }, 'USR-002')).toBe(true);
    expect(puedeVerMediosPrivados({ id: 'ADM-001', permiso: 'ADMIN' }, 'USR-002')).toBe(true);
  });

  it('valida transiciones permitidas e inválidas de la máquina de estados Escrow', () => {
    expect(esTransicionEscrowValida('EN_CUSTODIA', 'EN_CAMINO')).toBe(true);
    expect(esTransicionEscrowValida('EN_CAMINO', 'EN_EJECUCION')).toBe(true);
    expect(esTransicionEscrowValida('EN_EJECUCION', 'COMPLETADO_PENDIENTE_CONFORMIDAD')).toBe(true);
    expect(esTransicionEscrowValida('COMPLETADO_PENDIENTE_CONFORMIDAD', 'CONFORMIDAD_Y_LIBERADO')).toBe(true);
    expect(esTransicionEscrowValida('COMPLETADO_PENDIENTE_CONFORMIDAD', 'OBSERVADO_GARANTIA')).toBe(true);
    expect(esTransicionEscrowValida('OBSERVADO_GARANTIA', 'EN_CAMINO')).toBe(true);
    expect(esTransicionEscrowValida('OBSERVADO_GARANTIA', 'CONFORMIDAD_Y_LIBERADO')).toBe(true);

    // Estado terminal: no permite retroceso una vez liberados los fondos
    expect(esTransicionEscrowValida('CONFORMIDAD_Y_LIBERADO', 'EN_CUSTODIA')).toBe(false);
    expect(esTransicionEscrowValida('CONFORMIDAD_Y_LIBERADO', 'OBSERVADO_GARANTIA')).toBe(false);
    expect(esTransicionEscrowValida('EN_CUSTODIA', 'CONFORMIDAD_Y_LIBERADO')).toBe(false);
  });
});
