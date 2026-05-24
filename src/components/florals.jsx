// Floral SVG library — hand-drawn botanical accents for the wedding site.
// Each component takes optional className/style; stroke uses currentColor so
// callers can tint by setting `color` on the wrapper.
//
// All florals have a subtle CSS sway animation (defined in styles.css) — pass
// className="no-sway" to opt out (e.g. inside the countdown petals).

// ── Single leaf — almond-shaped, with center vein ───────────────────────────
export const Leaf = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral leaf ${className}`} style={style}
       viewBox="0 0 40 80" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <path d="M20 4 C 6 20, 4 50, 20 76 C 36 50, 34 20, 20 4 Z"
          fill="currentColor" fillOpacity="0.18"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M20 6 L 20 74" stroke="currentColor" strokeWidth="0.9"
          strokeLinecap="round"/>
  </svg>
);

// ── Eucalyptus-style sprig — a stem with alternating round leaves ──────────
export const Sprig = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral sprig ${className}`} style={style}
       viewBox="0 0 120 280" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    {/* Stem */}
    <path d="M60 8 C 56 60, 64 130, 58 200 C 54 240, 62 268, 60 274"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Pairs of round leaves */}
    {[30, 60, 95, 130, 165, 200, 235].map((y, i) => {
      const rotL = -25 + (i * 3);
      const rotR =  25 - (i * 3);
      return (
        <g key={i}>
          <ellipse cx={60 - 22} cy={y} rx="14" ry="10"
                   fill="currentColor" fillOpacity="0.22"
                   stroke="currentColor" strokeWidth="0.9"
                   transform={`rotate(${rotL} ${60 - 22} ${y})`}/>
          <ellipse cx={60 + 22} cy={y + 6} rx="14" ry="10"
                   fill="currentColor" fillOpacity="0.22"
                   stroke="currentColor" strokeWidth="0.9"
                   transform={`rotate(${rotR} ${60 + 22} ${y + 6})`}/>
        </g>
      );
    })}
    {/* Top tip */}
    <ellipse cx="60" cy="12" rx="9" ry="6" fill="currentColor"
             fillOpacity="0.3" stroke="currentColor" strokeWidth="0.9"/>
  </svg>
);

// ── Fern-style frond — narrow leaflets along a curved stem ────────────────
export const Fern = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral fern ${className}`} style={style}
       viewBox="0 0 140 320" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <path d="M70 10 C 60 80, 80 160, 65 240 C 58 280, 70 305, 70 314"
          stroke="currentColor" strokeWidth="1.3" fill="none"
          strokeLinecap="round"/>
    {Array.from({ length: 18 }).map((_, i) => {
      const t = i / 17;
      const y = 20 + t * 280;
      const baseX = 70 + Math.sin(t * 2.2) * 6;
      const len = 32 - Math.abs(t - 0.5) * 30;
      const tilt = 18 + t * 12;
      return (
        <g key={i}>
          <path d={`M${baseX} ${y} Q ${baseX - len * 0.5} ${y + 4}, ${baseX - len} ${y - 6}`}
                stroke="currentColor" strokeWidth="1.1" fill="none"
                strokeLinecap="round" opacity="0.85"
                transform={`rotate(${-tilt} ${baseX} ${y})`}/>
          <path d={`M${baseX} ${y + 6} Q ${baseX + len * 0.5} ${y + 10}, ${baseX + len} ${y}`}
                stroke="currentColor" strokeWidth="1.1" fill="none"
                strokeLinecap="round" opacity="0.85"
                transform={`rotate(${tilt} ${baseX} ${y + 6})`}/>
        </g>
      );
    })}
  </svg>
);

// ── Simple wildflower (5-petal daisy) ──────────────────────────────────────
export const Daisy = ({ className = "", style = {}, color = "currentColor",
                centerColor = "var(--c-honey)" }) => (
  <svg className={`floral daisy ${className}`} style={style}
       viewBox="0 0 60 60" fill="none">
    {Array.from({ length: 5 }).map((_, i) => {
      const a = (i * 360 / 5) - 90;
      return (
        <ellipse key={i} cx="30" cy="14" rx="6" ry="13"
                 fill={color} fillOpacity="0.85"
                 stroke="currentColor" strokeWidth="0.8"
                 transform={`rotate(${a} 30 30)`}/>
      );
    })}
    <circle cx="30" cy="30" r="5" fill={centerColor}
            stroke="currentColor" strokeWidth="0.8"/>
  </svg>
);

// ── Anemone — looser 6-petal with dark center ──────────────────────────────
export const Anemone = ({ className = "", style = {},
                  petal = "var(--c-blush)",
                  center = "var(--c-ink)" }) => (
  <svg className={`floral anemone ${className}`} style={style}
       viewBox="0 0 80 80" fill="none">
    {Array.from({ length: 6 }).map((_, i) => {
      const a = (i * 60);
      return (
        <path key={i}
              d="M40 12 C 32 18, 30 28, 40 38 C 50 28, 48 18, 40 12 Z"
              fill={petal} fillOpacity="0.92"
              stroke="currentColor" strokeWidth="0.8"
              transform={`rotate(${a} 40 40)`}/>
      );
    })}
    <circle cx="40" cy="40" r="7" fill={center}/>
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i * 36) * Math.PI / 180;
      return (
        <circle key={i} cx={40 + Math.cos(a) * 9} cy={40 + Math.sin(a) * 9}
                r="0.9" fill="var(--c-honey)"/>
      );
    })}
  </svg>
);

// ── Branch — for corner/border accents ─────────────────────────────────────
export const Branch = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral branch ${className}`} style={style}
       viewBox="0 0 400 120" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <path d="M10 90 C 80 78, 160 60, 240 50 C 310 42, 360 36, 392 30"
          stroke="currentColor" strokeWidth="1.4" fill="none"
          strokeLinecap="round"/>
    {/* Side leaves */}
    {[
      { x: 60, y: 84, r: -20 },
      { x: 95, y: 72, r: 25 },
      { x: 140, y: 70, r: -18 },
      { x: 180, y: 58, r: 22 },
      { x: 220, y: 56, r: -15 },
      { x: 260, y: 44, r: 18 },
      { x: 300, y: 42, r: -12 },
      { x: 340, y: 34, r: 16 },
    ].map((l, i) => (
      <ellipse key={i} cx={l.x} cy={l.y} rx="14" ry="6"
               fill="currentColor" fillOpacity="0.22"
               stroke="currentColor" strokeWidth="0.9"
               transform={`rotate(${l.r} ${l.x} ${l.y})`}/>
    ))}
    {/* Berries near the tip */}
    <circle cx="378" cy="28" r="3" fill="var(--c-honey)"
            stroke="currentColor" strokeWidth="0.7"/>
    <circle cx="386" cy="34" r="2.5" fill="var(--c-honey)"
            stroke="currentColor" strokeWidth="0.7"/>
    <circle cx="372" cy="36" r="2.2" fill="var(--c-honey)"
            stroke="currentColor" strokeWidth="0.7"/>
  </svg>
);

