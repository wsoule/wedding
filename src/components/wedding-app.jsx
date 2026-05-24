"use client";

import * as React from "react";
import { Countdown } from "./countdown";
import { RSVP } from "./rsvp";
import {
  Attire,
  FAQ,
  Gallery,
  Hero,
  Registry,
  SiteFooter,
  Venue,
} from "./sections";

export default function WeddingApp() {
  const [scrolled, setScrolled] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const nav = [
    { href: "#story", label: "Story" },
    { href: "#venue", label: "Venue" },
    { href: "#countdown", label: "Countdown" },
    { href: "#registry", label: "Registry" },
    { href: "#attire", label: "Attire" },
    { href: "#faq", label: "FAQ" },
  ];

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""} ${drawerOpen ? "nav-drawer open" : ""}`}>
        <a href="#hero" className="nav-mono" onClick={closeDrawer}>
          W &amp; J
        </a>
        <div className="nav-links">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={closeDrawer}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="#rsvp" className="nav-cta" onClick={closeDrawer}>
          RSVP
        </a>
        <button
          className={`nav-burger ${drawerOpen ? "open" : ""}`}
          aria-label="Menu"
          onClick={() => setDrawerOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <Hero
        couple={["Wyat", "Jaden"]}
        dateText={{ month: "May", day: "XXII", year: "MMXXVII" }}
        venueShort="Little Flower Barn · Lake Isabella, Michigan"
      />
      <Gallery />
      <Venue
        venue={{
          address: "565 N. Coldwater Road, Lake Isabella, MI 48893",
          dateStart: "2027-05-22",
          dateEnd: "2027-05-23",
          calTitle: "Wyat & Jaden's Wedding",
          calDetails: "Ceremony at 4:30 PM. Garden formal attire.",
        }}
      />
      <Countdown targetISO="2027-05-22T16:30:00-04:00" />
      <Registry />
      <Attire />
      <RSVP />
      <FAQ />
      <SiteFooter />
    </>
  );
}
