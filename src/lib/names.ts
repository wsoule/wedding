type NameFields = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  isPlaceholder: boolean;
};

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Every word the guest typed must be the start of one of the guest's name
// words, in order: "jordan sm" matches Jordan Smith, "mike le" matches
// Michael "Mike" Lee.
export function matchesQuery(guest: NameFields, query: string): boolean {
  if (guest.isPlaceholder) return false;
  const typed = normalize(query).split(" ").filter(Boolean);
  if (typed.length === 0) return false;

  const firsts = [guest.firstName, guest.nickname ?? ""].map(normalize).filter(Boolean);
  const last = normalize(guest.lastName);
  const candidates = firsts.flatMap((f) => [`${f} ${last}`.trim()]);
  if (last) candidates.push(last);

  return candidates.some((name) => {
    const words = name.split(" ");
    let i = 0;
    for (const t of typed) {
      while (i < words.length && !words[i].startsWith(t)) i++;
      if (i === words.length) return false;
      i++;
    }
    return true;
  });
}

export function guestName(guest: NameFields): string {
  const name = `${guest.firstName} ${guest.lastName}`.trim();
  return name || "Guest";
}

export function partyLabel(guests: NameFields[]): string {
  const named = guests.filter((g) => !g.isPlaceholder || g.firstName).map((g) => g.firstName);
  const extras = guests.filter((g) => g.isPlaceholder && !g.firstName).length;
  let label =
    named.length === 2 ? `${named[0]} & ${named[1]}` : named.join(", ");
  if (extras) label += extras === 1 ? " + guest" : ` + ${extras} guests`;
  return label.trim();
}
