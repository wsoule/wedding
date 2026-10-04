import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { Print } from "@/components/print";
import { appleMapsUrl, calendarUrl, mapsUrl, site } from "@/content/site";
import { getSchedule } from "@/lib/data";

export const metadata: Metadata = { title: "The day" };

export default async function DetailsPage() {
  await connection();
  const schedule = await getSchedule();

  return (
    <>
      <PageHeader title="The day" intro={site.dateLabel} />

      {schedule.length > 0 && (
        // The schedule reads like a photobooth strip: one frame per moment.
        <Print tilt={-1} className="mx-auto max-w-[19rem]" innerClassName="flex flex-col gap-2 pb-4">
          {schedule.map((item) => (
            <div key={item.id} className="bg-paper-deep px-4 py-4 text-center">
              <p className="font-serif text-[1.7rem] italic leading-none text-foxglove-dark">{item.time}</p>
              <p className="mt-1 font-serif text-2xl leading-tight">{item.title}</p>
              {item.details && <p className="mt-1 text-[0.95rem] text-moss-soft">{item.details}</p>}
            </div>
          ))}
          <p className="pt-1 text-center font-serif text-lg italic text-moss-soft">May 22, 2027</p>
        </Print>
      )}

      <SectionTitle>Where</SectionTitle>
      <Print tilt={1} tape innerClassName="pb-5">
        <iframe
          title={`Map of ${site.venue.name}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(site.venue.mapsQuery)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block aspect-[4/3] w-full border-0 grayscale-[0.35]"
        />
        <div className="px-1 pt-4 text-center">
          <p className="font-serif text-[1.7rem] leading-tight">{site.venue.name}</p>
          <address className="not-italic text-moss-soft">
            {site.venue.street}, {site.venue.city}
          </address>
          <p className="mt-3 text-[0.95rem]">{site.venue.parking}</p>
        </div>
      </Print>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <a href={appleMapsUrl()} target="_blank" rel="noreferrer" className="btn btn-primary px-3">
          Apple Maps
        </a>
        <a href={mapsUrl()} target="_blank" rel="noreferrer" className="btn btn-primary px-3">
          Google Maps
        </a>
      </div>
      <a href={calendarUrl()} target="_blank" rel="noreferrer" className="btn btn-quiet mt-2 w-full">
        Add to calendar
      </a>

      <SectionTitle>What to wear</SectionTitle>
      <Print tilt={-1.5} innerClassName="px-5 py-6">
        <p className="text-center font-serif text-[1.8rem] italic leading-none text-foxglove-dark">{site.dressCode.name}</p>
        <p className="mt-3 text-center">{site.dressCode.summary}</p>
        <ul className="mt-5 space-y-2 border-t border-lichen pt-4">
          {site.dressCode.tips.map((t) => (
            <li key={t} className="flex gap-3 text-[0.95rem]">
              <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-fern" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-moss-soft">Colors we love, if you need a starting point</p>
        <ul className="mt-3 flex justify-center gap-2">
          {site.dressCode.colors.map((c) => (
            <li key={c.hex} className="flex w-14 flex-col items-center gap-1.5 text-xs text-moss-soft">
              <span className="h-12 w-full rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" style={{ background: c.hex }} />
              {c.name}
            </li>
          ))}
        </ul>
      </Print>

      <Link href="/faq" className="btn btn-quiet mt-12 w-full">
        Read the questions
      </Link>
    </>
  );
}
