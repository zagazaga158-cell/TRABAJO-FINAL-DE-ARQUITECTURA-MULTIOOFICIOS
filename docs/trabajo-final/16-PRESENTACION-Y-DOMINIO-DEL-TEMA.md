# Paso 16 — Presentación y Dominio del Tema (Guion, Diapositivas y Banco de Preguntas del Jurado)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`) — Trabajo Final de Arquitectura de Software  
> **Duración Recomendada:** `16 minutos` de exposición + `4 minutos` de demostración en vivo (`20 min` total).

---

## 1. Estructura Completa de Diapositivas (14 Slides Cronometradas)

| Slide | Título | Tiempo | Qué Mostrar en Pantalla | Mensaje Clave (Guion Hablado) |
| :---: | :--- | :---: | :--- | :--- |
| **01** | **Portada — TrabajaYa Perú (`conectaoficios`)** | `0:45` | Logo circular institucional, lema *"Tu talento, nuestro compromiso"*, integrantes y curso. | Presentar el objetivo: plataforma web nacional de servicios multioficios certificados con custodia fiduciaria (Escrow) para las 25 regiones del Perú. |
| **02** | **Identificación del Problema** | `1:15` | Árbol de Problemas (`01-IDENTIFICACION-*`): informalidad, falta de antecedentes PNP/PJ/INPE, estafas por adelantos, comisiones abusivas y falta de trazabilidad. | Explicar el doble dolor del mercado peruano (riesgo para el hogar y falta de diferenciación para técnicos acreditados de SENATI, SENCICO y CAPECO). |
| **03** | **Propuesta de Solución y Requerimientos** | `1:15` | Resumen: 4 grupos / 14 oficios, Ubigeo 25/196/1,878, `42 RF` (MoSCoW), `16 RNF` (ISO 25010), `15 RN`. | Destacar diferenciadores: solicitud `S/ 0.00` (0% comisión al trabajador), Escrow con 10% garantía, Imprevistos `S/ 5.00` y Expediente Legal de 5 bloques. |
| **04** | **Análisis y Diseño UML** | `1:15` | Diagrama de Casos de Uso (24 CU) + Máquina de Estados Escrow de 6 estados (`EN_CUSTODIA` → `CONFORMIDAD_Y_LIBERADO` / `OBSERVADO_GARANTIA`). | Explicar cómo la máquina de estados protege el dinero hasta la conformidad o calificación del cliente y permite resolución de garantías (`REVISITA` / `LIBERAR`). |
| **05** | **Arquitectura de Alto Nivel (C4 N1–N2 + 4+1)** | `1:30` | Diagrama C4 Contenedores: actual vs. producción escalable (Cloudflare → Nginx → Node Cluster → Redis + PgBouncer + PostgreSQL Primary/Replica + S3). | Justificar **Monolito Modular + Clean Architecture**: consistencia transaccional y velocidad de entrega sin la complejidad innecesaria de microservicios tempranos. |
| **06** | **Arquitectura de Bajo Nivel (C4 N3–N4 + STRIDE)** | `1:15` | Mapa de componentes internos de `server.ts` y `src/`, patrones (Adapter, State Machine, Fallback, Idempotency Key) y matriz STRIDE. | Resaltar que `CULQI_SECRET_KEY` nunca sale del servidor y que el despacho automático degrada elegantemente de API real a cola + enlaces manuales. |
| **07** | **Desarrollo Basado en SDD** | `1:15` | Flujo SDD (`Constitución → Specs Gherkin → Contratos → Código → QA`) y los 7 archivos de `docs/sdd/`. | Explicar las 6 Invariantes no negociables (`I1–I6`) y cómo el SDD sirve de fuente única de verdad trazable al código. |
| **08** | **Pruebas Unitarias, Integración y E2E** | `1:30` | Pirámide de pruebas con cifras reales: **27 unitarias + 9 integración (`36/36`)** con Vitest/Supertest + **6 E2E (`6/6`)** con Playwright Chromium + `tsc` 0 errores. | Contar el hallazgo real: las pruebas unitarias detectaron el conteo exacto de **1,878 distritos** en `peruUbigeo.ts`, validando la utilidad real de automatizar pruebas. |
| **09** | **UI/UX y Accesibilidad** | `1:00` | Design System (`navy-950`, `amber-400` vs `sky-500` para Admin), 10 Heurísticas de Nielsen y validación móvil `375×812` (`E2E-06`). | Destacar el diferenciador cromático por rol para evitar errores humanos y el expediente legal de 5 bloques reutilizado en modo `owner` y `admin`. |
| **10** | **Escalabilidad Frontend y Backend** | `1:15` | Tabla de chunks Vite (`374 ms`, `> 382 kB` lazy-loaded), `infra/nginx.conf` (`least_conn` + WS Upgrade), `Dockerfile` multi-stage y `docker-compose.yml`. | Mostrar que un visitante jamás descarga la Consola Admin (`65.55 kB`) y que el servidor soporta Graceful Shutdown (`SIGTERM`) y Rate Limiting `429`. |
| **11** | **Escalabilidad de BD y Caché Multi-Nivel** | `1:30` | Esquema `database/01_schema.sql` (`uq_single_admin_only`), `02_indexes_and_scalability.sql` (GIN FTS, particiones, `FOR UPDATE`), PgBouncer + `server/cache.ts` (LRU/TTL + `ETag 304`). | Explicar cómo `LruTtlCache` logra **`99.87%` de Cache Hit Ratio** e invalida automáticamente tras cada cobro Culqi o mensaje de chat. |
| **12** | **Dominio, DNS, CDN y CI/CD** | `1:00` | Zona DNS `trabajaya.pe` (SPF/DKIM/DMARC/CAA), Cloudflare PoP Lima (SSL Full Strict + WAF) y diagrama de `.github/workflows/ci.yml` + `cd.yml`. | Mostrar cómo SPF/DKIM/DMARC garantizan que los correos de despacho no caigan en SPAM y cómo el pipeline bloquea merges si falla cualquier test o E2E. |
| **13** | **Pruebas de Carga k6 y Resultados Reales** | `1:15` | Tabla real de `npm run test:load`: Smoke `1,176 RPS` (`p95 7.14 ms`), Load Mixto `2,837 RPS` (`p95 54.69 ms`), Spike `3,891.9 RPS` (`p95 48.03 ms`), `0%` errores. | Interpretar resultados con criterio: `p95` 4× mejor que la meta (`250 ms`) y explicar el cuello de botella de I/O síncrono en `.data/*.json` que justifica PostgreSQL. |
| **14** | **Demo en Vivo y Conclusiones** | `4:00` | Aplicación corriendo en `http://localhost:3000` + terminal con `npm test` y `GET /api/cache/stats`. | Demostración real en vivo + cierre sintetizando logros y hoja de ruta productiva. |

