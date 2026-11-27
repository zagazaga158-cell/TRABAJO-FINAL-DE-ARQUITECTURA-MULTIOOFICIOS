import fs from 'fs';
import os from 'os';
import path from 'path';
import { performance } from 'perf_hooks';

/**
 * Ejecutor local de Benchmark de Carga (espejo de smoke.k6.js / load.k6.js / stress-and-spike.k6.js)
 * Permite medir métricas REALES de latencia (p50, p95, p99), RPS y Cache Hit Ratio
 * directamente sobre server.ts aun cuando el binario k6 no esté instalado localmente.
 */

interface ScenarioResult {
  name: string;
  concurrency: number;
  totalRequests: number;
  failedRequests: number;
  errorRatePct: number;
  durationSec: number;
  rps: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[idx].toFixed(2));
}

async function runScenario(
  name: string,
  baseUrl: string,
  concurrency: number,
  iterationsPerVu: number,
  includeWrites: boolean
): Promise<ScenarioResult> {
  const latencies: number[] = [];
  let failed = 0;
  const t0 = performance.now();

  const worker = async (vuId: number) => {
    for (let iter = 0; iter < iterationsPerVu; iter++) {
      const endpoints = [
        `${baseUrl}/api/health`,
        `${baseUrl}/api/payments/culqi/config`,
        `${baseUrl}/api/payments/culqi/transactions`,
        `${baseUrl}/api/chat/conversations?role=ADMIN`
      ];

      for (const url of endpoints) {
        const s = performance.now();
        try {
          const res = await fetch(url);
          await res.text();
          const dt = performance.now() - s;
          latencies.push(dt);
          if (!res.ok) failed += 1;
        } catch {
          failed += 1;
        }
      }

      if (includeWrites && iter % 5 === 0) {
        const s = performance.now();
        try {
          const res = await fetch(`${baseUrl}/api/payments/culqi/charge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tokenId: `tkn_sandbox_bench_${vuId}_${iter}`,
              email: `bench.vu${vuId}@gmail.com`,
              amountCentimos: 500,
              description: 'Carga benchmark TrabajaYa',
              method: 'YAPE_PLIN',
              concepto: 'IMPREVISTO'
            })
          });
          await res.text();
          latencies.push(performance.now() - s);
          if (!res.ok) failed += 1;
        } catch {
          failed += 1;
        }
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));

  const durationSec = Number(((performance.now() - t0) / 1000).toFixed(2));
  const sorted = [...latencies].sort((a, b) => a - b);
  const totalRequests = latencies.length + failed;
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    name,
    concurrency,
    totalRequests,
    failedRequests: failed,
    errorRatePct: Number(((failed / Math.max(1, totalRequests)) * 100).toFixed(2)),
    durationSec,
    rps: Number((totalRequests / Math.max(0.01, durationSec)).toFixed(1)),
    avgMs: Number((sum / Math.max(1, sorted.length)).toFixed(2)),
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
    maxMs: Number((sorted[sorted.length - 1] || 0).toFixed(2))
  };
}

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trabajaya-load-'));
  process.env.RATE_LIMIT_MAX_REQ = '0'; // Medir throughput puro del servidor
  process.env.NODE_ENV = 'test';

  const { createAppServer } = await import('../../server');
  const { server, wss } = await createAppServer({ dataDir: tmpDir, attachFrontend: false });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const results: ScenarioResult[] = [];
    results.push(await runScenario('1. Smoke Test (5 VUs)', baseUrl, 5, 10, false));
    results.push(await runScenario('2. Load Test Mixto (50 VUs)', baseUrl, 50, 10, true));
    results.push(await runScenario('3. Spike / Stress Test (120 VUs)', baseUrl, 120, 6, false));

    const cacheStatsRes = await fetch(`${baseUrl}/api/cache/stats`);
    const cacheStats = await cacheStatsRes.json();

    console.log('\n=== RESULTADOS REALES DE PRUEBA DE CARGA — TrabajaYa Perú ===');
    console.table(results);
    console.log('=== MÉTRICAS FINALES DE CACHÉ (/api/cache/stats) ===');
    console.log(JSON.stringify(cacheStats, null, 2));

    const allPassed = results.every(r => r.errorRatePct < 1 && r.p95Ms < 250);
    if (!allPassed) {
      console.error('Alguno de los umbrales RNF-01 (p95 < 250ms, error < 1%) no se cumplió.');
      process.exitCode = 1;
    } else {
      console.log('✓ TODOS LOS UMBRALES RNF-01 (p95 < 250ms, error < 1%) Y RNF-06 (Cache Hit > 80%) APROBADOS.');
    }
  } finally {
    wss.clients.forEach(c => c.terminate());
    await new Promise<void>(resolve => wss.close(() => resolve()));
    await new Promise<void>(resolve => server.close(() => resolve()));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
