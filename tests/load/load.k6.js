import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * k6 Load Test — TrabajaYa Perú (Alineado a RNF-01 y RNF-06)
 * Rampa realista: 0 -> 50 -> 100 VUs con tráfico mixto (85% lecturas / 15% escrituras).
 * Nota: Iniciar servidor con RATE_LIMIT_MAX_REQ=0 para medir capacidad pura del backend.
 */
const cacheHitRate = new Rate('trabajaya_cache_hit_rate');
const culqiChargeLatency = new Trend('trabajaya_culqi_charge_ms');

export const options = {
  stages: [
    { duration: '20s', target: 30 },  // Calentamiento
    { duration: '40s', target: 100 }, // Carga sostenida nacional
    { duration: '20s', target: 0 }    // Enfriamiento
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],              // < 1% errores (RNF-04)
    http_req_duration: ['p(95)<250', 'p(99)<500'], // RNF-01
    trabajaya_cache_hit_rate: ['rate>0.80']      // RNF-06 (>= 80% cache hit)
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  group('Lecturas Frecuentes (Cache-Aside)', () => {
    const cfg = http.get(`${BASE_URL}/api/payments/culqi/config`);
    check(cfg, { 'config 200': r => r.status === 200 });
    cacheHitRate.add(cfg.headers['X-Cache'] === 'HIT');

    const tx = http.get(`${BASE_URL}/api/payments/culqi/transactions`);
    check(tx, { 'transactions 200': r => r.status === 200 });
    cacheHitRate.add(tx.headers['X-Cache'] === 'HIT');

    const chat = http.get(`${BASE_URL}/api/chat/conversations?role=USUARIO&userId=USR-018`);
    check(chat, { 'chat list 200': r => r.status === 200 });
    cacheHitRate.add(chat.headers['X-Cache'] === 'HIT');
  });

  // ~10% de las iteraciones simulan un pago Sandbox Culqi (invalida culqi:transactions)
  if (Math.random() < 0.1) {
    group('Escritura Transaccional (Culqi Sandbox)', () => {
      const payload = JSON.stringify({
        tokenId: `tkn_sandbox_k6_${__VU}_${__ITER}`,
        email: `load.vu${__VU}@gmail.com`,
        amountCentimos: 500,
        description: 'Imprevisto prueba de carga k6',
        method: 'YAPE_PLIN',
        concepto: 'IMPREVISTO',
        referenceId: `IMP-K6-${__VU}-${__ITER}`
      });
      const res = http.post(`${BASE_URL}/api/payments/culqi/charge`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      culqiChargeLatency.add(res.timings.duration);
      check(res, {
        'culqi charge 200': r => r.status === 200,
        'status PAID': r => r.json('transaction.status') === 'PAID'
      });
    });
  }

  sleep(0.3);
}
