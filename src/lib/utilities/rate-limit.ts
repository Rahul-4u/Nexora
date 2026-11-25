interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const next: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { allowed: true, remaining: maxRequests - 1, resetAt: next.resetAt };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - current.count),
    resetAt: current.resetAt,
  };
}
