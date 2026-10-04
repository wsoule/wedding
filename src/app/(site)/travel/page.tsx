import type { Metadata } from "next";
import { connection } from "next/server";
import { CopyCode } from "@/components/copy-code";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { site } from "@/content/site";
import { getHotels } from "@/lib/data";

export const metadata: Metadata = { title: "Travel & hotels" };

export default async function TravelPage() {
  await connection();
  const hotels = await getHotels();

  return (
    <>
      <PageHeader title="Getting here" intro="Lake Isabella is in the middle of Michigan's mitten." />

      <SectionTitle>Where to stay</SectionTitle>
      {hotels.length === 0 ? (
        <p className="text-moss-soft">Hotel recommendations are coming soon.</p>
      ) : (
        <ul className="space-y-3">
          {hotels.map((h) => (
            <li key={h.id} className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
              <p className="font-serif text-xl">{h.name}</p>
              {(h.distance || h.address) && (
                <p className="text-moss-soft">{[h.distance && `${h.distance} to the barn`, h.address].filter(Boolean).join(". ")}</p>
              )}
              {h.blockCode && <CopyCode label="Group code" code={h.blockCode} />}
              {h.bookBy && <p className="mt-2 font-medium text-foxglove-dark">Book by {h.bookBy}</p>}
              {h.notes && <p className="mt-2 text-[0.95rem]">{h.notes}</p>}
              {h.url && (
                <a href={h.url} target="_blank" rel="noreferrer" className="btn btn-primary mt-4 w-full">
                  Book a room
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <SectionTitle>Flying in</SectionTitle>
      <ul className="divide-y divide-lichen rounded-2xl bg-card px-4 ring-1 ring-lichen">
        {site.airports.map((a) => (
          <li key={a.code} className="flex items-baseline gap-3 py-3">
            <span className="w-12 font-serif text-lg text-fern-dark">{a.code}</span>
            <span className="flex-1">
              {a.name}
              <span className="block text-sm text-moss-soft">{a.drive} drive</span>
            </span>
          </li>
        ))}
      </ul>

      <SectionTitle>Driving</SectionTitle>
      <p>{site.venue.parking}</p>
      <p className="mt-3 rounded-xl bg-buttercup/25 px-4 py-3">{site.driving}</p>
    </>
  );
}
