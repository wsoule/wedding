import type { Metadata } from "next";
import Link from "next/link";
import { isNotNull } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db/client";
import { weddingParty } from "@/db/schema";
import { getPartiesWithGuests } from "@/lib/data";
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
      <p className="mt-1 text-sm text-moss-soft">Tap a name to move, rename or give them a role. Tap an invitation&rsquo;s name to rename it, or + Add to add someone to it.</p>

      <div className="mt-3">
        <GuestBoard parties={parties} />
      </div>

    </>
  );
}
