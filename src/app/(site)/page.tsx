import Link from "next/link";
import { Arch, Sprig } from "@/components/botanicals";
import { Countdown } from "@/components/countdown";
import { GrowInView } from "@/components/grow-in-view";
import { Petals } from "@/components/petals";
import { site } from "@/content/site";

const tiles = [
  { href: "/details", title: "Schedule & venue", text: "When to arrive, where to park, what to wear" },
  { href: "/travel", title: "Travel & hotels", text: "Where to stay and how to get here" },
  { href: "/registry", title: "Registry", text: "If you'd like to give a gift" },
  { href: "/faq", title: "Questions", text: "Kids, plus ones, weather and more" },
];

const delay = (s: number) => ({ animationDelay: `${s}s` });

export default function Home() {
  return (
    <>
      <Petals />
      <section className="relative pt-10 text-center">
        <Arch className="mx-auto w-full max-w-[22rem]" />
        <div className="-mt-28 px-6">
          <h1 className="text-[clamp(2.75rem,13vw,3.75rem)] leading-[0.95] text-moss">
            <span className="rise block" style={delay(0.45)}>
              {site.couple[0]}
            </span>
            <span className="-my-1 block text-[0.6em] leading-none text-foxglove-dark">
              <span className="amp-in" style={delay(0.85)}>
                &amp;
              </span>
            </span>
            <span className="rise block" style={delay(0.6)}>
              {site.couple[1]}
            </span>
          </h1>
        </div>
        <div className="rise" style={delay(1.05)}>
          <p className="mt-8 font-serif text-xl">{site.dateLabel}</p>
          <p className="text-moss-soft">{site.venue.name}, Lake Isabella, Michigan</p>
        </div>
        <div className="rise mt-4" style={delay(1.2)}>
          <Countdown to={site.ceremonyStart} />
        </div>
        <div className="rise" style={delay(1.35)}>
          <Link href="/rsvp" className="btn btn-primary mt-7 w-full text-lg">
            RSVP
          </Link>
        </div>
      </section>

      <GrowInView className="my-10">
        <Sprig className="mx-auto w-44" />
      </GrowInView>

      <ul className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="flex h-full flex-col rounded-2xl bg-card p-4 ring-1 ring-lichen transition active:scale-[0.98]"
            >
              <span className="font-serif text-lg leading-snug text-fern-dark">{t.title}</span>
              <span className="mt-1 text-sm text-moss-soft">{t.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
