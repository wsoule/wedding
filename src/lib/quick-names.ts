// Parses names typed the way you'd write them on an envelope, for quickly
// adding guests: "Jane & John Doe", "Mike, Anna & Lily Carter", "Riley Brooks + 1".

export type QuickPerson = { firstName: string; lastName: string; isPlaceholder: boolean };

const PLUS_ONE = /^(\+ ?1|plus ?one|guest|\+ ?guest|and guest)$/i;

// Capitalize words typed in all lowercase; leave anything with capitals alone
// so "McKayla" and "de la Cruz" survive.
const tidy = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w === w.toLowerCase() && !/^(de|la|van|von|der|del|da|di|le)$/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

export function parseNames(input: string, fallbackLast = ""): QuickPerson[] {
  const parts = input
    .replace(/\s*(?:\+\s*(?:1|one|guest)|\bplus\s+(?:1|one|guest))\b/gi, " & +1")
    .split(/\s*(?:&|,|\band\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);

  const people = parts.map((p): QuickPerson & { hasLast: boolean } => {
    if (PLUS_ONE.test(p)) return { firstName: "", lastName: "", isPlaceholder: true, hasLast: true };
    const [first, ...rest] = tidy(p).split(" ");
    return { firstName: first, lastName: rest.join(" "), isPlaceholder: false, hasLast: rest.length > 0 };
  });

  // A lone first name borrows the next last name in the list ("Jane & John
  // Doe"), or the fallback (the invitation's existing last name).
  return people.map((p, i) => {
    if (p.isPlaceholder || p.hasLast) return { firstName: p.firstName, lastName: p.lastName, isPlaceholder: p.isPlaceholder };
    const later = people.slice(i + 1).find((x) => !x.isPlaceholder && x.hasLast);
    return { firstName: p.firstName, lastName: later?.lastName ?? fallbackLast, isPlaceholder: false };
  });
}

// "Jane & John Doe", "Mike, Anna & Lily Carter", "Jordan Smith & Sam Lee",
// "Riley Brooks + guest".
export function invitationName(people: QuickPerson[]): string {
  const named = people.filter((p) => !p.isPlaceholder);
  const guests = people.length - named.length;
  const join = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} & ${xs[xs.length - 1]}`);
  const lasts = new Set(named.map((p) => p.lastName));
  let name =
    named.length > 1 && lasts.size === 1 && named[0].lastName
      ? `${join(named.map((p) => p.firstName))} ${named[0].lastName}`
      : join(named.map((p) => `${p.firstName} ${p.lastName}`.trim()));
  if (guests) name += guests === 1 ? " + guest" : ` + ${guests} guests`;
  return name.trim() || "Guest";
}
