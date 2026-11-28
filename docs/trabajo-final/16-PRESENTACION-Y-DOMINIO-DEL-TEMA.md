# Paso 16 — Presentación y Dominio del Tema (Guion, Diapositivas y Banco de Preguntas del Jurado)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`) — Trabajo Final de Arquitectura de Software (Sprint 1 + Sprint 2)  
> **Duración Recomendada:** `16 minutos` de exposición + `4 minutos` de demostración en vivo (`20 min` total).  
> **Guía Visual Complementaria Sprint 2:** [`docs/GUIA-EXPOSICION-SPRINT-2.md`](../GUIA-EXPOSICION-SPRINT-2.md) · **Evidencias:** [`docs/SPRINT-2-VALIDACION-Y-EVIDENCIAS.md`](../SPRINT-2-VALIDACION-Y-EVIDENCIAS.md).

---

## 1. Estructura Completa de Diapositivas (15 Slides Cronometradas)

| Slide | Título | Tiempo | Qué Mostrar en Pantalla | Mensaje Clave (Guion Hablado) |
| :---: | :--- | :---: | :--- | :--- |
| **01** | **Portada — TrabajaYa Perú (`conectaoficios`)** | `0:40` | Logo circular institucional, lema *"Tu talento, nuestro compromiso"*, autor (`Carlos Rodrigo Zaga Huayllasco`), UNSCH y curso `IS-488`. | Presentar el objetivo: plataforma web nacional de servicios multioficios certificados con custodia fiduciaria (Escrow) para las 25 regiones del Perú. |
| **02** | **Identificación del Problema** | `1:05` | Árbol de Problemas (`01-IDENTIFICACION-*`): informalidad, falta de antecedentes PNP/PJ/INPE, estafas por adelantos, comisiones abusivas y falta de trazabilidad. | Explicar el doble dolor del mercado peruano (riesgo para el hogar y falta de diferenciación para técnicos acreditados de SENATI, SENCICO y CAPECO). |
| **03** | **Propuesta de Solución y Requerimientos** | `1:05` | Resumen: 4 grupos / 14 oficios, Ubigeo 25/196/1,878, `42 RF` (MoSCoW), `16 RNF` (ISO 25010), `15 RN`. | Destacar diferenciadores: solicitud `S/ 0.00` (0% comisión al trabajador), Escrow con 10% garantía + 18% IGV, Imprevistos `S/ 5.00` y Expediente Legal de 5 bloques. |
| **04** | **Análisis y Diseño UML** | `1:05` | Diagrama de Casos de Uso (24 CU) + Máquina de Estados Escrow de 6 estados (`EN_CUSTODIA` → `CONFORMIDAD_Y_LIBERADO` / `OBSERVADO_GARANTIA`). | Explicar cómo la máquina de estados protege el dinero hasta la conformidad o calificación del cliente y bloquea retrocesos tras la liberación. |
| **05** | **Arquitectura de Alto Nivel (Monolito Modular + C4)** | `1:15` | Diagrama C4 Contenedores: Cloudflare → Nginx (`least_conn`) → Réplicas Node.js → Redis 7 + PgBouncer + PostgreSQL 16 + S3. | Justificar **Monolito Modular Stateless-Ready**: consistencia transaccional y velocidad de entrega sin la complejidad innecesaria de microservicios tempranos. |
| **06** | **Clean Architecture Real, SOLID y Patrones** | `1:20` | Árbol real de `server/`: `domain/` (`entities`, `ports`), `application/` (casos de uso), `infrastructure/` (caché, repos, Culqi, SMTP/WA, OpenAPI) y `presentation/` + `server.ts` como *Composition Root*. | Demostrar que ningún caso de uso importa Express ni `fs`, cumpliendo **SRP, OCP, LSP, ISP y DIP** más 8 patrones (Factory, Repository, Adapter, Cache-Aside, State Machine, Observer, Fallback, Idempotency Key). |
| **07** | **Desarrollo Basado en SDD** | `1:05` | Flujo SDD (`Constitución → Specs Gherkin → Contratos → Código → QA`) y los 7 archivos de `docs/sdd/`. | Explicar las 6 Invariantes no negociables (`I1–I6`), criterios `Given/When/Then` y el backlog de tareas técnicas (`T1.1–T4.4`). |
| **08** | **API REST y Documentación OpenAPI 3.0 / Swagger UI** | `1:15` | Captura/vista de **`http://localhost:3000/api-docs`** (Swagger UI interactivo) y `docs/openapi.json` con los **12 endpoints REST** + colección Postman (`docs/postman/`). | Mostrar que la API está formalmente especificada en OpenAPI 3.0.3 (Catálogo, Cotizador Escrow, Culqi, Chat RBAC, Notificaciones, Caché) y se prueba en vivo desde Swagger UI o Postman. |
| **09** | **Pruebas Automatizadas con Jest, Cobertura y E2E** | `1:25` | Reporte real de `npm run test:coverage`: **7/7 suites · 44/44 pruebas Jest** (`32` unitarias + `12` integración HTTP/OpenAPI/WS/Rate-Limit) con **96.53% Statements/Lines, 97.18% Functions, 75.95% Branches** + **6/6 E2E Playwright** + `0` errores TypeScript. | Resaltar la prueba DIP con mocks en `server.useCases.test.ts` y el hallazgo real de `peruUbigeo.test.ts` (1,878 distritos exactos). |
| **10** | **UI/UX, Accesibilidad y Panel Sprint 2 In-App** | `0:55` | Design System (`navy-950`, `amber-400` vs `sky-500` para Admin), móvil `375×812` (`E2E-06`) y el modal interactivo **Sprint 2 · Swagger & 2,000 VUs** en el pie de página. | Destacar el diferenciador cromático por rol y el panel arquitectónico embebido que permite consultar `/api/cache/stats` y abrir Swagger desde la misma app. |
| **11** | **Escalabilidad Frontend y Backend** | `1:00` | Build Vite (`554 ms`, `> 382 kB` lazy-loaded), `infra/nginx.conf`, `Dockerfile` multi-stage, `docker-compose.yml`, Rate Limiting `429` (`IT-12`) y Graceful Shutdown (`SIGTERM`). | Mostrar que un visitante jamás descarga la Consola Admin y que el servidor bloquea abusos con HTTP `429` sin caer. |
| **12** | **Escalabilidad de BD y Caché Multi-Nivel** | `1:20` | `database/01_schema.sql` (`uq_single_admin_only`), `02_indexes_and_scalability.sql` (índices parciales, GIN FTS, particiones, `FOR UPDATE`), PgBouncer (`2,000 → 40` conns) + `LruTtlCache` (`ETag`/`304`, invalidación activa). | Explicar cómo `LruTtlCache` logra **`99.98%` de Cache Hit Ratio** e invalida automáticamente tras cada cobro Culqi o mensaje de chat. |
| **13** | **Dominio, DNS, CDN y CI/CD (GitHub Actions)** | `1:00` | Zona DNS `trabajaya.pe` (SPF/DKIM/DMARC/CAA), Cloudflare PoP Lima y pipeline [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (`tsc` → Jest + cobertura → Carga 2,000 VUs → Vite Build → Playwright E2E → Docker) + `cd.yml`. | Mostrar cómo GitHub Actions automatiza toda la validación en cada commit y sube como artefactos el reporte de cobertura y la evidencia de 2,000 VUs. |
| **14** | **Pruebas de Carga k6 Progresivas hasta 2,000 VUs** | `1:25` | Tabla y gráfico real de `npm run test:load` (`stress-2000vu.k6.js`): rampa **`10 → 100 → 500 → 1,000 → 1,500 → 2,000 VUs`** → **`7,961.2 RPS`**, **`p95 = 279.10 ms`**, **`p99 = 295.97 ms`**, **`0.29%` error**, **`99.98%` Cache Hit**. | Interpretar con criterio ingenieril: a 100 VUs `p95 = 48 ms` (5× mejor que la meta) y a 2,000 VUs el leve `0.29%` de error en 1 instancia justifica el balanceo horizontal con Nginx + réplicas. |
| **15** | **Demo en Vivo y Conclusiones** | `4:00` | App en `http://localhost:3000` + Swagger UI en `http://localhost:3000/api-docs` + terminal con `npm run test:coverage` y `npm run test:load`. | Demostración real en vivo + cierre sintetizando el cumplimiento 100% de Sprint 1 y Sprint 2. |

---

## 2. Guion de Demostración en Vivo (4 Minutos Exactos)

### Preparación previa (antes de pasar al frente)
```powershell
cd "d:\TRABAJO FINAL DE ARQUITECTURA MULTIOOFICIOS"
npm run dev
```
> **Importante en Windows:** Abrir siempre usando **`localhost`** (nunca `0.0.0.0`, ya que Windows lo rechaza con `ERR_ADDRESS_INVALID`):
> - App Web: **http://localhost:3000**
> - Swagger UI (OpenAPI 3.0.3): **http://localhost:3000/api-docs**
> - OpenAPI JSON: **http://localhost:3000/api/openapi.json**
> - Métricas de Caché en vivo: **http://localhost:3000/api/cache/stats**

### Secuencia en vivo frente al jurado
1. **Minuto 1 — App Funcional + Panel Interactivo de Arquitectura Sprint 2 (`http://localhost:3000`):**
   - Mostrar el Catálogo Nacional filtrando por Región/Provincia/Distrito y Oficio (`Gasfitería` o `Electricidad`), y el bloqueo de seguridad de `Chat` para visitantes (`GUEST` — Invariante I4).
   - Bajar al pie de página y hacer clic en **`Sprint 2 · Swagger & 2,000 VUs`** para abrir `ArchitectureModal` y recorrer rápidamente sus 4 pestañas (Clean Architecture, SOLID + botón **"Ver en vivo"** de caché, lista de 12 endpoints REST y resultados Jest + 2,000 VUs).
2. **Minuto 2 — Documentación Interactiva OpenAPI / Swagger UI (`http://localhost:3000/api-docs`):**
   - Hacer clic en **`Abrir Swagger UI (/api-docs)`** desde el mismo modal (o abrir la pestaña directamente).
   - Ejecutar **"Try it out"** en `POST /api/escrow/quote` (`precioBase: 100, cantidadTurnos: 2`) mostrando el cálculo exacto (`garantiaUnitaria: 10`, `tarifaClienteUnitaria: 110`, `igv18: 39.6`, `totalConIgv: 259.6`).
   - Ejecutar `GET /api/services?oficio=GASFITERIA` dos veces para mostrar en las cabeceras de respuesta cómo pasa de `X-Cache: MISS` a **`X-Cache: HIT`** con su `ETag`.
3. **Minuto 3 — Pruebas Automatizadas Jest + Reporte de Cobertura (Terminal):**
   - Ejecutar:
     ```powershell
     npm run test:coverage
     ```
   - Mostrar en ~2.4 segundos: **7/7 suites · 44/44 pruebas aprobadas** y **96.53% Statements/Lines · 97.18% Functions · 75.95% Branches**.
   - Abrir `coverage/lcov-report/index.html` para enseñar el reporte gráfico de cobertura por capa (`server/domain`, `server/application`, `server/infrastructure`, `server/presentation`).
4. **Minuto 4 — Simulación Progresiva hasta 2,000 Usuarios Virtuales (Terminal):**
   - Ejecutar:
     ```powershell
     npm run test:load
     ```
   - Mostrar en vivo la tabla progresiva **`10 → 100 → 500 → 1,000 → 1,500 → 2,000 VUs`** alcanzando **`7,961.2 RPS`**, **`p95 = 279.10 ms`**, **`0.29%` error** y **`99.98%` Cache Hit Ratio**, más la evidencia guardada en `docs/evidencias/load-2000vu-results.json`.

---

## 3. Banco de 16 Preguntas Difíciles del Jurado (y Cómo Responder con Dominio Total)

### Bloque A — Arquitectura, Clean Architecture, SOLID y SDD

**P1. ¿Por qué eligieron un Monolito Modular y no Microservicios?**  
> *Respuesta:* Porque en un marketplace nacional en etapa de lanzamiento, los microservicios introducen latencia de red, complejidad de despliegue y transacciones distribuidas (Sagas) innecesarias para flujos fuertemente acoplados como reservar turnos + crear orden Escrow + despachar notificaciones. El **Monolito Modular con Clean Architecture** nos da transacciones ACID simples, latencia `p95 = 48 ms` en carga base y fronteras limpias por módulo que permiten extraer un servicio en el futuro solo si un dominio específico (por ejemplo, Chat o Pagos) lo exige.

**P2. ¿Cómo demuestran en el código que sí aplicaron Clean Architecture y SOLID, y no solo en los diagramas?**  
> *Respuesta:* Refactorizamos todo el backend en 4 capas físicas bajo `server/`: `domain/` (`entities.ts` y `ports.ts`), `application/` (`catalogUseCases.ts`, `paymentUseCases.ts`, `chatUseCases.ts`, `dispatchUseCases.ts`), `infrastructure/` (`lruTtlCache.ts`, `jsonRepositories.ts`, `culqiGateway.ts`, `notificationDispatcher.ts`, `openapi.ts`) y `presentation/` (`apiRoutes.ts`, `securityAndRateLimit.ts`, `chatSocketServer.ts`). Ningún caso de uso importa Express ni `fs`. Como prueba práctica del Principio de Inversión de Dependencias (**DIP**), en `tests/unit/server.useCases.test.ts` probamos `ProcessCulqiChargeUseCase` inyectando puertos *mock* sin tocar disco ni red.

**P3. ¿En qué se diferencia el Desarrollo Basado en SDD de hacer documentación tradicional al final?**  
> *Respuesta:* En el desarrollo tradicional la documentación se redacta al final y queda obsoleta. En **SDD (`docs/sdd/`)**, las especificaciones —Constitución con invariantes `I1–I6`, contratos API/OpenAPI y escenarios Gherkin `Given/When/Then`— son la **fuente única de verdad** de la cual derivamos el código y las pruebas automatizadas (`Jest`, `Supertest`, `Playwright`, `Postman`, `k6`).

**P4. Si aplican Clean Architecture, ¿por qué `ConectaContext.tsx` todavía es grande en el frontend?**  
> *Respuesta:* Lo tenemos auditado con total transparencia como **`GAP-06`** en nuestro plan SDD (`docs/sdd/05-*`). En este Sprint 2 completamos la separación total en 4 capas en todo el backend (`server/`) y extrajimos la capa pura de dominio compartida (`src/domain/businessRules.ts`, probada con 100% de cobertura en líneas); la siguiente iteración (Fase 3 del roadmap) divide el estado React en stores independientes por dominio.

### Bloque B — API REST, OpenAPI/Swagger, Seguridad y Pagos Culqi

**P5. ¿Por qué documentaron con OpenAPI 3.0 / Swagger UI además de Markdown?**  
> *Respuesta:* Porque Markdown es solo texto estático y puede desincronizarse del servidor. Con **OpenAPI 3.0.3** (`server/infrastructure/docs/openapi.ts` + `docs/openapi.json` + Swagger UI en `http://localhost:3000/api-docs`), la documentación vive dentro del mismo backend, valida esquemas y códigos de error (`200`, `304`, `400`, `401`, `404`, `429`, `502`), permite pruebas interactivas en vivo y está verificada automáticamente por la prueba de integración `IT-02` en Jest.

**P6. ¿Cómo garantizan que ningún atacante obtenga la clave secreta de Culqi?**  
> *Respuesta:* Por diseño (**Invariante I5**), `CULQI_SECRET_KEY` existe únicamente en el servidor (`CulqiPaymentGateway` / GitHub Secrets) y jamás se empaqueta en Vite ni se devuelve en ninguna API. El frontend solo consulta `GET /api/payments/culqi/config` (validado en `IT-04`), tokeniza en el SDK oficial Culqi v4, y envía solo el `tokenId` al servidor.

**P7. ¿Por qué guardan contraseñas en `localStorage` en el prototipo? ¿No es inseguro?**  
> *Respuesta:* Sí, en producción sería un riesgo crítico; por eso lo documentamos como **`GAP-01`** en el análisis STRIDE y el informe final. En esta versión académica permite demostrar los 20 usuarios semilla y los 9 módulos de forma autónoma sin BD externa; para producción, `database/01_schema.sql` almacena únicamente `password_hash` (`argon2id`/`bcrypt`) con cookies `HttpOnly; Secure; SameSite=Lax`.

**P8. ¿Cómo aseguran a nivel de arquitectura y base de datos que solo exista UN Administrador Nacional?**  
> *Respuesta:* Con **defensa en profundidad en 3 capas**: (1) en UI/Contexto `registrarUsuario` fuerza `permiso = 'USUARIO'` y bloquea suspender/eliminar `ADM-001`; (2) en hidratación se depuran duplicados; y (3) en PostgreSQL (`database/01_schema.sql`) definimos el **índice único parcial** `uq_single_admin_only ON users (permiso) WHERE permiso = 'ADMIN'`.

**P9. ¿Cómo cumplen con la Ley N.º 29733 de Protección de Datos Personales del Perú?**  
> *Respuesta:* Separamos la información pública (`fotosTrabajos`, calificación, insignias) de los documentos sensibles del Expediente de 5 Bloques (DNI, domicilio, antecedentes PNP/PJ/INPE, Ficha RUC). Aplicamos el guardia `puedeVerMediosPrivados` (`ADMIN || propietario`, probado en Jest) y en producción se guarda en S3 privado con URLs prefirmadas temporales.

### Bloque C — Escalabilidad, Caché, Base de Datos y Redes

**P10. Si escalan a 2 o más réplicas de Node.js detrás de Nginx, ¿cómo funciona el WebSocket `/ws/chat` si el Cliente está en `app-1` y el Técnico en `app-2`?**  
> *Respuesta:* Al escalar horizontalmente (`docker-compose.yml` con `app-1`, `app-2` y `redis`), se conecta un **Redis Pub/Sub Backplane**: cuando `app-1` recibe un mensaje, publica en el canal `trabajaya:chat:events`, y todas las réplicas (`app-1 .. app-N`) reciben el evento y lo entregan a sus sockets locales.

**P11. ¿Cómo evitan que dos clientes reserven simultáneamente el último turno libre de un técnico?**  
> *Respuesta:* Combinamos un **candado distribuido en Redis** (`SET lock:service:{id} token NX PX 5000`) y, a nivel ACID en PostgreSQL (`database/02_indexes_and_scalability.sql`), nuestro procedimiento **`sp_reservar_turno_atomico`** con `SELECT turnos_libres ... FOR UPDATE`, bloqueando la fila hasta confirmar el descuento atómico.

**P12. ¿Cómo previenen que la caché devuelva datos desactualizados (stale data)?**  
> *Respuesta:* Combinamos **TTL diferenciados** (`60s` catálogo/config, `30s` transacciones, `15s` chat) con **invalidación activa inmediata en cada escritura**: `POST /api/payments/culqi/charge` ejecuta `cache.del('culqi:transactions')`, y cualquier operación de chat ejecuta `cache.invalidateByPrefix('chat:conv:')`. Además, `ETag` + `If-None-Match` devuelve `304 Not Modified`. Todo está verificado en `IT-11`.

**P13. ¿Por qué colocan PgBouncer en modo `transaction` delante de PostgreSQL?**  
> *Respuesta:* Cada conexión nativa de PostgreSQL consume ~5–10 MB RAM. Con múltiples réplicas Node.js bajo picos de 2,000 usuarios, abrir 2,000 conexiones directas saturaría la BD. **PgBouncer** (`infra/pgbouncer.ini`) multiplexa **2,000 conexiones de aplicación sobre un pool fijo de 40 conexiones reales** a PostgreSQL.

### Bloque D — Pruebas Jest, Cobertura, Carga 2,000 VUs y CI/CD

**P14. ¿Cuál es la diferencia práctica entre sus pruebas unitarias, de integración y E2E?**  
> *Respuesta:* Las **32 unitarias (Jest)** validan reglas puras y casos de uso en milisegundos sin red ni navegador (Escrow, IGV, Ubigeo, LRU cache, DIP con mocks). Las **12 de integración (Jest + Supertest + `ws`)** prueban el backend HTTP + OpenAPI/Swagger + archivos + WebSocket + caché `304` + Rate Limiting `429`. Las **6 E2E (Playwright)** abren **Chromium real** (desktop y móvil `375×812`) validando Frontend + Backend juntos. Todo logra **96.53% de cobertura en líneas y sentencias**.

**P15. ¿Qué demostraron al simular progresivamente hasta 2,000 usuarios virtuales concurrentes?**  
> *Respuesta:* En nuestra rampa progresiva real (`10 → 100 → 500 → 1,000 → 1,500 → 2,000 VUs`, `23,411` solicitudes totales), a **100 VUs** obtuvimos `0%` error y `p95 = 48.17 ms` (`4,050 RPS`); y en el pico de **2,000 VUs** alcanzamos **`7,961.2 RPS`**, **`p95 = 279.10 ms`**, **`p99 = 295.97 ms`**, **`99.98%` Cache Hit Ratio** y solo **`0.29%` de error** (`24` conexiones rechazadas por límite de sockets TCP de 1 instancia local en Windows). Ese resultado confirma cuantitativamente tanto la efectividad de la caché como la necesidad del balanceo horizontal con Nginx + múltiples réplicas configurado en `docker-compose.yml`.

**P16. ¿Cómo garantizan despliegues sin caída (*Zero-Downtime*) y que ningún cambio rompa la arquitectura?**  
> *Respuesta:* `.github/workflows/ci.yml` bloquea cualquier merge si falla TypeScript (`tsc --noEmit`), alguna de las **44 pruebas de Jest** o sus umbrales de cobertura, la prueba progresiva de **2,000 VUs**, el build de Vite, los **6 E2E de Playwright** o el build de Docker. Luego, `cd.yml` publica imagen inmutable por SHA en GHCR y aplica Rolling Update con Graceful Shutdown (`SIGTERM`).

---

## 4. Checklist Final Pre-Sustentación

- [ ] Ejecutar `npm run lint` (`0` errores) y `npm run test:coverage` (**44/44 verdes · 96.53% cobertura**).
- [ ] Ejecutar `npm run test:load` (**10 → 2,000 VUs aprobados**, evidencia en `docs/evidencias/load-2000vu-results.json`).
- [ ] Tener abierto en el navegador:
  - **App Web:** `http://localhost:3000`
  - **Swagger UI:** `http://localhost:3000/api-docs`
  - **Reporte de Cobertura Jest:** `coverage/lcov-report/index.html`
- [ ] Verificar que el botón **`Sprint 2 · Swagger & 2,000 VUs`** del Footer abre el panel interactivo de 4 pestañas.
- [ ] Completar el nombre del Docente en `docs/trabajo-final/15-INFORME-FINAL.md` y subir los últimos cambios a GitHub (`git push`).
