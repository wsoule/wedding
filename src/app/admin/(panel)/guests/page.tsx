import type { Metadata } from "next";
import Link from "next/link";
import { isNotNull } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db/client";
import { weddingParty } from "@/db/schema";
import { getPartiesWithGuests } from "@/lib/data";
import { createParty } from "../../actions";
import { GuestBoard, type BoardParty } from "./board";

export const metadata: Metadata = { title: "Guests" };

export default async function GuestsPage() {
  await connection();
  const [all, roles] = await Promise.all([
    getPartiesWithGuests(),
    db.select({ guestId: weddingParty.guestId, role: weddingParty.role }).from(weddingParty).where(isNotNull(weddingParty.guestId)),
  ]);
  const roleOf = new Map(roles.map((r) => [r.guestId, r.role]));
  const parties: BoardParty[] = all.map((p) => ({
    id: p.id,
    name: p.name,
    side: p.side,
    replied: !!p.respondedAt,
    guests: p.guests.map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      nickname: g.nickname,
      isChild: g.isChild,
      isPlaceholder: g.isPlaceholder,
      attending: g.attending,
      role: roleOf.get(g.id) ?? null,
    })),
  }));

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-[1.75rem]">Guests</h1>
        <Link href="/admin/guests/import" className="text-sm font-semibold text-fern-dark underline underline-offset-4">
          Import from a sheet
        </Link>
      </div>
      <p className="mt-1 text-sm text-moss-soft">Tap a name to move, rename or give them a role. Tap an invitation&rsquo;s name to rename it.</p>

      <div className="mt-3">
        <GuestBoard parties={parties} />
      </div>

      <section className="mt-10 rounded-2xl bg-card p-4 ring-1 ring-lichen">
        <h2 className="text-xl">Add an invitation</h2>
        <p className="text-sm text-moss-soft">Start with a name for the party and the first guest. Add more people on the next screen.</p>
        <form action={createParty} className="mt-3 space-y-2">
          <input name="name" required placeholder="Party name, e.g. The Carter family" className="field" aria-label="Party name" />
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" placeholder="First name" className="field" aria-label="First guest's first name" />
            <input name="lastName" placeholder="Last name" className="field" aria-label="First guest's last name" />
          </div>
          <button className="btn btn-primary w-full">Add invitation</button>
        </form>
      </section>
    </>
  );
}
