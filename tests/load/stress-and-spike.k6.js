import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Stress & Spike Test — TrabajaYa Perú
 * Evalúa punto de saturación (hasta 300 VUs) y recuperación ante picos repentinos
 * (ej. campaña nacional o tormenta que dispara emergencias de gasfitería/electricidad).
 */
export const options = {
  stages: [
    { duration: '15s', target: 50 },   // Tráfico base
    { duration: '15s', target: 300 },  // Pico repentino (Spike x6)
    { duration: '30s', target: 300 },  // Estrés sostenido
    { duration: '20s', target: 50 },   // Recuperación
    { duration: '10s', target: 0 }     // Cierre
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
    ['GET', `${BASE_URL}/api/payments/culqi/config`],
    ['GET', `${BASE_URL}/api/chat/conversations?role=ADMIN`]
  ]);

  check(res[0], { 'batch health 200': r => r.status === 200 });
  check(res[1], { 'batch config 200': r => r.status === 200 });
  check(res[2], { 'batch convs 200': r => r.status === 200 });

  sleep(0.2);
}
