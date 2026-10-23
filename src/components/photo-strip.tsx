// A photobooth strip: four frames stacked on white paper with a printed
// caption at the bottom. When `animate` is on it prints out of the top, then
// each frame flashes and develops in turn.

import type { CSSProperties, ReactNode } from "react";
import { FrameArt } from "./botanicals";

export type StripPhoto = { src: string; alt: string };

export function PhotoStrip({
  photos,
  caption,
  tilt = -2.5,
  animate = false,
  delay = 0,
  className = "",
}: {
  photos: StripPhoto[];
  caption?: ReactNode;
  tilt?: number;
  animate?: boolean;
  delay?: number;
  className?: string;
}) {
  const frames = Array.from({ length: 4 }, (_, i) => photos[i] ?? null);
  return (
    <figure
      className={`print relative flex flex-col gap-2 pb-4 ${animate ? "print-out" : ""} ${className}`}
      style={{ "--tilt": `${tilt}deg`, animationDelay: `${delay}s` } as CSSProperties}
    >
      {frames.map((photo, i) => {
        const at = { "--at": `${(delay + 1.1 + i * 0.55).toFixed(2)}s` } as CSSProperties;
        return (
          <div key={i} className={`aspect-[4/3] w-full bg-paper-deep ${animate ? "develop" : ""}`} style={at}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
            ) : (
              <FrameArt variant={i} animate={animate} delay={delay + 1.3 + i * 0.55} />
            )}
          </div>
        );
      })}
      {caption && <figcaption className="pt-2 text-center">{caption}</figcaption>}
    </figure>
  );
}
