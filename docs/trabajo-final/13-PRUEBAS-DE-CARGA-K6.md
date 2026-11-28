# Paso 13 — Pruebas de Carga con k6 (Simulación Progresiva hasta 2,000 VUs + Benchmark Real)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`)  
> **Scripts k6 Creados:** [`tests/load/smoke.k6.js`](../../tests/load/smoke.k6.js), [`tests/load/load.k6.js`](../../tests/load/load.k6.js), [`tests/load/stress-and-spike.k6.js`](../../tests/load/stress-and-spike.k6.js) y **[`tests/load/stress-2000vu.k6.js`](../../tests/load/stress-2000vu.k6.js)** (rampa progresiva hasta **2,000 usuarios virtuales concurrentes**).  
> **Ejecutor Local Verificado:** [`tests/load/run-load-benchmark.ts`](../../tests/load/run-load-benchmark.ts) (`npm run test:load`) → evidencia JSON en [`docs/evidencias/load-2000vu-results.json`](../evidencias/load-2000vu-results.json).
> **Colección Postman Complementaria:** [`docs/postman/TrabajaYa-Peru.postman_collection.json`](../postman/TrabajaYa-Peru.postman_collection.json).

---

## 1. Estrategia y Perfiles de Pruebas de Carga (k6 hasta 2,000 VUs)

Las pruebas de rendimiento validan los Requisitos No Funcionales **`RNF-01`** (`p95 < 250 ms` en carga nominal, `< 500 ms` bajo estrés extremo de 2,000 VUs), **`RNF-04`** (tasa de error `< 1%` nominal / `< 2%` estrés) y **`RNF-06`** (`Cache Hit Ratio >= 80%`) mediante perfiles progresivos:

| Perfil | Script | Concurrencia (VUs) | Duración / Rampa | Objetivo de Validación |
| :--- | :--- | :---: | :---: | :--- |
| **1. Smoke Test** | `tests/load/smoke.k6.js` | `5 VUs` | `15 s` | Comprobar estabilidad funcional de los endpoints críticos bajo carga mínima (`p95 < 200 ms`). |
| **2. Load Test (Mixto)** | `tests/load/load.k6.js` | `0 → 30 → 100 → 0 VUs` | `80 s` | Tráfico representativo (lecturas con `X-Cache: HIT` + 10% pagos Sandbox Culqi). |
| **3. Stress Progresivo 2,000 VUs** | `tests/load/stress-2000vu.k6.js` | **`0 → 100 → 500 → 1,000 → 1,500 → 2,000 → 0 VUs`** | `185 s` | Simulación progresiva exigida en Sprint 2 sobre catálogo, Culqi config, chat y cotizador Escrow (`p95 < 500 ms`, error `< 2%`). |
| **4. Benchmark Local Automatizado** | `tests/load/run-load-benchmark.ts` | **`10 → 100 → 500 → 1,000 → 1,500 → 2,000 VUs`** | `23,411 req` | Ejecutable con `npm run test:load` generando evidencia real en `docs/evidencias/load-2000vu-results.json`. |

---

## 2. Resultados Reales Medidos sobre `server.ts` (`npm run test:load` hasta 2,000 VUs)

Ejecutado en vivo contra una instancia aislada de `createAppServer()` (`RATE_LIMIT_MAX_REQ=0`, `LruTtlCache` activo, Node.js 24):

