"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

// Fades and settles its content in when it scrolls into view, and starts any
// pen-drawing or photo-developing animations inside it at that moment.
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  tilt = 0,
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  tilt?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? "in-view" : ""} ${className}`}
      style={{ "--tilt": `${tilt}deg`, "--at": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
