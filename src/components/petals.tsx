// Petals drifting down the screen. Values are fixed (not random) so the server
// and browser render the same HTML. Hidden for people who prefer less motion.

type Petal = { x: string; dur: number; delay: number; drift: number; spin: number; size: number; color: string };

const gentle: Petal[] = [
  { x: "8%", dur: 17, delay: -2, drift: 40, spin: 420, size: 13, color: "var(--color-foxglove)" },
  { x: "24%", dur: 21, delay: -11, drift: -30, spin: -380, size: 10, color: "var(--color-buttercup)" },
  { x: "46%", dur: 19, delay: -6, drift: 55, spin: 500, size: 12, color: "var(--color-foxglove)" },
  { x: "63%", dur: 23, delay: -15, drift: -45, spin: -460, size: 9, color: "var(--color-sage)" },
  { x: "81%", dur: 18, delay: -9, drift: 25, spin: 360, size: 12, color: "var(--color-foxglove)" },
  { x: "93%", dur: 25, delay: -19, drift: -60, spin: -520, size: 10, color: "var(--color-buttercup)" },
];

// A one-time shower for the RSVP confirmation: more petals, starting now.
const shower: Petal[] = Array.from({ length: 22 }, (_, i) => ({
  x: `${(i * 37) % 100}%`,
  dur: 5 + ((i * 7) % 5),
  delay: ((i * 3) % 11) / 10,
  drift: ((i % 2 ? 1 : -1) * (20 + ((i * 13) % 60))),
  spin: (i % 2 ? 1 : -1) * (300 + ((i * 41) % 300)),
  size: 9 + ((i * 5) % 7),
  color: ["var(--color-foxglove)", "var(--color-buttercup)", "var(--color-sage)", "var(--color-foxglove)"][i % 4],
}));

export function Petals({ variant = "gentle" }: { variant?: "gentle" | "shower" }) {
  const petals = variant === "shower" ? shower : gentle;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              "--x": p.x,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              animationIterationCount: variant === "shower" ? 1 : undefined,
              animationFillMode: "both",
            } as React.CSSProperties
          }
        >
          <svg width={p.size} height={p.size * 1.3} viewBox="0 0 10 13">
            <path d="M5 0 C 9 3, 10 9, 5 13 C 0 9, 1 3, 5 0 Z" fill={p.color} fillOpacity="0.85" />
          </svg>
        </span>
      ))}
    </div>
  );
}
