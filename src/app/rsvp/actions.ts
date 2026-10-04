"use server";

import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db/client";
import { guests, parties } from "@/db/schema";
import { getParty, getSettings } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { guestName, matchesQuery, normalize, partyLabel } from "@/lib/names";
import { isRsvpOpen, validateRsvp } from "@/lib/rsvp";

export type PartyMatch = { id: string; label: string; names: string };

export async function searchParties(query: string): Promise<PartyMatch[]> {
  if (normalize(query).replace(/ /g, "").length < 3) return [];
  const [all, ps] = await Promise.all([db.select().from(guests), db.select({ id: parties.id, name: parties.name }).from(parties)]);
  const partyIds = [...new Set(all.filter((g) => matchesQuery(g, query)).map((g) => g.partyId))].slice(0, 6);
  return partyIds.map((id) => {
    const members = all.filter((g) => g.partyId === id).sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      id,
      label: ps.find((p) => p.id === id)?.name || partyLabel(members),
      names: members.filter((g) => !g.isPlaceholder || g.firstName).map(guestName).join(", "),
    };
  });
}

export async function loadParty(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [party, settings] = await Promise.all([getParty(id), getSettings()]);
  if (!party) return null;
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

export type LoadedParty = NonNullable<Awaited<ReturnType<typeof loadParty>>>;

export async function submitRsvp(partyId: string, input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const [party, settings] = await Promise.all([getParty(partyId), getSettings()]);
  if (!party) return { ok: false, error: "We couldn't find your invitation. Search for your name again." };
  if (!isRsvpOpen(settings.rsvpDeadline)) return { ok: false, error: "RSVPs are closed. Reach out to Wyat or Jaden directly." };

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