---

## 2. Guion de Demostración en Vivo (4 Minutos Exactos)

### Preparación previa (antes de pasar al frente)
```powershell
cd "d:\TRABAJO FINAL DE ARQUITECTURA MULTIOOFICIOS\conectaoficios"
npm run dev
# Verificar en navegador: http://localhost:3000 y http://localhost:3000/api/cache/stats
```

### Secuencia en vivo frente al jurado
1. **Minuto 1 — Catálogo Nacional + Solicitud `S/ 0.00`:**
   - Filtrar por Región/Provincia/Distrito y Oficio (`Electricidad` o `Gasfitería`).
   - Mostrar intento de abrir `Chat` como visitante → demostrar el **bloqueo de seguridad** (Invariante I4).
   - Agregar un servicio (`Solicitar Visita`), ir a `Mi Solicitud`, mostrar `S/ 0.00`, GPS y enviar → mostrar `OrdenConfirmadaModal` con código `PED-2026-*` y los 3 canales.
2. **Minuto 2 — Usuario Registrado (`zagazaga158@gmail.com` / `usuario123`):**
   - Iniciar sesión, abrir `Mi Perfil` y enseñar el **Expediente Legal de 5 Bloques** (Domicilio, RUC, Antecedentes 3/3, MTC, Contrato/Inventario).
   - Mostrar `Imprevistos Hogar` (`S/ 5.00`) y `Mis Órdenes` con línea de tiempo Escrow.
