import { describe, expect, it } from "vitest";
import { createLimiter } from "./rate-limit";

describe("createLimiter", () => {
  it("blocks after the limit within the window, then resets", () => {
    const limiter = createLimiter({ max: 3, windowMs: 1000 });
    expect(limiter.blocked("ip", 0)).toBe(false);
    limiter.fail("ip", 0);
    limiter.fail("ip", 10);
    limiter.fail("ip", 20);
    expect(limiter.blocked("ip", 30)).toBe(true);
    expect(limiter.blocked("other", 30)).toBe(false);
    expect(limiter.blocked("ip", 1021)).toBe(false);
  });

  it("clears a key on success", () => {
    const limiter = createLimiter({ max: 1, windowMs: 1000 });
    limiter.fail("ip", 0);
    limiter.reset("ip");
    expect(limiter.blocked("ip", 1)).toBe(false);
  });
});

describe("createLimiter eviction", () => {
  it("drops only expired keys when the map gets large", () => {
    const limiter = createLimiter({ max: 1, windowMs: 1000 });
    limiter.fail("keep", 5000);
    for (let i = 0; i < 10_001; i++) limiter.fail(`old${i}`, 0);
    limiter.fail("trigger", 5000);
    expect(limiter.blocked("keep", 5001)).toBe(true);
  });
});
