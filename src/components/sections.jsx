// All page sections except Countdown and RSVP (which have their own files).
// Hero, Gallery, Venue, Registry, Attire (dress code), FAQ, Footer.

import * as React from "react";
import {
  Branch,
  CornerOrnament,
  Divider,
  Sprig,
} from "./florals";

// ── Hero ────────────────────────────────────────────────────────────────────

export function Hero({ couple, dateText, venueShort }) {
  return (
    <section id="hero" data-screen-label="01 Hero">
      <CornerOrnament className="hero-corner tl" />
      <CornerOrnament className="hero-corner tr" flip />
      <CornerOrnament className="hero-corner bl" flipY />
      <CornerOrnament className="hero-corner br" flip flipY />

      <div className="hero-inner">
        <div className="hero-eyebrow">Together with their families</div>
        <div className="hero-names">
          <span className="hero-name">{couple[0]}</span>
          <span className="amp">&amp;</span>
          <span className="hero-name">{couple[1]}</span>
        </div>
        <div className="hero-line" aria-hidden="true"></div>
        <div className="hero-meta">
          <span>{dateText.month}</span>
          <span className="dot">·</span>
          <span>{dateText.day}</span>
          <span className="dot">·</span>
          <span>{dateText.year}</span>
        </div>
        <div className="hero-meta" style={{ marginTop: 14 }}>{venueShort}</div>
        <div className="hero-cta">
          <a href="#rsvp" className="btn primary hero-rsvp">RSVP</a>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <div className="line"></div>
      </div>
    </section>);

}

// ── Gallery ─────────────────────────────────────────────────────────────────
// A scroll-grown vine: each image slot is clipped into a leaf frame and appears
// as the vine draws through the section.

const VINE_LEAVES = [
  {
    id: 'eng-1',
    label: 'Favorite',
    side: -1,
    x: 23,
    y: 12,
    angle: -21,
    grow: 0.12,
    branch: 'M27 7 C24 8 21 11 19 15',
  },
  {
    id: 'eng-2',
    label: 'Engagement',
    side: 1,
    x: 77,
    y: 21,
    angle: 20,
    grow: 0.22,
    branch: 'M75 18 C80 18 83 21 84 25',
  },
  {
    id: 'eng-3',
    label: 'Candid',
    side: -1,
    x: 23,
    y: 34,
    angle: -17,
    grow: 0.34,
    branch: 'M28 32 C24 31 20 34 18 38',
  },
  {
    id: 'eng-4',
    label: 'Photo',
    side: 1,
    x: 78,
    y: 45,
    angle: 17,
    grow: 0.46,
    branch: 'M73 44 C79 44 82 47 84 52',
  },
  {
    id: 'eng-5',
    label: 'Laughter',
    side: -1,
    x: 23,
    y: 58,
    angle: -20,
    grow: 0.58,
    branch: 'M28 57 C24 56 21 59 19 64',
  },
  {
    id: 'eng-6',
    label: 'Walk',
    side: 1,
    x: 77,
    y: 70,
    angle: 22,
    grow: 0.69,
    branch: 'M75 69 C81 70 83 74 84 79',
  },
  {
    id: 'eng-7',
    label: 'Proposal',
    side: -1,
    x: 23,
    y: 84,
    angle: -22,
    grow: 0.81,
    branch: 'M29 83 C24 82 21 85 19 90',
  },
  {
    id: 'eng-8',
    label: 'Us',
    side: 1,
    x: 72,
    y: 96,
    angle: 17,
    grow: 0.89,
    branch: 'M70 94 C75 94 79 97 81 100',
  },
];

const VINE_TENDRILS = [
  { d: 'M58 12 C67 7 74 13 69 18 C64 22 63 15 70 15', grow: 0.08 },
  { d: 'M39 29 C29 24 25 33 31 37 C37 40 39 33 32 32', grow: 0.3 },
  { d: 'M62 44 C72 39 78 48 72 53 C66 57 65 49 73 49', grow: 0.46 },
  { d: 'M38 58 C28 54 25 64 32 68 C38 71 39 62 32 62', grow: 0.6 },
  { d: 'M60 72 C70 68 74 78 68 82 C62 86 62 76 69 77', grow: 0.72 },
];

