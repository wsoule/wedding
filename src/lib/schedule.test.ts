import { describe, expect, it } from "vitest";
import { nowAndNext, parseTime } from "./schedule";

describe("parseTime", () => {
  it("reads common formats", () => {
    expect(parseTime("4:30 PM")).toBe(16 * 60 + 30);
    expect(parseTime("10 am")).toBe(600);
    expect(parseTime("12:15 PM")).toBe(12 * 60 + 15);
    expect(parseTime("5:15")).toBe(17 * 60 + 15);
    expect(parseTime("Evening")).toBe(null);
  });
});

describe("nowAndNext", () => {
  const items = [{ time: "4:00 PM" }, { time: "4:30 PM" }, { time: "6:30 PM" }];
  it("finds the current and upcoming items", () => {
    expect(nowAndNext(items, 15 * 60)).toEqual({ now: null, next: items[0] });
    expect(nowAndNext(items, 16 * 60 + 40)).toEqual({ now: items[1], next: items[2] });
    expect(nowAndNext(items, 23 * 60)).toEqual({ now: items[2], next: null });
  });
});
