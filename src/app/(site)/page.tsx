import Link from "next/link";
import { connection } from "next/server";
import type { CSSProperties } from "react";
import { FrameArt, Spray } from "@/components/botanicals";
import { Countdown } from "@/components/countdown";
import { PhotoStrip } from "@/components/photo-strip";
import { Reveal } from "@/components/reveal";
import { site } from "@/content/site";
import { getSettings, isDayOf } from "@/lib/data";
import { getPhotosById, photoUrl } from "@/lib/photos";

const tiles = [
  { href: "/story", title: "Our story" },
  { href: "/details", title: "The day" },
  { href: "/travel", title: "Travel & stay" },
  { href: "/party", title: "Wedding party" },
  { href: "/registry", title: "Registry" },
  { href: "/photos", title: "Photos" },
];

const at = (s: number) => ({ "--at": `${s}s` }) as CSSProperties;

export default async function Home() {
  await connection();
  const settings = await getSettings();
  const byId = await getPhotosById(settings.heroPhotoIds);
  const strip = settings.heroPhotoIds
    .map((id) => byId.get(id))
    .filter((p) => !!p)
    .map((p) => ({ src: photoUrl(p.id), alt: p.caption ?? "Jaden and Wyat" }));

  return (
    <>
      {isDayOf(settings) && (
        <Link href="/today" className="print rise mt-5 block px-5 py-4 text-center" style={{ rotate: "-1deg" }}>
          <span className="block font-serif text-[1.7rem] italic leading-none text-foxglove-dark">It&rsquo;s today!</span>
          <span className="mt-1 block text-sm text-moss-soft">See what&rsquo;s happening and find your table</span>
        </Link>
      )}
      <section className="relative pt-5">
        <Spray animate delay={1.6} className="pointer-events-none absolute top-[38%] -left-10 w-44 -rotate-12" />
        <Spray animate flip delay={1.9} className="pointer-events-none absolute top-[12%] -right-12 w-44 rotate-[18deg]" />
        <PhotoStrip
          animate
          photos={strip}
          className="relative mx-auto w-[11.75rem]"
          caption={
            <>
              <span className="block font-serif text-[1.85rem] leading-none text-moss">
                Jaden <span className="italic text-foxglove-dark">&amp;</span> Wyat
              </span>
              <span className="mt-1.5 block text-[0.7rem] tracking-[0.3em] text-moss-soft">05 · 22 · 2027</span>
            </>
          }
        />
      </section>

      <section className="mt-9 text-center">
        <p className="rise font-serif text-[2rem] leading-tight" style={at(3.4)}>
          {site.dateLabel.replace(", 2027", "")}
        </p>
        <p className="rise text-moss-soft" style={at(3.55)}>
          {site.venue.name}, Lake Isabella, Michigan
        </p>
        <div className="rise mt-3" style={at(3.7)}>
          <Countdown to={site.ceremonyStart} />
        </div>
        <div className="rise" style={at(3.85)}>
          <Link href="/rsvp" className="btn btn-primary mt-7 w-full max-w-xs">
            RSVP
          </Link>
        </div>
      </section>

      <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-6">
        {tiles.map((t, i) => {
          const tilt = [-2, 1.5, 1, -1.5, -1, 2][i];
          return (
            <Reveal as="li" key={t.href} tilt={tilt} delay={(i % 2) * 0.08}>
              <Link href={t.href} className="print block transition-transform active:scale-[0.97]" style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
                <span className="block aspect-[4/3] overflow-hidden">
                  <FrameArt variant={i} animate delay={0.2} />
                </span>
                <span className="block pt-2.5 pb-0.5 text-center font-serif text-xl leading-tight">{t.title}</span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </>
  );
}
