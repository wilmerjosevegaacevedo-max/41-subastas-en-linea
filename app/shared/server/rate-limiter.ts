const windowMs = 10000;
const maxRequests = 10;
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, now: Date): boolean {
  const nowMs = now.getTime();
  const timestamps = hits.get(key) ?? [];
  const validTimestamps = timestamps.filter((t) => {
    return nowMs - t < windowMs;
  });

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(nowMs);
  hits.set(key, validTimestamps);
  return true;
}

export function resetRateLimiter(): void {
  hits.clear();
}
