import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { appleMapsUrl, calendarUrl, mapsUrl, site } from "@/content/site";
import { getSchedule } from "@/lib/data";

export const metadata: Metadata = { title: "Schedule & venue" };

export default async function DetailsPage() {
  await connection();
  const schedule = await getSchedule();

  return (
    <>
      <PageHeader title="The day" intro={site.dateLabel} />

      {schedule.length > 0 && (
        <ol className="relative ml-2 border-l-[1.5px] border-sage">
          {schedule.map((item) => (
            <li key={item.id} className="relative pb-7 pl-6 last:pb-0">
              <span className="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full bg-paper ring-[1.5px] ring-fern" aria-hidden="true" />
              <p className="font-semibold text-fern-dark">{item.time}</p>
              <p className="font-serif text-xl">{item.title}</p>
              {item.details && <p className="mt-0.5 text-moss-soft">{item.details}</p>}
            </li>
          ))}
        </ol>
      )}

      <SectionTitle>Where</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-lichen">
        <iframe
          title={`Map of ${site.venue.name}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(site.venue.mapsQuery)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-52 w-full border-0"
        />
        <div className="p-4">
          <p className="font-serif text-xl">{site.venue.name}</p>
          <address className="not-italic text-moss-soft">
            {site.venue.street}
            <br />
            {site.venue.city}
          </address>
          <p className="mt-3 text-[0.95rem]">{site.venue.parking}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
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
        </div>
      </div>

      <SectionTitle>What to wear</SectionTitle>
      <p className="font-serif text-xl">{site.dressCode.name}</p>
      <p className="mt-1">{site.dressCode.summary}</p>
      <ul className="mt-4 space-y-2">
        {site.dressCode.tips.map((t) => (
          <li key={t} className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foxglove" aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 mb-3 text-moss-soft">Colors we love, if you need a starting point:</p>
      <ul className="flex gap-3">
        {site.dressCode.colors.map((c) => (
          <li key={c.hex} className="flex flex-1 flex-col items-center gap-1.5 text-xs text-moss-soft">
            <span className="aspect-square w-full max-w-14 rounded-full ring-1 ring-moss/10" style={{ background: c.hex }} />
            {c.name}
          </li>
        ))}
      </ul>

      <Link href="/faq" className="btn btn-quiet mt-12 w-full">
        Read the FAQ
      </Link>
    </>
  );
}
