# Wyat & Jaden — Wedding Website Handoff

A single-page wedding website. **May 22, 2027 · Little Flower Barn · Lake Isabella, MI**.

## What's in this bundle

These files are a **working high-fidelity prototype**, not a framework boilerplate. They render correctly when opened directly in a browser — but they use React + Babel **in the browser** (via `<script type="text/babel">`) so the JSX is compiled at page load. That's great for iterating, slow-ish for production.

You have two reasonable paths to deploy:

| Path | What you do | Best for |
| --- | --- | --- |
| **A. Ship as-is** | Drop these files on any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). It Just Works. | Fast, no build step, fine for a wedding site. |
| **B. Port to Vite / Next** | Recreate the components in a real React project; replace the in-browser Babel with a real bundler. | Cleaner, faster page loads, easier to iterate long-term. |

Either way, **the design fidelity is final** — colors, typography, spacing, copy, and behavior are exactly what you saw in the prototype.

---

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell. Loads fonts, React, Babel, and all the component scripts. |
| `styles.css` | All styling — palette tokens at `:root`, every section's layout, hover states, reveal animations. |
| `app.jsx` | Root component. Mounts everything, runs the scroll-reveal observer, manages tweak state, and applies the chosen palette/fonts to CSS variables. |
| `sections.jsx` | Hero, Gallery, Venue, Registry, Attire, FAQ, and Footer components. |
| `countdown.jsx` | The live ticking countdown to the wedding day. |
| `rsvp.jsx` | The RSVP form with validation and accept/decline toggle. |
| `florals.jsx` | The library of inline-SVG floral accents (sprigs, branches, daisies, etc.). |
| `image-slot.js` | A web-component that turns each gallery frame into a drag-and-drop image target. Photos drop onto it persist in `localStorage`. |
| `tweaks-panel.jsx` | The author-only "Tweaks" panel (toolbar toggle). **Safe to delete in production** — it's just for design iteration. |

---

## Design tokens

All colors and fonts live as CSS custom properties on `:root` in `styles.css`. The currently-applied palette is **Wildflower & Honey**:

### Colors

```css
--c-cream:    #f7f2ea;   /* page background */
--c-cream-2:  #ede2cd;   /* alt section bg (venue, attire) */
--c-ink:      #2a1f12;   /* darkest text + footer */
--c-text:     #3d2f1f;   /* body text */
--c-muted:    #6b5a45;   /* small caps, captions */
--c-sage:     #6b7a4a;   /* primary accent */
--c-sage-dk:  #4a5630;   /* button bg, headings on cream */
--c-honey:    #d4a574;   /* warm accent dots, berries */
--c-blush:    #e8b4a8;   /* anemone petals */
--c-terra:    #b85c3c;   /* error states, hover, script accents */
--c-line:     rgba(74, 86, 48, 0.25);   /* 1px hairlines */
```

### Typography

```css
--f-serif:  "Cormorant Garamond", Georgia, serif;   /* headings */
--f-body:   "EB Garamond", Georgia, serif;          /* paragraphs */
--f-script: "Pinyon Script", cursive;               /* section titles & accents */
```

Loaded from Google Fonts in `index.html` — the `<link>` URL also imports the alternates (Playfair, Cardo, Prata, Tangerine, Parisienne, Petit Formal Script) that the Tweaks panel offers. **You can strip those alternates** once you've locked in Cormorant + Pinyon for production speed.

### Scale & rhythm

- **Section padding:** `110px` top/bottom, `40px` sides (`.section-inner` is `max-width: 1100px` centered).
- **Section title:** `clamp(56px, 8vw, 96px)`, Pinyon Script, sage color.
- **Eyebrow text:** `13px`, `letter-spacing: 0.35em`, uppercase, sage.
- **Body:** `19px / 1.55` EB Garamond.
- **Hairlines:** `1px` solid `var(--c-line)`.
- **Card padding:** `36–52px`.
- **Border radius:** `4–6px` for cards, `999px` for buttons.

---

## Sections (in scroll order)

### 1. Hero (`#hero`)

- Names side-by-side with a giant Pinyon ampersand between them
- Date displayed as roman numerals: **May · XXII · MMXXVII**
- Venue line: "Little Flower Barn · Lake Isabella, Michigan"
- **Sage RSVP button** below
- Corner-ornament floral SVGs in all four corners
- "Scroll" cue with a pulsing line at the bottom

### 2. Gallery — "Us, in pictures" (`#story`)

- Asymmetric 12-column grid of 8 photo frames
- Each frame is an `<image-slot>` — drag a photo file from your desktop onto it and it sticks
- Clicking a filled frame opens a fullscreen lightbox; arrow keys + Esc navigate

### 3. Venue (`#venue`)

- Two-column: info card on the left, **embedded Google Map** on the right (`iframe` pinned to 565 N. Coldwater Road)
- Ceremony / Cocktails / Reception times in a horizontal strip
- "Get Directions" (opens Google Maps) + "Add to Calendar" (opens a pre-filled Google Calendar event) buttons
- Below: three travel cards — **Stay, Fly, Drive**

### 4. Countdown (`#countdown`)

- Live ticking days / hours / minutes / seconds in 4 cells with double-bordered frames
- Each digit flips when it changes (CSS keyframe `flip`)
- Target: `2027-05-22T16:30:00-04:00` (ceremony time — change in `app.jsx`)

### 5. Registry (`#registry`)

- 3 cards: **Amazon**, **Honeyfund**, **Moving Fund**
- Each card has a small hand-drawn SVG icon (mixer, suitcase, house)
- Replace the placeholder URLs in `sections.jsx → Registry()` with your real registry links

