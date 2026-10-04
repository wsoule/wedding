import { beforeAll, describe, expect, it } from "vitest";
import { createPartyPass, createToken, passwordMatches, verifyPartyPass, verifyToken } from "./session";

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

describe("token separation", () => {
  it("never accepts a party pass as an admin session or the reverse", () => {
    const pass = createPartyPass("x");
    expect(verifyToken(pass)).toBe(false);
    expect(verifyPartyPass("x", createToken())).toBe(false);
  });
});

describe("party passes", () => {
  it("only work for the party they were made for", () => {
    const pass = createPartyPass("party-a");
    expect(verifyPartyPass("party-a", pass)).toBe(true);
    expect(verifyPartyPass("party-b", pass)).toBe(false);
    expect(verifyPartyPass("party-a", createPartyPass("party-a", 0))).toBe(false);
    expect(verifyPartyPass("party-a", undefined)).toBe(false);
  });
});
