import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { faqs, guests, hotels, parties, registryLinks, scheduleItems, settings, type Settings } from "@/db/schema";

const defaultSettings: Settings = {
  id: 1,
  mealChoiceEnabled: false,
  adultMealOptions: [],
  kidMealOptions: [],
  rsvpDeadline: null,
  notifyEmails: [],
  updatedAt: new Date(0),
};

export async function getSettings(): Promise<Settings> {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return row ?? defaultSettings;
}

export const getSchedule = () => db.select().from(scheduleItems).orderBy(asc(scheduleItems.sortOrder));
export const getHotels = () => db.select().from(hotels).orderBy(asc(hotels.sortOrder));
export const getRegistry = () => db.select().from(registryLinks).orderBy(asc(registryLinks.sortOrder));
export const getFaqs = () => db.select().from(faqs).orderBy(asc(faqs.sortOrder));

export async function getParty(id: string) {
  const [party] = await db.select().from(parties).where(eq(parties.id, id));
  if (!party) return null;
  const members = await db
    .select()
    .from(guests)
    .where(eq(guests.partyId, id))
    .orderBy(asc(guests.sortOrder), asc(guests.createdAt));
  return { ...party, guests: members };
}

export async function getPartiesWithGuests(ids?: string[]) {
  const ps = await (ids
    ? db.select().from(parties).where(inArray(parties.id, ids))
    : db.select().from(parties)
  ).orderBy(asc(parties.name));
  if (ps.length === 0) return [];
  const gs = await db
    .select()
    .from(guests)
    .where(inArray(guests.partyId, ps.map((p) => p.id)))
    .orderBy(asc(guests.sortOrder), asc(guests.createdAt));
  return ps.map((p) => ({ ...p, guests: gs.filter((g) => g.partyId === p.id) }));
}

export type PartyWithGuests = NonNullable<Awaited<ReturnType<typeof getParty>>>;
