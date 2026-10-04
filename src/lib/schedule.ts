// "4:30 PM" -> minutes after midnight, or null if the text isn't a time.
export function parseTime(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3]?.toLowerCase() === "pm") h += 12;
  if (!m[3] && Number(m[1]) < 12 && Number(m[1]) < 8) h += 12; // "5:15" on a wedding day means evening
  return h * 60 + Number(m[2] ?? 0);
}

// Which item is happening now and which is next, given minutes after midnight.
export function nowAndNext<T extends { time: string }>(items: T[], minutes: number) {
  const timed = items
    .map((item) => ({ item, at: parseTime(item.time) }))
    .filter((x): x is { item: T; at: number } => x.at !== null)
    .sort((a, b) => a.at - b.at);
  let now: T | null = null;
  let next: T | null = null;
  for (const t of timed) {
    if (t.at <= minutes) now = t.item;
    else if (!next) next = t.item;
  }
  return { now, next };
}
