// The RSVP progress indicator: a vine that grows one leaf per finished step and
// opens a flower when the RSVP is sent.

import { BloomShape } from "@/components/botanicals";

export function Vine({ step, total, bloomed }: { step: number; total: number; bloomed: boolean }) {
  const width = 280;
  const leafX = (i: number) => 24 + (i * (width - 64)) / (total - 1);
  return (
    <svg
      viewBox={`0 0 ${width} 44`}
      className="h-11 w-full max-w-[20rem]"
      role="img"
      aria-label={bloomed ? "RSVP sent" : `Step ${step + 1} of ${total}`}
    >
      <path
        d={`M8 26 C 60 14, 100 36, 150 24 S 240 16, ${width - 26} 24`}
        fill="none"
        stroke="var(--color-lichen)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d={`M8 26 C 60 14, 100 36, 150 24 S 240 16, ${width - 26} 24`}
        fill="none"
        stroke="var(--color-fern)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={bloomed ? 0 : 1 - Math.min(step, total - 1) / (total - 1)}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      {Array.from({ length: total }, (_, i) => {
        const grown = i < step || bloomed;
        const up = i % 2 === 0;
        // Each leaf sits at its stem point; the inner group scales from that point.
        return (
          <g key={i} transform={`translate(${leafX(i)} ${up ? 22 : 27}) rotate(${up ? -40 : 40})`}>
            <g
              style={{
                transformOrigin: "0px 0px",
                transform: `scale(${grown ? 1 : 0})`,
                transition: "transform 450ms cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <path d={up ? "M0 0 C 4 -6, 12 -8, 18 -6 C 13 -1, 6 1, 0 0Z" : "M0 0 C 4 6, 12 8, 18 6 C 13 1, 6 -1, 0 0Z"} fill="var(--color-fern)" />
            </g>
          </g>
        );
      })}
      <g
        style={{
          transformOrigin: `${width - 16}px 24px`,
          transform: bloomed ? "scale(1) rotate(0deg)" : "scale(0) rotate(-90deg)",
          transition: "transform 700ms cubic-bezier(.34,1.56,.64,1) 300ms",
        }}
      >
        <BloomShape x={width - 16} y={24} scale={0.75} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
      </g>
    </svg>
  );
}
