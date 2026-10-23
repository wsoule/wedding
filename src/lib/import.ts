// Turns a guest-list spreadsheet (CSV file, or cells pasted from Google
// Sheets) into parties of guests.

export type ImportGuest = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  isChild: boolean;
  isPlaceholder: boolean;
  role?: string | null;
};
export type ImportParty = { name: string; address: string | null; side?: string | null; guests: ImportGuest[] };

export function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const sep = firstLine.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === sep) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const aliases: Record<string, string[]> = {
  party: ["party", "household", "group", "invite", "invitation", "family"],
  name: ["name", "full name", "guest", "guest name"],
  first: ["first", "first name", "firstname", "given name"],
  last: ["last", "last name", "lastname", "surname", "family name"],
  nickname: ["nickname", "nick", "goes by"],
  child: ["child", "kid", "is child", "children", "minor"],
  plusOne: ["plus one", "plus 1", "+1", "plusone", "guest allowed"],
  address: ["address", "mailing address"],
  side: ["side", "invited by", "invited by...", "guest of"],
  role: ["role", "wedding party", "part"],
};

const truthy = (s: string) => /^(y|yes|true|1|x|✓|✔)$/i.test(s.trim());
const isPlusOneName = (s: string) => /^(\+ ?1|plus ?one|guest|tbd|\+ ?guest)$/i.test(s.trim());

export function parseGuestList(text: string): { parties: ImportParty[]; warnings: string[] } {
  const rows = parseCsv(text.trim()).filter((r) => r.some((c) => c.trim()));
  if (rows.length === 0) return { parties: [], warnings: ["The sheet is empty."] };

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/[_-]+/g, " "));
  const col = Object.fromEntries(
    Object.entries(aliases).map(([key, names]) => [key, header.findIndex((h) => names.includes(h))]),
  ) as Record<keyof typeof aliases, number>;

  if (col.first < 0 && col.name < 0) {
    return { parties: [], warnings: ["Couldn't find a First name (or Name) column in the header row."] };
  }

  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const byName = new Map<string, ImportParty>();
  const order: ImportParty[] = [];

  for (const r of rows.slice(1)) {
    let first = get(r, col.first);
    let last = get(r, col.last);
    if (col.first < 0) {
      const [f, ...rest] = get(r, col.name).split(/\s+/);
      first = f ?? "";
      last = rest.join(" ");
    }
    const placeholderRow = isPlusOneName(first) && !last;
    if (!first && !last) continue;

    const partyName = get(r, col.party) || `${first} ${last}`.trim();
    let party = byName.get(partyName.toLowerCase());
    if (!party) {
      party = { name: partyName, address: null, side: null, guests: [] };
      byName.set(partyName.toLowerCase(), party);
      order.push(party);
    }
    party.address ??= get(r, col.address) || null;
    party.side ??= get(r, col.side) || null;

    if (placeholderRow) {
      party.guests.push({ firstName: "", lastName: "", nickname: null, isChild: false, isPlaceholder: true });
      continue;
    }
    party.guests.push({
      firstName: first,
      lastName: last,
      nickname: get(r, col.nickname) || null,
      isChild: truthy(get(r, col.child)),
      isPlaceholder: false,
      ...(get(r, col.role) ? { role: get(r, col.role) } : {}),
    });
    if (truthy(get(r, col.plusOne))) {
      party.guests.push({ firstName: "", lastName: "", nickname: null, isChild: false, isPlaceholder: true });
    }
  }

  return { parties: order, warnings: [] };
}
