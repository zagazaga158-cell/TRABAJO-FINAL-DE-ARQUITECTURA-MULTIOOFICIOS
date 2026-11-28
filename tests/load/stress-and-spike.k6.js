import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Stress & Spike Test Progresivo hasta 2,000 VUs — TrabajaYa Perú
 * Evalúa punto de saturación progresiva hasta 2,000 usuarios virtuales concurrentes
 * y recuperación ante picos repentinos (emergencias nacionales).
 */
export const options = {
  stages: [
    { duration: '15s', target: 100 },   // Tráfico base
    { duration: '20s', target: 500 },   // Escalado x5
    { duration: '25s', target: 1000 },  // Alta carga
    { duration: '30s', target: 2000 },  // Pico máximo (2,000 VUs)
    { duration: '20s', target: 200 },   // Recuperación
    { duration: '10s', target: 0 }      // Cierre
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.02']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  const res = http.batch([
    ['GET', `${BASE_URL}/api/health`],
    ['GET', `${BASE_URL}/api/services`],
    ['GET', `${BASE_URL}/api/payments/culqi/config`],
    ['GET', `${BASE_URL}/api/chat/conversations?role=ADMIN`]
  ]);

  check(res[0], { 'batch health 200': r => r.status === 200 });
  check(res[1], { 'batch services 200': r => r.status === 200 });
  check(res[2], { 'batch config 200': r => r.status === 200 });
  check(res[3], { 'batch convs 200': r => r.status === 200 });

  sleep(0.3);
}
