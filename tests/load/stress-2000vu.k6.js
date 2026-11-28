import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * k6 Stress & Scalability Test Progresivo hasta 2,000 Usuarios Virtuales (Sprint 2 — EQ-01 / EQ-03)
 * Simulación progresiva: 0 -> 100 -> 500 -> 1,000 -> 1,500 -> 2,000 VUs -> 500 -> 0 VUs.
 *
 * Ejecución oficial con k6:
 *   RATE_LIMIT_MAX_REQ=0 npm run start
 *   k6 run -e BASE_URL=http://127.0.0.1:3000 tests/load/stress-2000vu.k6.js
 */
const cacheHitRate = new Rate('trabajaya_cache_hit_rate');
const catalogLatency = new Trend('trabajaya_catalog_ms');
const quoteLatency = new Trend('trabajaya_escrow_quote_ms');

export const options = {
  stages: [
    { duration: '20s', target: 100 },   // Etapa 1: Tráfico base (100 VUs)
    { duration: '30s', target: 500 },   // Etapa 2: Carga media nacional (500 VUs)
    { duration: '30s', target: 1000 },  // Etapa 3: Alta demanda simultánea (1,000 VUs)
    { duration: '30s', target: 1500 },  // Etapa 4: Estrés severo (1,500 VUs)
    { duration: '40s', target: 2000 },  // Etapa 5: Pico máximo Sprint 2 (2,000 VUs)
    { duration: '20s', target: 500 },   // Etapa 6: Recuperación progresiva
    { duration: '15s', target: 0 }      // Etapa 7: Enfriamiento limpio
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],                // < 2% fallos bajo pico de 2,000 VUs
    http_req_duration: ['p(95)<500', 'p(99)<1200'], // Latencia controlada bajo estrés máximo
    trabajaya_cache_hit_rate: ['rate>0.80']        // >= 80% Cache Hit Ratio (EQ-01)
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  group('Consultas Cacheadas (Catálogo + Culqi + Chat)', () => {
    const res = http.batch([
      ['GET', `${BASE_URL}/api/health`],
      ['GET', `${BASE_URL}/api/services?oficio=GASFITERIA`],
      ['GET', `${BASE_URL}/api/payments/culqi/config`],
      ['GET', `${BASE_URL}/api/chat/conversations?role=USUARIO&userId=USR-018`]
    ]);

    check(res[0], { 'health 200': r => r.status === 200 });
    check(res[1], { 'services 200': r => r.status === 200 });
    check(res[2], { 'culqi config 200': r => r.status === 200 });
    check(res[3], { 'chat convs 200': r => r.status === 200 });

    catalogLatency.add(res[1].timings.duration);
    cacheHitRate.add(res[1].headers['X-Cache'] === 'HIT');
    cacheHitRate.add(res[2].headers['X-Cache'] === 'HIT');
    cacheHitRate.add(res[3].headers['X-Cache'] === 'HIT');
  });

  // 15% de los usuarios virtuales ejecutan cotización Escrow (POST CPU/Dominio)
  if (Math.random() < 0.15) {
    group('Cotización Escrow (Dominio Puro)', () => {
      const qRes = http.post(
        `${BASE_URL}/api/escrow/quote`,
        JSON.stringify({ precioBase: 100, cantidadTurnos: 2 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      quoteLatency.add(qRes.timings.duration);
      check(qRes, {
        'quote 200': r => r.status === 200,
        'quote total ok': r => r.json('quote.totalConIgv') === 259.6
      });
    });
  }

  sleep(0.5);
}
