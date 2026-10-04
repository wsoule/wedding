"use server";

// Every export here can be called directly by anyone, so nothing returns a
// party's details without the last-name check, and nothing saves without the
// signed pass that check hands out.

import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db/client";
import { guests, parties } from "@/db/schema";
import { clientIp } from "@/lib/client-ip";
import { getParty, getSettings } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { guestName, lastNameMatches, matchesFirstName, needsLastName, normalize, shortLabel } from "@/lib/names";
import { createLimiter } from "@/lib/rate-limit";
import { isRsvpOpen, validateRsvp } from "@/lib/rsvp";
import { createPartyPass, verifyPartyPass } from "@/lib/session";

export type PartyMatch = { id: string; label: string; needsLastName: boolean };

export async function searchParties(query: string): Promise<PartyMatch[]> {
  if (normalize(query).replace(/ /g, "").length < 2) return [];
  const all = await db.select().from(guests);
  const partyIds = [...new Set(all.filter((g) => matchesFirstName(g, query)).map((g) => g.partyId))].slice(0, 8);
  return partyIds.map((id) => {
    const members = all.filter((g) => g.partyId === id).sort((a, b) => a.sortOrder - b.sortOrder);
    return { id, label: shortLabel(members), needsLastName: needsLastName(members) };
  });
}

// 15 wrong last names per IP per 15 minutes, and 10 per invitation per hour so
// switching IPs doesn't help. There's deliberately no site-wide cap: one
// person could then lock every guest out of RSVPing.
const unlockLimiter = createLimiter({ max: 15, windowMs: 15 * 60_000 });
const partyLimiter = createLimiter({ max: 10, windowMs: 60 * 60_000 });
const isId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function unlockParty(
  id: string,
  lastName: string,
): Promise<{ ok: true; party: LoadedParty; pass: string } | { ok: false; error: string }> {
  const ip = await clientIp();
  if (unlockLimiter.blocked(ip) || partyLimiter.blocked(id)) {
    return { ok: false, error: "Too many tries. Wait a little while and try again, or ask Jaden or Wyat." };
  }
  const party = isId(id) ? await getParty(id) : null;
  if (!party) return { ok: false, error: "We couldn't open that invitation. Search for your name again." };
  if (needsLastName(party.guests) && !lastNameMatches(party.guests, lastName)) {
    unlockLimiter.fail(ip);
    partyLimiter.fail(party.id);
    return { ok: false, error: "That last name doesn't match this invitation. Use the last name on your invitation." };
  }
  return { ok: true, party: await toLoaded(party), pass: createPartyPass(party.id) };
}

async function toLoaded(party: NonNullable<Awaited<ReturnType<typeof getParty>>>) {
  const settings = await getSettings();
  return {
    id: party.id,
    message: party.message,
    song: party.song,
    respondedAt: party.respondedAt?.toISOString() ?? null,
    guests: party.guests.map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      isChild: g.isChild,
      isPlaceholder: g.isPlaceholder,
      attending: g.attending,
      meal: g.meal,
      dietary: g.dietary,
    })),
    meals: {
      enabled: settings.mealChoiceEnabled,
      adult: settings.adultMealOptions,
      kid: settings.kidMealOptions,
    },
    open: isRsvpOpen(settings.rsvpDeadline),
  };
}

export type LoadedParty = Awaited<ReturnType<typeof toLoaded>>;

export async function submitRsvp(
  partyId: string,
  pass: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isId(partyId) || !verifyPartyPass(partyId, pass)) {
    return { ok: false, error: "Your session expired. Search for your name again." };
  }
  const [party, settings] = await Promise.all([getParty(partyId), getSettings()]);
  if (!party) return { ok: false, error: "We couldn't find your invitation. Search for your name again." };
  if (!isRsvpOpen(settings.rsvpDeadline)) return { ok: false, error: "RSVPs are closed. Reach out to Jaden or Wyat directly." };

  const result = validateRsvp(party.guests, input, settings);
  if (!result.ok) return result;
  const { value } = result;
  const wasUpdate = party.respondedAt !== null;
  const now = new Date();

  await db.transaction(async (tx) => {
    for (const a of value.guests) {
      const guest = party.guests.find((g) => g.id === a.id)!;
      await tx
        .update(guests)
        .set({
          attending: a.attending,
          meal: a.meal,
          dietary: a.attending ? a.dietary : null,
          ...(guest.isPlaceholder ? { firstName: a.firstName ?? "", lastName: a.lastName ?? "" } : {}),
          updatedAt: now,
        })
        .where(eq(guests.id, a.id));
    }
    await tx
      .update(parties)
      .set({ message: value.message, song: value.song, respondedAt: now, updatedAt: now })
      .where(eq(parties.id, partyId));
  });

  after(async () => {
    const fresh = await getParty(partyId);
    if (!fresh) return;
    const lines = fresh.guests.map((g) => {
      const status = g.attending ? "coming" : "not coming";
      const extra = [g.meal, g.dietary && `dietary: ${g.dietary}`].filter(Boolean).join("; ");
      return `- ${guestName(g)}${g.isChild ? " (child)" : ""}: ${status}${extra ? ` (${extra})` : ""}`;
    });
    if (fresh.message) lines.push("", `Note: ${fresh.message}`);
    if (fresh.song) lines.push(`Song request: ${fresh.song}`);
    const coming = fresh.guests.filter((g) => g.attending).length;
    await sendEmail({
      to: settings.notifyEmails,
      subject: `${wasUpdate ? "Updated RSVP" : "New RSVP"}: ${fresh.name} (${coming} coming)`,
      text: lines.join("\n"),
    });
  });

  return { ok: true };
}
