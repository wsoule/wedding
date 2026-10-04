import { describe, expect, it } from "vitest";
import { parseCsv, parseGuestList } from "./import";

describe("parseCsv", () => {
  it("handles quotes, commas, escaped quotes and CRLF", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });

  it("reads tab-separated text pasted from Google Sheets", () => {
    expect(parseCsv("a\tb\nc\td")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("parseGuestList", () => {
  const csv = [
    "Household,First Name,Last Name,Nickname,Kid,Plus One,Address",
    "The Carters,Michael,Carter,Mike,,,1 Elm St",
    "The Carters,Anna,Carter,,,,",
    "The Carters,Lily,Carter,,yes,,",
    ",Riley,Brooks,,,y,",
    "Jordan & Sam,Jordan,Smith,,,,",
    "Jordan & Sam,+1,,,,,",
    ",,,,,,",
  ].join("\n");

  it("groups rows into parties", () => {
    const { parties, warnings } = parseGuestList(csv);
    expect(warnings).toEqual([]);
    expect(parties.map((p) => p.name)).toEqual(["The Carters", "Riley Brooks", "Jordan & Sam"]);
  });

  it("reads nicknames, kids and the first address in a party", () => {
    const carters = parseGuestList(csv).parties[0];
    expect(carters.address).toBe("1 Elm St");
    expect(carters.guests).toEqual([
      { firstName: "Michael", lastName: "Carter", nickname: "Mike", isChild: false, isPlaceholder: false },
      { firstName: "Anna", lastName: "Carter", nickname: null, isChild: false, isPlaceholder: false },
      { firstName: "Lily", lastName: "Carter", nickname: null, isChild: true, isPlaceholder: false },
    ]);
  });

  it("adds a +1 slot from the plus-one column or a +1 row", () => {
    const { parties } = parseGuestList(csv);
    expect(parties[1].guests.map((g) => g.isPlaceholder)).toEqual([false, true]);
    expect(parties[2].guests.map((g) => g.isPlaceholder)).toEqual([false, true]);
    expect(parties[2].guests[1].firstName).toBe("");
  });

  it("warns when the name columns are missing", () => {
    expect(parseGuestList("foo,bar\n1,2").warnings[0]).toMatch(/first name/i);
  });

  it("reads side and wedding party roles", () => {
    const { parties } = parseGuestList("Party,First name,Last name,Side,Role\nA,Kat,Lipscomb,Jaden,Bridesmaid\nA,Austin,Lee,Jaden,");
    expect(parties[0].side).toBe("Jaden");
    expect(parties[0].guests[0].role).toBe("Bridesmaid");
    expect(parties[0].guests[1].role).toBeUndefined();
  });

  it("accepts a single Name column", () => {
    const { parties } = parseGuestList("Name,Party\nJordan Smith,A\nSam Lee,A");
    expect(parties[0].guests.map((g) => [g.firstName, g.lastName])).toEqual([
      ["Jordan", "Smith"],
      ["Sam", "Lee"],
    ]);
  });
});
