// Hand-drawn line botanicals. They inherit color from `currentColor`.

type Props = { className?: string };

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

export function Sprig({ className }: Props) {
  return (
    <svg viewBox="0 0 160 120" fill="none" className={className} aria-hidden="true">
      <path d="M8 112 C 40 90, 80 60, 150 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {[
        [40, 90, -30],
        [62, 74, 20],
        [84, 60, -35],
        [104, 46, 15],
        [124, 32, -40],
      ].map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y - (i % 2 ? -10 : 10)}
          rx="12"
          ry="5"
          transform={`rotate(${r} ${x} ${y - (i % 2 ? -10 : 10)})`}
          stroke="currentColor"
          strokeWidth="1.2"
          fill="currentColor"
          fillOpacity="0.14"
        />
      ))}
    </svg>
  );
}

// A five-petal wildflower. Petal and center colors are set by CSS variables
// so the same flower can be pink or yellow.
export function Bloom({ className, petal = "var(--color-foxglove)", center = "var(--color-buttercup)" }: Props & { petal?: string; center?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="20" cy="10" rx="6" ry="9" fill={petal} transform={`rotate(${r} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="5" fill={center} />
    </svg>
  );
}

// A bloom drawn inside another SVG, centered on (x, y).
export function BloomShape({ x, y, scale = 1, petal, center }: { x: number; y: number; scale?: number; petal: string; center: string }) {
  return (
    <g transform={`translate(${x - 20 * scale} ${y - 20 * scale}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="20" cy="10" rx="6" ry="9" fill={petal} transform={`rotate(${r} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="5" fill={center} />
    </g>
  );
}

// The arch of leaves and flowers that frames the hero.
export function Arch({ className }: Props) {
  const left = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const angle = Math.PI - t * (Math.PI / 2);
    return { x: 150 + Math.cos(angle) * 130, y: 170 - Math.sin(angle) * 150, r: (angle * 180) / Math.PI };
  });
  const right = left.map((p) => ({ x: 300 - p.x, y: p.y, r: 180 - p.r }));
  return (
    <svg viewBox="0 0 300 190" fill="none" className={className} aria-hidden="true">
      <path d="M20 172 C 20 60, 90 18, 150 18 C 210 18, 280 60, 280 172" stroke="var(--color-fern)" strokeWidth="1.6" strokeLinecap="round" />
      {[...left, ...right].map((p, i) => (
        <ellipse
          key={i}
          cx={p.x}
          cy={p.y}
          rx="11"
          ry="4.5"
          transform={`rotate(${p.r + (i % 2 ? 50 : -50)} ${p.x} ${p.y})`}
          fill={i % 3 === 0 ? "var(--color-fern)" : "var(--color-sage)"}
          fillOpacity="0.85"
        />
      ))}
      <BloomShape x={150} y={18} scale={0.9} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
      <BloomShape x={34} y={96} scale={0.5} petal="var(--color-buttercup)" center="var(--color-fern-dark)" />
      <BloomShape x={266} y={96} scale={0.5} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
      <BloomShape x={74} y={38} scale={0.5} petal="var(--color-foxglove)" center="var(--color-buttercup)" />
      <BloomShape x={226} y={38} scale={0.5} petal="var(--color-buttercup)" center="var(--color-fern-dark)" />
    </svg>
  );
}