3. **Minuto 3 — Administrador Único (`admin@conectaoficios.pe` / `admin123`):**
   - Notar el cambio de color institucional de `amber` a `sky` (UX preventiva).
   - Mostrar las **7 pestañas de Consola Admin**, especialmente `Planes`, `Usuarios` (política de Admin Único y correos permitidos) y `Billetera` (KPIs + Ledger Culqi).
4. **Minuto 4 — Evidencia de Ingeniería en Terminal:**
   - Abrir `/api/cache/stats` en otra pestaña mostrando `hits`, `misses` y `hitRatio`.
   - Ejecutar `npm test` (tarda `< 1 segundo` y muestra **`36/36` aprobadas** en pantalla frente al jurado).

---

## 3. Banco de 15 Preguntas Difíciles del Jurado (y Cómo Responder con Dominio Total)

### Bloque A — Arquitectura y SDD

**P1. ¿Por qué eligieron un Monolito Modular y no Microservicios?**  
> *Respuesta:* Porque en un marketplace nacional en etapa de lanzamiento, los microservicios introducen latencia de red, complejidad de despliegue y transacciones distribuidas (Sagas) innecesarias para flujos fuertemente acoplados como reservar turnos + crear orden Escrow + despachar notificaciones. El **Monolito Modular con Clean Architecture** nos da transacciones ACID simples, latencia `p95 < 55 ms` y fronteras limpias por módulo que permiten extraer un servicio en el futuro solo si un dominio específico (por ejemplo, Chat o Pagos) lo exige.

**P2. ¿En qué se diferencia el Desarrollo Basado en SDD de hacer documentación tradicional al final?**  
> *Respuesta:* En el desarrollo tradicional la documentación se redacta al final y queda obsoleta. En **SDD (`docs/sdd/`)**, las especificaciones —Constitución con invariantes `I1–I6`, contratos API/WS y escenarios Gherkin— son la **fuente única de verdad** de la cual derivamos directamente el código y las pruebas automatizadas (`Vitest`, `Supertest`, `Playwright`, `k6`). Si cambia una regla de negocio, primero se actualiza la spec y sus pruebas.

**P3. Si aplican Clean Architecture, ¿por qué `ConectaContext.tsx` tiene más de 3,800 líneas?**  
> *Respuesta:* Excelente observación; lo tenemos auditado explícitamente como **`GAP-06`** en nuestro plan SDD (`docs/sdd/05-*`). Como primer paso ya extrajimos la capa pura de dominio a `src/domain/businessRules.ts` (independiente de React y probada unitariamente con 10 tests) y la capa de caché a `server/cache.ts` (puerto `CacheStore`). La Fase 3 del roadmap divide `ConectaContext.tsx` en stores desacoplados por dominio conectados a la API REST.

### Bloque B — Seguridad, RBAC y Pagos Culqi

**P4. ¿Cómo garantizan que ningún hacker obtenga la clave secreta de Culqi?**  
> *Respuesta:* Por diseño (**Invariante I5**), `CULQI_SECRET_KEY` existe únicamente en el servidor (`server.ts` / GitHub Secrets) y jamás se empaqueta en el bundle Vite ni se devuelve en ninguna API. El frontend solo consulta `GET /api/payments/culqi/config` para recibir `CULQI_PUBLIC_KEY` (que es pública por estándar PCI), tokeniza la tarjeta en el SDK oficial Culqi v4, y envía solo el `tokenId` al servidor, que ejecuta `POST https://api.culqi.com/v2/charges`.

