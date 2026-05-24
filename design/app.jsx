// Root app — composes nav + all sections, manages tweak state, and
// installs the IntersectionObserver that drives the .reveal animation.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "wildflower",
  "headingFont": "cormorant",
  "scriptFont": "pinyon",
  "floralDensity": "subtle",
  "swaySpeed": 1
}/*EDITMODE-END*/;

// Palettes — each is the full set of CSS color tokens we apply at runtime.
const PALETTES = {
  wildflower: {
    label: "Wildflower & Honey",
    swatch: ['#6b7a4a', '#d4a574', '#b85c3c'],
    tokens: {
      '--c-cream':   '#f7f2ea',
      '--c-cream-2': '#ede2cd',
      '--c-ink':     '#2a1f12',
      '--c-text':    '#3d2f1f',
      '--c-muted':   '#6b5a45',
      '--c-sage':    '#6b7a4a',
      '--c-sage-dk': '#4a5630',
      '--c-honey':   '#d4a574',
      '--c-blush':   '#e8b4a8',
      '--c-terra':   '#b85c3c',
      '--c-line':    'rgba(74, 86, 48, 0.25)',
    },
  },
  forest: {
    label: "Forest & Warm Wood",
    swatch: ['#2d3d1f', '#735738', '#c4a26d'],
    tokens: {
      '--c-cream':   '#ede4d3',
      '--c-cream-2': '#dccdb3',
      '--c-ink':     '#1c2410',
      '--c-text':    '#2d3d1f',
      '--c-muted':   '#5a4a35',
      '--c-sage':    '#4a5b30',
      '--c-sage-dk': '#2d3d1f',
      '--c-honey':   '#c4a26d',
      '--c-blush':   '#d4b899',
      '--c-terra':   '#8b5a3c',
      '--c-line':    'rgba(45, 61, 31, 0.3)',
    },
  },
  sage: {
    label: "Sage & Cream",
    swatch: ['#556b3d', '#7a8a5a', '#a8b48a'],
    tokens: {
      '--c-cream':   '#f5f1e8',
      '--c-cream-2': '#e8e2d2',
      '--c-ink':     '#2c331e',
      '--c-text':    '#4a3a28',
      '--c-muted':   '#6f6852',
      '--c-sage':    '#7a8a5a',
      '--c-sage-dk': '#556b3d',
      '--c-honey':   '#c8b888',
      '--c-blush':   '#d8c8b0',
      '--c-terra':   '#a08868',
      '--c-line':    'rgba(85, 107, 61, 0.25)',
    },
  },
  mossy: {
    label: "Mossy & Earthy",
    swatch: ['#2d3d1f', '#556b3d', '#8b6f47'],
    tokens: {
      '--c-cream':   '#e8e2d2',
      '--c-cream-2': '#d8d0bd',
      '--c-ink':     '#1f2814',
      '--c-text':    '#2d3d1f',
      '--c-muted':   '#5a5238',
      '--c-sage':    '#556b3d',
      '--c-sage-dk': '#2d3d1f',
      '--c-honey':   '#a88a5a',
      '--c-blush':   '#bfa580',
      '--c-terra':   '#8b6f47',
      '--c-line':    'rgba(45, 61, 31, 0.3)',
    },
  },
  garden: {
    label: "Garden & Blush",
    swatch: ['#3a4a2a', '#e8b4a8', '#a89070'],
    tokens: {
      '--c-cream':   '#f4ede0',
      '--c-cream-2': '#ecdcc8',
      '--c-ink':     '#2a3318',
      '--c-text':    '#3a4a2a',
      '--c-muted':   '#7a6852',
      '--c-sage':    '#5a6a3a',
      '--c-sage-dk': '#3a4a2a',
      '--c-honey':   '#d4a574',
      '--c-blush':   '#e8b4a8',
      '--c-terra':   '#b87060',
      '--c-line':    'rgba(58, 74, 42, 0.25)',
    },
  },
};

