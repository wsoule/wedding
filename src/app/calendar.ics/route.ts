import { coupleNames, site } from "@/content/site";
import { buildIcs } from "@/lib/ics";

// "Add to calendar": a file every calendar app can import.
export function GET() {
  const url = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const ics = buildIcs({
    uid: `wedding-${site.date}@jaden-and-wyat`,
    start: site.ceremonyStart,
    end: site.receptionEnd,
    title: `${coupleNames}'s wedding`,
    location: site.venue.mapsQuery,
    description: `Schedule, travel and RSVP: ${url}`,
    url,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="jaden-and-wyat-wedding.ics"',
    },
  });
}