### 6. Dress Code / Attire (`#attire`)

- "Garden Formal" badge + descriptive copy
- "Yes" / "No" chips for guidance
- Five-swatch color palette card so guests can see what to aim for

### 7. RSVP (`#rsvp`)

- Dark sage background section
- Cream form card with double-border
- **Accept / Decline** toggle pill
- If accepting: name, email, plus-one, meal preference (5 options), dietary notes, song request, note
- If declining: name, email, optional note
- Validates name + email format
- **Currently stores submissions in `localStorage`** — see "Deploy notes" below for hooking up a real backend.

### 8. FAQ (`#faq`)

- 10 expand-collapse questions (only one open at a time)
- The plus-marker rotates/morphs on open

### 9. Footer

- Big Pinyon "Wyat & Jaden" on dark ink
- Date · location underneath

---

## Behavior & interactions

| Where | What |
| --- | --- |
| Page load | All `.reveal` elements fade up as they scroll into view (IntersectionObserver, threshold 0.12, 1100ms ease) |
| Top nav | Transparent at scroll=0, gains a frosted cream bg + hairline border once you scroll past 60px |
| Nav links | Underline grows left-to-right on hover (280ms) |
| Hero RSVP button | Sage → ink on hover, lifts 2px |
| Gallery frames | Drop a photo file to fill; double-click a filled frame to reframe; click to open lightbox |
| Lightbox | Click outside, `Esc`, or × to close. Arrow keys cycle through filled frames. |
| Countdown digits | Flip animation (600ms) on each tick |
| Registry cards | Lift 6px + sage border + soft shadow on hover |
| FAQ items | Expand to `max-height: 400px` over 380ms; plus marker collapses to minus |
| RSVP form | Submit success → replaces form with thank-you state. "Edit reply" button restores the form. |
| Buttons (`.btn`) | All share the same 999px pill, 14px tracked uppercase serif label |

---

## Deploy notes

### Hooking up a real RSVP backend

The form currently does `localStorage.setItem(STORAGE_KEY, JSON.stringify(record))` and calls it a day. To make it real, edit `rsvp.jsx → submit()` and replace the localStorage block with a `fetch()` to whatever endpoint you want. Easy options:

- **[Formspree](https://formspree.io/)** — paste the endpoint URL, done
- **[Netlify Forms](https://docs.netlify.com/forms/setup/)** — add `data-netlify="true"` to the `<form>` element
- **Google Sheets** via [Sheety](https://sheety.co/) or [SheetMonkey](https://sheetmonkey.io/)
- **[Airtable](https://airtable.com/)** — POST to their REST API

Whatever you pick, keep the `submitted` state-flip so guests still see the confirmation screen.

### Real Google Maps

The current `<iframe>` uses the unauthenticated embed. It works but doesn't let you style the map or pin custom markers. If you want a styled version, get a [Google Maps Embed API key](https://developers.google.com/maps/documentation/embed/get-api-key) (free tier is generous) and swap the iframe `src` to:

```
https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=565+N.+Coldwater+Road,+Lake+Isabella,+MI+48893
```

### Removing the Tweaks panel

The tweaks panel only renders when an "Edit mode" host wraps the page. In a normal deployed site it's invisible. **You can also just delete `tweaks-panel.jsx` and remove its `<script>` tag from `index.html`** — then remove the `<TweaksPanel>` block from `app.jsx`. The defaults baked into `TWEAK_DEFAULTS` (top of `app.jsx`) will continue to apply.

### Production build (optional)

To remove the in-browser Babel transformer:

1. `npm create vite@latest wedding -- --template react`
2. Copy each `.jsx` into `src/`, fix the imports (no more `Object.assign(window, ...)` — use proper ESM `export`/`import`)
3. Drop `styles.css` next to `App.jsx`, `import "./styles.css"`
4. Move the Google Fonts `<link>` into the Vite `index.html`
5. `image-slot.js` can stay as a `<script src>` or be imported as a side-effect module
6. `npm run build` → upload `dist/` anywhere

---

## Things to swap before going live

- [ ] **Real engagement photos** — drag onto each frame, OR set the `src` attribute on each `<image-slot>` in `sections.jsx → Gallery()` so they preload for guests
- [ ] **Real registry URLs** — `sections.jsx → Registry()` `items[]`, replace each `url`
- [ ] **Moving Fund link** — currently `"#"` placeholder. Point at Venmo, GoFundMe, or wherever
- [ ] **Hotel group-code** — currently `SOULE-CORLISS`. Update `sections.jsx → Venue()` once Soaring Eagle confirms
- [ ] **Shuttle times** — currently "every 30 min from 3:30 PM" — placeholder
- [ ] **RSVP deadline** — currently April 17, 2027. Adjust in `rsvp.jsx` and in the FAQ
- [ ] **RSVP backend** — see above
- [ ] **Hashtag** — `#SoulMatesAreCorliss` appears in the photo-share FAQ; change or remove
- [ ] **`<title>` and meta description** in `index.html`
- [ ] **Favicon** — none currently set; add one in `index.html`

---

## A note on browser support

Built with: CSS custom properties, CSS grid, `aspect-ratio`, `text-wrap: pretty`, `backdrop-filter`, IntersectionObserver, Web Components (Shadow DOM), `localStorage`. All ship in every browser released in the last 3 years. Older Safari (<15) will fall back gracefully — `text-wrap: pretty` and `backdrop-filter` just no-op.

---

## Questions

Anything unclear in here, ping back and I'll clarify or add a section. Otherwise — congratulations on the engagement, and happy coding. 🌿
