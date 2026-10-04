// Fine-line botanicals in a pen-and-wash style: thin ink outlines with a soft
// watercolor fill underneath. With `animate`, the ink draws itself in (.draw)
// and the wash fades up afterwards (.wash); timing comes from the --at variable.

import type { CSSProperties } from "react";
import { curve as rounded, heading, leavesAlong, stemPath, type LeafSpot } from "./vine-geometry";

const INK = "var(--color-fern-dark)";
const at = (s: number) => ({ "--at": `${s.toFixed(2)}s` }) as CSSProperties;

type Anim = { animate?: boolean; delay?: number };
const drawProps = ({ animate, delay = 0 }: Anim) =>
  animate ? { pathLength: 1, className: "draw", style: at(delay) } : {};
const washProps = ({ animate, delay = 0 }: Anim) => (animate ? { className: "wash", style: at(delay + 1) } : {});

const LEAF = "M2.5 0 C 5 -5.6, 11.5 -7, 18 0 C 11.5 5.2, 5 4.6, 2.5 0 Z";

// One leaf pointing right from its base at (0, 0), about 18 units long.
export function LeafShape({ fill = "var(--color-sage)", ...anim }: { fill?: string } & Anim) {
  return (
    <>
      <path d={LEAF} fill={fill} fillOpacity="0.35" stroke="none" {...washProps(anim)} />
      <path d={LEAF} fill="none" stroke={INK} strokeWidth="0.7" strokeLinejoin="round" {...drawProps(anim)} />
      <path d="M0 0 L 15 -0.4" fill="none" stroke={INK} strokeWidth="0.55" strokeLinecap="round" {...drawProps({ ...anim, delay: (anim.delay ?? 0) + 0.15 })} />
    </>
  );
}

export function Leaf({ spot, fill, ...anim }: { spot: LeafSpot; fill?: string } & Anim) {
  return (
    <g transform={`translate(${spot.x} ${spot.y}) rotate(${spot.angle}) scale(${spot.size / 18})`}>
      <LeafShape fill={fill} {...anim} />
    </g>
  );
}

export function Tendril({ x, y, angle, side, ...anim }: { x: number; y: number; angle: number; side: 1 | -1; color?: string } & Anim) {
  return (
    <path
      d="M0 0 C 3 -1, 7 -5, 6 -9 C 5.4 -11.5, 2.4 -11.2, 2.6 -8.6"
      transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${-side})`}
      fill="none"
      stroke={INK}
      strokeWidth="0.6"
      strokeLinecap="round"
      {...drawProps(anim)}
    />
  );
}

// A five-petal wildflower centered on (x, y).
export function BloomShape({
  x,
  y,
  scale = 1,
  petal = "var(--color-foxglove)",
  center = "var(--color-buttercup)",
  ...anim
}: { x: number; y: number; scale?: number; petal?: string; center?: string } & Anim) {
  const P = "M20 20 C 13 14, 14 3, 20 2 C 26 3, 27 14, 20 20 Z";
  return (
    <g transform={`translate(${x - 20 * scale} ${y - 20 * scale}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((r) => (
        <g key={r} transform={`rotate(${r} 20 20)`}>
          <path d={P} fill={petal} fillOpacity="0.55" {...washProps(anim)} />
          <path d={P} fill="none" stroke="var(--color-foxglove-dark)" strokeWidth={0.8 / Math.max(scale, 0.4)} {...drawProps(anim)} />
        </g>
      ))}
      <circle cx="20" cy="20" r="3.6" fill={center} {...washProps(anim)} />
    </g>
  );
}

// A long, gently curving stem with leaves and a flower or two: tucked behind
// the photobooth strip and used as ornaments.
const sprayCurve = rounded((t) => ({ x: 6 + 150 * t, y: 150 - 140 * t + 22 * Math.sin(Math.PI * t) }));

export function Spray({ className, flip = false, animate = false, delay = 0 }: { className?: string; flip?: boolean } & Anim) {
  const leaves = leavesAlong(sprayCurve, 12, { start: 0.06, end: 0.86, sizeFrom: 30, sizeTo: 16, spread: 48 });
  const tip = sprayCurve(1);
  const side = sprayCurve(0.55);
  const d = (t: number) => delay + t * 1.6;
  return (
    <svg viewBox="0 0 170 170" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
      <path d={stemPath(sprayCurve)} fill="none" stroke={INK} strokeWidth="0.9" strokeLinecap="round" {...drawProps({ animate, delay })} />
      {[0.3, 0.7].map((t, i) => (
        <Tendril key={t} x={sprayCurve(t).x} y={sprayCurve(t).y} angle={heading(sprayCurve, t)} side={i ? 1 : -1} animate={animate} delay={d(t)} />
      ))}
      {leaves.map((l, i) => (
        <Leaf key={i} spot={l} fill={i % 3 === 1 ? "var(--color-fern)" : "var(--color-sage)"} animate={animate} delay={d(l.t)} />
      ))}
      <BloomShape x={side.x + 14} y={side.y + 4} scale={0.55} petal="var(--color-buttercup)" center="var(--color-fern)" animate={animate} delay={d(0.6)} />
      <BloomShape x={tip.x} y={tip.y} scale={0.75} animate={animate} delay={d(1)} />
    </svg>
  );
}

