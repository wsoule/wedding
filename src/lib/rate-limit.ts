// In-memory failure counter. One Railway instance runs the app, so memory is
// enough; a restart just forgets old failures.
export function createLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const failures = new Map<string, number[]>();
  const recent = (key: string, now: number) => (failures.get(key) ?? []).filter((t) => now - t < windowMs);

  return {
    blocked(key: string, now = Date.now()) {
      return recent(key, now).length >= max;
    },
    fail(key: string, now = Date.now()) {
      failures.set(key, [...recent(key, now), now]);
      if (failures.size > 10_000) {
        for (const k of failures.keys()) if (recent(k, now).length === 0) failures.delete(k);
      }
    },
    reset(key: string) {
      failures.delete(key);
    },
  };
}
