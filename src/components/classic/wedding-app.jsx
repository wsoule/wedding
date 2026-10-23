"use client";

// The one-page home. Content comes from src/content/site.ts and the tables
// edited in /admin (see src/app/page.tsx); this file only lays it out.

import * as React from "react";
import { Countdown } from "./countdown";
import { Daisy, Sprig } from "./florals";
import {
  Attire,
  FAQ,
  Gallery,
  Hero,
  Registry,
  SiteFooter,
  Venue,
} from "./sections";

const NAV = [
  { href: "#story", label: "Story" },
  { href: "#venue", label: "Venue" },
  { href: "#countdown", label: "Countdown" },
  { href: "#registry", label: "Registry" },
  { href: "#attire", label: "Attire" },
  { href: "#faq", label: "FAQ" },
];

function RsvpInvite({ deadlineLabel }) {
  return (
    <section id="rsvp" data-screen-label="06 RSVP">
      <Sprig className="hero-sprig-left no-sway"
             style={{ position: "absolute", left: "4%", top: "12%", height: "62%",
                      color: "var(--c-honey)", opacity: 0.16 }} />
      <Sprig flip className="hero-sprig-right no-sway"
             style={{ position: "absolute", right: "4%", top: "12%", height: "62%",
                      color: "var(--c-honey)", opacity: 0.16 }} />
      <div className="section-inner">
        <div className="section-head c-reveal">
          <span className="eyebrow">Kindly Reply</span>
          <h2 className="section-title">RSVP</h2>
          {deadlineLabel && <div className="section-sub">By {deadlineLabel}</div>}
        </div>
        <div className="rsvp-card c-reveal delay-1">
          <Daisy className="no-sway" />
          <h3>Will you join us?</h3>
          <p>
            Find your invitation by name and we&rsquo;ll pull up everyone in
            your party. It only takes a minute.
          </p>
          <ol className="rsvp-steps">
            <li><span className="n">1</span>Find your name</li>
            <li><span className="n">2</span>Reply for your party</li>
            <li><span className="n">3</span>A few details</li>
          </ol>
          <a href="/rsvp" className="c-btn primary">RSVP now</a>
        </div>
      </div>
    </section>
  );
}

export default function WeddingApp({ data }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const els = document.querySelectorAll(".c-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("c-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const closeDrawer = () => setDrawerOpen(false);
  const [first, second] = data.couple;

  return (
    <div className="classic" data-floral="standard">
      {data.dayOf && (
        <a href="/today" className="dayof-banner">
          It&rsquo;s today! See what&rsquo;s happening and find your table →
        </a>
      )}
      <nav className={`nav ${scrolled ? "scrolled" : ""} ${drawerOpen ? "nav-drawer open" : ""}`}>
        <a href="#hero" className="nav-mono" onClick={closeDrawer}>
          {first[0]} &amp; {second[0]}
        </a>
        <div className="nav-links">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={closeDrawer}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="/rsvp" className="nav-cta" onClick={closeDrawer}>
          RSVP
        </a>
        <button
          className={`nav-burger ${drawerOpen ? "open" : ""}`}
          aria-label="Menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <Hero couple={data.couple} dateText={data.dateText} venueShort={data.venueShort} />
      <Gallery photos={data.photos} />
      <Venue
        venue={data.venue}
        schedule={data.schedule}
        hotels={data.hotels}
        airports={data.airports}
        parking={data.parking}
        driving={data.driving}
      />
      <Countdown targetISO={data.ceremonyStart} />
      <Registry items={data.registry} />
      <Attire dressCode={data.dressCode} />
      <RsvpInvite deadlineLabel={data.deadlineLabel} />
      <FAQ items={data.faqs} />
      <SiteFooter couple={data.couple} dateLine={data.dateLine} />
    </div>
  );
}
