import { describe, expect, it } from "vitest";
import { buildIcs } from "./ics";

const event = {
  uid: "wedding@example.com",
  start: "2027-05-22T16:30:00-04:00",
  end: "2027-05-22T23:00:00-04:00",
  title: "Jaden & Wyat's wedding",
  location: "Little Flower Barn, 565 N. Coldwater Road, Lake Isabella, MI 48893",
  description: "Details and RSVP: https://example.com",
  url: "https://example.com",
  now: new Date("2026-10-26T12:00:00Z"),
};

describe("buildIcs", () => {
  const ics = buildIcs(event);
  const lines = ics.split("\r\n");

  it("is a calendar with one event and CRLF line endings", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);
  });

  it("writes times in UTC", () => {
    expect(lines).toContain("DTSTART:20270522T203000Z");
    expect(lines).toContain("DTEND:20270523T030000Z");
    expect(lines).toContain("DTSTAMP:20261026T120000Z");
  });

  it("escapes commas, semicolons and backslashes in text", () => {
    expect(ics.replace(/\r\n /g, "")).toContain("LOCATION:Little Flower Barn\\, 565 N. Coldwater Road\\, Lake Isabella\\, MI 48893");
  });

  it("folds lines longer than 75 bytes", () => {
    expect(lines.every((l) => Buffer.byteLength(l) <= 75)).toBe(true);
    expect(lines.some((l) => l.startsWith(" "))).toBe(true);
  });

  it("includes a reminder the day before", () => {
    expect(ics).toContain("BEGIN:VALARM");
    expect(lines).toContain("TRIGGER:-P1D");
  });
});
