import { describe, expect, it } from "vitest";
import { guestName, matchesQuery, normalize, partyLabel } from "./names";

const g = (firstName: string, lastName = "", extra: Partial<Parameters<typeof matchesQuery>[0]> = {}) => ({
  firstName,
  lastName,
  nickname: null,
  isPlaceholder: false,
  ...extra,
});

describe("normalize", () => {
  it("lowercases, strips accents and punctuation", () => {
    expect(normalize("  Zoë O'Brien-Smith ")).toBe("zoe obrien smith");
  });
});

describe("matchesQuery", () => {
  it("matches the start of first or last name", () => {
    expect(matchesQuery(g("Jordan", "Smith"), "jor")).toBe(true);
    expect(matchesQuery(g("Jordan", "Smith"), "smi")).toBe(true);
    expect(matchesQuery(g("Jordan", "Smith"), "dan")).toBe(false);
  });

  it("matches a full name typed with a space", () => {
    expect(matchesQuery(g("Jordan", "Smith"), "jordan sm")).toBe(true);
    expect(matchesQuery(g("Jordan", "Smith"), "jordan x")).toBe(false);
  });

  it("matches nicknames", () => {
    expect(matchesQuery(g("Michael", "Lee", { nickname: "Mike" }), "mike")).toBe(true);
    expect(matchesQuery(g("Michael", "Lee", { nickname: "Mike" }), "mike le")).toBe(true);
  });

  it("ignores accents and apostrophes", () => {
    expect(matchesQuery(g("Zoë", "O'Brien"), "zoe obr")).toBe(true);
  });

  it("never matches placeholders", () => {
    expect(matchesQuery(g("", "", { isPlaceholder: true }), "gue")).toBe(false);
  });
});

describe("partyLabel", () => {
  it("labels unnamed placeholders as guests", () => {
    expect(
      partyLabel([g("Jordan", "Smith"), g("Sam", "Lee"), g("", "", { isPlaceholder: true })]),
    ).toBe("Jordan & Sam + guest");
  });

  it("uses & for two named guests", () => {
    expect(partyLabel([g("Jordan"), g("Sam")])).toBe("Jordan & Sam");
  });
});

describe("guestName", () => {
  it("falls back for placeholders", () => {
    expect(guestName(g("", "", { isPlaceholder: true }))).toBe("Guest");
    expect(guestName(g("Jordan", "Smith"))).toBe("Jordan Smith");
  });
});
