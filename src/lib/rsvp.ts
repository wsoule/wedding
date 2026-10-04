import { z } from "zod";

const text = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((s) => s?.trim() || null);

export const rsvpInput = z.object({
  guests: z.array(
    z.object({
      id: z.string(),
      attending: z.boolean(),
      firstName: text(60),
      lastName: text(60),
      meal: text(80),
      dietary: text(300),
    }),
  ),
  message: text(1000),
  messagePublic: z.boolean().optional().default(false),
  song: text(200),
});

export type RsvpInput = z.input<typeof rsvpInput>;
type PartyGuest = { id: string; isChild: boolean; isPlaceholder: boolean };
type MealSettings = { mealChoiceEnabled: boolean; adultMealOptions: string[]; kidMealOptions: string[] };

export type ValidRsvp = z.output<typeof rsvpInput>;
type Result = { ok: true; value: ValidRsvp } | { ok: false; error: string };

export function validateRsvp(partyGuests: PartyGuest[], raw: unknown, meals: MealSettings): Result {
  const parsed = rsvpInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Something in the form was invalid. Check your answers and try again." };
  const value = parsed.data;

  const known = new Map(partyGuests.map((g) => [g.id, g]));
  const answered = new Set(value.guests.map((g) => g.id));
  if (answered.size !== value.guests.length || answered.size !== known.size || ![...answered].every((id) => known.has(id))) {
    return { ok: false, error: "Answer for everyone in your party, then send again." };
  }

  for (const answer of value.guests) {
    const guest = known.get(answer.id)!;
    if (guest.isPlaceholder && answer.attending && !answer.firstName) {
      return { ok: false, error: "Add your guest's name, or mark them as not coming." };
    }
    if (!guest.isPlaceholder) {
      // Only +1 names come from the form.
      answer.firstName = null;
      answer.lastName = null;
    }
    if (!meals.mealChoiceEnabled || !answer.attending) {
      answer.meal = null;
      continue;
    }
    const options = guest.isChild ? meals.kidMealOptions : meals.adultMealOptions;
    if (options.length > 0 && (!answer.meal || !options.includes(answer.meal))) {
      return { ok: false, error: "Choose a meal for everyone who's coming." };
    }
  }

  return { ok: true, value };
}

// The deadline is a calendar date; RSVPs stay open until midnight at the
// venue (America/Detroit) at the end of that day.
export function isRsvpOpen(deadline: string | null, now = new Date()): boolean {
  if (!deadline) return true;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Detroit" }).format(now);
  return today <= deadline;
}
