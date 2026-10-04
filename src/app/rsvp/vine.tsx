// The RSVP progress indicator: a vine that grows a pair of leaves for each
// finished step and opens a flower when the RSVP is sent.

import { BloomShape, LeafShape, Tendril } from "@/components/botanicals";
import { curve as rounded, heading, stemPath } from "@/components/vine-geometry";

const W = 300;
const curve = rounded((t) => ({ x: 10 + 266 * t, y: 30 + 7 * Math.sin(Math.PI * 2.5 * t + 0.4) }));
const stem = stemPath(curve, 96);

const grow = (on: boolean, delay = 0) => ({
  transformOrigin: "0px 0px",
  transform: `scale(${on ? 1 : 0})`,
  transition: `transform 520ms cubic-bezier(.34,1.56,.64,1) ${delay}ms`,
});

export function Vine({ step, total, bloomed }: { step: number; total: number; bloomed: boolean }) {
  const stepT = (i: number) => ((i + 0.5) / total) * 0.92;
  const grownTo = bloomed ? 1 : step === 0 ? 0 : Math.min(1, stepT(step - 1) + 0.06);
  const tip = curve(1);

  return (
    <svg viewBox={`0 0 ${W} 60`} className="h-12 w-full max-w-[20rem]" role="img" aria-label={bloomed ? "RSVP sent" : `Step ${step + 1} of ${total}`}>
      <path d={stem} fill="none" stroke="var(--color-lichen)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 4" />
      <path
        d={stem}
        fill="none"
        stroke="var(--color-fern-dark)"
        strokeWidth="1.6"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - grownTo}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      {Array.from({ length: total }, (_, i) => {
        const on = i < step || bloomed;
        const t = stepT(i);
        const leaves = [
          { t, side: -1, size: 17, fill: "var(--color-fern)" },
          { t: t + 0.03, side: 1, size: 14, fill: "var(--color-sage)" },
        ];
        return (
          <g key={i}>
            {i % 2 === 1 && (
              <g transform={`translate(${curve(t + 0.055).x} ${curve(t + 0.055).y})`}>
                <g style={grow(on, 260)}>
                  <Tendril x={0} y={0} angle={heading(curve, t + 0.055)} side={-1} color="var(--color-fern)" />
                </g>
              </g>
            )}
            {leaves.map((l, j) => {
              const p = curve(l.t);
              return (
                <g key={j} transform={`translate(${p.x} ${p.y}) rotate(${heading(curve, l.t) + l.side * 50})`}>
                  <g style={grow(on, j * 120)}>
                    <g transform={`scale(${l.size / 18})`}>
                      <LeafShape fill={l.fill} />
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        );
      })}
      <g transform={`translate(${tip.x + 6} ${tip.y})`}>
        <g style={{ ...grow(bloomed, 500), transform: bloomed ? "scale(1) rotate(0deg)" : "scale(0) rotate(-90deg)" }}>
          <BloomShape x={0} y={0} scale={0.7} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
        </g>
      </g>
    </svg>
  );
}
