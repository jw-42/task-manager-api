import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/cloudflare-workers";

export const RateLimiterMiddleware = rateLimiter({
  windowMs: 1000,
  limit: 1,
  keyGenerator: async (ctx) => {
    const info = getConnInfo(ctx);
    const unique = `${info.remote.address}:${ctx.req.path}`;

    return unique;
  },
  standardHeaders: "draft-6"
})