**P5. ¿Por qué guardan contraseñas en `localStorage` en el prototipo? ¿No es inseguro?**  
> *Respuesta:* Sí, en un entorno productivo sería un riesgo crítico; por eso lo documentamos transparentemente como **`GAP-01`** en el análisis STRIDE y el informe final. En esta versión académica permite demostrar los 20 usuarios semilla y los 9 módulos de forma autónoma sin servidor de base de datos externo; para producción, `database/01_schema.sql` ya almacena únicamente `password_hash` (`argon2id`/`bcrypt`) autenticado en backend con cookies `HttpOnly; Secure; SameSite=Lax`.

**P6. ¿Cómo aseguran a nivel de arquitectura y base de datos que solo exista UN Administrador Nacional?**  
> *Respuesta:* Con **defensa en profundidad en 3 capas**: (1) en UI/Contexto `registrarUsuario` fuerza `permiso = 'USUARIO'` y bloquea suspender/eliminar `ADM-001`; (2) en hidratación se depuran duplicados; y (3) en PostgreSQL (`database/01_schema.sql`) definimos un **índice único parcial**: `CREATE UNIQUE INDEX uq_single_admin_only ON users (permiso) WHERE permiso = 'ADMIN'`, haciendo físicamente imposible insertar un segundo administrador a nivel de motor SQL.

**P7. ¿Cómo cumplen con la Ley N.º 29733 de Protección de Datos Personales del Perú?**  
> *Respuesta:* Separamos la información pública (portafolio `fotosTrabajos`, calificación, insignias resumidas) de la documentación sensible del Expediente de 5 Bloques (DNI, recibo de domicilio, antecedentes PNP/PJ/INPE, Ficha RUC). En `PublicProfileModal` y `AdminInspectProfileView` aplicamos el guardia `canViewIdentityMedia = ADMIN || isOwnProfile` (verificado por prueba unitaria) y en producción se almacena en un bucket S3 privado con URLs prefirmadas de expiración corta.

### Bloque C — Escalabilidad, Caché, Base de Datos y Redes

**P8. Si escalan a 2 o más réplicas de Node.js detrás de Nginx, ¿cómo funciona el WebSocket `/ws/chat` si el Cliente está en `app-1` y el Técnico en `app-2`?**  
> *Respuesta:* En instancia única el broadcast ocurre en memoria (`wss.clients`). Al escalar horizontalmente (`docker-compose.yml` con `app-1`, `app-2` y `redis`), se conecta un **Redis Pub/Sub Backplane**: cuando `app-1` recibe un mensaje, publica en el canal `trabajaya:chat:events`, y todas las réplicas (`app-1`, `app-2`, ..., `app-N`) reciben el evento y lo entregan a sus sockets locales suscritos.

**P9. ¿Cómo evitan que dos clientes reserven simultáneamente el último turno libre de un técnico?**  
> *Respuesta:* En producción combinamos dos barreras: un **candado distribuido en Redis** (`SET lock:service:{id} token NX PX 5000`) y, a nivel transaccional ACID en PostgreSQL (`database/02_indexes_and_scalability.sql`), nuestro procedimiento **`sp_reservar_turno_atomico`** que ejecuta `SELECT turnos_libres ... FOR UPDATE`, bloqueando la fila hasta confirmar el descuento atómico.

**P10. ¿Cómo previenen que la caché devuelva datos desactualizados (stale data)?**  
> *Respuesta:* Combinamos **TTL cortos diferenciados** (`60s` en config, `30s` en transacciones, `15s` en conversaciones) con **invalidación activa inmediata en cada escritura**: `POST /api/payments/culqi/charge` ejecuta `cache.del('culqi:transactions')`, y cualquier creación de hilo, mensaje o despacho ejecuta `cache.invalidateByPrefix('chat:conv:')`. Además, `ETag` + `If-None-Match` devuelve `304 Not Modified` ahorrando ancho de banda sin servir datos viejos. Todo esto está verificado en `tests/integration/server.api.test.ts`.

