import { describe, expect, it } from "vitest";
import { invitationName, parseNames } from "./quick-names";

const people = (s: string, fallbackLast?: string) =>
  parseNames(s, fallbackLast).map((p) => (p.isPlaceholder ? "+1" : `${p.firstName}|${p.lastName}`));

describe("parseNames", () => {
  it("shares one last name across a couple", () => {
    expect(people("Jane & John Doe")).toEqual(["Jane|Doe", "John|Doe"]);
    expect(people("Jane and John Doe")).toEqual(["Jane|Doe", "John|Doe"]);
  });

  it("keeps different last names", () => {
    expect(people("Jordan Smith & Sam Lee")).toEqual(["Jordan|Smith", "Sam|Lee"]);
  });

  it("handles a comma-separated family", () => {
    expect(people("Mike, Anna, Lily & Ben Carter")).toEqual(["Mike|Carter", "Anna|Carter", "Lily|Carter", "Ben|Carter"]);
  });

  it("turns +1 or guest into a +1 slot", () => {
    expect(people("Riley Brooks + 1")).toEqual(["Riley|Brooks", "+1"]);
    expect(people("Riley Brooks & guest")).toEqual(["Riley|Brooks", "+1"]);
    expect(people("Riley Brooks plus one")).toEqual(["Riley|Brooks", "+1"]);
  });

  it("keeps multi-word last names", () => {
    expect(people("Ana de la Cruz")).toEqual(["Ana|de la Cruz"]);
  });

  it("uses a fallback last name for a lone first name", () => {
    expect(people("Mia", "Wekwert")).toEqual(["Mia|Wekwert"]);
    expect(people("Akram")).toEqual(["Akram|"]);
  });

  it("tidies spacing and capitalizes lowercase input", () => {
    expect(people("  jane   doe ")).toEqual(["Jane|Doe"]);
    expect(people("mckayla flynn")).toEqual(["Mckayla|Flynn"]);
    expect(people("McKayla Flynn")).toEqual(["McKayla|Flynn"]);
  });

  it("returns nothing for empty input", () => {
    expect(people("  ")).toEqual([]);
  });
});

describe("invitationName", () => {
  it("names couples and families the way you'd address them", () => {
    expect(invitationName(parseNames("Jane & John Doe"))).toBe("Jane & John Doe");
    expect(invitationName(parseNames("Mike, Anna & Lily Carter"))).toBe("Mike, Anna & Lily Carter");
    expect(invitationName(parseNames("Jordan Smith & Sam Lee"))).toBe("Jordan Smith & Sam Lee");
    expect(invitationName(parseNames("Riley Brooks + 1"))).toBe("Riley Brooks + guest");
    expect(invitationName(parseNames("Akram"))).toBe("Akram");
  });
});
