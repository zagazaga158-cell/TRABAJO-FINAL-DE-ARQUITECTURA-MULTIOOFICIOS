# Escenarios de Atributos de Calidad — TrabajaYa Perú (`conectaoficios`)

## EQ-01. Rendimiento: consultas frecuentes, catálogo y capa de caché

| Elemento | Descripción |
| :--- | :--- |
| **Atributo de calidad** | Rendimiento (`AC01`) |
| **Fuente** | Cliente, Técnico o Administrador |
| **Estímulo** | Múltiples usuarios consultan simultáneamente el catálogo filtrado por oficio/Ubigeo, la configuración de Culqi (`/api/payments/culqi/config`), el ledger de transacciones y las conversaciones de chat. |
| **Condición** | Operación normal y carga concurrente (hasta 120 VUs en prueba local / 100–300 VUs en k6). |
| **Respuesta esperada** | El sistema entrega resultados desde caché en memoria (`X-Cache: HIT`) o responde `304 Not Modified` si el `ETag` coincide, manteniendo baja latencia sin bloquear la UI. |
| **Medida** | `p95 < 250 ms`, `p99 < 500 ms`, tasa de fallos `< 1%` y Cache Hit Ratio `>= 80%`. |
| **Verificación** | Ejecución real de `npm run test:load` (`run-load-benchmark.ts`) y scripts `tests/load/*.k6.js`: **verificado `p95 = 48.03–54.69 ms`, `3,891.9 RPS`, `0%` fallos y `99.87%` Cache Hit Ratio**. |
| **Estado** | **Aprobado y verificado cuantitativamente.** |

---

## EQ-02. Disponibilidad y Resiliencia: despacho multicanal y caída de externos

| Elemento | Descripción |
| :--- | :--- |
| **Atributo de calidad** | Disponibilidad y Resiliencia (`AC02`) |
| **Fuente** | Cliente o Técnico ante una solicitud de servicio o emergencia doméstica |
| **Estímulo** | Un servicio externo (SMTP, Meta WhatsApp Cloud API o red del cliente WebSocket) no responde o carece de credenciales activas al despachar una orden. |
| **Condición** | Operación continua 24/7; despliegue rolling update con `SIGTERM`. |
| **Respuesta esperada** | La creación de la orden no se bloquea: el Chat Directo in-app entrega el pedido al instante, Email/WhatsApp pasan a cola con enlaces manuales de respaldo, el cliente WebSocket reconecta cada `2500ms` y el servidor ejecuta cierre ordenado (`SIGTERM`). |
| **Medida** | `100%` de órdenes entregadas en Chat in-app aun sin SMTP/WhatsApp externos; SLA objetivo en producción `>= 99.5%`. |
| **Verificación** | Pruebas de integración `IT-07` e `IT-08` en `tests/integration/server.api.test.ts` + Healthcheck `GET /api/health` en `Dockerfile` y `cd.yml`. |
| **Estado** | **Aprobado y verificado.** |

---

## EQ-03. Escalabilidad: picos repentinos de emergencias y tráfico nacional

| Elemento | Descripción |
| :--- | :--- |
| **Atributo de calidad** | Escalabilidad (`AC03`) |
| **Fuente** | Campaña nacional o evento climático que multiplica ×6 las solicitudes simultáneas de gasfitería/electricidad |
| **Estímulo** | Incremento súbito de `50` a `120–300` usuarios concurrentes enviando consultas y solicitudes. |
| **Condición** | Frontend con code splitting (`React.lazy` + `manualChunks`) + CDN Cloudflare + Nginx `least_conn` sobre múltiples réplicas Node.js + PgBouncer + PostgreSQL Primary/Replicas + Redis. |
| **Respuesta esperada** | El frontend difiere `> 382 kB` de vistas secundarias/admin, el balanceador distribuye tráfico HTTP/WSS y PostgreSQL protege `turnosLibres` con `sp_reservar_turno_atomico` (`FOR UPDATE`). |
| **Medida** | Soportar picos sin superar `p95 < 500 ms` ni tasa de error `> 2%`, con `0` dobles reservas simultáneas. |
| **Verificación** | `npm run build` (`374–588 ms`), `tests/load/stress-and-spike.k6.js`, `npm run test:load` (`120 VUs` → `3,891.9 RPS`, `0%` error) y `database/02_indexes_and_scalability.sql`. |
| **Estado** | **Aprobado.** |

---

## EQ-04. Seguridad y Privacidad: protección de pagos, chat y Expediente de 5 Bloques

| Elemento | Descripción |
| :--- | :--- |
| **Atributo de calidad** | Seguridad (`AC04`) |
| **Fuente** | Visitante anónimo (`GUEST`), usuario regular intentando escalar privilegios o atacante externo |
| **Estímulo** | Intento de enviar mensajes sin sesión, leer conversaciones ajenas, ver `dniFotoUrl`/antecedentes de terceros, acceder a `PerfilesView`/`Consola Admin`, saturar `/api/payments/culqi/charge` o extraer `CULQI_SECRET_KEY`. |
| **Condición** | Peticiones directas HTTP/WS o navegación manual en la SPA. |
| **Respuesta esperada** | El backend retorna `401 Unauthorized` en chat a `GUEST`, aísla conversaciones por rol, oculta `CULQI_SECRET_KEY` del cliente, aplica Rate Limiting `429` y bloquea medios privados a terceros (`canViewIdentityMedia`). |
| **Medida** | `100%` de accesos no autorizados bloqueados; `0` secretos en respuestas públicas o bundle `dist/`. |
| **Verificación** | Pruebas unitarias (`domain.businessRules.test.ts`), integración (`IT-02`, `IT-05`, `IT-06` en `server.api.test.ts`) y E2E (`E2E-02` en `trabajaya.e2e.spec.ts`). |
| **Estado** | **Aprobado y verificado (con remediación `GAP-01` JWT/argon2 planificada para despliegue productivo).** |

---

## EQ-05. Mantenibilidad y Evolución: cambios de reglas, oficios o proveedores

| Elemento | Descripción |
| :--- | :--- |
| **Atributo de calidad** | Mantenibilidad (`AC05`) |
| **Fuente** | Equipo de ingeniería |
| **Estímulo** | Incorporar un nuevo oficio, ajustar el porcentaje de garantía Escrow o reemplazar la caché en memoria por Redis distribuido. |
| **Condición** | Ciclo de evolución bajo metodología SDD (`docs/sdd/`). |
| **Respuesta esperada** | Los cambios se realizan de forma localizada en `src/types/index.ts`, `src/domain/businessRules.ts` o implementando el puerto `CacheStore` sin alterar los controladores ni romper contratos. |
| **Medida** | `0` errores TypeScript (`tsc --noEmit`), `36/36` pruebas unitarias/integración y `6/6` E2E en verde automáticamente en GitHub Actions (`ci.yml`). |
| **Verificación** | Ejecución continua de `npm run lint`, `npm test`, `npm run test:e2e` y `npm run build` en CI/CD. |
| **Estado** | **Aprobado y verificado.** |
