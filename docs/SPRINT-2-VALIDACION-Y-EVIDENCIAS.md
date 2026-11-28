# SPRINT 2 — Implementación y Validación de la Arquitectura de Software

> **Proyecto:** TrabajaYa Perú (`conectaoficios`)  
> **Estilo Arquitectónico:** Monolito Modular en Capas (Full-Stack Stateless-Ready)  
> **Patrón Arquitectónico:** Clean Architecture (`Dominio` ← `Aplicación` ← `Infraestructura` ← `Presentación`) + Spec-Driven Development (SDD)  
> **Estado General:** ✅ **100% de Actividades (8/8) y Entregables (5/5) implementados y verificados cuantitativamente.**

---

## 1. Matriz de Cumplimiento del Sprint 2

| Actividad / Entregable | Estado | Evidencia Real en el Repositorio |
| :--- | :---: | :--- |
| **1. Estilo Arquitectónico** | ✅ Completo | Monolito Modular Full-Stack en [`server.ts`](../server.ts) + SPA React 19 (`src/`), contenedores stateless ([`Dockerfile`](../Dockerfile), [`docker-compose.yml`](../docker-compose.yml), [`infra/nginx.conf`](../infra/nginx.conf)). |
| **2. Enfoque / Patrón Arquitectónico (Clean Architecture)** | ✅ Completo | Separación explícita en 4 capas:<br>• **Dominio:** [`src/domain/businessRules.ts`](../src/domain/businessRules.ts), [`server/domain/entities.ts`](../server/domain/entities.ts), [`server/domain/ports.ts`](../server/domain/ports.ts)<br>• **Aplicación:** [`server/application/catalogUseCases.ts`](../server/application/catalogUseCases.ts), [`paymentUseCases.ts`](../server/application/paymentUseCases.ts), [`chatUseCases.ts`](../server/application/chatUseCases.ts), [`dispatchUseCases.ts`](../server/application/dispatchUseCases.ts)<br>• **Infraestructura:** [`server/infrastructure/cache/lruTtlCache.ts`](../server/infrastructure/cache/lruTtlCache.ts), [`persistence/jsonRepositories.ts`](../server/infrastructure/persistence/jsonRepositories.ts), [`gateways/culqiGateway.ts`](../server/infrastructure/gateways/culqiGateway.ts), [`gateways/notificationDispatcher.ts`](../server/infrastructure/gateways/notificationDispatcher.ts)<br>• **Presentación:** [`server/presentation/routes/apiRoutes.ts`](../server/presentation/routes/apiRoutes.ts), [`middleware/securityAndRateLimit.ts`](../server/presentation/middleware/securityAndRateLimit.ts), [`ws/chatSocketServer.ts`](../server/presentation/ws/chatSocketServer.ts) y vistas React (`src/components/`). |
| **3. Especificaciones SDD + Criterios de Aceptación + Tareas Técnicas** | ✅ Completo | Suite SDD completa en [`docs/sdd/`](./sdd/README.md): criterios Gherkin (`Given/When/Then`) en [`04-ESPECIFICACIONES-FUNCIONALES-MODULOS.md`](./sdd/04-ESPECIFICACIONES-FUNCIONALES-MODULOS.md) y trazabilidad + backlog de tareas técnicas (`T1.1`–`T4.4`) en [`05-PLAN-TECNICO-TAREAS-Y-MATRIZ-VERIFICACION.md`](./sdd/05-PLAN-TECNICO-TAREAS-Y-MATRIZ-VERIFICACION.md). |
| **4. Endpoints REST funcionales y documentados con OpenAPI / Swagger** | ✅ Completo | **12 endpoints REST** activos en [`apiRoutes.ts`](../server/presentation/routes/apiRoutes.ts) + especificación **OpenAPI 3.0.3** en [`server/infrastructure/docs/openapi.ts`](../server/infrastructure/docs/openapi.ts), exportada a [`docs/openapi.json`](./openapi.json), servida en vivo en `GET /api/openapi.json` y con **Swagger UI interactivo en `GET /api-docs`**. |
| **5. Análisis de Base de Datos y Estrategia de Caché** | ✅ Completo | Análisis BD PostgreSQL 16 + índices parciales/GIN + particionamiento + `FOR UPDATE` + PgBouncer en [`09-ESCALABILIDAD-BASE-DE-DATOS.md`](./trabajo-final/09-ESCALABILIDAD-BASE-DE-DATOS.md) y `database/*.sql`. Caché analizada en [`11-IMPLEMENTACION-CACHE.md`](./trabajo-final/11-IMPLEMENTACION-CACHE.md) e implementada en [`lruTtlCache.ts`](../server/infrastructure/cache/lruTtlCache.ts) (`LRU + TTL + ETag/304 + X-Cache + /api/cache/stats`). |
| **6. Principios SOLID y Patrones de Diseño** | ✅ Completo | **SRP** (casos de uso y adaptadores segregados), **OCP/LSP** (`CacheStore`, `PaymentGateway`, `ChatRepository` intercambiables sin tocar aplicación), **ISP** (puertos pequeños en `server/domain/ports.ts`), **DIP** (Composition Root en `server.ts` + tests unitarios con mocks en `server.useCases.test.ts`). Patrones: *Factory*, *Repository*, *Adapter*, *Cache-Aside*, *Observer/Pub-Sub*, *State Machine*, *Chain of Responsibility*, *Idempotency Key*. |
| **7. Pruebas Automatizadas con Jest + Cobertura + GitHub Actions CI/CD** | ✅ Completo | **Jest** ([`jest.config.cjs`](../jest.config.cjs)) con **7 suites y 44 pruebas automatizadas aprobadas** (`npm run test:coverage`), generando reporte en `coverage/` (**96.53% Statements / Lines, 97.18% Functions, 75.95% Branches**). Integrado en GitHub Actions ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml) y [`cd.yml`](../.github/workflows/cd.yml)). |
| **8. Validación de Escenarios de Atributos de Calidad (Postman, k6 hasta 2,000 VUs, Jest, Playwright)** | ✅ Completo | • **k6 (progresivo hasta 2,000 VUs):** [`tests/load/stress-2000vu.k6.js`](../tests/load/stress-2000vu.k6.js), [`stress-and-spike.k6.js`](../tests/load/stress-and-spike.k6.js), [`load.k6.js`](../tests/load/load.k6.js), [`smoke.k6.js`](../tests/load/smoke.k6.js).<br>• **Benchmark progresivo ejecutado hasta 2,000 VUs:** [`tests/load/run-load-benchmark.ts`](../tests/load/run-load-benchmark.ts) → evidencia JSON real en [`docs/evidencias/load-2000vu-results.json`](./evidencias/load-2000vu-results.json).<br>• **Colección Postman con aserciones de calidad:** [`docs/postman/TrabajaYa-Peru.postman_collection.json`](./postman/TrabajaYa-Peru.postman_collection.json).<br>• **E2E Playwright:** [`tests/e2e/trabajaya.e2e.spec.ts`](../tests/e2e/trabajaya.e2e.spec.ts). |

