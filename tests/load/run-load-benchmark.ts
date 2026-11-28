import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { performance } from 'perf_hooks';

/**
 * Ejecutor Local Progresivo hasta 2,000 Usuarios Virtuales Concurrentes
 * Espejo ejecutable de tests/load/stress-2000vu.k6.js sobre el servidor real (server.ts).
 * Mide métricas REALES de latencia (avg, p50, p95, p99, max), RPS, errores, memoria y Cache Hit Ratio,
 * y guarda evidencia auditable en docs/evidencias/load-2000vu-results.json.
 */

interface ScenarioResult {
  name: string;
  virtualUsers: number;
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
  rssMb: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[idx].toFixed(2));
}

function httpRequest(
  agent: http.Agent,
  port: number,
  reqPath: string,
  method: 'GET' | 'POST' = 'GET',
  body?: string
): Promise<{ statusCode: number; durationMs: number }> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: reqPath,
        method,
        agent,
        headers: body
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body)
            }
          : undefined
      },
      res => {
        res.resume();
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            durationMs: performance.now() - start
          });
        });
      }
    );
    req.setTimeout(15_000, () => {
      req.destroy(new Error('timeout'));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runProgressiveStage(
  name: string,
  port: number,
  virtualUsers: number,
  iterationsPerVu: number,
  includeWrites: boolean
): Promise<ScenarioResult> {
  // Pool keep-alive para simular 2,000 VUs concurrentes sin agotar puertos efímeros de Windows
  const agent = new http.Agent({
    keepAlive: true,
    maxSockets: Math.min(256, virtualUsers),
    maxFreeSockets: 64
  });

  const latencies: number[] = [];
  let failed = 0;
  const t0 = performance.now();

  const quoteBody = JSON.stringify({ precioBase: 100, cantidadTurnos: 2 });

  const worker = async (vuId: number) => {
    const endpoints = [
      '/api/health',
      '/api/services?oficio=GASFITERIA',
      '/api/payments/culqi/config',
      '/api/chat/conversations?role=ADMIN'
    ];

    for (let iter = 0; iter < iterationsPerVu; iter++) {
      const target = endpoints[(vuId + iter) % endpoints.length];
      try {
        const res = await httpRequest(agent, port, target, 'GET');
        latencies.push(res.durationMs);
        if (res.statusCode < 200 || res.statusCode >= 400) failed += 1;
      } catch {
        failed += 1;
      }

      if (includeWrites && vuId % 10 === 0 && iter === 0) {
        try {
          const res = await httpRequest(agent, port, '/api/escrow/quote', 'POST', quoteBody);
          latencies.push(res.durationMs);
          if (res.statusCode !== 200) failed += 1;
        } catch {
          failed += 1;
        }
      }
    }
  };

  await Promise.all(Array.from({ length: virtualUsers }, (_, i) => worker(i + 1)));
  agent.destroy();

  const durationSec = Number(((performance.now() - t0) / 1000).toFixed(2));
  const sorted = [...latencies].sort((a, b) => a - b);
  const totalRequests = latencies.length + failed;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const rssMb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));

  return {
    name,
    virtualUsers,
    totalRequests,
    failedRequests: failed,
    errorRatePct: Number(((failed / Math.max(1, totalRequests)) * 100).toFixed(2)),
    durationSec,
    rps: Number((totalRequests / Math.max(0.01, durationSec)).toFixed(1)),
    avgMs: Number((sum / Math.max(1, sorted.length)).toFixed(2)),
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
    maxMs: Number((sorted[sorted.length - 1] || 0).toFixed(2)),
    rssMb
  };
}

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trabajaya-load-2000-'));
  process.env.RATE_LIMIT_MAX_REQ = '0';
  process.env.NODE_ENV = 'test';

  const { createAppServer } = await import('../../server');
  const { server, wss } = await createAppServer({ dataDir: tmpDir, attachFrontend: false });
  server.maxConnections = 4096;
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;

  try {
    const results: ScenarioResult[] = [];
    // Rampa progresiva real hasta 2,000 usuarios virtuales concurrentes
    results.push(await runProgressiveStage('1. Smoke (10 VUs)', port, 10, 10, true));
    results.push(await runProgressiveStage('2. Carga Base (100 VUs)', port, 100, 8, true));
    results.push(await runProgressiveStage('3. Carga Media (500 VUs)', port, 500, 6, true));
    results.push(await runProgressiveStage('4. Alta Demanda (1,000 VUs)', port, 1000, 5, true));
    results.push(await runProgressiveStage('5. Estrés Severo (1,500 VUs)', port, 1500, 4, true));
    results.push(await runProgressiveStage('6. Pico Máximo (2,000 VUs)', port, 2000, 4, true));

    const cacheStatsRes = await fetch(`http://127.0.0.1:${port}/api/cache/stats`);
    const cacheStats = await cacheStatsRes.json();

    console.log('\n=== RESULTADOS REALES — SIMULACIÓN PROGRESIVA HASTA 2,000 VUs (TrabajaYa Perú) ===');
    console.table(results);
    console.log('=== MÉTRICAS FINALES DE CACHÉ (/api/cache/stats) ===');
    console.log(JSON.stringify(cacheStats, null, 2));

    const evidenceDir = path.resolve(process.cwd(), 'docs', 'evidencias');
    fs.mkdirSync(evidenceDir, { recursive: true });
    const evidenceFile = path.join(evidenceDir, 'load-2000vu-results.json');
    fs.writeFileSync(
      evidenceFile,
      JSON.stringify(
        {
          executedAt: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform,
          maxVirtualUsers: 2000,
          stages: results,
          cacheStats
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`Evidencia guardada en: ${evidenceFile}`);

    const peakPassed = results.every(r => r.errorRatePct < 2 && r.p95Ms < 500);
    if (!peakPassed) {
      console.error('Alguno de los umbrales de calidad (error < 2%, p95 < 500ms) no se cumplió.');
      process.exitCode = 1;
    } else {
      console.log('✓ TODOS LOS ESCENARIOS PROGRESIVOS (10 -> 2,000 VUs) APROBADOS.');
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
