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
          <a href="/rsvp" className="c-btn primary hero-rsvp">RSVP</a>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <div className="line"></div>
      </div>
    </section>);

}

// ── Gallery ─────────────────────────────────────────────────────────────────
// An editorial collage of framed photos. To add a photo, put the file in
// public/photos/ and set its `src` (e.g. '/photos/proposal.jpg'). Frames
// without a photo show a soft botanical placeholder.

const FRAMES = [
  { caption: 'The proposal', shape: 'arch' },
  { caption: 'Early days', shape: 'rect' },
  { caption: 'Adventures', shape: 'rect' },
  { caption: 'Engaged', shape: 'arch' },
  { caption: 'Home', shape: 'oval' },
  { caption: 'Us', shape: 'rect' },
];

// Photos come from the home-page strip in /admin/photos. Frames without a
// photo show a soft botanical placeholder.
export function Gallery({ photos = [] }) {
  const [lbIndex, setLbIndex] = React.useState(null);
  const frames = FRAMES.map((frame, i) => ({
    ...frame,
    src: photos[i]?.src ?? null,
    caption: photos[i] ? photos[i].caption || '' : frame.caption,
  }));
  const images = frames.filter((p) => p.src);

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
        <div className="section-head c-reveal">
          <span className="eyebrow">Our chapter so far</span>
          <h2 className="section-title">Us, in pictures</h2>
          <Divider />
        </div>
        <div className="photo-collage">
          {frames.map((photo, i) => (
            <figure key={i} className={`photo c-reveal delay-${i % 3} shape-${photo.shape}`}>
              <div className="photo-frame">
                {photo.src ? (
                  <button
                    type="button"
                    className="photo-open"
                    aria-label={photo.caption ? `View photo: ${photo.caption}` : 'View photo'}
                    onClick={() => setLbIndex(images.indexOf(photo))}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} alt={photo.caption} loading="lazy" />
                  </button>
                ) : (
                  <div className="photo-empty" aria-hidden="true">
                    <Sprig className="no-sway" />
                  </div>
                )}
              </div>
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>

      {lbIndex !== null && images[lbIndex] &&
      <div className="lightbox" onClick={() => setLbIndex(null)}>
          <button className="lb-close" aria-label="Close" onClick={(e) => {e.stopPropagation();setLbIndex(null);}}>×</button>
          {images.length > 1 &&
        <>
              <button className="lb-nav lb-prev" aria-label="Previous photo"
          onClick={(e) => {e.stopPropagation();setLbIndex((i) => (i - 1 + images.length) % images.length);}}>‹</button>
              <button className="lb-nav lb-next" aria-label="Next photo"
          onClick={(e) => {e.stopPropagation();setLbIndex((i) => (i + 1) % images.length);}}>›</button>
            </>
        }
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[lbIndex].src} alt={images[lbIndex].caption} onClick={(e) => e.stopPropagation()} />
        </div>
      }
    </section>);

}

// ── Venue ───────────────────────────────────────────────────────────────────

