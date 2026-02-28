import { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../lib/redis';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = options;
  const windowSec = Math.ceil(windowMs / 1000);

  return async function rateLimitMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const ip = request.ip;
    const userId = (request as any).userId || 'anon';
    const key = `${keyPrefix}:${userId}:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      reply.header('X-RateLimit-Limit', maxRequests);
      reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

      const ttl = await redis.ttl(key);
      reply.header('X-RateLimit-Reset', Date.now() + ttl * 1000);

      if (current > maxRequests) {
        return reply.status(429).send({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
          retryAfter: ttl,
        });
      }
    } catch (error) {
      request.log.warn(error, 'Rate limiter error — allowing request');
    }
  };
}

// Pre-configured limiters
export const apiLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
  keyPrefix: 'rl:api',
});

export const authLimiter = createRateLimiter({
  windowMs: 900_000,       // 15 min
  maxRequests: 10,
  keyPrefix: 'rl:auth',
});

export const scanLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  keyPrefix: 'rl:scan',
});

export const webhookLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 200,
  keyPrefix: 'rl:webhook',
});