const HEADING_FONTS = {
  cormorant: { label: "Cormorant",       stack: '"Cormorant Garamond", Georgia, serif' },
  playfair:  { label: "Playfair",        stack: '"Playfair Display", Georgia, serif' },
  cardo:     { label: "Cardo",           stack: '"Cardo", Georgia, serif' },
  prata:     { label: "Prata",           stack: '"Prata", Georgia, serif' },
};
const SCRIPT_FONTS = {
  pinyon:    { label: "Pinyon",     stack: '"Pinyon Script", cursive' },
  tangerine: { label: "Tangerine",  stack: '"Tangerine", cursive' },
  parisienne:{ label: "Parisienne", stack: '"Parisienne", cursive' },
  petit:     { label: "Petit Formal", stack: '"Petit Formal Script", cursive' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scrolled, setScrolled] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Apply tweak tokens to :root whenever they change.
  React.useEffect(() => {
    const root = document.documentElement;
    const palette = PALETTES[t.palette] || PALETTES.wildflower;
    Object.entries(palette.tokens).forEach(([k, v]) => root.style.setProperty(k, v));
    const h = HEADING_FONTS[t.headingFont] || HEADING_FONTS.cormorant;
    const s = SCRIPT_FONTS[t.scriptFont]  || SCRIPT_FONTS.pinyon;
    root.style.setProperty('--f-serif', h.stack);
    root.style.setProperty('--f-body', h.stack);
    root.style.setProperty('--f-script', s.stack);
    root.style.setProperty('--sway-speed', String(1 / (t.swaySpeed || 1)));
    root.setAttribute('data-floral', t.floralDensity);
  }, [t]);

  // Scroll-driven nav state
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal-on-scroll observer
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const nav = [
    { href: '#story',    label: 'Story' },
    { href: '#venue',    label: 'Venue' },
    { href: '#countdown',label: 'Countdown' },
    { href: '#registry', label: 'Registry' },
    { href: '#attire',   label: 'Attire' },
    { href: '#faq',      label: 'FAQ' },
  ];

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''} ${drawerOpen ? 'nav-drawer open' : ''}`}>
        <a href="#hero" className="nav-mono" onClick={() => setDrawerOpen(false)}>
          W &amp; J
        </a>
        <div className="nav-links">
          {nav.map(n => (
            <a key={n.href} href={n.href} onClick={() => setDrawerOpen(false)}>
              {n.label}
            </a>
          ))}
        </div>
        <a href="#rsvp" className="nav-cta" onClick={() => setDrawerOpen(false)}>RSVP</a>
        <button className={`nav-burger ${drawerOpen ? 'open' : ''}`}
                aria-label="Menu"
                onClick={() => setDrawerOpen(o => !o)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      <Hero
        couple={['Wyat', 'Jaden']}
        dateText={{ month: 'May', day: 'XXII', year: 'MMXXVII' }}
        venueShort="Little Flower Barn · Lake Isabella, Michigan"
      />
      <Gallery />
      <Venue venue={{
        address: '565 N. Coldwater Road, Lake Isabella, MI 48893',
        dateStart: '2027-05-22',
        dateEnd: '2027-05-23',
        calTitle: 'Wyat & Jaden\'s Wedding',
        calDetails: 'Ceremony at 4:30 PM. Garden formal attire.',
      }} />
      <Countdown targetISO="2027-05-22T16:30:00-04:00" />
      <Registry />
      <Attire />
      <RSVP />
      <FAQ />
      <SiteFooter />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <PalettePicker value={t.palette}
                       onChange={(v) => setTweak('palette', v)} />
        <TweakSection label="Typography" />
        <TweakSelect label="Heading"
          value={t.headingFont}
          options={Object.entries(HEADING_FONTS).map(([k, v]) => ({ value: k, label: v.label }))}
          onChange={(v) => setTweak('headingFont', v)} />
        <TweakSelect label="Script"
          value={t.scriptFont}
          options={Object.entries(SCRIPT_FONTS).map(([k, v]) => ({ value: k, label: v.label }))}
          onChange={(v) => setTweak('scriptFont', v)} />
        <TweakSection label="Florals" />
        <TweakRadio label="Density"
          value={t.floralDensity}
          options={['subtle', 'moderate', 'lush']}
          onChange={(v) => setTweak('floralDensity', v)} />
      </TweaksPanel>
    </>
  );
}

// TweakColor expects options to be hex strings OR arrays of hex strings.
// We pass {value, label, colors} objects — patch them to the array shape
// by reading "colors" if present.
// (No — easier: just pass plain color arrays. Refactor below.)

// Custom palette picker — shows the 5 named palettes as labeled swatch rows
// rather than fighting TweakColor's hex-only contract.
function PalettePicker({ value, onChange }) {
  return (
    <div className="twk-row" style={{flexDirection: 'column', alignItems: 'stretch', gap: 8}}>
      <div className="twk-lbl"><span>Palette</span></div>
      <div style={{display: 'grid', gap: 6}}>
        {Object.entries(PALETTES).map(([key, p]) => {
          const on = key === value;
          return (
            <button key={key} type="button"
              onClick={() => onChange(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 9px', borderRadius: 8,
                border: on ? '1.5px solid #2a1f12' : '1px solid rgba(0,0,0,0.12)',
                background: on ? 'rgba(42,31,18,0.05)' : 'transparent',
                cursor: 'pointer', textAlign: 'left',
                font: 'inherit', color: 'inherit',
              }}>
              <span style={{display: 'flex', flex: 'none', borderRadius: 4, overflow: 'hidden',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.08)'}}>
                {p.swatch.map((c, i) => (
                  <i key={i} style={{display:'block', width: 14, height: 22, background: c}}/>
                ))}
              </span>
              <span style={{fontSize: 12, lineHeight: 1.2}}>{p.label}</span>
              {on && <span style={{marginLeft: 'auto', fontSize: 12}}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Re-mount with a small wrapper so the TweakColor sees arrays not objects.
function AppMount() {
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppMount />);
