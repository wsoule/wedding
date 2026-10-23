import { describe, expect, it } from "vitest";
import { isRsvpOpen, validateRsvp } from "./rsvp";

const partyGuests = [
  { id: "a", isChild: false, isPlaceholder: false },
  { id: "k", isChild: true, isPlaceholder: false },
  { id: "p", isChild: false, isPlaceholder: true },
];
const noMeals = { mealChoiceEnabled: false, adultMealOptions: [], kidMealOptions: [] };
const meals = { mealChoiceEnabled: true, adultMealOptions: ["Chicken", "Veg"], kidMealOptions: ["Pasta"] };

const answer = (over: Record<string, unknown>[] = []) => ({
  guests: [
    { id: "a", attending: true, dietary: " none " },
    { id: "k", attending: true },
    { id: "p", attending: false },
  ].map((g, i) => ({ ...g, ...(over[i] ?? {}) })),
  message: "",
  song: "",
});

describe("validateRsvp", () => {
  it("accepts a complete answer and trims text", () => {
    const r = validateRsvp(partyGuests, answer(), noMeals);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.guests[0].dietary).toBe("none");
  });

  it("requires an answer for every guest in the party", () => {
    const input = answer();
    input.guests.pop();
    expect(validateRsvp(partyGuests, input, noMeals)).toMatchObject({ ok: false });
  });

  it("rejects guests from another party", () => {
    const r = validateRsvp(partyGuests, answer([{}, {}, { id: "zzz" }]), noMeals);
    expect(r.ok).toBe(false);
  });

  it("requires a name for an attending +1", () => {
    const r = validateRsvp(partyGuests, answer([{}, {}, { attending: true }]), noMeals);
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/name/i) });
    const ok = validateRsvp(partyGuests, answer([{}, {}, { attending: true, firstName: "Pat", lastName: "Q" }]), noMeals);
    expect(ok.ok).toBe(true);
  });

  it("ignores meals when meal choice is off", () => {
    const r = validateRsvp(partyGuests, answer([{ meal: "Steak" }]), noMeals);
    expect(r.ok && r.value.guests[0].meal).toBe(null);
  });

  it("requires a valid meal per attending guest when meals are on", () => {
    expect(validateRsvp(partyGuests, answer(), meals).ok).toBe(false);
    expect(validateRsvp(partyGuests, answer([{ meal: "Chicken" }, { meal: "Chicken" }]), meals).ok).toBe(false);
    expect(validateRsvp(partyGuests, answer([{ meal: "Chicken" }, { meal: "Pasta" }]), meals).ok).toBe(true);
  });
});

describe("isRsvpOpen", () => {
  it("is open with no deadline", () => {
    expect(isRsvpOpen(null, new Date("2030-01-01"))).toBe(true);
  });
  it("stays open through the end of the deadline day in Michigan", () => {
    expect(isRsvpOpen("2027-04-17", new Date("2027-04-17T23:30:00-04:00"))).toBe(true);
    expect(isRsvpOpen("2027-04-17", new Date("2027-04-18T00:30:00-04:00"))).toBe(false);
  });
});
