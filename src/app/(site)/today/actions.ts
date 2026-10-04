"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, parties } from "@/db/schema";
import { clientIp } from "@/lib/client-ip";
import { normalize } from "@/lib/names";
import { createLimiter } from "@/lib/rate-limit";

const lookups = createLimiter({ max: 60, windowMs: 15 * 60_000 });

// Find a table by full name (first or nickname, plus last name).
export async function findTable(fullName: string): Promise<{ found: false } | { found: true; names: string; table: number | null }> {
  const ip = await clientIp();
  if (lookups.blocked(ip)) return { found: false };
  lookups.hit(ip);
  const q = normalize(fullName);
  if (q.split(" ").length < 2) return { found: false };
  const all = await db.select().from(guests);
  const match = all.find(
    (g) => !g.isPlaceholder || g.firstName ? [g.firstName, g.nickname].filter(Boolean).some((f) => normalize(`${f} ${g.lastName}`) === q) : false,
  );
  if (!match) return { found: false };
  const [party] = await db.select({ table: parties.tableNumber }).from(parties).where(eq(parties.id, match.partyId));
  const names = all.filter((g) => g.partyId === match.partyId && g.attending !== false && g.firstName).map((g) => g.firstName);
  return { found: true, names: names.length === 2 ? names.join(" & ") : names.join(", "), table: party?.table ?? null };
}
