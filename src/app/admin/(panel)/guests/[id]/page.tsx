import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { parties } from "@/db/schema";
import { getParty, getSettings } from "@/lib/data";
import { guestName } from "@/lib/names";
import { addGuest, deleteGuest, deleteParty, moveGuest, resetPartyRsvp, updateGuest, updateParty } from "../../../actions";
import { ConfirmButton } from "../../confirm-button";

export const metadata: Metadata = { title: "Edit invitation" };

export default async function PartyPage({ params }: PageProps<"/admin/guests/[id]">) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [party, settings, others] = await Promise.all([
    getParty(id),
    getSettings(),
    db.select({ id: parties.id, name: parties.name }).from(parties).orderBy(asc(parties.name)),
  ]);
  if (!party) notFound();
  const mealOptions = [...new Set([...settings.adultMealOptions, ...settings.kidMealOptions])];

  return (
    <>
      <Link href="/admin/guests" className="text-sm text-moss-soft">
        ← All guests
      </Link>

      <form action={updateParty} className="mt-3 space-y-2">
        <input type="hidden" name="id" value={party.id} />
        <label className="block">
          <span className="mb-1 block text-sm text-moss-soft">Party name</span>
          <input name="name" defaultValue={party.name} required className="field font-serif text-xl" />
        </label>
        <details className="rounded-2xl bg-card ring-1 ring-lichen">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Address, table and notes</summary>
          <div className="space-y-2 px-4 pb-4">
            <textarea name="address" defaultValue={party.address ?? ""} placeholder="Mailing address" className="field min-h-20" aria-label="Mailing address" />
            <input name="tableNumber" type="number" inputMode="numeric" defaultValue={party.tableNumber ?? ""} placeholder="Table number" className="field" aria-label="Table number" />
            <textarea name="notes" defaultValue={party.notes ?? ""} placeholder="Private notes (guests never see these)" className="field min-h-20" aria-label="Private notes" />
          </div>
        </details>
        <button className="btn btn-quiet w-full">Save party details</button>
      </form>

      <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-lichen">
        <p className="font-medium">{party.respondedAt ? `Replied ${party.respondedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/Detroit" })}` : "No reply yet"}</p>
        {party.message && <p className="mt-2 italic">“{party.message}”</p>}
        {party.song && <p className="mt-1 text-sm text-moss-soft">Song: {party.song}</p>}
      </div>

      <h2 className="mt-8 mb-3 text-xl">People</h2>
      <ul className="space-y-3">
        {party.guests.map((g) => (
          <li key={g.id} className="rounded-2xl bg-card ring-1 ring-lichen">
            <details>
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="font-medium">{g.isPlaceholder && !g.firstName ? "+1 (name not given)" : guestName(g)}</span>
                  {g.isChild && <span className="ml-2 text-xs text-moss-soft">child</span>}
                  {g.isPlaceholder && g.firstName && <span className="ml-2 text-xs text-moss-soft">+1</span>}
                </span>
                <span className={`text-sm ${g.attending ? "text-fern-dark" : "text-moss-soft"}`}>
                  {g.attending === null ? "No answer" : g.attending ? "Coming" : "Not coming"}
                </span>
              </summary>

              <form action={updateGuest} className="space-y-2 border-t border-lichen px-4 py-4">
                <input type="hidden" name="id" value={g.id} />
                <div className="grid grid-cols-2 gap-2">
                  <input name="firstName" defaultValue={g.firstName} placeholder="First name" className="field" aria-label="First name" />
                  <input name="lastName" defaultValue={g.lastName} placeholder="Last name" className="field" aria-label="Last name" />
                </div>
                <input name="nickname" defaultValue={g.nickname ?? ""} placeholder="Nickname they might search for (optional)" className="field" aria-label="Nickname" />
                <div className="flex flex-wrap gap-x-5 gap-y-2 py-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isChild" defaultChecked={g.isChild} className="h-5 w-5 accent-fern" /> Child
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isPlaceholder" defaultChecked={g.isPlaceholder} className="h-5 w-5 accent-fern" /> +1 slot (guest names them)
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-sm text-moss-soft">RSVP</span>
                  <select name="attending" defaultValue={g.attending === null ? "" : g.attending ? "yes" : "no"} className="field">
                    <option value="">No answer</option>
                    <option value="yes">Coming</option>
                    <option value="no">Not coming</option>
                  </select>
                </label>
                {(mealOptions.length > 0 || g.meal) && (
                  <select name="meal" defaultValue={g.meal ?? ""} className="field" aria-label="Meal">
                    <option value="">No meal chosen</option>
                    {[...new Set([...mealOptions, ...(g.meal ? [g.meal] : [])])].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                )}
                <input name="dietary" defaultValue={g.dietary ?? ""} placeholder="Dietary needs" className="field" aria-label="Dietary needs" />
                <button className="btn btn-primary w-full">Save</button>
              </form>

              <div className="flex flex-col gap-2 border-t border-lichen px-4 py-4 sm:flex-row">
                <form action={moveGuest} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="fromPartyId" value={party.id} />
                  <select name="toPartyId" defaultValue="" className="field min-h-11 py-2" aria-label="Move to another party">
                    <option value="" disabled>
                      Move to…
                    </option>
                    {others
                      .filter((o) => o.id !== party.id)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                  </select>
                  <button className="btn btn-quiet min-h-11 shrink-0 px-4">Move</button>
                </form>
                <form action={deleteGuest}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="partyId" value={party.id} />
                  <ConfirmButton message={`Remove ${guestName(g)} from the guest list?`} className="btn min-h-11 w-full px-4 text-foxglove-dark">
                    Remove
                  </ConfirmButton>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <section className="mt-4 rounded-2xl border-[1.5px] border-dashed border-sage p-4">
        <h3 className="font-medium">Add someone to this party</h3>
        <form action={addGuest} className="mt-2 space-y-2">
          <input type="hidden" name="partyId" value={party.id} />
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" required placeholder="First name" className="field" aria-label="First name" />
            <input name="lastName" placeholder="Last name" defaultValue={party.guests[0]?.lastName ?? ""} className="field" aria-label="Last name" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isChild" className="h-5 w-5 accent-fern" /> Child
          </label>
          <button className="btn btn-quiet w-full">Add person</button>
        </form>
        <form action={addGuest} className="mt-2">
          <input type="hidden" name="partyId" value={party.id} />
          <input type="hidden" name="placeholder" value="1" />
          <button className="btn btn-quiet w-full">Add a +1 slot</button>
        </form>
      </section>

      <div className="mt-10 flex flex-col gap-2 border-t border-lichen pt-6 sm:flex-row">
        {party.respondedAt && (
          <form action={resetPartyRsvp} className="flex-1">
            <input type="hidden" name="id" value={party.id} />
            <ConfirmButton message="Clear this party's answers so they can RSVP from scratch?" className="btn btn-quiet w-full">
              Clear their RSVP
            </ConfirmButton>
          </form>
        )}
        <form action={deleteParty} className="flex-1">
          <input type="hidden" name="id" value={party.id} />
          <ConfirmButton message={`Delete ${party.name} and everyone in it?`} className="btn w-full text-foxglove-dark ring-1 ring-foxglove/40">
            Delete invitation
          </ConfirmButton>
        </form>
      </div>
    </>
  );
}
