import crypto from 'crypto';
import type { CacheEntry, CacheStats, CacheStore } from '../../domain/ports';

export type { CacheEntry, CacheStats, CacheStore };

/**
 * Implementación O(1) de Caché en Memoria con política LRU (Least Recently Used)
 * y expiración por TTL + generación automática de ETag HTTP (RFC 9110).
 * Implementa el puerto CacheStore (SOLID LSP/DIP) intercambiable por RedisCacheStore.
 */
export class LruTtlCache implements CacheStore {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries: number;
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private invalidations = 0;
  private evictions = 0;

  constructor(maxEntries = 500) {
    this.maxEntries = Math.max(10, maxEntries);
  }

  private computeEtag(value: unknown): string {
    const hash = crypto
      .createHash('sha1')
      .update(JSON.stringify(value))
      .digest('hex')
      .slice(0, 16);
    return `W/"${hash}"`;
  }

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return null;
    }

    // Refrescar orden LRU moviendo la clave al final del Map
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits += 1;
    return entry as CacheEntry<T>;
  }

  set<T>(key: string, value: T, ttlMs: number): CacheEntry<T> {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
        this.evictions += 1;
      }
    }

    const entry: CacheEntry<T> = {
      value,
      etag: this.computeEtag(value),
      expiresAt: Date.now() + Math.max(1, ttlMs)
    };
    this.store.set(key, entry);
    this.sets += 1;
    return entry;
  }

  del(key: string): boolean {
    const removed = this.store.delete(key);
    if (removed) this.invalidations += 1;
    return removed;
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count += 1;
      }
    }
    this.invalidations += count;
    return count;
  }

  clear(): void {
    this.store.clear();
  }

  stats(): CacheStats {
    const totalLookups = this.hits + this.misses;
    return {
      size: this.store.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      invalidations: this.invalidations,
      evictions: this.evictions,
      hitRatio: totalLookups > 0 ? Number(((this.hits / totalLookups) * 100).toFixed(2)) : 0
    };
  }
}
