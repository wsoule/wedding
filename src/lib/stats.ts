import { guestName } from "./names";

type G = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  isChild: boolean;
  isPlaceholder: boolean;
  attending: boolean | null;
  meal: string | null;
  dietary: string | null;
};
type P = { guests: G[]; respondedAt: Date | null; song: string | null };

export function summarize(parties: P[]) {
  const all = parties.flatMap((p) => p.guests);
  // An unanswered +1 isn't a person yet; count them only once they say yes.
  const invited = all.filter((g) => !g.isPlaceholder || g.attending);
  const coming = all.filter((g) => g.attending);
  const meals: Record<string, number> = {};
  for (const g of coming) if (g.meal) meals[g.meal] = (meals[g.meal] ?? 0) + 1;

  return {
    parties: parties.length,
    invited: invited.length,
    coming: coming.length,
    comingAdults: coming.filter((g) => !g.isChild).length,
    comingKids: coming.filter((g) => g.isChild).length,
    declined: all.filter((g) => g.attending === false && !g.isPlaceholder).length,
    awaitingGuests: all.filter((g) => g.attending === null && !g.isPlaceholder).length,
    awaitingParties: parties.filter((p) => !p.respondedAt).length,
    meals,
    comingWithoutMeal: coming.filter((g) => !g.meal).length,
    dietary: coming.filter((g) => g.dietary).map((g) => ({ id: g.id, name: guestName(g), dietary: g.dietary! })),
    songs: parties.map((p) => p.song).filter((s): s is string => !!s),
  };
}
