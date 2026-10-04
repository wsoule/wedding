import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { Print } from "@/components/print";
import type { WeddingPartyMember } from "@/db/schema";
import { getWeddingParty } from "@/lib/data";
import { getPhotosById, photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Wedding party" };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default async function PartyPage() {
  await connection();
  const people = await getWeddingParty();
  const photos = await getPhotosById(people.map((p) => p.photoId));
  const sides = ["Jaden", "Wyat"].map((side) => ({ side, people: people.filter((p) => p.side === side) }));
  const unsided = people.filter((p) => p.side !== "Jaden" && p.side !== "Wyat");

  const grid = (list: WeddingPartyMember[]) => (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8">
      {list.map((p, i) => {
        const photo = p.photoId ? photos.get(p.photoId) : undefined;
        const tilt = [-2, 1.5, 1, -1.5][i % 4];
        return (
          <li key={p.id}>
            <Print tilt={tilt} innerClassName="pb-3">
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-paper-deep">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl(photo.id, "sm")} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="font-serif text-5xl italic text-sage">{initials(p.name)}</span>
                )}
              </div>
              <p className="pt-2.5 text-center font-serif text-xl leading-tight">{p.name}</p>
              <p className="text-center text-sm text-foxglove-dark">{p.role}</p>
            </Print>
            {p.blurb && <p className="mt-3 px-1 text-center text-[0.95rem] text-moss-soft">{p.blurb}</p>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <PageHeader title="Wedding party" intro="The people standing beside us." />
      {people.length === 0 && <p className="text-center text-moss-soft">Introductions coming soon.</p>}
      {sides.map(
        (s) =>
          s.people.length > 0 && (
            <section key={s.side} className="mb-14">
              <h2 className="mb-6 text-center text-[2rem] text-fern-dark">With {s.side}</h2>
              {grid(s.people)}
            </section>
          ),
      )}
      {unsided.length > 0 && grid(unsided)}
    </>
  );
}