const VINE_SMALL_LEAVES = [
  { x: 43, y: 9, scale: 0.86, angle: -28, grow: 0.07 },
  { x: 63, y: 20, scale: 0.76, angle: 42, grow: 0.18 },
  { x: 42, y: 31, scale: 0.72, angle: -43, grow: 0.3 },
  { x: 59, y: 43, scale: 0.82, angle: 39, grow: 0.42 },
  { x: 40, y: 55, scale: 0.84, angle: -37, grow: 0.54 },
  { x: 62, y: 68, scale: 0.76, angle: 35, grow: 0.66 },
  { x: 43, y: 82, scale: 0.76, angle: -42, grow: 0.78 },
  { x: 57, y: 94, scale: 0.86, angle: 33, grow: 0.9 },
];

const VINE_MAIN_PATH = 'M30 5 C54 3 77 10 78 20 C78 30 43 29 28 36 C14 44 61 45 77 47 C92 50 41 57 27 62 C14 68 62 71 78 73 C94 76 42 84 27 87 C15 91 48 97 72 97';

export function Gallery() {
  const [lbIndex, setLbIndex] = React.useState(null);
  const [images, setImages] = React.useState([]);
  const containerRef = React.useRef(null);

  // Build the list of currently-filled slots on demand.
  const collectImages = React.useCallback(() => {
    const slots = containerRef.current?.querySelectorAll('image-slot') || [];
    const arr = [];
    slots.forEach((s, i) => {
      const img = s.shadowRoot && s.shadowRoot.querySelector('img');
      if (img && img.src && img.style.display !== 'none') {
        arr.push({ src: img.src, idx: i });
      }
    });
    return arr;
  }, []);

  const openAt = React.useCallback((slotIdx) => {
    const list = collectImages();
    const pos = list.findIndex((x) => x.idx === slotIdx);
    if (pos !== -1) {
      setImages(list);
      setLbIndex(pos);
    }
  }, [collectImages]);

  React.useEffect(() => {
    let raf = 0;
    const stage = containerRef.current;
    if (!stage) return undefined;

    const growEls = Array.from(stage.querySelectorAll('[data-grow]'));
    const clamp = (n) => Math.max(0, Math.min(1, n));
    const update = () => {
      raf = 0;
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const progress = clamp((vh * 0.82 - rect.top) / (rect.height * 0.88));
      stage.style.setProperty('--vine-progress', progress.toFixed(3));
      growEls.forEach((el) => {
        const growAt = Number(el.getAttribute('data-grow') || 0);
        el.classList.toggle('grown', progress >= growAt);
      });
    };
    const requestUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onClick = (e) => {
      const slot = e.target.closest('image-slot');
      if (!slot) return;
      // Only open if the slot is filled (img visible).
      const img = slot.shadowRoot && slot.shadowRoot.querySelector('img');
      if (!img || img.style.display === 'none' || !img.src) return;
      // Find slot index by data-idx
      const idx = parseInt(slot.getAttribute('data-idx'), 10);
      openAt(idx);
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [openAt]);

  React.useEffect(() => {
    if (lbIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLbIndex(null);
      if (e.key === 'ArrowRight') setLbIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setLbIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lbIndex, images.length]);

  return (
    <section id="story" data-screen-label="02 Gallery">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="eyebrow">Our chapter so far</span>
          <h2 className="section-title">Us, in pictures</h2>
          <Divider />
        </div>
        <div className="vine-gallery reveal delay-1" ref={containerRef}>
          <svg className="vine-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              className="vine-main vine-shadow"
              pathLength="1"
              d={VINE_MAIN_PATH}
            />
            <path
              className="vine-main"
              pathLength="1"
              d={VINE_MAIN_PATH}
            />
            {VINE_LEAVES.map((leaf) => (
              <path
                key={leaf.id}
                className="vine-branch"
                pathLength="1"
                data-grow={leaf.grow}
                d={leaf.branch}
              />
            ))}
            {VINE_TENDRILS.map((curl, i) => (
              <path
                key={`curl-${i}`}
                className="vine-curl"
                pathLength="1"
                data-grow={curl.grow}
                d={curl.d}
              />
            ))}
            {VINE_SMALL_LEAVES.map((leaf, i) => (
              <path
                key={`leaf-${i}`}
                className="vine-small-leaf"
                data-grow={leaf.grow}
                d="M0 0 C-3 -3 -3 -8 0 -11 C3 -8 3 -3 0 0"
                transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}
              />
            ))}
          </svg>
          {VINE_LEAVES.map((leaf, i) => (
            <div
              key={leaf.id}
              className={`vine-leaf ${leaf.side < 0 ? 'left' : 'right'}`}
              data-idx={i}
              data-grow={leaf.grow}
              style={{
                left: `${leaf.x}%`,
                top: `${leaf.y}%`,
                '--leaf-rotate': `${leaf.angle}deg`,
              }}
            >
              <div className="vine-leaf-frame">
                <image-slot
                  id={leaf.id}
                  data-idx={i}
                  placeholder={leaf.label}
                  shape="rect"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {lbIndex !== null && images[lbIndex] &&
      <div className="lightbox" onClick={() => setLbIndex(null)}>
          <button className="lb-close" onClick={(e) => {e.stopPropagation();setLbIndex(null);}}>×</button>
          {images.length > 1 &&
        <>
              <button className="lb-nav lb-prev"
          onClick={(e) => {e.stopPropagation();setLbIndex((i) => (i - 1 + images.length) % images.length);}}>‹</button>
              <button className="lb-nav lb-next"
          onClick={(e) => {e.stopPropagation();setLbIndex((i) => (i + 1) % images.length);}}>›</button>
            </>
        }
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[lbIndex].src} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      }
    </section>);

}

// ── Venue ───────────────────────────────────────────────────────────────────

export function Venue({ venue }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(venue.address)}`;
  const calUrl = (() => {
    // Build a simple gcal link — 5pm-11pm local on the date.
    const d = venue.dateStart.replace(/-/g, '');
    const e = venue.dateEnd.replace(/-/g, '');
    const start = `${d}T230000Z`;
    const end = `${e}T050000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(venue.calTitle)}&dates=${start}/${end}&location=${encodeURIComponent(venue.address)}&details=${encodeURIComponent(venue.calDetails)}`;
  })();

  return (
    <section id="venue" data-screen-label="03 Venue">
      <Branch className="no-sway" style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
        width: 420, color: 'var(--c-sage)', opacity: 0.5
      }} />
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="eyebrow">Where it happens</span>
          <h2 className="section-title">The Venue</h2>
        </div>

        <div className="venue-grid">
          <div className="venue-card reveal">
            <div className="venue-name">Little Flower Barn</div>
            <div className="venue-tag">Ceremony &amp; Reception</div>
            <address>
              565 N. Coldwater Road<br />
              Lake Isabella, Michigan 48893
            </address>
            <div className="venue-time">
              <div className="tt-item">
                <div className="label">Ceremony</div>
                <div className="val">4:30 PM</div>
              </div>
              <div className="tt-item">
                <div className="label">Cocktails</div>
                <div className="val">5:15 PM</div>
              </div>
              <div className="tt-item">
                <div className="label">Reception</div>
                <div className="val">6:30 PM</div>
              </div>
            </div>
            <div className="venue-actions">
              <a className="btn primary" href={mapsUrl} target="_blank" rel="noreferrer">
                <span>Get Directions</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a className="btn secondary" href={calUrl} target="_blank" rel="noreferrer">
                Add to Calendar
              </a>
            </div>
          </div>

          <div className="venue-map reveal delay-1">
            {/* Real Google Maps embed for the venue address. Swap the
                `src` for a custom Maps Embed API URL if you want a
                styled or pinned-marker version. */}
            <iframe
              title="Little Flower Barn map"
              src="https://www.google.com/maps?q=565+N.+Coldwater+Road,+Lake+Isabella,+MI+48893&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            />
          </div>
        </div>

        <div className="travel-row">
          <div className="travel-card reveal">
            <span className="label">Stay</span>
            <h4>Where to lay your head</h4>
            <p><strong>Soaring Eagle Casino &amp; Resort</strong></p>
            <p>6800 Soaring Eagle Blvd, Mt. Pleasant — 22 min from the barn</p>
            <p style={{ marginTop: 10, fontStyle: 'italic', color: 'var(--c-muted)' }}>
              Use code <strong>SOULE-CORLISS</strong> for our group rate.
            </p>
          </div>
          <div className="travel-card reveal delay-1">
            <span className="label">Fly</span>
            <h4>Nearest airports</h4>
            <p><strong>MBS</strong> — MBS Intl. (1h 5min drive)</p>
            <p><strong>GRR</strong> — Gerald R. Ford Intl. (1h 45min drive)</p>
            <p><strong>DTW</strong> — Detroit Metro (2h 35min drive)</p>
          </div>
          <div className="travel-card reveal delay-2">
            <span className="label">Drive</span>
            <h4>Coming by car</h4>
            <p>Free parking on-site. Look for the white split-rail fence and follow the lanterns up the lane.</p>
            <p>A shuttle from Soaring Eagle runs every 30 min from 3:30 PM.</p>
          </div>
        </div>
      </div>
    </section>);

}

// ── Registry ────────────────────────────────────────────────────────────────

export function Registry() {
  const items = [
  {
    title: "Amazon",
    sub: "Home & nesting",
    blurb: "Sheets, skillets, and the kind of mixer you keep for thirty years.",
    url: "https://www.amazon.com/wedding/registry",
    art: <RegArtKitchen />
  },
  {
    title: "Honeyfund",
    sub: "Honeymoon",
    blurb: "Help send us off to the Pacific Northwest — coast drives, big trees, slow mornings.",
    url: "https://www.honeyfund.com/",
    art: <RegArtSuitcase />
  },
  {
    title: "Moving Fund",
    sub: "First home together",
    blurb: "A little something toward the down payment on the house we're searching for.",
    url: "#",
    art: <RegArtHouse />
  }];

  return (
    <section id="registry" data-screen-label="05 Registry">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="eyebrow">If you wish</span>
          <h2 className="section-title">Registry</h2>
          <Divider />
          <div className="section-sub">Your presence is gift enough — but if you insist</div>
        </div>
        <div className="registry-grid">
          {items.map((it, i) =>
          <a key={it.title} className={`reg-card reveal delay-${i}`}
          href={it.url} target="_blank" rel="noreferrer">
              <div className="reg-art">{it.art}</div>
              <h4>{it.title}</h4>
              <div className="reg-sub">{it.sub}</div>
              <p>{it.blurb}</p>
              <div className="reg-go">Visit →</div>
            </a>
          )}
        </div>
      </div>
    </section>);

}

const RegArtKitchen = () =>
<svg viewBox="0 0 80 80" fill="none">
    {/* mixer */}
    <path d="M20 18 Q 22 12, 30 12 L 56 12 Q 64 12, 64 20 L 64 36 Q 60 40, 54 42"
  stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <ellipse cx="44" cy="56" rx="20" ry="6" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.3" />
    <path d="M24 56 Q 24 70, 44 70 Q 64 70, 64 56" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.3" />
    <line x1="46" y1="22" x2="46" y2="50" stroke="currentColor" strokeWidth="1.3" />
    <ellipse cx="46" cy="22" rx="6" ry="3" stroke="currentColor" strokeWidth="1.3" fill="var(--c-cream)" />
    {/* sprig at handle */}
    <Sprig style={{ transformOrigin: '0 0' }} />
    <ellipse cx="14" cy="14" rx="6" ry="3" fill="var(--c-honey)" stroke="currentColor" strokeWidth="1" transform="rotate(-30 14 14)" />
  </svg>;


const RegArtSuitcase = () =>
<svg viewBox="0 0 80 80" fill="none">
    <path d="M28 24 V 18 Q 28 14, 32 14 L 48 14 Q 52 14, 52 18 V 24" stroke="currentColor" strokeWidth="1.4" />
    <rect x="14" y="24" width="52" height="40" rx="3" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.08" />
    <line x1="14" y1="42" x2="66" y2="42" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="56" cy="34" r="3" stroke="currentColor" strokeWidth="1.2" fill="var(--c-honey)" />
    <ellipse cx="24" cy="32" rx="6" ry="2.5" fill="var(--c-blush)" stroke="currentColor" strokeWidth="1" transform="rotate(-20 24 32)" />
    <ellipse cx="30" cy="34" rx="5" ry="2" fill="var(--c-sage)" stroke="currentColor" strokeWidth="1" transform="rotate(15 30 34)" />
  </svg>;


const RegArtHouse = () =>
<svg viewBox="0 0 80 80" fill="none">
    <path d="M14 38 L 40 18 L 66 38" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
    <rect x="18" y="38" width="44" height="28" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.08" />
    <rect x="34" y="48" width="12" height="18" stroke="currentColor" strokeWidth="1.3" fill="var(--c-honey)" fillOpacity="0.7" />
    <rect x="22" y="44" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
    <rect x="50" y="44" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
    <path d="M50 18 L 50 12 L 56 12 L 56 24" stroke="currentColor" strokeWidth="1.3" />
    {/* yard plant */}
    <ellipse cx="14" cy="68" rx="6" ry="2" fill="var(--c-sage)" stroke="currentColor" strokeWidth="0.9" />
    <ellipse cx="68" cy="68" rx="5" ry="2" fill="var(--c-sage-dk)" stroke="currentColor" strokeWidth="0.9" />
  </svg>;


// ── Attire / Dress code ─────────────────────────────────────────────────────

export function Attire() {
  const palette = [
  { c: '#6b7a4a', label: 'Sage' },
  { c: '#d4a574', label: 'Honey' },
  { c: '#b85c3c', label: 'Terracotta' },
  { c: '#e8b4a8', label: 'Blush' },
  { c: '#3d2f1f', label: 'Walnut' }];

  const yes = ['Linen', 'Florals', 'Earth tones', 'Tea-length', 'Block heels'];
  const no = ['Bright white', 'Stilettos (grass!)', 'Neon'];

  return (
    <section id="attire" data-screen-label="07 Attire">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="eyebrow">What to wear</span>
          <h2 className="section-title">Dress Code</h2>
          <div className="section-sub">Garden Formal</div>
        </div>

        <div className="attire-grid">
          <div className="attire-text reveal">
            <span className="badge">Garden Formal</span>
            <h3>Think wildflower picnic, but dressed up.</h3>
            <p>
              The ceremony is on a grassy lawn under open sky, and dinner is
              under the barn rafters. Lean into it — long dresses, suit
              jackets, summery linens. We'd love to see earthy tones,
              florals, and anything that makes you twirl.
            </p>
            <p>
              <strong>For the gents:</strong> a suit or sport coat in
              tan, olive, or warm brown — no tie required.
              <br />
              <strong>For the ladies:</strong> midi or floor-length, in a
              wildflower palette. Block heels or flats — your feet will
              thank you on the lawn.
            </p>

            <div className="attire-chips" style={{ marginTop: 28 }}>
              {yes.map((t) => <span key={t} className="chip">✓ {t}</span>)}
              {no.map((t) => <span key={t} className="chip" style={{ color: 'var(--c-terra)' }}>✗ {t}</span>)}
            </div>
          </div>

          <div className="palette-card reveal delay-1">
            <div className="pc-title">Our colors</div>
            <div className="palette-grid">
              {palette.map((p) =>
              <div key={p.c}>
                  <div className="ps" style={{ background: p.c }}></div>
                  <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'var(--f-serif)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--c-muted)' }}>{p.label}</div>
                </div>
              )}
            </div>
            <p style={{ marginTop: 28, fontStyle: 'italic', color: 'var(--c-muted)', fontSize: 15, textAlign: 'center' }}>
              Use these as a north star — not a uniform.
            </p>
          </div>
        </div>
      </div>
    </section>);

}

// ── FAQ ─────────────────────────────────────────────────────────────────────

export function FAQ() {
  const [openIdx, setOpenIdx] = React.useState(0);
  const qs = [
  {
    q: "When should I RSVP by?",
    a: "Please send your reply by April 17, 2027 — that's about five weeks out. We need a final headcount for the caterer and our dear barn folks."
  },
  {
    q: "Are kids welcome?",
    a: "We adore your little ones, but we've chosen to keep our celebration adults-only (with the exception of immediate family). We hope this gives you a chance to enjoy a night out with us."
  },
  {
    q: "Will the ceremony be outside?",
    a: "Yes — on the lawn just south of the barn, weather permitting. In case of rain we'll move inside the barn, which fits everyone comfortably. Either way, plan for grass underfoot and a bit of breeze."
  },
  {
    q: "Is there parking?",
    a: "Plenty. There's a gravel lot just past the barn with overflow on the back field. A shuttle will also run from Soaring Eagle every 30 minutes starting at 3:30 PM and looping back until midnight."
  },
  {
    q: "What time should I arrive?",
    a: "Please plan to be seated by 4:15 PM — the ceremony starts promptly at 4:30. Doors and welcome drinks open at 4:00."
  },
  {
    q: "Will food and drinks be served?",
    a: "Absolutely. Cocktails and passed appetizers at 5:15, a seated dinner at 6:30, and dancing + dessert until close. Beer, wine, and a couple of signature cocktails are on us."
  },
  {
    q: "Can I bring a plus-one?",
    a: "If your invitation lists \"and guest,\" yes — please add their name to your RSVP. Otherwise we kept the list intimate so we could really see everyone."
  },
  {
    q: "What if it's hot, cold, or buggy?",
    a: "May in Michigan can be all three in one evening. We'll have shawls in a basket for the cool-down, fans for any heat, and citronella around the lawn. Layers are your friend."
  },
  {
    q: "Are you registered anywhere?",
    a: "We are — see the Registry section above for Amazon, our Honeyfund, and a little fund toward our first home. Truly though, you being there is everything."
  },
  {
    q: "How can I share photos with you?",
    a: "We'll have a QR code on every table linking to a shared album. Tag your phone-photos so we can relive the day through your eyes. #SoulMatesAreCorliss"
  }];


  return (
    <section id="faq" data-screen-label="08 FAQ">
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="eyebrow">Things you might wonder</span>
          <h2 className="section-title">Questions</h2>
          <div className="section-sub">Everything else, answered</div>
        </div>
        <div className="faq-list reveal delay-1">
          {qs.map((item, i) => {
            const open = i === openIdx;
            return (
              <div key={i} className={`faq-item ${open ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenIdx(open ? -1 : i)}>
                  <span>{item.q}</span>
                  <span className="marker" aria-hidden="true"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: open ? 400 : 0 }}>
                  <div className="faq-a-inner">{item.a}</div>
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}

// ── Footer ──────────────────────────────────────────────────────────────────

export function SiteFooter() {
  return (
    <footer data-screen-label="09 Footer">
      <Branch className="fbranch l no-sway" />
      <Branch flip className="fbranch r no-sway" />
      <div className="fmono">Wyat &amp; Jaden</div>
      <div className="fdate">May 22, 2027 · Lake Isabella, Michigan</div>
    </footer>);

}