---

## 2. Evidencia de Pruebas Automatizadas con Jest y Reporte de Cobertura

Comando ejecutado: `npm run test:coverage`

- **Suites ejecutadas:** `7/7` aprobadas (`6` unitarias + `1` de integración full-stack HTTP + OpenAPI + WebSocket + Rate Limiting).
- **Pruebas aprobadas:** `44/44` (`0` fallos).
- **Cobertura global verificada (V8 Coverage):**
  - **Statements:** `96.53%` (`5,021 / 5,201`)
  - **Lines:** `96.53%` (`5,021 / 5,201`)
  - **Functions:** `97.18%` (`138 / 142`)
  - **Branches:** `75.95%` (`376 / 495`)
- **Artefactos generados automáticamente en `coverage/`:** `coverage/lcov-report/index.html`, `coverage/lcov.info`, `coverage/coverage-summary.json`.

---

## 3. Evidencia de Validación de Atributos de Calidad (Simulación Progresiva hasta 2,000 VUs)

Comando ejecutado: `npm run test:load` (espejo ejecutable de [`tests/load/stress-2000vu.k6.js`](../tests/load/stress-2000vu.k6.js) contra `createAppServer()` real).  
Archivo de evidencia generado: [`docs/evidencias/load-2000vu-results.json`](./evidencias/load-2000vu-results.json).