**P11. ¿Por qué colocan PgBouncer en modo `transaction` delante de PostgreSQL?**  
> *Respuesta:* Cada conexión nativa en PostgreSQL crea un proceso del sistema operativo (~5–10 MB RAM). Con múltiples réplicas Node.js escalando horizontalmente, abrir 1,000 conexiones saturaría la RAM del servidor de BD. **PgBouncer** (`infra/pgbouncer.ini`) en modo `transaction` multiplexa hasta **2,000 conexiones de aplicación sobre un pool fijo de 40 conexiones reales** a PostgreSQL.

**P12. ¿Para qué sirven los registros DNS `SPF`, `DKIM`, `DMARC` y `CAA` en su configuración?**  
> *Respuesta:* Como `server.ts` despacha solicitudes de órdenes automáticamente por correo (`nodemailer` SMTP), **SPF**, **DKIM** y **DMARC** demuestran a Gmail y Outlook que los correos realmente provienen de nuestro servidor autorizado, evitando que las órdenes de trabajo terminen en SPAM o sean suplantadas. **CAA** restringe qué autoridades certificadoras pueden emitir certificados SSL para `trabajaya.pe`.

### Bloque D — Pruebas, Rendimiento k6 y CI/CD

**P13. ¿Cuál es la diferencia práctica entre sus pruebas unitarias, de integración y E2E?**  
> *Respuesta:* Las **27 unitarias (Vitest)** validan lógica pura en milisegundos sin red ni navegador (Escrow, IGV, Ubigeo, LRU cache). Las **9 de integración (Supertest + `ws`)** prueban el backend HTTP + archivos + WebSocket + caché real sin interfaz gráfica. Las **6 E2E (Playwright)** abren un **navegador Chromium real**, hacen clic como un usuario humano (desktop y móvil `375×812`) y validan la integración completa Frontend + Backend.

**P14. ¿Qué cuello de botella detectaron en sus pruebas de carga y cómo lo mitigaron?**  
> *Respuesta:* Al ejecutar el benchmark real (`npm run test:load`, 5,180 peticiones), las lecturas cacheadas alcanzaron **`3,891.9 RPS`** con `p95 = 48.03 ms` (`99.87%` Cache Hit). Sin embargo, en el escenario mixto con cobros Culqi (`POST`), el `p95` subió a `54.69 ms` por la escritura síncrona a disco (`fs.writeFileSync` sobre `.data/culqi-transactions.json`). Esto valida cuantitativamente por qué en producción se migra a **PostgreSQL + PgBouncer** (I/O asíncrono y concurrente).

**P15. ¿Cómo garantizan despliegues sin caída (*Zero-Downtime*) y recuperación rápida si un release falla?**  
> *Respuesta:* Primero, `.github/workflows/ci.yml` bloquea cualquier merge si falla TypeScript, alguna de las 36 pruebas, el build o los 6 E2E. Luego, `cd.yml` construye una **imagen Docker inmutable etiquetada por SHA** en GHCR, valida en `staging`, realiza Rolling Update apoyado en el **Graceful Shutdown (`SIGTERM`)** de `server.ts` (que cierra sockets WS con código `1001` para que reconecten en `2.5 s` y drena requests activos), y si surge un fallo se hace rollback en menos de 60 segundos apuntando a la etiqueta SHA previa.

---

## 4. Checklist Final Pre-Sustentación

- [ ] Ejecutar `npm run lint` (`0` errores) y `npm test` (`36/36` verdes).
- [ ] Ejecutar `npm run test:e2e` (`6/6` verdes en Chromium) y `npm run test:load` (`p95 < 250 ms`).
- [ ] Tener abierta la app en `http://localhost:3000` y `/api/cache/stats` en una segunda pestaña.
- [ ] Tener completados los campos de portada (Universidad, Docente, Integrantes) en `15-INFORME-FINAL.md`.
- [ ] Haber subido el proyecto a GitHub siguiendo `14-CODIGO-FUENTE-Y-BASE-DE-DATOS-EN-GITHUB.md` y verificar que `ci.yml` corra en verde.
