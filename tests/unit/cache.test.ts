import { describe, it, expect, vi, afterEach } from 'vitest';
import { LruTtlCache } from '../../server/cache';

describe('Capa de Caché — LruTtlCache (TTL, LRU, ETag e Invalidación por Prefijo)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('registra MISS inicial, luego HIT con ETag estable y calcula hitRatio', () => {
    const cache = new LruTtlCache(20);
    expect(cache.get('culqi:config')).toBeNull();

    const stored = cache.set('culqi:config', { mode: 'sandbox', currency: 'PEN' }, 60_000);
    expect(stored.etag).toMatch(/^W\/"[a-f0-9]{16}"$/);

    const hit = cache.get<{ mode: string }>('culqi:config');
    expect(hit?.value.mode).toBe('sandbox');
    expect(hit?.etag).toBe(stored.etag);

    const st = cache.stats();
    expect(st.hits).toBe(1);
    expect(st.misses).toBe(1);
    expect(st.hitRatio).toBe(50);
  });

  it('expira claves automáticamente al vencer su TTL', () => {
    vi.useFakeTimers();
    const cache = new LruTtlCache(20);
    cache.set('chat:conv:ADMIN', { count: 2 }, 5_000);

    vi.advanceTimersByTime(4_999);
    expect(cache.get('chat:conv:ADMIN')).not.toBeNull();

    vi.advanceTimersByTime(2);
    expect(cache.get('chat:conv:ADMIN')).toBeNull();
  });

  it('expulsa la entrada menos recientemente usada (LRU) al alcanzar maxEntries', () => {
    const cache = new LruTtlCache(10); // mínimo interno = 10
    for (let i = 1; i <= 10; i++) {
      cache.set(`k${i}`, i, 60_000);
    }
    // Acceder a k1 la convierte en la más reciente; k2 pasa a ser la más antigua
    expect(cache.get('k1')?.value).toBe(1);

    cache.set('k11', 11, 60_000);
    expect(cache.get('k2')).toBeNull();
    expect(cache.get('k1')?.value).toBe(1);
    expect(cache.stats().evictions).toBe(1);
  });

  it('invalida claves selectivamente por prefijo', () => {
    const cache = new LruTtlCache(20);
    cache.set('chat:conv:ADMIN', [1], 60_000);
    cache.set('chat:conv:USR-018', [2], 60_000);
    cache.set('culqi:config', { ok: true }, 60_000);

    const removed = cache.invalidateByPrefix('chat:conv:');
    expect(removed).toBe(2);
    expect(cache.get('chat:conv:ADMIN')).toBeNull();
    expect(cache.get('culqi:config')).not.toBeNull();
  });
});
