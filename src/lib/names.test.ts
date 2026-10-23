import { describe, expect, it } from "vitest";
import { guestName, lastNameMatches, matchesFirstName, matchesQuery, needsLastName, normalize, partyLabel, shortLabel } from "./names";

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

describe("matchesFirstName", () => {
  it("matches the start of a first name or nickname, never the last name", () => {
    expect(matchesFirstName(g("Jordan", "Smith"), "jor")).toBe(true);
    expect(matchesFirstName(g("Michael", "Lee", { nickname: "Mike" }), "mike")).toBe(true);
    expect(matchesFirstName(g("Jordan", "Smith"), "smith")).toBe(false);
  });

  it("accepts a full name typed in but ignores what comes after the first name", () => {
    expect(matchesFirstName(g("Jordan", "Smith"), "Jordan Smith")).toBe(true);
    expect(matchesFirstName(g("Jordan", "Smith"), "Jordan Zzz")).toBe(true);
    expect(matchesFirstName(g("Jordan", "Smith"), "Jordanx")).toBe(false);
  });

  it("handles multi-word first names and nicknames", () => {
    expect(matchesFirstName(g("Mary Ann", "Lee"), "mary a")).toBe(true);
    expect(matchesFirstName(g("Whitney", "Calderon", { nickname: "Aunt Whitney" }), "aunt wh")).toBe(true);
  });
});

describe("lastNameMatches", () => {
  const party = [g("Kat", "Lipscomb"), g("Austin", "O'Neil"), g("", "", { isPlaceholder: true })];
  it("accepts any named guest's last name, ignoring case, accents and punctuation", () => {
    expect(lastNameMatches(party, " lipscomb ")).toBe(true);
    expect(lastNameMatches(party, "oneil")).toBe(true);
    expect(lastNameMatches(party, "lips")).toBe(false);
    expect(lastNameMatches(party, "")).toBe(false);
  });
});

describe("needsLastName", () => {
  it("is false when nobody in the party has a last name on file", () => {
    expect(needsLastName([g("Akram", "")])).toBe(false);
    expect(needsLastName([g("Akram", ""), g("Vadim", "Ivanov")])).toBe(true);
  });
});

describe("shortLabel", () => {
  it("shows first names with a last initial", () => {
    expect(shortLabel([g("Emily", "Dodde")])).toBe("Emily D.");
    expect(shortLabel([g("Jordan", "Smith"), g("Sam", "Lee"), g("", "", { isPlaceholder: true })])).toBe("Jordan S. & Sam L. + guest");
    expect(shortLabel([g("Akram", "")])).toBe("Akram");
  });
});
