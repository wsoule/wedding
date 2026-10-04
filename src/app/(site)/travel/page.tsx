import type { Metadata } from "next";
import { connection } from "next/server";
import { CopyCode } from "@/components/copy-code";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { Print } from "@/components/print";
import { site } from "@/content/site";
import { getHotels } from "@/lib/data";

export const metadata: Metadata = { title: "Travel & stay" };

export default async function TravelPage() {
  await connection();
  const hotels = await getHotels();

  return (
    <>
      <PageHeader title="Travel & stay" intro="Lake Isabella is right in the middle of Michigan's mitten." />

      <SectionTitle>Where to stay</SectionTitle>
      {hotels.length === 0 ? (
        <p className="text-center text-moss-soft">Hotel recommendations are coming soon.</p>
      ) : (
        <ul className="space-y-10">
          {hotels.map((h, i) => (
            <li key={h.id}>
              <Print tilt={i % 2 ? 1 : -1} tape innerClassName="px-5 pt-7 pb-5">
                <p className="text-center font-serif text-[1.8rem] leading-tight">{h.name}</p>
                {(h.distance || h.address) && (
                  <p className="mt-1 text-center text-moss-soft">{[h.distance && `${h.distance} to the barn`, h.address].filter(Boolean).join(". ")}</p>
                )}
                {h.blockCode && <CopyCode label="Group code" code={h.blockCode} />}
                {h.bookBy && <p className="mt-3 text-center font-serif text-xl italic text-foxglove-dark">Book by {h.bookBy}</p>}
                {h.notes && <p className="mt-3 text-[0.95rem]">{h.notes}</p>}
                {h.url && (
                  <a href={h.url} target="_blank" rel="noreferrer" className="btn btn-primary mt-5 w-full">
                    Book a room
                  </a>
                )}
              </Print>
            </li>
          ))}
        </ul>
      )}

      <SectionTitle>Flying in</SectionTitle>
      <ul className="border-t border-lichen">
        {site.airports.map((a) => (
          <li key={a.code} className="flex items-baseline gap-4 border-b border-lichen py-4">
            <span className="w-14 font-serif text-[1.7rem] italic leading-none text-foxglove-dark">{a.code}</span>
            <span className="flex-1">
              {a.name}
              <span className="block text-sm text-moss-soft">{a.drive} drive</span>
            </span>
          </li>
        ))}
      </ul>

      <SectionTitle>Driving</SectionTitle>
      <p className="text-center">{site.venue.parking}</p>
      <Print tilt={-1} className="mt-6" innerClassName="bg-[color-mix(in_srgb,var(--color-buttercup)_18%,var(--color-print))] px-5 py-4 text-center">
        {site.driving}
      </Print>
    </>
  );
}
