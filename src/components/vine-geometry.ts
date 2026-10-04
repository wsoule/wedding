// Shared geometry for drawn vines: a stem curve plus leaves placed along it at
// an angle to the stem's direction, alternating sides and shrinking toward the tip.

export type Pt = { x: number; y: number };
export type Curve = (t: number) => Pt;
export type LeafSpot = { x: number; y: number; angle: number; size: number; side: 1 | -1; t: number };

// Trig results can differ in the last digits between the server and the
// browser, so every number that lands in an SVG attribute is rounded first.
const r = (n: number) => Math.round(n * 100) / 100;

export function curve(fn: Curve): Curve {
  return (t) => {
    const p = fn(t);
    return { x: r(p.x), y: r(p.y) };
  };
}

export function stemPath(at: Curve, steps = 64): string {
  const pts = Array.from({ length: steps + 1 }, (_, i) => at(i / steps));
  return `M${r(pts[0].x)} ${r(pts[0].y)}` + pts.slice(1).map((p) => ` L${r(p.x)} ${r(p.y)}`).join("");
}

// Direction the stem is heading at t, in degrees.
export function heading(at: Curve, t: number): number {
  const a = at(Math.max(0, t - 0.005));
  const b = at(Math.min(1, t + 0.005));
  return r((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
}

export function leavesAlong(
  at: Curve,
  count: number,
  { start = 0.06, end = 0.94, sizeFrom = 16, sizeTo = 10, spread = 48, firstSide = -1 as 1 | -1 } = {},
): LeafSpot[] {
  return Array.from({ length: count }, (_, i) => {
    const k = count === 1 ? 0 : i / (count - 1);
    const t = start + (end - start) * k;
    const p = at(t);
    const side = (i % 2 === 0 ? firstSide : -firstSide) as 1 | -1;
    return { x: p.x, y: p.y, t, side, angle: r(heading(at, t) + side * spread), size: r(sizeFrom + (sizeTo - sizeFrom) * k) };
  });
}
