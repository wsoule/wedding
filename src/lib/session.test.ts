import { beforeAll, describe, expect, it } from "vitest";
import { createToken, passwordMatches, verifyToken } from "./session";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-that-is-long-enough";
  process.env.ADMIN_PASSWORD = "garden";
});

describe("session tokens", () => {
  it("verifies its own tokens", () => {
    expect(verifyToken(createToken())).toBe(true);
  });
  it("rejects tampered and expired tokens", () => {
    const t = createToken();
    const [exp, mac] = t.split(".");
    expect(verifyToken(`${Number(exp) + 1000}.${mac}`)).toBe(false);
    expect(verifyToken(createToken(0), Date.now())).toBe(false);
    expect(verifyToken("garbage")).toBe(false);
    expect(verifyToken(undefined)).toBe(false);
  });
});

describe("passwordMatches", () => {
  it("checks the admin password", () => {
    expect(passwordMatches("garden")).toBe(true);
    expect(passwordMatches("Garden")).toBe(false);
    expect(passwordMatches("")).toBe(false);
  });
});