// ── Section divider — symmetric branches meeting at a center bloom ─────────
export const Divider = ({ className = "", style = {} }) => (
  <div className={`floral-divider ${className}`} style={style}>
    <Branch flip className="div-arm" />
    <Daisy className="div-bloom" />
    <Branch className="div-arm" />
  </div>
);

// ── Corner ornament — a curved branch tucked into a corner ─────────────────
export const CornerOrnament = ({ className = "", style = {}, flip = false, flipY = false }) => (
  <svg className={`floral corner ${className}`} style={style}
       viewBox="0 0 200 200" fill="none"
       transform={`scale(${flip ? -1 : 1}, ${flipY ? -1 : 1})`}>
    <path d="M8 8 C 30 60, 80 100, 140 130 C 170 144, 190 152, 196 158"
          stroke="currentColor" strokeWidth="1.3" fill="none"
          strokeLinecap="round"/>
    {[
      { x: 30, y: 38, rx: 10, ry: 5, r: 35 },
      { x: 55, y: 68, rx: 11, ry: 5, r: -28 },
      { x: 88, y: 96, rx: 12, ry: 5, r: 30 },
      { x: 120, y: 118, rx: 12, ry: 5, r: -25 },
      { x: 155, y: 138, rx: 11, ry: 5, r: 28 },
    ].map((l, i) => (
      <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry}
               fill="currentColor" fillOpacity="0.22"
               stroke="currentColor" strokeWidth="0.9"
               transform={`rotate(${l.r} ${l.x} ${l.y})`}/>
    ))}
    <g transform="translate(150 140)">
      <circle r="6" fill="currentColor" fillOpacity="0.15"/>
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse key={i} cx="0" cy="-10" rx="3.5" ry="7"
                 fill="var(--c-blush)" stroke="currentColor"
                 strokeWidth="0.7"
                 transform={`rotate(${i * 72})`}/>
      ))}
      <circle r="2.5" fill="var(--c-honey)"/>
    </g>
  </svg>
);

// ── Tiny ampersand-flanking sprig (used in hero monogram) ──────────────────
export const MiniSprig = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral mini-sprig ${className}`} style={style}
       viewBox="0 0 50 30" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <path d="M2 15 C 14 12, 28 10, 46 8"
          stroke="currentColor" strokeWidth="1.1" fill="none"
          strokeLinecap="round"/>
    {[{ x: 12, y: 14, r: -22 }, { x: 22, y: 11, r: 18 },
      { x: 32, y: 9, r: -16 }, { x: 40, y: 8, r: 14 }].map((l, i) => (
      <ellipse key={i} cx={l.x} cy={l.y} rx="5" ry="2.2"
               fill="currentColor" fillOpacity="0.25"
               stroke="currentColor" strokeWidth="0.8"
               transform={`rotate(${l.r} ${l.x} ${l.y})`}/>
    ))}
  </svg>
);

// ── Falling petal (animated in countdown) ──────────────────────────────────
export const Petal = ({ className = "", style = {}, color = "var(--c-blush)" }) => (
  <svg className={`floral petal ${className}`} style={style}
       viewBox="0 0 20 30" fill="none">
    <path d="M10 2 C 4 8, 4 22, 10 28 C 16 22, 16 8, 10 2 Z"
          fill={color} fillOpacity="0.9"
          stroke="currentColor" strokeWidth="0.7"/>
  </svg>
);