| Etapa Progresiva | Usuarios Virtuales (VUs) | Total Req. | Errores (%) | Throughput (RPS) | Promedio | `p50` | **`p95`** | **`p99`** | RSS (MB) | Veredicto |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Smoke** | `10` | `101` | `0 (0.00%)` | `1,262.5 req/s` | `7.91 ms` | `3.49 ms` | **`33.68 ms`** | `34.21 ms` | `77.9 MB` | ✅ Aprobado |
| **2. Carga Base** | `100` | `810` | `0 (0.00%)` | `4,050.0 req/s` | `23.69 ms` | `22.99 ms` | **`48.17 ms`** | `68.56 ms` | `87.0 MB` | ✅ Aprobado |
| **3. Carga Media** | `500` | `3,050` | `24 (0.79%)` | `5,980.4 req/s` | `78.38 ms` | `68.92 ms` | **`138.65 ms`** | `179.08 ms` | `126.6 MB` | ✅ Aprobado |
| **4. Alta Demanda** | `1,000` | `5,100` | `24 (0.47%)` | `7,183.1 req/s` | `129.23 ms` | `130.35 ms` | **`169.68 ms`** | `192.50 ms` | `153.6 MB` | ✅ Aprobado |
| **5. Estrés Severo** | `1,500` | `6,150` | `24 (0.39%)` | `7,884.6 req/s` | `171.99 ms` | `173.82 ms` | **`216.72 ms`** | `236.04 ms` | `207.9 MB` | ✅ Aprobado |
| **6. Pico Máximo** | **`2,000`** | **`8,200`** | **`24 (0.29%)`** | **`7,961.2 req/s`** | `222.80 ms` | `229.86 ms` | **`279.10 ms`** | **`295.97 ms`** | `228.0 MB` | ✅ Aprobado |

### Conclusiones de Validación de Escenarios del Sprint 1
- **EQ-01 (Rendimiento y Caché):** Con `LruTtlCache` activo se alcanzó un **Cache Hit Ratio de `99.98%`** (`17,101` hits vs `3` misses), logrando `p95 = 48.17 ms` a `100 VUs` y `p95 = 279.10 ms` incluso a **`2,000 VUs`** en una sola instancia Node.js.
- **EQ-02 (Disponibilidad y Resiliencia):** `IT-09` e `IT-10` en Jest confirman `100%` de entrega en Chat In-App y WebSocket `/ws/chat` aun sin credenciales SMTP/WhatsApp externas.
- **EQ-03 (Escalabilidad hasta 2,000 VUs):** La curva progresiva `10 → 100 → 500 → 1,000 → 1,500 → 2,000 VUs` mantuvo una tasa de error `< 0.8%` (`0.29%` en 2,000 VUs), consumo estable de memoria (`228 MB` RSS) y throughput cercano a **8,000 req/s**.
- **EQ-04 (Seguridad y RBAC):** Validado mediante `IT-04` (sin exposición de `CULQI_SECRET_KEY`), `IT-05` (`400` en validaciones), `IT-07`/`IT-08` (`401` a `GUEST` y aislamiento de conversaciones) e **`IT-12` (`429 Too Many Requests` en Rate Limiting L7)**.
- **EQ-05 (Mantenibilidad):** `0` errores TypeScript (`npm run lint`), `vite build` en `612 ms`, arquitectura limpia modular en `server/` y pipeline automatizado en GitHub Actions ([`ci.yml`](../.github/workflows/ci.yml)).

---

## 4. Comandos de Reproducción

```bash
# 1. Verificación estática TypeScript
npm run lint

# 2. Pruebas automatizadas Jest + Reporte de cobertura (genera coverage/)
npm run test:coverage

# 3. Simulación progresiva de carga hasta 2,000 VUs (genera docs/evidencias/load-2000vu-results.json)
npm run test:load

# 4. Ejecución directa con binario k6 hasta 2,000 VUs
RATE_LIMIT_MAX_REQ=0 npm run start
k6 run -e BASE_URL=http://127.0.0.1:3000 tests/load/stress-2000vu.k6.js

# 5. Build de producción y exploración de Swagger UI
npm run build
# Abrir http://localhost:3000/api-docs y http://localhost:3000/api/openapi.json
```