export function Venue({ venue, schedule, hotels, airports, parking, driving }) {
  return (
    <section id="venue" data-screen-label="03 Venue">
      <div className="section-inner">
        <div className="section-head c-reveal">
          <span className="eyebrow">Where it happens</span>
          <h2 className="section-title">The Venue</h2>
        </div>

        <div className="venue-grid">
          <div className="venue-card c-reveal">
            <div className="venue-name">{venue.name}</div>
            <div className="venue-tag">Ceremony &amp; Reception</div>
            <address>
              {venue.street}<br />
              {venue.city}
            </address>
            {schedule.length > 0 && (
              <div className="venue-time">
                {schedule.map((item) => (
                  <div className="tt-item" key={item.title}>
                    <div className="label">{item.title}</div>
                    <div className="val">{item.time}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="venue-actions">
              <a className="c-btn primary" href={venue.mapsUrl} target="_blank" rel="noreferrer">
                <span>Get Directions</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a className="c-btn secondary" href={venue.calendarUrl} target="_blank" rel="noreferrer">
                Add to Calendar
              </a>
            </div>
          </div>

          <div className="venue-map c-reveal delay-1">
            <iframe
              title={`${venue.name} map`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(venue.mapsQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            />
          </div>
        </div>

        <div className="travel-row">
          <div className="travel-card c-reveal">
            <span className="label">Stay</span>
            <h4>Where to lay your head</h4>
            {hotels.length === 0 && <p>Hotel suggestions are coming soon.</p>}
            {hotels.map((hotel) => (
              <div className="travel-hotel" key={hotel.name}>
                <p>
                  <strong>
                    {hotel.url ? <a href={hotel.url} target="_blank" rel="noreferrer">{hotel.name}</a> : hotel.name}
                  </strong>
                </p>
                {(hotel.address || hotel.distance) && (
                  <p>{[hotel.address, hotel.distance].filter(Boolean).join(' — ')}</p>
                )}
                {hotel.blockCode && (
                  <p className="travel-note">
                    Use code <strong>{hotel.blockCode}</strong> for our group rate
                    {hotel.bookBy ? `, booked by ${hotel.bookBy}` : ''}.
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="travel-card c-reveal delay-1">
            <span className="label">Fly</span>
            <h4>Nearest airports</h4>
            {airports.map((a) => (
              <p key={a.code}><strong>{a.code}</strong> — {a.name} ({a.drive})</p>
            ))}
          </div>
          <div className="travel-card c-reveal delay-2">
            <span className="label">Drive</span>
            <h4>Coming by car</h4>
            <p>{parking}</p>
            <p>{driving}</p>
          </div>
        </div>
      </div>
    </section>);

}

// ── Registry ────────────────────────────────────────────────────────────────

export function Registry({ items }) {
  return (
    <section id="registry" data-screen-label="05 Registry">
      <div className="section-inner">
        <div className="section-head c-reveal">
          <span className="eyebrow">If you wish</span>
          <h2 className="section-title">Registry</h2>
          <Divider />
          <div className="section-sub">Your presence is gift enough — but if you insist</div>
        </div>
        <div className="registry-grid">
          {items.map((it, i) => {
            const Art = [RegArtKitchen, RegArtSuitcase, RegArtHouse][i % 3];
            const linked = it.url && it.url !== '#';
            const Card = linked ? 'a' : 'div';
            return (
              <Card key={it.title} className={`reg-card c-reveal delay-${i % 3}`}
                    {...(linked ? { href: it.url, target: '_blank', rel: 'noreferrer' } : {})}>
                <div className="reg-art"><Art /></div>
                <h4>{it.title}</h4>
                {it.blurb && <p>{it.blurb}</p>}
                <div className="reg-go">{linked ? 'Visit →' : 'Details soon'}</div>
              </Card>
            );
          })}
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

export function Attire({ dressCode }) {
  return (
    <section id="attire" data-screen-label="07 Attire">
      <div className="section-inner">
        <div className="section-head c-reveal">
          <span className="eyebrow">What to wear</span>
          <h2 className="section-title">Dress Code</h2>
          <div className="section-sub">{dressCode.name}</div>
        </div>

        <div className="attire-grid">
          <div className="attire-text c-reveal">
            <h3>Think wildflower picnic, but dressed up.</h3>
            <p>{dressCode.summary}</p>
            <ul className="attire-tips">
              {dressCode.tips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>

          <div className="palette-card c-reveal delay-1">
            <div className="pc-title">Our colors</div>
            <div className="palette-grid">
              {dressCode.colors.map((p) =>
              <div key={p.hex}>
                  <div className="ps" style={{ background: p.hex }}></div>
                  <div className="palette-swatch-label">{p.name}</div>
                </div>
              )}
            </div>
            <p className="palette-note">
              Use these as a north star — not a uniform.
            </p>
          </div>
        </div>
      </div>
    </section>);

}

// ── FAQ ─────────────────────────────────────────────────────────────────────

export function FAQ({ items }) {
  const [openIdx, setOpenIdx] = React.useState(0);
  return (
    <section id="faq" data-screen-label="08 FAQ">
      <div className="section-inner">
        <div className="section-head c-reveal">
          <span className="eyebrow">Things you might wonder</span>
          <h2 className="section-title">Questions</h2>
          <div className="section-sub">Everything else, answered</div>
        </div>
        <div className="faq-list c-reveal delay-1">
          {items.map((item, i) => {
            const open = i === openIdx;
            return (
              <div key={i} className={`faq-item ${open ? 'open' : ''}`}>
                <button type="button" className="faq-q" aria-expanded={open}
                        onClick={() => setOpenIdx(open ? -1 : i)}>
                  <span>{item.question}</span>
                  <span className="marker" aria-hidden="true"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: open ? 400 : 0 }}>
                  <div className="faq-a-inner">{item.answer}</div>
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}

// ── Footer ──────────────────────────────────────────────────────────────────

const MORE_LINKS = [
  { href: '/story', label: 'Our story' },
  { href: '/party', label: 'Wedding party' },
  { href: '/photos', label: 'Photobooth' },
  { href: '/wishes', label: 'Well wishes' },
];

export function SiteFooter({ couple, dateLine }) {
  return (
    <footer data-screen-label="09 Footer">
      <Branch className="fbranch l no-sway" />
      <Branch flip className="fbranch r no-sway" />
      <div className="fmono">{couple[0]} &amp; {couple[1]}</div>
      <div className="fdate">{dateLine}</div>
      <ul className="flinks">
        {MORE_LINKS.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
      </ul>
    </footer>);

}
