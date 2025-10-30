/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based solution
 */

const requestCounts = new Map();
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 30;
const WINDOW_MS = 60000; // 1 minute

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.windowStart > WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }
}, WINDOW_MS);

export function rateLimiter(req, res, next) {
  // Skip rate limiting for health checks
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, {
      count: 1,
      windowStart: now
    });
    return next();
  }

  const data = requestCounts.get(ip);

  // Reset window if expired
  if (now - data.windowStart > WINDOW_MS) {
    data.count = 1;
    data.windowStart = now;
    return next();
  }

  // Check if limit exceeded
  if (data.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per minute.`,
      retryAfter: Math.ceil((WINDOW_MS - (now - data.windowStart)) / 1000)
    });
  }

  data.count++;
  next();
}
