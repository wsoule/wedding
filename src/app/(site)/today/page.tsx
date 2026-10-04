import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { appleMapsUrl, mapsUrl } from "@/content/site";
import { getSchedule } from "@/lib/data";
import { FindTable, NowNext } from "./day-of";

export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  await connection();
  const schedule = await getSchedule();

  return (
    <>
      <PageHeader title="Today's the day" intro="Everything you need while you're with us." />
      <NowNext items={schedule} />

      <SectionTitle>Find your table</SectionTitle>
      <FindTable />

      <SectionTitle>Photobooth</SectionTitle>
      <p className="text-center text-moss-soft">Snap a strip and it lands in the shared album.</p>
      <Link href="/photos" className="btn btn-primary mt-5 w-full">
        Open the photobooth
      </Link>

      <SectionTitle>Getting there</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <a href={appleMapsUrl()} target="_blank" rel="noreferrer" className="btn btn-quiet px-3">
          Apple Maps
        </a>
        <a href={mapsUrl()} target="_blank" rel="noreferrer" className="btn btn-quiet px-3">
          Google Maps
        </a>
      </div>
      <Link href="/details" className="btn btn-quiet mt-2 w-full">
        Full schedule
      </Link>
    </>
  );
}
