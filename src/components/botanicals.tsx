// Hand-drawn botanicals. Stems and leaves share one leaf shape (see Leaf) and
// the placement helpers in vine-geometry.

import { curve as rounded, heading, leavesAlong, stemPath, type LeafSpot } from "./vine-geometry";

type Props = { className?: string };

// A pointed leaf with a short stalk and a center vein, drawn pointing right
// from its base at (0, 0). `size` is roughly its length.
export function Leaf({ spot, fill, vein = "var(--color-paper)" }: { spot: LeafSpot; fill: string; vein?: string }) {
  return (
    <g transform={`translate(${spot.x} ${spot.y}) rotate(${spot.angle}) scale(${spot.size / 18})`}>
      <LeafShape fill={fill} vein={vein} />
    </g>
  );
}

export function LeafShape({ fill, vein = "var(--color-paper)" }: { fill: string; vein?: string }) {
  return (
    <>
      <path d="M0 0 L3 0" stroke={fill} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 0 C 5 -5.6, 11.5 -7, 18 0 C 11.5 5.2, 5 4.6, 2.5 0 Z" fill={fill} />
      <path d="M3.5 0 Q 10 -0.9 16 -0.2" fill="none" stroke={vein} strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" />
    </>
  );
}

// A small curl coming off the stem.
export function Tendril({ x, y, angle, side, color }: { x: number; y: number; angle: number; side: 1 | -1; color: string }) {
  return (
    <path
      d="M0 0 C 3 -1, 7 -5, 6 -9 C 5.4 -11.5, 2.4 -11.2, 2.6 -8.6"
      transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${-side})`}
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
    />
  );
}

export function Fern({ className }: Props) {
  const leaves = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 260" fill="none" className={className} aria-hidden="true">
      <path d="M60 255 C 58 190, 62 120, 60 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map((i) => {
        const y = 230 - i * 24;
        const len = 46 - i * 4;
        return (
          <g key={i} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d={`M60 ${y} C ${60 - len * 0.5} ${y - 6}, ${60 - len * 0.9} ${y - 16}, ${60 - len} ${y - 22} C ${60 - len * 0.7} ${y - 8}, ${60 - len * 0.35} ${y - 2}, 60 ${y}`} fill="currentColor" fillOpacity="0.12" />
            <path d={`M60 ${y - 6} C ${60 + len * 0.5} ${y - 12}, ${60 + len * 0.9} ${y - 22}, ${60 + len} ${y - 28} C ${60 + len * 0.7} ${y - 14}, ${60 + len * 0.35} ${y - 8}, 60 ${y - 6}`} fill="currentColor" fillOpacity="0.12" />
          </g>
        );
      })}
    </svg>
  );
}

// A small divider sprig: a gently bowed stem with leaves and a bud at the tip.
const sprigCurve = rounded((t) => ({
  x: 8 + 150 * t,
  y: 58 - 30 * t - 14 * Math.sin(Math.PI * t),
}));

export function Sprig({ className }: Props) {
  const leaves = leavesAlong(sprigCurve, 9, { start: 0.08, end: 0.86, sizeFrom: 26, sizeTo: 15, spread: 52 });
  const tip = sprigCurve(1);
  return (
    <svg viewBox="0 0 170 70" className={className} aria-hidden="true">
      <path d={stemPath(sprigCurve)} fill="none" stroke="var(--color-fern-dark)" strokeWidth="1.5" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <Leaf key={i} spot={l} fill={i % 3 === 1 ? "var(--color-sage)" : "var(--color-fern)"} />
      ))}
      <BloomShape x={tip.x} y={tip.y} scale={0.36} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
    </svg>
  );
}

// A bloom drawn inside another SVG, centered on (x, y).
export function BloomShape({ x, y, scale = 1, petal, center }: { x: number; y: number; scale?: number; petal: string; center: string }) {
  return (
    <g transform={`translate(${x - 20 * scale} ${y - 20 * scale}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d="M20 20 C 13 14, 14 3, 20 2 C 26 3, 27 14, 20 20 Z" fill={petal} transform={`rotate(${r} 20 20)`} />
      ))}
      {[36, 108, 180, 252, 324].map((r) => (
        <path key={r} d="M20 20 L20 9" stroke={center} strokeOpacity="0.5" strokeWidth="0.8" transform={`rotate(${r - 36} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="4.5" fill={center} />
    </g>
  );
}

// Two vines climbing from the bottom corners and meeting under a flower at the top.
const arcLeft = rounded((t) => {
  const a = Math.PI - t * (Math.PI / 2 - 0.08);
  return { x: 150 + Math.cos(a) * 128, y: 178 - Math.sin(a) * 152 };
});
const arcRight = rounded((t) => {
  const p = arcLeft(t);
  return { x: 300 - p.x, y: p.y };
});

export function Arch({ className }: Props) {
  const sides = [arcLeft, arcRight].map((curve, s) => ({
    curve,
    leaves: leavesAlong(curve, 13, { start: 0.04, end: 0.9, sizeFrom: 22, sizeTo: 12, spread: 46, firstSide: s === 0 ? 1 : -1 }),
  }));
  const buttercup = { petal: "var(--color-buttercup)", center: "var(--color-fern-dark)" };
  const foxglove = { petal: "var(--color-foxglove)", center: "var(--color-buttercup)" };
  // Mirror the positions but swap the colors so the two sides aren't identical.
  const blooms = [
    [{ t: 0.36, scale: 0.5, ...buttercup }, { t: 0.68, scale: 0.42, ...foxglove }],
    [{ t: 0.36, scale: 0.5, ...foxglove }, { t: 0.68, scale: 0.42, ...buttercup }],
  ];

  return (
    <svg viewBox="0 0 300 190" fill="none" className={className} aria-hidden="true">
      {sides.map(({ curve, leaves }, s) => (
        <g key={s}>
          <path d={stemPath(curve)} stroke="var(--color-fern-dark)" strokeWidth="1.5" strokeLinecap="round" />
          {[0.2, 0.52, 0.8].map((t, i) => {
            const p = curve(t);
            const side = (i % 2 === 0 ? -1 : 1) * (s === 0 ? 1 : -1);
            return <Tendril key={t} x={p.x} y={p.y} angle={heading(curve, t)} side={side as 1 | -1} color="var(--color-fern)" />;
          })}
          {leaves.map((l, i) => (
            <Leaf key={i} spot={l} fill={i % 3 === 2 ? "var(--color-sage)" : i % 3 === 1 ? "var(--color-fern-dark)" : "var(--color-fern)"} />
          ))}
          {blooms[s].map((b) => {
            const p = curve(b.t);
            return <BloomShape key={b.t} x={p.x} y={p.y} scale={b.scale} petal={b.petal} center={b.center} />;
          })}
        </g>
      ))}
      <BloomShape x={150} y={22} scale={0.95} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
      <BloomShape x={128} y={30} scale={0.45} petal="var(--color-buttercup)" center="var(--color-fern-dark)" />
      <BloomShape x={172} y={30} scale={0.45} petal="var(--color-buttercup)" center="var(--color-fern-dark)" />
    </svg>
  );
}
