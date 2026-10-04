import Link from "next/link";
import { Arch, Sprig } from "@/components/botanicals";
import { Countdown } from "@/components/countdown";
import { site } from "@/content/site";

const tiles = [
  { href: "/details", title: "Schedule & venue", text: "When to arrive, where to park, what to wear" },
  { href: "/travel", title: "Travel & hotels", text: "Where to stay and how to get here" },
  { href: "/registry", title: "Registry", text: "If you'd like to give a gift" },
  { href: "/faq", title: "Questions", text: "Kids, plus ones, weather and more" },
];

export default function Home() {
  return (
    <>
      <section className="relative pt-10 text-center">
        <Arch className="mx-auto w-full max-w-[22rem]" />
        <div className="-mt-28 px-6">
          <h1 className="text-[clamp(2.75rem,13vw,3.75rem)] leading-[0.95] text-moss">
            {site.couple[0]}
            <span className="my-1 block font-sans text-base font-medium tracking-wide text-foxglove-dark">and</span>
            {site.couple[1]}
          </h1>
        </div>
        <p className="mt-8 font-serif text-xl">{site.dateLabel}</p>
        <p className="text-moss-soft">
          {site.venue.name}, Lake Isabella, Michigan
        </p>
        <div className="mt-4">
          <Countdown to={site.ceremonyStart} />
        </div>
        <Link href="/rsvp" className="btn btn-primary mt-7 w-full text-lg">
          RSVP
        </Link>
      </section>

      <Sprig className="mx-auto my-10 w-44" />

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
