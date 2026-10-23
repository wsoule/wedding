"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, parties } from "@/db/schema";
import { clientIp } from "@/lib/client-ip";
import { getSettings, isDayOf } from "@/lib/data";
import { normalize } from "@/lib/names";
import { createLimiter } from "@/lib/rate-limit";

const lookups = createLimiter({ max: 60, windowMs: 15 * 60_000 });

// Find a table by full name (first or nickname, plus last name). Only works
// on the wedding day, and only ever returns the table number.
export async function findTable(fullName: string): Promise<{ found: false } | { found: true; table: number | null }> {
  if (!isDayOf(await getSettings())) return { found: false };
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
  return { found: true, table: party?.table ?? null };
}
