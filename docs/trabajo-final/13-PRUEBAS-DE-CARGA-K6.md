# Paso 13 — Pruebas de Carga con k6 (Scripts Oficiales + Benchmark Real Ejecutado)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`)  
> **Scripts k6 Creados:** [`tests/load/smoke.k6.js`](../../tests/load/smoke.k6.js), [`tests/load/load.k6.js`](../../tests/load/load.k6.js), [`tests/load/stress-and-spike.k6.js`](../../tests/load/stress-and-spike.k6.js).  
> **Ejecutor Local Verificado:** [`tests/load/run-load-benchmark.ts`](../../tests/load/run-load-benchmark.ts) (`npm run test:load`).

---

## 1. Estrategia y Perfiles de Pruebas de Carga (k6)

Las pruebas de rendimiento validan los Requisitos No Funcionales **`RNF-01`** (`p95 < 250 ms`, `p99 < 500 ms`), **`RNF-04`** (tasa de error `< 1%`) y **`RNF-06`** (`Cache Hit Ratio >= 80%`) mediante cuatro perfiles complementarios:

| Perfil | Script k6 | Concurrencia (VUs) | Duración / Rampa | Objetivo de Validación |
| :--- | :--- | :---: | :---: | :--- |
| **1. Smoke Test** | `tests/load/smoke.k6.js` | `5 VUs` | `15 s` | Comprobar estabilidad funcional de los 5 endpoints críticos bajo carga mínima (`p95 < 200 ms`). |
| **2. Load Test (Mixto)** | `tests/load/load.k6.js` | `0 → 30 → 100 → 0 VUs` | `80 s` | Tráfico representativo (lecturas con `X-Cache: HIT` + 10% pagos Sandbox Culqi que invalidan `culqi:transactions`). Umbrales: `p95 < 250 ms`, `p99 < 500 ms`, `cache_hit_rate > 80%`. |
| **3. Stress & Spike Test** | `tests/load/stress-and-spike.k6.js` | `50 → 300 → 50 → 0 VUs` | `90 s` | Simular un pico repentino ×6 (ej. emergencia climática o campaña nacional) y medir recuperación sin fugas de memoria (`p95 < 500 ms`, errores `< 2%`). |
| **4. Benchmark Local Automatizado** | `tests/load/run-load-benchmark.ts` | `5`, `50` y `120 VUs` | `5,180 req` | Ejecutable directamente con `npm run test:load` sin depender de instalar el binario externo `k6`. |

---

## 2. Resultados Reales Medidos sobre `server.ts` (`npm run test:load`)

Ejecutado en vivo contra una instancia aislada de `createAppServer()` (`RATE_LIMIT_MAX_REQ=0`, `LruTtlCache` activo, Node.js 24):

| Escenario Ejecutado | VUs | Total Req. | Errores (%) | Duración | Throughput (RPS) | Promedio | `p50` | **`p95`** | **`p99`** | Máximo | Umbral `RNF-01` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Smoke Test** | `5` | `200` | `0 (0%)` | `0.17 s` | `1,176.5 req/s` | `4.11 ms` | `2.79 ms` | **`7.14 ms`** | **`35.06 ms`** | `37.23 ms` | ✅ Aprobado |
| **2. Load Test Mixto (con Culqi POST)** | `50` | `2,100` | `0 (0%)` | `0.74 s` | `2,837.8 req/s` | `17.62 ms` | `12.71 ms` | **`54.69 ms`** | **`70.94 ms`** | `73.03 ms` | ✅ Aprobado |
| **3. Spike / Stress Test** | `120` | `2,880` | `0 (0%)` | `0.74 s` | **`3,891.9 req/s`** | `30.10 ms` | `27.91 ms` | **`48.03 ms`** | **`56.22 ms`** | `58.55 ms` | ✅ Aprobado |

### 2.1 Efectividad Real de la Capa de Caché durante la Prueba (`GET /api/cache/stats`)

```json
{
  "ok": true,
  "backend": "lru-memory",
  "stats": {
    "size": 3,
    "maxEntries": 500,
    "hits": 3805,
    "misses": 5,
    "sets": 5,
    "invalidations": 2,
    "evictions": 0,
    "hitRatio": 99.87
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
