// Floral SVG library — hand-drawn botanical accents for the wedding site.
// Each component takes optional className/style; stroke uses currentColor so
// callers can tint by setting `color` on the wrapper.
//
// All florals have a subtle CSS sway animation (defined in styles.css) — pass
// className="no-sway" to opt out (e.g. inside the countdown petals).

// ── Foliage helpers ──────────────────────────────────────────────────────────
// Stems are cubic Béziers; leaves are placed along them, alternating sides,
// angled toward the tip and shrinking as they go. Leaves are soft filled
// shapes with a fine vein rather than outlined ovals.

function bezierPoint([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

const stemD = ([p0, p1, p2, p3]) =>
  `M${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`;

// A pointed, slightly asymmetric leaf lying along +x from its base at 0,0.
const leafD = (len, w) =>
  `M0 0 C ${len * 0.22} ${-w}, ${len * 0.68} ${-w * 0.95}, ${len} 0 ` +
  `C ${len * 0.66} ${w * 0.8}, ${len * 0.24} ${w * 0.85}, 0 0 Z`;

const LeafShape = ({ x, y, angle, len, width, opacity = 0.7 }) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(1)})`}>
    <path d={leafD(len, width)} fill="currentColor" fillOpacity={opacity} />
    <path d={`M${len * 0.06} 0 Q ${len * 0.5} ${-width * 0.12}, ${len * 0.9} 0`}
          stroke="#fffaf0" strokeOpacity="0.45" strokeWidth={Math.max(0.4, width * 0.07)}
          strokeLinecap="round" fill="none" />
  </g>
);

// Renders a tapered stem with leaves along it.
//   count   number of side leaves
//   size    length of the largest leaf
//   spread  leaf angle away from the stem, degrees
function Stem({ curve, count, size, spread = 42, from = 0.1, to = 0.9, ratio = 0.34,
                weight = 1.4, tipLeaf = true, flipSides = false }) {
  const leaves = [];
  for (let i = 0; i < count; i++) {
    const t = from + ((to - from) * i) / Math.max(1, count - 1);
    const p = bezierPoint(curve, t);
    const side = (i % 2 === 0) !== flipSides ? -1 : 1;
    const len = size * (1 - 0.45 * t) * (i % 3 === 1 ? 0.9 : 1);
    const opacity = 0.55 + ((i * 37) % 25) / 100;
    leaves.push(
      <LeafShape key={i} x={p.x} y={p.y} angle={p.angle + side * spread}
                 len={len} width={len * ratio} opacity={opacity} />,
    );
  }
  const tip = bezierPoint(curve, 1);
  const d = stemD(curve);
  return (
    <g>
      <path d={d} stroke="currentColor" strokeWidth={weight * 0.6} strokeLinecap="round" fill="none" />
      <path d={d} pathLength="1" strokeDasharray="0.55 1" stroke="currentColor"
            strokeWidth={weight} strokeLinecap="round" fill="none" />
      {leaves}
      {tipLeaf && (
        <LeafShape x={tip.x} y={tip.y} angle={tip.angle} len={size * 0.5}
                   width={size * 0.5 * ratio} opacity={0.8} />
      )}
    </g>
  );
}

// A small five-petal bloom with pointed petals and a honey center.
const Bloom = ({ x, y, r = 10, rotate = 0, petal = "var(--c-blush)" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <path key={i}
            d={`M0 0 C ${-r * 0.5} ${-r * 0.35}, ${-r * 0.42} ${-r * 0.95}, 0 ${-r} C ${r * 0.42} ${-r * 0.95}, ${r * 0.5} ${-r * 0.35}, 0 0 Z`}
            fill={petal} fillOpacity="0.92" transform={`rotate(${i * 72})`} />
    ))}
    <circle r={r * 0.22} fill="var(--c-honey)" />
  </g>
);

// ── Single leaf ─────────────────────────────────────────────────────────────
export const Leaf = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral leaf ${className}`} style={style}
       viewBox="0 0 40 80" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <LeafShape x={20} y={78} angle={-90} len={74} width={15} opacity={0.75} />
  </svg>
);

