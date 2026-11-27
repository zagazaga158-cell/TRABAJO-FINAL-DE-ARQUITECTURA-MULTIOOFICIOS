# Paso 6 — Pruebas End to End (E2E con Playwright + Chromium)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`)  
> **Herramienta Ejecutable:** **Playwright Test (`@playwright/test`)** con navegador real **Chromium**.  
> **Estado de Ejecución Verificada:** **6/6 escenarios E2E aprobados en 13.5 s** ejecutados contra la aplicación full-stack real (`server.ts` + React 19).

---

## 1. Arquitectura de Ejecución E2E

La configuración en [`playwright.config.ts`](../../playwright.config.ts) garantiza pruebas determinísticas, reproducibles e integrables en CI/CD:

1. **Aislamiento Total del Entorno:** Levanta automáticamente `npx tsx server.ts` en el puerto dedicado `3101` (`http://127.0.0.1:3101`) usando un directorio de persistencia temporal (`CONECTA_DATA_DIR = os.tmpdir()/trabajaya-e2e-data`) y `DISABLE_HMR=true`.
2. **Espera por Healthcheck Real:** Playwright aguarda a que `GET /api/health` responda `200 OK` antes de iniciar las pruebas.
3. **Limpieza de Estado de Navegador:** Cada escenario reinicia `localStorage` en `beforeEach` para validar desde un estado limpio y trazable.
4. **Evidencias Automáticas:** Genera reporte HTML (`playwright-report/`), capturas de pantalla ante fallos (`screenshot: 'only-on-failure'`) y trazas (`trace: 'on-first-retry'`).

---

## 2. Escenarios End-to-End Implementados (`tests/e2e/trabajaya.e2e.spec.ts`)

| ID | Escenario E2E | Flujo Real Validado en Navegador Chromium | Tiempo | Resultado | Trazabilidad |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **E2E-01** | **Catálogo Nacional y Ficha Detallada** | Carga `/`, verifica título `TrabajaYa Perú`, comprueba `>= 5` servicios aprobados con CTA `Solicitar Visita`, filtra por `Gasfitería` y abre `ServiceDetailModal` validando custodia/garantía/instituciones. | `2.0 s` | ✅ Aprobado | `RF-07`, `RF-08`, `RF-09` |
| **E2E-02** | **Seguridad Visitante (`GUEST`) en Chat y Llamadas** | Sin sesión iniciada, pulsa `Chat` en `Header` y comprueba compuerta de inicio de sesión obligatoria; luego pulsa botón `Llamar por teléfono` en tarjeta del catálogo y verifica ocultamiento de número y solicitud de registro/login. | `1.4 s` | ✅ Aprobado | `RF-35`, `I4`, `RNF-08` |
| **E2E-03** | **Solicitud de Servicio (`S/ 0.00`) + Despacho 3 Canales** | Agrega un servicio desde el catálogo, entra a `Mi Solicitud` (`CarritoView`), verifica `S/ 0.00`, llena dirección y teléfono, envía la solicitud y valida `OrdenConfirmadaModal` con código `PED-2026-*` y despacho real a `POST /api/notifications/dispatch-order`. | `2.2 s` | ✅ Aprobado | `RF-24` a `RF-27`, `RN-03`, `RN-12` |
| **E2E-04** | **Login Usuario (`AMBOS`), Expediente 5 Bloques, Órdenes e Imprevistos** | Inicia sesión con `zagazaga158@gmail.com` / `usuario123`, valida franja conectada en `Header`, navega a `Mi Perfil` verificando el Expediente de Cumplimiento Legal (Antecedentes/RUC/Contrato), `Mis Órdenes` e `Imprevistos Hogar`. | `1.7 s` | ✅ Aprobado | `RF-05`, `RF-12`, `RF-13`, `RF-21`, `RF-28` |
| **E2E-05** | **Administrador Único (`ADM-001`), Consola Admin y Perfiles** | Inicia sesión como `admin@conectaoficios.pe` / `admin123`, verifica redirección automática a `Consola Admin`, navega a pestañas `Planes` (Plan Básico / Especialista PRO) y `Billetera` (Culqi / Custodia / Liberados), y valida acceso exclusivo al directorio `Perfiles`. | `1.5 s` | ✅ Aprobado | `RF-04`, `RF-11`, `RF-36` a `RF-40` |
| **E2E-06** | **Responsividad Móvil (`375x812`), Drawer y Modal de Arquitectura** | Cambia viewport a móvil `375x812`, comprueba ausencia de desbordamiento horizontal (`scrollWidth - innerWidth <= 4px`), abre y cierra el drawer lateral accesible y abre `ArchitectureModal` desde el `Footer`. | `1.1 s` | ✅ Aprobado | `RF-42`, `RNF-12` |

---

## 3. Evidencia Real de Ejecución

```text
> react-example@0.0.0 test:e2e
> playwright test

Running 6 tests using 1 worker

  ok 1 [chromium] › tests\e2e\trabajaya.e2e.spec.ts:14:3 › E2E-01: Carga del Catálogo Nacional, búsqueda reactiva y ficha detallada de servicio (2.0s)
  ok 2 [chromium] › tests\e2e\trabajaya.e2e.spec.ts:33:3 › E2E-02: Visitante anónimo (GUEST) bloqueado en Chat Directo y Llamada Telefónica (1.4s)
  ok 3 [chromium] › tests\e2e\trabajaya.e2e.spec.ts:49:3 › E2E-03: Flujo completo de solicitud de servicio (S/ 0.00) y despacho automático en 3 canales (2.2s)
  ok 4 [chromium] › tests\e2e\trabajaya.e2e.spec.ts:75:3 › E2E-04: Login de Usuario (AMBOS), Expediente Legal de 5 Bloques, Mis Órdenes e Imprevistos (1.7s)
  ok 5 [chromium] › tests\e2e\trabajaya.e2e.spec.ts:103:3 › E2E-05: Login de Administrador Único (ADM-001), Consola Admin (7 pestañas) y Perfiles (1.5s)
  ok 6 [chromium] › tests\e2e\trabajaya.e2e.spec.ts:129:3 › E2E-06: Responsividad Móvil (375x812), Drawer Lateral y Modal de Arquitectura (1.1s)

  6 passed (13.5s)
```

---

## 4. Comandos de Ejecución Reproducible

```bash
# Instalar navegador Chromium (una sola vez)
npx playwright install chromium

# Ejecutar suite End-to-End completa
npm run test:e2e

# Abrir reporte HTML interactivo tras la corrida
npx playwright show-report
```
