"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const pages = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our story" },
  { href: "/party", label: "Wedding party" },
  { href: "/details", label: "The day" },
  { href: "/travel", label: "Travel & stay" },
  { href: "/registry", label: "Registry" },
  { href: "/photos", label: "Photos" },
  { href: "/wishes", label: "Well wishes" },
  { href: "/faq", label: "Questions" },
];

export function SiteHeader({ dayOf }: { dayOf: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Stop the page scrolling behind the open menu.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = dayOf ? [{ href: "/today", label: "Today" }, ...pages] : pages;

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-lichen/60 bg-paper/85 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-[36rem] items-center justify-between px-5">
          <Link href="/" onClick={() => setOpen(false)} className="font-serif text-2xl italic leading-none text-fern-dark" aria-label="Jaden & Wyat, home">
            J&amp;W
          </Link>
          <div className="flex items-center gap-2">
            <Link href={dayOf ? "/today" : "/rsvp"} onClick={() => setOpen(false)} className="rounded-full bg-fern-dark px-4 py-1.5 text-sm font-medium text-print">
              {dayOf ? "Today" : "RSVP"}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-moss"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        className={`fixed inset-0 z-30 bg-paper transition-[opacity,visibility] duration-400 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)" }}
      >
        <nav aria-label="Site" className="mx-auto max-w-[36rem] px-5 pt-6">
          <ul>
            {links.map((l, i) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li
                  key={l.href}
                  className="border-b border-lichen/70 transition-[opacity,translate] duration-500"
                  style={{ transitionDelay: open ? `${80 + i * 35}ms` : "0ms", opacity: open ? 1 : 0, translate: open ? "0 0" : "0 10px" }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-baseline justify-between py-3 font-serif text-[1.9rem] leading-tight ${active ? "italic text-foxglove-dark" : "text-moss"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/rsvp" onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full">
            RSVP
          </Link>
        </nav>
      </div>
    </>
  );
}
