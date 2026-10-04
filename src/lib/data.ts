import "server-only";
import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import { site } from "@/content/site";
import { faqs, guests, hotels, parties, photos, registryLinks, scheduleItems, settings, storyItems, weddingParty, type Settings } from "@/db/schema";

const defaultSettings: Settings = {
  id: 1,
  mealChoiceEnabled: false,
  adultMealOptions: [],
  kidMealOptions: [],
  rsvpDeadline: null,
  notifyEmails: [],
  heroPhotoIds: [],
  dayOfMode: "auto",
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
export const getStory = () => db.select().from(storyItems).orderBy(asc(storyItems.sortOrder));
export const getWeddingParty = () => db.select().from(weddingParty).orderBy(asc(weddingParty.sortOrder));

export const getGuestPhotos = () =>
  db.select().from(photos).where(and(eq(photos.kind, "guest"), eq(photos.hidden, false))).orderBy(desc(photos.createdAt));

// Notes guests chose to share, first names only.
export async function getWishes() {
  const rows = await db
    .select({ id: parties.id, message: parties.message, respondedAt: parties.respondedAt })
    .from(parties)
    .where(and(eq(parties.messagePublic, true), eq(parties.messageHidden, false), isNotNull(parties.message)))
    .orderBy(desc(parties.respondedAt));
  if (rows.length === 0) return [];
  const gs = await db.select().from(guests).where(inArray(guests.partyId, rows.map((r) => r.id)));
  return rows.map((r) => {
    const names = gs.filter((g) => g.partyId === r.id && g.firstName && (!g.isPlaceholder || g.attending)).map((g) => g.firstName);
    return { id: r.id, message: r.message!, from: names.length === 2 ? names.join(" & ") : names.join(", ") };
  });
}

// True on the wedding day (venue time), or when the admin forces it on.
export function isDayOf(s: Settings, now = new Date()) {
  if (s.dayOfMode === "on") return true;
  if (s.dayOfMode === "off") return false;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Detroit" }).format(now) === site.date;
}

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