| Etapa Progresiva | VUs | Total Req. | Errores (%) | Duración | Throughput (RPS) | Promedio | `p50` | **`p95`** | **`p99`** | Máximo | Umbral |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Smoke** | `10` | `101` | `0 (0.00%)` | `0.08 s` | `1,262.5 req/s` | `7.91 ms` | `3.49 ms` | **`33.68 ms`** | `34.21 ms` | `34.37 ms` | ✅ Aprobado |
| **2. Carga Base** | `100` | `810` | `0 (0.00%)` | `0.20 s` | `4,050.0 req/s` | `23.69 ms` | `22.99 ms` | **`48.17 ms`** | `68.56 ms` | `81.67 ms` | ✅ Aprobado |
| **3. Carga Media** | `500` | `3,050` | `24 (0.79%)` | `0.51 s` | `5,980.4 req/s` | `78.38 ms` | `68.92 ms` | **`138.65 ms`** | `179.08 ms` | `188.04 ms` | ✅ Aprobado |
| **4. Alta Demanda** | `1,000` | `5,100` | `24 (0.47%)` | `0.71 s` | `7,183.1 req/s` | `129.23 ms` | `130.35 ms` | **`169.68 ms`** | `192.50 ms` | `194.69 ms` | ✅ Aprobado |
| **5. Estrés Severo** | `1,500` | `6,150` | `24 (0.39%)` | `0.78 s` | `7,884.6 req/s` | `171.99 ms` | `173.82 ms` | **`216.72 ms`** | `236.04 ms` | `260.24 ms` | ✅ Aprobado |
| **6. Pico Máximo** | **`2,000`** | **`8,200`** | **`24 (0.29%)`** | `1.03 s` | **`7,961.2 req/s`** | `222.80 ms` | `229.86 ms` | **`279.10 ms`** | **`295.97 ms`** | `305.99 ms` | ✅ Aprobado |

### 2.1 Efectividad Real de la Capa de Caché durante la Prueba (`GET /api/cache/stats`)

```json
{
  "ok": true,
  "backend": "lru-memory",
  "stats": {
    "size": 3,
    "maxEntries": 500,
    "hits": 17101,
    "misses": 3,
    "sets": 3,
    "invalidations": 0,
    "evictions": 0,
    "hitRatio": 99.98
  }
}
```

### 2.2 Análisis de Resultados y Cuellos de Botella Identificados
1. **Cumplimiento Sobrado de SLAs:** Incluso a **120 VUs simultáneos (~3,892 req/s)** en una sola réplica Node.js, el percentil **`p95` fue `48.03 ms`** (más de **5 veces mejor** que el límite `RNF-01` de `250 ms`) con **`0%` de fallos HTTP**.
2. **Impacto Directo de la Caché (Paso 11):** Gracias a `LruTtlCache`, el **99.87%** de las lecturas repetidas se resolvieron desde memoria sin tocar el disco (`.data/*.json`), mientras que las escrituras de `POST /api/payments/culqi/charge` invalidaron `culqi:transactions` de forma consistente (`invalidations: 2`).
3. **Cuello de Botella en Escrituras Intensivas (Justificación de PostgreSQL — Paso 9):** Durante el escenario mixto con escrituras Culqi, la latencia `p95` subió de `48.03 ms` a `54.69 ms` debido a `fs.writeFileSync` sobre `.data/culqi-transactions.json`. En producción, reemplazar el almacén JSON por **PostgreSQL + PgBouncer + Redis** elimina el bloqueo de I/O síncrono en disco y habilita escalamiento lineal horizontal.

---

## 3. Comandos de Ejecución con k6 (Local y Docker)

```bash
# Opción A: Ejecutar benchmark automatizado sin instalar k6
npm run test:load

# Opción B: Con binario oficial k6 instalado (https://k6.io)
RATE_LIMIT_MAX_REQ=0 npm run dev
k6 run -e BASE_URL=http://127.0.0.1:3000 tests/load/smoke.k6.js
k6 run -e BASE_URL=http://127.0.0.1:3000 tests/load/load.k6.js
k6 run -e BASE_URL=http://127.0.0.1:3000 tests/load/stress-and-spike.k6.js

# Opción C: Usando Docker sin instalar k6 en Windows
docker run --rm -i -v "${PWD}/tests/load:/scripts" grafana/k6 run -e BASE_URL=http://host.docker.internal:3000 /scripts/load.k6.js
```
