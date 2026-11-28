import type { NextFunction, Request, Response } from 'express';

export interface SecurityMiddlewareOptions {
  instanceId: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

/**
 * Capa de Presentación — Middleware de Cabeceras de Seguridad HTTP y Rate Limiting L7
 */
export function createSecurityAndRateLimitMiddleware(options: SecurityMiddlewareOptions) {
  const rateLimitCounters = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Instance-Id', options.instanceId);

    const isRateLimitedRoute =
      req.path.startsWith('/api/') &&
      req.path !== '/api/health' &&
      req.path !== '/api/openapi.json' &&
      options.rateLimitMax > 0;

    if (isRateLimitedRoute) {
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const entry = rateLimitCounters.get(key);
      if (!entry || entry.resetAt <= now) {
        rateLimitCounters.set(key, { count: 1, resetAt: now + options.rateLimitWindowMs });
        res.setHeader('X-RateLimit-Limit', String(options.rateLimitMax));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.rateLimitMax - 1)));
      } else {
        entry.count += 1;
        res.setHeader('X-RateLimit-Limit', String(options.rateLimitMax));
        res.setHeader(
          'X-RateLimit-Remaining',
          String(Math.max(0, options.rateLimitMax - entry.count))
        );
        if (entry.count > options.rateLimitMax) {
          res.status(429).json({
            ok: false,
            error: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en unos segundos.'
          });
          return;
        }
      }
    }

    next();
  };
}
