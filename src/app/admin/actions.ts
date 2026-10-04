"use server";

import { and, asc, eq, gt, lt, desc, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { faqs, guests, hotels, parties, registryLinks, scheduleItems, settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { parseGuestList, type ImportParty } from "@/lib/import";
import { createLimiter } from "@/lib/rate-limit";
import { SESSION_COOKIE, SESSION_DAYS, createToken, passwordMatches } from "@/lib/session";
import { contentConfig, contentKinds, type ContentKind } from "./content-config";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const refresh = () => revalidatePath("/", "layout");

// ── Session ────────────────────────────────────────────────────────────────

// 10 wrong passwords per IP, and 50 overall, per 15 minutes.
const loginLimiter = createLimiter({ max: 10, windowMs: 15 * 60_000 });
const globalLoginLimiter = createLimiter({ max: 50, windowMs: 15 * 60_000 });

export async function login(_: string | null, form: FormData): Promise<string | null> {
  // The last X-Forwarded-For entry is the one Railway's proxy appended;
  // earlier entries come from the client and can be made up.
  const ip = (await headers()).get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
  if (loginLimiter.blocked(ip) || globalLoginLimiter.blocked("all")) {
    return "Too many wrong passwords. Try again in 15 minutes.";
  }
  if (!passwordMatches(str(form, "password"))) {
    loginLimiter.fail(ip);
    globalLoginLimiter.fail("all");
    return "That password isn't right.";
  }
  loginLimiter.reset(ip);
  (await cookies()).set(SESSION_COOKIE, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ── Parties ────────────────────────────────────────────────────────────────

export async function createParty(form: FormData) {
  await requireAdmin();
  const name = str(form, "name");
  if (!name) return;
  const [party] = await db.insert(parties).values({ name }).returning({ id: parties.id });
  const first = str(form, "firstName");
  if (first) await db.insert(guests).values({ partyId: party.id, firstName: first, lastName: str(form, "lastName") });
  refresh();
  redirect(`/admin/guests/${party.id}`);
}

export async function updateParty(form: FormData) {
  await requireAdmin();
  const table = str(form, "tableNumber");
  await db
    .update(parties)
    .set({
      name: str(form, "name") || "Unnamed party",
      address: opt(form, "address"),
      tableNumber: table ? Number.parseInt(table, 10) || null : null,
      notes: opt(form, "notes"),
      updatedAt: new Date(),
    })
    .where(eq(parties.id, str(form, "id")));
  refresh();
}

export async function deleteParty(form: FormData) {
  await requireAdmin();
  await db.delete(parties).where(eq(parties.id, str(form, "id")));
  refresh();
  redirect("/admin/guests");
}

export async function resetPartyRsvp(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  await db.transaction(async (tx) => {
    await tx.update(guests).set({ attending: null, meal: null, dietary: null }).where(eq(guests.partyId, id));
    await tx.update(parties).set({ respondedAt: null, message: null, song: null }).where(eq(parties.id, id));
  });
  refresh();
}

// ── Guests ─────────────────────────────────────────────────────────────────

export async function addGuest(form: FormData) {
  await requireAdmin();
  const partyId = str(form, "partyId");
  const placeholder = str(form, "placeholder") === "1";
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${guests.sortOrder}), -1)::int` })
    .from(guests)
    .where(eq(guests.partyId, partyId));
  await db.insert(guests).values({
    partyId,
    firstName: placeholder ? "" : str(form, "firstName"),
    lastName: placeholder ? "" : str(form, "lastName"),
    isChild: form.get("isChild") === "on",
    isPlaceholder: placeholder,
    sortOrder: max + 1,
  });
  refresh();
}

export async function updateGuest(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const attending = str(form, "attending");
  const [guest] = await db
    .update(guests)
    .set({
      firstName: str(form, "firstName"),
      lastName: str(form, "lastName"),
      nickname: opt(form, "nickname"),
      isChild: form.get("isChild") === "on",
      isPlaceholder: form.get("isPlaceholder") === "on",
      attending: attending === "yes" ? true : attending === "no" ? false : null,
      meal: opt(form, "meal"),
      dietary: opt(form, "dietary"),
      updatedAt: new Date(),
    })
    .where(eq(guests.id, id))
    .returning({ partyId: guests.partyId });
  if (guest) await syncResponded(guest.partyId);
  refresh();
}

export async function moveGuest(form: FormData) {
  await requireAdmin();
  const to = str(form, "toPartyId");
  if (!to) return;
  const [moved] = await db
    .update(guests)
    .set({ partyId: to, sortOrder: 999 })
    .where(eq(guests.id, str(form, "id")))
    .returning({ id: guests.id });
  if (moved) {
    await syncResponded(to);
    await syncResponded(str(form, "fromPartyId"));
  }
  refresh();
}

export async function deleteGuest(form: FormData) {
  await requireAdmin();
  await db.delete(guests).where(eq(guests.id, str(form, "id")));
  await syncResponded(str(form, "partyId"));
  refresh();
}

// A party counts as replied once every guest has an answer.
async function syncResponded(partyId: string) {
  if (!partyId) return;
  const members = await db.select({ attending: guests.attending }).from(guests).where(eq(guests.partyId, partyId));
  const complete = members.length > 0 && members.every((m) => m.attending !== null);
  const [party] = await db.select({ respondedAt: parties.respondedAt }).from(parties).where(eq(parties.id, partyId));
  if (!party) return;
  if (complete && !party.respondedAt) await db.update(parties).set({ respondedAt: new Date() }).where(eq(parties.id, partyId));
  if (!complete && party.respondedAt) await db.update(parties).set({ respondedAt: null }).where(eq(parties.id, partyId));
}

// ── Import ─────────────────────────────────────────────────────────────────

export async function previewImport(text: string) {
  await requireAdmin();
  const { parties: parsed, warnings } = parseGuestList(text);
  const existing = new Set((await db.select({ name: parties.name }).from(parties)).map((p) => p.name.toLowerCase()));
  return {
    warnings,
    parties: parsed.map((p) => ({ ...p, exists: existing.has(p.name.toLowerCase()) })),
  };
}

export async function runImport(text: string): Promise<{ created: number; skipped: number }> {
  await requireAdmin();
  const { parties: parsed } = parseGuestList(text);
  const existing = new Set((await db.select({ name: parties.name }).from(parties)).map((p) => p.name.toLowerCase()));
  const fresh: ImportParty[] = parsed.filter((p) => !existing.has(p.name.toLowerCase()));

  await db.transaction(async (tx) => {
    for (const p of fresh) {
      const [row] = await tx.insert(parties).values({ name: p.name, address: p.address }).returning({ id: parties.id });
      if (p.guests.length) await tx.insert(guests).values(p.guests.map((g, i) => ({ ...g, partyId: row.id, sortOrder: i })));
    }
  });
  refresh();
  return { created: fresh.length, skipped: parsed.length - fresh.length };
}

// ── Settings ───────────────────────────────────────────────────────────────

const lines = (s: string) => s.split(/[\n,]/).map((l) => l.trim()).filter(Boolean);

export async function saveSettings(form: FormData) {
  await requireAdmin();
  const values = {
    mealChoiceEnabled: form.get("mealChoiceEnabled") === "on",
    adultMealOptions: lines(str(form, "adultMealOptions")),
    kidMealOptions: lines(str(form, "kidMealOptions")),
    rsvpDeadline: opt(form, "rsvpDeadline"),
    notifyEmails: lines(str(form, "notifyEmails")).filter((e) => e.includes("@")),
    updatedAt: new Date(),
  };
  await db.insert(settings).values({ id: 1, ...values }).onConflictDoUpdate({ target: settings.id, set: values });
  refresh();
}

// ── Content lists ──────────────────────────────────────────────────────────

const tables = { schedule: scheduleItems, hotels, registry: registryLinks, faqs } as const;

function kindOf(form: FormData): ContentKind {
  const kind = str(form, "kind") as ContentKind;
  if (!contentKinds.includes(kind)) throw new Error("Unknown content type");
  return kind;
}

export async function saveContent(form: FormData) {
  await requireAdmin();
  const kind = kindOf(form);
  const table = tables[kind];
  const values: Record<string, string | null> = {};
  for (const f of contentConfig[kind].fields) {
    const v = opt(form, f.name);
    if (f.required && !v) return;
    values[f.name] = v;
  }
  const id = str(form, "id");
  if (id) {
    await db.update(table).set(values).where(eq(table.id, id));
  } else {
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${table.sortOrder}), -1)::int` }).from(table);
    await db.insert(table).values({ ...values, sortOrder: max + 1 } as never);
  }
  refresh();
}

export async function deleteContent(form: FormData) {
  await requireAdmin();
  const table = tables[kindOf(form)];
  await db.delete(table).where(eq(table.id, str(form, "id")));
  refresh();
}

export async function moveContent(form: FormData) {
  await requireAdmin();
  const table = tables[kindOf(form)];
  const [item] = await db.select().from(table).where(eq(table.id, str(form, "id")));
  if (!item) return;
  const up = str(form, "dir") === "up";
  const [neighbor] = await db
    .select()
    .from(table)
    .where(up ? lt(table.sortOrder, item.sortOrder) : gt(table.sortOrder, item.sortOrder))
    .orderBy(up ? desc(table.sortOrder) : asc(table.sortOrder))
    .limit(1);
  if (!neighbor) return;
  await db.transaction(async (tx) => {
    await tx.update(table).set({ sortOrder: neighbor.sortOrder }).where(eq(table.id, item.id));
    await tx.update(table).set({ sortOrder: item.sortOrder }).where(and(eq(table.id, neighbor.id)));
  });
  refresh();
}