// ── Upright sprig — a gently curving stem of pointed leaves ────────────────
export const Sprig = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral sprig ${className}`} style={style}
       viewBox="0 0 120 280" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <Stem curve={[[62, 276], [48, 200], [74, 110], [58, 14]]}
          count={10} size={50} spread={40} from={0.12} to={0.9} />
  </svg>
);

// ── Fern-style frond — narrow leaflets along a curved stem ────────────────
export const Fern = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral fern ${className}`} style={style}
       viewBox="0 0 140 320" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <Stem curve={[[70, 314], [58, 220], [82, 110], [68, 10]]}
          count={22} size={44} spread={58} ratio={0.18} from={0.06} to={0.94} weight={1.2} />
  </svg>
);

// ── Simple wildflower (5-petal daisy) ──────────────────────────────────────
export const Daisy = ({ className = "", style = {}, color = "currentColor",
                centerColor = "var(--c-honey)" }) => (
  <svg className={`floral daisy ${className}`} style={style}
       viewBox="0 0 60 60" fill="none">
    {Array.from({ length: 5 }).map((_, i) => (
      <path key={i}
            d="M30 30 C 22 24, 23 10, 30 4 C 37 10, 38 24, 30 30 Z"
            fill={color} fillOpacity="0.88"
            transform={`rotate(${i * 72} 30 30)`} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <path key={`v${i}`} d="M30 27 L 30 10" stroke="#fffaf0" strokeOpacity="0.35"
            strokeWidth="0.8" strokeLinecap="round"
            transform={`rotate(${i * 72} 30 30)`} />
    ))}
    <circle cx="30" cy="30" r="5" fill={centerColor} />
    <circle cx="30" cy="30" r="5" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
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
    <Stem curve={[[8, 92], [120, 84], [250, 46], [372, 32]]}
          count={11} size={40} spread={38} from={0.08} to={0.88} />
    {/* Berries near the tip */}
    <path d="M352 36 C 362 30, 372 22, 384 20 M356 35 C 366 38, 376 44, 386 44"
          stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    <circle cx="385" cy="19" r="3.4" fill="var(--c-honey)" />
    <circle cx="388" cy="44" r="3" fill="var(--c-honey)" />
    <circle cx="376" cy="27" r="2.4" fill="var(--c-honey)" fillOpacity="0.85" />
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
    {/* Secondary stem branching off the main one */}
    <Stem curve={[[44, 50], [74, 58], [96, 76], [108, 104]]}
          count={4} size={20} spread={44} from={0.25} to={0.85} weight={1} flipSides />
    {/* Main stem */}
    <Stem curve={[[2, 2], [26, 64], [98, 118], [190, 146]]}
          count={9} size={30} spread={40} from={0.08} to={0.86} />
    {/* Blooms and a bud */}
    <path d="M128 128 C 136 140, 140 150, 142 160" stroke="currentColor"
          strokeWidth="0.8" strokeLinecap="round" fill="none" />
    <Bloom x={143} y={163} r={11} rotate={12} />
    <Bloom x={110} y={108} r={7.5} rotate={-20} petal="var(--c-honey)" />
    <path d="M170 141 C 176 134, 178 128, 178 122" stroke="currentColor"
          strokeWidth="0.7" strokeLinecap="round" fill="none" />
    <path d="M178 112 C 174 116, 174 122, 178 124 C 182 122, 182 116, 178 112 Z"
          fill="var(--c-blush)" fillOpacity="0.9" />
  </svg>
);

// ── Tiny ampersand-flanking sprig (used in hero monogram) ──────────────────
export const MiniSprig = ({ className = "", style = {}, flip = false }) => (
  <svg className={`floral mini-sprig ${className}`} style={style}
       viewBox="0 0 50 30" fill="none"
       transform={flip ? "scale(-1,1)" : ""}>
    <Stem curve={[[2, 17], [14, 14], [28, 11], [44, 9]]}
          count={4} size={11} spread={40} weight={0.9} />
  </svg>
);

// ── Falling petal (animated in countdown) ──────────────────────────────────
export const Petal = ({ className = "", style = {}, color = "var(--c-blush)" }) => (
  <svg className={`floral petal ${className}`} style={style}
       viewBox="0 0 20 30" fill="none">
    <path d="M10 2 C 4 8, 4 22, 10 28 C 16 22, 16 8, 10 2 Z"
          fill={color} fillOpacity="0.9"/>
  </svg>
);
