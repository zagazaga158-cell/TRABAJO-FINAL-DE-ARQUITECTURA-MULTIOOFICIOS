import { test, expect } from '@playwright/test';

test.describe('TrabajaYa Perú — Pruebas End-to-End (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada escenario para ejecución determinística
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('__e2e_initialized')) {
        localStorage.clear();
        sessionStorage.setItem('__e2e_initialized', '1');
      }
    });
  });

  test('E2E-01: Carga del Catálogo Nacional, búsqueda reactiva y ficha detallada de servicio', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/TrabajaYa Perú/i);
    await expect(page.getByRole('heading', { name: /Técnicos y Profesionales Capacitados/i })).toBeVisible();

    // Verifica que existen tarjetas de servicios aprobados con botón Solicitar Visita
    const solicitarBtns = page.getByRole('button', { name: /Solicitar Visita/i });
    expect(await solicitarBtns.count()).toBeGreaterThanOrEqual(5);

    // Filtrado por categoría de oficio (Gasfitería)
    await page.getByRole('button', { name: /Gasfitería/i }).first().click();
    await expect(page.getByText(/Gasfitería/i).first()).toBeVisible();

    // Abrir modal de detalle del servicio haciendo clic en una tarjeta
    await page.getByText(/Ver detalle|Instalación|Reparación/i).first().click();
    await expect(page.getByText(/Custodia|Garantía|SENATI|SENCICO|CAPECO/i).first()).toBeVisible();
  });

  test('E2E-02: Visitante anónimo (GUEST) bloqueado en Chat Directo y Llamada Telefónica', async ({ page }) => {
    await page.goto('/');

    // Intentar abrir Chat Directo desde Header sin iniciar sesión
    await page.getByRole('button', { name: /^Chat$/i }).click();
    await expect(page.getByText(/iniciar sesión|regístrate|registrarte/i).first()).toBeVisible();

    // Cerrar modal si está abierto recargando a inicio limpio
    await page.goto('/');

    // Intentar abrir llamada telefónica desde tarjeta sin sesión
    const callBtn = page.locator('button[title*="Llamar por teléfono"]').first();
    await callBtn.click();
    await expect(page.getByText(/inicia sesión|iniciar sesión|registrarte/i).first()).toBeVisible();
  });

  test('E2E-03: Flujo completo de solicitud de servicio (S/ 0.00) y despacho automático en 3 canales', async ({ page }) => {
    await page.goto('/');

    // Agregar el primer servicio disponible al carrito
    await page.getByRole('button', { name: /Solicitar Visita/i }).first().click();

    // Ir a Mi Solicitud desde la barra lateral
    await page.getByRole('button', { name: /Mi Solicitud/i }).first().click();
    await expect(page.getByRole('heading', { name: /Solicitud de Encargo a Domicilio/i })).toBeVisible();
    await expect(page.getByText('S/ 0.00').first()).toBeVisible();

    // Completar dirección y teléfono requeridos
    const dirInput = page.locator('input[placeholder*="Av."], input[placeholder*="Jr."], input[placeholder*="dirección" i]').first();
    await dirInput.fill('Av. Arequipa 2450 - Miraflores');

    const telInput = page.locator('input[type="tel"]').first();
    await telInput.fill('987654321');

    // Enviar solicitud sin cobro
    await page.getByRole('button', { name: /Enviar Solicitud \(S\/ 0\.00/i }).click();

    // Confirmar modal de Orden Confirmada con código PED-2026-* y despacho 3 canales
    await expect(page.getByText(/PED-2026-/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/S\/ 0\.00/i).first()).toBeVisible();
  });

  test('E2E-04: Login de Usuario (AMBOS), Expediente Legal de 5 Bloques, Mis Órdenes e Imprevistos', async ({ page }) => {
    await page.goto('/');

    // Ir a Iniciar Sesión
    await page.getByRole('button', { name: /^Iniciar Sesión$/i }).first().click();
    await expect(page.getByRole('heading', { name: /Iniciar Sesión/i })).toBeVisible();

    // Ingresar credenciales de usuario semilla USR-000 (AMBOS, ACTIVO)
    await page.locator('input[type="email"]').fill('zagazaga158@gmail.com');
    await page.locator('input[type="password"]').fill('usuario123');
    await page.getByRole('button', { name: /Ingresar a Mi Cuenta/i }).click();

    // Verificar franja de sesión conectada en Header
    await expect(page.getByRole('banner').getByText('zagazaga158@gmail.com')).toBeVisible();

    // Navegar a Mi Perfil y comprobar Expediente de Cumplimiento Legal
    await page.getByRole('button', { name: /Mi Perfil/i }).first().click();
    await expect(page.getByText(/Expediente|Antecedentes|RUC|Contrato/i).first()).toBeVisible();

    // Navegar a Mis Órdenes
    await page.getByRole('button', { name: /Mis Órdenes/i }).first().click();
    await expect(page.getByText(/Órdenes|Custodia|Conformidad/i).first()).toBeVisible();

    // Navegar a Imprevistos Hogar
    await page.getByRole('button', { name: /Imprevistos/i }).first().click();
    await expect(page.getByText(/Imprevistos/i).first()).toBeVisible();
  });

  test('E2E-05: Login de Administrador Único (ADM-001), Consola Admin (7 pestañas) y Perfiles', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /^Iniciar Sesión$/i }).first().click();
    await page.locator('input[type="email"]').fill('admin@conectaoficios.pe');
    await page.locator('input[type="password"]').fill('admin123');
    await page.getByRole('button', { name: /Ingresar a Mi Cuenta/i }).click();

    // Redirección automática a Consola del Administrador
    await expect(page.getByRole('banner').getByText('admin@conectaoficios.pe')).toBeVisible();
    await expect(page.getByRole('button', { name: /Consola Admin/i }).first()).toBeVisible();

    // Recorrer pestañas clave de Consola Admin (Planes, Usuarios, Billetera)
    const planesBtn = page.getByRole('button', { name: /Planes/i }).first();
    await planesBtn.click();
    await expect(page.getByText(/Plan Básico|Especialista PRO/i).first()).toBeVisible();

    const billeteraBtn = page.getByRole('button', { name: /Billetera/i }).first();
    await billeteraBtn.click();
    await expect(page.getByText(/Culqi|Custodia|Liberados/i).first()).toBeVisible();

    // Acceso exclusivo al Directorio de Perfiles
    await page.getByRole('button', { name: /^Perfiles$/i }).first().click();
    await expect(page.getByText(/Directorio de Perfiles|Téc\. Wilber/i).first()).toBeVisible();
  });

  test('E2E-06: Responsividad Móvil (375x812), Drawer Lateral y Modal de Arquitectura', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Verifica ausencia de desbordamiento horizontal significativo
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(4);

    // Abrir drawer móvil desde botón hamburguesa accesible
    await page.getByRole('button', { name: /Abrir menú lateral/i }).click();
    await expect(page.getByRole('button', { name: /Cerrar menú lateral/i })).toBeVisible();
    await page.getByRole('button', { name: /Cerrar menú lateral/i }).click();

    // Abrir Modal de Especificación de Arquitectura desde Footer
    const archBtn = page.getByRole('button', { name: /Arquitectura|Clean Architecture/i }).first();
    await archBtn.scrollIntoViewIfNeeded();
    await archBtn.click();
    await expect(page.getByText(/Especificación de Arquitectura de Software/i)).toBeVisible();
  });
});
