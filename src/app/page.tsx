import { connection } from "next/server";
import WeddingApp from "@/components/classic/wedding-app";
import { calendarUrl, mapsUrl, site } from "@/content/site";
import { getFaqs, getHotels, getRegistry, getSchedule, getSettings, isDayOf } from "@/lib/data";
import { getPhotosById, photoUrl } from "@/lib/photos";
import "./classic.css";

function toRoman(n: number) {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [value, numeral] of map) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

export default async function Home() {
  await connection();
  const [settings, schedule, hotels, registry, faqs] = await Promise.all([
    getSettings(),
    getSchedule(),
    getHotels(),
    getRegistry(),
    getFaqs(),
  ]);
  const byId = await getPhotosById(settings.heroPhotoIds);
  const photos = settings.heroPhotoIds
    .map((id) => byId.get(id))
    .filter((p) => !!p)
    .map((p) => ({ src: photoUrl(p.id), caption: p.caption ?? "" }));

  const date = new Date(`${site.date}T12:00:00`);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const city = site.venue.city.replace(/,?\s*MI\b.*$/, "");
  const deadlineLabel = settings.rsvpDeadline
    ? new Date(`${settings.rsvpDeadline}T12:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const data = {
    couple: [...site.couple],
    dateText: { month, day: toRoman(date.getDate()), year: toRoman(date.getFullYear()) },
    venueShort: `${site.venue.name} · ${city}, Michigan`,
    dateLine: `${month} ${date.getDate()}, ${date.getFullYear()} · ${city}, Michigan`,
    ceremonyStart: site.ceremonyStart,
    venue: {
      name: site.venue.name,
      street: site.venue.street,
      city: site.venue.city,
      mapsQuery: site.venue.mapsQuery,
      mapsUrl: mapsUrl(),
      calendarUrl: calendarUrl(),
    },
    schedule: schedule.map(({ time, title }) => ({ time, title })),
    hotels: hotels.map(({ name, url, address, distance, blockCode, bookBy }) => ({
      name, url, address, distance, blockCode, bookBy,
    })),
    airports: site.airports.map((a) => ({ ...a })),
    parking: site.venue.parking,
    driving: site.driving,
    registry: registry.map(({ title, url, blurb }) => ({ title, url, blurb })),
    faqs: faqs.map(({ question, answer }) => ({ question, answer })),
    dressCode: {
      name: site.dressCode.name,
      summary: site.dressCode.summary,
      tips: [...site.dressCode.tips],
      colors: site.dressCode.colors.map((c) => ({ ...c })),
    },
    photos,
    deadlineLabel,
    dayOf: isDayOf(settings),
  };

  return <WeddingApp data={data} />;
}