// A small horizontal sprig for dividers and page headers.
const sprigCurve = rounded((t) => ({ x: 8 + 150 * t, y: 40 - 10 * t - 12 * Math.sin(Math.PI * t) }));

export function Sprig({ className, animate = false, delay = 0 }: { className?: string } & Anim) {
  const leaves = leavesAlong(sprigCurve, 9, { start: 0.08, end: 0.86, sizeFrom: 22, sizeTo: 13, spread: 52 });
  const tip = sprigCurve(1);
  return (
    <svg viewBox="0 0 172 56" className={className} aria-hidden="true">
      <path d={stemPath(sprigCurve)} fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" {...drawProps({ animate, delay })} />
      {leaves.map((l, i) => (
        <Leaf key={i} spot={l} fill={i % 3 === 1 ? "var(--color-fern)" : "var(--color-sage)"} animate={animate} delay={delay + l.t * 1.2} />
      ))}
      <BloomShape x={tip.x + 2} y={tip.y} scale={0.38} animate={animate} delay={delay + 1.2} />
    </svg>
  );
}

// Line drawings for empty photobooth frames, so the strip looks finished
// before real photos are uploaded.
export function FrameArt({ variant, animate = false, delay = 0 }: { variant: number } & Anim) {
  const v = variant % 4;
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="90" fill="var(--color-paper-deep)" />
      {v === 0 && (
        <g transform="translate(34 4) scale(0.48)">
          <SprayArt animate={animate} delay={delay} />
        </g>
      )}
      {v === 1 && (
        <>
          <BloomShape x={48} y={42} scale={0.9} animate={animate} delay={delay} />
          <BloomShape x={78} y={54} scale={0.55} petal="var(--color-buttercup)" center="var(--color-fern)" animate={animate} delay={delay + 0.3} />
        </>
      )}
      {v === 2 && (
        <text
          x="60"
          y="57"
          textAnchor="middle"
          fontFamily="var(--font-serif)"
          fontStyle="italic"
          fontSize="34"
          fill="var(--color-fern-dark)"
          className={animate ? "wash" : undefined}
          style={animate ? at(delay) : undefined}
        >
          J&amp;W
        </text>
      )}
      {v === 3 && (
        <g transform="translate(16 26) scale(0.52)">
          <SprigArt animate={animate} delay={delay} />
        </g>
      )}
    </svg>
  );
}

// The spray and sprig drawings without their own <svg>, for nesting.
function SprayArt(anim: Anim) {
  const leaves = leavesAlong(sprayCurve, 12, { start: 0.06, end: 0.86, sizeFrom: 30, sizeTo: 16, spread: 48 });
  const tip = sprayCurve(1);
  const d = (t: number) => (anim.delay ?? 0) + t * 1.2;
  return (
    <>
      <path d={stemPath(sprayCurve)} fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" {...drawProps(anim)} />
      {leaves.map((l, i) => (
        <Leaf key={i} spot={l} fill={i % 3 === 1 ? "var(--color-fern)" : "var(--color-sage)"} animate={anim.animate} delay={d(l.t)} />
      ))}
      <BloomShape x={tip.x} y={tip.y} scale={0.75} animate={anim.animate} delay={d(1)} />
    </>
  );
}

function SprigArt(anim: Anim) {
  const leaves = leavesAlong(sprigCurve, 9, { start: 0.08, end: 0.86, sizeFrom: 22, sizeTo: 13, spread: 52 });
  const tip = sprigCurve(1);
  return (
    <>
      <path d={stemPath(sprigCurve)} fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" {...drawProps(anim)} />
      {leaves.map((l, i) => (
        <Leaf key={i} spot={l} fill={i % 3 === 1 ? "var(--color-fern)" : "var(--color-sage)"} animate={anim.animate} delay={(anim.delay ?? 0) + l.t} />
      ))}
      <BloomShape x={tip.x + 2} y={tip.y} scale={0.38} animate={anim.animate} delay={(anim.delay ?? 0) + 1} />
    </>
  );
}
