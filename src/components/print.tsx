import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "./reveal";

// A white-bordered print that settles onto the page as it scrolls into view,
// optionally held down with a strip of tape.
export function Print({
  children,
  tilt = 0,
  tape = false,
  className = "",
  innerClassName = "",
}: {
  children: ReactNode;
  tilt?: number;
  tape?: boolean;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <Reveal tilt={tilt} className={className}>
      <div className={`print relative ${tape ? "tape" : ""} ${innerClassName}`} style={{ "--tilt": `${tilt}deg`, "--tape-tilt": `${-tilt * 2 - 2}deg` } as CSSProperties}>
        {children}
      </div>
    </Reveal>
  );
}
