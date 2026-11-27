import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Smoke Test — TrabajaYa Perú (conectaoficios)
 * Verifica operatividad básica bajo carga mínima (5 VUs por 15 segundos).
 * Ejecución: k6 run -e BASE_URL=http://127.0.0.1:3000 tests/load/smoke.k6.js
 */
export const options = {
  vus: 5,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  const health = http.get(`${BASE_URL}/api/health`);
  check(health, {
    'health 200': r => r.status === 200,
    'health ok=true': r => r.json('ok') === true
  });

  const config = http.get(`${BASE_URL}/api/payments/culqi/config`);
  check(config, {
    'culqi config 200': r => r.status === 200,
    'currency PEN': r => r.json('currency') === 'PEN',
    'has X-Cache header': r => Boolean(r.headers['X-Cache'])
  });

  const tx = http.get(`${BASE_URL}/api/payments/culqi/transactions`);
  check(tx, { 'culqi transactions 200': r => r.status === 200 });

  const convs = http.get(`${BASE_URL}/api/chat/conversations?role=ADMIN`);
  check(convs, { 'chat conversations 200': r => r.status === 200 });

  const cacheStats = http.get(`${BASE_URL}/api/cache/stats`);
  check(cacheStats, { 'cache stats 200': r => r.status === 200 });

  sleep(0.5);
}
